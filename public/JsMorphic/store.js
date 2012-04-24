/*
    store.js
    
    saving and loading Snap! projects
    written by Nathan Dinsmore

    Copyright (c) 2012 Nathan Dinsmore

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    credits
    -------
    additional features contributed by Ian Reynolds and Jens Mönig

*/

/*global modules, projectName:true, projectNotes:true, world, localStorage,
location, newCanvas, confirm, showMessage, detect, updatePalette,
updateHistory, Point, Rectangle, Color, Serializer, VariableFrame, Morph,
IDE_Morph, StageMorph, SpriteMorph, ScriptsMorph, BlockMorph, HatBlockMorph,
CommandBlockMorph, ReporterBlockMorph, CustomReporterBlockMorph,
CustomCommandBlockMorph, ArgMorph, MultiArgMorph, StringMorph, InputSlotMorph,
TemplateSlotMorph, ColorSlotMorph, BooleanSlotMorph, FunctionSlotMorph,
ReporterSlotMorph, CSlotMorph, WatcherMorph:true, BoxMorph, CommandSlotMorph,
List, CustomBlockDefinition, Context, ScrollFrameMorph, SyntaxElementMorph,
Costume, Sound, Audio */

modules.store = '2012-Apr-16';

var XMLSerializer;

XMLSerializer = {
    version: 1,
    thumbnailSize: new Point(160, 120),

    /* XML - Storing */

    serialize: function (object) {
        var xml;
        this.objects = [];
        xml = this.store(object);
        this.cleanup();
        return xml;
    },

    cleanup: function () {
        this.objects.forEach(function (object) {
            delete object.$_id;
        });
    },

    store: function (object) {
        if (object.$_id) {
            return this.f('<ref id="@"></ref>', object.$_id);
        }
        object.$_id = this.objects.length;
        this.objects.push(object);
        return object.toXML(this).replace('~', this.f('id="@"', object.$_id));
    },

    f: function (format) {
        var i = -1,
            values = arguments,
            value;
        return format.replace(/[@$%]([\d]+)?/g, function (spec, index) {
            index = parseInt(index, 10);
            value = values[(isNaN(index) ? (i += 1) : index) + 1];
            return spec === '@' ?
                    XMLSerializer.escape(value, true)
                        : spec === '$' ?
                            XMLSerializer.escape(value, false)
                                : value;
        });
    },

    escape: function (string, quotes) {
        return XMLSerializer.nil(string) ? ''
            : string.toString().replace(
                quotes ? /[<>&"']/g //"
                    : /[<>&]/g,
                function (s) {
                        return s === '<' ? '&lt;'
                            : s === '>' ? '&gt;'
                                : s === '&' ? '&amp;'
                                    : s === '"' ? '&quot;'
                                        /*: s === "'" ? '&apos;'*/
                                        : s;
                    }
            );
    },

    unescape: function (string) {
        return XMLSerializer.nil(string) ? ''
            : string.toString().replace(
                /&(lt|gt|amp|quot|apos);/g,
                function (s) {
                    return s === '&lt;' ? '<'
                        : s === '&gt;' ? '>'
                            : s === '&amp;' ? '&'
                                : s === '&quot;' ? '"'
                                    : s === '&apos;' ? "'"
                                        : s;
                }
            );
    },

    nil: function (test) {
        return test === undefined || test === null;
    },

    /* XML - Loading */

    StringStream: function (str) {
        this.contents = str;
        this.index = 0;
    },

    Element: function (name) {
        this.name = name;
        this.attributes = {};
        this.children = [];
    },

    Text: function (text) {
        this.value = text;
    },

    parse: function (xml) {
        var stream = new this.StringStream(xml);
        try {
            return this.$parse(stream);
        } catch (e) {
            throw new Error(
                e.message
                    + ' near '
                    + stream.contents.substr(stream.index, 50)
                    + (stream.contents.length - stream.index > 50 ?
                            '...' : '')
            );
        }
    },

    $parse: function (stream) {
        var element, tagName, ch, attribute, value, child;
        if (stream.peek() !== '<') {
            return new this.Text(this.unescape(stream.upTo(/<|$/)));
        }
        stream.skip(1);
        if (stream.peek() === '/') {
            stream.upTo(/>|$/);
            stream.skip(1);
            return null;
        }
        tagName = stream.word();
        element = new this.Element(tagName);
        stream.skipSpace();
        while ((ch = stream.peek()) !== '>' && ch !== '/') {
            attribute = stream.word();
            stream.skipSpace();
            if (stream.next() !== '=') {
                throw new Error('Expected "=" after attribute name');
            }
            stream.skipSpace();
            if ((ch = stream.next()) !== '"' && ch !== "'") {
                throw new Error(
                    'Expected single- or double-quoted attribute value'
                );
            }
            value = stream.upTo(ch);
            stream.skip(1);
            stream.skipSpace();
            element.attributes[attribute] = this.unescape(value);
        }
        if (stream.next() === '/') {
            if (stream.next() !== '>') {
                throw new Error('Expected ">" after "/" in empty tag');
            }
        } else {
            do {
                child = this.$parse(stream);
                /*&& (child.isElement || !/^[\s]+$/.test(child.value))*/
                if (child !== null) {
                    element.children.push(child);
                }
            } while (child !== null);
        }
        return element;
    },

    /* XML - Project Loading */

    load: function (xml) {
        var project = this.project = {},
            model,
            nameID;

        model = {project: this.parse(xml)};
        if (+project.version > this.version) {
            throw 'Project uses newer version of XMLSerializer';
        }

        /* Project Info */

        this.objects = {};
        project.name = model.project.attributes.name;
        if (this.nil(project.name)) {
            nameID = 1;
            while (
                localStorage.hasOwnProperty(
                    '-snap-project-Untitled ' + nameID
                )
            ) {
                nameID += 1;
            }
            project.name = 'Untitled ' + nameID;
        }
        model.notes = model.project.element('notes');
        if (!this.nil(model.notes)) {
            project.notes = model.notes.textContent();
        }
        model.globalVariables = model.project.element('variables');
        project.globalVariables = new VariableFrame();

        /* Stage */

        model.stage = model.project.require('stage');
        project.stage = new StageMorph();
        if (model.stage.attributes.hasOwnProperty('id')) {
            this.objects[model.stage.attributes.id] = project.stage;
        }
        if (!this.nil(model.pentrails = model.stage.element('pentrails'))) {
            project.pentrails = new Image();
            project.pentrails.onload = function () {
                var context = project.stage.trailsCanvas.getContext('2d');
                context.drawImage(project.pentrails, 0, 0);
                project.stage.changed();
            };
            project.pentrails.src = model.pentrails.textContent();
        }
        project.stage.setExtent(new Point(480, 360));
        this.loadObject(project.stage, model.stage);

        /* Sprites */

        model.sprites = model.stage.require('sprites');
        project.sprites = {};
        project.sprites.stage = project.stage;
        model.sprites.all('sprite').forEach(function (model) {
            var sprite;
            sprite = new SpriteMorph(project.globalVariables);
            if (model.attributes.id) {
                this.objects[model.attributes.id] = sprite;
            }
            if (!this.nil(model.attributes.name)) {
                sprite.name = model.attributes.name;
                project.sprites[model.attributes.name] = sprite;
            }
            if (!this.nil(model.attributes.color)) {
                sprite.color = this.loadColor(model.attributes.color);
            }
            project.stage.add(sprite);
            sprite.gotoXY(+model.attributes.x || 0, +model.attributes.y || 0);
            sprite.heading = parseFloat(model.attributes.heading) || 0;
            sprite.drawNew();
            this.loadObject(sprite, model);
        }, this);
        if (!this.nil(model.globalVariables)) {
            this.loadVariables(project.globalVariables, model.globalVariables);
        }

        /* Watchers */

        model.sprites.all('watcher').forEach(function (model) {
            var watcher, color, target, hidden;

            color = this.loadColor(model.attributes.color);
            target = model.attributes.hasOwnProperty('scope') ?
                    project.sprites[model.attributes.scope] : null;
            hidden = model.attributes.hasOwnProperty('hidden');
            if (model.attributes.hasOwnProperty('var')) {
                watcher = new WatcherMorph(
                    model.attributes['var'],
                    color,
                    target === null ? project.globalVariables
                        : target.variables,
                    model.attributes['var'],
                    hidden
                );
            } else {
                watcher = new WatcherMorph(
                    this.watcherLabels[model.attributes.s],
                    color,
                    target,
                    model.attributes.s,
                    hidden
                );
            }
            watcher.setPosition(
                project.stage.topLeft().add(new Point(
                    +model.attributes.x || 0,
                    +model.attributes.y || 0
                ))
            );
            project.stage.add(watcher);
        }, this);
        delete this.objects;
        return project;
    },

    loadObject: function (object, model) {
        var blocks = model.require('blocks');
        this.loadCostumes(object, model);
        this.loadSounds(object, model);
        this.loadCustomBlocks(object, blocks);
        this.populateCustomBlocks(object, blocks);
        this.loadVariables(object.variables, model.require('variables'));
        this.loadScripts(object.scripts, model.require('scripts'));
    },

    loadCostumes: function (object, model) {
        var costumes = model.element('costumes'),
            costume;
        if (!this.nil(costumes)) {
            object.costumes = this.loadValue(costumes.require('list'));
        }
        if (model.attributes.hasOwnProperty('costume')) {
            costume = object.costumes.asArray()[model.attributes.costume - 1];
            if (!this.nil(costume)) {
                costume.loaded = function () {
                    object.wearCostume(costume);
                };
            }
        }
    },

    loadSounds: function (object, model) {
        var sounds = model.element('sounds');
        if (!this.nil(sounds)) {
            object.sounds = this.loadValue(sounds.require('list'));
        }
    },

    loadVariables: function (varFrame, element) {
        element.children.forEach(function (child) {
            var value;
            if (!child.isElement || child.name !== 'variable') {
                return;
            }
            value = child.firstElement();
            varFrame.vars[child.attributes.name] = this.nil(value) ?
                    0 : this.loadValue(value);
        }, this);
    },

    loadCustomBlocks: function (object, element) {
        element.children.forEach(function (child) {
            var definition, names, inputs, i;
            if (!child.isElement || child.name !== 'block-definition') {
                return;
            }
            definition = new CustomBlockDefinition(child.attributes.s || '');
            definition.category = this.nil(child.attributes.category) ?
                    'other' : child.attributes.category;
            definition.type = child.attributes.type || 'command';
            object.customBlocks.push(definition);

            names = definition.parseSpec(definition.spec).filter(
                function (str) {
                    return str.charAt(0) === '%';
                }
            ).map(function (str) {
                return str.substr(1);
            });

            definition.names = names;
            inputs = child.element('inputs');
            if (inputs) {
                i = -1;
                inputs.children.forEach(function (child) {
                    if (!child.isElement || child.name !== 'input') {
                        return;
                    }
                    definition.declarations[names[i += 1]]
                        = [child.attributes.type, child.textContent()];
                });
            }
        }, this);
    },

    populateCustomBlocks: function (object, element) {
        element.children.forEach(function (child, index) {
            var definition, script, outer;
            if (!child.isElement || child.name !== 'block-definition') {
                return;
            }
            definition = object.customBlocks[index];
            script = child.element('script');
            outer = new Context();
            outer.receiver = object;
            outer.variables.parentFrame = outer.receiver.variables;
            definition.body = new Context(
                null,
                this.nil(script) ? null : this.loadScript(script),
                outer,
                object
            );
            definition.body.inputs = definition.names.slice(0);
            definition.body.receiver = object;
            delete definition.names;
        }, this);
    },

    loadScripts: function (scripts, model) {
        scripts.texture = 'scriptsPaneTexture.gif';
        model.children.forEach(function (child) {
            var block;
            if (!child.isElement || child.name !== 'script') {
                return;
            }
            block = this.loadScript(child);
            if (this.nil(block)) {
                return;
            }
            block.setPosition(new Point(
                +child.attributes.x || 0,
                +child.attributes.y || 0
            ).add(scripts.topLeft()));
            scripts.add(block);
        }, this);
    },

    loadScript: function (model) {
        var topBlock, block, nextBlock;
        model.children.forEach(function (child) {
            if (!child.isElement) {
                return;
            }
            nextBlock = this.loadBlock(child);
            if (this.nil(nextBlock)) {
                return;
            }
            if (block) {
                block.nextBlock(nextBlock);
            } else {
                topBlock = nextBlock;
            }
            block = nextBlock;
        }, this);
        return topBlock;
    },

    loadBlock: function (model) {
        var block, info, inputs, receiver;
        if (model.name === 'block') {
            if (model.attributes.hasOwnProperty('var')) {
                block = new ReporterBlockMorph(false);
                block.selector = 'reportGetVar';
                block.color = SpriteMorph.prototype.blockColor.variables;
                block.setSpec(model.attributes['var']);
                block.isDraggable = true;
                return block;
            }
            info = this.blocks[model.attributes.s];
            if (this.nil(info)) {
                return this.obsoleteBlock();
            }
            block = info.type === 'command' ? new CommandBlockMorph()
                : info.type === 'hat' ? new HatBlockMorph()
                    : new ReporterBlockMorph(info.type === 'predicate');
            block.color = SpriteMorph.prototype.blockColor[info.category];
            block.selector = model.attributes.s;
            block.setSpec(info.spec);
        } else if (model.name === 'custom-block') {
            receiver = this.nil(model.attributes.scope) ? this.project.stage
                : this.project.sprites[model.attributes.scope];
            if (this.nil(receiver)) {
                return this.obsoleteBlock();
            }
            info = detect(receiver.customBlocks, function (block) {
                return block.blockSpec() === model.attributes.s;
            });
            if (this.nil(info)) {
                return this.obsoleteBlock();
            }
            block = info.type === 'command' ? new CustomCommandBlockMorph(
                info,
                false
            ) : new CustomReporterBlockMorph(
                info,
                info.type === 'predicate',
                false
            );
        }
        block.isDraggable = true;
        inputs = block.inputs();
        model.children.forEach(function (child, i) {
            this.loadInput(child, inputs[i], block);
        }, this);
        return block;
    },

    obsoleteBlock: function (spec, type) {
        var block = type === 'command' || !type ? new CommandBlockMorph()
            : type === 'hat' ? new HatBlockMorph()
                : new ReporterBlockMorph(type === 'predicate');

        block.selector = 'nop';
        block.color = new Color(200, 0, 20);
        block.setSpec(spec || 'Obsolete!');
        block.isDraggable = true;
        return block;
    },

    loadInput: function (model, input, block) {
        var inp;
        if (model.name === 'script') {
            inp = this.loadScript(model);
            if (!this.nil(inp)) {
                input.add(inp);
                input.fixLayout();
            }
        } else if (model.name === 'autolambda' && model.children[0]) {
            inp = this.loadBlock(model.children[0]);
            if (!this.nil(inp)) {
                input.silentReplaceInput(input.children[0], inp);
                input.fixLayout();
            }
        } else if (model.name === 'list') {
            while (input.inputs().length > 0) {
                input.removeInput();
            }
            model.children.forEach(function (item) {
                input.addInput();
                this.loadInput(
                    item,
                    input.children[input.children.length - 2],
                    input
                );
            }, this);
            input.fixLayout();
        } else if (model.name === 'block' || model.name === 'custom-block') {
            block.silentReplaceInput(input, this.loadBlock(model));
        } else if (model.name === 'color') {
            input.setColor(this.loadColor(model.textContent()));
        } else {
            input.setContents(this.loadValue(model));
        }
    },

    loadValue: function (model) {
        var v, items, el, my = this, center, image, name, audio;
        function record() {
            if (model.attributes.hasOwnProperty('id')) {
                my.objects[model.attributes.id] = v;
            }
        }
        switch (model.name) {
        case 'ref':
            return this.objects[model.attributes.id];
        case 'l':
            return model.textContent();
        case 'list':
            if (model.attributes.hasOwnProperty('linked')) {
                items = model.all('item');
                if (items.length === 0) {
                    v = new List();
                    record();
                    return v;
                }
                items.forEach(function (item) {
                    var value = item.firstElement();
                    if (v === undefined) {
                        v = new List();
                        record();
                    } else {
                        v = v.rest = new List();
                    }
                    v.isLinked = true;
                    if (this.nil(value)) {
                        v.first = 0;
                    } else {
                        v.first = this.loadValue(value);
                    }
                }, this);
                return v;
            }
            v = new List();
            record();
            v.contents = model.all('item').map(function (item) {
                var value = item.firstElement();
                if (this.nil(value)) {
                    return 0;
                }
                return this.loadValue(value);
            }, this);
            return v;
        case 'context':
            v = new Context(null);
            record();
            if (!this.nil(el = model.element('script')) && el.isElement) {
                v.expression = this.loadScript(el);
            }
            if (!this.nil(el = model.element('receiver')) && el.isElement && !this.nil(el.element('ref'))) {
                v.receiver = this.loadValue(el);
            }
            if (!this.nil(el = model.element('inputs')) && el.isElement) {
                el.children.forEach(function (item) {
                    if (!item.isElement || item.name !== 'input') {
                        return;
                    }
                    v.inputs.push(item.textContent());
                });
            }
            if (!this.nil(el = model.element('variables')) && el.isElement) {
                this.loadVariables(v.variables, el);
            }
            if (!this.nil(el = model.element('context')) && el.isElement) {
                v.outerContext = this.loadValue(el);
            }
            return v;
        case 'costume':
            center = new Point();
            if (model.attributes.hasOwnProperty('center-x')) {
                center.x = +model.attributes['center-x'];
            }
            if (model.attributes.hasOwnProperty('center-y')) {
                center.y = +model.attributes['center-y'];
            }
            if (model.attributes.hasOwnProperty('name')) {
                name = model.attributes.name;
            }
            if (model.attributes.hasOwnProperty('image')) {
                image = new Image();
                image.src = model.attributes.image;
                image.onload = function () {
                    var canvas = newCanvas(new Point(image.width, image.height)),
                        context = canvas.getContext('2d');
                    context.drawImage(image, 0, 0);
                    v.contents = canvas;
                    v.version = +new Date();
                    if (typeof v.loaded === 'function') {
                        v.loaded();
                    }
                };
            }
            v = new Costume(null, name, center);
            record();
            return v;
        case 'sound':
            audio = new Audio();
            audio.src = model.attributes.sound;
            return new Sound(audio, model.attributes.name);
        }
        return undefined;
    },

    loadColor: function (color) {
        var c = (this.nil(color) ? '' : color).split(',');
        return new Color(+c[0], +c[1], +c[2], +c[3]);
    },

    openProject: function (project, ide) {
        var stage = ide.stage,
            sprite,
            scripts;
        if (this.nil(project) || this.nil(project.stage)) {
            return;
        }
        ide.projectName = project.name;
        ide.projectNotes = this.nil(project.notes) ? '' : project.notes;
        if (!this.nil(ide.globalVariables)) {
            ide.globalVariables = project.globalVariables;
        }
        if (!this.nil(stage)) {
            stage.destroy();
        }
        ide.add(ide.stage = project.stage);
        sprite = detect(
            project.stage.children,
            function (child) {
                return child instanceof SpriteMorph;
            }
        ) || project.stage;
        scripts = sprite.scripts;

        project.stage.drawNew();
        ide.createCorral();
        ide.selectSprite(sprite);
        ide.fixLayout();
    },

    watcherLabels: {
        xPosition: 'x position',
        yPosition: 'y position',
        direction: 'direction',
        getScale: 'size',
        getTimer: 'timer'
    },

    blocks: {
        forward: { type: 'command', category: 'motion', spec: 'move %n steps' },
        turn: { type: 'command', category: 'motion', spec: 'turn %clockwise %n degrees' },
        turnLeft: { type: 'command', category: 'motion', spec: 'turn %counterclockwise %n degrees' },
        setHeading: { type: 'command', category: 'motion', spec: 'point in direction %dir' },
        gotoXY: { type: 'command', category: 'motion', spec: 'go to x: %n y: %n' },
        doGlide: { type: 'command', category: 'motion', spec: 'glide %n secs to x: %n y: %n' },
        changeXPosition: { type: 'command', category: 'motion', spec: 'change x by %n' },
        setXPosition: { type: 'command', category: 'motion', spec: 'set x to %n' },
        changeYPosition: { type: 'command', category: 'motion', spec: 'change y by %n' },
        setYPosition: { type: 'command', category: 'motion', spec: 'set y to %n' },
        bounceOffEdge: { type: 'command', category: 'motion', spec: 'if on edge, bounce' },
        xPosition: { type: 'reporter', category: 'motion', spec: 'x position' },
        yPosition: { type: 'reporter', category: 'motion', spec: 'y position' },
        direction: { type: 'reporter', category: 'motion', spec: 'direction' },

        doSwitchToCostume: { type: 'command', category: 'looks', spec: 'switch to costume %cst' },
        doWearNextCostume: { type: 'command', category: 'looks', spec: 'next costume' },
        getCostumeIdx: { type: 'reporter', category: 'looks', spec: 'costume #' },
        doSayFor: { type: 'command', category: 'looks', spec: 'say %s for %n secs' },
        bubble: { type: 'command', category: 'looks', spec: 'say %s' },
        doThinkFor: { type: 'command', category: 'looks', spec: 'think %s for %n secs' },
        doThink: { type: 'command', category: 'looks', spec: 'think %s' },
        changeEffect: { type: 'command', category: 'looks', spec: 'change %eff effect by %n' },
        setEffect: { type: 'command', category: 'looks', spec: 'set %eff effect to %n' },
        clearEffects: { type: 'command', category: 'looks', spec: 'clear graphic effects' },
        changeScale: { type: 'command', category: 'looks', spec: 'change size by %n' },
        setScale: { type: 'command', category: 'looks', spec: 'set size to %n %' },
        getScale: { type: 'reporter', category: 'looks', spec: 'size' },
        show: { type: 'command', category: 'looks', spec: 'show' },
        hide: { type: 'command', category: 'looks', spec: 'hide' },
        comeToFront: { type: 'command', category: 'looks', spec: 'go to front' },
        goBack: { type: 'command', category: 'looks', spec: 'go back %n layers' },

        alert: { type: 'command', category: 'looks', spec: 'alert %mult%s' },
        log: { type: 'command', category: 'looks', spec: 'multi log %mult%s' },

        playSound: { type: 'command', category: 'sound', spec: 'play sound %snd' },
        doPlaySoundUntilDone: { type: 'command', category: 'sound', spec: 'play sound %snd until done' },
        doStopAllSounds: { type: 'command', category: 'sound', spec: 'stop all sounds' },

        clear: { type: 'command', category: 'pen', spec: 'clear' },
        down: { type: 'command', category: 'pen', spec: 'pen down' },
        up: { type: 'command', category: 'pen', spec: 'pen up' },
        setColor: { type: 'command', category: 'pen', spec: 'set pen color to %clr' },
        changeHue: { type: 'command', category: 'pen', spec: 'change pen color by %n' },
        setHue: { type: 'command', category: 'pen', spec: 'set pen color to %n' },
        changeBrightness: { type: 'command', category: 'pen', spec: 'change pen shade by %n' },
        setBrightness: { type: 'command', category: 'pen', spec: 'set pen shade to %n' },
        changeSize: { type: 'command', category: 'pen', spec: 'change pen size by %n' },
        setSize: { type: 'command', category: 'pen', spec: 'set pen size to %n' },
        doStamp: { type: 'command', category: 'pen', spec: 'stamp' },

        receiveGo: { type: 'hat', category: 'control', spec: 'when %greenflag clicked' },
        receiveKey: { type: 'hat', category: 'control', spec: 'when %key key pressed' },
        receiveClick: { type: 'hat', category: 'control', spec: 'when I am clicked' },
        receiveMessage: { type: 'hat', category: 'control', spec: 'when I receive %msg' },

        doBroadcast: { type: 'command', category: 'control', spec: 'broadcast %msg' },
        doBroadcastAndWait: { type: 'command', category: 'control', spec: 'broadcast %msg and wait' },
        doWait: { type: 'command', category: 'control', spec: 'wait %n secs' },
        doWaitUntil: { type: 'command', category: 'control', spec: 'wait until %b' },
        doForever: { type: 'command', category: 'control', spec: 'forever %c' },
        doRepeat: { type: 'command', category: 'control', spec: 'repeat %n %c' },
        doUntil: { type: 'command', category: 'control', spec: 'repeat until %b %c' },
        doIf: { type: 'command', category: 'control', spec: 'if %b %c' },
        doIfElse: { type: 'command', category: 'control', spec: 'if %b %c else %c' },
        doStop: { type: 'command', category: 'control', spec: 'stop script' },
        doStopAll: { type: 'command', category: 'control', spec: 'stop all' },
        doRun: { type: 'command', category: 'control', spec: 'run %cmd %inputs' },
        fork: { type: 'command', category: 'control', spec: 'launch %cmd %inputs' },
        evaluate: { type: 'reporter', category: 'control', spec: 'call %r %inputs' },
/*
        doRunWithInputList: { type: 'command', category: 'control', spec: 'run %cmd with input list %l' },
        forkWithInputList: { type: 'command', category: 'control', spec: 'launch %cmd with input list %l' },
        evaluateWithInputList: { type: 'reporter', category: 'control', spec: 'call %r with input list %l' },
*/
        doReport: { type: 'command', category: 'control', spec: 'report %s' },
        doCallCC: { type: 'command', category: 'control', spec: 'run %cmd w/continuation' },
        reportCallCC: { type: 'reporter', category: 'control', spec: 'call %cmd w/continuation' },
        doWarp: { type: 'command', category: 'other', spec: 'warp %c' },

        reportTouchingObject: { type: 'predicate', category: 'sensing', spec: 'touching %col ?' },
        doAsk: { type: 'command', category: 'sensing', spec: 'ask %s and wait' },
        reportLastAnswer: { type: 'reporter', category: 'sensing', spec: 'answer' },
        reportMouseX: { type: 'reporter', category: 'sensing', spec: 'mouse x' },
        reportMouseY: { type: 'reporter', category: 'sensing', spec: 'mouse y' },
        reportMouseDown: { type: 'predicate', category: 'sensing', spec: 'mouse down?' },
        reportKeyPressed: { type: 'predicate', category: 'sensing', spec: 'key %key pressed?' },
        doResetTimer: { type: 'command', category: 'sensing', spec: 'reset timer' },
        reportTimer: { type: 'reporter', category: 'sensing', spec: 'timer' },

        reportSum: { type: 'reporter', category: 'operators', spec: '%n + %n' },
        reportDifference: { type: 'reporter', category: 'operators', spec: '%n - %n' },
        reportProduct: { type: 'reporter', category: 'operators', spec: '%n \u00D7 %n' },
        reportQuotient: { type: 'reporter', category: 'operators', spec: '%n \u00F7 %n' },
        reportRound: { type: 'reporter', category: 'operators', spec: 'round %n' },
        reportModulus: { type: 'reporter', category: 'operators', spec: '%n mod %n' },
        reportRandom: { type: 'reporter', category: 'operators', spec: 'pick random %n to %n' },
        reportLessThan: { type: 'predicate', category: 'operators', spec: '%s < %s' },
        reportEquals: { type: 'predicate', category: 'operators', spec: '%s = %s' },
        reportGreaterThan: { type: 'predicate', category: 'operators', spec: '%s > %s' },
        reportAnd: { type: 'predicate', category: 'operators', spec: '%b and %b' },
        reportOr: { type: 'predicate', category: 'operators', spec: '%b or %b' },
        reportNot: { type: 'predicate', category: 'operators', spec: 'not %b' },
        reportTrue: { type: 'predicate', category: 'operators', spec: 'true' },
        reportFalse: { type: 'predicate', category: 'operators', spec: 'false' },
//        reportJoin: { type: 'reporter', category: 'operators', spec: 'join %s %s' },
        reportJoinWords: { type: 'reporter', category: 'operators', spec: 'join %words' },
        reportLetter: { type: 'reporter', category: 'operators', spec: 'letter %n of %s' },
        reportStringSize: { type: 'reporter', category: 'operators', spec: 'length of %s' },
        reportUnicode: { type: 'reporter', category: 'operators', spec: 'unicode of %s' },
        reportUnicodeAsLetter: { type: 'reporter', category: 'operators', spec: 'unicode %n as letter' },
        reportScript: { type: 'reporter', category: 'operators', spec: 'the script %parms %c' },
        reify: { type: 'reporter', category: 'operators', spec: 'the %f block %parms' },

        doSetVar: { type: 'command', category: 'variables', spec: 'set %var to %s' },
        doChangeVar: { type: 'command', category: 'variables', spec: 'change %var by %n' },
        doShowVar: { type: 'command', category: 'variables', spec: 'show variable %var' },
        doHideVar: { type: 'command', category: 'variables', spec: 'hide variable %var' },
        doDeclareVariables: { type: 'command', category: 'other', spec: 'script variables %scriptVars' },
        reportNewList: { type: 'reporter', category: 'lists', spec: 'list %mult%s' },
        reportCONS: { type: 'reporter', category: 'lists', spec: '%s in front of %l' },
        reportListItem: { type: 'reporter', category: 'lists', spec: 'item %idx of %l' },
        reportCDR: { type: 'reporter', category: 'lists', spec: 'all but first of %l' },
        reportListLength: { type: 'reporter', category: 'lists', spec: 'length of %l' },
        reportListContainsItem: { type: 'predicate', category: 'lists', spec: '%l contains %s' },
        doAddToList: { type: 'command', category: 'lists', spec: 'add %s to %l' },
        doDeleteFromList: { type: 'command', category: 'lists', spec: 'delete %ida of %l' },
        doInsertInList: { type: 'command', category: 'lists', spec: 'insert %s at %idx of %l' },
        doReplaceInList: { type: 'command', category: 'lists', spec: 'replace item %idx of %l with %s', defaults: [1, null, 'thing'] }
    }
};

XMLSerializer.watcherLabels.getCostumeIdx = 'costume #';

/* XML - Streams */

XMLSerializer.StringStream.prototype.next = function (n) {
    var ch;
    if (n === undefined) {
        ch = this.contents.charAt(this.index);
        this.index += 1;
        return ch;
    }
    return this.contents.substring(this.index, this.index += n);
};

XMLSerializer.StringStream.prototype.peek = function () {
    return this.contents.charAt(this.index);
};

XMLSerializer.StringStream.prototype.skip = function (n) {
    this.index += n;
};

XMLSerializer.StringStream.prototype.upTo = function (regex) {
    var i = this.contents.substr(this.index).search(regex);
    if (i === -1) {
        return '';
    }
    return this.contents.substring(this.index, this.index += i);
};

XMLSerializer.StringStream.prototype.space = /[\s]/;

XMLSerializer.StringStream.prototype.skipSpace = function () {
    var ch;
    while (this.space.test(ch = this.peek()) && ch !== '') {
        this.skip(1);
    }
};

XMLSerializer.StringStream.prototype.word = function () {
    var i = this.contents.substr(this.index).search(/[\s\>\/\=]|$/);
    if (i === -1) {
        return '';
    }
    return this.contents.substring(this.index, this.index += i);
};

/* XML - Nodes */

XMLSerializer.Element.prototype.isElement = true;

XMLSerializer.Element.prototype.attr = function (name) {
    return this.attributes[name];
};

XMLSerializer.Element.prototype.textContent = function () {
    return this.children.reduce(function (str, child) {
        return str + (child instanceof XMLSerializer.Text ? child.value
            : child.textContent());
    }, '');
};

XMLSerializer.Element.prototype.all = function (name) {
    return this.children.filter(function (element) {
        return element.isElement && element.name === name;
    });
};

XMLSerializer.Element.prototype.element = function (name) {
    var i;
    for (i = 0; i < this.children.length; i += 1) {
        if (this.children[i].name === name) {
            return this.children[i];
        }
    }
    return null;
};

XMLSerializer.Element.prototype.require = function (name) {
    var element = this.element(name);
    if (XMLSerializer.nil(element)) {
        throw new Error('Missing required element <' + name + '>!');
    }
    return element;
};

XMLSerializer.Element.prototype.firstElement = function () {
    var i;
    for (i = 0; i < this.children.length; i += 1) {
        if (this.children[i].isElement) {
            return this.children[i];
        }
    }
    return null;
};

XMLSerializer.Element.prototype.toString = function (indent) {
    var my = this;
    if (indent === undefined) {
        indent = '';
    }
    return indent
        + '<'
        + this.name
        + Object.keys(this.attributes).reduce(
            function (str, att) {
                return str + ' ' + att + '="' + my.attributes[att] + '"';
            },
            ''
        )
        + (this.children.length === 0 ? ' />'
            : '>' + this.children.reduce(
                function (str, child) {
                    return str
                        + (child.isElement ? '\n' : '')
                        + child.toString(indent + '  ');
                },
                ''
            )
                + (this.children.length > 1 || this.children[0].isElement ?
                        '\n' + indent : '')
                + '</' + this.name + '>'
        );
};

XMLSerializer.Text.prototype.isElement = false;

XMLSerializer.Text.prototype.toString = function () {
    return this.value;
};

/* Generics */

Array.prototype.toXML = function (s) {
    return this.reduce(function (xml, item) {
        return xml + s.store(item);
    }, '');
};

/* Sprites */

StageMorph.prototype.toXML = function (s) {
    var extent = this.extent(),
        world = this.world(),
        thumbnail = newCanvas(XMLSerializer.thumbnailSize),
        context = thumbnail.getContext('2d'),
        ide = this.parentThatIsA(IDE_Morph);
    if (!s.nil(world)) {
        context.drawImage(
            world.worldCanvas,
            this.bounds.origin.x,
            this.bounds.origin.y,
            extent.x,
            extent.y,
            0,
            0,
            XMLSerializer.thumbnailSize.x,
            XMLSerializer.thumbnailSize.y
        );
    }
    return s.f('<project name="@" version="@">' +
               '<notes>$</notes>' +
               '<thumbnail>$</thumbnail>' +
               '<stage costume="@" ~>' +
               '<pentrails>$</pentrails>' +
               '<variables>%</variables>' +
               '<costumes>%</costumes>' +
               '<sounds>%</sounds>' +
               '<blocks>%</blocks>' +
               '<scripts>%</scripts><sprites>%</sprites>' +
               '</stage>' +
               '<variables>%</variables>' +
               '</project>',
               s.nil(ide) || s.nil(ide.projectName) ?
                    'Untitled' : ide.projectName,
               s.version,
               s.nil(ide) || s.nil(ide.projectNotes) ?
                    '' : ide.projectNotes,
               thumbnail.toDataURL('image/png'),
               this.getCostumeIdx(),
               this.trailsCanvas.toDataURL('image/png'),
               s.store(this.variables),
               s.store(this.costumes),
               s.store(this.sounds),
               s.store(this.customBlocks),
               s.store(this.scripts),
               s.store(this.children),
               s.nil(ide) || s.nil(ide.globalVariables) ?
                    '' : s.store(ide.globalVariables));
};

SpriteMorph.spriteID = 0;

SpriteMorph.prototype.toXML = function (s) {
    var stage = this.parentThatIsA(StageMorph),
        position = s.nil(stage) ? this.center()
                : this.center().subtract(stage.center());

    if (s.nil(this.name)) {
        this.name = 'Sprite' + (SpriteMorph.spriteID += 1);
    }
    return s.f('<sprite name="@" x="@" y="@" heading="@" costume="@" color="@,@,@" ~>' +
               '<variables>%</variables>' +
               '<costumes>%</costumes>' +
               '<sounds>%</sounds>' +
               '<blocks>%</blocks>' +
               '<scripts>%</scripts>' +
               '</sprite>',
               this.name, position.x, -position.y, this.heading, this.getCostumeIdx(),
               this.color.r, this.color.g, this.color.b,
               s.store(this.variables),
               s.store(this.costumes),
               s.store(this.sounds),
               s.nil(this.customBlocks) ? '' : s.store(this.customBlocks),
               s.store(this.scripts));
};

Costume.prototype.toXML = function (s) {
    return s.f('<costume name="@" center-x="@" center-y="@" image="@" ~/>',
               this.name,
               this.rotationCenter.x,
               this.rotationCenter.y,
               this.contents.toDataURL('image/png'));
};

Sound.prototype.toXML = function (s) {
    return s.f('<sound name="@" sound="@" ~/>',
               this.name,
               this.toDataURL());
};

VariableFrame.prototype.toXML = function (s) {
    var my = this;
    return Object.keys(this.vars).reduce(function (vars, v) {
        var val = my.vars[v];
        return vars + (s.nil(val) ? s.f('<variable name="@"/>', v)
            : s.f('<variable name="@">%</variable>',
                v,
                typeof val === 'object' ? s.store(val)
                    : s.f('<l>$</l>', val)
                ));
    }, '');
};

/* Watchers */

WatcherMorph.prototype.toXML = function (s) {
    var isVar = this.target instanceof VariableFrame,
        color = this.readoutColor,
        position = this.parent ?
                this.topLeft().subtract(this.parent.topLeft())
                : this.topLeft();

    return s.f(
        '<watcher% % x="@" y="@" color="@,@,@"%/>',
        (isVar && !s.nil(this.target.owner))
            || (!isVar && !s.nil(this.target)) ?
                    s.f(' scope="@"', isVar ? this.target.owner.name
                        : this.target.name)
                            : '',
        s.f(isVar ? 'var="@"' : 's="@"', this.getter),
        position.x,
        position.y,
        color.r,
        color.g,
        color.b,
        this.isVisible ? '' : ' hidden="hidden"'
    );
};

/* Scripts */

ScriptsMorph.prototype.toXML = function (s) {
    return this.children.reduce(function (xml, child) {
        if (!(child instanceof BlockMorph)) {
            return xml;
        }
        return xml + child.toScriptXML(s, true);
    }, '');
};

BlockMorph.prototype.toXML = BlockMorph.prototype.toScriptXML = function (
    s,
    savePosition
) {
    var position = this.parent ?
            this.topLeft().subtract(this.parent.topLeft())
        : this.topLeft(),
        xml = savePosition ?
                s.f('<script x="@" y="@">', position.x, position.y)
        : '<script>',
        block = this;
    do {
        xml += block.toBlockXML(s);
        block = block.nextBlock();
    } while (!s.nil(block));
    xml += '</script>';
    return xml;
};

BlockMorph.prototype.toBlockXML = function (s) {
    return s.f(
        '<block s="@">%</block>',
        this.selector,
        s.store(this.inputs())
    );
};

ReporterBlockMorph.prototype.toXML = function (s) {
    return this.selector === 'reportGetVar' ? s.f(
        '<block var="@"/>',
        this.blockSpec
    ) : this.toBlockXML(s);
};

ReporterBlockMorph.prototype.toScriptXML = function (s, savePosition) {
    var position = this.parent ?
            this.topLeft().subtract(this.parent.topLeft())
        : this.topLeft();
    return savePosition ?
            s.f(
                '<script x="@" y="@">%</script>',
                position.x,
                position.y,
                this.toXML(s)
            ) : s.f('<script>%</script>', this.toXML(s));
};

CustomCommandBlockMorph.prototype.toBlockXML
    = CustomReporterBlockMorph.prototype.toBlockXML
    = function (
        s
    ) {
        var scope = this.isGlobal ? undefined
            : s.nil(this.definition)
                    || s.nil(this.definition.body)
                        || s.nil(this.definition.body.receiver) ?
                        'none' : this.definition.body.receiver.name;
        return s.f(
            '<custom-block s="@"%>%</custom-block>',
            this.blockSpec,
            this.isGlobal ? '' : s.f(' scope="@"', scope),
            s.store(this.inputs())
        );
    };

CustomBlockDefinition.prototype.toXML = function (s) {
    var my = this;
    return s.f('<block-definition s="@" type="@" category="@">' +
               '<inputs>%</inputs>%' +
               '</block-definition>',
               this.spec, this.type,
               s.nil(this.category) ? 'other' : this.category,
               Object.keys(this.declarations).reduce(function (xml, decl) {
            return xml + s.f(
                '<input type="@">$</input>',
                my.declarations[decl][0],
                my.declarations[decl][1]
            );
        }, ''),
        s.store(this.body.expression));
};

/* Scripts - Inputs */

InputSlotMorph.prototype.toXML = function (s) {
    return s.f('<l>$</l>', this.contents().text);
};

TemplateSlotMorph.prototype.toXML = function (s) {
    return s.f('<l>$</l>', this.contents());
};

CommandSlotMorph.prototype.toXML
    = FunctionSlotMorph.prototype.toXML
    = function (s) {
        var block = this.children[0];
        return s.nil(block) || !(block instanceof BlockMorph) ?
                '<script></script>' : block instanceof ReporterBlockMorph ?
                    s.f('<autolambda>%</autolambda>', s.store(block))
                        : s.store(block);
    };

MultiArgMorph.prototype.toXML = function (s) {
    return s.f('<list>%</list>', s.store(this.inputs()));
};

ColorSlotMorph.prototype.toXML = function (s) {
    return s.f(
        '<color>$,$,$,$</color>',
        this.color.r,
        this.color.g,
        this.color.b,
        this.color.a
    );
};

/* Values */

List.prototype.toXML = function (s) {
    var xml, item;
    if (this.isLinked) {
        xml = '<list linked="linked" ~>';
        item = this;
        do {
            xml += s.f('<item>%</item>', s.store(item.first));
            item = item.rest;
        } while (!s.nil(item));
        return xml + '</list>';
    }
    return s.f('<list ~>%</list>', this.contents.reduce(function (xml, item) {
        return xml
            + s.f(
                '<item>%</item>',
                typeof item === 'object' ?
                        s.store(item) : s.f('<l>$</l>', item)
            );
    }, ''));
};

Context.prototype.toXML = function (s) {
    return s.f('<context% ~><inputs>%</inputs><variables>%</variables>%<receiver>%</receiver>%</context>',
               this.isLambda ? ' lambda="lambda"' : '',
               this.inputs.reduce(function (xml, input) {
            return xml + s.f('<input>$</input>', input);
        }, ''),
        s.nil(this.variables) ? '' : s.store(this.variables),
        s.nil(this.expression) ? '' : s.store(this.expression),
        s.nil(this.receiver) ? '' : s.store(this.receiver),
        s.nil(this.outerContext) ? '' : s.store(this.outerContext));
};

