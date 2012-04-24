/*

	objects.js

	a scriptable microworld
	based on morphic.js, blocks.js and threads.js
	inspired by Scratch

	written by Jens Mönig
	jens@moenig.org

	Copyright (C) 2012 by Jens Mönig

	Permission is hereby granted, free of charge, to any person
	obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without
	restriction, including without limitation the rights to use, copy,
	modify, merge, publish, distribute, sublicense, and/or sell copies
	of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
	DEALINGS IN THE SOFTWARE.


	prerequisites:
	--------------
	needs blocks.js, threads.js, morphic.js and widgets.js


	toc
	---
	the following list shows the order in which all constructors are
	defined. Use this list to locate code in this document:

		SpriteMorph
		StageMorph
        Costume
        CostumeEditorMorph
        CellMorph
        WatcherMorph
        StagePrompterMorph


	credits
	-------
	Ian Reynolds contributed initial porting of primitives from Squeak and
    sound handling

*/

// gloabls from lists.js:

/*global ListWatcherMorph*/

// gloabls from widgets.js:

/*global PushButtonMorph, ToggleMorph, DialogBoxMorph, InputFieldMorph*/

// gloabls from gui.js:

/*global WatcherMorph*/

// globals from threads.js:

/*global ArgMorph, BlockMorph, Process, StackFrame, ThreadManager,
VariableFrame, detect, threadsVersion*/

// globals from blocks.js:

/*global ArgMorph, ArrowMorph, BlockHighlightMorph, BlockMorph,
BooleanSlotMorph, BoxMorph, Color, ColorPaletteMorph, ColorSlotMorph,
CommandBlockMorph, CommandSlotMorph, FrameMorph, HatBlockMorph,
InputSlotMorph, MenuMorph, Morph, MultiArgMorph, Point,
ReporterBlockMorph, ScriptsMorph, ShadowMorph, StringMorph,
SyntaxElementMorph, TextMorph, WorldMorph, blocksVersion, contains,
degrees, detect, getDocumentPositionOf, newCanvas, nop, radians,
useBlurredShadows*/

// globals from morphic.js:

/*global Array, BlinkerMorph, BouncerMorph, BoxMorph, CircleBoxMorph,
Color, ColorPaletteMorph, ColorPickerMorph, CursorMorph, Date,
FrameMorph, Function, GrayPaletteMorph, HandMorph, HandleMorph,
InspectorMorph, ListMorph, Math, MenuItemMorph, MenuMorph, Morph,
MorphicPreferences, MouseSensorMorph, Node, Object, PenMorph, Point,
Rectangle, ScrollFrameMorph, ShadowMorph, SliderButtonMorph,
SliderMorph, String, StringFieldMorph, StringMorph, TextMorph,
TriggerMorph, WorldMorph, clone, contains, copy, degrees, detect,
document, getDocumentPositionOf, isNaN, isObject, isString, newCanvas,
nop, parseFloat, radians, standardSettings, touchScreenSettings,
useBlurredShadows, version, window, modules, IDE_Morph, VariableDialogMorph,
HTMLCanvasElement, Context, List, SpeechBubbleMorph*/

// globals from byob.js:

/*global CustomBlockDefinition, BlockEditorMorph, BlockDialogMorph*/

// temporary globals

// Global stuff ////////////////////////////////////////////////////////

modules.objects = '2012-Apr-16';

var SpriteMorph;
var StageMorph;
var Costume;
var CostumeEditorMorph;
var Sound;
var CellMorph;
var WatcherMorph;
var StagePrompterMorph;

// SpriteMorph /////////////////////////////////////////////////////////

// I am a scriptable object

// SpriteMorph inherits from PenMorph:

SpriteMorph.prototype = new PenMorph();
SpriteMorph.prototype.constructor = SpriteMorph;
SpriteMorph.uber = PenMorph.prototype;

// SpriteMorph settings

SpriteMorph.prototype.categories =
    [
        'motion',
        'control',
        'looks',
        'sensing',
        'sound',
        'operators',
        'pen',
        'variables',
        'lists',
        'other'
    ];

SpriteMorph.prototype.blockColor = {
	motion : new Color(74, 108, 212),
	looks : new Color(143, 86, 227),
	sound : new Color(207, 74, 217),
	pen : new Color(0, 161, 120),
	control : new Color(230, 168, 34),
	sensing : new Color(4, 148, 220),
	operators : new Color(98, 194, 19),
	variables : new Color(243, 118, 29),
	lists : new Color(217, 77, 17),
	other: new Color(128, 128, 128)
};

SpriteMorph.prototype.paletteColor = new Color(55, 55, 55);
SpriteMorph.prototype.sliderColor
    = SpriteMorph.prototype.paletteColor.lighter(30);
SpriteMorph.prototype.isCachingPrimitives = true;

SpriteMorph.prototype.bubbleColor = new Color(255, 255, 255);
SpriteMorph.prototype.bubbleFontSize = 14;
SpriteMorph.prototype.bubbleFontIsBold = true;
SpriteMorph.prototype.bubbleCorner = 10;
SpriteMorph.prototype.bubbleBorder = 3;
SpriteMorph.prototype.bubbleBorderColor = new Color(190, 190, 190);
SpriteMorph.prototype.bubbleMaxTextWidth = 130;

// SpriteMorph instance creation

function SpriteMorph(globals) {
	this.init(globals);
}

SpriteMorph.prototype.init = function (globals) {
	this.name = 'Sprite';
	this.variables = new VariableFrame(globals || null, this);
	this.scripts = new ScriptsMorph(this);
	this.customBlocks = [];
    this.costumes = new List();
    this.costume = null;
    this.sounds = new List();
    this.normalExtent = new Point(60, 60); // only for costume-less situation
    this.scale = 1;
    this.version = Date.now(); // for observer optimization

    this.blocksCache = {}; // not to be serialized (!)
    this.rotationOffset = new Point(); // not to be serialized (!)

	SpriteMorph.uber.init.call(this);

	this.isDraggable = true;
	this.isDown = false;

    this.heading = 90;
    this.changed();
    this.drawNew();
    this.changed();
};

// SpriteMorph duplicating (fullCopy)

SpriteMorph.prototype.fullCopy = function () {
    var c = SpriteMorph.uber.fullCopy.call(this),
        arr = [],
        cb;

    c.stopTalking();
    c.color = this.color.copy();
    c.blocksCache = {};
    c.scripts = this.scripts.fullCopy();
    c.scripts.owner = c;
    c.variables = this.variables.copy();
    c.variables.owner = c;

    c.customBlocks = [];
    this.customBlocks.forEach(function (def) {
        cb = def.copyAndBindTo(c);
        c.customBlocks.push(cb);
        c.allBlockInstances(def).forEach(function (block) {
            block.definition = cb;
        });
    });
    this.costumes.asArray().forEach(function (costume) {
        arr.push(costume);
    });
    c.costumes = new List(arr);
    arr = [];
    this.sounds.asArray().forEach(function (sound) {
        arr.push(sound);
    });
    c.sounds = new List(arr);

    return c;
};

// SpriteMorph versioning

SpriteMorph.prototype.setName = function (string) {
    this.name = string || this.name;
    this.version = Date.now();
};

// SpriteMorph rendering

SpriteMorph.prototype.drawNew = function () {
    var myself = this,
        currentCenter = this.center(),
        newX,
        corners = [],
        origin,
        shift,
        corner,
        costumeExtent,
        ctx;

    if (this.costume) {
        // determine the rotated costume's bounding box
        corners = this.costume.bounds().corners().map(function (point) {
            return point.rotateBy(
                radians(myself.heading - 90),
                myself.costume.center()
            );
        });
        origin = corners[0];
        corner = corners[0];
        corners.forEach(function (point) {
            origin = origin.min(point);
            corner = corner.max(point);
        });
        costumeExtent = origin.corner(corner)
            .extent().multiplyBy(this.scale);

        // determine the new relative origin of the rotated shape
        shift = new Point(0, 0).rotateBy(
            radians(-(this.heading - 90)),
            this.costume.center()
        ).subtract(origin);

        // create a new, adequately dimensioned canvas
        // and draw the costume on it
        this.image = newCanvas(costumeExtent);
        this.silentSetExtent(costumeExtent);
        ctx = this.image.getContext('2d');
        ctx.scale(this.scale, this.scale);
        ctx.translate(shift.x, shift.y);
        ctx.rotate(radians(this.heading - 90));
        ctx.drawImage(this.costume.contents, 0, 0);

        // adjust my position to the rotation
        this.setCenter(currentCenter);

        // determine my rotation offset
        this.rotationOffset = shift
            .translateBy(this.costume.rotationCenter)
            .rotateBy(radians(-(this.heading - 90)), shift)
            .scaleBy(this.scale);
    } else {
        newX = Math.min(
            Math.max(
                this.normalExtent.x * this.scale,
                5
            ),
            1000
        );
        this.silentSetExtent(new Point(newX, newX));
        this.image = newCanvas(this.extent());
        this.setCenter(currentCenter);
        SpriteMorph.uber.drawNew.call(this);
        this.rotationOffset = this.extent().divideBy(2);
    }
    this.version = Date.now();
};

SpriteMorph.prototype.rotationCenter = function () {
    return this.position().add(this.rotationOffset);
};

// SpriteMorph block templates

SpriteMorph.prototype.blockTemplates = function (category) {
	var blocks = [], myself = this, inputs, i, varNames, button,
        cat = category || 'motion', txt;

	function block(type, category, spec, selector, defaults) {
		var newBlock;

		if (type === 'reporter') {
			newBlock = new ReporterBlockMorph();
		} else if (type === 'predicate') {
			newBlock = new ReporterBlockMorph(true);
		} else if (type === 'hat') {
			newBlock = new HatBlockMorph();
		} else { // type === 'command'
			newBlock = new CommandBlockMorph();
		}
		newBlock.isDraggable = false;
		newBlock.isTemplate = true;
		newBlock.color = myself.blockColor[category];
		newBlock.selector = selector;
		newBlock.setSpec(spec);
		if (defaults) {
			newBlock.defaults = defaults;
			inputs = newBlock.inputs();
            if (inputs[0] instanceof MultiArgMorph) {
                inputs[0].setContents(defaults);
                inputs[0].defaults = defaults;
            } else {
                for (i = 0; i < defaults.length; i += 1) {
                    if (defaults[i] !== null) {
                        inputs[i].setContents(defaults[i]);
                    }
                }
            }
		}
		return newBlock;
	}

	function watcherToggle(category, label, selector) {
		return new ToggleMorph(
			'checkbox',
			this,
			function () {
				myself.toggleWatcher(
					selector,
					label,
					myself.blockColor[category]
				);
			},
			null,
			function () {
				return myself.showingWatcher(selector);
			},
			null
		);
	}

	function variableWatcherToggle(varName) {
		return new ToggleMorph(
			'checkbox',
			this,
			function () {
				myself.toggleVariableWatcher(varName);
			},
			null,
			function () {
				return myself.showingVariableWatcher(varName);
			},
			null
		);
	}

    if (cat === 'motion') {

        blocks.push(block(
            'command',
            'motion',
            'move %n steps',
            'forward',
            [10]
        ));
        blocks.push(block(
            'command',
            'motion',
            'turn %clockwise %n degrees',
            'turn',
            [15]
        ));
        blocks.push(block(
            'command',
            'motion',
            'turn %counterclockwise %n degrees',
            'turnLeft',
            [15]
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'motion',
            'point in direction %dir',
            'setHeading'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'motion',
            'go to x: %n y: %n',
            'gotoXY',
            [0, 0]
        ));
        blocks.push(block(
            'command',
            'motion',
            'glide %n secs to x: %n y: %n',
            'doGlide',
            [1, 0, 0]
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'motion',
            'change x by %n',
            'changeXPosition',
            [10]
        ));
        blocks.push(block(
            'command',
            'motion',
            'set x to %n',
            'setXPosition',
            [0]
        ));
        blocks.push(block(
            'command',
            'motion',
            'change y by %n',
            'changeYPosition',
            [10]
        ));
        blocks.push(block(
            'command',
            'motion',
            'set y to %n',
            'setYPosition',
            [0]
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'motion',
            'if on edge, bounce',
            'bounceOffEdge'
        ));

        blocks.push('-');

        blocks.push(watcherToggle(
            'motion',
            'x position',
            'xPosition'
        ));
        blocks.push(block(
            'reporter',
            'motion',
            'x position',
            'xPosition'
        ));

        blocks.push(watcherToggle(
            'motion',
            'y position',
            'yPosition'
        ));
        blocks.push(block(
            'reporter',
            'motion',
            'y position',
            'yPosition'
        ));

        blocks.push(watcherToggle(
            'motion',
            'direction',
            'direction'
        ));
        blocks.push(block(
            'reporter',
            'motion',
            'direction',
            'direction'
        ));

    } else if (cat === 'looks') {

        blocks.push(block(
            'command',
            'looks',
            'switch to costume %cst',
            'doSwitchToCostume',
            ['Turtle']
        ));

        blocks.push(block(
            'command',
            'looks',
            'next costume',
            'doWearNextCostume'
        ));

        blocks.push(watcherToggle(
            'looks',
            'costume #',
            'getCostumeIdx'
        ));
        blocks.push(block(
            'reporter',
            'looks',
            'costume #',
            'getCostumeIdx'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'looks',
            'say %s for %n secs',
            'doSayFor',
            ['Hello!', 2]
        ));
        blocks.push(block(
            'command',
            'looks',
            'say %s',
            'bubble',
            ['Hello!']
        ));
        blocks.push(block(
            'command',
            'looks',
            'think %s for %n secs',
            'doThinkFor',
            ['Hmm...', 2]
        ));
        blocks.push(block(
            'command',
            'looks',
            'think %s',
            'doThink',
            ['Hmm...']
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'looks',
            'change %eff effect by %n',
            'changeEffect',
            [null, 25]
        ));
        blocks.push(block(
            'command',
            'looks',
            'set %eff effect to %n',
            'setEffect',
            [null, 0]
        ));
        blocks.push(block(
            'command',
            'looks',
            'clear graphic effects',
            'clearEffects'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'looks',
            'change size by %n',
            'changeScale',
            [10]
        ));

        blocks.push(block(
            'command',
            'looks',
            'set size to %n %',
            'setScale',
            [100]
        ));

        blocks.push(watcherToggle(
            'looks',
            'size',
            'getScale'
        ));
        blocks.push(block(
            'reporter',
            'looks',
            'size',
            'getScale'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'looks',
            'show',
            'show'
        ));
        blocks.push(block(
            'command',
            'looks',
            'hide',
            'hide'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'looks',
            'go to front',
            'comeToFront'
        ));
        blocks.push(block(
            'command',
            'looks',
            'go back %n layers',
            'goBack',
            [1]
        ));

    // for debugging: ///////////////

        if (this.world().isDevMode) {

            blocks.push('-');

            txt = new TextMorph(
                'development mode \ndebugging primitives:'
            );
            txt.fontSize = 9;
            txt.setColor(new Color(230, 230, 230));
            blocks.push(txt);

            blocks.push('-');

            blocks.push(block(
                'command',
                'looks',
                'console log %mult%s',
                'log'
            ));

            blocks.push(block(
                'command',
                'looks',
                'alert %mult%s',
                'alert'
            ));
        }

    /////////////////////////////////

    } else if (cat === 'sound') {

        blocks.push(block(
            'command',
            'sound',
            'play sound %snd',
            'playSound'
        ));

        blocks.push(block(
            'command',
            'sound',
            'play sound %snd until done',
            'doPlaySoundUntilDone'
        ));

        blocks.push(block(
            'command',
            'sound',
            'stop all sounds',
            'doStopAllSounds'
        ));

    } else if (cat === 'pen') {

        blocks.push(block(
            'command',
            'pen',
            'clear',
            'clear'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'pen',
            'pen down',
            'down'
        ));
        blocks.push(block(
            'command',
            'pen',
            'pen up',
            'up'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'pen',
            'set pen color to %clr',
            'setColor'
        ));
        blocks.push(block(
            'command',
            'pen',
            'change pen color by %n',
            'changeHue',
            [10]
        ));
        blocks.push(block(
            'command',
            'pen',
            'set pen color to %n',
            'setHue',
            [0]
        ));
        blocks.push('-');

        blocks.push(block(
            'command',
            'pen',
            'change pen shade by %n',
            'changeBrightness',
            [10]
        ));
        blocks.push(block(
            'command',
            'pen',
            'set pen shade to %n',
            'setBrightness',
            [100]
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'pen',
            'change pen size by %n',
            'changeSize',
            [1]
        ));
        blocks.push(block(
            'command',
            'pen',
            'set pen size to %n',
            'setSize',
            [1]
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'pen',
            'stamp',
            'doStamp'
        ));
    } else if (cat === 'control') {

        blocks.push(block(
            'hat',
            'control',
            'when %greenflag clicked',
            'receiveGo'
        ));
        blocks.push(block(
            'hat',
            'control',
            'when %key key pressed',
            'receiveKey'
        ));
        blocks.push(block(
            'hat',
            'control',
            'when I am clicked',
            'receiveClick'
        ));
        blocks.push(block(
            'hat',
            'control',
            'when I receive %msg',
            'receiveMessage'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'control',
            'broadcast %msg',
            'doBroadcast'
        ));
        blocks.push(block(
            'command',
            'control',
            'broadcast %msg and wait',
            'doBroadcastAndWait'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'control',
            'wait %n secs',
            'doWait',
            [1]
        ));
        blocks.push(block(
            'command',
            'control',
            'wait until %b',
            'doWaitUntil'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'control',
            'forever %c',
            'doForever'
        ));
        blocks.push(block(
            'command',
            'control',
            'repeat %n %c',
            'doRepeat',
            [10]
        ));
        blocks.push(block(
            'command',
            'control',
            'repeat until %b %c',
            'doUntil'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'control',
            'if %b %c',
            'doIf'
        ));
        blocks.push(block(
            'command',
            'control',
            'if %b %c else %c',
            'doIfElse'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'control',
            'stop block',
            'doReport'
        ));
        blocks.push(block(
            'command',
            'control',
            'stop script',
            'doStop'
        ));
        blocks.push(block(
            'command',
            'control',
            'stop all %stop',
            'doStopAll'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'control',
            'run %cmd %inputs',
            'doRun'
        ));
        blocks.push(block(
            'command',
            'control',
            'launch %cmd %inputs',
            'fork'
        ));
        blocks.push(block(
            'reporter',
            'control',
            'call %r %inputs',
            'evaluate'
        ));

        blocks.push('-');

    /* list variants commented out for now (redundant)

        blocks.push(block(
            'command',
            'control',
            'run %cmd with input list %l',
            'doRunWithInputList'
        ));
        blocks.push(block(
            'command',
            'control',
            'launch %cmd with input list %l',
            'forkWithInputList'
        ));
        blocks.push(block(
            'reporter',
            'control',
            'call %r  with input list %l',
            'evaluateWithInputList'
        ));

        blocks.push('-');
*/

        blocks.push(block(
            'command',
            'control',
            'run %cmd w/continuation',
            'doCallCC'
        ));
        blocks.push(block(
            'reporter',
            'control',
            'call %cmd w/continuation',
            'reportCallCC'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'control',
            'report %s',
            'doReport'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'other',
            'warp %c',
            'doWarp'
        ));

    } else if (cat === 'sensing') {

        blocks.push(block(
            'predicate',
            'sensing',
            'touching %col ?',
            'reportTouchingObject'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'sensing',
            'ask %s and wait',
            'doAsk',
            ['what\'s your name?']
        ));
        blocks.push(watcherToggle(
            'sensing',
            'answer',
            'getLastAnswer'
        ));
        blocks.push(block(
            'reporter',
            'sensing',
            'answer',
            'reportLastAnswer'
        ));

        blocks.push('-');

        blocks.push(block(
            'reporter',
            'sensing',
            'mouse x',
            'reportMouseX'
        ));
        blocks.push(block(
            'reporter',
            'sensing',
            'mouse y',
            'reportMouseY'
        ));
        blocks.push(block(
            'predicate',
            'sensing',
            'mouse down?',
            'reportMouseDown'
        ));

        blocks.push('-');

        blocks.push(block(
            'predicate',
            'sensing',
            'key %key pressed?',
            'reportKeyPressed'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'sensing',
            'reset timer',
            'doResetTimer'
        ));
        blocks.push(watcherToggle(
            'sensing',
            'timer',
            'getTimer'
        ));
        blocks.push(block(
            'reporter',
            'sensing',
            'timer',
            'reportTimer'
        ));

    } else if (cat === 'operators') {

        blocks.push(block(
            'reporter',
            'operators',
            '%n + %n',
            'reportSum'
        ));
        blocks.push(block(
            'reporter',
            'operators',
            '%n - %n',
            'reportDifference'
        ));
        blocks.push(block(
            'reporter',
            'operators',
            '%n \u00D7 %n',
            'reportProduct'
        ));
        blocks.push(block(
            'reporter',
            'operators',
            '%n \u00F7 %n',
            'reportQuotient'
        ));

        blocks.push('-');

        blocks.push(block(
            'reporter',
            'operators',
            '%n mod %n',
            'reportModulus'
        ));
        blocks.push(block(
            'reporter',
            'operators',
            'round %n',
            'reportRound'
        ));
        blocks.push(block(
            'reporter',
            'operators',
            'pick random %n to %n',
            'reportRandom',
            [1, 10]
        ));

        blocks.push('-');

        blocks.push(block(
            'predicate',
            'operators',
            '%s < %s',
            'reportLessThan'
        ));
        blocks.push(block(
            'predicate',
            'operators',
            '%s = %s',
            'reportEquals'
        ));
        blocks.push(block(
            'predicate',
            'operators',
            '%s > %s',
            'reportGreaterThan'
        ));

        blocks.push('-');

        blocks.push(block(
            'predicate',
            'operators',
            '%b and %b',
            'reportAnd'
        ));
        blocks.push(block(
            'predicate',
            'operators',
            '%b or %b',
            'reportOr'
        ));
        blocks.push(block(
            'predicate',
            'operators',
            'not %b',
            'reportNot'
        ));

        blocks.push('-');

        blocks.push(block(
            'predicate',
            'operators',
            'true',
            'reportTrue'
        ));
        blocks.push(block(
            'predicate',
            'operators',
            'false',
            'reportFalse'
        ));

        blocks.push('-');

/*
        blocks.push(block(
            'reporter',
            'operators',
            'join %s %s',
            'reportJoin',
            ['hello ', 'world']
        ));
*/
        blocks.push(block(
            'reporter',
            'operators',
            'join %words',
            'reportJoinWords',
            ['hello ', 'world']
        ));
        blocks.push(block(
            'reporter',
            'operators',
            'letter %n of %s',
            'reportLetter',
            [1, 'world']
        ));
        blocks.push(block(
            'reporter',
            'operators',
            'length of %s',
            'reportStringSize',
            ['world']
        ));

        blocks.push('-');

        blocks.push(block(
            'reporter',
            'operators',
            'unicode of %s',
            'reportUnicode',
            ['a']
        ));
        blocks.push(block(
            'reporter',
            'operators',
            'unicode %n as letter',
            'reportUnicodeAsLetter',
            [65]
        ));

        blocks.push('-');

        blocks.push(block(
            'reporter',
            'operators',
            'the script %parms %c',
            'reportScript'
        ));

        blocks.push(block(
            'reporter',
            'operators',
            'the %f block %parms',
            'reify'
        ));

    } else if (cat === 'variables') {

        button = new PushButtonMorph(
            null,
            function () {
                new VariableDialogMorph(
                    null,
                    function (pair) {
                        if (pair) {
                            myself.addVariable(pair[0], pair[1]);
                            myself.toggleVariableWatcher(pair[0], pair[1]);
                            myself.blocksCache[cat] = null;
                            myself.parentThatIsA(IDE_Morph).refreshPalette();
                        }
                    },
                    myself
                ).prompt(
                    'Variable name',
                    null,
                    myself.world()
                );
            },
            'Make a variable'
        );
        blocks.push(button);

        if (this.variables.allNames().length > 0) {
            button = new PushButtonMorph(
                null,
                function () {
                    var menu = new MenuMorph(
                        myself.deleteVariable,
                        null,
                        myself
                    );
                    myself.variables.allNames().forEach(function (name) {
                        menu.addItem(name, name);
                    });
                    menu.popUpAtHand(myself.world());
                },
                'Delete a variable'
            );
            blocks.push(button);
        }

        blocks.push('-');

        varNames = this.variables.allNames();
        if (varNames.length > 0) {
            varNames.forEach(function (name) {
                blocks.push(variableWatcherToggle(name));
                blocks.push(block(
                    'reporter',
                    'variables',
                    name,
                    'reportGetVar'
                ));
            });
            blocks.push('-');
        }

        blocks.push(block(
            'command',
            'variables',
            'set %var to %s',
            'doSetVar',
            [null, 0]
        ));

        blocks.push(block(
            'command',
            'variables',
            'change %var by %n',
            'doChangeVar',
            [null, 1]
        ));

        blocks.push(block(
            'command',
            'variables',
            'show variable %var',
            'doShowVar'
        ));

        blocks.push(block(
            'command',
            'variables',
            'hide variable %var',
            'doHideVar'
        ));

        blocks.push(block(
            'command',
            'other',
            'script variables %scriptVars',
            'doDeclareVariables'
        ));

        blocks.push('=');

        blocks.push(block(
            'reporter',
            'lists',
            'list %mult%s',
            'reportNewList'
        ));

        blocks.push('-');

        blocks.push(block(
            'reporter',
            'lists',
            '%s in front of %l',
            'reportCONS'
        ));
        blocks.push(block(
            'reporter',
            'lists',
            'item %idx of %l',
            'reportListItem',
            [1]
        ));
        blocks.push(block(
            'reporter',
            'lists',
            'all but first of %l',
            'reportCDR'
        ));

        blocks.push('-');

        blocks.push(block(
            'reporter',
            'lists',
            'length of %l',
            'reportListLength'
        ));
        blocks.push(block(
            'predicate',
            'lists',
            '%l contains %s',
            'reportListContainsItem',
            [null, 'thing']
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'lists',
            'add %s to %l',
            'doAddToList',
            ['thing']
        ));
        blocks.push(block(
            'command',
            'lists',
            'delete %ida of %l',
            'doDeleteFromList',
            [1]
        ));
        blocks.push(block(
            'command',
            'lists',
            'insert %s at %idx of %l',
            'doInsertInList',
            ['thing', 1]
        ));
        blocks.push(block(
            'command',
            'lists',
            'replace item %idx of %l with %s',
            'doReplaceInList',
            [1, null, 'thing']
        ));

        blocks.push('=');

        button = new PushButtonMorph(
            null,
            function () {
                var ide = myself.parentThatIsA(IDE_Morph);
                new BlockDialogMorph(
                    null,
                    function (definition) {
                        if (definition.spec !== '') {
                            myself.customBlocks.push(definition);
                            myself.cacheCustomBlock(definition);
                            ide.refreshPalette();
                            new BlockEditorMorph(definition, myself).popUp();
                        }
                    },
                    myself
                ).prompt(
                    'Make a block',
                    null,
                    myself.world()
                );
            },
            'Make a block'
        );
        blocks.push(button);
    }
	return blocks;
};

SpriteMorph.prototype.cacheCustomBlock = function (definition) {
    if (!this.blocksCache.custom) {
        this.cacheCustomBlocks();
    }
    this.blocksCache.custom.push(definition.templateInstance());
};

SpriteMorph.prototype.cacheCustomBlocks = function () {
    var myself = this;

    this.blocksCache.custom = [];
    this.customBlocks.forEach(function (def) {
        myself.blocksCache.custom.push(def.templateInstance());
    });
};

SpriteMorph.prototype.palette = function (category) {
	var	palette = new ScrollFrameMorph(null, null, this.sliderColor),
		unit = SyntaxElementMorph.prototype.fontSize,
		x = 0,
		y = 5,
        blocks,
        myself = this,
        oldFlag = Morph.prototype.trackChanges;

    Morph.prototype.trackChanges = false;

	palette.owner = this;
	palette.padding = unit / 2;
	palette.color = this.paletteColor;

    blocks = this.blocksCache[category];
    if (!blocks) {
        blocks = myself.blockTemplates(category);
        if (this.isCachingPrimitives) {
            myself.blocksCache[category] = blocks;
        }
    }

	blocks.forEach(function (block) {
		if (block === '-') {
			y += unit * 0.8;
		} else if (block === '=') {
			y += unit * 1.6;
		} else {
			if (x === 0) {
				y += unit * 0.3;
			}
			block.setPosition(new Point(x, y));
			palette.addContents(block);
			if (block instanceof ToggleMorph) {
				x = block.right() + unit / 2;
			} else {
                if (block.fixLayout) {block.fixLayout(); }
				x = 0;
				y += block.height();
			}
		}
	});

    if (!this.blocksCache.custom) {
        this.cacheCustomBlocks();
    }
    y += unit * 1.6;

    this.blocksCache.custom.forEach(function (block) {
        if (block.definition.category === category ||
                (category === 'variables'
                    && contains(
                        ['lists', 'other'],
                        block.definition.category
                    ))) {
            y += unit * 0.3;
			block.setPosition(new Point(x, y));
			palette.addContents(block);
            x = 0;
            y += block.height();
        }
    });

    Morph.prototype.trackChanges = oldFlag;
	return palette;
};

// SpriteMorph variable management

SpriteMorph.prototype.addVariable = function (name, isGlobal) {
    var ide = this.parentThatIsA(IDE_Morph);
    if (isGlobal) {
        this.variables.parentFrame.addVar(name);
        if (ide) {
            ide.flushBlocksCache('variables');
        }
    } else {
        this.variables.addVar(name);
        this.blocksCache.variables = null;
    }
};

SpriteMorph.prototype.deleteVariable = function (varName) {
    var ide = this.parentThatIsA(IDE_Morph);
	this.deleteVariableWatcher(varName);
	this.variables.deleteVar(varName);
    if (ide) {
        ide.flushBlocksCache('variables'); // b/c the var could be global
        ide.refreshPalette();
    }
};

// SpriteMorph costume management

SpriteMorph.prototype.addCostume = function (costume) {
    if (!costume.name) {
        costume.name = 'costume' + (this.costumes.length() + 1);
    }
    this.costumes.add(costume);
};

SpriteMorph.prototype.wearCostume = function (costume) {
    var x = this.xPosition ? this.xPosition() : null,
        y = this.yPosition ? this.yPosition() : null;
    this.changed();
    this.costume = costume;
    this.drawNew();
    this.changed();
    if (x !== null) {
        this.silentGotoXY(x, y);
    }
    if (this.positionTalkBubble) { // the stage doesn't talk
        this.positionTalkBubble();
    }
    this.version = Date.now();
};

SpriteMorph.prototype.getCostumeIdx = function () {
    return this.costumes.asArray().indexOf(this.costume) + 1;
};

SpriteMorph.prototype.doWearNextCostume = function () {
    var arr = this.costumes.asArray(),
        idx;
    if (arr.length > 1) {
        idx = arr.indexOf(this.costume);
        if (idx > -1) {
            idx += 1;
            if (idx > (arr.length - 1)) {
                idx = 0;
            }
            this.wearCostume(arr[idx]);
        }
    }
};

SpriteMorph.prototype.doSwitchToCostume = function (id) {
    var num,
        arr = this.costumes.asArray(),
        costume;
    if (id === 'Turtle') {
        costume = null;
    } else {
        costume = detect(arr, function (cst) {
            return cst.name === id;
        });
        if (costume === null) {
            num = parseFloat(id);
            if (num === 0) {
                costume = null;
            } else {
                costume = arr[num - 1] || null;
            }
        }
    }
    this.wearCostume(costume);
};

// SpriteMorph sound management

SpriteMorph.prototype.addSound = function (audio, name) {
	this.sounds.add(new Sound(audio, name));
};

SpriteMorph.prototype.playSound = function (name) {
    var stage = this.parentThatIsA(StageMorph),
        sound = detect(
            this.sounds.asArray(),
            function (s) {return s.name === name; }
        ),
        active;
	if (sound) {
        active = sound.play();
        if (stage) {
            stage.activeSounds.push(active);
            stage.activeSounds = stage.activeSounds.filter(function (aud) {
                return !aud.ended && !aud.terminated;
            });
        }
        return active;
    }
};

// SpriteMorph user menu

SpriteMorph.prototype.userMenu = function () {
	var	menu = new MenuMorph(this);
	menu.addItem("duplicate", 'duplicate');
	menu.addItem("delete", 'remove');
	menu.addItem("edit", 'edit');
	return menu;
};

SpriteMorph.prototype.edit = function () {
    var ide = this.parentThatIsA(IDE_Morph);
    if (ide) {
        ide.selectSprite(this);
    }
};

SpriteMorph.prototype.showOnStage = function () {
    var stage = this.parentThatIsA(StageMorph);
    this.show();
    if (stage) {
        this.keepWithin(stage);
    }
};

SpriteMorph.prototype.duplicate = function () {
    var ide = this.parentThatIsA(IDE_Morph);
    if (ide) {
        ide.duplicateSprite(this);
    }
};

SpriteMorph.prototype.remove = function () {
    var ide = this.parentThatIsA(IDE_Morph);
    if (ide) {
        ide.removeSprite(this);
    }
};

// SpriteMorph primitives

// SpriteMorph pen color

SpriteMorph.prototype.getHue = function () {
    return this.color.hsv()[0] * 100;
};

SpriteMorph.prototype.setHue = function (num) {
    var hsv = this.color.hsv();
    hsv[0] = Math.max(Math.min(parseFloat(num), 100), 0) / 100;
    hsv[1] = 1; // we gotta fix this at some time
    this.color.set_hsv.apply(this.color, hsv);
    this.drawNew();
    this.changed();
};

SpriteMorph.prototype.changeHue = function (delta) {
    this.setHue(this.getHue() + parseFloat(delta));
};

SpriteMorph.prototype.getBrightness = function () {
    return this.color.hsv()[2] * 100;
};

SpriteMorph.prototype.setBrightness = function (num) {
    var hsv = this.color.hsv();
    hsv[1] = 1; // we gotta fix this at some time
    hsv[2] = Math.max(Math.min(parseFloat(num), 100), 0) / 100;
    this.color.set_hsv.apply(this.color, hsv);
    this.drawNew();
    this.changed();
};

SpriteMorph.prototype.changeBrightness = function (delta) {
    this.setBrightness(this.getBrightness() + parseFloat(delta));
};

// SpriteMorph layers

SpriteMorph.prototype.comeToFront = function () {
    if (this.parent) {
        this.parent.add(this);
        this.changed();
    }
};

SpriteMorph.prototype.goBack = function (layers) {
    var layer;

    if (!this.parent) {return null; }
    layer = this.parent.children.indexOf(this);
    if (layer < parseFloat(layers)) {return null; }
    this.parent.removeChild(this);
    this.parent.children.splice(layer - parseFloat(layers), null, this);
    this.parent.changed();
};

// SpriteMorph collision detection optimization

SpriteMorph.prototype.overlappingImage = function (otherSprite) {
    // overrides method from Morph because Sprites aren't nested Morphs
	var	oRect = this.bounds.intersect(otherSprite.bounds),
		oImg = newCanvas(oRect.extent()),
		ctx = oImg.getContext('2d');

    if (oRect.width() < 1 || oRect.height() < 1) {
        return newCanvas(new Point(1, 1));
    }
    ctx.drawImage(
        this.image,
        this.left() - oRect.left(),
        this.top() - oRect.top()
    );
    ctx.globalCompositeOperation = 'source-in';
	ctx.drawImage(
		otherSprite.image,
        otherSprite.left() - oRect.left(),
        otherSprite.top() - oRect.top()
	);
	return oImg;
};

// SpriteMorph stamping

SpriteMorph.prototype.doStamp = function () {
    var stage = this.parent,
        context = stage.penTrails().getContext('2d');
    context.drawImage(
        this.image,
        this.left() - stage.left(),
        this.top() - stage.top()
    );
    if (!this.isWarped) {
        this.changed();
    }
};

SpriteMorph.prototype.clear = function () {
    this.parent.clearPenTrails();
};

// SpriteMorph pen size

SpriteMorph.prototype.setSize = function (size) {
    // pen size
	this.size = Math.min(Math.max(parseFloat(size), 0.0001), 1000);
};

SpriteMorph.prototype.changeSize = function (delta) {
	this.setSize(this.size + parseFloat(delta));
};

// SpriteMorph scale

SpriteMorph.prototype.getScale = function () {
    // answer my scale in percent
    return this.scale * 100;
};

SpriteMorph.prototype.setScale = function (percentage) {
    // set my (absolute) scale in percent
    var x = this.xPosition(),
        y = this.yPosition();
    this.scale = Math.max(parseFloat(percentage / 100), 0.01);
    this.changed();
    this.drawNew();
    this.changed();
    this.silentGotoXY(x, y);
    this.positionTalkBubble();
};

SpriteMorph.prototype.changeScale = function (delta) {
    this.setScale(this.getScale() + parseFloat(delta));
};

// SpriteMorph graphic effects

SpriteMorph.prototype.setEffect = function (effect, value) {
    if (effect === 'ghost') {
        this.alpha = 1 -
            Math.min(Math.max(parseFloat(value), 0), 100) / 100;
        this.changed();
    }
};

SpriteMorph.prototype.getGhostEffect = function () {
    return (1 - this.alpha) * 100;
};

SpriteMorph.prototype.changeEffect = function (effect, value) {
    if (effect === 'ghost') {
        this.setEffect(effect, this.getGhostEffect() + parseFloat(value));
    }
};

SpriteMorph.prototype.clearEffects = function () {
    this.setEffect('ghost', 0);
};

// SpriteMorph talk bubble

SpriteMorph.prototype.stopTalking = function () {
    var bubble = this.talkBubble();
    if (bubble) {bubble.destroy(); }
};

SpriteMorph.prototype.doThink = function (data) {
    this.bubble(data, true);
};

SpriteMorph.prototype.bubble = function (data, isThought, isQuestion) {
    var bubble, contents, isText = false, width, img;
    this.stopTalking();

    if (data === '') {return null; }
	if (data instanceof Morph) {
		contents = data;
	} else if (isString(data)) {
        isText = true;
		contents = new TextMorph(
			data,
			this.bubbleFontSize,
			null, // fontStyle
			this.bubbleFontIsBold,
			false, // italic
			'center'
		);
	} else if (data instanceof HTMLCanvasElement) {
		contents = new Morph();
		contents.silentSetWidth(data.width);
		contents.silentSetHeight(data.height);
		contents.image = data;
	} else if (data instanceof List) {
        contents = new ListWatcherMorph(data);
        contents.isDraggable = false;
        contents.update(true);
        contents.step = contents.update;
    } else if (data instanceof Context) {
		img = data.image();
		contents = new Morph();
		contents.silentSetWidth(img.width);
		contents.silentSetHeight(img.height);
		contents.image = img;
    } else {
		contents = new TextMorph(
			data.toString(),
			this.bubbleFontSize,
			null, // fontStyle
			this.bubbleFontIsBold,
			false, // italic
			'center'
		);
	}
    if (contents instanceof TextMorph) {
        width = Math.max(contents.width(), this.bubbleCorner * 2);
        if (isText) {
            width = Math.min(width, this.bubbleMaxTextWidth);
        }
        contents.setWidth(width);
    }
    bubble = new SpeechBubbleMorph(
        contents,
        this.bubbleColor,
        this.bubbleCorner,
        this.bubbleBorder,
        isQuestion ? this.blockColor.sensing : this.bubbleBorderColor,
        this.bubbleCorner / 2, // padding
        isThought
    );
    bubble.fixLayout = function () { // allow resizing of shown lists
        bubble.changed();
        bubble.drawNew();
        bubble.changed();
    };
    this.add(bubble);
    this.positionTalkBubble();
};

SpriteMorph.prototype.talkBubble = function () {
    return detect(
        this.children,
        function (morph) {return morph instanceof SpeechBubbleMorph; }
    );
};

SpriteMorph.prototype.positionTalkBubble = function () {
    var stage = this.parentThatIsA(StageMorph),
        bubble = this.talkBubble(),
        middle = this.center().y;
    if (!bubble) {return null; }
    bubble.show();
    if (!bubble.isPointingRight) {
        bubble.isPointingRight = true;
        bubble.drawNew();
        bubble.changed();
    }
    bubble.setLeft(this.right());
    bubble.setBottom(this.top());
    while (!this.isTouching(bubble) && bubble.bottom() < middle) {
        bubble.silentMoveBy(new Point(-1, 1));
    }
    if (!stage) {return null; }
    if (bubble.right() > stage.right()) {
        bubble.isPointingRight = false;
        bubble.drawNew();
        bubble.setRight(this.center().x);
    }
    bubble.keepWithin(stage);
    bubble.changed();
};

// dragging and dropping adjustments b/c of talk bubbles

SpriteMorph.prototype.prepareToBeGrabbed = function (hand) {
    var bubble = this.talkBubble();
    if (!bubble) {return null; }
    this.removeShadow();
    bubble.hide();
    if (!this.bounds.containsPoint(hand.position())) {
        this.setCenter(hand.position());
    }
    this.addShadow();
};

SpriteMorph.prototype.justDropped = function () {
    this.positionTalkBubble();
};

// SpriteMorph motion

PenMorph.prototype.forward = function (steps) {
	var	start = this.rotationCenter(),
		dest,
		dist = parseFloat(steps);
	if (dist >= 0) {
		dest = this.position().distanceAngle(dist, this.heading);
	} else {
		dest = this.position().distanceAngle(
			Math.abs(dist),
			(this.heading - 180)
		);
	}
	this.setPosition(dest);
	this.drawLine(start, this.rotationCenter());
    this.positionTalkBubble();
};

SpriteMorph.prototype.setHeading = function (degrees) {
    var x = this.xPosition(),
        y = this.yPosition();
    this.changed();
    SpriteMorph.uber.setHeading.call(this, degrees);
    this.silentGotoXY(x, y);
    this.positionTalkBubble();
};

SpriteMorph.prototype.turnLeft = function (degrees) {
	this.setHeading(this.heading - parseFloat(degrees));
};

SpriteMorph.prototype.xPosition = function () {
	var stage = this.parentThatIsA(StageMorph);
	if (stage) {
		return this.rotationCenter().x - stage.center().x;
    }
    return this.rotationCenter().x;
};

SpriteMorph.prototype.yPosition = function () {
	var stage = this.parentThatIsA(StageMorph);
	if (stage) {
		return stage.center().y - this.rotationCenter().y;
	}
    return this.rotationCenter().y;
};

SpriteMorph.prototype.direction = function () {
	return this.heading;
};

SpriteMorph.prototype.penSize = function () {
	return this.size;
};

SpriteMorph.prototype.gotoXY = function (x, y) {
	var	stage = this.parentThatIsA(StageMorph),
		start = this.rotationCenter(),
		newX,
		newY,
		dest;

	if (stage) {
		newX = stage.center().x + parseFloat(x);
		newY = stage.center().y - parseFloat(y);
	} else {
		newX = parseFloat(x);
		newY = parseFloat(y);
	}
    if (this.costume) {
        dest = new Point(newX, newY).subtract(this.rotationOffset);
    } else {
        dest = new Point(newX, newY).subtract(this.extent().divideBy(2));
    }
	this.setPosition(dest);
	this.drawLine(start, this.rotationCenter());
    this.positionTalkBubble();
};

SpriteMorph.prototype.silentGotoXY = function (x, y) {
    // move without drawing
    var penState = this.isDown;
    this.isDown = false;
    this.gotoXY(x, y);
    this.isDown = penState;
};

SpriteMorph.prototype.setXPosition = function (num) {
    this.gotoXY(parseFloat(num), this.yPosition());
};

SpriteMorph.prototype.changeXPosition = function (delta) {
    this.setXPosition(this.xPosition() + parseFloat(delta));
};

SpriteMorph.prototype.setYPosition = function (num) {
    this.gotoXY(this.xPosition(), parseFloat(num));
};

SpriteMorph.prototype.changeYPosition = function (delta) {
    this.setYPosition(this.yPosition() + parseFloat(delta));
};

SpriteMorph.prototype.glide = function (
	duration,
	endX,
	endY,
	elapsed,
	startPoint
) {
	var fraction, endPoint, rPos;
	endPoint = new Point(endX, endY);
	fraction = Math.max(Math.min(elapsed / duration, 1), 0);
	rPos = startPoint.add(
		endPoint.subtract(startPoint).multiplyBy(fraction)
	);
	this.gotoXY(rPos.x, rPos.y);
};

SpriteMorph.prototype.bounceOffEdge = function () {
    var stage = this.parentThatIsA(StageMorph),
        dirX,
        dirY;

    if (!stage) {return null; }
    if (stage.bounds.containsRectangle(this.bounds)) {return null; }

    dirX = Math.cos(radians(this.heading));
    dirY = -(Math.sin(radians(this.heading)));

    if (this.left() < stage.left()) {
        dirX = Math.abs(dirX);
    }
    if (this.right() > stage.right()) {
        dirX = -(Math.abs(dirX));
    }
    if (this.top() < stage.top()) {
        dirY = -(Math.abs(dirY));
    }
    if (this.bottom() > stage.bottom()) {
        dirY = Math.abs(dirY);
    }

    this.setHeading(degrees(Math.atan2(-dirY, dirX)) + 90);
    this.setPosition(this.position().add(
        this.bounds.amountToTranslateWithin(stage.bounds)
    ));
    this.positionTalkBubble();
};

// SpriteMorph message broadcasting

SpriteMorph.prototype.allMessageNames = function () {
	var msgs = [];
	this.scripts.allChildren().forEach(function (morph) {
		var txt;
		if (morph.selector) {
			if (contains(
					['receiveMessage', 'doBroadcast', 'doBroadcastAndWait'],
					morph.selector
				)) {
				txt = morph.inputs()[0].evaluate();
				if (txt !== '') {
					if (!contains(msgs, txt)) {
						msgs.push(txt);
					}
				}
			}
		}
	});
	return msgs;
};

SpriteMorph.prototype.allHatBlocksFor = function (message) {
	return this.scripts.children.filter(function (morph) {
		if (morph.selector) {
			if (morph.selector === 'receiveMessage') {
				return morph.inputs()[0].evaluate() === message;
			}
            if (morph.selector === 'receiveGo') {
                return message === '__shout__go__';
            }
            if (morph.selector === 'receiveClick') {
                return message === '__click__';
            }
		}
		return false;
	});
};

SpriteMorph.prototype.allHatBlocksForKey = function (key) {
	return this.scripts.children.filter(function (morph) {
		if (morph.selector) {
			if (morph.selector === 'receiveKey') {
				return morph.inputs()[0].evaluate() === key;
			}
		}
		return false;
	});
};

// SpriteMorph events

SpriteMorph.prototype.mouseClickLeft = function () {
	var stage = this.parentThatIsA(StageMorph),
        hats = this.allHatBlocksFor('__click__'),
        procs = [];

    hats.forEach(function (block) {
        procs.push(stage.threads.startProcess(block, stage.isThreadSafe));
    });
    return procs;
};

// SpriteMorph timer

SpriteMorph.prototype.getTimer = function () {
	var stage = this.parentThatIsA(StageMorph);
	if (stage) {
		return stage.getTimer();
	}
	return 0;
};

// SpriteMorph user prompting

SpriteMorph.prototype.getLastAnswer = function () {
	return this.parentThatIsA(StageMorph).lastAnswer;
};

// SpriteMorph variable watchers (for palette checkbox toggling)

SpriteMorph.prototype.findVariableWatcher = function (varName) {
	var	stage = this.parentThatIsA(StageMorph),
		myself = this;
	if (stage === null) {
		return null;
	}
	return detect(
		stage.children,
		function (morph) {
			return morph instanceof WatcherMorph
                    && (morph.target === myself.variables
                            || morph.target === myself.variables.parentFrame)
                    && morph.getter === varName;
		}
	);
};

SpriteMorph.prototype.toggleVariableWatcher = function (varName, isGlobal) {
	var	stage = this.parentThatIsA(StageMorph),
		watcher,
		others;
	if (stage === null) {
		return null;
	}
	watcher = this.findVariableWatcher(varName);
	if (watcher !== null) {
		if (watcher.isVisible) {
			watcher.hide();
		} else {
			watcher.show();
			watcher.fixLayout(); // re-hide hidden parts
		}
		return;
	}

	// if no watcher exists, create a new one
	watcher = new WatcherMorph(
		varName,
		this.blockColor.variables,
		isGlobal ? this.variables.parentFrame : this.variables,
		varName
	);
	watcher.setPosition(stage.position().add(10));
	others = stage.watchers(watcher.left());
	if (others.length > 0) {
		watcher.setTop(others[others.length - 1].bottom());
	}
	stage.add(watcher);
	watcher.fixLayout();
};

SpriteMorph.prototype.showingVariableWatcher = function (varName) {
	var	stage = this.parentThatIsA(StageMorph),
		watcher;
	if (stage === null) {
		return false;
	}
	watcher = this.findVariableWatcher(varName);
	if (watcher) {
		return watcher.isVisible;
	}
	return false;
};

SpriteMorph.prototype.deleteVariableWatcher = function (varName) {
	var	stage = this.parentThatIsA(StageMorph),
		watcher;
	if (stage === null) {
		return null;
	}
	watcher = this.findVariableWatcher(varName);
	if (watcher !== null) {
		watcher.destroy();
	}
};

// SpriteMorph non-variable watchers

SpriteMorph.prototype.toggleWatcher = function (selector, label, color) {
	var	stage = this.parentThatIsA(StageMorph),
		watcher,
		others,
		myself = this;
	if (stage === null) {
		return null;
	}
	watcher = detect(
		stage.children,
		function (morph) {
			return morph instanceof WatcherMorph
				&& morph.target === myself
				&& morph.getter === selector;
		}
	);
	if (watcher !== null) {
		if (watcher.isVisible) {
			watcher.hide();
		} else {
			watcher.show();
			watcher.fixLayout(); // re-hide hidden parts
		}
		return;
	}

	// if no watcher exists, create a new one
	watcher = new WatcherMorph(
		label,
		color,
		this,
		selector
	);
	watcher.setPosition(stage.position().add(10));
	others = stage.watchers(watcher.left());
	if (others.length > 0) {
		watcher.setTop(others[others.length - 1].bottom());
	}
	stage.add(watcher);
	watcher.fixLayout();
};

SpriteMorph.prototype.showingWatcher = function (selector) {
	var	stage = this.parentThatIsA(StageMorph),
		watcher,
		myself = this;
	if (stage === null) {
		return false;
	}
	watcher = detect(
		stage.children,
		function (morph) {
			return morph instanceof WatcherMorph
				&& morph.target === myself
				&& morph.getter === selector;
		}
	);
	if (watcher) {
		return watcher.isVisible;
	}
	return false;
};

// SpriteMorph custom blocks

SpriteMorph.prototype.deleteAllBlockInstances = function (definition) {
    var idx = this.blocksCache.custom.indexOf(
        this.paletteBlockInstance(definition)
    );

	this.allBlockInstances(definition).forEach(function (each) {
		each.deleteBlock();
	});
	this.customBlocks.forEach(function (def) {
		if (def.body && def.body.expression.isCorpse) {
			def.body = null;
		}
	});
    if (idx > -1) {
        this.blocksCache.custom.splice(idx, 1);
    }
};

SpriteMorph.prototype.allBlockInstances = function (definition) {
	var inScripts, inDefinitions, inPalette, result;

	inScripts = this.scripts.allChildren().filter(function (c) {
		return c.definition && (c.definition === definition);
	});

	inDefinitions = [];
	this.customBlocks.forEach(function (def) {
		if (def.body) {
			def.body.expression.allChildren().forEach(function (c) {
				if (c.definition && (c.definition === definition)) {
					inDefinitions.push(c);
				}
			});
		}
	});

    inPalette = this.paletteBlockInstance(definition);

	result = inScripts.concat(inDefinitions);
    if (inPalette) {
        result.push(inPalette);
    }
    return result;
};

SpriteMorph.prototype.paletteBlockInstance = function (definition) {
    return detect(
        this.blocksCache.custom || [],
        function (block) {
            return block.definition === definition;
        }
    );
};

SpriteMorph.prototype.usesBlockInstance = function (definition) {
    var inDefinitions,
        inScripts = detect(
            this.scripts.allChildren(),
            function (c) {
                return c.definition && (c.definition === definition);
            }
        );

    if (inScripts) {return true; }

	inDefinitions = [];
	this.customBlocks.forEach(function (def) {
		if (def.body) {
			def.body.expression.allChildren().forEach(function (c) {
				if (c.definition && (c.definition === definition)) {
					inDefinitions.push(c);
				}
			});
		}
	});
    return (inDefinitions.length > 0);
};

// SpriteMorph thumbnail

SpriteMorph.prototype.thumbnail = function (extentPoint) {
/*
    answer a new Canvas of extentPoint dimensions containing
    my thumbnail representation keeping the originial aspect ratio
*/
    var src = this.image, // at this time sprites aren't composite morphs
        scale = Math.min(
            (extentPoint.x / src.width),
            (extentPoint.y / src.height)
        ),
        trg = newCanvas(extentPoint),
        ctx = trg.getContext('2d');

    ctx.scale(scale, scale);
    ctx.drawImage(
        src,
        0,
        0
    );
    return trg;
};

// StageMorph /////////////////////////////////////////////////////////

/*
	I inherit from FrameMorph and copy from SpriteMorph.
*/

// StageMorph inherits from FrameMorph:

StageMorph.prototype = new FrameMorph();
StageMorph.prototype.constructor = StageMorph;
StageMorph.uber = FrameMorph.prototype;

StageMorph.prototype.isCachingPrimitives
    = SpriteMorph.prototype.isCachingPrimitives;

StageMorph.prototype.sliderColor
    = SpriteMorph.prototype.sliderColor;

// StageMorph instance creation

function StageMorph(globals) {
	this.init(globals);
}

StageMorph.prototype.init = function (globals) {
    this.name = 'Stage';
	this.threads = new ThreadManager();
	this.variables = new VariableFrame(globals || null, this);
	this.scripts = new ScriptsMorph(this);
    this.customBlocks = [];
    this.costumes = new List();
    this.costume = null;
    this.sounds = new List();
    this.version = Date.now(); // for observers

	this.timerStart = Date.now();

	this.watcherUpdateFrequency = 2;
	this.lastWatcherUpdate = Date.now();

    this.keysPressed = {}; // for handling keyboard events, do not persist
    this.blocksCache = {}; // not to be serialized (!)
    this.lastAnswer = null; // last user input, do not persist
    this.activeSounds = []; // do not persist

    this.trailsCanvas = null;
    this.isThreadSafe = false;

	StageMorph.uber.init.call(this);

	this.acceptsDrops = false;
	this.setColor(new Color(255, 255, 255));
};

// StageMorph rendering

StageMorph.prototype.drawNew = function () {
    var ctx;
    StageMorph.uber.drawNew.call(this);
    if (this.costume) {
        ctx = this.image.getContext('2d');
        ctx.drawImage(
            this.costume.contents,
            (this.width() - this.costume.width()) / 2,
            (this.height() - this.costume.height()) / 2
        );
    }
};

StageMorph.prototype.drawOn = function (aCanvas, aRect) {
    // make sure to draw the pen trails canvas as well
	var rectangle, area, delta, src, context, w, h, sl, st;
	if (!this.isVisible) {
		return null;
	}
	rectangle = aRect || this.bounds();
	area = rectangle.intersect(this.bounds).round();
	if (area.extent().gt(new Point(0, 0))) {
		delta = this.position().neg();
		src = area.copy().translateBy(delta).round();
		context = aCanvas.getContext('2d');
		context.globalAlpha = this.alpha;

		sl = src.left();
		st = src.top();
		w = Math.min(src.width(), this.image.width - sl);
		h = Math.min(src.height(), this.image.height - st);

		if (w < 1 || h < 1) {
			return null;
		}
		context.drawImage(
			this.image,
			src.left(),
			src.top(),
			w,
			h,
			area.left(),
			area.top(),
			w,
			h
		);
		context.drawImage(
			this.penTrails(),
			src.left(),
			src.top(),
			w,
			h,
			area.left(),
			area.top(),
			w,
			h
		);
	}
};

StageMorph.prototype.clearPenTrails = function () {
    this.trailsCanvas = newCanvas(this.extent());
    this.changed();
};

StageMorph.prototype.penTrails = function () {
    if (!this.trailsCanvas) {
        this.trailsCanvas = newCanvas(this.extent());
    }
    return this.trailsCanvas;
};

// StageMorph accessing

StageMorph.prototype.watchers = function (leftPos) {
/*
	answer an array of all currently visible watchers.
	If leftPos is specified, filter the list for all
	shown or hidden watchers whose left side equals
	the given border (for automatic positioning)
*/
	return this.children.filter(function (morph) {
		if (morph instanceof WatcherMorph) {
			if (leftPos) {
				return morph.left() === leftPos;
			}
            return morph.isVisible;
		}
		return false;
	});
};

// StageMorph timer

StageMorph.prototype.resetTimer = function () {
	this.timerStart = Date.now();
};

StageMorph.prototype.getTimer = function () {
	var elapsed = Math.floor((Date.now() - this.timerStart) / 100);
	return elapsed / 10;
};

// StageMorph drag & drop

StageMorph.prototype.wantsDropOf = function (aMorph) {
	return aMorph instanceof SpriteMorph ||
		aMorph instanceof WatcherMorph ||
		aMorph instanceof ListWatcherMorph;
};

// StageMorph stepping

StageMorph.prototype.step = function () {
	var current, elapsed, leftover, world = this.world();

    // handle keyboard events
    if (world.keyboardReceiver === null) {
        world.keyboardReceiver = this;
    }
    if (world.currentKey === null) {
        this.keyPressed = null;
    }

    // manage threads
	this.threads.step();

    // update watchers
	current = Date.now();
	elapsed = current - this.lastWatcherUpdate;
	leftover = (1000 / this.watcherUpdateFrequency) - elapsed;
	if (leftover < 1) {
		this.watchers().forEach(function (w) {
			w.update();
		});
		this.lastWatcherUpdate = Date.now();
	}
};

StageMorph.prototype.developersMenu = function () {
	var	myself = this,
		menu = StageMorph.uber.developersMenu.call(this);
	menu.addItem(
		"stop",
		function () {
			myself.threads.stopAll();
		},
		'terminate all running threads'
	);
	return menu;
};

// StageMorph keyboard events

StageMorph.prototype.processKeyDown = function (event) {
    this.processKeyEvent(
        event,
        this.fireKeyEvent
    );
};

StageMorph.prototype.processKeyUp = function (event) {
    this.processKeyEvent(
        event,
        this.removePressedKey
    );
};

StageMorph.prototype.processKeyEvent = function (event, action) {
    var keyName;

	// this.inspectKeyEvent(event);
	switch (event.keyCode) {
	case 32:
		keyName = 'space';
		break;
	case 37:
		keyName = 'left arrow';
		break;
	case 39:
		keyName = 'right arrow';
		break;
	case 38:
		keyName = 'up arrow';
		break;
	case 40:
		keyName = 'down arrow';
		break;
	default:
        keyName = String.fromCharCode(event.keyCode || event.charCode);
	}
    action.call(this, keyName);
};

StageMorph.prototype.fireKeyEvent = function (key) {
	var evt = key.toLowerCase(),
        hats = [],
        procs = [],
        myself = this;

    this.keysPressed[key] = true;
    this.children.concat(this).forEach(function (morph) {
        if (morph instanceof SpriteMorph || morph instanceof StageMorph) {
            hats = hats.concat(morph.allHatBlocksForKey(evt));
        }
    });
    hats.forEach(function (block) {
        procs.push(myself.threads.startProcess(block, myself.isThreadSafe));
    });
    return procs;
};

StageMorph.prototype.removePressedKey = function (key) {
    delete this.keysPressed[key];
};

StageMorph.prototype.processKeyPress = function (event) {
    nop(event);
};

StageMorph.prototype.inspectKeyEvent
    = CursorMorph.prototype.inspectKeyEvent;

// StageMorph block templates

StageMorph.prototype.blockTemplates = function (category) {
	var blocks = [], myself = this, inputs, i, varNames, button,
        cat = category || 'motion', txt;

	function block(type, category, spec, selector, defaults) {
		var newBlock;

		if (type === 'reporter') {
			newBlock = new ReporterBlockMorph();
		} else if (type === 'predicate') {
			newBlock = new ReporterBlockMorph(true);
		} else if (type === 'hat') {
			newBlock = new HatBlockMorph();
		} else { // type === 'command'
			newBlock = new CommandBlockMorph();
		}
		newBlock.isDraggable = false;
		newBlock.isTemplate = true;
		newBlock.color = myself.blockColor[category];
		newBlock.selector = selector;
		newBlock.setSpec(spec);
		if (defaults) {
			newBlock.defaults = defaults;
			inputs = newBlock.inputs();
            if (inputs[0] instanceof MultiArgMorph) {
                inputs[0].setContents(defaults);
                inputs[0].defaults = defaults;
            } else {
                for (i = 0; i < defaults.length; i += 1) {
                    if (defaults[i] !== null) {
                        inputs[i].setContents(defaults[i]);
                    }
                }
            }
		}
		return newBlock;
	}

	function watcherToggle(category, label, selector) {
		return new ToggleMorph(
			'checkbox',
			this,
			function () {
				myself.toggleWatcher(
					selector,
					label,
					myself.blockColor[category]
				);
			},
			null,
			function () {
				return myself.showingWatcher(selector);
			},
			null
		);
	}

	function variableWatcherToggle(varName) {
		return new ToggleMorph(
			'checkbox',
			this,
			function () {
				myself.toggleVariableWatcher(varName);
			},
			null,
			function () {
				return myself.showingVariableWatcher(varName);
			},
			null
		);
	}

    if (cat === 'motion') {

        txt = new TextMorph(
            'Stage selected:\nno motion primitives'
        );
        txt.fontSize = 9;
        txt.setColor(new Color(230, 230, 230));
        blocks.push(txt);

    } else if (cat === 'looks') {

        blocks.push(block(
            'command',
            'looks',
            'switch to costume %cst',
            'doSwitchToCostume'
        ));

        blocks.push(block(
            'command',
            'looks',
            'next costume',
            'doWearNextCostume'
        ));

        blocks.push(watcherToggle(
            'looks',
            'costume #',
            'getCostumeIdx'
        ));
        blocks.push(block(
            'reporter',
            'looks',
            'costume #',
            'getCostumeIdx'
        ));

        blocks.push('-');

    // for debugging: ///////////////

        if (this.world().isDevMode) {

            blocks.push('-');

            txt = new TextMorph(
                'development mode \ndebugging primitives:'
            );
            txt.fontSize = 9;
            txt.setColor(new Color(230, 230, 230));
            blocks.push(txt);

            blocks.push('-');

            blocks.push(block(
                'command',
                'looks',
                'console log %mult%s',
                'log'
            ));

            blocks.push(block(
                'command',
                'looks',
                'alert %mult%s',
                'alert'
            ));
        }

    /////////////////////////////////

    } else if (cat === 'sound') {

        blocks.push(block(
            'command',
            'sound',
            'play sound %snd',
            'playSound'
        ));

        blocks.push(block(
            'command',
            'sound',
            'play sound %snd until done',
            'doPlaySoundUntilDone'
        ));

        blocks.push(block(
            'command',
            'sound',
            'stop all sounds',
            'doStopAllSounds'
        ));

    } else if (cat === 'pen') {

        blocks.push(block(
            'command',
            'pen',
            'clear',
            'clear'
        ));

    } else if (cat === 'control') {

        blocks.push(block(
            'hat',
            'control',
            'when %greenflag clicked',
            'receiveGo'
        ));
        blocks.push(block(
            'hat',
            'control',
            'when %key key pressed',
            'receiveKey'
        ));
        blocks.push(block(
            'hat',
            'control',
            'when I am clicked',
            'receiveClick'
        ));
        blocks.push(block(
            'hat',
            'control',
            'when I receive %msg',
            'receiveMessage'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'control',
            'broadcast %msg',
            'doBroadcast'
        ));
        blocks.push(block(
            'command',
            'control',
            'broadcast %msg and wait',
            'doBroadcastAndWait'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'control',
            'wait %n secs',
            'doWait',
            [1]
        ));
        blocks.push(block(
            'command',
            'control',
            'wait until %b',
            'doWaitUntil'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'control',
            'forever %c',
            'doForever'
        ));
        blocks.push(block(
            'command',
            'control',
            'repeat %n %c',
            'doRepeat',
            [10]
        ));
        blocks.push(block(
            'command',
            'control',
            'repeat until %b %c',
            'doUntil'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'control',
            'if %b %c',
            'doIf'
        ));
        blocks.push(block(
            'command',
            'control',
            'if %b %c else %c',
            'doIfElse'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'control',
            'stop block',
            'doReport'
        ));
        blocks.push(block(
            'command',
            'control',
            'stop script',
            'doStop'
        ));
        blocks.push(block(
            'command',
            'control',
            'stop all %stop',
            'doStopAll'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'control',
            'run %cmd %inputs',
            'doRun'
        ));
        blocks.push(block(
            'command',
            'control',
            'launch %cmd %inputs',
            'fork'
        ));
        blocks.push(block(
            'reporter',
            'control',
            'call %r %inputs',
            'evaluate'
        ));

        blocks.push('-');

    /* list variants commented out for now (redundant)

        blocks.push(block(
            'command',
            'control',
            'run %cmd with input list %l',
            'doRunWithInputList'
        ));
        blocks.push(block(
            'command',
            'control',
            'launch %cmd with input list %l',
            'forkWithInputList'
        ));
        blocks.push(block(
            'reporter',
            'control',
            'call %r  with input list %l',
            'evaluateWithInputList'
        ));

        blocks.push('-');
*/

        blocks.push(block(
            'command',
            'control',
            'run %cmd w/continuation',
            'doCallCC'
        ));
        blocks.push(block(
            'reporter',
            'control',
            'call %cmd w/continuation',
            'reportCallCC'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'control',
            'report %s',
            'doReport'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'other',
            'warp %c',
            'doWarp'
        ));

    } else if (cat === 'sensing') {

        blocks.push(block(
            'command',
            'sensing',
            'ask %s and wait',
            'doAsk',
            ['what\'s your name?']
        ));
        blocks.push(watcherToggle(
            'sensing',
            'answer',
            'getLastAnswer'
        ));
        blocks.push(block(
            'reporter',
            'sensing',
            'answer',
            'reportLastAnswer'
        ));

        blocks.push('-');
        blocks.push(block(
            'reporter',
            'sensing',
            'mouse x',
            'reportMouseX'
        ));
        blocks.push(block(
            'reporter',
            'sensing',
            'mouse y',
            'reportMouseY'
        ));
        blocks.push(block(
            'predicate',
            'sensing',
            'mouse down?',
            'reportMouseDown'
        ));

        blocks.push('-');

        blocks.push(block(
            'predicate',
            'sensing',
            'key %key pressed?',
            'reportKeyPressed'
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'sensing',
            'reset timer',
            'doResetTimer'
        ));
        blocks.push(watcherToggle(
            'sensing',
            'timer',
            'getTimer'
        ));
        blocks.push(block(
            'reporter',
            'sensing',
            'timer',
            'reportTimer'
        ));

    } else if (cat === 'operators') {

        blocks.push(block(
            'reporter',
            'operators',
            '%n + %n',
            'reportSum'
        ));
        blocks.push(block(
            'reporter',
            'operators',
            '%n - %n',
            'reportDifference'
        ));
        blocks.push(block(
            'reporter',
            'operators',
            '%n \u00D7 %n',
            'reportProduct'
        ));
        blocks.push(block(
            'reporter',
            'operators',
            '%n \u00F7 %n',
            'reportQuotient'
        ));

        blocks.push('-');

        blocks.push(block(
            'reporter',
            'operators',
            '%n mod %n',
            'reportModulus'
        ));
        blocks.push(block(
            'reporter',
            'operators',
            'round %n',
            'reportRound'
        ));
        blocks.push(block(
            'reporter',
            'operators',
            'pick random %n to %n',
            'reportRandom',
            [1, 10]
        ));

        blocks.push('-');

        blocks.push(block(
            'predicate',
            'operators',
            '%s < %s',
            'reportLessThan'
        ));
        blocks.push(block(
            'predicate',
            'operators',
            '%s = %s',
            'reportEquals'
        ));
        blocks.push(block(
            'predicate',
            'operators',
            '%s > %s',
            'reportGreaterThan'
        ));

        blocks.push('-');

        blocks.push(block(
            'predicate',
            'operators',
            '%b and %b',
            'reportAnd'
        ));
        blocks.push(block(
            'predicate',
            'operators',
            '%b or %b',
            'reportOr'
        ));
        blocks.push(block(
            'predicate',
            'operators',
            'not %b',
            'reportNot'
        ));

        blocks.push('-');

        blocks.push(block(
            'predicate',
            'operators',
            'true',
            'reportTrue'
        ));
        blocks.push(block(
            'predicate',
            'operators',
            'false',
            'reportFalse'
        ));

        blocks.push('-');

/*
        blocks.push(block(
            'reporter',
            'operators',
            'join %s %s',
            'reportJoin',
            ['hello ', 'world']
        ));
*/
        blocks.push(block(
            'reporter',
            'operators',
            'join %words',
            'reportJoinWords',
            ['hello ', 'world']
        ));
        blocks.push(block(
            'reporter',
            'operators',
            'letter %n of %s',
            'reportLetter',
            [1, 'world']
        ));
        blocks.push(block(
            'reporter',
            'operators',
            'length of %s',
            'reportStringSize',
            ['world']
        ));

        blocks.push('-');

        blocks.push(block(
            'reporter',
            'operators',
            'unicode of %s',
            'reportUnicode',
            ['a']
        ));
        blocks.push(block(
            'reporter',
            'operators',
            'unicode %n as letter',
            'reportUnicodeAsLetter',
            [65]
        ));

        blocks.push('-');

        blocks.push(block(
            'reporter',
            'operators',
            'the script %parms %c',
            'reportScript'
        ));

        blocks.push(block(
            'reporter',
            'operators',
            'the %f block %parms',
            'reify'
        ));

    } else if (cat === 'variables') {

        button = new PushButtonMorph(
            null,
            function () {
                new VariableDialogMorph(
                    null,
                    function (pair) {
                        if (pair) {
                            myself.addVariable(pair[0], pair[1]);
                            myself.toggleVariableWatcher(pair[0], pair[1]);
                            myself.blocksCache[cat] = null;
                            myself.parentThatIsA(IDE_Morph).refreshPalette();
                        }
                    },
                    myself
                ).prompt(
                    'Variable name',
                    null,
                    myself.world()
                );
            },
            'Make a variable'
        );
        blocks.push(button);

        if (this.variables.allNames().length > 0) {
            button = new PushButtonMorph(
                null,
                function () {
                    var menu = new MenuMorph(
                        myself.deleteVariable,
                        null,
                        myself
                    );
                    myself.variables.allNames().forEach(function (name) {
                        menu.addItem(name, name);
                    });
                    menu.popUpAtHand(myself.world());
                },
                'Delete a variable'
            );
            blocks.push(button);
        }

        blocks.push('-');

        varNames = this.variables.allNames();
        if (varNames.length > 0) {
            varNames.forEach(function (name) {
                blocks.push(variableWatcherToggle(name));
                blocks.push(block(
                    'reporter',
                    'variables',
                    name,
                    'reportGetVar'
                ));
            });
            blocks.push('-');
        }

        blocks.push(block(
            'command',
            'variables',
            'set %var to %s',
            'doSetVar',
            [null, 0]
        ));

        blocks.push(block(
            'command',
            'variables',
            'change %var by %n',
            'doChangeVar',
            [null, 1]
        ));

        blocks.push(block(
            'command',
            'variables',
            'show variable %var',
            'doShowVar'
        ));

        blocks.push(block(
            'command',
            'variables',
            'hide variable %var',
            'doHideVar'
        ));

        blocks.push(block(
            'command',
            'other',
            'script variables %scriptVars',
            'doDeclareVariables'
        ));

        blocks.push('=');

        blocks.push(block(
            'reporter',
            'lists',
            'list %mult%s',
            'reportNewList'
        ));

        blocks.push('-');

        blocks.push(block(
            'reporter',
            'lists',
            '%s in front of %l',
            'reportCONS'
        ));
        blocks.push(block(
            'reporter',
            'lists',
            'item %idx of %l',
            'reportListItem',
            [1]
        ));
        blocks.push(block(
            'reporter',
            'lists',
            'all but first of %l',
            'reportCDR'
        ));

        blocks.push('-');

        blocks.push(block(
            'reporter',
            'lists',
            'length of %l',
            'reportListLength'
        ));
        blocks.push(block(
            'predicate',
            'lists',
            '%l contains %s',
            'reportListContainsItem',
            [null, 'thing']
        ));

        blocks.push('-');

        blocks.push(block(
            'command',
            'lists',
            'add %s to %l',
            'doAddToList',
            ['thing']
        ));
        blocks.push(block(
            'command',
            'lists',
            'delete %ida of %l',
            'doDeleteFromList',
            [1]
        ));
        blocks.push(block(
            'command',
            'lists',
            'insert %s at %idx of %l',
            'doInsertInList',
            ['thing', 1]
        ));
        blocks.push(block(
            'command',
            'lists',
            'replace item %idx of %l with %s',
            'doReplaceInList',
            [1, null, 'thing']
        ));

        blocks.push('=');

        button = new PushButtonMorph(
            null,
            function () {
                var ide = myself.parentThatIsA(IDE_Morph);
                new BlockDialogMorph(
                    null,
                    function (definition) {
                        if (definition.spec !== '') {
                            myself.customBlocks.push(definition);
                            myself.cacheCustomBlock(definition);
                            ide.refreshPalette();
                            new BlockEditorMorph(definition, myself).popUp();
                        }
                    },
                    myself
                ).prompt(
                    'Make a block',
                    null,
                    myself.world()
                );
            },
            'Make a block'
        );
        blocks.push(button);
    }
    return blocks;
};

// StageMorph primitives

StageMorph.prototype.clear = function () {
    this.clearPenTrails();
};

// StageMorph user menu

StageMorph.prototype.userMenu = function () {
	var	menu = new MenuMorph(this);
	menu.addItem("edit", 'edit');
	return menu;
};

StageMorph.prototype.edit = SpriteMorph.prototype.edit;

// StageMorph pseudo-inherited behavior

StageMorph.prototype.categories = SpriteMorph.prototype.categories;
StageMorph.prototype.blockColor = SpriteMorph.prototype.blockColor;
StageMorph.prototype.paletteColor = SpriteMorph.prototype.paletteColor;
StageMorph.prototype.setName = SpriteMorph.prototype.setName;
StageMorph.prototype.palette = SpriteMorph.prototype.palette;
StageMorph.prototype.thumbnail = SpriteMorph.prototype.thumbnail;
StageMorph.prototype.showingWatcher = SpriteMorph.prototype.showingWatcher;
StageMorph.prototype.addVariable = SpriteMorph.prototype.addVariable;
StageMorph.prototype.deleteVariable = SpriteMorph.prototype.deleteVariable;

// StageMorph variable watchers (for palette checkbox toggling)

StageMorph.prototype.findVariableWatcher
    = SpriteMorph.prototype.findVariableWatcher;

StageMorph.prototype.toggleVariableWatcher
    = SpriteMorph.prototype.toggleVariableWatcher;

StageMorph.prototype.showingVariableWatcher
    = SpriteMorph.prototype.showingVariableWatcher;

StageMorph.prototype.deleteVariableWatcher
    = SpriteMorph.prototype.deleteVariableWatcher;

// StageMorph background management

StageMorph.prototype.addCostume
    = SpriteMorph.prototype.addCostume;

StageMorph.prototype.wearCostume
    = SpriteMorph.prototype.wearCostume;

StageMorph.prototype.getCostumeIdx
    = SpriteMorph.prototype.getCostumeIdx;

StageMorph.prototype.doWearNextCostume
    = SpriteMorph.prototype.doWearNextCostume;

StageMorph.prototype.doSwitchToCostume
    = SpriteMorph.prototype.doSwitchToCostume;

// StageMorph sound management

StageMorph.prototype.addSound
    = SpriteMorph.prototype.addSound;

StageMorph.prototype.playSound
    = SpriteMorph.prototype.playSound;

StageMorph.prototype.stopAllActiveSounds = function () {
    this.activeSounds.forEach(function (audio) {
        audio.pause();
    });
    this.activeSounds = [];
};

// StageMorph non-variable watchers

StageMorph.prototype.toggleWatcher
    = SpriteMorph.prototype.toggleWatcher;

StageMorph.prototype.showingWatcher
    = SpriteMorph.prototype.showingWatcher;

StageMorph.prototype.getLastAnswer
    = SpriteMorph.prototype.getLastAnswer;

// StageMorph message broadcasting

StageMorph.prototype.allMessageNames
    = SpriteMorph.prototype.allMessageNames;

StageMorph.prototype.allHatBlocksFor
    = SpriteMorph.prototype.allHatBlocksFor;

StageMorph.prototype.allHatBlocksForKey
    = SpriteMorph.prototype.allHatBlocksForKey;

// StageMorph events

StageMorph.prototype.mouseClickLeft
    = SpriteMorph.prototype.mouseClickLeft;

// StageMorph custom blocks

StageMorph.prototype.cacheCustomBlock
    = SpriteMorph.prototype.cacheCustomBlock;

StageMorph.prototype.cacheCustomBlocks
    = SpriteMorph.prototype.cacheCustomBlocks;

StageMorph.prototype.deleteAllBlockInstances
    = SpriteMorph.prototype.deleteAllBlockInstances;

StageMorph.prototype.allBlockInstances
    = SpriteMorph.prototype.allBlockInstances;

StageMorph.prototype.paletteBlockInstance
    = SpriteMorph.prototype.paletteBlockInstance;

StageMorph.prototype.usesBlockInstance
    = SpriteMorph.prototype.usesBlockInstance;

// Costume /////////////////////////////////////////////////////////////

/*
    I am a picture that's "wearable" by a sprite. My rotationCenter is
    relative to my contents position.
*/

// Costume instance creation

function Costume(canvas, name, rotationCenter) {
    this.contents = canvas || newCanvas();
    this.shrinkToFit(this.maxExtent);
    this.name = name || null;
    this.rotationCenter = rotationCenter || this.center();
    this.version = Date.now(); // for observer optimization
}

Costume.prototype.maxExtent = new Point(480, 360);

Costume.prototype.toString = function () {
    return 'a Costume(' + this.name + ')';
};

// Costume dimensions - all relative

Costume.prototype.extent = function () {
    return new Point(this.contents.width, this.contents.height);
};

Costume.prototype.center = function () {
    return this.extent().divideBy(2);
};

Costume.prototype.width = function () {
    return this.contents.width;
};

Costume.prototype.height = function () {
    return this.contents.height;
};

Costume.prototype.bounds = function () {
    return new Rectangle(0, 0, this.width(), this.height());
};

// Costume actions

Costume.prototype.edit = function (aWorld) {
    var editor = new CostumeEditorMorph(this),
        action,
        dialog,
        txt;

    action = function () {editor.accept(); };
    dialog = new DialogBoxMorph(this, action);
    txt = new TextMorph(
		'click or drag crosshairs to move the rotation center',
		dialog.fontSize,
		dialog.fontStyle,
		true,
		false,
		'center'
	);

	dialog.labelString = 'Costume Editor';
	dialog.createLabel();
	dialog.setPicture(editor);
    dialog.addBody(txt);
    dialog.addButton('ok', 'Ok');
	dialog.addButton('cancel', 'Cancel');
    dialog.fixLayout();
	dialog.drawNew();
	dialog.fixLayout();
	if (aWorld) {
		aWorld.add(dialog);
		aWorld.keyboardReceiver = dialog;
		dialog.setCenter(aWorld.center());
	}
};

// Costume thumbnail

Costume.prototype.shrinkToFit = function (extentPoint) {
    if (extentPoint.x < this.width() || (extentPoint.y < this.height())) {
        this.contents = this.thumbnail(extentPoint);
    }
};

Costume.prototype.thumbnail = function (extentPoint) {
/*
    answer a new Canvas of extentPoint dimensions containing
    my thumbnail representation keeping the originial aspect ratio
*/
    var src = this.contents, // at this time sprites aren't composite morphs
        scale = Math.min(
            (extentPoint.x / src.width),
            (extentPoint.y / src.height)
        ),
        trg = newCanvas(extentPoint),
        ctx = trg.getContext('2d');

    ctx.scale(scale, scale);
    ctx.drawImage(
        src,
        0,
        0
    );
    return trg;
};

// CostumeEditorMorph ////////////////////////////////////////////////////////

// CostumeEditorMorph inherits from Morph:

CostumeEditorMorph.prototype = new Morph();
CostumeEditorMorph.prototype.constructor = CostumeEditorMorph;
CostumeEditorMorph.uber = Morph.prototype;

// CostumeEditorMorph preferences settings:
CostumeEditorMorph.prototype.size = Costume.prototype.maxExtent;

// CostumeEditorMorph instance creation

function CostumeEditorMorph(costume) {
    this.init(costume);
}

CostumeEditorMorph.prototype.init = function (costume) {
    this.costume = costume || new Costume();
    this.rotationCenter = this.costume.rotationCenter.copy();
    this.margin = new Point(0, 0);
	CostumeEditorMorph.uber.init.call(this);
    this.noticesTransparentClick = true;
};

// CostumeEditorMorph edit ops

CostumeEditorMorph.prototype.accept = function () {
    this.costume.rotationCenter = this.rotationCenter.copy();
    this.costume.version = Date.now();
};

// CostumeEditorMorph displaying

CostumeEditorMorph.prototype.drawNew = function () {
    var rp, ctx;

    this.margin = this.size.subtract(this.costume.extent()).divideBy(2);
    rp = this.rotationCenter.add(this.margin);

    this.silentSetExtent(this.size);

    this.image = newCanvas(this.extent());

    // draw the background
    if (!this.cachedTexture) {
        this.cachedTexture = this.createTexture();

    }
    this.drawCachedTexture();

/*
    pattern = ctx.createPattern(this.background, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, this.size.x, this.size.y);
*/

    ctx = this.image.getContext('2d');

    // draw the costume
    ctx.drawImage(this.costume.contents, this.margin.x, this.margin.y);

    // draw crosshairs:
    ctx.globalAlpha = 0.5;

    // circle around center:
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(
        rp.x,
        rp.y,
        20,
        radians(0),
        radians(360),
        false
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(
        rp.x,
        rp.y,
        10,
        radians(0),
        radians(360),
        false
    );
    ctx.stroke();

    // horizontal line:
    ctx.beginPath();
    ctx.moveTo(0, rp.y);
    ctx.lineTo(this.costume.width() + this.margin.x * 2, rp.y);
    ctx.stroke();

    // vertical line:
    ctx.beginPath();
    ctx.moveTo(rp.x, 0);
    ctx.lineTo(rp.x, this.costume.height() + this.margin.y * 2);
    ctx.stroke();
};

CostumeEditorMorph.prototype.createTexture = function () {
    var size = 5,
        texture = newCanvas(new Point(size * 2, size * 2)),
        ctx = texture.getContext('2d'),
        grey = new Color(230, 230, 230);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size * 2, size * 2);
    ctx.fillStyle = grey.toString();
    ctx.fillRect(0, 0, size, size);
    ctx.fillRect(size, size, size, size);
    return texture;
};


// CostumeEditorMorph events

CostumeEditorMorph.prototype.mouseDownLeft = function (pos) {
    this.rotationCenter = pos.subtract(
        this.position().add(this.margin)
    );
    this.drawNew();
    this.changed();
};

CostumeEditorMorph.prototype.mouseMove
    = CostumeEditorMorph.prototype.mouseDownLeft;

// Sound /////////////////////////////////////////////////////////////

// Sound instance creation

function Sound(audio, name) {
	this.audio = audio; // mandatory
	this.name = name || "Sound";
}

Sound.prototype.play = function () {
    // return an instance of an audio element which can be terminated
    // externally (i.e. by the stage)
	var aud = document.createElement('audio');
	aud.src = this.audio.src;
	aud.play();
	return aud;
};

Sound.prototype.toDataURL = function () {
	return this.audio.src;
};

// CellMorph //////////////////////////////////////////////////////////

/*
	I am a spreadsheet style cell that can display either a string,
	a Morph, a Canvas or a toString() representation of anything else.
	I can be used in variable watchers or list view element cells.
*/

// CellMorph inherits from BoxMorph:

CellMorph.prototype = new BoxMorph();
CellMorph.prototype.constructor = CellMorph;
CellMorph.uber = BoxMorph.prototype;

// CellMorph instance creation:

function CellMorph(contents, color) {
	this.init(contents, color);
}

CellMorph.prototype.init = function (contents, color) {
	this.contents = (contents === 0 ? 0 : contents || '');
	CellMorph.uber.init.call(
		this,
		SyntaxElementMorph.prototype.corner,
		1.000001, // shadow bug in Chrome,
		new Color(255, 255, 255)
	);
	this.color = color || new Color(255, 140, 0);
	this.isBig = false;
	this.drawNew();
};

// CellMorph accessing:

CellMorph.prototype.big = function () {
	this.isBig = true;
	this.changed();
	this.drawNew();
	this.changed();
};

CellMorph.prototype.normal = function () {
	this.isBig = false;
	this.changed();
	this.drawNew();
	this.changed();
};

// CellMorph layout:

CellMorph.prototype.fixLayout = function () {
	var listwatcher;
	this.changed();
	this.drawNew();
	this.changed();
	if (this.parent && this.parent.fixLayout) { // variable watcher
		this.parent.fixLayout();
	} else {
		listwatcher = this.parentThatIsA(ListWatcherMorph);
		if (listwatcher) {
			listwatcher.fixLayout();
		}
	}
};

// CellMorph drawing:

CellMorph.prototype.drawNew = function () {
	var	context,
		img,
		fontSize = SyntaxElementMorph.prototype.fontSize,
		isSameList = this.contentsMorph instanceof ListWatcherMorph
				&& (this.contentsMorph.list === this.contents);

	if (this.isBig) {
		fontSize = fontSize * 1.5;
	}

	// re-build my contents
	if (this.contentsMorph && !isSameList) {
		this.contentsMorph.destroy();
	}

	if (!isSameList) {
		if (this.contents instanceof Morph) {
			this.contentsMorph = this.contents;
		} else if (isString(this.contents)) {
			this.contentsMorph = new TextMorph(
				this.contents,
				fontSize,
				null,
				true,
				false,
				'center'
			);
			this.contentsMorph.setColor(new Color(255, 255, 255));
		} else if (this.contents instanceof HTMLCanvasElement) {
			this.contentsMorph = new Morph();
			this.contentsMorph.silentSetWidth(this.contents.width);
			this.contentsMorph.silentSetHeight(this.contents.height);
			this.contentsMorph.image = this.contents;
		} else if (this.contents instanceof Context) {
			img = this.contents.image();
			this.contentsMorph = new Morph();
			this.contentsMorph.silentSetWidth(img.width);
			this.contentsMorph.silentSetHeight(img.height);
			this.contentsMorph.image = img;
		} else if (this.contents instanceof List) {
			this.contentsMorph = new ListWatcherMorph(this.contents);
			this.contentsMorph.isDraggable = false;
		} else {
			this.contentsMorph = new TextMorph(
				this.contents ? this.contents.toString() : '',
				fontSize,
				null,
				true,
				false,
				'center'
			);
			this.contentsMorph.setColor(new Color(255, 255, 255));
		}
		this.add(this.contentsMorph);
	}

	// adjust my layout
	this.silentSetHeight(this.contentsMorph.height()
		+ this.edge
		+ this.border * 2);
	this.silentSetWidth(Math.max(
		this.contentsMorph.width() + this.edge * 2,
		(this.contents instanceof Context ||
			this.contents instanceof List ? 0 : this.height() * 2)
	));

	// draw my outline
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	if ((this.edge === 0) && (this.border === 0)) {
		BoxMorph.uber.drawNew.call(this);
		return null;
	}
	context.fillStyle = this.color.toString();
	context.beginPath();
	this.outlinePath(
		context,
		Math.max(this.edge - this.border, 0),
		this.border
	);
	context.closePath();
	context.fill();
	if (this.border > 0) {
		context.lineWidth = this.border;
		context.strokeStyle = this.borderColor.toString();
		context.beginPath();
		this.outlinePath(context, this.edge, this.border / 2);
		context.closePath();
		context.stroke();

		if (useBlurredShadows) {
			context.shadowOffsetX = this.border;
			context.shadowOffsetY = this.border;
			context.shadowBlur = this.border;
			context.shadowColor = this.color.darker(80).toString();
			this.drawShadow(context, this.edge, this.border / 2);
		}
	}

	// position my contents
	this.contentsMorph.setCenter(this.center());
};

CellMorph.prototype.drawShadow = function (context, radius, inset) {
	var	offset = radius + inset,
		w = this.width(),
		h = this.height();

	// bottom left:
	context.beginPath();
	context.moveTo(0, h - offset);
	context.lineTo(0, offset);
	context.stroke();

	// top left:
	context.beginPath();
	context.arc(
		offset,
		offset,
		radius,
		radians(-180),
		radians(-90),
		false
	);
	context.stroke();

	// top right:
	context.beginPath();
	context.moveTo(offset, 0);
	context.lineTo(w - offset, 0);
	context.stroke();
};

// WatcherMorph //////////////////////////////////////////////////////////

/*
	I am a little window which observes some value and continuously
	updates itself accordingly.
    
    My target can be either a SpriteMorph or a VariableFrame.
*/

// WatcherMorph inherits from BoxMorph:

WatcherMorph.prototype = new BoxMorph();
WatcherMorph.prototype.constructor = WatcherMorph;
WatcherMorph.uber = BoxMorph.prototype;

// WatcherMorph instance creation:

function WatcherMorph(label, color, target, getter, isHidden) {
	this.init(label, color, target, getter, isHidden);
}

WatcherMorph.prototype.init = function (
    label,
    color,
    target,
    getter,
    isHidden
) {
    // additional properties
	this.labelText = label || '';
    this.version = null;
    this.objName = '';

    // initialize inherited properties
	WatcherMorph.uber.init.call(
		this,
		SyntaxElementMorph.prototype.rounding,
		1.000001, // shadow bug in Chrome,
		new Color(120, 120, 120)
	);

    // override inherited behavior
	this.color = new Color(220, 220, 220);
	this.readoutColor = color;
	this.style = 'normal';
	this.target = target || null; // target obj (Sprite) or VariableFrame
	this.getter = getter || null; // callback or variable name (string)
	this.currentValue = null;
	this.labelMorph = null;
	this.sliderMorph = null;
	this.cellMorph = null;
	this.isDraggable = true;
    if (isHidden) { // for de-serializing
        this.isVisible = false;
    } else {
        this.fixLayout();
        this.update();
    }
};

// WatcherMorph accessing:

WatcherMorph.prototype.isTemporary = function () {
	if (this.target instanceof VariableFrame) {
		return this.target.owner === null;
	}
	return false;
};

WatcherMorph.prototype.object = function () {
    // answer the actual sprite I refer to
    return this.target instanceof VariableFrame ?
            this.target.owner : this.target;
};

// WatcherMorph updating:

WatcherMorph.prototype.update = function () {
	var newValue,
		num;
	if (this.target && this.getter) {
        this.updateLabel();
		if (this.target instanceof VariableFrame) {
			newValue = this.target.vars[this.getter];
		} else {
			newValue = this.target[this.getter].call(this.target);
		}
		if (newValue !== this.currentValue) {
			this.changed();
			this.cellMorph.contents = newValue;
			this.cellMorph.drawNew();
			num = parseFloat(newValue);
			if (!isNaN(num)) {
				this.sliderMorph.value = num;
				this.sliderMorph.drawNew();
			}
			this.fixLayout();
			this.currentValue = newValue;
		}
	}
	if (this.cellMorph.contentsMorph instanceof ListWatcherMorph) {
		this.cellMorph.contentsMorph.update();
	}
};

WatcherMorph.prototype.updateLabel = function () {
    // check whether the target object's name has been changed
    var obj = this.object();

    if (!obj) {return null; }
    if (obj.version !== this.version) {
        this.objName = (obj.name || '') + ' ';
        if (this.labelMorph) {
            this.labelMorph.destroy();
            this.labelMorph = null;
            this.fixLayout();
        }
    }
};

// WatcherMorph layout:

WatcherMorph.prototype.fixLayout = function () {
	var	fontSize = SyntaxElementMorph.prototype.fontSize, isList,
		myself = this;

	this.changed();

	// create my parts
	if (this.labelMorph === null) {
		this.labelMorph = new StringMorph(
			this.objName + this.labelText,
			fontSize,
			null,
			true,
			false,
			false,
			new Point(1, 1),
			new Color(255, 255, 255)
		);
		this.add(this.labelMorph);
	}
	if (this.cellMorph === null) {
		this.cellMorph = new CellMorph('', this.readoutColor);
		this.add(this.cellMorph);
	}
	if (this.sliderMorph === null) {
		this.sliderMorph = new SliderMorph(
			0,
			100,
			0,
			20,
			'horizontal'
		);
		this.sliderMorph.alpha = 1;
		this.sliderMorph.button.color = this.color.darker();
		this.sliderMorph.color = this.color.lighter(60);
		this.sliderMorph.button.highlightColor = this.color.darker();
		this.sliderMorph.button.highlightColor.b += 50;
		this.sliderMorph.button.pressColor = this.color.darker();
		this.sliderMorph.button.pressColor.b += 100;
		this.sliderMorph.setHeight(fontSize);
		this.sliderMorph.action = function (num) {
			myself.target.vars[myself.getter] = Math.round(num);
		};
		this.add(this.sliderMorph);
	}

	// adjust my layout
	isList = this.cellMorph.contents instanceof List;
	if (isList) { this.style = 'normal'; }

	if (this.style === 'large') {
		this.labelMorph.hide();
		this.sliderMorph.hide();
		this.cellMorph.big();
		this.cellMorph.setPosition(this.position());
		this.setExtent(this.cellMorph.extent().subtract(1));
		return;
	}

	this.labelMorph.show();
	this.sliderMorph.show();
	this.cellMorph.normal();
	this.labelMorph.setPosition(this.position().add(new Point(
		this.edge,
		this.border + SyntaxElementMorph.prototype.typeInPadding
	)));

	if (isList) {
		this.cellMorph.setPosition(this.labelMorph.bottomLeft().add(
			new Point(0, SyntaxElementMorph.prototype.typeInPadding)
		));
	} else {
		this.cellMorph.setPosition(this.labelMorph.topRight().add(new Point(
			fontSize / 3,
			0
		)));
		this.labelMorph.setTop(
			this.cellMorph.top()
				+ (this.cellMorph.height() - this.labelMorph.height()) / 2
		);
	}

	if (this.style === 'slider') {
		this.sliderMorph.silentSetPosition(new Point(
			this.labelMorph.left(),
			this.cellMorph.bottom()
				+ SyntaxElementMorph.prototype.typeInPadding
		));
		this.sliderMorph.setWidth(this.cellMorph.right()
			- this.labelMorph.left());
		this.silentSetHeight(
			this.cellMorph.height()
				+ this.sliderMorph.height()
				+ this.border * 2
				+ SyntaxElementMorph.prototype.typeInPadding * 3
		);
	} else {
		this.sliderMorph.hide();
		this.bounds.corner.y = this.cellMorph.bottom()
			+ this.border
			+ SyntaxElementMorph.prototype.typeInPadding;
	}
	this.bounds.corner.x = Math.max(
		this.cellMorph.right(),
		this.labelMorph.right()
	) + this.edge
		+ SyntaxElementMorph.prototype.typeInPadding;
	this.drawNew();
	this.changed();
};

// WatcherMorph events:

WatcherMorph.prototype.mouseClickLeft = function () {
	if (this.style === 'normal') {
		if (this.target instanceof VariableFrame) {
			this.style = 'slider';
		} else {
			this.style = 'large';
		}
	} else if (this.style === 'slider') {
		this.style = 'large';
	} else {
		this.style = 'normal';
	}
	this.fixLayout();
};

// WatcherMorph user menu:

WatcherMorph.prototype.userMenu = function () {
	var	menu = new MenuMorph(this),
        on = '\u25CF',
        off = '\u25CB';
	menu.addItem(
        (this.style === 'normal' ? on : off) + ' normal',
        'styleNormal'
    );
	menu.addItem(
        (this.style === 'large' ? on : off) + ' large',
        'styleLarge'
    );
	if (this.target instanceof VariableFrame) {
        menu.addItem(
            (this.style === 'slider' ? on : off) + ' slider',
            'styleSlider'
        );
    }
	return menu;
};

WatcherMorph.prototype.setStyle = function (style) {
    this.style = style;
    this.fixLayout();
};

WatcherMorph.prototype.styleNormal = function () {
    this.setStyle('normal');
};

WatcherMorph.prototype.styleLarge = function () {
    this.setStyle('large');
};

WatcherMorph.prototype.styleSlider = function () {
    this.setStyle('slider');
};

// WatcherMorph drawing:

WatcherMorph.prototype.drawNew = function () {
	var	context,
		gradient;
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	if ((this.edge === 0) && (this.border === 0)) {
		BoxMorph.uber.drawNew.call(this);
		return null;
	}
	gradient = context.createLinearGradient(0, 0, 0, this.height());
	gradient.addColorStop(0, this.color.lighter().toString());
	gradient.addColorStop(1, this.color.darker().toString());
	context.fillStyle = gradient;
	context.beginPath();
	this.outlinePath(
		context,
		Math.max(this.edge - this.border, 0),
		this.border
	);
	context.closePath();
	context.fill();
	if (this.border > 0) {
		gradient = context.createLinearGradient(0, 0, 0, this.height());
		gradient.addColorStop(0, this.borderColor.lighter().toString());
		gradient.addColorStop(1, this.borderColor.darker().toString());
		context.lineWidth = this.border;
		context.strokeStyle = gradient;
		context.beginPath();
		this.outlinePath(context, this.edge, this.border / 2);
		context.closePath();
		context.stroke();
	}
};

// StagePrompterMorph ////////////////////////////////////////////////////////

/*
    I am a sensor-category-colored input box at the bottom of the stage
    which lets the user answer to a question. If I am opened from within
    the context of a sprite, my question can be anything that is displayable
    in a SpeechBubble and will be, if I am opened from within the stage
    my question will be shown as a single line of text within my label morph.
*/

// StagePrompterMorph inherits from BoxMorph:

StagePrompterMorph.prototype = new BoxMorph();
StagePrompterMorph.prototype.constructor = StagePrompterMorph;
StagePrompterMorph.uber = BoxMorph.prototype;

// StagePrompterMorph instance creation:

function StagePrompterMorph(question) {
	this.init(question);
}

StagePrompterMorph.prototype.init = function (question) {
    // question is optional in case the Stage is asking
    var myself = this;

    // additional properties
    this.isDone = false;
    if (question) {
        this.label = new StringMorph(
            question,
            SpriteMorph.prototype.bubbleFontSize,
            null, // fontStyle
            SpriteMorph.prototype.bubbleFontIsBold,
            false, // italic
            'left'
        );
    } else {
        this.label = null;
    }
    this.inputField = new InputFieldMorph();
    this.button = new PushButtonMorph(
        null,
        function () {myself.accept(); },
        '\u2713'
    );

    // initialize inherited properties
	StagePrompterMorph.uber.init.call(
		this,
		SyntaxElementMorph.prototype.rounding,
        SpriteMorph.prototype.bubbleBorder,
		SpriteMorph.prototype.blockColor.sensing
	);

    // override inherited behavior
	this.color = new Color(255, 255, 255);
    if (this.label) {this.add(this.label); }
    this.add(this.inputField);
    this.add(this.button);
    this.setWidth(480 - 20);
    this.fixLayout();
};

// StagePrompterMorph layout:

StagePrompterMorph.prototype.fixLayout = function () {
    var y = 0;

    if (this.label) {
        this.label.setPosition(new Point(
            this.left() + this.edge,
            this.top() + this.edge
        ));
        y = this.label.bottom() - this.top();
    }
    this.inputField.setPosition(new Point(
        this.left() + this.edge,
        this.top() + y + this.edge
    ));
    this.inputField.setWidth(
        this.width()
            - this.edge * 2
            - this.button.width()
            - this.border
    );
    this.button.setCenter(this.inputField.center());
    this.button.setLeft(this.inputField.right() + this.border);
    this.setHeight(
        this.inputField.bottom()
            - this.top()
            + this.edge
    );
};

// StagePrompterMorph events:

StagePrompterMorph.prototype.mouseClickLeft = function () {
    this.inputField.edit();
};

StagePrompterMorph.prototype.accept = function () {
    this.isDone = true;
};

