/*

	gui.js

	a programming environment
	based on morphic.js, blocks.js, threads.js and objects.js
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
	needs blocks.js, threads.js, objects.js and morphic.js


	toc
	---
	the following list shows the order in which all constructors are
	defined. Use this list to locate code in this document:

        IDE_Morph
        SpriteIconMorph
        CostumeIconMorph
        WardrobeMorph


    credits
    -------
    Nathan Dinsmore contributed saving and loading of projects
    Ian Reynolds contributed handling and visualization of sounds

*/

/*global modules, Morph, SpriteMorph, BoxMorph, SyntaxElementMorph, Color,
ListWatcherMorph, isString, TextMorph, newCanvas, useBlurredShadows,
radians, VariableFrame, StringMorph, Point, SliderMorph, MenuMorph,
morphicVersion, DialogBoxMorph, ToggleButtonMorph, contains,
ScrollFrameMorph, StageMorph, PushButtonMorph, InputFieldMorph, FrameMorph,
Process, nop, XMLSerializer, ListMorph, detect, AlignmentMorph, TabMorph,
Costume, CostumeEditorMorph, MorphicPreferences, touchScreenSettings,
standardSettings, Sound*/

// Global stuff ////////////////////////////////////////////////////////

modules.gui = '2012-Apr-17';

// Declarations

var IDE_Morph;
var SpriteIconMorph;
var CostumeIconMorph;
var WardrobeMorph;
var SoundIconMorph;
var JukeboxMorph;

// IDE_Morph ///////////////////////////////////////////////////////////

// I am SNAP's top-level frame, the Editor window

// IDE_Morph inherits from Morph:

IDE_Morph.prototype = new Morph();
IDE_Morph.prototype.constructor = IDE_Morph;
IDE_Morph.uber = Morph.prototype;

// IDE_Morph preferences settings

IDE_Morph.prototype.buttonContrast = 30;
IDE_Morph.prototype.frameColor = SpriteMorph.prototype.paletteColor;
IDE_Morph.prototype.groupColor
    = SpriteMorph.prototype.paletteColor.lighter(8);
IDE_Morph.prototype.sliderColor = SpriteMorph.prototype.sliderColor;

// IDE_Morph instance creation:

function IDE_Morph(isAutoFill) {
	this.init(isAutoFill);
}

IDE_Morph.prototype.init = function (isAutoFill) {
	// additional properties:
    this.globalVariables = new VariableFrame();
    this.currentSprite = new SpriteMorph(this.globalVariables);
    this.currentCategory = 'motion';
    this.currentTab = 'scripts';
    this.projectName = '';
    this.projectNotes = '';

    this.logo = null;
    this.controlBar = null;
    this.categories = null;
    this.palette = null;
    this.spriteBar = null;
    this.spriteEditor = null;
    this.stage = null;
    this.corralBar = null;
    this.corral = null;

	this.isAutoFill = isAutoFill || true;

	// initialize inherited properties:
	IDE_Morph.uber.init.call(this);

	// override inherited properites:
    this.color = new Color(40, 40, 40);
};

IDE_Morph.prototype.openIn = function (world) {
    var hash;

    this.buildPanes();
    world.add(this);
    world.userMenu = this.userMenu;

    // prevent non-DialogBoxMorphs from being dropped
    // onto the World in user-mode
    world.reactToDropOf = function (morph) {
        if (!(morph instanceof DialogBoxMorph)) {
            world.hand.grab(morph);
        }
    };

    this.reactToWorldResize(world.bounds);

    if (location.hash.substr(0, 6) === '#open:') {
        hash = location.hash.substr(6);
        if (hash.charAt(0) === '%'
                || hash.search(/\%(?:[0-9a-f]{2})/i) > -1) {
            hash = decodeURIComponent(hash);
        }
        this.openProjectString(hash);
    }
};

// IDE_Morph construction

IDE_Morph.prototype.buildPanes = function () {
    this.createLogo();
    this.createControlBar();
    this.createCategories();
    this.createPalette();
    this.createStage();
    this.createSpriteBar();
    this.createSpriteEditor();
    this.createCorralBar();
    this.createCorral();
};

IDE_Morph.prototype.createLogo = function () {
    var myself = this;

    if (this.logo) {
        this.logo.destroy();
    }

	this.logo = new Morph();
	this.logo.texture = 'snap_logo_sm.gif';

	this.logo.drawNew = function () {
		this.image = newCanvas(this.extent());
		var	context = this.image.getContext('2d'),
			gradient = context.createLinearGradient(
				0,
				0,
				this.width(),
				0
			);
		gradient.addColorStop(0, 'black');
		gradient.addColorStop(0.8, myself.frameColor.toString());
		context.fillStyle = gradient;
		context.fillRect(0, 0, this.width(), this.height());
		if (this.texture) {
			this.drawTexture(this.texture);
		}
	};

	this.logo.drawCachedTexture = function () {
		var context = this.image.getContext('2d');
		context.drawImage(
			this.cachedTexture,
			5,
			Math.round((this.height() - this.cachedTexture.height) / 2)
		);
		this.changed();
	};

	this.logo.mouseClickLeft = function () {
        myself.snapMenu();
	};

	this.logo.color = new Color();
	this.logo.setExtent(new Point(200, 28)); // dimensions are fixed
    this.add(this.logo);
};

IDE_Morph.prototype.createControlBar = function () {
    // assumes the logo has already been created
    var padding = 5,
        button,
        stopButton,
        startButton,
        projectButton,
        settingsButton,
        x,
        colors = [
            this.groupColor,
            this.frameColor.darker(50),
            this.frameColor.darker(50)
        ],
        myself = this;

    if (this.controlBar) {
        this.controlBar.destroy();
    }

    this.controlBar = new Morph();
    this.controlBar.color = this.frameColor;
    this.controlBar.setHeight(this.logo.height()); // height is fixed
    this.add(this.controlBar);

    // stopButton
    button = new PushButtonMorph(
        this,
        'stopAllScripts',
        '  \u2B23  '
    );
    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.fontSize = 18;
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = new Color(200, 0, 0);
    button.contrast = this.buttonContrast;
    button.drawNew();
    button.hint = 'stop\nevery-\nthing';
    button.fixLayout();
    this.controlBar.add(stopButton = button);

    // startButton
    button = new PushButtonMorph(
        this,
        'runScripts',
        '   \u2691   '
    );
    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.fontSize = 18;
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = new Color(0, 200, 0);
    button.contrast = this.buttonContrast;
    button.drawNew();
    button.hint = 'start green\nflag scripts';
    button.fixLayout();
    this.controlBar.add(startButton = button);

    // projectButton
    button = new PushButtonMorph(
        this,
        'projectMenu',
        '  \u270E  '
    );
    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.fontSize = 18;
    button.padding = 0;
    button.labelShadowOffset = null;
    button.labelShadowColor = null;
    button.labelColor = new Color(255, 255, 255);
    button.contrast = this.buttonContrast;
    button.drawNew();
    button.hint = 'open, save, & annotate project';
    button.fixLayout();
    this.controlBar.add(projectButton = button);
    this.controlBar.projectButton = projectButton; // for menu positioning

    // settingsButton
    button = new PushButtonMorph(
        this,
        'settingsMenu',
        '  \u2699  '
    );
    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.fontSize = 18;
    button.padding = 0;
    button.labelShadowOffset = null;
    button.labelShadowColor = null;
    button.labelColor = new Color(255, 255, 255);
    button.contrast = this.buttonContrast;
    button.drawNew();
    button.hint = 'edit settings';
    button.fixLayout();
    this.controlBar.add(settingsButton = button);
    this.controlBar.settingsButton = settingsButton; // for menu positioning

    this.controlBar.fixLayout = function () {
        x = this.right() - padding;
        projectButton.setCenter(myself.controlBar.center());
        projectButton.setLeft(this.left() + padding);
        [stopButton, startButton].forEach(function (button) {
            button.setCenter(myself.controlBar.center());
            button.setRight(x);
            x -= button.width();
            x -= padding;
        });
        settingsButton.setCenter(myself.controlBar.center());
        settingsButton.setLeft(this.projectButton.right() + padding);
        this.updateLabel();
    };

    this.controlBar.updateLabel = function () {
        var suffix = myself.world().isDevMode ?
                ' - development mode' : '';

        if (this.label) {
            this.label.destroy();
        }

		this.label = new StringMorph(
			(myself.projectName || 'untitled') + suffix,
			14,
			'sans-serif',
			true,
			false,
			false,
			new Point(2, 1),
			myself.frameColor.darker(myself.buttonContrast)
		);
		this.label.color = new Color(255, 255, 255);
		this.label.drawNew();
		this.add(this.label);
        this.label.setCenter(this.center());
        this.label.setLeft(this.settingsButton.right() + padding);
	};
};

IDE_Morph.prototype.createCategories = function () {
    // assumes the logo has already been created
    var myself = this;

    if (this.categories) {
        this.categories.destroy();
    }

    this.categories = new Morph();
    this.categories.color = this.groupColor;
    this.categories.silentSetWidth(this.logo.width()); // width is fixed

    function addCategoryButton(category) {
        var labelWidth = 75,
            colors = [
                myself.frameColor,
                myself.frameColor.darker(50),
                SpriteMorph.prototype.blockColor[category]
            ],
            button;

        button = new ToggleButtonMorph(
            colors,
            myself, // the IDE is the target
            function () {
                myself.currentCategory = category;
                myself.categories.children.forEach(function (each) {
                    each.refresh();
                });
                myself.refreshPalette(true);
            },
            category[0].toUpperCase().concat(category.slice(1)), // label
            function () {  // query
                return myself.currentCategory === category;
            },
            null, // env
            null, // hint
            null, // template cache
            labelWidth, // minWidth
            true // has preview
        );

        button.corner = 8;
        button.padding = 0;
        button.labelShadowOffset = new Point(-1, -1);
        button.labelShadowColor = colors[1];
        button.labelColor = new Color(255, 255, 255);
        button.fixLayout();
        button.refresh();
        myself.categories.add(button);
        return button;
    }

    function fixCategoriesLayout() {
        var buttonWidth = myself.categories.children[0].width(),
            buttonHeight = myself.categories.children[0].height(),
            border = 3,
            rows =  Math.ceil((myself.categories.children.length) / 2),
            xPadding = (myself.categories.width()
                - border
                - buttonWidth * 2) / 3,
            yPadding = 2,
            l = myself.categories.left(),
            t = myself.categories.top(),
            i = 0,
            row,
            col;

        myself.categories.children.forEach(function (button) {
            i += 1;
            row = Math.ceil(i / 2);
            col = 2 - (i % 2);
            button.setPosition(new Point(
                l + (col * xPadding + ((col - 1) * buttonWidth)),
                t + (row * yPadding + ((row - 1) * buttonHeight) + border)
            ));
        });

        myself.categories.setHeight(
            (rows + 1) * yPadding
                + rows * buttonHeight
                + 2 * border
        );
    }

    SpriteMorph.prototype.categories.forEach(function (cat) {
        if (!contains(['lists', 'other'], cat)) {
            addCategoryButton(cat);
        }
    });
    fixCategoriesLayout();
    this.add(this.categories);
};

IDE_Morph.prototype.createPalette = function () {
    // assumes that the logo pane has already been created
    // needs the categories pane for layout
    var myself = this;

    if (this.palette) {
        this.palette.destroy();
    }

    this.palette = this.currentSprite.palette(this.currentCategory);
	this.palette.isDraggable = false;
	this.palette.acceptsDrops = true;
	this.palette.contents.acceptsDrops = false;

	this.palette.reactToDropOf = function (droppedMorph) {
		if (droppedMorph instanceof DialogBoxMorph) {
			myself.world().add(droppedMorph);
		} else if (droppedMorph instanceof SpriteMorph) {
            myself.removeSprite(droppedMorph);
        } else {
			droppedMorph.destroy();
		}
	};

    this.palette.setWidth(this.logo.width());
	this.add(this.palette);
	this.palette.scrollX(this.palette.padding);
	this.palette.scrollY(this.palette.padding);
};

IDE_Morph.prototype.createStage = function () {
    // assumes that the logo panehas already been created
    if (this.stage) {
        this.stage.destroy();
    }

	this.stage = new StageMorph(this.globalVariables);
	this.stage.setExtent(new Point(480, 360)); // dimensions are fixed
    if (this.currentSprite instanceof SpriteMorph) {
        this.currentSprite.setPosition(
            this.stage.center().subtract(
                this.currentSprite.extent().divideBy(2)
            )
        );
        this.stage.add(this.currentSprite);
    }
	this.add(this.stage);
};

IDE_Morph.prototype.createSpriteBar = function () {
    // assumes that the categories pane has already been created
    var thumbSize = new Point(45, 45),
        nameField,
        thumbnail,
        tabCorner = 15,
        tabColors,
        tabBar = new AlignmentMorph('row', -tabCorner * 2),
        tab,
        myself = this;

    if (this.spriteBar) {
        this.spriteBar.destroy();
    }

	this.spriteBar = new Morph();
    this.spriteBar.color = this.frameColor;
	this.add(this.spriteBar);

    thumbnail = new Morph();
    thumbnail.setExtent(thumbSize);
    thumbnail.image = this.currentSprite.thumbnail(thumbSize);
    thumbnail.setPosition(this.spriteBar.position().add(5));
    this.spriteBar.add(thumbnail);

    thumbnail.fps = 3;

    thumbnail.step = function () {
        if (thumbnail.version !== myself.currentSprite.version) {
            thumbnail.image = myself.currentSprite.thumbnail(thumbSize);
            thumbnail.changed();
            thumbnail.version = myself.currentSprite.version;
        }
    };

    nameField = new InputFieldMorph(this.currentSprite.name);
	nameField.setWidth(100); // fixed dimensions
    nameField.contrast = 90;
    nameField.setPosition(thumbnail.topRight().add(10));
    this.spriteBar.add(nameField);
    nameField.drawNew();
    nameField.accept = function () {
        myself.currentSprite.setName(nameField.getValue());
    };

    // tab bar
    tabColors = [
        myself.groupColor.darker(40),
        myself.groupColor.darker(60),
        myself.groupColor
    ];

    tabBar.tabTo = function (tabString) {
        var active;
        myself.currentTab = tabString;
        this.children.forEach(function (each) {
            each.refresh();
            if (each.state) {active = each; }
        });
        active.refresh(); // needed when programmatically tabbing
        myself.createSpriteEditor();
        myself.fixLayout('tabEditor');
    };

    tab = new TabMorph(
        tabColors,
        null, // target
        function () {tabBar.tabTo('scripts'); },
        'Scripts', // label
        function () {  // query
            return myself.currentTab === 'scripts';
        }
    );
    tab.padding = 3;
    tab.corner = tabCorner;
    tab.edge = 1;
    tab.labelShadowOffset = new Point(-1, -1);
    tab.labelShadowColor = tabColors[1];
    tab.labelColor = new Color(255, 255, 255);
    tab.drawNew();
    tab.fixLayout();
    tabBar.add(tab);

    tab = new TabMorph(
        tabColors,
        null, // target
        function () {tabBar.tabTo('costumes'); },
        'Costumes', // label
        function () {  // query
            return myself.currentTab === 'costumes';
        }
    );
    tab.padding = 3;
    tab.corner = tabCorner;
    tab.edge = 1;
    tab.labelShadowOffset = new Point(-1, -1);
    tab.labelShadowColor = tabColors[1];
    tab.labelColor = new Color(255, 255, 255);
    tab.drawNew();
    tab.fixLayout();
    tabBar.add(tab);

    tab = new TabMorph(
        tabColors,
        null, // target
        function () {tabBar.tabTo('sounds'); },
        'Sounds', // label
        function () {  // query
            return myself.currentTab === 'sounds';
        }
    );
    tab.padding = 3;
    tab.corner = tabCorner;
    tab.edge = 1;
    tab.labelShadowOffset = new Point(-1, -1);
    tab.labelShadowColor = tabColors[1];
    tab.labelColor = new Color(255, 255, 255);
    tab.drawNew();
    tab.fixLayout();
    tabBar.add(tab);

    tabBar.fixLayout();
    tabBar.children.forEach(function (each) {
        each.refresh();
    });

    this.spriteBar.add(this.spriteBar.tabBar = tabBar);

    this.spriteBar.fixLayout = function () {
        this.tabBar.setLeft(this.left());
        this.tabBar.setBottom(this.bottom());
    };
};

IDE_Morph.prototype.createSpriteEditor = function () {
    // assumes that the logo pane and the stage have already been created
    var scripts = this.currentSprite.scripts,
        myself = this;

    if (this.spriteEditor) {
        this.spriteEditor.destroy();
    }

    if (this.currentTab === 'scripts') {
        scripts.isDraggable = false;
        scripts.color = this.groupColor;
        scripts.texture = 'scriptsPaneTexture.gif';

        this.spriteEditor = new ScrollFrameMorph(
            scripts,
            null,
            this.sliderColor
        );
        this.spriteEditor.padding = 5;
        this.spriteEditor.isDraggable = false;
        this.spriteEditor.acceptsDrops = false;
        this.spriteEditor.contents.acceptsDrops = true;

        scripts.scrollFrame = this.spriteEditor;
        this.add(this.spriteEditor);
        this.spriteEditor.scrollX(this.spriteEditor.padding);
        this.spriteEditor.scrollY(this.spriteEditor.padding);
    } else if (this.currentTab === 'costumes') {
        this.spriteEditor = new WardrobeMorph(
            this.currentSprite,
            this.sliderColor
        );
        this.spriteEditor.color = this.groupColor;
        this.add(this.spriteEditor);
        this.spriteEditor.updateSelection();

        this.spriteEditor.acceptsDrops = false;
        this.spriteEditor.contents.acceptsDrops = false;
    } else if (this.currentTab === 'sounds') {
        this.spriteEditor = new JukeboxMorph(
            this.currentSprite,
            this.sliderColor
        );
        this.spriteEditor.color = this.groupColor;
        this.add(this.spriteEditor);
        this.spriteEditor.updateSelection();
        this.spriteEditor.acceptDrops = false;
        this.spriteEditor.contents.acceptsDrops = false;
    } else {
        this.spriteEditor = new Morph();
        this.spriteEditor.color = this.groupColor;
        this.spriteEditor.acceptsDrops = true;
        this.spriteEditor.reactToDropOf = function (droppedMorph) {
            if (droppedMorph instanceof DialogBoxMorph) {
                myself.world().add(droppedMorph);
            } else if (droppedMorph instanceof SpriteMorph) {
                myself.removeSprite(droppedMorph);
            } else {
                droppedMorph.destroy();
            }
        };
        this.add(this.spriteEditor);
    }
};

IDE_Morph.prototype.createCorralBar = function () {
    // assumes the stage has already been created
    var padding = 5,
        button,
        colors = [
            this.groupColor,
            this.frameColor.darker(50),
            this.frameColor.darker(50)
        ];

    if (this.corralBar) {
        this.corralBar.destroy();
    }

    this.corralBar = new Morph();
    this.corralBar.color = this.frameColor;
    this.corralBar.setHeight(this.logo.height()); // height is fixed
    this.add(this.corralBar);

    // new sprite button
    button = new PushButtonMorph(
        this,
        'addNewSprite',
        '  +  '
    );
    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.fontSize = 18;
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = new Color(255, 255, 255);
    button.contrast = this.buttonContrast;
    button.drawNew();
    button.hint = 'add a new Sprite';
    button.fixLayout();
    button.setCenter(this.corralBar.center());
    button.setLeft(this.corralBar.left() + padding);
    this.corralBar.add(button);

};

IDE_Morph.prototype.createCorral = function () {
    // assumes the corral bar has already been created
    var frame, template, padding = 5;

    if (this.corral) {
        this.corral.destroy();
    }

    this.corral = new Morph();
    this.corral.color = this.groupColor;
    this.add(this.corral);

    this.corral.stageIcon = new SpriteIconMorph(this.stage);
    this.corral.add(this.corral.stageIcon);

    frame = new ScrollFrameMorph(null, null, this.sliderColor);
    frame.acceptsDrops = false;
    frame.contents.acceptsDrops = false;
    frame.alpha = 0;

    this.stage.children.forEach(function (morph) {
        if (morph instanceof SpriteMorph) {
            frame.contents.add(
                template = new SpriteIconMorph(morph, template)
            );
        }
    });

    this.corral.frame = frame;
    this.corral.add(frame);

    this.corral.fixLayout = function () {
        this.stageIcon.setCenter(this.center());
        this.stageIcon.setLeft(this.left() + padding);
        this.frame.setLeft(this.stageIcon.right() + padding);
        this.frame.setExtent(new Point(
            this.right() - this.frame.left(),
            this.height()
        ));
        this.arrangeIcons();
        this.refresh();
    };

    this.corral.arrangeIcons = function () {
        var x = this.frame.left(),
            y = this.frame.top(),
            max = this.frame.right(),
            start = this.frame.left();

        this.frame.contents.children.forEach(function (icon) {
            var w = icon.width();

            if (x + w > max) {
                x = start;
                y += icon.height(); // they're all the same
            }
            icon.setPosition(new Point(x, y));
            x += w;
        });
        this.frame.contents.adjustBounds();
    };

    this.corral.addSprite = function (sprite) {
        this.frame.contents.add(new SpriteIconMorph(sprite));
        this.fixLayout();
    };

    this.corral.refresh = function () {
        this.stageIcon.refresh();
        this.frame.contents.children.forEach(function (icon) {
            icon.refresh();
        });
    };
};

// IDE_Morph layout

IDE_Morph.prototype.fixLayout = function (situation) {
    // situation is a string, i.e. 
    // 'selectSprite' or 'refreshPalette' or 'tabEditor'
    var padding = 5;

	Morph.prototype.trackChanges = false;

    if (situation !== 'refreshPalette') {
        // controlBar
        this.controlBar.setPosition(this.logo.topRight());
        this.controlBar.setWidth(this.right() - this.controlBar.left());
        this.controlBar.fixLayout();

        // categories
        this.categories.setLeft(this.logo.left());
        this.categories.setTop(this.logo.bottom());
    }

    // palette
    this.palette.setLeft(this.logo.left());
    this.palette.setTop(this.categories.bottom());
    this.palette.setHeight(this.bottom() - this.palette.top());

    if (situation !== 'refreshPalette') {
        // stage
        this.stage.setTop(this.logo.bottom() + padding);
        this.stage.setRight(this.right());

        // spriteBar
        this.spriteBar.setPosition(this.logo.bottomRight().add(padding));
        this.spriteBar.setExtent(new Point(
            Math.max(0, this.stage.left() - padding - this.spriteBar.left()),
            this.categories.bottom() - this.spriteBar.top() - padding
        ));
        this.spriteBar.fixLayout();

        // spriteEditor
        this.spriteEditor.setPosition(this.spriteBar.bottomLeft());
        this.spriteEditor.setExtent(new Point(
            this.spriteBar.width(),
            this.bottom() - this.spriteEditor.top()
        ));

        // corralBar
        this.corralBar.setLeft(this.stage.left());
        this.corralBar.setTop(this.stage.bottom() + padding);
        this.corralBar.setWidth(this.stage.width());

        // corral
        if (!contains(['selectSprite', 'tabEditor'], situation)) {
            this.corral.setPosition(this.corralBar.bottomLeft());
            this.corral.setWidth(this.stage.width());
            this.corral.setHeight(this.bottom() - this.corral.top());
            this.corral.fixLayout();
        }
    }

	Morph.prototype.trackChanges = true;
	this.changed();
};

IDE_Morph.prototype.setProjectName = function (string) {
    this.projectName = string;
    this.controlBar.updateLabel();
};

// IDE_Morph resizing

IDE_Morph.prototype.setExtent = function (point) {
    var ext = point.max(new Point(910, 490)); // minimum ext making sense
    IDE_Morph.uber.setExtent.call(this, ext);
    this.fixLayout();
};

// IDE_Morph events

IDE_Morph.prototype.reactToWorldResize = function (rect) {
    if (this.isAutoFill) {
        this.setPosition(rect.origin);
        this.setExtent(rect.extent());
    }
};

IDE_Morph.prototype.droppedImage = function (aCanvas, name) {
    var costume = new Costume(aCanvas, name);
    this.currentSprite.addCostume(costume);
    this.currentSprite.wearCostume(costume);
    this.spriteBar.tabBar.tabTo('costumes');
};

IDE_Morph.prototype.droppedAudio = function (anAudio, name) {
    this.currentSprite.addSound(anAudio, name);
    this.spriteBar.tabBar.tabTo('sounds');
};

// IDE_Morph button actions

IDE_Morph.prototype.refreshPalette = function (shouldIgnorePosition) {
    var oldTop = this.palette.contents.top();

    this.createPalette();
    this.fixLayout('refreshPalette');
    if (!shouldIgnorePosition) {
        this.palette.contents.setTop(oldTop);
    }
};

IDE_Morph.prototype.runScripts = function () {
	var procs = [],
        hats = [],
        myself = this;

    this.stage.children.concat(this.stage).forEach(function (morph) {
        if (morph instanceof SpriteMorph || morph instanceof StageMorph) {
            hats = hats.concat(morph.allHatBlocksFor('__shout__go__'));
        }
    });
    hats.forEach(function (block) {
        procs.push(myself.stage.threads.startProcess(
            block,
            myself.stage.isThreadSafe
        ));
    });
    return procs;
};

IDE_Morph.prototype.stopAllScripts = function () {
    this.stage.keysPressed = {};
    this.stage.threads.stopAll();
    this.stage.stopAllActiveSounds();
    this.stage.children.forEach(function (morph) {
        if (morph.stopTalking) {
            morph.stopTalking();
        }
    });
};

IDE_Morph.prototype.selectSprite = function (sprite) {
    this.currentSprite = sprite;
    this.createPalette();
    this.createSpriteBar();
    this.createSpriteEditor();
    this.corral.refresh();
    this.fixLayout('selectSprite');
};

IDE_Morph.prototype.addNewSprite = function () {
    var sprite = new SpriteMorph(this.globalVariables),
        rnd = Process.prototype.reportRandom;

    sprite.name = sprite.name
        + (this.corral.frame.contents.children.length + 1);
    sprite.setCenter(this.stage.center());
    this.stage.add(sprite);

    // randomize sprite properties
    sprite.setHue(rnd.call(this, 0, 100));
    sprite.setBrightness(rnd.call(this, 50, 100));
    sprite.turn(rnd.call(this, 1, 360));
    sprite.setXPosition(rnd.call(this, -220, 220));
    sprite.setYPosition(rnd.call(this, -160, 160));

    this.corral.addSprite(sprite);
    this.selectSprite(sprite);
};

IDE_Morph.prototype.duplicateSprite = function (sprite) {
    var duplicate = sprite.fullCopy();

    duplicate.name = sprite.name + '(2)';
    duplicate.setPosition(this.world().hand.position());
    this.stage.add(duplicate);
    duplicate.keepWithin(this.stage);
    this.corral.addSprite(duplicate);
    this.selectSprite(duplicate);
};

IDE_Morph.prototype.removeSprite = function (sprite) {
    sprite.destroy();
    this.stage.watchers().forEach(function (watcher) {
        if (watcher.object() === sprite) {
            watcher.destroy();
        }
    });
    this.currentSprite = detect(
        this.stage.children,
        function (morph) {return morph instanceof SpriteMorph; }
    ) || this.stage;

    this.createCorral();
    this.fixLayout();
    this.selectSprite(this.currentSprite);
};

// IDE_Morph menus

IDE_Morph.prototype.userMenu = function () {
    var menu = new MenuMorph(this);
    menu.addItem('help', 'nop');
    return menu;
};

IDE_Morph.prototype.snapMenu = function () {
    var menu,
        world = this.world();

    menu = new MenuMorph(this);
    menu.addItem('About...', 'aboutSnap');
    menu.addLine();
    menu.addItem(
        'Snap! website',
        function () {
            window.open('http://snap.berkeley.edu/', 'SnapWebsite');
        }
    );
    if (world.isDevMode) {
        menu.addLine();
        menu.addItem(
            'Switch back to user mode',
            'switchToUserMode',
            'disable deep-Morphic\ncontext menus'
                + '\nand show user-friendly ones',
            new Color(0, 100, 0)
        );
    } else if (world.currentKey === 16) { // shift-click
        menu.addLine();
        menu.addItem(
            'Switch to dev mode',
            'switchToDevMode',
            'enable deep-Morphic\ncontext menus\nand inspectors'
                + '\n\nCaution:\nNot user-friendly!',
            new Color(100, 0, 0)
        );
    }
    menu.popup(world, this.logo.bottomLeft());
};

IDE_Morph.prototype.settingsMenu = function () {
    var menu,
        stage = this.stage,
        world = this.world(),
        pos = this.controlBar.settingsButton.bottomLeft();

    menu = new MenuMorph(this);
	if (MorphicPreferences === standardSettings) {
        menu.addItem(
            '\u2610 Touchscreen settings',
            function () {world.togglePreferences(); },
            'check to enable\nnumber input via sliders'
        );
	} else {
        menu.addItem(
            '\u2611 Touchscreen settings',
            function () {world.togglePreferences(); },
            'uncheck to disable\nnumber input via sliders'
        );
	}

	if (this.stage.isThreadSafe) {
        menu.addItem(
            '\u2611 Thread safe scripts',
            function () {stage.isThreadSafe = false; },
            'uncheck to allow\nscript reentrancy'
        );
	} else {
        menu.addItem(
            '\u2610 Thread safe scripts',
            function () {stage.isThreadSafe = true; },
            'check to disallow\nscript reentrancy'
        );
	}

    menu.popup(world, pos);
};

IDE_Morph.prototype.projectMenu = function () {
    var menu,
        myself = this,
        world = this.world(),
        pos = this.controlBar.projectButton.bottomLeft();

    menu = new MenuMorph(this);
    menu.addItem('Project Notes...', 'editProjectNotes');
    menu.addLine();
    menu.addItem(
        'New',
        function () {
            myself.confirm(
                'Replace the current project with a new one?',
                'New Project',
                function () {
                    myself.newProject();
                }
            );
        }
    );
    menu.addItem('Open...', 'openProjectBrowser');
    menu.addItem(
        'Save',
        function () {
            if (myself.projectName) {
                myself.saveProject(myself.projectName);
            } else {
                myself.prompt('Save Project As...', function (name) {
                    myself.saveProject(name);
                });
            }
        }
    );
    menu.addItem(
        'Save As...',
        function () {
            myself.prompt(
                'Save Project As...',
                function (name) {
                    myself.saveProject(name);
                }
            );
        }
    );
    menu.popup(world, pos);
};

// IDE_Morph menu actions

IDE_Morph.prototype.aboutSnap = function () {
    var dlg, aboutTxt, creditsTxt, versions = '',
        module, btn1, btn2, btn3, btn4,
        world = this.world();

    aboutTxt = 'Snap!\nBuild Your Own Blocks\n\n--- alpha ---\n\n'
        + 'Copyright \u24B8 2012 Brian Harvey and '
        + 'Jens M\u00F6nig\n'
        + 'bh@cs.berkeley.edu, jens@moenig.org\n'
        + 'All rights reserved\n\n'
        + ' Snap! is developed by the University of California,'
        + ' Berkeley \n'
        + 'with support from the National Science Foundation.\n'

        + 'The design of Snap! is influenced and inspired by Scratch,\n'
        + 'from the Lifelong Kindergarten group at the MIT Media Lab\n\n'

        + 'for more information see http://snap.berkeley.edu\n'
        + 'and http://scratch.mit.edu';

    creditsTxt = 'Contributors'
        + '\n\nNathan Dinsmore\nSaving/Loading, Snap-Logo Design,'
        + '\ncountless bugfixes'
        + '\n\nIan Reynolds\nUI Design, Event Bindings,'
        + '\nSound primitives'
        + '\n\nIvan Motyashov\nInitial Squeak Porting'
        + '\n\nJoe Otto\nMorphic Testing and Debugging';

    for (module in modules) {
        if (modules.hasOwnProperty(module)) {
            versions += ('\n' + module + ' (' +
                            modules[module] + ')');
        }
    }
    if (versions !== '') {
        versions = 'current module versions:\n\n' +
            'morphic (' + morphicVersion + ')' +
            versions;
    }

    dlg = new DialogBoxMorph();
    dlg.inform('About Snap', aboutTxt, world);
    btn1 = dlg.buttons.children[0];
    btn2 = dlg.addButton(
        function () {
            dlg.body.text = aboutTxt;
            dlg.body.drawNew();
            btn1.show();
            btn2.hide();
            btn3.show();
            btn4.show();
            dlg.fixLayout();
            dlg.drawNew();
            dlg.setCenter(world.center());
        },
        'Back\u2026'
    );
    btn2.hide();
    btn3 = dlg.addButton(
        function () {
            dlg.body.text = versions;
            dlg.body.drawNew();
            btn1.show();
            btn2.show();
            btn3.hide();
            btn4.hide();
            dlg.fixLayout();
            dlg.drawNew();
            dlg.setCenter(world.center());
        },
        'Modules\u2026'
    );
    btn4 = dlg.addButton(
        function () {
            dlg.body.text = creditsTxt;
            dlg.body.drawNew();
            btn1.show();
            btn2.show();
            btn3.hide();
            btn4.hide();
            dlg.fixLayout();
            dlg.drawNew();
            dlg.setCenter(world.center());
        },
        'Contributors\u2026'
    );
    dlg.fixLayout();
    dlg.drawNew();
};

IDE_Morph.prototype.editProjectNotes = function () {
    var dialog = new DialogBoxMorph(),
        frame = new ScrollFrameMorph(),
        text = new TextMorph(this.projectNotes || ''),
        ok = dialog.ok,
        drawNew = text.drawNew,
        myself = this,
        size = 250,
        world = this.world();

    frame.padding = 6;
    frame.setWidth(size);
    frame.acceptsDrops = false;
    frame.contents.acceptsDrops = false;

    text.setWidth(size - frame.padding * 2);
    text.setPosition(frame.topLeft().add(frame.padding));
    text.enableSelecting();
    text.isEditable = true;

    frame.setHeight(size);
    frame.fixLayout = nop;
    frame.edge = InputFieldMorph.prototype.edge;
    frame.fontSize = InputFieldMorph.prototype.fontSize;
    frame.typeInPadding = InputFieldMorph.prototype.typeInPadding;
    frame.contrast = InputFieldMorph.prototype.contrast;
    frame.drawNew = InputFieldMorph.prototype.drawNew;
    frame.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;

    text.drawNew = function () {
        var y = this.topLeft().y - frame.topLeft().y;
        drawNew.call(this);
        if (y <= frame.padding
                && y >= -frame.contents.height()
                    + frame.height() - frame.padding) {
            frame.contents.adjustBounds();
        }
    };

    frame.addContents(text);
    text.drawNew();

    dialog.ok = function () {
        myself.projectNotes = text.text;
        ok.call(this);
    };

    dialog.justDropped = function () {
        text.edit();
    };

    dialog.labelString = 'Project Notes';
    dialog.createLabel();
    dialog.addBody(frame);
    frame.drawNew();
    dialog.addButton('ok', 'Ok');
    dialog.addButton('cancel', 'Cancel');
    dialog.fixLayout();
    dialog.drawNew();
    world.add(dialog);
    dialog.setCenter(world.center());
    text.edit();
};

IDE_Morph.prototype.newProject = function () {
    if (this.stage) {
        this.stage.destroy();
    }
    location.hash = '';
    this.globalVariables = new VariableFrame();
    this.currentSprite = new SpriteMorph(this.globalVariables);
    this.setProjectName('');
    this.projectNotes = '';
    this.createStage();
    this.add(this.stage);
    this.createCorral();
    this.selectSprite(this.stage.children[0]);
    this.fixLayout();
};

IDE_Morph.prototype.saveProject = function (name) {
    var menu, str;
    if (name) {
        this.setProjectName(name);
        try {
            menu = this.showMessage('Saving');
            localStorage['-snap-project-' + name]
                = str = XMLSerializer.serialize(this.stage);
            location.hash = '#open:' + str;
            menu.destroy();
            this.showMessage('Saved!', 1);
        } catch (err) {
            this.showMessage('Save failed: ' + err);
        }
    }
};

IDE_Morph.prototype.openProjectString = function (str) {
    try {
        XMLSerializer.openProject(XMLSerializer.load(str), this);
    } catch (err) {
        this.showMessage('Load failed: ' + err);
    }
};

IDE_Morph.prototype.openProject = function (name) {
    var str;
    if (name) {
        this.setProjectName(name);
        this.openProjectString(
            str = localStorage['-snap-project-' + name]
        );
        location.hash = '#open:' + str;
    }
};

IDE_Morph.prototype.openProjectBrowser = function () {
    var dialog = new DialogBoxMorph(),
        myself = this,
        projects = [],
        deleted = {},
        padding = 6,
        p,
        deletedColor = new Color(190, 190, 190),
        list,
        preview,
        notesFrame,
        notesText,
        body,
        world = this.world();
    dialog.labelString = 'Open Project';
    dialog.createLabel();

    for (p in localStorage) {
        if (localStorage.hasOwnProperty(p)
                && p.substr(0, 14) === '-snap-project-') {
            projects.push(p.substr(14));
        }
    }
    projects.sort();

    list = new ListMorph(projects);
    list.action = function (name) {
        var xml = localStorage['-snap-project-' + name],
            project,
            notes,
            thumbnail;
        if (!xml) {
            notesText.text = '';
            notesText.drawNew();
            notesFrame.contents.adjustBounds();
            preview.texture = null;
            preview.cachedTexture = null;
            preview.drawNew();
            preview.changed();
            return;
        }
        project = XMLSerializer.parse(xml);
        notes = project.element('notes');
        thumbnail = project.element('thumbnail');
        if (notes) {
            notesText.text = notes.textContent();
            notesText.drawNew();
            notesFrame.contents.adjustBounds();
        }
        if (thumbnail) {
            preview.texture = thumbnail.textContent();
            preview.cachedTexture = null;
            preview.drawNew();
        }
    };
    list.setExtent(new Point(150, 250));
    list.contents.children[0].maxWidth = function () {
        return list.width() - padding * 2;
    };
    list.contents.children[0].drawNew();
    list.contents.children[0].children.forEach(function (item) {
        item.pressColor = dialog.titleBarColor.darker(20);
        item.color = new Color(0, 0, 0, 0);
        item.noticesTransparentClick = true;
        item.createBackgrounds();
    });
    list.padding = padding;
    list.fixLayout = nop;
    list.edge = InputFieldMorph.prototype.edge;
    list.fontSize = InputFieldMorph.prototype.fontSize;
    list.typeInPadding = InputFieldMorph.prototype.typeInPadding;
    list.contrast = InputFieldMorph.prototype.contrast;
    list.drawNew = InputFieldMorph.prototype.drawNew;
    list.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;

    preview = new Morph();
    preview.fixLayout = nop;
    preview.edge = InputFieldMorph.prototype.edge;
    preview.fontSize = InputFieldMorph.prototype.fontSize;
    preview.typeInPadding = InputFieldMorph.prototype.typeInPadding;
    preview.contrast = InputFieldMorph.prototype.contrast;
    preview.drawNew = function () {
        InputFieldMorph.prototype.drawNew.call(this);
        if (this.texture) {
            this.drawTexture(this.texture);
        }
    };
    preview.drawCachedTexture = function () {
        var context = this.image.getContext('2d');
        context.drawImage(this.cachedTexture, this.edge, this.edge);
        this.changed();
    };
    preview.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;
    preview.setExtent(XMLSerializer.thumbnailSize.add(preview.edge * 2));

    notesFrame = new ScrollFrameMorph();
    notesFrame.padding = padding;
    notesFrame.fixLayout = nop;

    notesFrame.edge = InputFieldMorph.prototype.edge;
    notesFrame.fontSize = InputFieldMorph.prototype.fontSize;
    notesFrame.typeInPadding = InputFieldMorph.prototype.typeInPadding;
    notesFrame.contrast = InputFieldMorph.prototype.contrast;
    notesFrame.drawNew = InputFieldMorph.prototype.drawNew;
    notesFrame.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;

    notesFrame.acceptsDrops = false;
    notesFrame.contents.acceptsDrops = false;
    notesText = new TextMorph('');
    notesText.setWidth(preview.width() - notesFrame.padding * 2);
    notesText.setPosition(notesFrame.topLeft().add(padding));
    notesFrame.addContents(notesText);

    body = new Morph();
    body.setColor(dialog.color);
    body.setExtent(new Point(
        list.width() + preview.width() + padding * 2,
        list.height()
    ));
    body.add(list);
    body.add(preview);
    body.add(notesFrame);
    preview.drawNew();
    notesFrame.setExtent(new Point(
        preview.width(),
        body.height() - preview.height() - padding
    ));
    list.setPosition(body.topLeft());
    preview.setPosition(list.topRight().add(new Point(padding, 0)));
    notesFrame.setPosition(preview.bottomLeft().add(new Point(0, padding)));

    dialog.addBody(body);
    list.drawNew();

    dialog.addButton('open', 'Open');
    dialog.open = function () {
        if (!list.selected) {
            return;
        }
        myself.openProject(list.selected);
        this.destroy();
    };

    dialog.addButton('deleteProject', 'Delete');
    dialog.deleteProject = function () {
        if (!list.selected || deleted[list.selected]) {
            return;
        }
        myself.confirm(
            'Are you sure you want to delete\n"' + list.selected + '"?',
            'Delete Project',
            function () {
                var item, extent;
                delete localStorage['-snap-project-' + list.selected];
                deleted[list.selected] = true;
                item = detect(list.listContents.children, function (child) {
                    return child.labelString === list.selected;
                });
                if (item) {
                    extent = item.extent();
                    item.labelColor = deletedColor;
                    item.createLabel();
                    item.silentSetExtent(extent);
                }
                list.action(list.selected);
            }
        );
    };

    dialog.addButton('cancel', 'Cancel');

    dialog.fixLayout();
    dialog.drawNew();
    world.add(dialog);
    dialog.setCenter(world.center());
    list.contents.children[0].color = new Color(0, 0, 0, 0);
    MenuMorph.uber.drawNew.call(list.contents.children[0]);
    list.contents.children[0].setPosition(
        list.contents.topLeft().add(padding)
    );
};

IDE_Morph.prototype.switchToUserMode = function () {
    var world = this.world();

    world.isDevMode = false;
    Process.prototype.isCatchingErrors = true;
    this.controlBar.updateLabel();
    this.isAutoFill = true;
    this.isDraggable = false;
    this.reactToWorldResize(world.bounds.copy());
    this.siblings().forEach(function (morph) {
        if (morph instanceof DialogBoxMorph) {
            world.add(morph); // bring to front
        } else {
            morph.destroy();
        }
    });
    this.flushBlocksCache();
    this.refreshPalette();
    // prevent non-DialogBoxMorphs from being dropped
    // onto the World in user-mode
    world.reactToDropOf = function (morph) {
        if (!(morph instanceof DialogBoxMorph)) {
            world.hand.grab(morph);
        }
    };
    this.showMessage('entering user mode', 1);

};

IDE_Morph.prototype.switchToDevMode = function () {
    var world = this.world();

    world.isDevMode = true;
    Process.prototype.isCatchingErrors = false;
    this.controlBar.updateLabel();
    this.isAutoFill = false;
    this.isDraggable = true;
    this.setExtent(world.extent().subtract(100));
    this.setPosition(world.position().add(20));
    this.flushBlocksCache();
    this.refreshPalette();
    // enable non-DialogBoxMorphs to be dropped
    // onto the World in dev-mode
    delete world.reactToDropOf;
    this.showMessage(
        'entering development mode.\n\n'
            + 'error catching is turned off,\n'
            + 'use the browser\'s web console\n'
            + 'to see error messages.'
    );
};

IDE_Morph.prototype.flushBlocksCache = function (category) {
    // if no category is specified, the whole cache gets flushed
    if (category) {
        this.stage.blocksCache[category] = null;
        this.stage.children.forEach(function (m) {
            if (m instanceof SpriteMorph) {
                m.blocksCache[category] = null;
            }
        });
    } else {
        this.stage.blocksCache = {};
        this.stage.children.forEach(function (m) {
            if (m instanceof SpriteMorph) {
                m.blocksCache = {};
            }
        });
    }
};

// IDE_Morph user dialogs

IDE_Morph.prototype.showMessage = function (message, secs) {
    var m = new MenuMorph(null, message);
    m.popUpCenteredInWorld(this.world());
    if (secs) {
        setInterval(function () {
            m.destroy();
        }, secs * 1000);
    }
    return m;
};

IDE_Morph.prototype.confirm = function (message, title, action) {
    new DialogBoxMorph(null, action).askYesNo(
        title,
        message,
        this.world()
    );
};

IDE_Morph.prototype.prompt = function (message, callback) {
    (new DialogBoxMorph(null, callback)).prompt(
        message,
        '',
        this.world()
    );
};

// SpriteIconMorph ////////////////////////////////////////////////////

/*
    I am a selectable element in the Sprite corral, keeping a self-updating
    thumbnail of the sprite I'm respresenting, and a self-updating label
    of the sprite's name (in case it is changed elsewhere)
*/

// SpriteIconMorph inherits from ToggleButtonMorph (Widgets)

SpriteIconMorph.prototype = new ToggleButtonMorph();
SpriteIconMorph.prototype.constructor = SpriteIconMorph;
SpriteIconMorph.uber = ToggleButtonMorph.prototype;

// SpriteIconMorph settings

SpriteIconMorph.prototype.thumbSize = new Point(40, 40);
SpriteIconMorph.prototype.labelShadowOffset = null;
SpriteIconMorph.prototype.labelShadowColor = null;
SpriteIconMorph.prototype.labelColor = new Color(255, 255, 255);
SpriteIconMorph.prototype.fontSize = 9;

// SpriteIconMorph instance creation:

function SpriteIconMorph(aSprite, aTemplate) {
	this.init(aSprite, aTemplate);
}

SpriteIconMorph.prototype.init = function (aSprite, aTemplate) {
    var colors, action, query, myself = this;

    if (!aTemplate) {
        colors = [
            IDE_Morph.prototype.groupColor,
            IDE_Morph.prototype.frameColor,
            IDE_Morph.prototype.frameColor
        ];

    }

    action = function () {
        // make my sprite the current one
        var ide = myself.parentThatIsA(IDE_Morph);

        if (ide) {
            ide.selectSprite(myself.object);
        }
    };

    query = function () {
        // answer true if my sprite is the current one
        var ide = myself.parentThatIsA(IDE_Morph);

        if (ide) {
            return ide.currentSprite === myself.object;
        }
        return false;
    };

	// additional properties:
    this.object = aSprite || new SpriteMorph(); // mandatory, actually
    this.version = this.object.version;
    this.thumbnail = null;

	// initialize inherited properties:
	SpriteIconMorph.uber.init.call(
		this,
        colors, // color overrides, <array>: [normal, highlight, pressed]
        null, // target - not needed here
        action, // a toggle function
        this.object.name, // label string
        query, // predicate/selector
        null, // environment
        null, // hint
        aTemplate // optional, for cached background images
	);

    // override defaults and build additional components
    this.createThumbnail();
    this.padding = 2;
    this.corner = 8;
    this.fixLayout();
    this.fps = 1;
};

SpriteIconMorph.prototype.createThumbnail = function () {
    if (this.thumbnail) {
        this.thumbnail.destroy();
    }

    this.thumbnail = new Morph();
    this.thumbnail.setExtent(this.thumbSize);
    this.thumbnail.image = this.object.thumbnail(this.thumbSize);
    this.add(this.thumbnail);
};

SpriteIconMorph.prototype.createLabel = function () {
    var txt;

	if (this.label) {
		this.label.destroy();
	}
	txt = new StringMorph(
		this.object.name,
		this.fontSize,
		this.fontStyle,
		true,
		false,
		false,
		this.labelShadowOffset,
		this.labelShadowColor,
        this.labelColor
	);

    this.label = new FrameMorph();
    this.label.acceptsDrops = false;
    this.label.alpha = 0;
    this.label.setExtent(txt.extent());
    txt.setPosition(this.label.position());
    this.label.add(txt);
	this.add(this.label);
};

// SpriteIconMorph stepping

SpriteIconMorph.prototype.step = function () {
    if (this.version !== this.object.version) {
        this.createThumbnail();
        this.createLabel();
        this.fixLayout();
        this.version = this.object.version;
        this.refresh();
    }
};

// SpriteIconMorph layout

SpriteIconMorph.prototype.fixLayout = function () {
    if (!this.thumbnail) {return null; }

    this.setWidth(
        this.thumbnail.width()
            + this.outline * 2
            + this.edge * 2
            + this.padding * 2
    );

    this.setHeight(
        this.thumbnail.height()
            + this.outline * 2
            + this.edge * 2
            + this.padding * 3
            + this.label.height()
    );

    this.thumbnail.setCenter(this.center());
    this.thumbnail.setTop(
        this.top() + this.outline + this.edge + this.padding
    );

    this.label.setWidth(
        Math.min(
            this.label.children[0].width(), // the actual text
            this.thumbnail.width()
        )
    );
    this.label.setCenter(this.center());
    this.label.setTop(
        this.thumbnail.bottom() + this.padding
    );
};

// SpriteIconMorph menu

SpriteIconMorph.prototype.userMenu = function () {
	var	menu = new MenuMorph(this);
    if (!(this.object instanceof SpriteMorph)) {return null; }
	menu.addItem("show", 'showSpriteOnStage');
    menu.addLine();
	menu.addItem("duplicate", 'duplicateSprite');
	menu.addItem("delete", 'removeSprite');
	return menu;
};

SpriteIconMorph.prototype.duplicateSprite = function () {
    var ide = this.parentThatIsA(IDE_Morph);
    if (ide) {
        ide.duplicateSprite(this.object);
    }
};

SpriteIconMorph.prototype.removeSprite = function () {
    var ide = this.parentThatIsA(IDE_Morph);
    if (ide) {
        ide.removeSprite(this.object);
    }
};

SpriteIconMorph.prototype.showSpriteOnStage = function () {
    this.object.showOnStage();
};

// SpriteIconMorph drawing

SpriteIconMorph.prototype.createBackgrounds = function () {
//    only draw the edges if I am selected
	var	context,
		ext = this.extent();

    if (this.template) { // take the backgrounds images from the template
        this.image = this.template.image;
        this.normalImage = this.template.normalImage;
        this.highlightImage = this.template.highlightImage;
        this.pressImage = this.template.pressImage;
        return null;
    }

	this.normalImage = newCanvas(ext);
	context = this.normalImage.getContext('2d');
	this.drawBackground(context, this.color);

	this.highlightImage = newCanvas(ext);
	context = this.highlightImage.getContext('2d');
	this.drawBackground(context, this.highlightColor);

	this.pressImage = newCanvas(ext);
	context = this.pressImage.getContext('2d');
	this.drawOutline(context);
	this.drawBackground(context, this.pressColor);
	this.drawEdges(
		context,
		this.pressColor,
		this.pressColor.lighter(this.contrast),
		this.pressColor.darker(this.contrast)
	);

	this.image = this.normalImage;
};

// CostumeIconMorph ////////////////////////////////////////////////////

/*
    I am a selectable element in the SpriteEditor's "Costumes" tab, keeping
    a self-updating thumbnail of the costume I'm respresenting, and a 
    self-updating label of the costume's name (in case it is changed 
    elsewhere)
*/

// CostumeIconMorph inherits from ToggleButtonMorph (Widgets)
// ... and copies methods from SpriteIconMorph

CostumeIconMorph.prototype = new ToggleButtonMorph();
CostumeIconMorph.prototype.constructor = CostumeIconMorph;
CostumeIconMorph.uber = ToggleButtonMorph.prototype;

// CostumeIconMorph settings

CostumeIconMorph.prototype.thumbSize = new Point(80, 60);
CostumeIconMorph.prototype.labelShadowOffset = null;
CostumeIconMorph.prototype.labelShadowColor = null;
CostumeIconMorph.prototype.labelColor = new Color(255, 255, 255);
CostumeIconMorph.prototype.fontSize = 9;

// CostumeIconMorph instance creation:

function CostumeIconMorph(aCostume, aTemplate) {
	this.init(aCostume, aTemplate);
}

CostumeIconMorph.prototype.init = function (aCostume, aTemplate) {
    var colors, action, query, myself = this;

    if (!aTemplate) {
        colors = [
            IDE_Morph.prototype.groupColor,
            IDE_Morph.prototype.frameColor,
            IDE_Morph.prototype.frameColor
        ];

    }

    action = function () {
        // make my costume the current one
        var ide = myself.parentThatIsA(IDE_Morph),
            wardrobe = myself.parentThatIsA(WardrobeMorph);

        if (ide) {
            ide.currentSprite.wearCostume(myself.object);
        }
        if (wardrobe) {
            wardrobe.updateSelection();
        }
    };

    query = function () {
        // answer true if my costume is the current one
        var ide = myself.parentThatIsA(IDE_Morph);

        if (ide) {
            return ide.currentSprite.costume === myself.object;
        }
        return false;
    };

	// additional properties:
    this.object = aCostume || new Costume(); // mandatory, actually
    this.version = this.object.version;
    this.thumbnail = null;

	// initialize inherited properties:
	CostumeIconMorph.uber.init.call(
		this,
        colors, // color overrides, <array>: [normal, highlight, pressed]
        null, // target - not needed here
        action, // a toggle function
        this.object.name, // label string
        query, // predicate/selector
        null, // environment
        null, // hint
        aTemplate // optional, for cached background images
	);

    // override defaults and build additional components
    this.createThumbnail();
    this.padding = 2;
    this.corner = 8;
    this.fixLayout();
    this.fps = 1;
};

CostumeIconMorph.prototype.createThumbnail
    = SpriteIconMorph.prototype.createThumbnail;

CostumeIconMorph.prototype.createLabel
    = SpriteIconMorph.prototype.createLabel;

// CostumeIconMorph stepping

CostumeIconMorph.prototype.step
    = SpriteIconMorph.prototype.step;

// CostumeIconMorph layout

CostumeIconMorph.prototype.fixLayout
    = SpriteIconMorph.prototype.fixLayout;

// CostumeIconMorph menu

CostumeIconMorph.prototype.userMenu = function () {
	var	menu = new MenuMorph(this);
    if (!(this.object instanceof Costume)) {return null; }
	menu.addItem("edit", 'editCostume');
	menu.addItem("delete", 'removeCostume');
	return menu;
};

CostumeIconMorph.prototype.editCostume = function () {
    this.object.edit(this.world());
};

CostumeIconMorph.prototype.removeCostume = function () {
    var wardrobe = this.parentThatIsA(WardrobeMorph),
        idx = this.parent.children.indexOf(this);
    wardrobe.removeCostumeAt(idx);
};

// SpriteIconMorph drawing

CostumeIconMorph.prototype.createBackgrounds
    = SpriteIconMorph.prototype.createBackgrounds;

// WardrobeMorph ///////////////////////////////////////////////////////

// I am a watcher on a sprite's costume list

// WardrobeMorph inherits from ScrollFrameMorph

WardrobeMorph.prototype = new ScrollFrameMorph();
WardrobeMorph.prototype.constructor = WardrobeMorph;
WardrobeMorph.uber = ScrollFrameMorph.prototype;

// WardrobeMorph settings

// ... to follow ...

// WardrobeMorph instance creation:

function WardrobeMorph(aSprite, sliderColor) {
	this.init(aSprite, sliderColor);
}

WardrobeMorph.prototype.init = function (aSprite, sliderColor) {
    // additional properties
    this.sprite = aSprite || new SpriteMorph();
    this.costumesVersion = null;
    this.spriteVersion = null;

    // initialize inherited properties
	WardrobeMorph.uber.init.call(this, null, null, sliderColor);

    // configure inherited properties
    this.fps = 2;
    this.updateList();
};

// Wardrobe updating

WardrobeMorph.prototype.updateList = function () {
    var myself = this,
        x = this.left() + 5,
        y = this.top() + 5,
        padding = 4,
        oldFlag = Morph.prototype.trackChanges,
        icon,
        template,
        txt;

    this.changed();
    oldFlag = Morph.prototype.trackChanges;
    Morph.prototype.trackChanges = false;

    this.contents.destroy();
    this.contents = new FrameMorph(this);
    this.addBack(this.contents);

    txt = new TextMorph(
        'import a picture from another web page or from\n'
            + 'a file on your computer by dropping it here\n'
    );
    txt.fontSize = 9;
    txt.setColor(new Color(230, 230, 230));
    txt.setPosition(new Point(x, y));
    this.addContents(txt);
    y = txt.bottom() + padding;

    this.sprite.costumes.asArray().forEach(function (costume) {
        template = icon = new CostumeIconMorph(costume, template);
        icon.setPosition(new Point(x, y));
        myself.addContents(icon);
        y = icon.bottom() + padding;
    });
    this.costumesVersion = this.sprite.costumes.lastChanged;

    Morph.prototype.trackChanges = oldFlag;
    this.changed();

    this.updateSelection();
};

WardrobeMorph.prototype.updateSelection = function () {
    this.contents.children.forEach(function (morph) {
        if (morph.refresh) {morph.refresh(); }
    });
    this.spriteVersion = this.sprite.version;
};

// Wardrobe stepping

WardrobeMorph.prototype.step = function () {
    if (this.costumesVersion !== this.sprite.costumes.lastChanged) {
        this.updateList();
    }
    if (this.spriteVersion !== this.sprite.version) {
        this.updateSelection();
    }
};

// Wardrobe ops

WardrobeMorph.prototype.removeCostumeAt = function (idx) {
    this.sprite.costumes.remove(idx);
};

// SoundIconMorph ///////////////////////////////////////////////////////

/*
    I am an element in the SpriteEditor's "Sounds" tab.
*/

// SoundIconMorph inherits from ToggleButtonMorph (Widgets)
// ... and copies methods from SpriteIconMorph

SoundIconMorph.prototype = new ToggleButtonMorph();
SoundIconMorph.prototype.constructor = SoundIconMorph;
SoundIconMorph.uber = ToggleButtonMorph.prototype;

// SoundIconMorph settings

SoundIconMorph.prototype.thumbSize = new Point(80, 60);
SoundIconMorph.prototype.labelShadowOffset = null;
SoundIconMorph.prototype.labelShadowColor = null;
SoundIconMorph.prototype.labelColor = new Color(255, 255, 255);
SoundIconMorph.prototype.fontSize = 9;

// SoundIconMorph instance creation:

function SoundIconMorph(aSound, aTemplate) {
	this.init(aSound, aTemplate);
}

SoundIconMorph.prototype.init = function (aSound, aTemplate) {
    var colors, action, query;

    if (!aTemplate) {
        colors = [
            IDE_Morph.prototype.groupColor,
            IDE_Morph.prototype.frameColor,
            IDE_Morph.prototype.frameColor
        ];

    }

    action = function () {
        nop(); // When I am selected (which is never the case for sounds)
    };

    query = function () {
        return false;
    };

	// additional properties:
    this.object = aSound; // mandatory, actually
    this.version = this.object.version;
    this.thumbnail = null;

	// initialize inherited properties:
	SoundIconMorph.uber.init.call(
		this,
        colors, // color overrides, <array>: [normal, highlight, pressed]
        null, // target - not needed here
        action, // a toggle function
        this.object.name, // label string
        query, // predicate/selector
        null, // environment
        null, // hint
        aTemplate // optional, for cached background images
	);

    // override defaults and build additional components
    this.createThumbnail();
    this.padding = 2;
    this.corner = 8;
    this.fixLayout();
    this.fps = 1;
};

SoundIconMorph.prototype.createThumbnail = function () {
	var label, btnColor, btnLabelColor;
	if (this.thumbnail) {
        this.thumbnail.destroy();
	}
	this.thumbnail = new Morph();
	this.thumbnail.setExtent(this.thumbSize);
	this.add(this.thumbnail);
	label = new StringMorph(
		this.createInfo(),
		'16',
		'',
		true,
		false,
		false,
		this.labelShadowOffset,
		this.labelShadowColor,
        new Color(200, 200, 200)
	);
	this.thumbnail.add(label);
	label.setCenter(new Point(40, 15));

	this.button = new PushButtonMorph(
		this,
		'toggleAudioPlaying',
		(this.object.previewAudio ? 'Stop' : 'Play')
	);
	btnLabelColor = new Color(110, 100, 110);
	btnColor = new Color(220, 220, 220);
    this.button.drawNew();
    this.button.hint = 'Play sound';
    this.button.fixLayout();
    this.thumbnail.add(this.button);
    this.button.setCenter(new Point(40, 40));
};

SoundIconMorph.prototype.createInfo = function () {
	var dur = Math.round(this.object.audio.duration || 0),
        mod = dur % 60;
	return Math.floor(dur / 60).toString()
            + ":"
            + (mod < 10 ? "0" : "")
            + mod.toString();
};

SoundIconMorph.prototype.toggleAudioPlaying = function () {
    var myself = this;
	if (!this.object.previewAudio) {
		//Audio is not playing
		this.button.labelString = 'Stop';
		this.button.hint = 'Stop sound';
		this.object.previewAudio = this.object.play();
		this.object.previewAudio.addEventListener('ended', function () {
			myself.audioHasEnded();
		}, false);
	} else {
		//Audio is currently playing
		this.button.labelString = 'Play';
		this.button.hint = 'Play sound';
		this.object.previewAudio.pause();
		this.object.previewAudio.terminated = true;
		this.object.previewAudio = null;
	}
	this.button.createLabel();
};

SoundIconMorph.prototype.audioHasEnded = function () {
	this.button.trigger();
	this.button.mouseLeave();
};

SoundIconMorph.prototype.createLabel
    = SpriteIconMorph.prototype.createLabel;

// SoundIconMorph stepping

/*
SoundIconMorph.prototype.step
    = SpriteIconMorph.prototype.step;
*/

// SoundIconMorph layout

SoundIconMorph.prototype.fixLayout
    = SpriteIconMorph.prototype.fixLayout;

// SoundIconMorph menu

SoundIconMorph.prototype.userMenu = function () {
	var	menu = new MenuMorph(this);
    if (!(this.object instanceof Sound)) { return null; }
	menu.addItem('rename', 'renameSound');
	menu.addItem('delete', 'removeSound');
	return menu;
};

SoundIconMorph.prototype.renameSound = function () {
	var d = new DialogBoxMorph(this, 'doRenameSound', this);
	d.prompt('Rename Sound', this.object.name);
	this.world().add(d);
	d.setCenter(this.world().center());
};

SoundIconMorph.prototype.doRenameSound = function (name) {
	this.object.name = name;
    this.createLabel();
	this.fixLayout();
};

SoundIconMorph.prototype.removeSound = function () {
	var jukebox = this.parentThatIsA(JukeboxMorph),
		idx = this.parent.children.indexOf(this);
	jukebox.removeSound(idx);
};

SoundIconMorph.prototype.createBackgrounds
    = SpriteIconMorph.prototype.createBackgrounds;

SoundIconMorph.prototype.createLabel
    = SpriteIconMorph.prototype.createLabel;

// JukeboxMorph /////////////////////////////////////////////////////

/*
    I am JukeboxMorph, like WardrobeMorph, but for sounds
*/

// JukeboxMorph instance creation

JukeboxMorph.prototype = new ScrollFrameMorph();
JukeboxMorph.prototype.constructor = JukeboxMorph;
JukeboxMorph.uber = ScrollFrameMorph.prototype;

function JukeboxMorph(aSprite, sliderColor) {
	this.init(aSprite, sliderColor);
}

JukeboxMorph.prototype.init = function (aSprite, sliderColor) {
    // additional properties
    this.sprite = aSprite || new SpriteMorph();
    this.costumesVersion = null;
    this.spriteVersion = null;

    // initialize inherited properties
	JukeboxMorph.uber.init.call(this, null, null, sliderColor);

    // configure inherited properties
    this.fps = 2;
    this.updateList();
};

// Jukebox updating

JukeboxMorph.prototype.updateList = function () {
    var myself = this,
        x = this.left() + 5,
        y = this.top() + 5,
        padding = 4,
        oldFlag = Morph.prototype.trackChanges,
        icon,
        template,
        txt;

    this.changed();
    oldFlag = Morph.prototype.trackChanges;
    Morph.prototype.trackChanges = false;

    this.contents.destroy();
    this.contents = new FrameMorph(this);
    this.addBack(this.contents);

    txt = new TextMorph(
        'import a sound from your computer\nby dragging it into here'
    );
    txt.fontSize = 9;
    txt.setColor(new Color(230, 230, 230));
    txt.setPosition(new Point(x, y));
    this.addContents(txt);
    y = txt.bottom() + padding;

    this.sprite.sounds.asArray().forEach(function (sound) {
        template = icon = new SoundIconMorph(sound, template);
        icon.setPosition(new Point(x, y));
        myself.addContents(icon);
        y = icon.bottom() + padding;
    });

    Morph.prototype.trackChanges = oldFlag;
    this.changed();

    this.updateSelection();
};

JukeboxMorph.prototype.updateSelection = function () {
    this.contents.children.forEach(function (morph) {
        if (morph.refresh) {morph.refresh(); }
    });
    this.spriteVersion = this.sprite.version;
};

// Jukebox stepping

/*
JukeboxMorph.prototype.step = function () {
    if (this.spriteVersion !== this.sprite.version) {
        this.updateSelection();
    }
};
*/

// Jukebox ops

JukeboxMorph.prototype.removeSound = function (idx) {
	this.sprite.sounds.remove(idx);
	this.updateList();
};