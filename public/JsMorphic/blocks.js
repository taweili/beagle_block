/*

	blocks.js

	a programming construction kit
	based on morphic.js
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
	needs morphic.js


	hierarchy
	---------
	the following tree lists all constructors hierarchically,
	indentation indicating inheritance. Refer to this list to get a
	contextual overview:

		Morph*
			ArrowMorph
			BlockHighlightMorph
			ScriptsMorph
			SyntaxElementMorph
				ArgMorph
					BooleanSlotMorph
					ColorSlotMorph
					CommandSlotMorph
						CSlotMorph
					FunctionSlotMorph
						ReporterSlotMorph
					InputSlotMorph
					MultiArgMorph
					TemplateSlotMorph
				BlockMorph
					CommandBlockMorph
						HatBlockMorph
					ReporterBlockMorph

	* from morphic.js


	toc
	---
	the following list shows the order in which all constructors are
	defined. Use this list to locate code in this document:

		SyntaxElementMorph
		BlockMorph
		CommandBlockMorph
		HatBlockMorph
		ReporterBlockMorph
		ScriptsMorph
		ArgMorph
		CommandSlotMorph
		CSlotMorph
		InputSlotMorph
		BooleanSlotMorph
		ArrowMorph
		ColorSlotMorph
		TemplateSlotMorph
		BlockHighlightMorph
		MultiArgMorph
		FunctionSlotMorph
		ReporterSlotMorph



	structure of syntax elements
	----------------------------
	the structure of syntax elements is identical with their morphic
	tree. There are, however, accessor methods to get (only) the
	parts which are relevant for evaluation wherever appropriate.

	In Scratch/BYOB every sprite and the stage has its own "blocks bin",
	an instance of ScriptsMorph (we're going to name it differently in
	Snap, probably just "scripts").

	At the top most level blocks are assembled into stacks in ScriptsMorph
	instances. A ScriptsMorph contains nothing but blocks, therefore
	every child of a ScriptsMorph is expected to be a block.

	Each block contains:

		selector	- indicating the name of the function it triggers,

	Its arguments are first evaluated and then passed along	as the
	selector is called. Arguments can be either instances of ArgMorph
	or ReporterBlockMorph. The getter method for a block's arguments is

		inputs()	- gets an array of arg morphs and/or reporter blocks

	in addition to inputs, command blocks also know their

		nextBlock()	- gets the block attached to the receiver's bottom

	and the block they're attached to - if any: Their parent.

	please also refer to the high-level comment at the beginning of each
	constructor for further details.
*/

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
useBlurredShadows, version, window, SpeechBubbleMorph, modules, StageMorph,
fontHeight*/

/*global SpriteMorph, Context, ListWatcherMorph, CellMorph,
DialogBoxMorph, BlockInputFragmentMorph, PrototypeHatBlockMorph*/

/*global IDE_Morph, BlockDialogMorph, BlockEditorMorph*/

// Global stuff ////////////////////////////////////////////////////////

modules.blocks = '2012-Apr-16';

var SyntaxElementMorph;
var BlockMorph;
var CommandBlockMorph;
var ReporterBlockMorph;
var ScriptsMorph;
var ArgMorph;
var CommandSlotMorph;
var CSlotMorph;
var InputSlotMorph;
var BooleanSlotMorph;
var ArrowMorph;
var ColorSlotMorph;
var HatBlockMorph;
var BlockHighlightMorph;
var MultiArgMorph;
var TemplateSlotMorph;
var FunctionSlotMorph;
var ReporterSlotMorph;

/*
WorldMorph.prototype.customMorphs = function () {
	// add examples to the world's demo menu

	var	sm = new ScriptsMorph();
	sm.setExtent(new Point(800, 600));

	return [
		new HatBlockMorph(),
		new CommandBlockMorph(),
		sm,
		new CommandSlotMorph(),
		new CSlotMorph(),
		new InputSlotMorph(),
		new InputSlotMorph(null, true),
		new BooleanSlotMorph(),
		new ColorSlotMorph(),
		new TemplateSlotMorph('foo'),
		new ReporterBlockMorph(),
		new ReporterBlockMorph(true),
		new ArrowMorph(),
		new MultiArgMorph(),
		new FunctionSlotMorph(),
		new ReporterSlotMorph(),
		new ReporterSlotMorph(true),
		new DialogBoxMorph('Dialog Box'),
		new InputFieldMorph('Input Field')
	];
};
*/

// SyntaxElementMorph //////////////////////////////////////////////////

// I am the ancestor of all blocks and input slots

// SyntaxElementMorph inherits from Morph:

SyntaxElementMorph.prototype = new Morph();
SyntaxElementMorph.prototype.constructor = SyntaxElementMorph;
SyntaxElementMorph.uber = Morph.prototype;

// SyntaxElementMorph preferences settings:

/*
	the following settings govern the appearance of all syntax elements
	(blocks and slots) where applicable:

	outline:

		corner		- radius of command block rounding
		rounding	- radius of reporter block rounding
		edge		- width of 3D-ish shading box
		hatHeight	- additional top space for hat blocks
		hatWidth	- minimum width for hat blocks
		rfBorder	- pixel width of reification border (grey outline)
        minWidth    - minimum width for any syntax element's contents

	jigsaw shape:

		inset		- distance from indentation to left edge
		dent		- width of indentation bottom

	paddings:

		bottomPadding	- adds to the width of the bottom most c-slot
		cSlotPadding	- adds to the width of the open "C" in c-slots
		typeInPadding	- adds pixels between text and edge in input slots
		labelPadding	- adds left/right pixels to block labels

	label:

		fontSize		- duh
		embossing		- <Point> offset for embossing effect
		labelWidth		- column width, used for word wrapping
		labelWordWrap	- <bool> if true labels can break after each word

	snapping:

		feedbackColor		- <Color> for displaying drop feedbacks
		feedbackMinHeight	- height of white line for command block snaps
		minSnapDistance		- threshold when commands start snapping
		reporterDropFeedbackPadding	- increases reporter drop feedback

	color gradients:

		contrast		- <percent int> 3D-ish shading gradient contrast
		labelContrast	- <percent int> 3D-ish label shading contrast
		activeHighlight	- <Color> for stack highlighting when active
		errorHighlight	- <Color> for error highlighting
		activeBlur		- <percent int> shadow parameter for activeHighlight
		rfColor			- <Color> for reified outlines and slot backgrounds
*/

SyntaxElementMorph.prototype.corner = 3;
SyntaxElementMorph.prototype.rounding = 7;
SyntaxElementMorph.prototype.edge = 1.000001; // shadow bug in Chrome
SyntaxElementMorph.prototype.inset = 6;
SyntaxElementMorph.prototype.hatHeight = 12;
SyntaxElementMorph.prototype.hatWidth = 70;
SyntaxElementMorph.prototype.rfBorder = 3;
SyntaxElementMorph.prototype.minWidth = 0;
SyntaxElementMorph.prototype.dent = 8;
SyntaxElementMorph.prototype.bottomPadding = 3;
SyntaxElementMorph.prototype.cSlotPadding = 4;
SyntaxElementMorph.prototype.typeInPadding = 1;
SyntaxElementMorph.prototype.labelPadding = 5;
SyntaxElementMorph.prototype.fontSize = 10;
SyntaxElementMorph.prototype.embossing = new Point(-1, -1);
SyntaxElementMorph.prototype.labelWidth = 450;
SyntaxElementMorph.prototype.labelWordWrap = true;
SyntaxElementMorph.prototype.feedbackColor = new Color(255, 255, 255);
SyntaxElementMorph.prototype.feedbackMinHeight = 5;
SyntaxElementMorph.prototype.minSnapDistance = 20;
SyntaxElementMorph.prototype.reporterDropFeedbackPadding = 10;
SyntaxElementMorph.prototype.contrast = 65;
SyntaxElementMorph.prototype.labelContrast = 25;
SyntaxElementMorph.prototype.activeHighlight = new Color(153, 255, 213);
SyntaxElementMorph.prototype.errorHighlight = new Color(173, 15, 0);
SyntaxElementMorph.prototype.activeBlur = 20;
SyntaxElementMorph.prototype.rfColor = new Color(120, 120, 120);

// SyntaxElementMorph instance creation:

function SyntaxElementMorph() {
	this.init();
}

SyntaxElementMorph.prototype.init = function () {
	this.cachedClr = null;
	this.cachedClrBright = null;
	this.cachedClrDark = null;
	this.isStatic = false; // if true, I cannot be exchanged

	SyntaxElementMorph.uber.init.call(this);

	this.defaults = [];
};

// SyntaxElementMorph accessing:

SyntaxElementMorph.prototype.parts = function () {
	// answer my non-crontrol submorphs
	var nb = null;
	if (this.nextBlock) { // if I am a CommandBlock or a HatBlock
		nb = this.nextBlock();
	}
	return this.children.filter(function (child) {
		return (child !== nb)
			&& !(child instanceof ShadowMorph)
			&& !(child instanceof BlockHighlightMorph);
	});
};

SyntaxElementMorph.prototype.inputs = function () {
	// answer my arguments and nested reporters
	return this.parts().filter(function (part) {
		return part instanceof SyntaxElementMorph;
	});
};

SyntaxElementMorph.prototype.allInputs = function () {
	// answer arguments and nested reporters of all children
	var myself = this;
	return this.allChildren().slice(0).reverse().filter(
		function (child) {
			return (child instanceof ArgMorph) ||
				(child instanceof ReporterBlockMorph &&
				child !== myself);
		}
	);
};

SyntaxElementMorph.prototype.allEmptySlots = function () {
	// answer empty input slots of all children including myself
	return this.allInputs().reverse().filter(function (slot) {
		return slot.isEmptySlot();
	});
};

SyntaxElementMorph.prototype.replaceInput = function (oldArg, newArg) {
	var	scripts = this.parentThatIsA(ScriptsMorph),
		idx = this.children.indexOf(oldArg),
		nb;

	if ((idx === -1) || (scripts === null)) {
		return null;
	}
	this.startLayout();
	if (newArg.parent) {
		newArg.parent.removeChild(newArg);
	}
	newArg.parent = this;
	this.children[idx] = newArg;
	if (oldArg instanceof ReporterBlockMorph) {
		scripts.add(oldArg);
		oldArg.moveBy(newArg.extent());
	} else if (oldArg instanceof CommandSlotMorph) {
		nb = oldArg.nestedBlock();
		if (nb) {
			scripts.add(nb);
			nb.moveBy(newArg.extent());
		}
	}
	if (newArg instanceof MultiArgMorph
			|| newArg.constructor === CommandSlotMorph) {
		newArg.fixLayout();
	} else {
		newArg.drawNew();
		this.fixLayout();
	}
	this.endLayout();
};

SyntaxElementMorph.prototype.silentReplaceInput = function (oldArg, newArg) {
    // used by the Serializer when restoring a de-serialized object
    var i = this.children.indexOf(oldArg);

    if (i === -1) {
        return;
    }
    if (newArg.parent) {
        newArg.parent.removeChild(newArg);
    }
    newArg.parent = this;
    this.children[i] = newArg;

    if (newArg instanceof MultiArgMorph
            || newArg.constructor === CommandSlotMorph) {
        newArg.fixLayout();
    } else {
        newArg.drawNew();
        this.fixLayout();
    }
};

SyntaxElementMorph.prototype.revertToDefaultInput = function (arg) {
	var	idx = this.parts().indexOf(arg),
		inp = this.inputs().indexOf(arg),
		deflt = new InputSlotMorph();

	if (idx !== -1) {
		if (this instanceof BlockMorph) {
			deflt = this.labelPart(this.parseSpec(this.blockSpec)[idx]);
		} else if (this instanceof MultiArgMorph) {
			deflt = this.labelPart(this.slotSpec);
		} else if (this instanceof ReporterSlotMorph) {
			deflt = ReporterSlotMorph.prototype.emptySlot();
		}
	}
	// set default value
	if (inp !== -1) {
        if (deflt instanceof MultiArgMorph) {
            deflt.setContents(this.defaults);
            deflt.defaults = this.defaults;
        } else if (this.defaults[inp]) {
			deflt.setContents(this.defaults[inp]);
		}
	}
	this.replaceInput(arg, deflt);
	if (deflt instanceof MultiArgMorph) {
		deflt.refresh();
	}
};

SyntaxElementMorph.prototype.isLocked = function () {
	// answer true if I can be exchanged by a dropped reporter
	return this.isStatic;
};

// SyntaxElementMorph enumerating:

SyntaxElementMorph.prototype.topBlock = function () {
	if (this.parent && this.parent.topBlock) {
		return this.parent.topBlock();
	}
    return this;
};

// SyntaxElementMorph drag & drop:

SyntaxElementMorph.prototype.reactToGrabOf = function (grabbedMorph) {
	if (grabbedMorph instanceof CommandBlockMorph) {
		var affected = this.parentThatIsA(CommandSlotMorph);
		if (affected) {
			this.startLayout();
			affected.fixLayout();
			this.endLayout();
		}
	}
};

// SyntaxElementMorph 3D - border color rendering:

SyntaxElementMorph.prototype.bright = function () {
	return this.color.lighter(this.contrast).toString();
};

SyntaxElementMorph.prototype.dark = function () {
	return this.color.darker(this.contrast).toString();
};

// SyntaxElementMorph color changing:

SyntaxElementMorph.prototype.setColor = function (aColor) {
	if (aColor) {
		if (!this.color.eq(aColor)) {
			this.color = aColor;
			this.drawNew();
			this.children.forEach(function (child) {
				child.drawNew();
				child.changed();
			});
			this.changed();
		}
	}
};

// SyntaxElementMorph label parts:

SyntaxElementMorph.prototype.labelPart = function (spec) {
	var part;
	if ((spec[0] === '%') && (spec.length > 1)) {

		// check for variable multi-arg-slot:
		if ((spec.length > 5) && (spec.slice(0, 5) === '%mult')) {
			part = new MultiArgMorph(spec.slice(5));
			part.addInput();
			return part;
		}

		// single-arg and specialized multi-arg slots:
		switch (spec) {
		case '%inputs':
			part = new MultiArgMorph('%s', 'with inputs');
			part.isStatic = false;
			break;
		case '%scriptVars':
			part = new MultiArgMorph('%t', null, 1, spec);
			break;
		case '%parms':
			part = new MultiArgMorph('%t', 'Input Names:', 0, spec);
			break;
        case '%words':
            part = new MultiArgMorph('%s', null, 2);
			part.isStatic = false;
            break;
		case '%br':
			part = new Morph();
			part.setExtent(new Point(0, 0));
			part.isBlockLabelBreak = true;
			part.getSpec = function () {
				return '%br';
			};
			break;
        case '%inputName':
            part = new ReporterBlockMorph();
            part.color = SpriteMorph.prototype.blockColor.variables;
            part.setSpec('Input name');
            break;
		case '%s':
        case '%txt':
		case '%anyUE':
        case '%obj':
			part = new InputSlotMorph();
			break;
		case '%n':
			part = new InputSlotMorph(null, true);
			break;
		case '%dir':
			part = new InputSlotMorph(
				null,
				true,
				{
					'(90) right' : 90,
					'(-90) left' : -90,
					'(0) up' : '0',
					'(180) down' : 180
				}
			);
			part.setContents(90);
			break;
		case '%inst':
			part = new InputSlotMorph(
				null,
				true,
				{
					'(1) Acoustic Grand' : 1,
					'(2) Bright Acoustic' : 2,
					'(3) Electric Grand' : 3,
					'(4) Honky Tonk' : 4,
					'(5) Electric Piano 1' : 5,
					'(6) Electric Piano 2' : 6,
					'(7) Harpsichord' : 7
				}
			);
			part.setContents(1);
			break;
		case '%ida':
			part = new InputSlotMorph(
				null,
				true,
				{
					'1' : 1,
					last : 'last',
					'~' : null,
					all : 'all'
				}
			);
			part.setContents(1);
			break;
		case '%idx':
			part = new InputSlotMorph(
				null,
				true,
				{
					'1' : 1,
					last : 'last',
					any : 'any'
				}
			);
			part.setContents(1);
			break;
		case '%spr':
			part = new InputSlotMorph(
				null,
				false,
				{
					' ' : ' ',
					'mouse-pointer' : 'mouse-pointer',
					Sprite1 : 'Sprite1',
					Sprite2 : 'Sprite2',
					Sprite3 : 'Sprite3'
				},
				true
			);
			break;
		case '%col': // collision detection
			part = new InputSlotMorph(
				null,
				false,
				'collidablesMenu',
				true
			);
			break;
		case '%cst':
			part = new InputSlotMorph(
				null,
				false,
				'costumesMenu',
				true
			);
			break;
		case '%eff':
			part = new InputSlotMorph(
				null,
				false,
				{
                /*
					color : 'color',
					fisheye : 'fisheye',
					whirl : 'whirl',
					pixelate : 'pixelate',
					mosaic : 'mosaic',
					brightness : 'brightness',
                */
					ghost : 'ghost'
				},
				true
			);
			part.setContents('ghost');
			break;
		case '%snd':
            part = new InputSlotMorph(
                null,
                false,
                'soundsMenu',
                true
            );
            break;
		case '%key':
			part = new InputSlotMorph(
				null,
				false,
				{
					'up arrow': 'up arrow',
					'down arrow': 'down arrow',
					'right arrow': 'right arrow',
					'left arrow': 'left arrow',
					space : 'space',
					a : 'a',
					b : 'b',
					c : 'c',
					d : 'd',
					e : 'e',
					f : 'f',
					g : 'g',
					h : 'h',
					i : 'i',
					j : 'j',
					k : 'k',
					l : 'l',
					m : 'm',
					n : 'n',
					o : 'o',
					p : 'p',
					q : 'q',
					r : 'r',
					s : 's',
					t : 't',
					u : 'u',
					v : 'v',
					w : 'w',
					x : 'x',
					y : 'y',
					z : 'z',
					'0' : '0',
					'1' : '1',
					'2' : '2',
					'3' : '3',
					'4' : '4',
					'5' : '5',
					'6' : '6',
					'7' : '7',
					'8' : '8',
					'9' : '9'
				},
				true
			);
			part.setContents('space');
			break;
		case '%msg':
			part = new InputSlotMorph(
				null,
				false,
				'messagesMenu',
				true
			);
			break;
		case '%att':
			part = new InputSlotMorph(
				null,
				false,
				{
					' ': ' ',
					'x position': 'x position',
					'y position': 'y position',
					'direction': 'direction',
					'costume #': 'costume #',
					size : 'size',
					volume : 'volume'
				},
				true
			);
			part.setContents('x position');
			break;
		case '%fun':
			part = new InputSlotMorph(
				null,
				false,
				{
					abs : 'abs',
					sqrt : 'sqrt',
					sin : 'sin',
					cos : 'cos',
					tan : 'tan',
					asin : 'ssin',
					acos : 'acos',
					atan : 'atan',
					ln : 'ln',
					log : 'log',
					'e^' : 'e^',
					'10^' : '10^'
				},
				true
			);
			part.setContents('sqrt');
			break;
		case '%typ':
			part = new InputSlotMorph(
				null,
				false,
				{
					number : 'number',
					text : 'text',
					Boolean : 'Boolean',
					list : 'list',
					command : 'command',
					reporter : 'reporter',
					predicate : 'predicate',
					object : 'object'
				},
				true
			);
			part.setContents('number');
			break;
		case '%var':
			part = new InputSlotMorph(
				null,
				false,
				'getVarNamesDict',
				true
			);
			break;
		case '%lst':
			part = new InputSlotMorph(
				null,
				false,
				{
					list1 : 'list1',
					list2 : 'list2',
					list3 : 'list3'
				},
				true
			);
			break;
		case '%l':
			part = new ArgMorph('list');
			break;
		case '%b':
		case '%boolUE':
			part = new BooleanSlotMorph(null, true);
			break;
		case '%cmd':
			part = new CommandSlotMorph();
			break;
		case '%c':
			part = new CSlotMorph();
			part.isStatic = true;
			break;
		case '%cs':
			part = new CSlotMorph(); // non-static
			break;
		case '%clr':
			part = new ColorSlotMorph();
			part.isStatic = true;
			break;
		case '%t':
			part = new TemplateSlotMorph('a');
			break;
		case '%upvar':
			part = new TemplateSlotMorph('\u2191'); // up-arrow
			break;
		case '%f':
			part = new FunctionSlotMorph();
			break;
		case '%r':
			part = new ReporterSlotMorph();
			break;
		case '%p':
			part = new ReporterSlotMorph(true);
			break;

    // symbols:

        case '%clockwise':
            part = new StringMorph('\u21BB');
            part.fontSize = this.fontSize * 1.5;
            part.color = new Color(255, 255, 255);
            part.isBold = false;
            part.shadowColor = this.color.darker(this.labelContrast);
            part.shadowOffset = this.embossing;
            part.drawNew();
            break;
        case '%counterclockwise':
            part = new StringMorph('\u21BA');
            part.fontSize = this.fontSize * 1.5;
            part.color = new Color(255, 255, 255);
            part.isBold = false;
            part.shadowColor = this.color.darker(this.labelContrast);
            part.shadowOffset = this.embossing;
            part.drawNew();
            break;
        case '%greenflag':
            part = new StringMorph('\u2691');
            part.fontSize = this.fontSize * 1.5;
            part.color = new Color(0, 200, 0);
            part.isBold = false;
            part.shadowColor = this.color.darker(this.labelContrast);
            part.shadowOffset = this.embossing;
            part.drawNew();
            break;
        case '%stop':
            part = new StringMorph('\u2B23');
            part.fontSize = this.fontSize * 1.5;
            part.color = new Color(200, 0, 0);
            part.isBold = false;
            part.shadowColor = this.color.darker(this.labelContrast);
            part.shadowOffset = this.embossing;
            part.drawNew();
            break;

		default:
			// nop();
		}
	} else {
		part = new StringMorph(spec);
		part.fontSize = this.fontSize;
		part.color = new Color(255, 255, 255);
		part.isBold = true;
		part.shadowColor = this.color.darker(this.labelContrast);
		part.shadowOffset = this.embossing;
		part.drawNew();
	}
	return part;
};

// SyntaxElementMorph layout:

SyntaxElementMorph.prototype.fixLayout = function () {
	var	nb,
		parts = this.parts(),
		myself = this,
		x = 0,
		y,
		lineHeight = 0,
		maxX = 0,
		blockWidth = this.minWidth,
		blockHeight,
		affected,
		l = [],
		lines = [],
		space = this.isPrototype ?
                1 : Math.floor(fontHeight(this.fontSize) / 3),
		bottomCorrection,
		needsHighlight = false,
		initialExtent = this.extent();

	if ((this instanceof MultiArgMorph) && (this.slotSpec !== '%c')) {
		blockWidth += this.arrows().width();
	} else if (this instanceof ReporterBlockMorph) {
		blockWidth += (this.rounding * 2) + (this.edge * 2);
	} else {
		blockWidth += (this.corner * 4)
			+ (this.edge * 2)
			+ (this.inset * 3)
			+ this.dent;
	}

	if (this.nextBlock) {
		nb = this.nextBlock();
	}

	// determine lines
	parts.forEach(function (part) {
		if ((part instanceof CSlotMorph)
				|| (part.slotSpec === '%c')) {
			if (l.length > 0) {
				lines.push(l);
				lines.push([part]);
				l = [];
				x = 0;
			} else {
				lines.push([part]);
			}
		} else if (part instanceof BlockHighlightMorph) {
			if (!(myself.parent.topBlock)) { // I am on top
				needsHighlight = true;
			}
			myself.fullChanged();
			myself.removeChild(part);
		} else {
			if (part.isVisible) {
				x += part.fullBounds().width() + space;
			}
			if ((x > myself.labelWidth) || part.isBlockLabelBreak) {
				if (l.length > 0) {
					lines.push(l);
					l = [];
					x = part.fullBounds().width() + space;
				}
			}
			l.push(part);
			if (part.isBlockLabelBreak) {
				x = 0;
			}
		}
	});
	if (l.length > 0) {
		lines.push(l);
	}

	// distribute parts on lines
	if (this instanceof CommandBlockMorph) {
		y = this.top() + this.corner + this.edge;
		if (this instanceof HatBlockMorph) {
			y += this.hatHeight;
		}
	} else if (this instanceof ReporterBlockMorph) {
		y = this.top() + (this.edge * 2);
	} else if (this instanceof MultiArgMorph) {
		y = this.top();
	}
	lines.forEach(function (line) {
		x = myself.left() + myself.edge + myself.labelPadding;
		if (myself.isPredicate) {
			x = myself.left() + myself.rounding;
		} else if (myself instanceof MultiArgMorph) {
			x = myself.left();
		}
		y += lineHeight;
		lineHeight = 0;
		line.forEach(function (part) {
			if (part instanceof CSlotMorph) {
				x -= myself.labelPadding;
				if (myself.isPredicate) {
					x = myself.left() + myself.rounding;
				}
				part.setColor(myself.color);
				part.setPosition(new Point(x, y));
				lineHeight = part.height();
			} else {
				part.setPosition(new Point(x, y));
				if (!part.isBlockLabelBreak) {
					if (part.slotSpec === '%c') {
						x += part.width();
					} else if (part.isVisible) {
						x += part.fullBounds().width() + space;
					}
				}
				maxX = Math.max(maxX, x);
				lineHeight = Math.max(lineHeight, part.height());
			}
		});

	// center parts vertically on each line:
		line.forEach(function (part) {
			part.moveBy(new Point(
				0,
				Math.round((lineHeight - part.height()) / 2)
			));
		});
	});

	// determine my height:
	y += lineHeight;
	if (this.children.some(function (any) {
			return any instanceof CSlotMorph;
		})) {
		bottomCorrection = this.bottomPadding;
		if (this instanceof ReporterBlockMorph && !this.isPredicate) {
			bottomCorrection = Math.max(
				this.bottomPadding,
				this.rounding - this.bottomPadding
			);
		}
		y += bottomCorrection;
	}
	if (this instanceof CommandBlockMorph) {
        blockHeight = y - this.top() + (this.corner * 2);
	} else if (this instanceof ReporterBlockMorph) {
		blockHeight = y - this.top() + (this.edge * 2);
	} else if (this instanceof MultiArgMorph) {
		blockHeight = y - this.top();
	}

	// determine my width:
	if (this.isPredicate) {
		blockWidth = Math.max(
			blockWidth,
			maxX - this.left() + this.rounding
		);
	} else if (this instanceof MultiArgMorph) {
		blockWidth = Math.max(
			blockWidth,
			maxX - this.left() - space
		);
	} else {
		blockWidth = Math.max(
			blockWidth,
			maxX - this.left() + this.labelPadding - this.edge
		);
		if (this instanceof HatBlockMorph) {
			blockWidth = Math.max(blockWidth, this.hatWidth * 1.5);
		}
	}

	// set my extent:
	this.setExtent(new Point(blockWidth, blockHeight));

	// adjust CSlots
	parts.forEach(function (part) {
		if (part instanceof CSlotMorph) {
			if (myself.isPredicate) {
				part.setWidth(blockWidth - myself.rounding * 2);
			} else {
				part.setWidth(blockWidth - myself.edge);
			}
		}
	});

	// redraw in order to erase CSlot backgrounds
	this.drawNew();

	// position next block:
	if (nb) {
		nb.setPosition(
			new Point(
				this.left(),
				this.bottom() - (this.corner)
			)
		);
	}

	// find out if one of my parents needs to be fixed
	if (this instanceof CommandBlockMorph) {
		if (this.height() !== initialExtent.y) {
			affected = this.parentThatIsA(CommandSlotMorph);
			if (affected) {
				affected.fixLayout();
			}
		}
		if (this.width() !== initialExtent.x) {
			affected = this.parentThatIsAnyOf(
				[ReporterBlockMorph, CommandSlotMorph]
			);
			if (affected) {
				affected.fixLayout();
			}
		}
	} else if (this instanceof ReporterBlockMorph) {
		if (this.parent) {
			if (this.parent.fixLayout) {
				this.parent.fixLayout();
			}
		}
	}

	// restore highlight:
	if (needsHighlight) {
		this.addHighlight();
	}
};

// SyntaxElementMorph evaluating:

SyntaxElementMorph.prototype.evaluate = function () {
	// responsibility of my children, default is to answer null
	return null;
};

SyntaxElementMorph.prototype.isEmptySlot = function () {
	// responsibility of my children, default is to answer false
	return false;
};

// SyntaxElementMorph speech bubble feedback:

SyntaxElementMorph.prototype.showBubble = function (value) {
	var	bubble,
		img,
		morphToShow,
		wrrld = this.world();

	if ((value === undefined) || !wrrld) {
		return null;
	}
	if (value instanceof ListWatcherMorph) {
		morphToShow = value;
		morphToShow.update(true);
		morphToShow.step = value.update;
	} else if (value instanceof Morph) {
		img = value.fullImage();
		morphToShow = new Morph();
		morphToShow.silentSetWidth(img.width);
		morphToShow.silentSetHeight(img.height);
		morphToShow.image = img;
	} else if (value instanceof Context) {
		img = value.image();
		morphToShow = new Morph();
		morphToShow.silentSetWidth(img.width);
		morphToShow.silentSetHeight(img.height);
		morphToShow.image = img;
	} else if (isString(value)) {
		morphToShow = new TextMorph(
			value,
			this.fontSize,
			null,
			false,
			false,
			'center'
		);
	} else if (value === null) {
		morphToShow = new TextMorph(
			'',
			this.fontSize,
			null,
			false,
			false,
			'center'
		);
	} else if (value === 0) {
		morphToShow = new TextMorph(
			'0',
			this.fontSize,
			null,
			false,
			false,
			'center'
		);
	} else if (value.toString) {
		morphToShow = new TextMorph(
			value.toString(),
			this.fontSize,
			null,
			false,
			false,
			'center'
		);
	}
	bubble = new SpeechBubbleMorph(
		morphToShow,
		null,
		Math.max(this.rounding - 2, 6),
		0
	);
	bubble.popUp(
		wrrld,
		this.rightCenter().add(new Point(2, 0))
	);
};

// SyntaxElementMorph layout update optimization

SyntaxElementMorph.prototype.startLayout = function () {
	this.topBlock().fullChanged();
	Morph.prototype.trackChanges = false;
};

SyntaxElementMorph.prototype.endLayout = function () {
	Morph.prototype.trackChanges = true;
	this.topBlock().fullChanged();
};


// BlockMorph //////////////////////////////////////////////////////////

/*
	I am an abstraction of all blocks (commands, reporters, hats).

	Aside from the visual settings inherited from Morph and
	SyntaxElementMorph my most important attributes and public
	accessors are:

	selector	- (string) name of method to be triggered
	receiver()	- answer the object (sprite) to which I apply
	inputs()	- answer an array with my arg slots and nested reporters
	defaults	- an optional Array containing default input values
	topBlock()	- answer the top block of the stack I'm attached to
	blockSpec	- a formalized description of my label parts
	setSpec()	- force me to change my label structure
	evaluate()	- answer the result of my evaluation
	isUnevaluated() - answer whether I am part of a special form

	Note: Some of these methods are inherited from SyntaxElementMorph
	for technical reasons, because they are shared among Block and
	MultiArgMorph (e.g. topBlock()).

	blockSpec is a formatted string consisting of plain words and
	reserved words starting with the percent character (%), which
	represent the following pre-defined input slots and/or label
	features:

	arity: single

	%br		- user-forced line break
	%s		- white rectangular type-in slot ("string-type")
	%txt	- white rectangular type-in slot ("text-type")
	%n		- white roundish type-in slot ("numerical")
	%dir	- white roundish type-in slot with drop-down for directions
	%inst	- white roundish type-in slot with drop-down for instruments
	%ida	- white roundish type-in slot with drop-down for list indices
	%idx	- white roundish type-in slot for indices incl. "any"
	%obj	- specially drawn slot for object reporters
	%spr	- chameleon colored rectangular drop-down for object-names
    %col    - chameleon colored rectangular drop-down for collidables
	%cst	- chameleon colored rectangular drop-down for costume-names
	%eff	- chameleon colored rectangular drop-down for graphic effects
	%snd	- chameleon colored rectangular drop-down for sound names
	%key	- chameleon colored rectangular drop-down for keyboard keys
	%msg	- chameleon colored rectangular drop-down for messages
	%att	- chameleon colored rectangular drop-down for attributes
	%fun	- chameleon colored rectangular drop-down for math functions
	%typ	- chameleon colored rectangular drop-down for data types
	%var	- chameleon colored rectangular drop-down for variable names
	%lst	- chameleon colored rectangular drop-down for list names
	%b		- chameleon colored hexagonal slot (for predicates)
	%l		- list icon
	%c		- C-shaped command slot
	%clr	- interactive color slot
	%t		- inline variable reporter template
	%anyUE	- white rectangular type-in slot, unevaluated if replaced
	%boolUE	- chameleon colored hexagonal slot, unevaluated if replaced
	%f		- round function slot, unevaluated if replaced,
	%r		- round reporter slot
	%p		- hexagonal predicate slot

	arity: multiple

	%mult%x	- where %x stands for any of the above single inputs
	%inputs - for an additional text label 'with inputs'
    %words - for an expandable list of minimum 2 (used in JOIN)
	%scriptVars - for an expandable list of variable reporter templates
	%parms - for an expandable list of formal parameters

    special form: upvar

    %upvar - same as %t (inline variable reporter template)
    
    special form: input name
    
    %inputName - variable blob (used in input type dialog)

	examples:

		'if %b %c else %c'		- creates Scratch's If/Else block
		'set pen color to %clr'	- creates Scratch's Pen color block
		'list %mult%s'			- creates BYOB's list reporter block
		'call %n %inputs'		- creates BYOB's Call block
		'the script %parms %c'	- creates BYOB's THE SCRIPT block
*/

// BlockMorph inherits from SyntaxElementMorph:

BlockMorph.prototype = new SyntaxElementMorph();
BlockMorph.prototype.constructor = BlockMorph;
BlockMorph.uber = SyntaxElementMorph.prototype;


// BlockMorph instance creation:

function BlockMorph() {
	this.init();
}

BlockMorph.prototype.init = function () {
	this.selector = null; // name of method to be triggered
	this.blockSpec = ''; // formal description of label and arguments
    this.instantiationSpec = null; // spec to set upon fullCopy() of template

	BlockMorph.uber.init.call(this);
	this.color = new Color(0, 17, 173);
};

BlockMorph.prototype.receiver = function () {
	// answer the object to which I apply (whose method I represent)
	var up = this.parent;
	while (!!up) {
		if (up.owner) {
			return up.owner;
		}
		up = up.parent;
	}
	return null;
};

BlockMorph.prototype.toString = function () {
	return 'a ' +
		(this.constructor.name ||
			this.constructor.toString().split(' ')[1].split('(')[0]) +
		' ("' +
		this.blockSpec.slice(0, 30) + '...")';
};

// BlockMorph spec:

BlockMorph.prototype.parseSpec = function (spec) {
	var	result = [],
		words = spec.split(' '),
		word = '';

	if (words.length === 0) {
		words = [spec];
	}
	if (this.labelWordWrap) {
		return words;
	}

	function addWord(w) {
		if ((w[0] === '%') && (w.length > 1)) {
			if (word !== '') {
				result.push(word);
				word = '';
			}
			result.push(w);
		} else {
			if (word !== '') {
				word += ' ' + w;
			} else {
				word = w;
			}
		}
	}

	words.forEach(function (each) {
		addWord(each);
	});
	if (word !== '') {
		result.push(word);
	}
	return result;
};

BlockMorph.prototype.setSpec = function (spec) {
	var	myself = this,
		part;

	this.parts().forEach(function (part) {
		part.destroy();
	});
    if (this.isPrototype) {
        this.add(this.placeHolder());
    }
	this.parseSpec(spec).forEach(function (word) {
		part = myself.labelPart(word);
		myself.add(part);
		if (!(part instanceof CommandSlotMorph)) {
			part.drawNew();
		}
		if (part instanceof MultiArgMorph
				|| part.constructor === CommandSlotMorph) {
			part.fixLayout();
		}
        if (myself.isPrototype) {
            myself.add(myself.placeHolder());
        }
	});
	this.blockSpec = spec;
	this.fixLayout();
};

BlockMorph.prototype.buildSpec = function () {
	// create my blockSpec from my parts - for demo purposes only
	var	myself = this;
	this.blockSpec = '';
	this.parts().forEach(function (part) {
		if (part instanceof StringMorph) {
			myself.blockSpec += part.text;
		} else if (part instanceof ArgMorph) {
			myself.blockSpec += part.getSpec();
		} else if (part.isBlockLabelBreak) {
			myself.blockSpec += part.getSpec();
		} else {
			myself.blockSpec += '[undefined]';
		}
		myself.blockSpec += ' ';
	});
	this.blockSpec = this.blockSpec.trim();
};

BlockMorph.prototype.rebuild = function (contrast) {
    // rebuild my label fragments, for use in ToggleElementMorphs
    this.setSpec(this.blockSpec);
    if (contrast) {
        this.inputs().forEach(function (input) {
            if (input instanceof ReporterBlockMorph) {
                input.setColor(input.color.lighter(contrast));
                input.setSpec(input.blockSpec);
            }
        });
    }
};

// BlockMorph menu:

BlockMorph.prototype.userMenu = function () {
	var menu = new MenuMorph(this);
    if (this.isTemplate) {
        return null;
    }
	menu.addItem(
		"duplicate",
		function () {
			this.fullCopy().pickUp(this.world());
		},
		'make a copy\nand pick it up'
	);
	menu.addItem("delete", 'destroy');
	return menu;
};

BlockMorph.prototype.developersMenu = function () {
	var menu = BlockMorph.uber.developersMenu.call(this);
	menu.addLine();
	menu.addItem("delete block", 'deleteBlock');
	menu.addItem("spec...", function () {

		new DialogBoxMorph(
			this,
			this.setSpec,
			this
		).prompt(
			menu.title + '\nspec',
			this.blockSpec,
			this.world()
		);
	});
	return menu;
};

BlockMorph.prototype.deleteBlock = function () {
	// delete just this one block, keep inputs and next block around
	var	scripts = this.parentThatIsA(ScriptsMorph),
		nb = this.nextBlock ? this.nextBlock() : null,
		tobefixed,
		isindef;
	if (scripts) {
		if (nb) {
			scripts.add(nb);
		}
		this.inputs().forEach(function (inp) {
			if (inp instanceof BlockMorph) {
				scripts.add(inp);
			}
		});
	}
	if (this instanceof ReporterBlockMorph) {
		if (this.parent instanceof BlockMorph) {
			this.parent.revertToDefaultInput(this);
		}
	} else { // CommandBlockMorph
		if (this.parent) {
			if (this.parent.fixLayout) {
				tobefixed = this.parentThatIsA(ArgMorph);
			}
		} else { // must be in a custom block definition
			isindef = true;
		}
	}
	this.destroy();
	if (isindef) {
		/*
			since the definition's body still points to this block
			even after it has been destroyed, mark it to be deleted
			later.
		*/
		this.isCorpse = true;
	}
	if (tobefixed) {
		tobefixed.fixLayout();
	}
};

// BlockMorph drawing

BlockMorph.prototype.eraseCSlotAreas = function (context) {
	var myself = this,
		shift = this.edge * 0.5,
		gradient,
		rightX,
		cslots = this.parts().filter(function (part) {
			return part instanceof CSlotMorph;
		});

	if (this.isPredicate && (cslots.length > 0)) {
		rightX = this.width() - this.rounding;
		context.clearRect(
			rightX,
			0,
			this.width(),
			this.height()
		);

		// draw a 3D-ish vertical right edge
		gradient = context.createLinearGradient(
			rightX - this.edge,
			0,
			this.width(),
			0
		);
		gradient.addColorStop(0, this.color.toString());
		gradient.addColorStop(1, this.dark());
		context.lineWidth = this.edge;
		context.lineJoin = 'round';
		context.lineCap = 'round';
		context.strokeStyle = gradient;
		context.beginPath();
		context.moveTo(rightX - shift, this.edge + shift);
		context.lineTo(rightX - shift, this.height() - this.edge - shift);
		context.stroke();
	}

	cslots.forEach(function (cslot) {
		var	w = cslot.width(),
			h = cslot.height() - 1; // Opera needs this
		context.clearRect(
			cslot.bounds.origin.x - myself.bounds.origin.x,
			cslot.bounds.origin.y - myself.bounds.origin.y,
			w,
			h
		);
	});
};

// BlockMorph highlighting

BlockMorph.prototype.addHighlight = function () {
	var	highlight = this.highlight(
		this.activeHighlight,
		this.activeBlur
	);
	this.addBack(highlight);
	this.fullChanged();
	return highlight;
};

BlockMorph.prototype.addErrorHighlight = function () {
	var	highlight;
	this.removeHighlight();
	highlight = this.highlight(
		this.errorHighlight,
		this.activeBlur
	);
	this.addBack(highlight);
	this.fullChanged();
	return highlight;
};

BlockMorph.prototype.removeHighlight = function () {
	var highlight = this.getHighlight();
	if (highlight !== null) {
		this.fullChanged();
		this.removeChild(highlight);
	}
};

BlockMorph.prototype.toggleHighlight = function () {
	if (this.getHighlight()) {
		this.removeHighlight();
	} else {
		this.addHighlight();
	}
};

BlockMorph.prototype.highlight = function (color, blur) {
	var	highlight = new BlockHighlightMorph(),
		fb = this.fullBounds();
	highlight.setExtent(fb.extent().add(blur * 2));
	highlight.image = this.highlightImage(color, blur);
	highlight.setPosition(fb.origin.subtract(new Point(blur, blur)));
	return highlight;
};

BlockMorph.prototype.highlightImage = function (color, blur) {
	var	fb, img, hi, ctx;
	fb = this.fullBounds().extent();
	img = this.fullImage();

	hi = newCanvas(fb.add(blur * 2));
	ctx = hi.getContext('2d');
	ctx.shadowBlur = blur;
	ctx.shadowColor = color.toString();
	ctx.drawImage(img, blur, blur);

	ctx.shadowBlur = 0;
	ctx.globalCompositeOperation = 'destination-out';
	ctx.drawImage(img, blur, blur);
	return hi;
};

BlockMorph.prototype.getHighlight = function () {
	var highlights;
	highlights = this.children.slice(0).reverse().filter(
		function (child) {
			return child instanceof BlockHighlightMorph;
		}
	);
	if (highlights.length !== 0) {
		return highlights[0];
	}
    return null;
};

// BlockMorph copying

BlockMorph.prototype.fullCopy = function () {
	var ans = BlockMorph.uber.fullCopy.call(this);
	ans.removeHighlight();
    if (this.instantiationSpec) {
        ans.setSpec(this.instantiationSpec);
    }
	return ans;
};

// BlockMorph events

BlockMorph.prototype.mouseClickLeft = function () {
	var	top = this.topBlock(),
		receiver = top.receiver(),
		stage;
    if (top instanceof PrototypeHatBlockMorph) {
        return top.mouseClickLeft();
    }
	if (receiver) {
		stage = receiver.parentThatIsA(StageMorph);
		if (stage) {
			stage.threads.toggleProcess(top);
		}
	}
};

// BlockMorph dragging and dropping

BlockMorph.prototype.rootForGrab = function () {
	return this;
};

/*
	for demo purposes, allows you to drop arg morphs onto
	blocks and forces a layout update. This section has
	no relevance in end user mode.
*/

BlockMorph.prototype.wantsDropOf = function (aMorph) {
	// override the inherited method
	return (aMorph instanceof ArgMorph
		|| aMorph instanceof StringMorph
		|| aMorph instanceof TextMorph
	) && !this.isTemplate;
};

BlockMorph.prototype.reactToDropOf = function (droppedMorph) {
	droppedMorph.isDraggable = false;
	if (droppedMorph instanceof InputSlotMorph) {
		droppedMorph.drawNew();
	} else if (droppedMorph instanceof MultiArgMorph) {
		droppedMorph.fixLayout();
	}
	this.fixLayout();
	this.buildSpec();
};

// CommandBlockMorph ///////////////////////////////////////////////////

/*
	I am a stackable jigsaw-shaped block.

	I inherit from BlockMorph adding the following most important
	public accessors:

	nextBlock()		- set / get the block attached to my bottom
	bottomBlock()	- answer the bottom block of my stack
	blockSequence()	- answer an array of blocks starting with myself
*/

// CommandBlockMorph inherits from BlockMorph:

CommandBlockMorph.prototype = new BlockMorph();
CommandBlockMorph.prototype.constructor = CommandBlockMorph;
CommandBlockMorph.uber = BlockMorph.prototype;

// CommandBlockMorph instance creation:

function CommandBlockMorph() {
	this.init();
}

CommandBlockMorph.prototype.init = function () {
	CommandBlockMorph.uber.init.call(this);
	this.setExtent(new Point(200, 100));
};

// CommandBlockMorph enumerating:

CommandBlockMorph.prototype.blockSequence = function () {
	var	nb = this.nextBlock(),
		result = [this];
	if (nb) {
		result = result.concat(nb.blockSequence());
	}
	return result;
};

CommandBlockMorph.prototype.bottomBlock = function () {
	// topBlock() also exists - inherited from SyntaxElementMorph
	if (this.nextBlock()) {
		return this.nextBlock().bottomBlock();
	}
    return this;
};

CommandBlockMorph.prototype.nextBlock = function (block) {
	// set / get the block attached to my bottom
	if (block) {
		var	nb = this.nextBlock(),
			affected = this.parentThatIsA(CommandSlotMorph);
		this.add(block);
		if (nb) {
			block.bottomBlock().nextBlock(nb);
		}
		this.fixLayout();
		if (affected) {
			affected.fixLayout();
		}
	} else {
		return detect(
			this.children,
			function (child) {
				return child instanceof CommandBlockMorph
					&& !child.isPrototype;
			}
		);
	}
};

// CommandBlockMorph attach targets:

CommandBlockMorph.prototype.topAttachPoint = function () {
	return new Point(
		this.dentCenter(),
		this.top()
	);
};

CommandBlockMorph.prototype.bottomAttachPoint = function () {
	return new Point(
		this.dentCenter(),
		this.bottom()
	);
};

CommandBlockMorph.prototype.dentLeft = function () {
	return this.left()
		+ this.corner
		+ this.inset;
};

CommandBlockMorph.prototype.dentCenter = function () {
	return this.dentLeft()
		+ this.corner
		+ (this.dent * 0.5);
};

CommandBlockMorph.prototype.attachTargets = function () {
	var answer = [];
	if (!(this instanceof HatBlockMorph)) {
		if (!(this.parent instanceof SyntaxElementMorph)) {
			answer.push({
				point: this.topAttachPoint(),
				element: this,
				loc: 'top',
				type: 'block'
			});
		}
	}
	if (!this.isStop()) {
		answer.push({
			point: this.bottomAttachPoint(),
			element: this,
			loc: 'bottom',
			type: 'block'
		});
	}
	return answer;
};

CommandBlockMorph.prototype.allAttachTargets = function (newParent) {
	var	myself = this,
		target = newParent || this.parent,
		answer = [],
		topBlocks;

	topBlocks = target.children.filter(function (child) {
		return (child !== myself) &&
			child instanceof SyntaxElementMorph &&
			!child.isTemplate;
	});
	topBlocks.forEach(function (block) {
		block.forAllChildren(function (child) {
			if (child.attachTargets) {
				child.attachTargets().forEach(function (at) {
					answer.push(at);
				});
			}
		});
	});
	return answer;
};

CommandBlockMorph.prototype.closestAttachTarget = function (newParent) {
	var	target = newParent || this.parent,
		bottomBlock = this.bottomBlock(),
		answer = null,
		thresh = Math.max(
			this.corner * 2 + this.dent,
			this.minSnapDistance
		),
		dist,
		ref = [],
		minDist = 1000;

	if (!(this instanceof HatBlockMorph)) {
		ref.push(
			{
				point: this.topAttachPoint(),
				loc: 'top'
			}
		);
	}
	if (!this.isStop()) {
		ref.push(
			{
				point: bottomBlock.bottomAttachPoint(),
				loc: 'bottom'
			}
		);
	}

	this.allAttachTargets(target).forEach(function (eachTarget) {
		ref.forEach(function (eachRef) {
			if (eachRef.loc !== eachTarget.loc) {
				dist = eachRef.point.distanceTo(eachTarget.point);
				if ((dist < thresh) && (dist < minDist)) {
					minDist = dist;
					answer = eachTarget;
				}
			}
		});
	});
	return answer;
};

CommandBlockMorph.prototype.snap = function () {
	var	target = this.closestAttachTarget(),
		next,
		offsetY,
		affected;

	if (target === null) {
		return null;
	}
	this.startLayout();
	if (target.loc === 'bottom') {
		if (target.type === 'slot') {
			target.element.nestedBlock(this);
		} else {
			target.element.nextBlock(this);
		}
		if (this.isStop()) {
			next = this.nextBlock();
			if (next) {
				this.parentThatIsA(ScriptsMorph).add(next);
				next.moveBy(this.extent().floorDivideBy(2));
				affected = this.parentThatIsA(CommandSlotMorph);
				if (affected) {
					affected.fixLayout();
				}
			}
		}
	} else if (target.loc === 'top') {
		offsetY = this.bottomBlock().bottom() - this.bottom();
		this.setBottom(target.element.top() + this.corner - offsetY);
		this.setLeft(target.element.left());
		this.bottomBlock().nextBlock(target.element);
	}
	this.endLayout();
};

CommandBlockMorph.prototype.isStop = function () {
	return ([
		'doStop',
		'doStopAll',
		'doForever',
		'doReport'
	].indexOf(this.selector) > -1);
};

// CommandBlockMorph drawing:

CommandBlockMorph.prototype.drawNew = function () {
	var context;
	this.cachedClr = this.color.toString();
	this.cachedClrBright = this.bright();
	this.cachedClrDark = this.dark();
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	context.fillStyle = this.cachedClr;

	// draw the 'flat' shape:
	this.drawTop(context);
	this.drawBody(context);
	this.drawBottom(context);

	// add 3D-Effect:
	this.drawTopDentEdge(context, 0, 0);
	this.drawBottomDentEdge(context, 0, this.height() - this.corner);
	this.drawLeftEdge(context);
	this.drawRightEdge(context);
	this.drawTopLeftEdge(context);
	this.drawBottomRightEdge(context);

	// erase CommandSlots
	this.eraseCSlotAreas(context);
};

CommandBlockMorph.prototype.drawBody = function (context) {
	context.fillRect(
		0,
		this.corner,
		this.width(),
		this.height() - (this.corner * 3)
	);
};

CommandBlockMorph.prototype.drawTop = function (context) {
	context.beginPath();

	// top left:
	context.arc(
		this.corner,
		this.corner,
		this.corner,
		radians(-180),
		radians(-90),
		false
	);

	// dent:
	this.drawDent(context, 0, 0);

	// top right:
	context.arc(
		this.width() - this.corner,
		this.corner,
		this.corner,
		radians(-90),
		radians(-0),
		false
	);

	context.closePath();
	context.fill();
};

CommandBlockMorph.prototype.drawBottom = function (context) {
	var y = this.height() - (this.corner * 2);

	context.beginPath();

	// bottom left:
	context.arc(
		this.corner,
		y,
		this.corner,
		radians(180),
		radians(90),
		true
	);

	if (!this.isStop()) {
		this.drawDent(context, 0, this.height() - this.corner);
	}

	// bottom right:
	context.arc(
		this.width() - this.corner,
		y,
		this.corner,
		radians(90),
		radians(0),
		true
	);

	context.closePath();
	context.fill();
};

CommandBlockMorph.prototype.drawDent = function (context, x, y) {
	var indent = x + this.corner * 2 + this.inset;

	context.lineTo(x + this.corner + this.inset, y);
	context.lineTo(indent, y + this.corner);
	context.lineTo(indent + this.dent, y + this.corner);
	context.lineTo(x + this.corner * 3 + this.inset + this.dent, y);
	context.lineTo(this.width() - this.corner, y);
};

CommandBlockMorph.prototype.drawTopDentEdge = function (context, x, y) {
	var	shift = this.edge * 0.5,
		indent = x + this.corner * 2 + this.inset,
		upperGradient,
		lowerGradient,
		leftGradient,
		lgx;

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	upperGradient = context.createLinearGradient(
		0,
		y,
		0,
		y + this.edge
	);
	upperGradient.addColorStop(0, this.cachedClrBright);
	upperGradient.addColorStop(1, this.cachedClr);

	context.strokeStyle = upperGradient;
	context.beginPath();
	context.moveTo(this.corner, y + shift);
	context.lineTo(x + this.corner + this.inset, y + shift);
	context.stroke();

	context.strokeStyle = upperGradient;
	context.beginPath();
	context.moveTo(
		x + this.corner * 3 + this.inset + this.dent + shift,
		y + shift
	);
	context.lineTo(this.width() - this.corner, y + shift);
	context.stroke();

	lgx = x + this.corner + this.inset;
	leftGradient = context.createLinearGradient(
		lgx - this.edge,
		y + this.edge,
		lgx,
		y
	);
	leftGradient.addColorStop(0, this.cachedClr);
	leftGradient.addColorStop(1, this.cachedClrBright);

	context.strokeStyle = leftGradient;
	context.beginPath();
	context.moveTo(x + this.corner + this.inset, y + shift);
	context.lineTo(indent, y + this.corner + shift);
	context.stroke();

	lowerGradient = context.createLinearGradient(
		0,
		y + this.corner,
		0,
		y + this.corner + this.edge
	);
	lowerGradient.addColorStop(0, this.cachedClrBright);
	lowerGradient.addColorStop(1, this.cachedClr);

	context.strokeStyle = lowerGradient;
	context.beginPath();
	context.moveTo(indent, y + this.corner + shift);
	context.lineTo(indent + this.dent, y + this.corner + shift);
	context.stroke();
};

CommandBlockMorph.prototype.drawBottomDentEdge = function (context, x, y) {
	var	shift = this.edge * 0.5,
		indent = x + this.corner * 2 + this.inset,
		upperGradient,
		lowerGradient,
		rightGradient;

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	upperGradient = context.createLinearGradient(
		0,
		y - this.edge,
		0,
		y
	);
	upperGradient.addColorStop(0, this.cachedClr);
	upperGradient.addColorStop(1, this.cachedClrDark);

	context.strokeStyle = upperGradient;
	context.beginPath();
	context.moveTo(this.corner, y - shift);
	if (this.isStop()) {
		context.lineTo(this.width() - this.corner, y - shift);
	} else {
		context.lineTo(x + this.corner + this.inset - shift, y - shift);
	}
	context.stroke();

	if (this.isStop()) {	// draw straight bottom edge
		return null;
	}

	lowerGradient = context.createLinearGradient(
		0,
		y + this.corner - this.edge,
		0,
		y + this.corner
	);
	lowerGradient.addColorStop(0, this.cachedClr);
	lowerGradient.addColorStop(1, this.cachedClrDark);

	context.strokeStyle = lowerGradient;
	context.beginPath();
	context.moveTo(indent + shift, y + this.corner - shift);
	context.lineTo(indent + this.dent, y + this.corner - shift);
	context.stroke();

	rightGradient = context.createLinearGradient(
		x + indent + this.dent - this.edge,
		y + this.corner - this.edge,
		x + indent + this.dent,
		y + this.corner
	);
	rightGradient.addColorStop(0, this.cachedClr);
	rightGradient.addColorStop(1, this.cachedClrDark);

	context.strokeStyle = rightGradient;
	context.beginPath();
	context.moveTo(x + indent + this.dent, y + this.corner - shift);
	context.lineTo(
		x + this.corner * 3 + this.inset + this.dent,
		y - shift
	);
	context.stroke();

	context.strokeStyle = upperGradient;
	context.beginPath();
	context.moveTo(
		x + this.corner * 3 + this.inset + this.dent,
		y - shift
	);
	context.lineTo(this.width() - this.corner, y - shift);
	context.stroke();
};

CommandBlockMorph.prototype.drawLeftEdge = function (context) {
	var	shift = this.edge * 0.5,
		gradient = context.createLinearGradient(0, 0, this.edge, 0);

	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(shift, this.corner);
	context.lineTo(shift, this.height() - this.corner * 2 - shift);
	context.stroke();
};

CommandBlockMorph.prototype.drawRightEdge = function (context) {
	var	shift = this.edge * 0.5,
		x = this.width(),
		gradient;

	gradient = context.createLinearGradient(x - this.edge, 0, x, 0);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(x - shift, this.corner + shift);
	context.lineTo(x - shift, this.height() - this.corner * 2);
	context.stroke();
};

CommandBlockMorph.prototype.drawTopLeftEdge = function (context) {
	var	shift = this.edge * 0.5,
		gradient;

	gradient = context.createRadialGradient(
		this.corner,
		this.corner,
		this.corner,
		this.corner,
		this.corner,
		this.corner - this.edge
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	context.strokeStyle = gradient;

	context.beginPath();
	context.arc(
		this.corner,
		this.corner,
		this.corner - shift,
		radians(-180),
		radians(-90),
		false
	);
	context.stroke();
};

CommandBlockMorph.prototype.drawBottomRightEdge = function (context) {
	var	shift = this.edge * 0.5,
		x = this.width() - this.corner,
		y = this.height() - this.corner * 2,
		gradient;

	gradient = context.createRadialGradient(
		x,
		y,
		this.corner,
		x,
		y,
		this.corner - this.edge
	);
	gradient.addColorStop(0, this.cachedClrDark);
	gradient.addColorStop(1, this.cachedClr);

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	context.strokeStyle = gradient;

	context.beginPath();
	context.arc(
		x,
		y,
		this.corner - shift,
		radians(90),
		radians(0),
		true
	);
	context.stroke();
};

// HatBlockMorph ///////////////////////////////////////////////////////

/*
	I am a script's top most block. I can attach command blocks at my
	bottom, but not on top.

*/

// HatBlockMorph inherits from CommandBlockMorph:

HatBlockMorph.prototype = new CommandBlockMorph();
HatBlockMorph.prototype.constructor = HatBlockMorph;
HatBlockMorph.uber = CommandBlockMorph.prototype;

// HatBlockMorph instance creation:

function HatBlockMorph() {
	this.init();
}

HatBlockMorph.prototype.init = function () {
	HatBlockMorph.uber.init.call(this);
	this.setExtent(new Point(300, 150));
};

// HatBlockMorph enumerating:

HatBlockMorph.prototype.blockSequence = function () {
	// override my inherited method so that I am not part of my sequence
	var result = HatBlockMorph.uber.blockSequence.call(this);
	result.shift();
	return result;
};

// HatBlockMorph drawing:

HatBlockMorph.prototype.drawTop = function (context) {
	var	s = this.hatWidth,
		h = this.hatHeight,
		r = ((4 * h * h) + (s * s)) / (8 * h),
		a = degrees(4 * Math.atan(2 * h / s)),
		sa = a / 2,
        sp = Math.min(s * 1.7, this.width() - this.corner);

	context.beginPath();

	context.moveTo(0, h + this.corner);

	// top arc:
	context.arc(
		s / 2,
		r,
		r,
		radians(-sa - 90),
		radians(-90),
		false
	);
	context.bezierCurveTo(
		s,
		0,
		s,
		h,
		sp,
		h
	);

	// top right:
	context.arc(
		this.width() - this.corner,
		h + this.corner,
		this.corner,
		radians(-90),
		radians(-0),
		false
	);

	context.closePath();
	context.fill();
};

HatBlockMorph.prototype.drawBody = function (context) {
	context.fillRect(
		0,
		this.hatHeight + this.corner,
		this.width(),
		this.height() - (this.corner * 3) - (this.hatHeight)
	);
};

HatBlockMorph.prototype.drawLeftEdge = function (context) {
	var	shift = this.edge * 0.5,
		gradient = context.createLinearGradient(0, 0, this.edge, 0);

	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(shift, this.hatHeight + shift);
	context.lineTo(shift, this.height() - this.corner * 2 - shift);
	context.stroke();
};

HatBlockMorph.prototype.drawRightEdge = function (context) {
	var	shift = this.edge * 0.5,
		x = this.width(),
		gradient;

	gradient = context.createLinearGradient(x - this.edge, 0, x, 0);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(x - shift, this.corner + this.hatHeight + shift);
	context.lineTo(x - shift, this.height() - this.corner * 2);
	context.stroke();
};

HatBlockMorph.prototype.drawTopDentEdge = function () {
	return null;
};

HatBlockMorph.prototype.drawTopLeftEdge = function (context) {
	var	shift = this.edge * 0.5,
		s = this.hatWidth,
		h = this.hatHeight,
		r = ((4 * h * h) + (s * s)) / (8 * h),
		a = degrees(4 * Math.atan(2 * h / s)),
		sa = a / 2,
        sp = Math.min(s * 1.7, this.width() - this.corner),
		gradient;

	gradient = context.createRadialGradient(
		s / 2,
		r,
		r - this.edge,
		s / 2,
		r,
		r
	);
	gradient.addColorStop(1, this.cachedClrBright);
	gradient.addColorStop(0, this.cachedClr);

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	context.strokeStyle = gradient;
	context.beginPath();
	context.arc(
		Math.round(s / 2),
		r,
		r - shift,
		radians(-sa - 90),
		radians(-90),
		false
	);
	context.moveTo(s / 2, shift);
	context.bezierCurveTo(
		s,
		shift,
		s,
		h + shift,
		sp,
		h + shift
	);
    context.lineTo(this.width() - this.corner, h + shift);
	context.stroke();
};

// ReporterBlockMorph //////////////////////////////////////////////////

/*
	I am a block with a return value, either round-ish or diamond shaped
	I inherit all my important accessors from BlockMorph
*/

// ReporterBlockMorph inherits from BlockMorph:

ReporterBlockMorph.prototype = new BlockMorph();
ReporterBlockMorph.prototype.constructor = ReporterBlockMorph;
ReporterBlockMorph.uber = BlockMorph.prototype;

// ReporterBlockMorph instance creation:

function ReporterBlockMorph(isPredicate) {
	this.init(isPredicate);
}

ReporterBlockMorph.prototype.init = function (isPredicate) {
	ReporterBlockMorph.uber.init.call(this);
	this.isPredicate = isPredicate || false;
	this.setExtent(new Point(200, 80));
};

// ReporterBlockMorph drag & drop:

ReporterBlockMorph.prototype.snap = function () {
	if (!this.parent instanceof ScriptsMorph) {
		return null;
	}

	var	target = this.parent.closestInput(this);

	if (target !== null) {
		target.parent.replaceInput(target, this);
	}
};

ReporterBlockMorph.prototype.prepareToBeGrabbed = function (handMorph) {
	var oldPos = this.position();

	nop(handMorph);
	if ((this.parent instanceof BlockMorph)
			|| (this.parent instanceof MultiArgMorph)
			|| (this.parent instanceof ReporterSlotMorph)) {
		this.parent.revertToDefaultInput(this);
		this.setPosition(oldPos);
	}
};

// ReporterBlockMorph enumerating

ReporterBlockMorph.prototype.blockSequence = function () {
	// reporters don't have a sequence, answer myself
	return this;
};

// ReporterBlockMorph evaluating

ReporterBlockMorph.prototype.isUnevaluated = function () {
/*
	answer whether my parent block's slot is designated to be of an
	'unevaluated' kind, denoting a spedial form
*/
	return contains(['%anyUE', '%boolUE', '%f'], this.getSlotSpec());
};

ReporterBlockMorph.prototype.isLocked = function () {
	// answer true if I can be exchanged by a dropped reporter
	return this.isStatic || (this.getSlotSpec() === '%t');
};

ReporterBlockMorph.prototype.getSlotSpec = function () {
	// answer the spec of the slot I'm in, if any
	var parts, idx;
	if (this.parent instanceof BlockMorph) {
		parts = this.parent.parts().filter(
			function (part) {
				return !(part instanceof BlockHighlightMorph);
			}
		);
		idx = parts.indexOf(this);
		if (idx !== -1) {
			if (this.parent.blockSpec) {
				return this.parseSpec(this.parent.blockSpec)[idx];
			}
		}
	}
    if (this.parent instanceof MultiArgMorph) {
		return this.parent.slotSpec;
	}
    if (this.parent instanceof TemplateSlotMorph) {
		return this.parent.getSpec();
	}
	return null;
};

// ReporterBlockMorph events

ReporterBlockMorph.prototype.mouseClickLeft = function (pos) {
    if (this.parent instanceof BlockInputFragmentMorph) {
        return this.parent.mouseClickLeft();
    }
	if (this.parent instanceof TemplateSlotMorph) {
		new DialogBoxMorph(
			this,
			this.setSpec,
			this
		).prompt(
			"Input name",
			this.blockSpec,
			this.world()
		);
	} else {
		ReporterBlockMorph.uber.mouseClickLeft.call(this, pos);
	}
};

// ReporterBlockMorph drawing:

ReporterBlockMorph.prototype.drawNew = function () {
	var context;
	this.cachedClr = this.color.toString();
	this.cachedClrBright = this.bright();
	this.cachedClrDark = this.dark();
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	context.fillStyle = this.cachedClr;

	if (this.isPredicate) {
		this.drawDiamond(context);
	} else {
		this.drawRounded(context);
	}

	// erase CommandSlots
	this.eraseCSlotAreas(context);
};

ReporterBlockMorph.prototype.drawRounded = function (context) {
	var	h = this.height(),
		r = Math.min(this.rounding, h / 2),
		w = this.width(),
		shift = this.edge / 2,
		gradient;

	// draw the 'flat' shape:
	context.fillStyle = this.cachedClr;
	context.beginPath();

	// top left:
	context.arc(
		r,
		r,
		r,
		radians(-180),
		radians(-90),
		false
	);

	// top right:
	context.arc(
		w - r,
		r,
		r,
		radians(-90),
		radians(-0),
		false
	);

	// bottom right:
	context.arc(
		w - r,
		h - r,
		r,
		radians(0),
		radians(90),
		false
	);

	// bottom left:
	context.arc(
		r,
		h - r,
		r,
		radians(90),
		radians(180),
		false
	);

	context.closePath();
	context.fill();


	// add 3D-Effect:
	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	// half-tone edges
	// bottem left corner
	gradient = context.createRadialGradient(
		r,
		h - r,
		r - this.edge,
		r,
		h - r,
		r + this.edge
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrBright);
	context.strokeStyle = gradient;
	context.beginPath();
	context.arc(
		r,
		h - r,
		r - shift,
		radians(90),
		radians(180),
		false
	);
	context.stroke();

	// top right corner
	gradient = context.createRadialGradient(
		w - r,
		r,
		r - this.edge,
		w - r,
		r,
		r + this.edge
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	context.strokeStyle = gradient;
	context.beginPath();
	context.arc(
		w - r,
		r,
		r - shift,
		radians(-90),
		radians(0),
		false
	);
	context.stroke();

	// normal gradient edges

	// top edge: straight line
	gradient = context.createLinearGradient(
		0,
		0,
		0,
		this.edge
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(r - shift, shift);
	context.lineTo(w - r + shift, shift);
	context.stroke();

	// top edge: left corner
	gradient = context.createRadialGradient(
		r,
		r,
		r - this.edge,
		r,
		r,
		r
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrBright);
	context.strokeStyle = gradient;
	context.beginPath();
	context.arc(
		r,
		r,
		r - shift,
		radians(180),
		radians(270),
		false
	);
	context.stroke();

	// bottom edge: right corner
	gradient = context.createRadialGradient(
		w - r,
		h - r,
		r - this.edge,
		w - r,
		h - r,
		r
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	context.strokeStyle = gradient;
	context.beginPath();
	context.arc(
		w - r,
		h - r,
		r - shift,
		radians(0),
		radians(90),
		false
	);
	context.stroke();

	// bottom edge: straight line
	gradient = context.createLinearGradient(
		0,
		h - this.edge,
		0,
		h
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(r - shift, h - shift);
	context.lineTo(w - r + shift, h - shift);
	context.stroke();

	// left edge: straight vertical line
	gradient = context.createLinearGradient(0, 0, this.edge, 0);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(shift, r);
	context.lineTo(shift, h - r);
	context.stroke();

	// right edge: straight vertical line
	gradient = context.createLinearGradient(w - this.edge, 0, w, 0);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(w - shift, r + shift);
	context.lineTo(w - shift, h - r);
	context.stroke();

};

ReporterBlockMorph.prototype.drawDiamond = function (context) {
	var	w = this.width(),
		h = this.height(),
		h2 = Math.floor(h / 2),
		r = this.rounding,
		shift = this.edge / 2,
		gradient;

	// draw the 'flat' shape:
	context.fillStyle = this.cachedClr;
	context.beginPath();

	context.moveTo(0, h2);
	context.lineTo(r, 0);
	context.lineTo(w - r, 0);
	context.lineTo(w, h2);
	context.lineTo(w - r, h);
	context.lineTo(r, h);

	context.closePath();
	context.fill();

	// add 3D-Effect:
	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	// half-tone edges
	// bottom left corner
	gradient = context.createLinearGradient(
		-r,
		0,
		r,
		0
	);
	gradient.addColorStop(1, this.cachedClr);
	gradient.addColorStop(0, this.cachedClrBright);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(shift, h2);
	context.lineTo(r, h - shift);
	context.closePath();
	context.stroke();

	// top right corner
	gradient = context.createLinearGradient(
		w - r,
		0,
		w + r,
		0
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(w - shift, h2);
	context.lineTo(w - r, shift);
	context.closePath();
	context.stroke();

	// normal gradient edges
	// top edge: left corner
	gradient = context.createLinearGradient(
		0,
		0,
		r,
		0
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(shift, h2);
	context.lineTo(r, shift);
	context.closePath();
	context.stroke();

	// top edge: straight line
	gradient = context.createLinearGradient(
		0,
		0,
		0,
		this.edge
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(r, shift);
	context.lineTo(w - r, shift);
	context.closePath();
	context.stroke();

	// bottom edge: right corner
	gradient = context.createLinearGradient(
		w - r,
		0,
		w,
		0
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(w - r, h - shift);
	context.lineTo(w - shift, h2);
	context.closePath();
	context.stroke();

	// bottom edge: straight line
	gradient = context.createLinearGradient(
		0,
		h - this.edge,
		0,
		h
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(r + shift, h - shift);
	context.lineTo(w - r - shift, h - shift);
	context.closePath();
	context.stroke();
};

// ScriptsMorph ////////////////////////////////////////////////////////

/*
	I give feedback about possible drop targets and am in charge
	of actually snapping blocks together.

	My children are the top blocks of scripts.

	I store a back-pointer to my owner, i.e. the object (sprite)
	to whom my scripts apply.
*/

// ScriptsMorph inherits from FrameMorph:

ScriptsMorph.prototype = new FrameMorph();
ScriptsMorph.prototype.constructor = ScriptsMorph;
ScriptsMorph.uber = FrameMorph.prototype;

// ScriptsMorph preference settings

ScriptsMorph.prototype.cleanUpMargin = 20;
ScriptsMorph.prototype.cleanUpSpacing = 15;

// ScriptsMorph instance creation:

function ScriptsMorph(owner) {
	this.init(owner);
}

ScriptsMorph.prototype.init = function (owner) {
	this.owner = owner || null;
	this.feedbackColor = SyntaxElementMorph.prototype.feedbackColor;
	this.feedbackMorph = new BoxMorph();

	ScriptsMorph.uber.init.call(this);
	this.setColor(new Color(70, 70, 70));
};

// ScriptsMorph stepping:

ScriptsMorph.prototype.step = function () {
	var hand = this.world().hand,
		block;

	if (this.feedbackMorph.parent) {
		this.feedbackMorph.destroy();
	}
	if (hand.children.length === 0) {
		return null;
	}
	if (!this.bounds.containsPoint(hand.bounds.origin)) {
		return null;
	}
	block = hand.children[0];
	if (!(block instanceof BlockMorph)) {
		return null;
	}
    if (!contains(hand.morphAtPointer().allParents(), this)) {
        return null;
    }
	if (block instanceof ReporterBlockMorph) {
		this.showReporterDropFeedback(block);
	} else {
		this.showCommandDropFeedback(block);
	}
};

ScriptsMorph.prototype.showReporterDropFeedback = function (block) {
	var	target = this.closestInput(block);

	if (target === null) {
		return null;
	}
	this.feedbackMorph.bounds = target.fullBounds()
		.expandBy(Math.max(
			block.edge * 2,
			block.reporterDropFeedbackPadding
		));
	this.feedbackMorph.edge = SyntaxElementMorph.prototype.rounding;
	this.feedbackMorph.border = Math.max(
		SyntaxElementMorph.prototype.edge,
		3
	);
	this.add(this.feedbackMorph);
	this.feedbackMorph.color = this.feedbackColor.copy();
	this.feedbackMorph.color.a = 0.5;
	this.feedbackMorph.borderColor = this.feedbackColor;
	this.feedbackMorph.drawNew();
	this.feedbackMorph.changed();
};

ScriptsMorph.prototype.showCommandDropFeedback = function (block) {
	var y, target;

	target = block.closestAttachTarget(this);
	if (!target) {
		return null;
	}
	this.add(this.feedbackMorph);
	this.feedbackMorph.border = 0;
	this.feedbackMorph.edge = 0;
	this.feedbackMorph.alpha = 1;
	this.feedbackMorph.setExtent(new Point(
		target.element.width(),
		Math.max(
			SyntaxElementMorph.prototype.corner,
			SyntaxElementMorph.prototype.feedbackMinHeight
		)
	));
	this.feedbackMorph.color = this.feedbackColor;
	this.feedbackMorph.drawNew();
	this.feedbackMorph.changed();
	y = target.point.y;
	if (target.loc === 'bottom') {
		if (target.type === 'block') {
			if (target.element.nextBlock()) {
				y -= SyntaxElementMorph.prototype.corner;
			}
		} else if (target.type === 'slot') {
			if (target.element.nestedBlock()) {
				y -= SyntaxElementMorph.prototype.corner;
			}
		}
	}
	this.feedbackMorph.setPosition(new Point(
		target.element.left(),
		y
	));
};

ScriptsMorph.prototype.closestInput = function (reporter) {
	var	fb = reporter.fullBoundsNoShadow(),
		stack = detect(
			this.children,
			function (child) {
				return (child instanceof BlockMorph) &&
					(child.fullBounds().intersects(fb));
			}
		),
		blackList = reporter.allInputs();

	if (stack === null) {
		return null;
	}
	return detect(
		stack.allInputs(),
		function (input) {
			return (input !== reporter)
				&& !input.isLocked()
				&& input.fullBounds().intersects(fb)
                && !(input.parent instanceof PrototypeHatBlockMorph)
				&& !contains(blackList, input);
		}
	);
};

// ScriptsMorph user menu

ScriptsMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this),
        ide = this.parentThatIsA(IDE_Morph),
        myself = this,
        obj = this.owner;

    menu.addItem('clean up', 'cleanUp', 'arrange scripts\nvertically');
    if (ide) {
        menu.addItem(
            'make a block...',
            function () {
                new BlockDialogMorph(
                    null,
                    function (definition) {
                        if (definition.spec !== '') {
                            obj.customBlocks.push(definition);
                            obj.cacheCustomBlock(definition);
                            ide.refreshPalette();
                            new BlockEditorMorph(definition, obj).popUp();
                        }
                    },
                    myself
                ).prompt(
                    'Make a block',
                    null,
                    myself.world()
                );
            }
        );
    }
    return menu;
};

// ScriptsMorph user menu features:

ScriptsMorph.prototype.cleanUp = function () {
    var origin = this.topLeft(),
        y = this.cleanUpMargin;
    this.children.sort(function (a, b) {
        return a.top() - b.top();
    }).forEach(function (child) {
        child.setPosition(origin.add(new Point(this.cleanUpMargin, y)));
        y += child.fullBounds().height() + this.cleanUpSpacing;
    }, this);
    if (this.parent) {
        this.setPosition(this.parent.topLeft());
    }
    this.adjustBounds();
};

// ScriptsMorph drag & drop:

ScriptsMorph.prototype.wantsDropOf = function (aMorph) {
	// override the inherited method
	return aMorph instanceof SyntaxElementMorph;
};

ScriptsMorph.prototype.reactToDropOf = function (droppedMorph) {
	if (droppedMorph instanceof BlockMorph) {
		droppedMorph.snap();
	}
	this.adjustBounds();
};

// ArgMorph //////////////////////////////////////////////////////////

/*
	I am a syntax element and the ancestor of all block inputs.
	I am present in block labels.
	Usually I am just a receptacle for inherited methods and attributes,
	however, if my 'type' attribute is set to one of the following
	values, I act as an iconic slot myself:
	
		'list'	- a list symbol
*/

// ArgMorph inherits from SyntaxElementMorph:

ArgMorph.prototype = new SyntaxElementMorph();
ArgMorph.prototype.constructor = ArgMorph;
ArgMorph.uber = SyntaxElementMorph.prototype;

// ArgMorph instance creation:

function ArgMorph(type) {
	this.init(type);
}

ArgMorph.prototype.init = function (type) {
	this.type = type || null;
	ArgMorph.uber.init.call(this);
	this.color = new Color(0, 17, 173);
	this.setExtent(new Point(50, 50));
};

// ArgMorph drag & drop: for demo puposes only

ArgMorph.prototype.justDropped = function () {
	if (!(this instanceof CommandSlotMorph)) {
		this.drawNew();
		this.changed();
	}
};

// ArgMorph spec extrapolation (for demo purposes)

ArgMorph.prototype.getSpec = function () {
	return '%s'; // default
};

// ArgMorph drawing

ArgMorph.prototype.drawNew = function () {
	if (this.type === 'list') {
		this.image = this.listIcon();
		this.silentSetExtent(new Point(
			this.image.width,
			this.image.height
		));
	} else {
		ArgMorph.uber.drawNew.call(this);
	}
};

ArgMorph.prototype.listIcon = function () {
	var frame = new Morph(),
		first = new CellMorph(),
		second = new CellMorph(),
		source,
		icon,
		context,
		ratio;

	frame.color = new Color(255, 255, 255);
	second.setPosition(first.bottomLeft().add(new Point(
		0,
		this.fontSize / 3
	)));
	first.add(second);
	first.setPosition(frame.position().add(this.fontSize));
	frame.add(first);
	frame.bounds.corner = second.bounds.corner.add(this.fontSize);
	frame.drawNew();
	source = frame.fullImage();
	ratio = (this.fontSize + this.edge) / source.height;
	icon = newCanvas(new Point(
		Math.ceil(source.width * ratio) + 1,
		Math.ceil(source.height * ratio) + 1
	));
	context = icon.getContext('2d');
	context.fillStyle = 'black';
	context.fillRect(0, 0, icon.width, icon.height);
	context.scale(ratio, ratio);
	context.drawImage(source, 1 / ratio, 1 / ratio);
	return icon;
};

// ArgMorph evaluation

ArgMorph.prototype.isEmptySlot = function () {
	return this.type !== null;
};


// CommandSlotMorph ////////////////////////////////////////////////////

/*
	I am a CommandBlock-shaped input slot. I can nest command blocks
	and also accept	reporters (containing reified scripts).

	my most important accessor is

	nestedBlock()	- answer the command block I encompass, if any

	My command spec is %cmd

	evaluate() returns my nested block or null
*/

// CommandSlotMorph inherits from ArgMorph:

CommandSlotMorph.prototype = new ArgMorph();
CommandSlotMorph.prototype.constructor = CommandSlotMorph;
CommandSlotMorph.uber = ArgMorph.prototype;

// CommandSlotMorph instance creation:

function CommandSlotMorph() {
	this.init();
}

CommandSlotMorph.prototype.init = function () {
	CommandSlotMorph.uber.init.call(this);
	this.color = new Color(0, 17, 173);
	this.setExtent(new Point(230, this.corner * 4 + this.cSlotPadding));
};

CommandSlotMorph.prototype.getSpec = function () {
	return '%cmd';
};

// CommandSlotMorph enumerating:

CommandSlotMorph.prototype.topBlock = function () {
	if (this.parent.topBlock) {
		return this.parent.topBlock();
	}
    return this.nestedBlock();
};

// CommandSlotMorph nesting:

CommandSlotMorph.prototype.nestedBlock = function (block) {
	if (block) {
		var nb = this.nestedBlock();
		this.add(block);
		if (nb) {
			block.bottomBlock().nextBlock(nb);
		}
		this.fixLayout();
	} else {
		return detect(
			this.children,
			function (child) {
				return child instanceof CommandBlockMorph;
			}
		);
	}
};

// CommandSlotMorph attach targets:

CommandSlotMorph.prototype.slotAttachPoint = function () {
	return new Point(
		this.dentCenter(),
		this.top() + this.corner * 2
	);
};

CommandSlotMorph.prototype.dentLeft = function () {
	return this.left()
		+ this.corner
		+ this.inset * 2;
};

CommandSlotMorph.prototype.dentCenter = function () {
	return this.dentLeft()
		+ this.corner
		+ (this.dent * 0.5);
};

CommandSlotMorph.prototype.attachTargets = function () {
	var answer = [];
	answer.push({
		point: this.slotAttachPoint(),
		element: this,
		loc: 'bottom',
		type: 'slot'
	});
	return answer;
};

// CommandSlotMorph layout:

CommandSlotMorph.prototype.fixLayout = function () {
	var nb = this.nestedBlock();
	if (this.parent) {
		if (!this.color.eq(this.parent.color)) {
			this.setColor(this.parent.color);
		}
	}
	if (nb) {
		nb.setPosition(
			new Point(
				this.left() + this.edge + this.rfBorder,
				this.top() + this.edge + this.rfBorder
			)
		);
		this.setWidth(nb.fullBounds().width()
			+ (this.edge + this.rfBorder) * 2
			);
		this.setHeight(nb.fullBounds().height()
			+ this.edge + this.rfBorder + (this.corner - this.rfBorder)
			);
	} else {
		this.setHeight(this.corner * 4);
		this.setWidth(
			this.corner * 4
				+ this.inset
				+ this.dent
		);
	}
	if (this.parent.fixLayout) {
		this.parent.fixLayout();
	}
};

// CommandSlotMorph evaluating:

CommandSlotMorph.prototype.evaluate = function () {
	return this.nestedBlock();
};

CommandSlotMorph.prototype.isEmptySlot = function () {
	return this.nestedBlock() === null;
};

// CommandSlotMorph context menu ops

CommandSlotMorph.prototype.attach = function () {
	// for context menu demo and testing purposes
	// override inherited version to adjust new owner's layout
	var	choices = this.overlappedMorphs(),
		menu = new MenuMorph(this, 'choose new parent:'),
		myself = this;

	choices.forEach(function (each) {
		menu.addItem(each.toString().slice(0, 50), function () {
			each.add(myself);
			myself.isDraggable = false;
			if (each.fixLayout) {
				each.fixLayout();
			}
		});
	});
	if (choices.length > 0) {
		menu.popUpAtHand(this.world());
	}
};

// CommandSlotMorph drawing:

CommandSlotMorph.prototype.drawNew = function () {
	var context;
	this.cachedClr = this.color.toString();
	this.cachedClrBright = this.bright();
	this.cachedClrDark = this.dark();
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	context.fillStyle = this.cachedClr;
	context.fillRect(0, 0, this.width(), this.height());

	// draw the 'flat' shape:
	context.fillStyle = this.rfColor.toString();
	this.drawFlat(context);

	// add 3D-Effect:
	this.drawEdges(context);
};

CommandSlotMorph.prototype.drawFlat = function (context) {
	var	isFilled = this.nestedBlock() !== null,
		ins = (isFilled ? this.inset : this.inset / 2),
		dent = (isFilled ? this.dent : this.dent / 2),
		indent = this.corner * 2 + ins,
		edge = this.edge,
		rf = (isFilled ? this.rfBorder : 0),
		y = this.height() - this.corner - edge;

	context.beginPath();

	// top left:
	context.arc(
		this.corner + edge,
		this.corner + edge,
		this.corner,
		radians(-180),
		radians(-90),
		false
	);

	// dent:
	context.lineTo(this.corner + ins + edge + rf * 2, edge);
	context.lineTo(indent + edge + rf * 2, this.corner + edge);
	context.lineTo(
		indent + edge  + rf * 2 + (dent - rf * 2),
		this.corner + edge
	);
	context.lineTo(
		indent + edge  + rf * 2 + (dent - rf * 2) + this.corner,
		edge
	);
	context.lineTo(this.width() - this.corner - edge, edge);

	// top right:
	context.arc(
		this.width() - this.corner - edge,
		this.corner + edge,
		this.corner,
		radians(-90),
		radians(-0),
		false
	);

	// bottom right:
	context.arc(
		this.width() - this.corner - edge,
		y,
		this.corner,
		radians(0),
		radians(90),
		false
	);

	// bottom left:
	context.arc(
		this.corner + edge,
		y,
		this.corner,
		radians(90),
		radians(180),
		false
	);

	context.closePath();
	context.fill();

};

CommandSlotMorph.prototype.drawEdges = function (context) {
	var	isFilled = this.nestedBlock() !== null,
		ins = (isFilled ? this.inset : this.inset / 2),
		dent = (isFilled ? this.dent : this.dent / 2),
		indent = this.corner * 2 + ins,
		edge = this.edge,
		rf = (isFilled ? this.rfBorder : 0),
		shift = this.edge * 0.5,
		gradient,
		upperGradient,
		lowerGradient,
		rightGradient;

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';


	// bright:
	// bottom horizontal line
	gradient = context.createLinearGradient(
		0,
		this.height(),
		0,
		this.height() - this.edge
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrBright);

	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(this.corner + edge, this.height() - shift);
	context.lineTo(
		this.width() - this.corner - edge,
		this.height() - shift
	);
	context.stroke();

	// bottom right corner
	gradient = context.createRadialGradient(
		this.width() - (this.corner + edge),
		this.height() - (this.corner + edge),
		this.corner,
		this.width() - (this.corner + edge),
		this.height() - (this.corner + edge),
		this.corner + edge
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);

	context.strokeStyle = gradient;
	context.beginPath();
	context.arc(
		this.width() - (this.corner + edge),
		this.height() - (this.corner + edge),
		this.corner + shift,
		radians(0),
		radians(90),
		false
	);
	context.stroke();

	// right vertical line
	gradient = context.createLinearGradient(
		this.width(),
		0,
		this.width() - this.edge,
		0
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrBright);

	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(
		this.width() - shift,
		this.height() - this.corner - this.edge
	);
	context.lineTo(this.width() - shift, edge + this.corner);
	context.stroke();


	//dark:
	if (useBlurredShadows) {
		context.shadowOffsetY = shift;
		context.shadowBlur = this.edge;
		context.shadowColor = this.rfColor.darker(80).toString();
	}

	// left vertical side
	gradient = context.createLinearGradient(
		0,
		0,
		edge,
		0
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);

	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(shift, edge + this.corner);
	context.lineTo(shift, this.height() - edge - this.corner);
	context.stroke();

	// upper left corner
	gradient = context.createRadialGradient(
		this.corner + edge,
		this.corner + edge,
		this.corner,
		this.corner + edge,
		this.corner + edge,
		this.corner + edge
	);
	gradient.addColorStop(0, this.cachedClrDark);
	gradient.addColorStop(1, this.cachedClr);

	context.strokeStyle = gradient;
	context.beginPath();
	context.arc(
		this.corner + edge,
		this.corner + edge,
		this.corner + shift,
		radians(-180),
		radians(-90),
		false
	);
	context.stroke();

	// upper edge (left side)
	upperGradient = context.createLinearGradient(
		0,
		0,
		0,
		this.edge
	);
	upperGradient.addColorStop(0, this.cachedClr);
	upperGradient.addColorStop(1, this.cachedClrDark);

	context.strokeStyle = upperGradient;
	context.beginPath();
	context.moveTo(this.corner + edge, shift);
	context.lineTo(
		this.corner + ins + edge + rf * 2 - shift,
		shift
	);
	context.stroke();

	// dent bottom
	lowerGradient = context.createLinearGradient(
		0,
		this.corner,
		0,
		this.corner + edge
	);
	lowerGradient.addColorStop(0, this.cachedClr);
	lowerGradient.addColorStop(1, this.cachedClrDark);

	context.strokeStyle = lowerGradient;
	context.beginPath();
	context.moveTo(indent + edge + rf * 2 + shift, this.corner + shift);
	context.lineTo(
		indent + edge  + rf * 2 + (dent - rf * 2),
		this.corner + shift
	);
	context.stroke();

	// dent right edge
	rightGradient = context.createLinearGradient(
		indent + edge  + rf * 2 + (dent - rf * 2) - shift,
		this.corner,
		indent + edge  + rf * 2 + (dent - rf * 2) + shift * 0.7,
		this.corner + shift + shift * 0.7
	);
	rightGradient.addColorStop(0, this.cachedClr);
	rightGradient.addColorStop(1, this.cachedClrDark);

	context.strokeStyle = rightGradient;
	context.beginPath();
	context.moveTo(
		indent + edge  + rf * 2 + (dent - rf * 2),
		this.corner + shift
	);
	context.lineTo(
		indent + edge  + rf * 2 + (dent - rf * 2) + this.corner,
		shift
	);
	context.stroke();

	// upper edge (right side)
	context.strokeStyle = upperGradient;
	context.beginPath();
	context.moveTo(
		indent + edge  + rf * 2 + (dent - rf * 2) + this.corner,
		shift
	);
	context.lineTo(this.width() - this.corner - edge, shift);
	context.stroke();
};

// CSlotMorph ////////////////////////////////////////////////////

/*
	I am a C-shaped input slot. I can nest command blocks and also accept
	reporters (containing reified scripts).

	my most important accessor is

	nestedBlock()	- the command block I encompass, if any (inherited)

	My command spec is %c

	evaluate() returns my nested block or null
*/

// CSlotMorph inherits from CommandSlotMorph:

CSlotMorph.prototype = new CommandSlotMorph();
CSlotMorph.prototype.constructor = CSlotMorph;
CSlotMorph.uber = CommandSlotMorph.prototype;

// CSlotMorph instance creation:

function CSlotMorph() {
	this.init();
}

CSlotMorph.prototype.init = function () {
	CommandSlotMorph.uber.init.call(this);
	this.color = new Color(0, 17, 173);
	this.setExtent(new Point(230, this.corner * 4 + this.cSlotPadding));
};

CSlotMorph.prototype.getSpec = function () {
	return '%c';
};

// CSlotMorph layout:

CSlotMorph.prototype.fixLayout = function () {
	var nb = this.nestedBlock();
	if (nb) {
		nb.setPosition(
			new Point(
				this.left() + this.inset,
				this.top() + this.corner
			)
		);
		this.setHeight(nb.fullBounds().height() + this.corner);
		this.setWidth(nb.fullBounds().width() + (this.cSlotPadding * 2));
	} else {
		this.setHeight(this.corner * 4  + this.cSlotPadding); // default
		this.setWidth(
			this.corner * 4
				+ (this.inset * 2)
				+ this.dent
				+ (this.cSlotPadding * 2)
		); // default
	}
	if (this.parent.fixLayout) {
		this.parent.fixLayout();
	}
};

// CSlotMorph drawing:

CSlotMorph.prototype.drawNew = function () {
	var context;
	this.cachedClr = this.color.toString();
	this.cachedClrBright = this.bright();
	this.cachedClrDark = this.dark();
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	context.fillStyle = this.cachedClr;

	// draw the 'flat' shape:
	this.drawFlat(context);

	// add 3D-Effect:
	this.drawTopRightEdge(context);
	this.drawTopEdge(context, this.inset, this.corner);
	this.drawTopLeftEdge(context);
	this.drawBottomEdge(context);
	this.drawRightEdge(context);
};

CSlotMorph.prototype.drawFlat = function (context) {
	context.beginPath();

	// top line:
	context.moveTo(0, 0);
	context.lineTo(this.width(), 0);

	// top right:
	context.arc(
		this.width() - this.corner,
		0,
		this.corner,
		radians(90),
		radians(0),
		true
	);

	// jigsaw shape:
	context.lineTo(this.width() - this.corner, this.corner);
	context.lineTo(
		(this.inset * 2) + (this.corner * 3) + this.dent,
		this.corner
	);
	context.lineTo(
		(this.inset * 2) + (this.corner * 2) + this.dent,
		this.corner * 2
	);
	context.lineTo(
		(this.inset * 2) + (this.corner * 2),
		this.corner * 2
	);
	context.lineTo(
		(this.inset * 2) + this.corner,
		this.corner
	);
	context.lineTo(
		this.inset + this.corner,
		this.corner
	);
	context.arc(
		this.inset + this.corner,
		this.corner * 2,
		this.corner,
		radians(270),
		radians(180),
		true
	);

	// bottom:
	context.lineTo(
		this.inset,
		this.height() - (this.corner * 2)
	);
	context.arc(
		this.inset + this.corner,
		this.height() - (this.corner * 2),
		this.corner,
		radians(180),
		radians(90),
		true
	);
	context.lineTo(
		this.width() - this.corner,
		this.height() - this.corner
	);
	context.arc(
		this.width() - this.corner,
		this.height(),
		this.corner,
		radians(-90),
		radians(-0),
		false
	);
	context.lineTo(0, this.height());

	// fill:
	context.closePath();
	context.fill();
};

CSlotMorph.prototype.drawTopRightEdge = function (context) {
	var	shift = this.edge * 0.5,
		x = this.width() - this.corner,
		y = 0,
		gradient;

	gradient = context.createRadialGradient(
		x,
		y,
		this.corner,
		x,
		y,
		this.corner - this.edge
	);
	gradient.addColorStop(0, this.cachedClrDark);
	gradient.addColorStop(1, this.cachedClr);

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	context.strokeStyle = gradient;

	context.beginPath();
	context.arc(
		x,
		y,
		this.corner - shift,
		radians(90),
		radians(0),
		true
	);
	context.stroke();
};

CSlotMorph.prototype.drawTopEdge = function (context, x, y) {
	var	shift = this.edge * 0.5,
		indent = x + this.corner * 2 + this.inset,
		upperGradient,
		lowerGradient,
		rightGradient;

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	upperGradient = context.createLinearGradient(
		0,
		y - this.edge,
		0,
		y
	);
	upperGradient.addColorStop(0, this.cachedClr);
	upperGradient.addColorStop(1, this.cachedClrDark);

	context.strokeStyle = upperGradient;
	context.beginPath();
	context.moveTo(x + this.corner, y - shift);
	context.lineTo(x + this.corner + this.inset - shift, y - shift);
	context.stroke();

	lowerGradient = context.createLinearGradient(
		0,
		y + this.corner - this.edge,
		0,
		y + this.corner
	);
	lowerGradient.addColorStop(0, this.cachedClr);
	lowerGradient.addColorStop(1, this.cachedClrDark);

	context.strokeStyle = lowerGradient;
	context.beginPath();
	context.moveTo(indent + shift, y + this.corner - shift);
	context.lineTo(indent + this.dent, y + this.corner - shift);
	context.stroke();

	rightGradient = context.createLinearGradient(
		(x + this.inset + (this.corner * 2) + this.dent) - shift,
		(y + this.corner - shift) - shift,
		(x + this.inset + (this.corner * 2) + this.dent) + (shift * 0.7),
		(y + this.corner - shift) + (shift * 0.7)
	);
	rightGradient.addColorStop(0, this.cachedClr);
	rightGradient.addColorStop(1, this.cachedClrDark);


	context.strokeStyle = rightGradient;
	context.beginPath();
	context.moveTo(
		x + this.inset + (this.corner * 2) + this.dent,
		y + this.corner - shift
	);
	context.lineTo(
		x + this.corner * 3 + this.inset + this.dent,
		y - shift
	);
	context.stroke();

	context.strokeStyle = upperGradient;
	context.beginPath();
	context.moveTo(
		x + this.corner * 3 + this.inset + this.dent,
		y - shift
	);
	context.lineTo(this.width() - this.corner, y - shift);
	context.stroke();
};

CSlotMorph.prototype.drawTopLeftEdge = function (context) {
	var	shift = this.edge * 0.5,
		gradient;

	gradient = context.createRadialGradient(
		this.corner + this.inset,
		this.corner * 2,
		this.corner,
		this.corner + this.inset,
		this.corner * 2,
		this.corner + this.edge
	);
	gradient.addColorStop(0, this.cachedClrDark);
	gradient.addColorStop(1, this.cachedClr);

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	context.strokeStyle = gradient;

	context.beginPath();
	context.arc(
		this.corner + this.inset,
		this.corner * 2,
		this.corner + shift,
		radians(-180),
		radians(-90),
		false
	);
	context.stroke();
};

CSlotMorph.prototype.drawRightEdge = function (context) {
	var	shift = this.edge * 0.5,
		x = this.inset,
		gradient;

	gradient = context.createLinearGradient(x - this.edge, 0, x, 0);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(x - shift, this.corner * 2);
	context.lineTo(x - shift, this.height() - this.corner * 2);
	context.stroke();
};

CSlotMorph.prototype.drawBottomEdge = function (context) {
	var	shift = this.edge * 0.5,
		gradient,
		upperGradient;

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	upperGradient = context.createRadialGradient(
		this.corner + this.inset,
		this.height() - (this.corner * 2),
		this.corner, /*- this.edge*/ // uncomment for half-tone
		this.corner + this.inset,
		this.height() - (this.corner * 2),
		this.corner + this.edge
	);
	upperGradient.addColorStop(0, this.cachedClrBright);
	upperGradient.addColorStop(1, this.cachedClr);
	context.strokeStyle = upperGradient;
	context.beginPath();
	context.arc(
		this.corner + this.inset,
		this.height() - (this.corner * 2),
		this.corner + shift,
		radians(180),
		radians(90),
		true
	);
	context.stroke();

	gradient = context.createLinearGradient(
		0,
		this.height() - this.corner,
		0,
		this.height() - this.corner + this.edge
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);

	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(
		this.inset + this.corner,
		this.height() - this.corner + shift
	);
	context.lineTo(
		this.width() - this.corner,
		this.height() - this.corner + shift
	);

	context.stroke();
};

// InputSlotMorph //////////////////////////////////////////////////////

/*
	I am an editable text input slot. I can be either rectangular or
	rounded, and can have an optional drop-down menu. If I'm set to
	read-only I must have a drop-down menu and will assume a darker
	shade of my	parent's color.

	my most important public attributes and accessors are:

	setContents(str/float)	- display the argument (string or float)
	contents().text			- get the displayed string
	choices					- a key/value list for my optional drop-down
	isReadOnly				- governs whether I am editable or not
	isNumeric				- governs my outer shape (round or rect)

	my block specs are:

	%s		- string input, rectangular
	%n		- numerical input, semi-circular vertical edges
	%anyUE	- any unevaluated

	evaluate() returns my displayed string, cast to float if I'm numerical

	there are also a number of specialized drop-down menu presets, refer
	to BlockMorph for details.
*/

// InputSlotMorph inherits from ArgMorph:

InputSlotMorph.prototype = new ArgMorph();
InputSlotMorph.prototype.constructor = InputSlotMorph;
InputSlotMorph.uber = ArgMorph.prototype;

// InputSlotMorph instance creation:

function InputSlotMorph(text, isNumeric, choiceDict, isReadOnly) {
	this.init(text, isNumeric, choiceDict, isReadOnly);
}

InputSlotMorph.prototype.init = function (
	text,
	isNumeric,
	choiceDict,
	isReadOnly
) {
	var	contents = new StringMorph(text || ''),
		arrow = new ArrowMorph(
			'down',
			0,
			Math.max(Math.floor(this.fontSize / 6), 1)
		);

	contents.fontSize = this.fontSize;
	contents.drawNew();

	this.choices = choiceDict || null; // object, function or selector
	this.oldContentsExtent = contents.extent();
	this.isNumeric = isNumeric || false;
	this.isReadOnly = isReadOnly || false;

	InputSlotMorph.uber.init.call(this);
	this.color = new Color(255, 255, 255);
	this.add(contents);
	this.add(arrow);
	contents.isEditable = true;
	contents.isDraggable = false;
	contents.enableSelecting();
	this.fixLayout();
};

// InputSlotMorph accessing:

InputSlotMorph.prototype.getSpec = function () {
	if (this.isNumeric) {
		return '%n';
	}
    return '%s'; // default
};

InputSlotMorph.prototype.contents = function () {
	return detect(
		this.children,
		function (child) {
			return (child instanceof StringMorph);
		}
	);
};

InputSlotMorph.prototype.arrow = function () {
	return detect(
		this.children,
		function (child) {
			return (child instanceof ArrowMorph);
		}
	);
};

InputSlotMorph.prototype.setContents = function (aStringOrFloat) {
	var cnts = this.contents();
	cnts.text = aStringOrFloat;
	if (aStringOrFloat === undefined) {
		return null;
	}
    if (aStringOrFloat === null) {
		cnts.text = '';
	} else if (aStringOrFloat.toString) {
		cnts.text = aStringOrFloat.toString();
	}
	cnts.drawNew();
};

// InputSlotMorph drop-down menu:

InputSlotMorph.prototype.dropDownMenu = function () {
	var	choices = this.choices,
		key,
		menu = new MenuMorph(
			this.setContents,
			null,
			this,
			this.fontSize
		);

	if (choices instanceof Function) {
		choices = choices.call(this);
	} else if (isString(choices)) {
		choices = this[choices].call(this);
	}
	if (!choices) {
		return null;
	}
	menu.addItem(' ', null);
	for (key in choices) {
        if (choices.hasOwnProperty(key)) {
            if (key[0] === '~') {
                menu.addLine();
            } else {
                menu.addItem(key, choices[key]);
            }
        }
	}
	if (menu.items.length > 0) {
		menu.popUpAtHand(this.world());
	} else {
		return null;
	}
};

InputSlotMorph.prototype.messagesMenu = function () {
	var	dict = {},
		rcvr = this.parentThatIsA(BlockMorph).receiver(),
        stage = rcvr.parentThatIsA(StageMorph),
		myself = this,
		allNames = [];

    stage.children.concat(stage).forEach(function (morph) {
        if (morph instanceof SpriteMorph || morph instanceof StageMorph) {
            allNames = allNames.concat(morph.allMessageNames());
        }
    });
	allNames.forEach(function (name) {
		dict[name] = name;
	});
	if (allNames.length > 0) {
		dict['~'] = null;
	}
	dict['new...'] = function () {

		new DialogBoxMorph(
			myself,
			myself.setContents,
			myself
		).prompt(
			'Message name',
			null,
			myself.world()
		);
	};

	return dict;
};

InputSlotMorph.prototype.collidablesMenu = function () {
	var	dict = {
            'mouse-pointer' : 'mouse-pointer',
            edge : 'edge'
        },
		rcvr = this.parentThatIsA(BlockMorph).receiver(),
        stage = rcvr.parentThatIsA(StageMorph),
		allNames = [];

    stage.children.forEach(function (morph) {
        if (morph instanceof SpriteMorph) {
            if (morph.name !== rcvr.name) {
                allNames = allNames.concat(morph.name);
            }
        }
    });
	if (allNames.length > 0) {
		dict['~'] = null;
        allNames.forEach(function (name) {
            dict[name] = name;
        });
	}
	return dict;
};

InputSlotMorph.prototype.costumesMenu = function () {
	var	dict = {Turtle : 'Turtle'},
		rcvr = this.parentThatIsA(BlockMorph).receiver(),
		allNames = [];

    rcvr.costumes.asArray().forEach(function (costume) {
        allNames = allNames.concat(costume.name);
    });
	if (allNames.length > 0) {
		dict['~'] = null;
        allNames.forEach(function (name) {
            dict[name] = name;
        });
	}
	return dict;
};

InputSlotMorph.prototype.soundsMenu = function () {
	var	rcvr = this.parentThatIsA(BlockMorph).receiver(),
        allNames = [],
        dict = {};

    rcvr.sounds.asArray().forEach(function (sound) {
        allNames = allNames.concat(sound.name);
    });
    if (allNames.length > 0) {
        allNames.forEach(function (name) {
            dict[name] = name;
        });
    }
    return dict;
};

InputSlotMorph.prototype.getVarNamesDict = function () {
	var	block = this.parentThatIsA(BlockMorph),
		rcvr,
        proto,
		declarations,
		tempVars = [],
		dict;

	if (!block) {
		return {};
	}
    rcvr = block.receiver();

	proto = detect(block.allParents(), function (morph) {
		return morph instanceof PrototypeHatBlockMorph;
	});
    if (proto) {
        tempVars = proto.inputs()[0].upvarFragmentNames();
    }

	declarations = block.allParents().filter(function (block) {
		return block.selector === 'doDeclareVariables';
	});
	declarations.forEach(function (block) {
		tempVars = tempVars.concat(block.inputs()[0].evaluate());
	});

	if (rcvr) {
		dict = rcvr.variables.allNamesDict();
		tempVars.forEach(function (name) {
			dict[name] = name;
		});
		return dict;
	}
    return {};
};

// InputSlotMorph layout:

InputSlotMorph.prototype.fixLayout = function () {
	var	contents = this.contents(),
		arrow = this.arrow();

	contents.isNumeric = this.isNumeric;
	contents.isEditable = (!this.isReadOnly);
	if (this.isReadOnly) {
		contents.disableSelecting();
		contents.color = new Color(254, 254, 254);
	} else {
		contents.enableSelecting();
		contents.color = new Color(0, 0, 0);
	}

	if (this.choices) {
		arrow.setSize(this.fontSize);
		arrow.show();
	} else {
		arrow.setSize(0);
		arrow.hide();
	}
	this.setHeight(
		contents.height()
			+ this.edge * 2
			+ this.typeInPadding * 2
	);
	if (this.isNumeric) {
		this.setWidth(contents.width()
			+ Math.floor(arrow.width() * 0.5)
			+ this.height()
			+ this.typeInPadding * 2
			);
	} else {
		this.setWidth(Math.max(
			contents.width()
				+ arrow.width()
				+ this.edge * 2
				+ this.typeInPadding * 2,
			contents.height() + arrow.width()
		));
	}
	if (this.isNumeric) {
		contents.setPosition(new Point(
			Math.floor(this.height() / 2),
			this.edge
		).add(this.typeInPadding).add(this.position()));
	} else {
		contents.setPosition(new Point(
			this.edge,
			this.edge
		).add(this.typeInPadding).add(this.position()));
	}

	arrow.setPosition(new Point(
		this.right() - arrow.width() - this.edge,
		contents.top()
	));

	if (this.parent) {
		if (this.parent.fixLayout) {
			if (this.world()) {
				this.startLayout();
				this.parent.fixLayout();
				this.endLayout();
			} else {
				this.parent.fixLayout();
			}
		}
	}
};

// InputSlotMorph events:

InputSlotMorph.prototype.mouseClickLeft = function (pos) {
	if (this.arrow().bounds.containsPoint(pos)) {
		this.dropDownMenu();
	} else {
		this.contents().edit();
		this.contents().selectAll();
	}
};

// InputSlotMorph evaluating:

InputSlotMorph.prototype.evaluate = function () {
/*
	answer my content's text string. If I am numerical convert that
	string to a number. If the conversion fails answer the string
	(e.g. for special choices like 'any', 'all' or 'last') otherwise
	the numerical value.
*/
	var	num,
		contents = this.contents();
	if (this.isNumeric) {
		num = parseFloat(contents.text);
		if (!isNaN(num)) {
			return num;
		}
	}
	return contents.text;
};

InputSlotMorph.prototype.isEmptySlot = function () {
	return this.contents().text === '';
};

// InputSlotMorph drawing:

InputSlotMorph.prototype.drawNew = function () {
	var context, borderColor, r;

	// initialize my surface property
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	if (this.parent) {
		borderColor = this.parent.color;
	} else {
		borderColor = new Color(120, 120, 120);
	}
	context.fillStyle = this.color.toString();
	if (this.isReadOnly) {
		context.fillStyle = borderColor.darker().toString();
	}

	// cache my border colors
	this.cachedClr = borderColor.toString();
	this.cachedClrBright = borderColor.lighter(this.contrast)
		.toString();
	this.cachedClrDark = borderColor.darker(this.contrast).toString();

	if (!this.isNumeric) {
		context.fillRect(
			this.edge,
			this.edge,
			this.width() - this.edge * 2,
			this.height() - this.edge * 2
		);
		this.drawRectBorder(context);
	} else {
		r = (this.height() - (this.edge * 2)) / 2;
		context.fillStyle = this.color.toString();
		context.beginPath();
		context.arc(
			r + this.edge,
			r + this.edge,
			r,
			radians(90),
			radians(-90),
			false
		);
		context.arc(
			this.width() - r - this.edge,
			r + this.edge,
			r,
			radians(-90),
			radians(90),
			false
		);
		context.closePath();
		context.fill();
		this.drawRoundBorder(context);
	}
};

InputSlotMorph.prototype.drawRectBorder = function (context) {
	var	shift = this.edge * 0.5,
		gradient;

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	if (useBlurredShadows) {
		context.shadowOffsetY = shift;
		context.shadowBlur = this.edge;
		context.shadowColor = this.color.darker(80).toString();
	}

	gradient = context.createLinearGradient(
		0,
		0,
		0,
		this.edge
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(this.edge, shift);
	context.lineTo(this.width() - this.edge - shift, shift);
	context.stroke();

	context.shadowOffsetY = 0;

	gradient = context.createLinearGradient(
		0,
		0,
		this.edge,
		0
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(shift, this.edge);
	context.lineTo(shift, this.height() - this.edge - shift);
	context.stroke();

	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 0;

	gradient = context.createLinearGradient(
		0,
		this.height() - this.edge,
		0,
		this.height()
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(this.edge, this.height() - shift);
	context.lineTo(this.width() - this.edge, this.height() - shift);
	context.stroke();

	gradient = context.createLinearGradient(
		this.width() - this.edge,
		0,
		this.width(),
		0
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(this.width() - shift, this.edge);
	context.lineTo(this.width() - shift, this.height() - this.edge);
	context.stroke();

};

InputSlotMorph.prototype.drawRoundBorder = function (context) {
	var	shift = this.edge * 0.5,
		r = (this.height() - (this.edge * 2)) / 2,
		start,
		end,
		gradient;

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	// straight top edge:
	start = r + this.edge;
	end = this.width() - r - this.edge;
	if (end > start) {

		if (useBlurredShadows) {
			context.shadowOffsetX = shift;
			context.shadowOffsetY = shift;
			context.shadowBlur = this.edge;
			context.shadowColor = this.color.darker(80).toString();
		}

		gradient = context.createLinearGradient(
			0,
			0,
			0,
			this.edge
		);
		gradient.addColorStop(0, this.cachedClr);
		gradient.addColorStop(1, this.cachedClrDark);
		context.strokeStyle = gradient;
		context.beginPath();

		context.moveTo(start, shift);
		context.lineTo(end, shift);
		context.stroke();

		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.shadowBlur = 0;
	}

	// straight bottom edge:
	gradient = context.createLinearGradient(
		0,
		this.height() - this.edge,
		0,
		this.height()
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(r + this.edge, this.height() - shift);
	context.lineTo(this.width() - r - this.edge, this.height() - shift);
	context.stroke();

	r = this.height() / 2;

	if (useBlurredShadows) {
		context.shadowOffsetX = shift;
		context.shadowOffsetY = shift;
		context.shadowBlur = this.edge;
		context.shadowColor = this.color.darker(80).toString();
	}

	// top edge: left corner
	gradient = context.createRadialGradient(
		r,
		r,
		r - this.edge,
		r,
		r,
		r
	);
	gradient.addColorStop(1, this.cachedClr);
	gradient.addColorStop(0, this.cachedClrDark);
	context.strokeStyle = gradient;
	context.beginPath();
	context.arc(
		r,
		r,
		r - shift,
		radians(180),
		radians(270),
		false
	);

	context.stroke();

	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 0;

	// bottom edge: right corner
	gradient = context.createRadialGradient(
		this.width() - r,
		r,
		r - this.edge,
		this.width() - r,
		r,
		r
	);
	gradient.addColorStop(1, this.cachedClr);
	gradient.addColorStop(0, this.cachedClrBright);
	context.strokeStyle = gradient;
	context.beginPath();
	context.arc(
		this.width() - r,
		r,
		r - shift,
		radians(0),
		radians(90),
		false
	);
	context.stroke();
};

// TemplateSlotMorph ///////////////////////////////////////////////////

/*
	I am a reporter block template sitting on a pedestal.
	My block spec is

	%t		- template

	evaluate returns the embedded reporter template's label string
*/

// TemplateSlotMorph inherits from ArgMorph:

TemplateSlotMorph.prototype = new ArgMorph();
TemplateSlotMorph.prototype.constructor = TemplateSlotMorph;
TemplateSlotMorph.uber = ArgMorph.prototype;

// TemplateSlotMorph instance creation:

function TemplateSlotMorph(name) {
	this.init(name);
}

TemplateSlotMorph.prototype.init = function (name) {
	var template = new ReporterBlockMorph();
	this.labelString = name || '';
	template.isDraggable = false;
	template.isTemplate = true;
	if (modules.objects !== undefined) {
		template.color = SpriteMorph.prototype.blockColor.variables;
	} else {
		template.color = new Color(243, 118, 29);
	}
	template.setSpec(this.labelString);
	template.selector = 'reportGetVar';
	TemplateSlotMorph.uber.init.call(this);
	this.add(template);
	this.fixLayout();
	this.isDraggable = false;
	this.isStatic = true; // I cannot be exchanged
};

// TemplateSlotMorph accessing:

TemplateSlotMorph.prototype.getSpec = function () {
	return '%t';
};

TemplateSlotMorph.prototype.template = function () {
	return this.children[0];
};

TemplateSlotMorph.prototype.contents = function () {
	return this.template().blockSpec;
};

TemplateSlotMorph.prototype.setContents = function (aString) {
	this.template().setSpec(aString);
};

// TemplateSlotMorph evaluating:

TemplateSlotMorph.prototype.evaluate = function () {
	return this.contents();
};

// TemplateSlotMorph layout:

TemplateSlotMorph.prototype.fixLayout = function () {
	var template = this.template();
	this.setExtent(template.extent().add(this.edge * 2 + 2));
	template.setPosition(this.position().add(this.edge + 1));
	if (this.parent) {
		if (this.parent.fixLayout) {
			this.parent.fixLayout();
		}
	}
};

// TemplateSlotMorph drawing:

TemplateSlotMorph.prototype.drawNew = function () {
	var context;
	if (this.parent instanceof Morph) {
		this.color = this.parent.color.copy();
	}
	this.cachedClr = this.color.toString();
	this.cachedClrBright = this.bright();
	this.cachedClrDark = this.dark();
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	context.fillStyle = this.cachedClr;
	this.drawRounded(context);
};

TemplateSlotMorph.prototype.drawRounded = ReporterBlockMorph
	.prototype.drawRounded;

// BooleanSlotMorph ////////////////////////////////////////////////////

/*
	I am a diamond-shaped argument slot.
	My block spec is

	%b		- Boolean
	%boolUE	- Boolean unevaluated

	evaluate returns null
*/

// BooleanSlotMorph inherits from ArgMorph:

BooleanSlotMorph.prototype = new ArgMorph();
BooleanSlotMorph.prototype.constructor = BooleanSlotMorph;
BooleanSlotMorph.uber = ArgMorph.prototype;

// BooleanSlotMorph instance creation:

function BooleanSlotMorph() {
	this.init();
}

BooleanSlotMorph.prototype.init = function () {
	BooleanSlotMorph.uber.init.call(this);
};

BooleanSlotMorph.prototype.getSpec = function () {
	return '%b';
};

// BooleanSlotMorph drawing:

BooleanSlotMorph.prototype.drawNew = function () {
	var context;
	this.silentSetExtent(new Point(
		(this.fontSize + this.edge * 2) * 2,
		this.fontSize + this.edge * 2
	));
	if (this.parent) {
		this.color = this.parent.color;
	}
	this.cachedClr = this.color.toString();
	this.cachedClrBright = this.bright();
	this.cachedClrDark = this.dark();
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	this.drawDiamond(context, true);
};

BooleanSlotMorph.prototype.drawDiamond = function (context) {
	var	w = this.width(),
		h = this.height(),
		r = h / 2,
		shift = this.edge / 2,
		gradient;

	// draw the 'flat' shape:
	context.fillStyle = this.color.darker(25).toString();
	context.beginPath();

	context.moveTo(0, r);
	context.lineTo(r, 0);
	context.lineTo(w - r, 0);
	context.lineTo(w, r);
	context.lineTo(w - r, h);
	context.lineTo(r, h);

	context.closePath();
	context.fill();

	// add 3D-Effect:
	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	if (useBlurredShadows) {
		context.shadowOffsetX = shift;
		context.shadowBlur = shift;
		context.shadowColor = 'black';
	}

	// top edge: left corner
	gradient = context.createLinearGradient(
		0,
		r,
		this.edge * 0.6,
		r + (this.edge * 0.6)
	);
	gradient.addColorStop(1, this.cachedClrDark);
	gradient.addColorStop(0, this.cachedClr);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(shift, r);
	context.lineTo(r, shift);
	context.closePath();
	context.stroke();

	// top edge: straight line
	context.shadowOffsetX = 0;
	if (useBlurredShadows) {
		context.shadowOffsetY = shift;
		context.shadowBlur = this.edge;
	}

	gradient = context.createLinearGradient(
		0,
		0,
		0,
		this.edge
	);
	gradient.addColorStop(1, this.cachedClrDark);
	gradient.addColorStop(0, this.cachedClr);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(r, shift);
	context.lineTo(w - r, shift);
	context.closePath();
	context.stroke();

	context.shadowOffsetY = 0;
	context.shadowBlur = 0;

	// bottom edge: right corner
	gradient = context.createLinearGradient(
		w - r - (this.edge * 0.6),
		h - (this.edge * 0.6),
		w - r,
		h
	);
	gradient.addColorStop(1, this.cachedClr);
	gradient.addColorStop(0, this.cachedClrBright);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(w - r, h - shift);
	context.lineTo(w - shift, r);
	context.closePath();
	context.stroke();

	// bottom edge: straight line
	gradient = context.createLinearGradient(
		0,
		h - this.edge,
		0,
		h
	);
	gradient.addColorStop(1, this.cachedClr);
	gradient.addColorStop(0, this.cachedClrBright);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(r, h - shift);
	context.lineTo(w - r - shift, h - shift);
	context.closePath();
	context.stroke();
};

// ArrowMorph //////////////////////////////////////////////////////////

/*
	I am a triangular arrow shape, for use in drop-down menus etc.
	My orientation is governed by my 'direction' property, which can be
	'down', 'up', 'left' or 'right'.
*/

// ArrowMorph inherits from Morph:

ArrowMorph.prototype = new Morph();
ArrowMorph.prototype.constructor = ArrowMorph;
ArrowMorph.uber = Morph.prototype;

// ArrowMorph instance creation:

function ArrowMorph(direction, size, padding) {
	this.init(direction, size, padding);
}

ArrowMorph.prototype.init = function (direction, size, padding) {
	this.direction = direction || 'down';
	this.size = size || ((size === 0) ? 0 : 50);
	this.padding = padding || 0;

	ArrowMorph.uber.init.call(this);
	this.color = new Color(0, 0, 0);
	this.setExtent(new Point(this.size, this.size));
};

ArrowMorph.prototype.setSize = function (size) {
	var min = Math.max(size, 1);
	this.size = size;
	this.setExtent(new Point(min, min));
};

// ArrowMorph displaying:

ArrowMorph.prototype.drawNew = function () {
	// initialize my surface property
	this.image = newCanvas(this.extent());
	var	context = this.image.getContext('2d'),
		pad = this.padding,
		h = this.height(),
		h2 = Math.floor(h / 2),
		w = this.width(),
		w2 = Math.floor(w / 2);

	context.fillStyle = this.color.toString();
	context.beginPath();
	if (this.direction === 'down') {
		context.moveTo(pad, h2);
		context.lineTo(w - pad, h2);
		context.lineTo(w2, h - pad);
	} else if (this.direction === 'up') {
		context.moveTo(pad, h2);
		context.lineTo(w - pad, h2);
		context.lineTo(w2, pad);
	} else if (this.direction === 'left') {
		context.moveTo(pad, h2);
		context.lineTo(w2, pad);
		context.lineTo(w2, h - pad);
	} else { // 'right'
		context.moveTo(w2, pad);
		context.lineTo(w - pad, h2);
		context.lineTo(w2, h - pad);
	}
	context.closePath();
	context.fill();
};

// ColorSlotMorph //////////////////////////////////////////////////////

/*
	I am an editable input slot for a color. Users can edit my color by
	clicking on me, in which case a display a color gradient palette
	and let the user select another color. Note that the user isn't
	restricted to selecting a color from the palette, any color from
	anywhere within the World can be chosen.

	my block spec is %clr

	evaluate() returns my color
*/

// ColorSlotMorph  inherits from ArgMorph:

ColorSlotMorph.prototype = new ArgMorph();
ColorSlotMorph.prototype.constructor = ColorSlotMorph;
ColorSlotMorph.uber = ArgMorph.prototype;

// ColorSlotMorph  instance creation:

function ColorSlotMorph(clr) {
	this.init(clr);
}

ColorSlotMorph.prototype.init = function (clr) {
	ColorSlotMorph.uber.init.call(this);
	this.setColor(clr || new Color(145, 26, 68));
};

ColorSlotMorph.prototype.getSpec = function () {
	return '%clr';
};

// ColorSlotMorph  color sensing:

ColorSlotMorph.prototype.getUserColor = function () {
	var myself = this,
		world = this.world(),
		hand = world.hand,
		posInDocument = getDocumentPositionOf(world.worldCanvas),
		mouseMoveBak = hand.processMouseMove,
		mouseDownBak = hand.processMouseDown,
		mouseUpBak = hand.processMouseUp,
		pal = new ColorPaletteMorph(null, new Point(
			this.fontSize * 16,
			this.fontSize * 10
		));
	world.add(pal);
	pal.setPosition(this.bottomLeft().add(new Point(0, this.edge)));

	hand.processMouseMove = function (event) {
		hand.setPosition(new Point(
			event.pageX - posInDocument.x,
			event.pageY - posInDocument.y
		));
		myself.setColor(world.getGlobalPixelColor(hand.position()));
	};

	hand.processMouseDown = nop;

	hand.processMouseUp = function () {
		pal.destroy();
		hand.processMouseMove = mouseMoveBak;
		hand.processMouseDown = mouseDownBak;
		hand.processMouseUp = mouseUpBak;
	};
};

// ColorSlotMorph events:

ColorSlotMorph.prototype.mouseClickLeft = function () {
	this.getUserColor();
};

// ColorSlotMorph evaluating:

ColorSlotMorph.prototype.evaluate = function () {
	return this.color;
};

// ColorSlotMorph drawing:

ColorSlotMorph.prototype.drawNew = function () {
	var context, borderColor, side;

	side = this.fontSize + this.edge * 2 + this.typeInPadding * 2;
	this.silentSetExtent(new Point(side, side));

	// initialize my surface property
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	if (this.parent) {
		borderColor = this.parent.color;
	} else {
		borderColor = new Color(120, 120, 120);
	}
	context.fillStyle = this.color.toString();

	// cache my border colors
	this.cachedClr = borderColor.toString();
	this.cachedClrBright = borderColor.lighter(this.contrast)
		.toString();
	this.cachedClrDark = borderColor.darker(this.contrast).toString();

	context.fillRect(
		this.edge,
		this.edge,
		this.width() - this.edge * 2,
		this.height() - this.edge * 2
	);
	this.drawRectBorder(context);
};

ColorSlotMorph.prototype.drawRectBorder =
	InputSlotMorph.prototype.drawRectBorder;

// BlockHighlightMorph /////////////////////////////////////////////////

// BlockHighlightMorph inherits from Morph:

BlockHighlightMorph.prototype = new Morph();
BlockHighlightMorph.prototype.constructor = BlockHighlightMorph;
BlockHighlightMorph.uber = Morph.prototype;

// BlockHighlightMorph instance creation:

function BlockHighlightMorph() {
	this.init();
}

// MultiArgMorph ///////////////////////////////////////////////////////

/*
	I am an arity controlled list of input slots

	my block specs are

		%mult%x - where x is any single input slot
		%inputs - for an additional text label 'with inputs'

	evaluation is handles by the interpreter
*/

// MultiArgMorph  inherits from ArgMorph:

MultiArgMorph.prototype = new ArgMorph();
MultiArgMorph.prototype.constructor = MultiArgMorph;
MultiArgMorph.uber = ArgMorph.prototype;

// MultiArgMorph instance creation:

function MultiArgMorph(slotSpec, labelTxt, min, eSpec) {
	this.init(slotSpec, labelTxt, min, eSpec);
}

MultiArgMorph.prototype.init = function (slotSpec, labelTxt, min, eSpec) {
	var	label,
		arrows = new Morph(),
		leftArrow,
		rightArrow,
		i;

	this.slotSpec = slotSpec || '%s';
	this.labelText = labelTxt || '';
	this.minInputs = min || 0;
	this.elementSpec = eSpec || null;
	MultiArgMorph.uber.init.call(this);

	// prevent me from being exchanged (default, changable for instances)
	this.isStatic = true;

	// label text:
	label = this.labelPart(this.labelText);
	this.add(label);
	label.hide();

	// left arrow:
	leftArrow = new ArrowMorph(
		'left',
		this.fontSize,
		Math.max(Math.floor(this.fontSize / 6), 1)
	);

	// right arrow:
	rightArrow = new ArrowMorph(
		'right',
		this.fontSize,
		Math.max(Math.floor(this.fontSize / 6), 1)
	);

	// control panel:
	arrows.add(leftArrow);
	arrows.add(rightArrow);
	arrows.drawNew();

	this.add(arrows);

	// create the minimum number of inputs
	for (i = 0; i < this.minInputs; i += 1) {
		this.addInput();
	}
};

MultiArgMorph.prototype.label = function () {
	return this.children[0];
};

MultiArgMorph.prototype.arrows = function () {
	return this.children[this.children.length - 1];
};

MultiArgMorph.prototype.getSpec = function () {
	return '%mult' + this.slotSpec;
};

// MultiArgMorph defaults:

MultiArgMorph.prototype.setContents = function (anArray) {
    var inputs = this.inputs(), i;
    for (i = 0; i < anArray.length; i += 1) {
        if (anArray[i] !== null && (inputs[i])) {
            inputs[i].setContents(anArray[i]);
        }
    }
};

// MultiArgMorph layout:

MultiArgMorph.prototype.fixLayout = function () {
	if (this.slotSpec === '%t') {
		this.isStatic = true; // in this case I cannot be exchanged
	}
	if (this.parent) {
		var label = this.label(), shadowColor;
		this.color = this.parent.color;
		shadowColor = this.color.darker(this.labelContrast);
		this.arrows().color = this.color;
		if (this.labelText !== '') {
			if (!label.shadowColor.eq(shadowColor)) {
				label.shadowColor = shadowColor;
				label.drawNew();
			}
		}
	}
	this.fixArrowsLayout();
	MultiArgMorph.uber.fixLayout.call(this);
	if (this.parent) {
		this.parent.fixLayout();
	}
};

MultiArgMorph.prototype.fixArrowsLayout = function () {
	var	label = this.label(),
		arrows = this.arrows(),
		leftArrow = arrows.children[0],
		rightArrow = arrows.children[1];
	if (this.inputs().length < (this.minInputs + 1)) {
		label.hide();
		leftArrow.hide();
		rightArrow.setPosition(arrows.position());
		arrows.setExtent(rightArrow.extent());
	} else {
		if (this.labelText !== '') {
			label.show();
		}
		leftArrow.show();
		rightArrow.setPosition(leftArrow.topCenter());
		arrows.bounds.corner = rightArrow.bottomRight().copy();
	}
	arrows.drawNew();
};

MultiArgMorph.prototype.refresh = function () {
	this.inputs().forEach(function (input) {
		input.drawNew();
	});
};

MultiArgMorph.prototype.drawNew = function () {
	MultiArgMorph.uber.drawNew.call(this);
	this.refresh();
};

// MultiArgMorph arity control:

MultiArgMorph.prototype.addInput = function () {
	var	newPart = this.labelPart(this.slotSpec),
		idx = this.children.length - 1;
	if (this.elementSpec === '%scriptVars') {
		newPart.setContents('abcdefghijklmnopqrstuvwxyz'[idx - 1]);
	} else if (this.elementSpec === '%parms') {
		newPart.setContents('#' + idx);
	}
	newPart.parent = this;
	this.children.splice(idx, 0, newPart);
	newPart.drawNew();
	this.fixLayout();
};

MultiArgMorph.prototype.removeInput = function () {
	var oldPart, scripts;
	if (this.children.length > 1) {
		oldPart = this.children[this.children.length - 2];
		this.removeChild(oldPart);
		if (oldPart instanceof BlockMorph) {
			scripts = this.parentThatIsA(ScriptsMorph);
			if (scripts) {
				scripts.add(oldPart);
			}
		}
	}
	this.fixLayout();
};

// MultiArgMorph events:

MultiArgMorph.prototype.mouseClickLeft = function (pos) {
    // if the <shift> key is pressed, repeat action 5 times
	var	arrows = this.arrows(),
		leftArrow = arrows.children[0],
		rightArrow = arrows.children[1],
        repetition = this.world().currentKey === 16 ? 3 : 1,
        i;

	this.startLayout();
	if (rightArrow.bounds.containsPoint(pos)) {
        for (i = 0; i < repetition; i += 1) {
            if (rightArrow.isVisible) {
                this.addInput();
            }
        }
	} else if (leftArrow.bounds.containsPoint(pos)) {
        for (i = 0; i < repetition; i += 1) {
            if (leftArrow.isVisible) {
                this.removeInput();
            }
        }
	} else {
		this.escalateEvent('mouseClickLeft', pos);
	}
	this.endLayout();
};

// MultiArgMorph arity evaluating:

MultiArgMorph.prototype.evaluate = function () {
/*
	this is usually overridden by the interpreter. This method is only
	called (and needed) for the variables menu.
*/
	var result = [];
	this.inputs().forEach(function (slot) {
		result.push(slot.evaluate());
	});
	return result;
};

// FunctionSlotMorph ///////////////////////////////////////////////////

/*
	I am an unevaluated, non-editable, rf-colored, rounded or diamond
	input slot.	My current (only) use is in the THE BLOCK block.

	My command spec is %f
*/

// FunctionSlotMorph inherits from ArgMorph:

FunctionSlotMorph.prototype = new ArgMorph();
FunctionSlotMorph.prototype.constructor = FunctionSlotMorph;
FunctionSlotMorph.uber = ArgMorph.prototype;

// FunctionSlotMorph instance creation:

function FunctionSlotMorph(isPredicate) {
	this.init(isPredicate);
}

FunctionSlotMorph.prototype.init = function (isPredicate) {
	FunctionSlotMorph.uber.init.call(this);
	this.isPredicate = isPredicate || false;
	this.color = this.rfColor;
	this.setExtent(new Point(
		(this.fontSize + this.edge * 2) * 2,
		this.fontSize + this.edge * 2
	));
};

FunctionSlotMorph.prototype.getSpec = function () {
	return '%f';
};

// FunctionSlotMorph drawing:

FunctionSlotMorph.prototype.drawNew = function () {
	var context, borderColor;

	// initialize my surface property
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	if (this.parent) {
		borderColor = this.parent.color;
	} else {
		borderColor = new Color(120, 120, 120);
	}

	// cache my border colors
	this.cachedClr = borderColor.toString();
	this.cachedClrBright = borderColor.lighter(this.contrast)
		.toString();
	this.cachedClrDark = borderColor.darker(this.contrast).toString();

	if (this.isPredicate) {
		this.drawDiamond(context);
	} else {
		this.drawRounded(context);
	}
};

FunctionSlotMorph.prototype.drawRounded = function (context) {
	var	h = this.height(),
		r = Math.min(this.rounding, h / 2),
		w = this.width(),
		shift = this.edge / 2,
		gradient;

	// draw the 'flat' shape:
	context.fillStyle = this.color.toString();
	context.beginPath();

	// top left:
	context.arc(
		r,
		r,
		r,
		radians(-180),
		radians(-90),
		false
	);

	// top right:
	context.arc(
		w - r,
		r,
		r,
		radians(-90),
		radians(-0),
		false
	);

	// bottom right:
	context.arc(
		w - r,
		h - r,
		r,
		radians(0),
		radians(90),
		false
	);

	// bottom left:
	context.arc(
		r,
		h - r,
		r,
		radians(90),
		radians(180),
		false
	);

	context.closePath();
	context.fill();


	// add 3D-Effect:
	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	// bottom left corner
	context.strokeStyle = this.cachedClr; //gradient;
	context.beginPath();
	context.arc(
		r,
		h - r,
		r - shift,
		radians(90),
		radians(180),
		false
	);
	context.stroke();

	// top right corner
	context.strokeStyle = this.cachedClr; //gradient;
	context.beginPath();
	context.arc(
		w - r,
		r,
		r - shift,
		radians(-90),
		radians(0),
		false
	);
	context.stroke();

	// normal gradient edges

	if (useBlurredShadows) {
		context.shadowOffsetX = shift;
		context.shadowOffsetY = shift;
		context.shadowBlur = this.edge;
		context.shadowColor = this.color.darker(80).toString();
	}

	// top edge: straight line
	gradient = context.createLinearGradient(
		0,
		0,
		0,
		this.edge
	);
	gradient.addColorStop(1, this.cachedClrDark);
	gradient.addColorStop(0, this.cachedClr);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(r - shift, shift);
	context.lineTo(w - r + shift, shift);
	context.stroke();

	// top edge: left corner
	gradient = context.createRadialGradient(
		r,
		r,
		r - this.edge,
		r,
		r,
		r
	);
	gradient.addColorStop(1, this.cachedClr);
	gradient.addColorStop(0, this.cachedClrDark);
	context.strokeStyle = gradient;
	context.beginPath();
	context.arc(
		r,
		r,
		r - shift,
		radians(180),
		radians(270),
		false
	);
	context.stroke();

	// left edge: straight vertical line
	gradient = context.createLinearGradient(0, 0, this.edge, 0);
	gradient.addColorStop(1, this.cachedClrDark);
	gradient.addColorStop(0, this.cachedClr);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(shift, r);
	context.lineTo(shift, h - r);
	context.stroke();

	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 0;

	// bottom edge: right corner
	gradient = context.createRadialGradient(
		w - r,
		h - r,
		r - this.edge,
		w - r,
		h - r,
		r
	);
	gradient.addColorStop(1, this.cachedClr);
	gradient.addColorStop(0, this.cachedClrBright);
	context.strokeStyle = gradient;
	context.beginPath();
	context.arc(
		w - r,
		h - r,
		r - shift,
		radians(0),
		radians(90),
		false
	);
	context.stroke();

	// bottom edge: straight line
	gradient = context.createLinearGradient(
		0,
		h - this.edge,
		0,
		h
	);
	gradient.addColorStop(1, this.cachedClr);
	gradient.addColorStop(0, this.cachedClrBright);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(r - shift, h - shift);
	context.lineTo(w - r + shift, h - shift);
	context.stroke();

	// right edge: straight vertical line
	gradient = context.createLinearGradient(w - this.edge, 0, w, 0);
	gradient.addColorStop(1, this.cachedClr);
	gradient.addColorStop(0, this.cachedClrBright);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(w - shift, r + shift);
	context.lineTo(w - shift, h - r);
	context.stroke();

};

FunctionSlotMorph.prototype.drawDiamond = function (context) {
	var	w = this.width(),
		h = this.height(),
		h2 = Math.floor(h / 2),
		r = Math.min(this.rounding, h2),
		shift = this.edge / 2,
		gradient;

	// draw the 'flat' shape:
	context.fillStyle = this.color.toString();
	context.beginPath();

	context.moveTo(0, h2);
	context.lineTo(r, 0);
	context.lineTo(w - r, 0);
	context.lineTo(w, h2);
	context.lineTo(w - r, h);
	context.lineTo(r, h);

	context.closePath();
	context.fill();

	// add 3D-Effect:
	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	// half-tone edges
	// bottom left corner
	context.strokeStyle = this.cachedClr;
	context.beginPath();
	context.moveTo(shift, h2);
	context.lineTo(r, h - shift);
	context.closePath();
	context.stroke();

	// top right corner
	context.strokeStyle = this.cachedClr;
	context.beginPath();
	context.moveTo(w - shift, h2);
	context.lineTo(w - r, shift);
	context.closePath();
	context.stroke();

	// normal gradient edges
	// top edge: left corner

	if (useBlurredShadows) {
		context.shadowOffsetX = shift;
		context.shadowOffsetY = shift;
		context.shadowBlur = this.edge;
		context.shadowColor = this.color.darker(80).toString();
	}

	gradient = context.createLinearGradient(
		0,
		0,
		r,
		0
	);
	gradient.addColorStop(1, this.cachedClrDark);
	gradient.addColorStop(0, this.cachedClr);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(shift, h2);
	context.lineTo(r, shift);
	context.closePath();
	context.stroke();

	// top edge: straight line
	gradient = context.createLinearGradient(
		0,
		0,
		0,
		this.edge
	);
	gradient.addColorStop(1, this.cachedClrDark);
	gradient.addColorStop(0, this.cachedClr);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(r, shift);
	context.lineTo(w - r, shift);
	context.closePath();
	context.stroke();

	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 0;

	// bottom edge: right corner
	gradient = context.createLinearGradient(
		w - r,
		0,
		w,
		0
	);
	gradient.addColorStop(1, this.cachedClr);
	gradient.addColorStop(0, this.cachedClrBright);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(w - r, h - shift);
	context.lineTo(w - shift, h2);
	context.closePath();
	context.stroke();

	// bottom edge: straight line
	gradient = context.createLinearGradient(
		0,
		h - this.edge,
		0,
		h
	);
	gradient.addColorStop(1, this.cachedClr);
	gradient.addColorStop(0, this.cachedClrBright);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(r + shift, h - shift);
	context.lineTo(w - r - shift, h - shift);
	context.closePath();
	context.stroke();
};

// ReporterSlotMorph ///////////////////////////////////////////////////

/*
	I am a ReporterBlock-shaped input slot. I can nest as well as
	accept reporter blocks (containing reified scripts).

	my most important accessor is

	nestedBlock()	- answer the reporter block I encompass, if any

	My command spec is %r for reporters (round) and %p for
	predicates (diamond)

	evaluate() returns my nested block or null
*/

// ReporterSlotMorph inherits from FunctionSlotMorph:

ReporterSlotMorph.prototype = new FunctionSlotMorph();
ReporterSlotMorph.prototype.constructor = ReporterSlotMorph;
ReporterSlotMorph.uber = FunctionSlotMorph.prototype;

// ReporterSlotMorph instance creation:

function ReporterSlotMorph(isPredicate) {
	this.init(isPredicate);
}

ReporterSlotMorph.prototype.init = function (isPredicate) {
	ReporterSlotMorph.uber.init.call(this, isPredicate);
	this.add(this.emptySlot());
	this.fixLayout();
};

ReporterSlotMorph.prototype.emptySlot = function () {
	var	empty = new ArgMorph(),
		shrink = this.rfBorder * 2 + this.edge * 2;
	empty.color = this.rfColor;
	empty.alpha = 0;
	empty.setExtent(new Point(
		(this.fontSize + this.edge * 2) * 2 - shrink,
		this.fontSize + this.edge * 2 - shrink
	));
	return empty;
};

// ReporterSlotMorph accessing:

ReporterSlotMorph.prototype.getSpec = function () {
	return '%r';
};

ReporterSlotMorph.prototype.contents = function () {
	return this.children[0];
};

ReporterSlotMorph.prototype.nestedBlock = function () {
	var contents = this.contents();
	return contents instanceof ReporterBlockMorph ? contents : null;
};

// ReporterSlotMorph evaluating:

ReporterSlotMorph.prototype.evaluate = function () {
	return this.nestedBlock();
};

CommandSlotMorph.prototype.isEmptySlot = function () {
	return this.nestedBlock() === null;
};

// ReporterSlotMorph layout:

ReporterSlotMorph.prototype.fixLayout = function () {
	var	contents = this.contents();
	this.setExtent(contents.extent().add(
		this.edge * 2 + this.rfBorder * 2
	));
	contents.setCenter(this.center());
	if (this.parent) {
		if (this.parent.fixLayout) {
			this.parent.fixLayout();
		}
	}
};

