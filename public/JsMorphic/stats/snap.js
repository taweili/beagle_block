/*

	morphic.js

	a lively Web-GUI
	inspired by Squeak

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


	documentation contents
	----------------------
	I. inheritance hierarchy
	II. object definition toc
	III. yet to implement
	IV. open issues
	V. browser compatibility
	VI. the big picture
	VII. programming guide
		(1) setting up a web page
			(a) single world
			(b) multiple worlds
			(c) an application
		(2) manipulating morphs
		(3) events
			(a) mouse events
			(b) context menu
			(c) dragging
			(d) dropping
			(e) keyboard events
			(f) resize event
            (g) combined mouse-keyboard events
		(4) stepping
		(5) creating new kinds of morphs
		(6) development and user modes
		(7) turtle graphics
		(8) damage list housekeeping
		(9) minifying morphic.js
	VIII. acknowledgements
	IX. contributors


	I. hierarchy
	-------------
	the following tree lists all constructors hierarchically,
	indentation indicating inheritance. Refer to this list to get a
	contextual overview:

	Color
	Node
		Morph
			BlinkerMorph
				CursorMorph
			BouncerMorph*
			BoxMorph
				InspectorMorph
				MenuMorph
				MouseSensorMorph*
				SpeechBubbleMorph
			CircleBoxMorph
				SliderButtonMorph
				SliderMorph
			ColorPaletteMorph
				GrayPaletteMorph
			ColorPickerMorph
			FrameMorph
				ScrollFrameMorph
					ListMorph
				StringFieldMorph
				WorldMorph
			HandleMorph
			HandMorph
			PenMorph
			ShadowMorph
			StringMorph
			TextMorph
			TriggerMorph
				MenuItemMorph
	Point
	Rectangle


	II. toc
	-------
	the following list shows the order in which all constructors are
	defined. Use this list to locate code in this document:


	Global settings
	Global functions

	Color
	Point
	Rectangle
	Node
	Morph
	ShadowMorph
	HandleMorph
	PenMorph
	ColorPaletteMorph
	GrayPaletteMorph
	ColorPickerMorph
	BlinkerMorph
	CursorMorph
	BoxMorph
	SpeechBubbleMorph
	CircleBoxMorph
	SliderButtonMorph
	SliderMorph
	MouseSensorMorph*
	InspectorMorph
	MenuMorph
	StringMorph
	TextMorph
	TriggerMorph
	MenuItemMorph
	FrameMorph
	ScrollFrameMorph
	ListMorph
	StringFieldMorph
	BouncerMorph*
	HandMorph
	WorldMorph

	* included only for demo purposes


	III. yet to implement
	---------------------
	- (full) virtual keyboard (for mobile devices)
	- keyboard support for scroll frames and lists


	IV. open issues
	----------------
	- blurry shadows don't work well in Chrome for Windows


	V. browser compatibility
	------------------------
	I have taken great care and considerable effort to make morphic.js
	runnable and appearing exactly the same on all current browsers
	available to me:

	- Firefox for Windows
	- Firefox for Mac
	- Chrome for Windows (blurry shadows have some issues)
	- Chrome for Mac
	- Safari for Windows
	- safari for Mac
	- Safari for iOS (mobile)
	- IE for Windows
	- Opera for Windows
    - Opera for Mac


	VI. the big picture
	-------------------
	Morphic.js is completely based on Canvas and JavaScript, it is just
	Morphic, nothing else. Morphic.js is very basic and covers only the
	bare essentials:

		* a stepping mechanism (a time-sharing multiplexer for lively
		  user interaction ontop of a single OS/browser thread)
		* progressive display updates (only dirty rectangles are
		  redrawn in each display cycle)
		* a tree structure
		* a single World per Canvas element (although you can have
		  multiple worlds in multiple Canvas elements on the same web
		  page)
		* a single Hand per World (but you can support multi-touch
		  events)
		* a single text entry focus per World

	In its current state morphic.js doesn't support Transforms (you
	cannot rotate Morphs), but with PenMorph there already is a simple
	LOGO-like turtle that you can use to draw onto any Morph it is
	attached to. I'm planning to add special Morphs that support these
	operations later on, but not for every Morph in the system.
	Therefore these additions ("sprites" etc.) are likely to be part of
	other libraries ("microworld.js") in separate files.

	the purpose of morphic.js is to provide a malleable framework that
	will let me experiment with lively GUIs for my hobby horse, which
	is drag-and-drop, blocks based programming languages. Those things
	(BYOB4 - http://byob.berkeley.edu) will be written using morphic.js
	as a library.


	VII. programming guide
	----------------------
	Morphic.js provides a library for lively GUIs inside single HTML
	Canvas elements. Each such canvas element functions as a "world" in
	which other visible shapes ("morphs") can be positioned and
	manipulated, often directly and interactively by the user. Morphs
	are tree nodes and may contain any number of submorphs ("children").

	All things visible in a morphic World are morphs themselves, i.e.
	all text rendering, blinking cursors, entry fields, menus, buttons,
	sliders, windows and dialog boxes etc. are created with morphic.js
	rather than using HTML DOM elements, and as a consequence can be
	changed and adjusted by the programmer regardless of proprietary
	browser behavior.

	Each World has an - invisible - "Hand" resembling the mouse cursor
	(or the user's finger on touch screens) which handles mouse events,
	and may also have a keyboardReceiver to handle key events.

	The basic idea of Morphic is to continuously run display cycles and
	to incrementally update the screen by only redrawing those  World
	regions	which have been "dirtied" since the last redraw. Before
	each shape is processed for redisplay it gets the chance to perform
	a "step" procedure, thus allowing for an illusion of concurrency.


	(1) setting up a web page
	-------------------------
	Setting up a web page for Morphic always involves three steps:
	adding one or more Canvas elements, defining one or more worlds,
	initializing and starting the main loop.


	(a) single world
	-----------------
	Most commonly you will want your World to fill the browsers's whole
	client area. This default situation is easiest and most straight
	forward.

	example html file:

	<!DOCTYPE html>
	<html>
		<head>
			<title>Morphic!</title>
			<script type="text/javascript" src="morphic.js"></script>
			<script type="text/javascript">
				var world;

				window.onload = function () {
					world = new WorldMorph(
						document.getElementById('world'));
					setInterval(loop, 50);
				};

				function loop() {
					world.doOneCycle();
				}
			</script>
		</head>
		<body>
			<canvas id="world" tabindex="1" width="800" height="600">
				<p>Your browser doesn't support canvas.</p>
			</canvas>
		</body>
	</html>

	if you use ScrollFrames or otherwise plan to support mouse wheel
	scrolling events, you might also add the following inline-CSS
	attribute to the Canvas element:

		style="position: absolute;"

	which will prevent the World to be scrolled around instead of the
	elements inside of it in some browsers.


	(b) multiple worlds
	-------------------
	If you wish to create a web page with more than one world, make
	sure to prevent each world from auto-filling the whole page and
	include	it in the main loop. It's also a good idea to give each
	world its own tabindex:

	example html file:

	<!DOCTYPE html>
	<html>
		<head>
			<title>Morphic!</title>
			<script type="text/javascript" src="morphic.js"></script>
			<script type="text/javascript">
				var world1, world2;

				window.onload = function () {
					world1 = new WorldMorph(
						document.getElementById('world1'), false);
					world2 = new WorldMorph(
						document.getElementById('world2'), false);
					setInterval(loop, 50);
				};

				function loop() {
					world1.doOneCycle();
					world2.doOneCycle();
				}
			</script>
		</head>
		<body>
			<p>first world:</p>
			<canvas id="world1" tabindex="1" width="600" height="400">
				<p>Your browser doesn't support canvas.</p>
			</canvas>
			<p>second world:</p>
			<canvas id="world2" tabindex="2" width="400" height="600">
				<p>Your browser doesn't support canvas.</p>
			</canvas>
		</body>
	</html>


	(c) an application
	-------------------
	Of course, most of the time you don't want to just plain use the
	standard Morhic World "as is" out of the box, but write your own
	application (something like Scratch!) in it. For such an
	application you'll create your own morph prototypes, perhaps
	assemble your own "window frame" and bring it all to life in a
	customized World state. the following example creates a simple
	snake-like mouse drawing game.

	example html file:

	<!DOCTYPE html>
	<html>
		<head>
			<title>touch me!</title>
			<script type="text/javascript" src="morphic.js"></script>
			<script type="text/javascript">
				var worldCanvas, sensor;

				window.onload = function () {
					var x, y, w, h;

					worldCanvas = document.getElementById('world');
					world = new WorldMorph(worldCanvas);
					world.isDevMode = false;
					world.color = new Color();

					w = 100;
					h = 100;

					x = 0;
					y = 0;

					while ((y * h) < world.height()) {
						while ((x * w) < world.width()) {
							sensor = new MouseSensorMorph();
							sensor.setPosition(new Point(x * w, y * h));
							sensor.alpha = 0;
							sensor.setExtent(new Point(w, h));
							world.add(sensor);
							x += 1;
						}
						x = 0;
						y += 1;
					}
					setInterval(loop, 50);
				};

				function loop() {
					world.doOneCycle();
				}
			</script>
		</head>
		<body bgcolor='black'>
			<canvas id="world" width="800" height="600">
				<p>Your browser doesn't support canvas.</p>
			</canvas>
		</body>
	</html>

	To get an idea how you can craft your own custom morph prototypes
	I've included two examples which should give you an idea how to add
	properties, override inherited methods and use the stepping
	mechanism for "livelyness":

		BouncerMorph
		MouseSensorMorph

	For the sake of sharing a single file I've included those examples
	in morphic.js itself. Usually you'll define your additions in a
	separate file and keep morphic.js untouched.


	(2) manipulating morphs
	-----------------------
	There are many methods to programmatically manipulate morphs. Among
	the most important and common ones among all morphs are the
	following nine:

	* hide()
	* show()

	* setPosition(aPoint)
	* setExtent(aPoint)
	* setColor(aColor)

	* add(submorph)			- attaches submorph ontop
	* addBack(submorph)		- attaches submorph underneath

	* fullCopy()			- duplication
	* destroy()				- deletion


	(3) events
	----------
	All user (and system) interaction is triggered by events, which are
	passed on from the root element - the World - to its submorphs. The
	World contains a list of system (browser) events it reacts to in its

		initEventListeners()

	method. Currently there are

		- mouse
        - drop
		- keyboard
		- (window) resize

	events.

	These system events are dispatched within the morphic World by the
	World's Hand and its keyboardReceiver (usually the active text
	cursor).


	(a) mouse events:
	-----------------
	The Hand dispatches the following mouse events to relevant morphs:

		mouseDownLeft
		mouseDownRight
		mouseClickLeft
		mouseClickRight
		mouseEnter
		mouseLeave
		mouseEnterDragging
		mouseLeaveDragging
		mouseMove
		mouseScroll

	If you wish your morph to react to any such event, simply add a
	method of the same name as the event, e.g:

		MyMorph.prototype.mouseMove = function(pos) {};

	The only optional parameter of such a method is a Point object
	indicating the current position of the Hand inside the World's
	coordinate system.

	Events may be "bubbled" up a morph's owner chain by calling

		this.escalateEvent(functionName, arg)

	in the event handler method's code.

	Likewise, removing the event handler method will render your morph
	passive to the event in question.


	(b) context menu:
	-----------------
	By default right-clicking (or double-finger tapping) on a morph
	also invokes its context menu (in addition to firing the
	mouseClickRight event). A morph's context menu can be customized by
	assigning a Menu instance to its

		customContextMenu

	property, or altogether suppressed by overriding its inherited

		contextMenu()

	method.


	(c) dragging:
	-------------
	Dragging a morph is initiated when the left mouse button is pressed,
	held and the mouse is moved.

	You can control whether a morph is draggable by setting its

		isDraggable

	property either to false or true. If a morph isn't draggable itself
	it will pass the pick-up request up its owner chain. This lets you
	create draggable composite morphs like Windows, DialogBoxes,
	Sliders etc.

	Sometimes it is desireable to make "template" shapes which cannot be
	moved themselves, but from which instead duplicates can be peeled
	off. This is especially useful for building blocks in construction
	kits, e.g. the MIT-Scratch palette. Morphic.js supports lets you
	control this functionality by setting the

		isTemplate

	property flag to true for any morph whose "isDraggable" property is
	turned off. When dragging such a Morph the hand will instead grab
	a duplicate of the template whose "isDraggable" flag is true and
	whose "isTemplate" flag is false, in other words: a non-template.

	Dragging is indicated by adding a drop shadow to the morph in hand.
	If a morph follows the hand without displaying a drop shadow it is
	merely being moved about without changing its parent (owner morph),
	e.g. when "dragging" a morph handle to resize its owner, or when
	"dragging" a slider button.

	Right before a morph is picked up its

		prepareToBeGrabbed(handMorph)

	method is invoked, if it is present. Immediately after the pick-up
	the former parent's

		reactToGrabOf(grabbedMorph)

	method is called, again only if it exists.

	Similar to events, these  methods are optional and don't exist by
	default. For a simple example of how they can be used to adjust
	scroll bars in a scroll frame please have a look at their
	implementation in FrameMorph.


	(d) dropping:
	-------------
	Dropping is triggered when the left mouse button is either pressed
	or released while the Hand is dragging a morph.

	Dropping a morph causes it to become embedded in a new owner morph.
	You can control this embedding behavior by setting the prospective
	drop target's

		acceptsDrops

	property to either true or false, or by overriding its inherited

		wantsDropOf(aMorph)

	method.

	Right after a morph has been dropped its

		justDropped(handMorph)

	method is called, and its new parent's

		reactToDropOf(droppedMorph)

	method is invoked, again only if each method exists.

	Similar to events, these  methods are optional and by default are
	not present in morphs by default (watch out for inheritance,
	though!). For a simple example of how they can be used to adjust
	scroll bars in a scroll frame please have a look at their
	implementation in FrameMorph.

    Drops of image elements from outside the world canvas are dispatched as

        imageDropped(aCanvas)

    events to interested Morphs at the mousePointer. If you want you Morph
    to e.g. import outside images you can add the imageDropped() method to
    it. The parameter passed to the event handles is a new offscreen
    canvas element representing a copy of the original image element which
    can be directly used, e.g. by assigning it to another Morph's image
    property.


	(e) keyboard events
	-------------------
	The World dispatches the following key events to its active
	keyboardReceiver:

		keypress
		keydown
        keyup

	Currently the only morph which acts as keyboard receiver is
	CursorMorph, the basic text editing widget. If you wish to add
	keyboard support to your morph you need to add event handling
	methods for

		processKeyPress(event)
		processKeyDown(event)
		processKeyUp(event)

	and activate them by assigning your morph to the World's

		keyboardReceiver

	property.
    
    Note that processKeyUp() is optional and doesn't have to be present
    if your morph doesn't require it.


	(f) resize event
	----------------
	The Window resize event is handled by the World and allows the
	World's extent to be adjusted so that it always completely fills
	the browser's visible page. You can turn off this default behavior
	by setting the World's

		useFillPage

	property to false.

	Alternatively you can also initialize the World with the
	useFillPage switch turned off from the beginning by passing the
	false value as second parameter to the World's constructor:

		world = new World(aCanvas, false);

	Use this when creating a web page with multiple Worlds.

	if "useFillPage" is turned on the World dispatches an

		reactToWorldResize(newBounds)

	events to all of its children (toplevel only), allowing each to
	adjust to the new World bounds by implementing a corresponding
	method, the passed argument being the World's new dimensions after
	completing the resize. By default, the "reactToWorldResize" Method
	does not exist.

	Example:

	Add the following method to your Morph to let it automatically
	fill the whole World, but leave a 10 pixel border uncovered:

		MyMorph.prototype.reactToWorldResize = function (rect) {
			this.changed();
			this.bounds = rect.insetBy(10);
			this.drawNew();
			this.changed();
		};


    (g) combined mouse-keyboard events
    ----------------------------------
    Occasionally you'll want an object to react differently to a mouse
    click or to some other mouse event while the user holds down a key
    on the keyboard. Such "shift-click", "ctl-click", or "alt-click"
    events can be implemented by querying the World's

        currentKey

    property inside the function that reacts to the mouse event. This
    property stores the keyCode of the key that's currently pressed.
    Once the key is released by the user it reverts to null.



	(4) stepping
	------------
	Stepping is what makes Morphic "magical". Two properties control
	a morph's stepping behavior: the fps attribute and the step()
	method.

	By default the

		step()

	method does nothing. As you can see in the examples of BouncerMorph
	and MouseSensorMorph you can easily override this inherited method
	to suit your needs.

	By default the step() method is called once per display cycle.
	Depending on the number of actively stepping morphs and the
	complexity of your step() methods this can cause quite a strain on
	your CPU, and also result in your application behaving differently
	on slower computers than on fast ones.

	setting

		myMorph.fps

	to a number lower than the interval for the main loop lets you free
	system resources (albeit at the cost of a less responsive or slower
	behavior for this particular morph).


	(5) creating new kinds of morphs
	--------------------------------
	The real fun begins when you start to create new kinds of morphs
	with customized shapes. Imagine, e.g. jigsaw puzzle pieces or
	musical notes. For this you have to override the default

		drawNew()

	method.

	This method creates a new offscreen Canvas and stores it in
	the morph's

		image

	property.

	Use the following template for a start:

		MyMorph.prototype.drawNew = function() {
			var context;
			this.image = newCanvas(this.extent());
			context = this.image.getContext('2d');
			// use context to paint stuff here
		};

	If your new morph stores or references other morphs outside of the
	submorph tree in other properties, be sure to also override the
	default

		copyRecordingReferences()

	method accordingly if you want it to support duplication.


	(6) development and user modes
	------------------------------
	When working with Squeak on Scratch or BYOB among the features I
	like the best and use the most is inspecting what's going on in
	the World while it is up and running. That's what development mode
	is for (you could also call it debug mode). In essence development
	mode controls which context menu shows up. In user mode right
	clicking (or double finger tapping) a morph invokes its

		customContextMenu

	property, whereas in development mode only the general

		developersMenu()

	method is called and the resulting menu invoked. The developers'
	menu features Gui-Builder-wise functionality to directly inspect,
	take apart, reassamble and otherwise manipulate morphs and their
	contents.
    
    Instead of using the "customContextMenu" property you can also
    assign a more dynamic contextMenu by overriding the general
    
        userMenu()
    
    method with a customized menu constructor. The difference between
    the customContextMenu property and the userMenu() method is that
    the former is also present in development mode and overrides the
    developersMenu() result. For an example of how to use the
    customContextMenu property have a look at TextMorph's evaluation
    menu, which is used for the Inspector's evaluation pane.

	When in development mode you can inspect every Morph's properties
	with the inspector, including all of its methods. The inspector
	also lets you add, remove and rename properties, and even edit
	their values at runtime. Like in a Smalltalk environment the inspect
	features an evaluation pane into which you can type in arbitrary
	JavaScript code and evaluate it in the context of the inspectee.

	Use switching between user and development modes while you are
	developing an application and disable switching to development once
	you're done and deploying, because generally you don't want to
	confuse end-users with inspectors and meta-level stuff.


	(7) turtle graphics
	-------------------

	The basic Morphic kernel features a simple LOGO turtle constructor
	called

		PenMorph

	which you can use to draw onto its parent Morph. By default every
	Morph in the system (including the World) is able to act as turtle
	canvas and can display pen trails. Pen trails will be lost whenever
	the trails morph (the pen's parent) performs a "drawNew()"
	operation. If you want to create your own pen trails canvas, you
	may wish to modify its

		penTrails()

	property, so that it keeps a separate offscreen canvas for pen
	trails (and doesn't loose these on redraw).

	the following properties of PenMorph are relevant for turtle
	graphics:

		color		- a Color
		size		- line width of pen trails
		heading		- degrees
		isDown		- drawing state

	the following commands can be used to actually draw something:

		up()		- lift the pen up, further movements leave no trails
		down()		- set down, further movements leave trails
		clear()		- remove all trails from the current parent
		forward(n)	- move n steps in the current direction (heading)
		turn(n)		- turn right n degrees

	Turtle graphics can best be explored interactively by creating a
	new PenMorph object and by manipulating it with the inspector
	widget.

	NOTE: PenMorph has a special optimization for recursive operations
	called

		warp(function)

	You can significantly speed up recursive ops and increase the depth
	of recursion that's displayable by wrapping WARP around your
	recursive function call:

	example:

		myPen.warp(function () {
			myPen.tree(12, 120, 20);
		})

	will be much faster than just invoking the tree function, because it
	prevents the parent's parent from keeping track of every single line
	segment and instead redraws the outcome in a single pass.


	(8) damage list housekeeping
	----------------------------
	Morphic's progressive display update comes at the cost of having to
	cycle through a list of "broken rectangles" every display cycle. If
	this list gets very long working this damage list can lead to a
	seemingly dramatic slow-down of the Morphic system. Typically this
	occurs when updating the layout of complex Morphs with very many
	submorphs, e.g. when resizing an inspector window.
	
	An effective strategy to cope with this is to use the inherited
	
		trackChanges
		
	property of the Morph prototype for damage list housekeeping.

	The trackChanges property of the Morph prototype is a Boolean switch
	that determines whether the World's damage list ('broken' rectangles)
	tracks changes. By default the switch is always on. If set to false
	changes are not stored. This can be very useful for housekeeping of
	the damage list in situations where a large number of (sub-) morphs
	are changed more or less at once. Instead of keeping track of every
	single submorph's changes tremendous performance improvements can be
	achieved by setting the trackChanges flag to false before propagating
	the layout changes, setting it to true again and then storing the full
	bounds of the surrounding morph. An an example refer to the
    
        moveBy()
    
    method of HandMorph, and to the

		fixLayout()
		
	method of InspectorMorph, or the
	
		startLayout()
		endLayout()

	methods of SyntaxElementMorph in the Snap application.	
	

	(9) minifying morphic.js
	------------------------
	Coming from Smalltalk and being a Squeaker at heart I am a huge fan
	of browsing the code itself to make sense of it. Therefore I have
	included this documentation and (too little) inline comments so all
	you need to get going is this very file.

	Nowadays with live streaming HD video even on mobile phones 200 KB
	shouldn't be a big strain on bandwith, still minifying and even
	compressing morphic.js down do about 70 KB may sometimes improve
	performance in production use.

	Being an attorney-at-law myself you programmer folk keep harassing
	me with rabulistic nitpickings about free software licenses. I'm
	releasing morphic.js under an MIT license. Therefore please make
	sure to adhere to that license and to include both

		* the copyright notice
		* and the permission notice

	in any minified or compressed version or derivative work. ;-)


	VIII. acknowledgements
	----------------------
	The original Morphic was designed and written by Randy Smith and
	John Maloney for the SELF programming language, and later ported to
	Squeak (Smalltalk) by John Maloney and Dan Ingalls, who has also
	ported it to JavaScript (the Lively Kernel), once again setting
	a "Gold Standard" for self sustaining systems which morphic.js
	cannot and does not aspire to meet.

	This Morphic implementation for JavaScript is not a direct port of
	Squeak's Morphic, but still many individual functions have been
	ported almost literally from Squeak, sometimes even including their
	comments, e.g. the morph duplication mechanism fullCopy(). Squeak
	has been a treasure trove, and if morphic.js looks, feels and
	smells a lot like Squeak, I'll take it as a compliment.

	Evelyn Eastmond has inspired and encouraged me with her wonderful
	implementation of DesignBlocksJS. Thanks for sharing code, ideas
	and enthusiasm for programming.

	John Maloney has been my mentor and my source of inspiration for
	these Morphic experiments. Thanks for the critique, the suggestions
	and explanations for all things Morphic and for being my all time
	programming hero.

	I have written morphic.js in Florian Balmer's Notepad2 editor for
	Windows and come to depend on both Douglas Crockford's JSLint and
	Mozilla's Firebug to get it right.


	IX. contributors
	----------------------
	Joe Otto found and fixed many early bugs and taught me some tricks.
	Nathan Dinsmore contributed mouse wheel scrolling, cached
	background texture handling and countless bug fixes.
	Ian Reynolds contributed backspace key handling for Chrome.

*/

// Global settings /////////////////////////////////////////////////////

/*global window, HTMLCanvasElement, getMinimumFontHeight, FileReader*/

var morphicVersion = '2012-Mar-27';
var modules = {}; // keep track of additional loaded modules
var useBlurredShadows = true; // set to false for Windows-Chrome

var standardSettings = {
    minimumFontHeight: getMinimumFontHeight(), // browser settings
	menuFontName: 'sans-serif',
	menuFontSize: 12,
	bubbleHelpFontSize: 10,
	prompterFontName: 'sans-serif',
	prompterFontSize: 12,
	prompterSliderSize: 10,
	handleSize: 15,
	scrollBarSize: 12,
	mouseScrollAmount: 40,
	useVirtualKeyboard: false
};

var touchScreenSettings = {
    minimumFontHeight: standardSettings.minimumFontHeight,
	menuFontName: 'sans-serif',
	menuFontSize: 24,
	bubbleHelpFontSize: 18,
	prompterFontName: 'sans-serif',
	prompterFontSize: 24,
	prompterSliderSize: 20,
	handleSize: 26,
	scrollBarSize: 24,
	mouseScrollAmount: 40,
	useVirtualKeyboard: true
};

var MorphicPreferences = standardSettings;

// Global Functions ////////////////////////////////////////////////////

function nop() {
	// do explicitly nothing
	return null;
}

function contains(list, element) {
	// answer true if element is a member of list
	return list.some(function (any) {
		return any === element;
	});
}

function detect(list, predicate) {
	// answer the first element of list for which predicate evaluates
	// true, otherwise answer null
	var i, size = list.length;
	for (i = 0; i < size; i += 1) {
		if (predicate.call(null, list[i])) {
			return list[i];
		}
	}
	return null;
}

function isString(target) {
	return typeof target === 'string' || target instanceof String;
}

function isObject(target) {
	return target !== null &&
		(typeof target === 'object' || target instanceof Object);
}

function radians(degrees) {
	return degrees * Math.PI / 180;
}

function degrees(radians) {
	return radians * 180 / Math.PI;
}

function fontHeight(height) {
	return Math.max(height, MorphicPreferences.minimumFontHeight);
}

function newCanvas(extentPoint) {
	// answer a new empty instance of Canvas, don't display anywhere
	var canvas, ext;
	ext = extentPoint || {x: 0, y: 0};
	canvas = document.createElement('canvas');
	canvas.width = ext.x;
	canvas.height = ext.y;
	return canvas;
}
function getMinimumFontHeight() {
    // answer the height of the smallest font renderable in pixels
    var str = 'I',
        size = 50,
        canvas = document.createElement('canvas'),
        ctx,
        maxX,
        data,
        x,
        y;
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext('2d');
    ctx.font = '1px serif';
    maxX = ctx.measureText(str).width;
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'bottom';
    ctx.fillText(str, 0, size);
    for (y = 0; y < size; y += 1) {
        for (x = 0; x < maxX; x += 1) {
            data = ctx.getImageData(x, y, 1, 1);
            if (data.data[3] !== 0) {
                return size - y + 1;
            }
        }
    }
    return 0;
}

function getDocumentPositionOf(aDOMelement) {
	// answer the absolute coordinates of a DOM element in the document
	var pos, offsetParent;
	if (aDOMelement === null) {
		return {x: 0, y: 0};
	}
	pos = {x: aDOMelement.offsetLeft, y: aDOMelement.offsetTop};
	offsetParent = aDOMelement.offsetParent;
	while (offsetParent !== null) {
		pos.x += offsetParent.offsetLeft;
		pos.y += offsetParent.offsetTop;
		if (offsetParent !== document.body &&
				offsetParent !== document.documentElement) {
			pos.x -= offsetParent.scrollLeft;
			pos.y -= offsetParent.scrollTop;
		}
		offsetParent = offsetParent.offsetParent;
	}
	return pos;
}

function clone(target) {
	// answer a new instance of target's type
	if (typeof target === 'object') {
		var Clone = function () {};
		Clone.prototype = target;
		return new Clone();
	}
    return target;
}

function copy(target) {
	// answer a shallow copy of target
	var value, c, property;

	if (typeof target !== 'object') {
		return target;
	}
    value = target.valueOf();
    if (target !== value) {
        return new target.constructor(value);
    }
    if (target instanceof target.constructor &&
            target.constructor !== Object) {
        c = clone(target.constructor.prototype);
        for (property in target) {
            if (target.hasOwnProperty(property)) {
                c[property] = target[property];
            }
        }
    } else {
        c = {};
        for (property in target) {
            if (!c[property]) {
                c[property] = target[property];
            }
        }
    }
    return c;
}

// Colors //////////////////////////////////////////////////////////////

// Color instance creation:

function Color(r, g, b, a) {
	// all values are optional, just (r, g, b) is fine
	this.r = r || 0;
	this.g = g || 0;
	this.b = b || 0;
	this.a = a || ((a === 0) ? 0 : 1);
}

// Color string representation: e.g. 'rgba(255,165,0,1)'

Color.prototype.toString = function () {
	return 'rgba(' +
		Math.round(this.r) + ',' +
		Math.round(this.g) + ',' +
		Math.round(this.b) + ',' +
		this.a + ')';
};

// Color copying:

Color.prototype.copy = function () {
	return new Color(
		this.r,
		this.g,
		this.b,
		this.a
	);
};

// Color comparison:

Color.prototype.eq = function (aColor) {
	// ==
	return this.r === aColor.r
		&& this.g === aColor.g
		&& this.b === aColor.b;
};

// Color conversion (hsv):

Color.prototype.hsv = function () {
	// ignore alpha
	var	max, min, h, s, v, d,
		rr = this.r / 255,
		gg = this.g / 255,
		bb = this.b / 255;
	max = Math.max(rr, gg, bb);
	min = Math.min(rr, gg, bb);
	h = max;
	s = max;
	v = max;
	d = max - min;
	s = max === 0 ? 0 : d / max;
	if (max === min) {
		h = 0;
	} else {
		switch (max) {
		case rr:
			h = (gg - bb) / d + (gg < bb ? 6 : 0);
			break;
		case gg:
			h = (bb - rr) / d + 2;
			break;
		case bb:
			h = (rr - gg) / d + 4;
			break;
        }
        h /= 6;
    }
    return [h, s, v];
};

Color.prototype.set_hsv = function (h, s, v) {
	// ignore alpha, h, s and v are to be within [0, 1]
	var	i, f, p, q, t;
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
	case 0:
		this.r = v;
		this.g = t;
		this.b = p;
		break;
	case 1:
		this.r = q;
		this.g = v;
		this.b = p;
		break;
	case 2:
		this.r = p;
		this.g = v;
		this.b = t;
		break;
	case 3:
		this.r = p;
		this.g = q;
		this.b = v;
		break;
	case 4:
		this.r = t;
		this.g = p;
		this.b = v;
		break;
	case 5:
		this.r = v;
		this.g = p;
		this.b = q;
		break;
    }

    this.r *= 255;
    this.g *= 255;
    this.b *= 255;

};

// Color mixing:

Color.prototype.mixed = function (proportion, otherColor) {
	// answer a copy of this color mixed with another color, ignore alpha
	var	frac1 = Math.min(Math.max(proportion, 0), 1),
		frac2 = 1 - frac1;
	return new Color(
		this.r * frac1 + otherColor.r * frac2,
		this.g * frac1 + otherColor.g * frac2,
		this.b * frac1 + otherColor.b * frac2
	);
};

Color.prototype.darker = function (percent) {
	// return an rgb-interpolated darker copy of me, ignore alpha
	var fract = 0.8333;
	if (percent) {
		fract = (100 - percent) / 100;
	}
	return this.mixed(fract, new Color(0, 0, 0));
};

Color.prototype.lighter = function (percent) {
	// return an rgb-interpolated lighter copy of me, ignore alpha
	var fract = 0.8333;
	if (percent) {
		fract = (100 - percent) / 100;
	}
	return this.mixed(fract, new Color(255, 255, 255));
};

Color.prototype.dansDarker = function () {
	// return an hsv-interpolated darker copy of me, ignore alpha
	var	hsv = this.hsv(),
		result = new Color(),
		vv = Math.max(hsv[2] - 0.16, 0);
	result.set_hsv(hsv[0], hsv[1], vv);
	return result;
};

// Points //////////////////////////////////////////////////////////////

// Point instance creation:

function Point(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

// Point string representation: e.g. '12@68'

Point.prototype.toString = function () {
	return Math.round(this.x.toString()) +
		'@' + Math.round(this.y.toString());
};

// Point copying:

Point.prototype.copy = function () {
	return new Point(this.x, this.y);
};

// Point comparison:

Point.prototype.eq = function (aPoint) {
	// ==
	return this.x === aPoint.x && this.y === aPoint.y;
};

Point.prototype.lt = function (aPoint) {
	// <
	return this.x < aPoint.x && this.y < aPoint.y;
};

Point.prototype.gt = function (aPoint) {
	// >
	return this.x > aPoint.x && this.y > aPoint.y;
};

Point.prototype.ge = function (aPoint) {
	// >=
	return this.x >= aPoint.x && this.y >= aPoint.y;
};

Point.prototype.le = function (aPoint) {
	// <=
	return this.x <= aPoint.x && this.y <= aPoint.y;
};

Point.prototype.max = function (aPoint) {
	return new Point(Math.max(this.x, aPoint.x),
		Math.max(this.y, aPoint.y));
};

Point.prototype.min = function (aPoint) {
	return new Point(Math.min(this.x, aPoint.x),
		Math.min(this.y, aPoint.y));
};

// Point conversion:

Point.prototype.round = function () {
	return new Point(Math.round(this.x), Math.round(this.y));
};

Point.prototype.abs = function () {
	return new Point(Math.abs(this.x), Math.abs(this.y));
};

Point.prototype.neg = function () {
	return new Point(-this.x, -this.y);
};

Point.prototype.mirror = function () {
	return new Point(this.y, this.x);
};

Point.prototype.floor = function () {
	return new Point(
		Math.max(Math.floor(this.x), 0),
		Math.max(Math.floor(this.y), 0)
	);
};

Point.prototype.ceil = function () {
	return new Point(Math.ceil(this.x), Math.ceil(this.y));
};

// Point arithmetic:

Point.prototype.add = function (other) {
	if (other instanceof Point) {
		return new Point(this.x + other.x, this.y + other.y);
	}
    return new Point(this.x + other, this.y + other);
};

Point.prototype.subtract = function (other) {
	if (other instanceof Point) {
		return new Point(this.x - other.x, this.y - other.y);
	}
    return new Point(this.x - other, this.y - other);
};

Point.prototype.multiplyBy = function (other) {
	if (other instanceof Point) {
		return new Point(this.x * other.x, this.y * other.y);
	}
    return new Point(this.x * other, this.y * other);
};

Point.prototype.divideBy = function (other) {
	if (other instanceof Point) {
		return new Point(this.x / other.x, this.y / other.y);
	}
    return new Point(this.x / other, this.y / other);
};

Point.prototype.floorDivideBy = function (other) {
	if (other instanceof Point) {
		return new Point(Math.floor(this.x / other.x),
			Math.floor(this.y / other.y));
	}
    return new Point(Math.floor(this.x / other),
        Math.floor(this.y / other));
};

// Point polar coordinates:

Point.prototype.r = function () {
	var t = (this.multiplyBy(this));
	return Math.sqrt(t.x + t.y);
};

Point.prototype.degrees = function () {
/*
    answer the angle I make with origin in degrees.
    Right is 0, down is 90
*/
    var tan, theta;

    if (this.x === 0) {
        if (this.y >= 0) {
            return 90;
        }
        return 270;
    }
    tan = this.y / this.x;
    theta = Math.atan(tan);
    if (this.x >= 0) {
        if (this.y >= 0) {
            return degrees(theta);
        }
        return 360 + (degrees(theta));
    }
    return 180 + degrees(theta);
};

Point.prototype.theta = function () {
/*
    answer the angle I make with origin in radians.
    Right is 0, down is 90
*/
    var tan, theta;

    if (this.x === 0) {
        if (this.y >= 0) {
            return radians(90);
        }
        return radians(270);
    }
    tan = this.y / this.x;
    theta = Math.atan(tan);
    if (this.x >= 0) {
        if (this.y >= 0) {
            return theta;
        }
        return radians(360) + theta;
    }
    return radians(180) + theta;
};

// Point functions:

Point.prototype.crossProduct = function (aPoint) {
	return this.multiplyBy(aPoint.mirror());
};

Point.prototype.distanceTo = function (aPoint) {
	return (aPoint.subtract(this)).r();
};

Point.prototype.rotate = function (direction, center) {
	// direction must be 'right', 'left' or 'pi'
	var offset = this.subtract(center);
	if (direction === 'right') {
		return new Point(-offset.y, offset.y).add(center);
	}
    if (direction === 'left') {
		return new Point(offset.y, -offset.y).add(center);
	}
    // direction === 'pi'
    return center.subtract(offset);
};

Point.prototype.flip = function (direction, center) {
	// direction must be 'vertical' or 'horizontal'
	if (direction === 'vertical') {
		return new Point(this.x, center.y * 2 - this.y);
	}
    // direction === 'horizontal'
    return new Point(center.x * 2 - this.x, this.y);
};

Point.prototype.distanceAngle = function (dist, angle) {
	var	deg = angle, x, y;
	if (deg > 270) {
		deg = deg - 360;
	} else if (deg < -270) {
		deg = deg + 360;
	}
	if (-90 <= deg && deg <= 90) {
		x = Math.sin(radians(deg)) * dist;
		y = Math.sqrt((dist * dist) - (x * x));
		return new Point(x + this.x, this.y - y);
	}
    x = Math.sin(radians(180 - deg)) * dist;
    y = Math.sqrt((dist * dist) - (x * x));
    return new Point(x + this.x, this.y + y);
};

// Point transforming:

Point.prototype.scaleBy = function (scalePoint) {
	return this.multiplyBy(scalePoint);
};

Point.prototype.translateBy = function (deltaPoint) {
	return this.add(deltaPoint);
};

Point.prototype.rotateBy = function (angle, centerPoint) {
    var center = centerPoint || new Point(0, 0),
        p = this.subtract(center),
        r = p.r(),
        theta = angle - p.theta();
    return new Point(
        center.x + (r * Math.cos(theta)),
        center.y - (r * Math.sin(theta))
    );
};

// Point conversion:

Point.prototype.asArray = function () {
	return [this.x, this.y];
};

// Rectangles //////////////////////////////////////////////////////////

// Rectangle instance creation:

function Rectangle(left, top, right, bottom) {
	this.init(new Point((left || 0), (top || 0)),
			new Point((right || 0), (bottom || 0)));
}

Rectangle.prototype.init = function (originPoint, cornerPoint) {
	this.origin = originPoint;
	this.corner = cornerPoint;
};

// Rectangle string representation: e.g. '[0@0 | 160@80]'

Rectangle.prototype.toString = function () {
	return '[' + this.origin.toString() + ' | ' +
		this.extent().toString() + ']';
};

// Rectangle copying:

Rectangle.prototype.copy = function () {
	return new Rectangle(
		this.left(),
		this.top(),
		this.right(),
		this.bottom()
	);
};

// creating Rectangle instances from Points:

Point.prototype.corner = function (cornerPoint) {
	// answer a new Rectangle
	return new Rectangle(
		this.x,
		this.y,
		cornerPoint.x,
		cornerPoint.y
	);
};

Point.prototype.rectangle = function (aPoint) {
	// answer a new Rectangle
	var org, crn;
	org = this.min(aPoint);
	crn = this.max(aPoint);
	return new Rectangle(org.x, org.y, crn.x, crn.y);
};

Point.prototype.extent = function (aPoint) {
	//answer a new Rectangle
	var crn = this.add(aPoint);
	return new Rectangle(this.x, this.y, crn.x, crn.y);
};

// Rectangle accessing - setting:

Rectangle.prototype.setTo = function (left, top, right, bottom) {
	// note: all inputs are optional and can be omitted

	this.origin = new Point(
		left || ((left === 0) ? 0 : this.left()),
		top || ((top === 0) ? 0 : this.top())
	);

	this.corner = new Point(
		right || ((right === 0) ? 0 : this.right()),
		bottom || ((bottom === 0) ? 0 : this.bottom())
	);
};

// Rectangle accessing - getting:

Rectangle.prototype.area = function () {
	//requires width() and height() to be defined
	var w = this.width();
	if (w < 0) {
		return 0;
	}
    return Math.max(w * this.height(), 0);
};

Rectangle.prototype.bottom = function () {
	return this.corner.y;
};

Rectangle.prototype.bottomCenter = function () {
	return new Point(this.center().x, this.bottom());
};

Rectangle.prototype.bottomLeft = function () {
	return new Point(this.origin.x, this.corner.y);
};

Rectangle.prototype.bottomRight = function () {
	return this.corner.copy();
};

Rectangle.prototype.boundingBox = function () {
	return this;
};

Rectangle.prototype.center = function () {
	return this.origin.add(
		this.corner.subtract(this.origin).floorDivideBy(2)
	);
};

Rectangle.prototype.corners = function () {
	return [this.origin,
		this.bottomLeft(),
		this.corner,
		this.topRight()];
};

Rectangle.prototype.extent = function () {
	return this.corner.subtract(this.origin);
};

Rectangle.prototype.height = function () {
	return this.corner.y - this.origin.y;
};

Rectangle.prototype.left = function () {
	return this.origin.x;
};

Rectangle.prototype.leftCenter = function () {
	return new Point(this.left(), this.center().y);
};

Rectangle.prototype.right = function () {
	return this.corner.x;
};

Rectangle.prototype.rightCenter = function () {
	return new Point(this.right(), this.center().y);
};

Rectangle.prototype.top = function () {
	return this.origin.y;
};

Rectangle.prototype.topCenter = function () {
	return new Point(this.center().x, this.top());
};

Rectangle.prototype.topLeft = function () {
	return this.origin;
};

Rectangle.prototype.topRight = function () {
	return new Point(this.corner.x, this.origin.y);
};

Rectangle.prototype.width = function () {
	return this.corner.x - this.origin.x;
};

Rectangle.prototype.position = function () {
	return this.origin;
};

// Rectangle comparison:

Rectangle.prototype.eq = function (aRect) {
	return this.origin.eq(aRect.origin) &&
		this.corner.eq(aRect.corner);
};

Rectangle.prototype.abs = function () {
	var newOrigin, newCorner;

	newOrigin = this.origin.abs();
	newCorner = this.corner.max(newOrigin);
	return newOrigin.corner(newCorner);
};

// Rectangle functions:

Rectangle.prototype.insetBy = function (delta) {
	// delta can be either a Point or a Number
	var result = new Rectangle();
	result.origin = this.origin.add(delta);
	result.corner = this.corner.subtract(delta);
	return result;
};

Rectangle.prototype.expandBy = function (delta) {
	// delta can be either a Point or a Number
	var result = new Rectangle();
	result.origin = this.origin.subtract(delta);
	result.corner = this.corner.add(delta);
	return result;
};

Rectangle.prototype.intersect = function (aRect) {
	var result = new Rectangle();
	result.origin = this.origin.max(aRect.origin);
	result.corner = this.corner.min(aRect.corner);
	return result;
};

Rectangle.prototype.merge = function (aRect) {
	var result = new Rectangle();
	result.origin = this.origin.min(aRect.origin);
	result.corner = this.corner.max(aRect.corner);
	return result;
};

Rectangle.prototype.round = function () {
	return this.origin.round().corner(this.corner.round());
};

Rectangle.prototype.spread = function () {
	// round me by applying floor() to my origin and ceil() to my corner
	return this.origin.floor().corner(this.corner.ceil());
};

Rectangle.prototype.amountToTranslateWithin = function (aRect) {
/*
    Answer a Point, delta, such that self + delta is forced within
    aRectangle. when all of me cannot be made to fit, prefer to keep
    my topLeft inside. Taken from Squeak.
*/
    var dx, dy;

    if (this.right() > aRect.right()) {
        dx = aRect.right() - this.right();
    }
    if (this.bottom() > aRect.bottom()) {
        dy = aRect.bottom() - this.bottom();
    }
    if ((this.left() + dx) < aRect.left()) {
        dx = aRect.left() - this.right();
    }
    if ((this.top() + dy) < aRect.top()) {
        dy = aRect.top() - this.top();
    }
    return new Point(dx, dy);
};

// Rectangle testing:

Rectangle.prototype.containsPoint = function (aPoint) {
	return this.origin.le(aPoint) && aPoint.lt(this.corner);
};

Rectangle.prototype.containsRectangle = function (aRect) {
	return aRect.origin.gt(this.origin) &&
		aRect.corner.lt(this.corner);
};

Rectangle.prototype.intersects = function (aRect) {
	var ro = aRect.origin, rc = aRect.corner;
	return (rc.x >= this.origin.x) &&
		(rc.y >= this.origin.y) &&
		(ro.x <= this.corner.x) &&
		(ro.y <= this.corner.y);
};

// Rectangle transforming:

Rectangle.prototype.scaleBy = function (scale) {
	// scale can be either a Point or a scalar
	var	o = this.origin.multiplyBy(scale),
		c = this.corner.multiplyBy(scale);
	return new Rectangle(o.x, o.y, c.x, c.y);
};

Rectangle.prototype.translateBy = function (factor) {
	// factor can be either a Point or a scalar
	var	o = this.origin.add(factor),
		c = this.corner.add(factor);
	return new Rectangle(o.x, o.y, c.x, c.y);
};

// Rectangle converting:

Rectangle.prototype.asArray = function () {
	return [this.left(), this.top(), this.right(), this.bottom()];
};

Rectangle.prototype.asArray_xywh = function () {
	return [this.left(), this.top(), this.width(), this.height()];
};

// Nodes ///////////////////////////////////////////////////////////////

// Node instance creation:

function Node(parent, childrenArray) {
	this.init(parent || null, childrenArray || []);
}

Node.prototype.init = function (parent, childrenArray) {
	this.parent = parent || null;
	this.children = childrenArray || [];
};

// Node string representation: e.g. 'a Node[3]'

Node.prototype.toString = function () {
	return 'a Node' + '[' + this.children.length.toString() + ']';
};

// Node accessing:

Node.prototype.addChild = function (aNode) {
	this.children.push(aNode);
	aNode.parent = this;
};

Node.prototype.addChildFirst = function (aNode) {
	this.children.splice(0, null, aNode);
	aNode.parent = this;
};

Node.prototype.removeChild = function (aNode) {
	var idx = this.children.indexOf(aNode);
	if (idx !== -1) {
		this.children.splice(idx, 1);
	}
};

// Node functions:

Node.prototype.root = function () {
	if (this.parent === null) {
		return this;
	}
    return this.parent.root();
};

Node.prototype.depth = function () {
	if (this.parent === null) {
		return 0;
	}
    return this.parent.depth() + 1;
};

Node.prototype.allChildren = function () {
	// includes myself
	var result = [this];
	this.children.forEach(function (child) {
		result = result.concat(child.allChildren());
	});
	return result;
};

Node.prototype.forAllChildren = function (aFunction) {
	if (this.children.length > 0) {
		this.children.forEach(function (child) {
			child.forAllChildren(aFunction);
		});
	}
	aFunction.call(null, this);
};

Node.prototype.allLeafs = function () {
	var result = [];
	this.allChildren().forEach(function (element) {
		if (element.children.length === 0) {
			result.push(element);
		}
	});
	return result;
};

Node.prototype.allParents = function () {
	// includes myself
	var result = [this];
	if (this.parent !== null) {
		result = result.concat(this.parent.allParents());
	}
	return result;
};

Node.prototype.siblings = function () {
	var myself = this;
	if (this.parent === null) {
		return [];
	}
    return this.parent.children.filter(function (child) {
        return child !== myself;
    });
};

Node.prototype.parentThatIsA = function (constructor) {
	// including myself
	if (this instanceof constructor) {
		return this;
	}
    if (!this.parent) {
		return null;
	}
    if (this.parent instanceof constructor) {
		return this.parent;
	}
    return this.parent.parentThatIsA(constructor);
};

Node.prototype.parentThatIsAnyOf = function (constructors) {
	// including myself
	var	yup = false,
		myself = this;
	constructors.forEach(function (each) {
		if (myself.constructor === each) {
			yup = true;
			return;
		}
	});
	if (yup) {
		return this;
	}
	if (!this.parent) {
		return null;
	}
    return this.parent.parentThatIsAnyOf(constructors);
};

// Morphs //////////////////////////////////////////////////////////////

// Morph: referenced constructors

var Morph;
var WorldMorph;
var HandMorph;
var ShadowMorph;
var FrameMorph;
var MenuMorph;
var HandleMorph;
var StringFieldMorph;
var ColorPickerMorph;
var SliderMorph;
var ScrollFrameMorph;
var InspectorMorph;

// Morph inherits from Node:

Morph.prototype = new Node();
Morph.prototype.constructor = Morph;
Morph.uber = Node.prototype;

// Morph settings:

/*
	damage list housekeeping

	the trackChanges property of the Morph prototype is a Boolean switch
	that determines whether the World's damage list ('broken' rectangles)
	tracks changes. By default the switch is always on. If set to false
	changes are not stored. This can be very useful for housekeeping of
	the damage list in situations where a large number of (sub-) morphs
	are changed more or less at once. Instead of keeping track of every
	single submorph's changes tremendous performance improvements can be
	achieved by setting the trackChanges flag to false before propagating
	the layout changes, setting it to true again and then storing the full
	bounds of the surrounding morph. An an example refer to the

		fixLayout()
		
	method of InspectorMorph, or the
	
		startLayout()
		endLayout()

	methods of SyntaxElementMorph in the Snap application.
*/

Morph.prototype.trackChanges = true;
Morph.prototype.shadowBlur = 4;

// Morph instance creation:

function Morph() {
	this.init();
}

// Morph initialization:

Morph.prototype.init = function () {
	Morph.uber.init.call(this);
	this.isMorph = true;
	this.bounds = new Rectangle(0, 0, 50, 40);
	this.color = new Color(80, 80, 80);
	this.texture = null; // optional url of a fill-image
	this.cachedTexture = null; // internal cache of actual bg image
	this.alpha = 1;
	this.isVisible = true;
	this.isDraggable = false;
	this.isTemplate = false;
	this.acceptsDrops = false;
	this.noticesTransparentClick = false;
	this.drawNew();
	this.fps = 0;
	this.customContextMenu = null;
	this.lastTime = Date.now();
};

// Morph string representation: e.g. 'a Morph 2 [20@45 | 130@250]'

Morph.prototype.toString = function () {
	return 'a ' +
		(this.constructor.name ||
			this.constructor.toString().split(' ')[1].split('(')[0]) +
		' ' +
		this.children.length.toString() + ' ' +
		this.bounds;
};

// Morph deleting:

Morph.prototype.destroy = function () {
	if (this.parent !== null) {
		this.fullChanged();
		this.parent.removeChild(this);
	}
};

// Morph stepping:

Morph.prototype.stepFrame = function () {
	if (!this.step) {
		return null;
	}
	var current, elapsed, leftover;
	current = Date.now();
	elapsed = current - this.lastTime;
	if (this.fps > 0) {
		leftover = (1000 / this.fps) - elapsed;
	} else {
		leftover = 0;
	}
	if (leftover < 1) {
		this.lastTime = current;
		this.step();
		this.children.forEach(function (child) {
			child.stepFrame();
		});
	}
};

Morph.prototype.step = function () {
	nop();
};

// Morph accessing - geometry getting:

Morph.prototype.left = function () {
	return this.bounds.left();
};

Morph.prototype.right = function () {
	return this.bounds.right();
};

Morph.prototype.top = function () {
	return this.bounds.top();
};

Morph.prototype.bottom = function () {
	return this.bounds.bottom();
};

Morph.prototype.center = function () {
	return this.bounds.center();
};

Morph.prototype.bottomCenter = function () {
	return this.bounds.bottomCenter();
};

Morph.prototype.bottomLeft = function () {
	return this.bounds.bottomLeft();
};

Morph.prototype.bottomRight = function () {
	return this.bounds.bottomRight();
};

Morph.prototype.boundingBox = function () {
	return this.bounds;
};

Morph.prototype.corners = function () {
	return this.bounds.corners();
};

Morph.prototype.leftCenter = function () {
	return this.bounds.leftCenter();
};

Morph.prototype.rightCenter = function () {
	return this.bounds.rightCenter();
};

Morph.prototype.topCenter = function () {
	return this.bounds.topCenter();
};

Morph.prototype.topLeft = function () {
	return this.bounds.topLeft();
};

Morph.prototype.topRight = function () {
	return this.bounds.topRight();
};
Morph.prototype.position = function () {
	return this.bounds.origin;
};

Morph.prototype.extent = function () {
	return this.bounds.extent();
};

Morph.prototype.width = function () {
	return this.bounds.width();
};

Morph.prototype.height = function () {
	return this.bounds.height();
};

Morph.prototype.fullBounds = function () {
	var result;
	result = this.bounds;
	this.children.forEach(function (child) {
		if (child.isVisible) {
			result = result.merge(child.fullBounds());
		}
	});
	return result;
};

Morph.prototype.fullBoundsNoShadow = function () {
	// answer my full bounds but ignore any shadow
	var result;
	result = this.bounds;
	this.children.forEach(function (child) {
		if (!(child instanceof ShadowMorph) && (child.isVisible)) {
			result = result.merge(child.fullBounds());
		}
	});
	return result;
};

Morph.prototype.visibleBounds = function () {
	// answer which part of me is not clipped by a Frame
	var	visible = this.bounds,
		frames = this.allParents().filter(function (p) {
			return p instanceof FrameMorph;
		});
	frames.forEach(function (f) {
		visible = visible.intersect(f.bounds);
	});
	return visible;
};

// Morph accessing - simple changes:

Morph.prototype.moveBy = function (delta) {
	this.changed();
	this.bounds = this.bounds.translateBy(delta);
	this.children.forEach(function (child) {
		child.moveBy(delta);
	});
	this.changed();
};

Morph.prototype.silentMoveBy = function (delta) {
	this.bounds = this.bounds.translateBy(delta);
	this.children.forEach(function (child) {
		child.silentMoveBy(delta);
	});
};

Morph.prototype.setPosition = function (aPoint) {
	var delta = aPoint.subtract(this.topLeft());
	if ((delta.x !== 0) || (delta.y !== 0)) {
		this.moveBy(delta);
	}
};

Morph.prototype.silentSetPosition = function (aPoint) {
	var delta = aPoint.subtract(this.topLeft());
	if ((delta.x !== 0) || (delta.y !== 0)) {
		this.silentMoveBy(delta);
	}
};

Morph.prototype.setLeft = function (x) {
	this.setPosition(
		new Point(
			x,
			this.top()
		)
	);
};

Morph.prototype.setRight = function (x) {
	this.setPosition(
		new Point(
			x - this.width(),
			this.top()
		)
	);
};

Morph.prototype.setTop = function (y) {
	this.setPosition(
		new Point(
			this.left(),
			y
		)
	);
};

Morph.prototype.setBottom = function (y) {
	this.setPosition(
		new Point(
			this.left(),
			y - this.height()
		)
	);
};

Morph.prototype.setCenter = function (aPoint) {
	this.setPosition(
		aPoint.subtract(
			this.extent().floorDivideBy(2)
		)
	);
};

Morph.prototype.setFullCenter = function (aPoint) {
	this.setPosition(
		aPoint.subtract(
			this.fullBounds().extent().floorDivideBy(2)
		)
	);
};

Morph.prototype.keepWithin = function (aMorph) {
	// make sure I am completely within another Morph's bounds
	var leftOff, rightOff, topOff, bottomOff;
	leftOff = this.fullBounds().left() - aMorph.left();
	if (leftOff < 0) {
		this.moveBy(new Point(-leftOff, 0));
	}
	rightOff = this.fullBounds().right() - aMorph.right();
	if (rightOff > 0) {
		this.moveBy(new Point(-rightOff, 0));
	}
	topOff = this.fullBounds().top() - aMorph.top();
	if (topOff < 0) {
		this.moveBy(new Point(0, -topOff));
	}
	bottomOff = this.fullBounds().bottom() - aMorph.bottom();
	if (bottomOff > 0) {
		this.moveBy(new Point(0, -bottomOff));
	}
};

// Morph accessing - dimensional changes requiring a complete redraw

Morph.prototype.setExtent = function (aPoint) {
	if (!aPoint.eq(this.extent())) {
		this.changed();
		this.silentSetExtent(aPoint);
		this.changed();
		this.drawNew();
	}
};

Morph.prototype.silentSetExtent = function (aPoint) {
	var ext, newWidth, newHeight;
	ext = aPoint.round();
	newWidth = Math.max(ext.x, 0);
	newHeight = Math.max(ext.y, 0);
	this.bounds.corner = new Point(
		this.bounds.origin.x + newWidth,
		this.bounds.origin.y + newHeight
	);
};

Morph.prototype.setWidth = function (width) {
	this.setExtent(new Point(width || 0, this.height()));
};

Morph.prototype.silentSetWidth = function (width) {
	// do not drawNew() just yet
	var w = Math.max(Math.round(width || 0), 0);
	this.bounds.corner = new Point(
		this.bounds.origin.x + (w),
		this.bounds.corner.y
	);
};

Morph.prototype.setHeight = function (height) {
	this.setExtent(new Point(this.width(), height || 0));
};

Morph.prototype.silentSetHeight = function (height) {
	// do not drawNew() just yet
	var h = Math.max(Math.round(height || 0), 0);
	this.bounds.corner = new Point(
		this.bounds.corner.x,
		this.bounds.origin.y + (h)
	);
};

Morph.prototype.setColor = function (aColor) {
	if (aColor) {
		if (!this.color.eq(aColor)) {
			this.color = aColor;
			this.changed();
			this.drawNew();
		}
	}
};

// Morph displaying:

Morph.prototype.drawNew = function () {
	// initialize my surface property
	this.image = newCanvas(this.extent());
	var context = this.image.getContext('2d');
	context.fillStyle = this.color.toString();
	context.fillRect(0, 0, this.width(), this.height());
	if (this.texture) {
		this.drawTexture(this.texture);
	}
};

Morph.prototype.drawTexture = function (url) {
    var myself = this;
    if (this.cachedTexture && this.texture === url) {
        this.drawCachedTexture();
    } else {
        this.cachedTexture = new Image();
        this.cachedTexture.src = this.texture = url; // make absolute
        this.cachedTexture.onload = function () {
            myself.drawCachedTexture();
        };
    }
};

Morph.prototype.drawCachedTexture = function () {
    var context = this.image.getContext('2d'),
        pattern = context.createPattern(this.cachedTexture, 'repeat');
	context.fillStyle = pattern;
    context.fillRect(0, 0, this.image.width, this.image.height);
    this.changed();
};

Morph.prototype.drawOn = function (aCanvas, aRect) {
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

	/* "for debugging purposes:"

		try {
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
		} catch (err) {
			alert('internal error\n\n' + err
				+ '\n ---'
				+ '\n canvas: ' + aCanvas
				+ '\n canvas.width: ' + aCanvas.width
				+ '\n canvas.height: ' + aCanvas.height
				+ '\n ---'
				+ '\n image: ' + this.image
				+ '\n image.width: ' + this.image.width
				+ '\n image.height: ' + this.image.height
				+ '\n ---'
				+ '\n w: ' + w
				+ '\n h: ' + h
				+ '\n sl: ' + sl
				+ '\n st: ' + st
				+ '\n area.left: ' + area.left()
				+ '\n area.top ' + area.top()
				);
		}
	*/

	}
};

Morph.prototype.fullDrawOn = function (aCanvas, aRect) {
	var rectangle;
	if (!this.isVisible) {
		return null;
	}
	rectangle = aRect || this.fullBounds();
	this.drawOn(aCanvas, rectangle);
	this.children.forEach(function (child) {
		child.fullDrawOn(aCanvas, rectangle);
	});
};

Morph.prototype.hide = function () {
	this.isVisible = false;
	this.changed();
	this.children.forEach(function (child) {
		child.hide();
	});
};

Morph.prototype.show = function () {
	this.isVisible = true;
	this.changed();
	this.children.forEach(function (child) {
		child.show();
	});
};

Morph.prototype.toggleVisibility = function () {
	this.isVisible = (!this.isVisible);
	this.changed();
	this.children.forEach(function (child) {
		child.toggleVisibility();
	});
};

// Morph full image:

Morph.prototype.fullImageClassic = function () {
	// why doesn't this work for all Morphs?
	var	fb = this.fullBounds(),
		img = newCanvas(fb.extent());
	this.fullDrawOn(img, fb);
	img.globalAlpha = this.alpha;
	return img;
};

Morph.prototype.fullImage = function () {
	var	img, ctx, fb;
	img = newCanvas(this.fullBounds().extent());
	ctx = img.getContext('2d');
	fb = this.fullBounds();
	this.allChildren().forEach(function (morph) {
		if (morph.isVisible) {
			ctx.globalAlpha = morph.alpha;
			ctx.drawImage(
				morph.image,
				morph.bounds.origin.x - fb.origin.x,
				morph.bounds.origin.y - fb.origin.y
			);
		}
	});
	return img;
};

// Morph shadow:

Morph.prototype.shadowImage = function (off, color) {
	// fallback for Windows Chrome-Shadow bug
	var	fb, img, outline, sha, ctx,
		offset = off || new Point(7, 7),
        clr = color || new Color(0, 0, 0);
	fb = this.fullBounds().extent();
	img = this.fullImage();
	outline = newCanvas(fb);
	ctx = outline.getContext('2d');
	ctx.drawImage(img, 0, 0);
	ctx.globalCompositeOperation = 'destination-out';
	ctx.drawImage(
		img,
		-offset.x,
		-offset.y
	);
	sha = newCanvas(fb);
	ctx = sha.getContext('2d');
	ctx.drawImage(outline, 0, 0);
	ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = clr.toString();
	ctx.fillRect(0, 0, fb.x, fb.y);
	return sha;
};

Morph.prototype.shadowImageBlurred = function (off, color) {
    var	fb, img, sha, ctx,
        offset = off || new Point(7, 7),
        blur = this.shadowBlur,
        clr = color || new Color(0, 0, 0);
    fb = this.fullBounds().extent().add(blur * 2);
    img = this.fullImage();
    sha = newCanvas(fb);
    ctx = sha.getContext('2d');
    ctx.shadowOffsetX = offset.x;
    ctx.shadowOffsetY = offset.y;
    ctx.shadowBlur = blur;
    ctx.shadowColor = clr.toString();
    ctx.drawImage(
        img,
        blur - offset.x,
        blur - offset.y
    );
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(
        img,
        blur - offset.x,
        blur - offset.y
    );
    return sha;
};

Morph.prototype.shadow = function (off, a, color) {
	var	shadow = new ShadowMorph(),
		offset = off || new Point(7, 7),
		alpha = a || ((a === 0) ? 0 : 0.2),
		fb = this.fullBounds();
	shadow.setExtent(fb.extent().add(this.shadowBlur * 2));
	if (useBlurredShadows) {
		shadow.image = this.shadowImageBlurred(offset, color);
		shadow.alpha = alpha;
		shadow.setPosition(fb.origin.add(offset).subtract(this.shadowBlur));
	} else {
		shadow.image = this.shadowImage(offset, color);
		shadow.alpha = alpha;
		shadow.setPosition(fb.origin.add(offset));
	}
	return shadow;
};

Morph.prototype.addShadow = function (off, a, color) {
	var	shadow,
		offset = off || new Point(7, 7),
		alpha = a || ((a === 0) ? 0 : 0.2);
	shadow = this.shadow(offset, alpha, color);
	this.addBack(shadow);
	this.fullChanged();
	return shadow;
};

Morph.prototype.getShadow = function () {
	var shadows;
	shadows = this.children.slice(0).reverse().filter(
		function (child) {
			return child instanceof ShadowMorph;
		}
	);
	if (shadows.length !== 0) {
		return shadows[0];
	}
    return null;
};

Morph.prototype.removeShadow = function () {
	var shadow = this.getShadow();
	if (shadow !== null) {
		this.fullChanged();
		this.removeChild(shadow);
	}
};

// Morph pen trails:

Morph.prototype.penTrails = function () {
	// answer my pen trails canvas. default is to answer my image
	return this.image;
};

// Morph updating:

Morph.prototype.changed = function () {
	if (this.trackChanges) {
		var w = this.root();
		if (w instanceof WorldMorph) {
			w.broken.push(this.visibleBounds().spread());
		}
	}
	if (this.parent) {
		this.parent.childChanged(this);
	}
};

Morph.prototype.fullChanged = function () {
	if (this.trackChanges) {
		var w = this.root();
		if (w instanceof WorldMorph) {
			w.broken.push(this.fullBounds().spread());
		}
	}
};

Morph.prototype.childChanged = function () {
	// react to a  change in one of my children,
	// default is to just pass this message on upwards
	// override this method for Morphs that need to adjust accordingly
	if (this.parent) {
		this.parent.childChanged(this);
	}
};

// Morph accessing - structure:

Morph.prototype.world = function () {
	var root = this.root();
	if (root instanceof WorldMorph) {
		return root;
	}
    return null;
};

Morph.prototype.add = function (aMorph) {
	var owner = aMorph.parent;
	if (owner !== null) {
		owner.removeChild(aMorph);
	}
	this.addChild(aMorph);
};

Morph.prototype.addBack = function (aMorph) {
	var owner = aMorph.parent;
	if (owner !== null) {
		owner.removeChild(aMorph);
	}
	this.addChildFirst(aMorph);
};

Morph.prototype.topMorphSuchThat = function (predicate) {
	var next;
	if (predicate.call(null, this)) {
		next = detect(
			this.children.slice(0).reverse(),
			predicate
		);
		if (next) {
			return next.topMorphSuchThat(predicate);
		}
        return this;
	}
    return null;
};

Morph.prototype.morphAt = function (aPoint) {
	var	morphs = this.allChildren().slice(0).reverse(),
		result = null;
	morphs.forEach(function (m) {
		if (m.fullBounds().containsPoint(aPoint) &&
				(result === null)) {
			result = m;
		}
	});
	return result;
};

/*
	alternative -  more elegant and possibly more
	performant - solution for morphAt.
	Has some issues, commented out for now

Morph.prototype.morphAt = function (aPoint) {
	return this.topMorphSuchThat(function (m) {
		return m.fullBounds().containsPoint(aPoint);
	});
};
*/

Morph.prototype.overlappedMorphs = function () {
	//exclude the World
	var	world = this.world(),
		fb = this.fullBounds(),
		myself = this,
		allParents = this.allParents(),
		allChildren = this.allChildren(),
		morphs;

	morphs = world.allChildren();
	return morphs.filter(function (m) {
		return m.isVisible &&
			m !== myself &&
			m !== world &&
			!contains(allParents, m) &&
			!contains(allChildren, m) &&
			m.fullBounds().intersects(fb);
	});
};

// Morph pixel access:

Morph.prototype.getPixelColor = function (aPoint) {
	var point, context, data;
	point = aPoint.subtract(this.bounds.origin);
	context = this.image.getContext('2d');
	data = context.getImageData(point.x, point.y, 1, 1);
	return new Color(
		data.data[0],
		data.data[1],
		data.data[2],
		data.data[3]
	);
};

Morph.prototype.isTransparentAt = function (aPoint) {
	var point, context, data;
	if (this.bounds.containsPoint(aPoint)) {
		if (this.texture) {
			return false;
		}
		point = aPoint.subtract(this.bounds.origin);
		context = this.image.getContext('2d');
        data = context.getImageData(
            Math.floor(point.x),
            Math.floor(point.y),
            1,
            1
        );
        return data.data[3] === 0;
	}
    return false;
};

// Morph duplicating:

Morph.prototype.copy = function () {
	var c = copy(this);
	c.parent = null;
	c.children = [];
	c.bounds = this.bounds.copy();
	return c;
};

Morph.prototype.fullCopy = function () {
	/*
	Produce a copy of me with my entire tree of submorphs. Morphs
	mentioned more than once are all directed to a single new copy.
	Other properties are also *shallow* copied, so you must override
	to deep copy Arrays and (complex) Objects
	*/
	var dict = {}, c;
	c = this.copyRecordingReferences(dict);
	c.forAllChildren(function (m) {
		m.updateReferences(dict);
	});
	return c;
};

Morph.prototype.copyRecordingReferences = function (dict) {
	/*
	Recursively copy this entire composite morph, recording the
	correspondence between old and new morphs in the given dictionary.
	This dictionary will be used to update intra-composite references
	in the copy. See updateReferences().
	Note: This default implementation copies ONLY morphs in the
	submorph hierarchy. If a morph stores morphs in other properties
	that it wants to copy, then it should override this method to do so.
	The same goes for morphs that contain other complex data that
	should be copied when the morph is duplicated.
	*/
	var	c = this.copy();
	dict[this] = c;
	this.children.forEach(function (m) {
		c.add(m.copyRecordingReferences(dict));
	});
	return c;
};

Morph.prototype.updateReferences = function (dict) {
	/*
	Update intra-morph references within a composite morph that has
	been copied. For example, if a button refers to morph X in the
	orginal composite then the copy of that button in the new composite
	should refer to the copy of X in new composite, not the original X.
	*/
	var property;
	for (property in this) {
		if (property.isMorph && dict[property]) {
			this[property] = dict[property];
		}
	}
};

// Morph dragging and dropping:

Morph.prototype.rootForGrab = function () {
	if (this instanceof ShadowMorph) {
		return this.parent.rootForGrab();
	}
    if (this.parent instanceof ScrollFrameMorph) {
		return this.parent;
	}
    if (this.parent === null ||
			this.parent instanceof WorldMorph ||
			this.parent instanceof FrameMorph ||
			this.isDraggable === true) {
		return this;
	}
    return this.parent.rootForGrab();
};

Morph.prototype.wantsDropOf = function (aMorph) {
	// default is to answer the general flag - change for my heirs
	if ((aMorph instanceof HandleMorph)
			|| (aMorph instanceof MenuMorph)
			|| (aMorph instanceof InspectorMorph)) {
		return false;
	}
	return this.acceptsDrops;
};

Morph.prototype.pickUp = function (wrrld) {
	var world = wrrld || this.world();
	this.setPosition(
		world.hand.position().subtract(
			this.extent().floorDivideBy(2)
		)
	);
	world.hand.grab(this);
};

Morph.prototype.isPickedUp = function () {
	return this.parentThatIsA(HandMorph) !== null;
};

// Morph utilities:

Morph.prototype.nop = function () {
	nop();
};

Morph.prototype.resize = function () {
	this.world().activeHandle = new HandleMorph(this);
};

Morph.prototype.move = function () {
	this.world().activeHandle = new HandleMorph(
		this,
		null,
		null,
		null,
		null,
		'move'
	);
};

Morph.prototype.hint = function (msg) {
	var m, text;
	text = msg;
	if (msg) {
		if (msg.toString) {
			text = msg.toString();
		}
	} else {
		text = 'NULL';
	}
	m = new MenuMorph(this, text);
	m.isDraggable = true;
	m.popUpCenteredAtHand(this.world());
};

Morph.prototype.inform = function (msg) {
	var m, text;
	text = msg;
	if (msg) {
		if (msg.toString) {
			text = msg.toString();
		}
	} else {
		text = 'NULL';
	}
	m = new MenuMorph(this, text);
	m.addItem("Ok");
	m.isDraggable = true;
	m.popUpCenteredAtHand(this.world());
};

Morph.prototype.prompt = function (
	msg,
	callback,
	environment,
	defaultContents,
	width,
	floorNum,
	ceilingNum,
	isRounded
) {
	var	menu, entryField, slider, isNumeric;
	if (ceilingNum) {
		isNumeric = true;
	}
	menu = new MenuMorph(
		callback || null,
		msg || '',
		environment || null
	);
	entryField = new StringFieldMorph(
		defaultContents || '',
		width || 100,
		MorphicPreferences.prompterFontSize,
		MorphicPreferences.prompterFontName,
		false,
		false,
		isNumeric
	);
	menu.items.push(entryField);
	if (ceilingNum || MorphicPreferences.useVirtualKeyboard) {
		slider = new SliderMorph(
			floorNum || 0,
			ceilingNum,
			parseFloat(defaultContents),
			Math.floor((ceilingNum - floorNum) / 4),
			'horizontal'
		);
		slider.alpha = 1;
		slider.color = new Color(225, 225, 225);
		slider.button.color = menu.borderColor;
		slider.button.highlightColor = slider.button.color.copy();
		slider.button.highlightColor.b += 100;
		slider.button.pressColor = slider.button.color.copy();
		slider.button.pressColor.b += 150;
		slider.setHeight(MorphicPreferences.prompterSliderSize);
		if (isRounded) {
			slider.action = function (num) {
				entryField.changed();
				entryField.text.text = Math.round(num).toString();
				entryField.text.drawNew();
				entryField.text.changed();
				entryField.text.edit();
			};
		} else {
			slider.action = function (num) {
				entryField.changed();
				entryField.text.text = num.toString();
				entryField.text.drawNew();
				entryField.text.changed();
			};
		}
		menu.items.push(slider);
	}

	menu.addLine(2);
	menu.addItem('Ok', function () {
		return entryField.string();
	});
	menu.addItem('Cancel', function () {
		return null;
	});
	menu.isDraggable = true;
	menu.popUpAtHand(this.world());
	entryField.text.edit();
};

Morph.prototype.pickColor = function (
	msg,
	callback,
	environment,
	defaultContents
) {
	var menu, colorPicker;
	menu = new MenuMorph(
		callback || null,
		msg || '',
		environment || null
	);
	colorPicker = new ColorPickerMorph(defaultContents);
	menu.items.push(colorPicker);
	menu.addLine(2);
	menu.addItem('Ok', function () {
		return colorPicker.getChoice();
	});
	menu.addItem('Cancel', function () {
		return null;
	});
	menu.isDraggable = true;
	menu.popUpAtHand(this.world());
};

Morph.prototype.inspect = function (anotherObject) {
	var	world = this.world(),
		inspector,
		inspectee = this;

	if (anotherObject) {
		inspectee = anotherObject;
	}
	inspector = new InspectorMorph(inspectee);
	inspector.setPosition(world.hand.position());
	inspector.keepWithin(world);
	world.add(inspector);
	inspector.changed();
};

// Morph menus:

Morph.prototype.contextMenu = function () {
	var world;

	if (this.customContextMenu) {
		return this.customContextMenu;
	}
    world = this.world();
    if (world && world.isDevMode) {
        if (this.parent === world) {
            return this.developersMenu();
        }
        return this.hierarchyMenu();
    }
    return this.userMenu()
        || (this.parent && this.parent.userMenu());
};

Morph.prototype.hierarchyMenu = function () {
	var	parents = this.allParents(),
		world = this.world(),
		menu = new MenuMorph(this, null);

	parents.forEach(function (each) {
		if (each.developersMenu && (each !== world)) {
			menu.addItem(each.toString().slice(0, 50), function () {
				each.developersMenu().popUpAtHand(world);
			});
		}
	});
	return menu;
};

Morph.prototype.developersMenu = function () {
	// 'name' is not an official property of a function, hence:
	var world = this.world(),
        userMenu = this.userMenu()
            || (this.parent && this.parent.userMenu()),
		menu = new MenuMorph(this, this.constructor.name ||
			this.constructor.toString().split(' ')[1].split('(')[0]);
    if (userMenu) {
        menu.addItem(
            'user features...',
            function () {
                userMenu.popUpAtHand(world);
            }
        );
        menu.addLine();
    }
	menu.addItem(
		"color...",
		function () {
			this.pickColor(
				menu.title + '\ncolor:',
				this.setColor,
				this,
				this.color
			);
		},
		'choose another color \nfor this morph'
	);
	menu.addItem(
		"transparency...",
		function () {
			this.prompt(
				menu.title + '\nalpha\nvalue:',
				this.setAlphaScaled,
				this,
				(this.alpha * 100).toString(),
				null,
				1,
				100,
				true
			);
		},
		'set this morph\'s\nalpha value'
	);
	menu.addItem(
		"resize...",
		'resize',
		'show a handle\nwhich can be dragged\nto change this morph\'s' +
			' extent'
	);
	menu.addLine();
	menu.addItem(
		"duplicate",
		function () {
			this.fullCopy().pickUp(this.world());
		},
		'make a copy\nand pick it up'
	);
	menu.addItem(
		"pick up",
		'pickUp',
		'disattach and put \ninto the hand'
	);
	menu.addItem(
		"attach...",
		'attach',
		'stick this morph\nto another one'
	);
	menu.addItem(
		"move...",
		'move',
		'show a handle\nwhich can be dragged\nto move this morph'
	);
	menu.addItem(
		"inspect...",
		'inspect',
		'open a window\non all properties'
	);
	menu.addLine();
	if (this.isDraggable) {
		menu.addItem(
			"lock",
			'toggleIsDraggable',
			'make this morph\nunmovable'
		);
	} else {
		menu.addItem(
			"unlock",
			'toggleIsDraggable',
			'make this morph\nmovable'
		);
	}
	menu.addItem("hide", 'hide');
	menu.addItem("delete", 'destroy');
	if (!(this instanceof WorldMorph)) {
		menu.addLine();
		menu.addItem(
			"World...",
			function () {
				world.contextMenu().popUpAtHand(world);
			},
			'show the\nWorld\'s menu'
		);
	}
	return menu;
};

Morph.prototype.userMenu = function () {
    return null;
};

// Morph menu actions

Morph.prototype.setAlphaScaled = function (alpha) {
	// for context menu demo purposes
	var newAlpha, unscaled;
	if (typeof alpha === 'number') {
		unscaled = alpha / 100;
		this.alpha = Math.min(Math.max(unscaled, 0.1), 1);
	} else {
		newAlpha = parseFloat(alpha);
		if (!isNaN(newAlpha)) {
			unscaled = newAlpha / 100;
			this.alpha = Math.min(Math.max(unscaled, 0.1), 1);
		}
	}
	this.changed();
};

Morph.prototype.attach = function () {
	var	choices = this.overlappedMorphs(),
		menu = new MenuMorph(this, 'choose new parent:'),
		myself = this;

	choices.forEach(function (each) {
		menu.addItem(each.toString().slice(0, 50), function () {
			each.add(myself);
			myself.isDraggable = false;
		});
	});
	if (choices.length > 0) {
		menu.popUpAtHand(this.world());
	}
};

Morph.prototype.toggleIsDraggable = function () {
	// for context menu demo purposes
	this.isDraggable = !this.isDraggable;
};

Morph.prototype.colorSetters = function () {
	// for context menu demo purposes
	return ['color'];
};

Morph.prototype.numericalSetters = function () {
	// for context menu demo purposes
	return [
		'setLeft',
		'setTop',
		'setWidth',
		'setHeight',
		'setAlphaScaled'
	];
};

// Morph entry field tabbing:

Morph.prototype.allEntryFields = function () {
	return this.allChildren().filter(function (each) {
		return each.isEditable;
	});
};

Morph.prototype.nextEntryField = function (current) {
	var	fields = this.allEntryFields(),
		idx = fields.indexOf(current);
	if (idx !== -1) {
		if (fields.length > (idx - 1)) {
			return fields[idx + 1];
		}
        return fields[0];
	}
};

Morph.prototype.previousEntryField = function (current) {
	var	fields = this.allEntryFields(),
		idx = fields.indexOf(current);
	if (idx !== -1) {
		if ((idx - 1) > fields.length) {
			return fields[idx - 1];
		}
        return fields[fields.length + 1];
	}
};

Morph.prototype.tab = function (editField) {
/*
	the <tab> key was pressed in one of my edit fields.
	invoke my "nextTab()" function if it exists, else
	propagate it up my owner chain.
*/
	if (this.nextTab) {
		this.nextTab(editField);
	} else if (this.parent) {
		this.parent.tab(editField);
	}
};

Morph.prototype.backTab = function (editField) {
/*
	the <back tab> key was pressed in one of my edit fields.
	invoke my "previousTab()" function if it exists, else
	propagate it up my owner chain.
*/
	if (this.previousTab) {
		this.previousTab(editField);
	} else if (this.parent) {
		this.parent.backTab(editField);
	}
};

/*
	the following are examples of what the navigation methods should
	look like. Insert these at the World level for fallback, and at lower
	levels in the Morphic tree (e.g. dialog boxes) for a more fine-grained
	control over the tabbing cycle.

Morph.prototype.nextTab = function (editField) {
	var	next = this.nextEntryField(editField);
	editField.clearSelection();
	next.selectAll();
	next.edit();
};

Morph.prototype.previousTab = function (editField) {
	var	prev = this.previousEntryField(editField);
	editField.clearSelection();
	prev.selectAll();
	prev.edit();
};

*/

// Morph events:

Morph.prototype.escalateEvent = function (functionName, arg) {
	var handler = this.parent;
	while (!handler[functionName] && handler.parent !== null) {
		handler = handler.parent;
	}
	if (handler[functionName]) {
		handler[functionName].call(handler, arg);
	}
};

// Morph eval:

Morph.prototype.evaluateString = function (code) {
	var result;

	try {
		result = eval(code);
		this.drawNew();
		this.changed();
	} catch (err) {
		this.inform(err);
	}
	return result;
};

// Morph collision detection:

Morph.prototype.isTouching = function (otherMorph) {
	var	oImg = this.overlappingImage(otherMorph),
		data = oImg.getContext('2d')
			.getImageData(1, 1, oImg.width, oImg.height)
			.data;
	return detect(
		data,
		function (each) {
			return each !== 0;
		}
	) !== null;
};

Morph.prototype.overlappingImage = function (otherMorph) {
	var	fb = this.fullBounds(),
		otherFb = otherMorph.fullBounds(),
		oRect = fb.intersect(otherFb),
		oImg = newCanvas(oRect.extent()),
		ctx = oImg.getContext('2d');
    if (oRect.width() < 1 || oRect.height() < 1) {
        return newCanvas(new Point(1, 1));
    }
	ctx.drawImage(
		this.fullImage(),
		oRect.origin.x - fb.origin.x,
		oRect.origin.y - fb.origin.y
	);
	ctx.globalCompositeOperation = 'source-in';
	ctx.drawImage(
		otherMorph.fullImage(),
		otherFb.origin.x - oRect.origin.x,
		otherFb.origin.y - oRect.origin.y
	);
	return oImg;
};

// ShadowMorph /////////////////////////////////////////////////////////

// ShadowMorph inherits from Morph:

ShadowMorph.prototype = new Morph();
ShadowMorph.prototype.constructor = ShadowMorph;
ShadowMorph.uber = Morph.prototype;

// ShadowMorph instance creation:

function ShadowMorph() {
	this.init();
}

// HandleMorph ////////////////////////////////////////////////////////

// I am a resize / move handle that can be attached to any Morph

// HandleMorph inherits from Morph:

HandleMorph.prototype = new Morph();
HandleMorph.prototype.constructor = HandleMorph;
HandleMorph.uber = Morph.prototype;

// HandleMorph instance creation:

function HandleMorph(target, minX, minY, insetX, insetY, type) {
	// if insetY is missing, it will be the same as insetX
	this.init(target, minX, minY, insetX, insetY, type);
}

HandleMorph.prototype.init = function (
	target,
	minX,
	minY,
	insetX,
	insetY,
	type
) {
	var size = MorphicPreferences.handleSize;
	this.target = target || null;
	this.minExtent = new Point(minX || 0, minY || 0);
	this.inset = new Point(insetX || 0, insetY || insetX || 0);
	this.type =  type || 'resize'; // can also be 'move'
	HandleMorph.uber.init.call(this);
	this.color = new Color(255, 255, 255);
	this.isDraggable = false;
	this.noticesTransparentClick = true;
	this.setExtent(new Point(size, size));
};

// HandleMorph drawing:

HandleMorph.prototype.drawNew = function () {
	this.normalImage = newCanvas(this.extent());
	this.highlightImage = newCanvas(this.extent());
	this.drawOnCanvas(
		this.normalImage,
		this.color,
		new Color(100, 100, 100)
	);
	this.drawOnCanvas(
		this.highlightImage,
		new Color(100, 100, 255),
		new Color(255, 255, 255)
	);
	this.image = this.normalImage;
	if (this.target) {
		this.setPosition(
			this.target.bottomRight().subtract(
				this.extent().add(this.inset)
			)
		);
		this.target.add(this);
		this.target.changed();
	}
};

HandleMorph.prototype.drawOnCanvas = function (
	aCanvas,
	color,
	shadowColor
) {
	var	context = aCanvas.getContext('2d'),
		p1,
		p11,
		p2,
		p22,
		i;

	context.lineWidth = 1;
	context.lineCap = 'round';

	context.strokeStyle = color.toString();

	if (this.type === 'move') {

		p1 = this.bottomLeft().subtract(this.position());
		p11 = p1.copy();
		p2 = this.topRight().subtract(this.position());
		p22 = p2.copy();

		for (i = 0; i <= this.height(); i = i + 6) {
			p11.y = p1.y - i;
			p22.y = p2.y - i;

			context.beginPath();
			context.moveTo(p11.x, p11.y);
			context.lineTo(p22.x, p22.y);
			context.closePath();
			context.stroke();
		}
	}

	p1 = this.bottomLeft().subtract(this.position());
	p11 = p1.copy();
	p2 = this.topRight().subtract(this.position());
	p22 = p2.copy();

	for (i = 0; i <= this.width(); i = i + 6) {
		p11.x = p1.x + i;
		p22.x = p2.x + i;

		context.beginPath();
		context.moveTo(p11.x, p11.y);
		context.lineTo(p22.x, p22.y);
		context.closePath();
		context.stroke();
	}

	context.strokeStyle = shadowColor.toString();

	if (this.type === 'move') {

		p1 = this.bottomLeft().subtract(this.position());
		p11 = p1.copy();
		p2 = this.topRight().subtract(this.position());
		p22 = p2.copy();

		for (i = -2; i <= this.height(); i = i + 6) {
			p11.y = p1.y - i;
			p22.y = p2.y - i;

			context.beginPath();
			context.moveTo(p11.x, p11.y);
			context.lineTo(p22.x, p22.y);
			context.closePath();
			context.stroke();
		}
	}

	p1 = this.bottomLeft().subtract(this.position());
	p11 = p1.copy();
	p2 = this.topRight().subtract(this.position());
	p22 = p2.copy();

	for (i = 2; i <= this.width(); i = i + 6) {
		p11.x = p1.x + i;
		p22.x = p2.x + i;

		context.beginPath();
		context.moveTo(p11.x, p11.y);
		context.lineTo(p22.x, p22.y);
		context.closePath();
		context.stroke();
	}
};

// HandleMorph stepping:

HandleMorph.prototype.step = null;

HandleMorph.prototype.mouseDownLeft = function (pos) {
	var	world = this.root(),
		offset = pos.subtract(this.bounds.origin),
		myself = this;

	if (!this.target) {
		return null;
	}
	this.step = function () {
		var newPos, newExt;
		if (world.hand.mouseButton) {
			newPos = world.hand.bounds.origin.copy().subtract(offset);
			if (this.type === 'resize') {
				newExt = newPos.add(
					myself.extent().add(myself.inset)
				).subtract(myself.target.bounds.origin);
				newExt = newExt.max(myself.minExtent);
				myself.target.setExtent(newExt);

				myself.setPosition(
					myself.target.bottomRight().subtract(
						myself.extent().add(myself.inset)
					)
				);
			} else { // type === 'move'
				myself.target.setPosition(
					newPos.subtract(this.target.extent())
						.add(this.extent())
				);
			}
		} else {
			this.step = null;
		}
	};
	if (!this.target.step) {
		this.target.step = function () {
			nop();
		};
	}
};

// HandleMorph dragging and dropping:

HandleMorph.prototype.rootForGrab = function () {
	return this;
};

// HandleMorph events:

HandleMorph.prototype.mouseEnter = function () {
	this.image = this.highlightImage;
	this.changed();
};

HandleMorph.prototype.mouseLeave = function () {
	this.image = this.normalImage;
	this.changed();
};

// HandleMorph duplicating:

HandleMorph.prototype.copyRecordingReferences = function (dict) {
	// inherited, see comment in Morph
	var	c = HandleMorph.uber.copyRecordingReferences.call(
		this,
		dict
	);
	if (c.target && dict[this.target]) {
		c.target = (dict[this.target]);
	}
	return c;
};

// HandleMorph menu:

HandleMorph.prototype.attach = function () {
	var	choices = this.overlappedMorphs(),
		menu = new MenuMorph(this, 'choose target:'),
		myself = this;

	choices.forEach(function (each) {
		menu.addItem(each.toString().slice(0, 50), function () {
			myself.isDraggable = false;
			myself.target = each;
			myself.drawNew();
			myself.noticesTransparentClick = true;
		});
	});
	if (choices.length > 0) {
		menu.popUpAtHand(this.world());
	}
};

// PenMorph ////////////////////////////////////////////////////////////

// I am a simple LOGO-wise turtle.

// PenMorph: referenced constructors

var PenMorph;

// PenMorph inherits from Morph:

PenMorph.prototype = new Morph();
PenMorph.prototype.constructor = PenMorph;
PenMorph.uber = Morph.prototype;

// PenMorph instance creation:

function PenMorph() {
	this.init();
}

PenMorph.prototype.init = function () {
	var size = MorphicPreferences.handleSize * 4;

	// additional properties:
	this.isWarped = false; // internal optimization
	this.wantsRedraw = false; // internal optimization
	this.heading = 0;
	this.isDown = true;
	this.size = 1;

	HandleMorph.uber.init.call(this);
	this.setExtent(new Point(size, size));
};

// PenMorph updating - optimized for warping, i.e atomic recursion

PenMorph.prototype.changed = function () {
	if (this.isWarped === false) {
		var w = this.root();
		if (w instanceof WorldMorph) {
			w.broken.push(this.visibleBounds().spread());
		}
		if (this.parent) {
			this.parent.childChanged(this);
		}
	}
};

// PenMorph display:

PenMorph.prototype.drawNew = function () {
	var context, start, dest, left, right, len;
	if (this.isWarped) {
		this.wantsRedraw = true;
		return null;
	}
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	len = this.width() / 2;
	start = this.center().subtract(this.bounds.origin);
	dest = start.distanceAngle(len * 0.75, this.heading - 180);
	left = start.distanceAngle(len, this.heading + 195);
	right = start.distanceAngle(len, this.heading - 195);
	context.fillStyle = this.color.toString();
	context.beginPath();
	context.moveTo(start.x, start.y);
	context.lineTo(left.x, left.y);
	context.lineTo(dest.x, dest.y);
	context.lineTo(right.x, right.y);
	context.closePath();
	context.strokeStyle = 'white';
	context.lineWidth = 3;
	context.stroke();
	context.strokeStyle = 'black';
	context.lineWidth = 1;
	context.stroke();
	context.fill();
	this.wantsRedraw = false;
};

// PenMorph access:

PenMorph.prototype.setHeading = function (degrees) {
	this.heading = parseFloat(degrees) % 360;
	if (this.isWarped === false) {
		this.drawNew();
		this.changed();
	}
};

// PenMorph drawing:

PenMorph.prototype.drawLine = function (start, dest) {
	var	context = this.parent.penTrails().getContext('2d'),
		from = start.subtract(this.parent.bounds.origin),
		to = dest.subtract(this.parent.bounds.origin);
	if (this.isDown) {
		context.lineWidth = this.size;
		context.strokeStyle = this.color.toString();
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.beginPath();
		context.moveTo(from.x, from.y);
		context.lineTo(to.x, to.y);
		context.stroke();
		if (this.isWarped === false) {
			this.world().broken.push(
				start.rectangle(dest).expandBy(
					Math.max(this.size / 2, 1)
				).intersect(this.parent.visibleBounds()).spread()
			);
		}
	}
};

// PenMorph turtle ops:

PenMorph.prototype.turn = function (degrees) {
	this.setHeading(this.heading + parseFloat(degrees));
};

PenMorph.prototype.forward = function (steps) {
	var	start = this.center(),
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
	this.drawLine(start, this.center());
};

PenMorph.prototype.down = function () {
	this.isDown = true;
};

PenMorph.prototype.up = function () {
	this.isDown = false;
};

PenMorph.prototype.clear = function () {
	this.parent.drawNew();
	this.parent.changed();
};

// PenMorph optimization for atomic recursion:

PenMorph.prototype.startWarp = function () {
	this.isWarped = true;
};

PenMorph.prototype.endWarp = function () {
	if (this.wantsRedraw) {
		this.drawNew();
	}
	this.changed();
	this.parent.changed();
	this.isWarped = false;
};

PenMorph.prototype.warp = function (fun) {
	this.startWarp();
	fun.call(this);
	this.endWarp();
};

PenMorph.prototype.warpOp = function (selector, argsArray) {
	this.startWarp();
	this[selector].apply(this, argsArray);
	this.endWarp();
};

// PenMorph demo ops:
// try these with WARP eg.: this.warp(function () {tree(12, 120, 20)})

PenMorph.prototype.warpSierpinski = function (length, min) {
	this.warpOp('sierpinski', [length, min]);
};

PenMorph.prototype.sierpinski = function (length, min) {
	var i;
	if (length > min) {
		for (i = 0; i < 3; i += 1) {
			this.sierpinski(length * 0.5, min);
			this.turn(120);
			this.forward(length);
		}
	}
};

PenMorph.prototype.warpTree = function (level, length, angle) {
	this.warpOp('tree', [level, length, angle]);
};

PenMorph.prototype.tree = function (level, length, angle) {
	if (level > 0) {
		this.size = level;
		this.forward(length);
		this.turn(angle);
		this.tree(level - 1, length * 0.75, angle);
		this.turn(angle * -2);
		this.tree(level - 1, length * 0.75, angle);
		this.turn(angle);
		this.forward(-length);
	}
};

// ColorPaletteMorph ///////////////////////////////////////////////////

var ColorPaletteMorph;

// ColorPaletteMorph inherits from Morph:

ColorPaletteMorph.prototype = new Morph();
ColorPaletteMorph.prototype.constructor = ColorPaletteMorph;
ColorPaletteMorph.uber = Morph.prototype;

// ColorPaletteMorph instance creation:

function ColorPaletteMorph(target, sizePoint) {
	this.init(
		target || null,
		sizePoint || new Point(80, 50)
	);
}

ColorPaletteMorph.prototype.init = function (target, size) {
	ColorPaletteMorph.uber.init.call(this);
	this.target = target;
	this.targetSetter = 'color';
	this.silentSetExtent(size);
	this.choice = null;
	this.drawNew();
};

ColorPaletteMorph.prototype.drawNew = function () {
	var	context, ext, x, y, h, l;

	ext = this.extent();
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	this.choice = new Color();
	for (x = 0; x <= ext.x; x += 1) {
		h = 360 * x / ext.x;
		for (y = 0; y <= ext.y; y += 1) {
			l = 100 - (y / ext.y * 100);
			context.fillStyle = 'hsl(' + h + ',100%,' + l + '%)';
			context.fillRect(x, y, 1, 1);
		}
	}
};

ColorPaletteMorph.prototype.mouseMove = function (pos) {
	this.choice = this.getPixelColor(pos);
	this.updateTarget();
};

ColorPaletteMorph.prototype.mouseDownLeft = function (pos) {
	this.choice = this.getPixelColor(pos);
	this.updateTarget();
};

ColorPaletteMorph.prototype.updateTarget = function () {
	if (this.target instanceof Morph && this.choice !== null) {
		if (this.target[this.targetSetter] instanceof Function) {
			this.target[this.targetSetter].call(
				this.target,
				this.choice
			);
		} else {
			this.target[this.targetSetter] = this.choice;
			this.target.drawNew();
			this.target.changed();
		}
	}
};

// ColorPaletteMorph duplicating:

ColorPaletteMorph.prototype.copyRecordingReferences = function (dict) {
	// inherited, see comment in Morph
	var	c = ColorPaletteMorph.uber.copyRecordingReferences.call(
		this,
		dict
	);
	if (c.target && dict[this.target]) {
		c.target = (dict[this.target]);
	}
	return c;
};

// ColorPaletteMorph menu:

ColorPaletteMorph.prototype.developersMenu = function () {
	var menu = ColorPaletteMorph.uber.developersMenu.call(this);
	menu.addLine();
	menu.addItem(
		'set target',
		"setTarget",
		'choose another morph\nwhose color property\n will be' +
			' controlled by this one'
	);
	return menu;
};

ColorPaletteMorph.prototype.setTarget = function () {
	var	choices = this.overlappedMorphs(),
		menu = new MenuMorph(this, 'choose target:'),
		myself = this;

	choices.push(this.world());
	choices.forEach(function (each) {
		menu.addItem(each.toString().slice(0, 50), function () {
			myself.target = each;
			myself.setTargetSetter();
		});
	});
	if (choices.length === 1) {
		this.target = choices[0];
		this.setTargetSetter();
	} else if (choices.length > 0) {
		menu.popUpAtHand(this.world());
	}
};

ColorPaletteMorph.prototype.setTargetSetter = function () {
	var	choices = this.target.colorSetters(),
		menu = new MenuMorph(this, 'choose target property:'),
		myself = this;

	choices.forEach(function (each) {
		menu.addItem(each, function () {
			myself.targetSetter = each;
		});
	});
	if (choices.length === 1) {
		this.targetSetter = choices[0];
	} else if (choices.length > 0) {
		menu.popUpAtHand(this.world());
	}
};

// GrayPaletteMorph ///////////////////////////////////////////////////

var GrayPaletteMorph;

// GrayPaletteMorph inherits from ColorPaletteMorph:

GrayPaletteMorph.prototype = new ColorPaletteMorph();
GrayPaletteMorph.prototype.constructor = GrayPaletteMorph;
GrayPaletteMorph.uber = ColorPaletteMorph.prototype;

// GrayPaletteMorph instance creation:

function GrayPaletteMorph(target, sizePoint) {
	this.init(
		target || null,
		sizePoint || new Point(80, 10)
	);
}

GrayPaletteMorph.prototype.drawNew = function () {
	var	context, ext, gradient;

	ext = this.extent();
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	this.choice = new Color();
	gradient = context.createLinearGradient(0, 0, ext.x, ext.y);
	gradient.addColorStop(0, 'black');
	gradient.addColorStop(1, 'white');
	context.fillStyle = gradient;
	context.fillRect(0, 0, ext.x, ext.y);
};

// ColorPickerMorph ///////////////////////////////////////////////////

// ColorPickerMorph inherits from Morph:

ColorPickerMorph.prototype = new Morph();
ColorPickerMorph.prototype.constructor = ColorPickerMorph;
ColorPickerMorph.uber = Morph.prototype;

// ColorPickerMorph instance creation:

function ColorPickerMorph(defaultColor) {
	this.init(defaultColor || new Color(255, 255, 255));
}

ColorPickerMorph.prototype.init = function (defaultColor) {
	this.choice = defaultColor;
	ColorPickerMorph.uber.init.call(this);
	this.color = new Color(255, 255, 255);
	this.silentSetExtent(new Point(80, 80));
	this.drawNew();
};

ColorPickerMorph.prototype.drawNew = function () {
	ColorPickerMorph.uber.drawNew.call(this);
	this.buildSubmorphs();
};

ColorPickerMorph.prototype.buildSubmorphs = function () {
	var cpal, gpal, x, y;

	this.children.forEach(function (child) {
		child.destroy();
	});
	this.children = [];
	this.feedback = new Morph();
	this.feedback.color = this.choice;
	this.feedback.setExtent(new Point(20, 20));
	cpal = new ColorPaletteMorph(
		this.feedback,
		new Point(this.width(), 50)
	);
	gpal = new GrayPaletteMorph(
		this.feedback,
		new Point(this.width(), 5)
	);
	cpal.setPosition(this.bounds.origin);
	this.add(cpal);
	gpal.setPosition(cpal.bottomLeft());
	this.add(gpal);
	x = (gpal.left() +
		Math.floor((gpal.width() - this.feedback.width()) / 2));
	y = gpal.bottom() + Math.floor((this.bottom() -
		gpal.bottom() - this.feedback.height()) / 2);
	this.feedback.setPosition(new Point(x, y));
	this.add(this.feedback);
};

ColorPickerMorph.prototype.getChoice = function () {
	return this.feedback.color;
};

ColorPickerMorph.prototype.rootForGrab = function () {
	return this;
};

// BlinkerMorph ////////////////////////////////////////////////////////

// can be used for text cursors

var BlinkerMorph;

// BlinkerMorph inherits from Morph:

BlinkerMorph.prototype = new Morph();
BlinkerMorph.prototype.constructor = BlinkerMorph;
BlinkerMorph.uber = Morph.prototype;

// BlinkerMorph instance creation:

function BlinkerMorph(rate) {
	this.init(rate);
}

BlinkerMorph.prototype.init = function (rate) {
	BlinkerMorph.uber.init.call(this);
	this.color = new Color(0, 0, 0);
	this.fps = rate || 2;
	this.drawNew();
};

// BlinkerMorph stepping:

BlinkerMorph.prototype.step = function () {
	this.toggleVisibility();
};

// CursorMorph /////////////////////////////////////////////////////////

// I am a String/Text editing widget

// CursorMorph: referenced constructors

var StringMorph;
var CursorMorph;

// CursorMorph inherits from BlinkerMorph:

CursorMorph.prototype = new BlinkerMorph();
CursorMorph.prototype.constructor = CursorMorph;
CursorMorph.uber = BlinkerMorph.prototype;

// CursorMorph instance creation:

function CursorMorph(aStringOrTextMorph) {
	this.init(aStringOrTextMorph);
}

CursorMorph.prototype.init = function (aStringOrTextMorph) {
	var ls;

	// additional properties:
	this.keyDownEventUsed = false;
	this.target = aStringOrTextMorph;
	this.originalContents = this.target.text;
	this.slot = this.target.text.length;
	CursorMorph.uber.init.call(this);
	ls = fontHeight(this.target.fontSize);
	this.setExtent(new Point(Math.max(Math.floor(ls / 20), 1), ls));
	this.drawNew();
	this.image.getContext('2d').font = this.target.font();
	this.gotoSlot(this.slot);
};

// CursorMorph event processing:

CursorMorph.prototype.processKeyPress = function (event) {
	// this.inspectKeyEvent(event);
	if (this.keyDownEventUsed) {
		this.keyDownEventUsed = false;
		return null;
	}
	if ((event.keyCode === 40) || event.charCode === 40) {
		this.insert('(');
		return null;
	}
	if ((event.keyCode === 37) || event.charCode === 37) {
		this.insert('%');
		return null;
	}
	var navigation = [8, 13, 18, 27, 35, 36, 37, 38, 39, 40, 46];
	if (event.keyCode) { // Opera doesn't support charCode
		if (!contains(navigation, event.keyCode) /* &&
				31 < event.keyCode < 128*/) {
			if (event.ctrlKey) {
				this.ctrl(event.keyCode);
			} else {
				this.insert(String.fromCharCode(event.keyCode));
			}
		}
	} else if (event.charCode) { // all other browsers
		if (!contains(navigation, event.charCode) /*&&
				31 < event.charCode < 128*/) {
			if (event.ctrlKey) {
				this.ctrl(event.charCode);
			} else {
				this.insert(String.fromCharCode(event.charCode));
			}
		}
	}
};

CursorMorph.prototype.processKeyDown = function (event) {
	// this.inspectKeyEvent(event);
	this.keyDownEventUsed = false;
	if (event.ctrlKey) {
		return this.ctrl(event.keyCode);
	}
	switch (event.keyCode) {
	case 37:
		this.goLeft();
		this.keyDownEventUsed = true;
		break;
	case 39:
		this.goRight();
		this.keyDownEventUsed = true;
		break;
	case 38:
		this.goUp();
		this.keyDownEventUsed = true;
		break;
	case 40:
		this.goDown();
		this.keyDownEventUsed = true;
		break;
	case 36:
		this.goHome();
		this.keyDownEventUsed = true;
		break;
	case 35:
		this.goEnd();
		this.keyDownEventUsed = true;
		break;
	case 46:
		this.deleteRight();
		this.keyDownEventUsed = true;
		break;
	case 8:
		this.deleteLeft();
		this.keyDownEventUsed = true;
		break;
	case 13:
		if (this.target instanceof StringMorph) {
			this.accept();
		} else {
			this.insert('\n');
		}
		this.keyDownEventUsed = true;
		break;
	case 27:
		this.cancel();
		this.keyDownEventUsed = true;
		break;
	case 190:
		this.insert('.');
		this.keyDownEventUsed = true;
		break;
	case 191: /// Mac OSX for question mark, single quote on others
        this.insert('?');
		this.keyDownEventUsed = true;
		break;
    case 222: // Mac OSX
		this.insert("'");
		this.keyDownEventUsed = true;
		break;
	default:
		// this.inspectKeyEvent(event);
	}
};

// CursorMorph navigation:

CursorMorph.prototype.gotoSlot = function (newSlot) {
	this.setPosition(this.target.slotPosition(newSlot));
	this.slot = Math.max(newSlot, 0);
};

CursorMorph.prototype.goLeft = function () {
	this.target.clearSelection();
	this.gotoSlot(this.slot - 1);
};

CursorMorph.prototype.goRight = function () {
	this.target.clearSelection();
	this.gotoSlot(this.slot + 1);
};

CursorMorph.prototype.goUp = function () {
	this.target.clearSelection();
	this.gotoSlot(this.target.upFrom(this.slot));
};

CursorMorph.prototype.goDown = function () {
	this.target.clearSelection();
	this.gotoSlot(this.target.downFrom(this.slot));
};

CursorMorph.prototype.goHome = function () {
	this.target.clearSelection();
	this.gotoSlot(this.target.startOfLine(this.slot));
};

CursorMorph.prototype.goEnd = function () {
	this.target.clearSelection();
	this.gotoSlot(this.target.endOfLine(this.slot));
};

CursorMorph.prototype.gotoPos = function (aPoint) {
	this.gotoSlot(this.target.slotAt(aPoint));
	this.show();
};

// CursorMorph editing:

CursorMorph.prototype.accept = function () {
	var	world = this.root();
	if (world) {
		world.stopEditing();
	}
	this.escalateEvent('accept', null);
};

CursorMorph.prototype.cancel = function () {
	var	world = this.root();
	if (world) {
		world.stopEditing();
	}
	this.target.text = this.originalContents;
	this.target.changed();
	this.target.drawNew();
	this.target.changed();
	this.escalateEvent('cancel', null);
};

CursorMorph.prototype.insert = function (aChar) {
	var text;
    if (aChar === '\u0009') {
		return this.target.tab(this.target);
	}
	if (!this.target.isNumeric
			|| !isNaN(parseFloat(aChar))
			|| contains(['-', '.'], aChar)) {
		if (this.target.selection() !== '') {
			this.gotoSlot(this.target.selectionStartSlot());
			this.target.deleteSelection();
		}
		text = this.target.text;
		text = text.slice(0, this.slot)
			+ aChar
			+ text.slice(this.slot);
		this.target.text = text;
		this.target.drawNew();
		this.target.changed();
		this.goRight();
	}
};

CursorMorph.prototype.ctrl = function (aChar) {
	if ((aChar === 97) || (aChar === 65)) {
		this.target.selectAll();
		return null;
	}
	if (aChar === 123) {
		this.insert('{');
		return null;
	}
	if (aChar === 125) {
		this.insert('}');
		return null;
	}
	if (aChar === 91) {
		this.insert('[');
		return null;
	}
	if (aChar === 93) {
		this.insert(']');
		return null;
	}
};

CursorMorph.prototype.deleteRight = function () {
	var text;
	if (this.target.selection() !== '') {
		this.gotoSlot(this.target.selectionStartSlot());
		this.target.deleteSelection();
	} else {
		text = this.target.text;
		this.target.changed();
		text = text.slice(0, this.slot) + text.slice(this.slot + 1);
		this.target.text = text;
		this.target.drawNew();
	}
};

CursorMorph.prototype.deleteLeft = function () {
	var text;
	if (this.target.selection() !== '') {
		this.gotoSlot(this.target.selectionStartSlot());
		this.target.deleteSelection();
	}
	text = this.target.text;
	this.target.changed();
	text = text.slice(0, Math.max(this.slot - 1, 0)) +
		text.slice(this.slot);
	this.target.text = text;
	this.target.drawNew();
	this.goLeft();
};

// CursorMorph utilities:

CursorMorph.prototype.inspectKeyEvent = function (event) {
	// private
	this.inform(
		'Key pressed: ' +
			String.fromCharCode(event.charCode) +
			'\n------------------------' +
			'\ncharCode: ' +
			event.charCode.toString() +
			'\nkeyCode: ' +
			event.keyCode.toString() +
			'\naltKey: ' +
			event.altKey.toString() +
			'\nctrlKey: ' +
			event.ctrlKey.toString()
	);
};

// BoxMorph ////////////////////////////////////////////////////////////

// I can have an optionally rounded border

var BoxMorph;

// BoxMorph inherits from Morph:

BoxMorph.prototype = new Morph();
BoxMorph.prototype.constructor = BoxMorph;
BoxMorph.uber = Morph.prototype;

// BoxMorph instance creation:

function BoxMorph(edge, border, borderColor) {
	this.init(edge, border, borderColor);
}

BoxMorph.prototype.init = function (edge, border, borderColor) {
	this.edge = edge || 4;
	this.border = border || ((border === 0) ? 0 : 2);
	this.borderColor = borderColor || new Color();
	BoxMorph.uber.init.call(this);
};

// BoxMorph drawing:

BoxMorph.prototype.drawNew = function () {
	var	context;

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
	}
};

BoxMorph.prototype.outlinePath = function (context, radius, inset) {
	var	offset = radius + inset,
		w = this.width(),
		h = this.height();

	// top left:
	context.arc(
		offset,
		offset,
		radius,
		radians(-180),
		radians(-90),
		false
	);
	// top right:
	context.arc(
		w - offset,
		offset,
		radius,
		radians(-90),
		radians(-0),
		false
	);
	// bottom right:
	context.arc(
		w - offset,
		h - offset,
		radius,
		radians(0),
		radians(90),
		false
	);
	// bottom left:
	context.arc(
		offset,
		h - offset,
		radius,
		radians(90),
		radians(180),
		false
	);
};


// BoxMorph menus:

BoxMorph.prototype.developersMenu = function () {
	var menu = BoxMorph.uber.developersMenu.call(this);
	menu.addLine();
	menu.addItem(
		"border width...",
		function () {
			this.prompt(
				menu.title + '\nborder\nwidth:',
				this.setBorderWidth,
				this,
				this.border.toString(),
				null,
				0,
				100,
				true
			);
		},
		'set the border\'s\nline size'
	);
	menu.addItem(
		"border color...",
		function () {
			this.pickColor(
				menu.title + '\nborder color:',
				this.setBorderColor,
				this,
				this.borderColor
			);
		},
		'set the border\'s\nline color'
	);
	menu.addItem(
		"corner size...",
		function () {
			this.prompt(
				menu.title + '\ncorner\nsize:',
				this.setCornerSize,
				this,
				this.edge.toString(),
				null,
				0,
				100,
				true
			);
		},
		'set the corner\'s\nradius'
	);
	return menu;
};

BoxMorph.prototype.setBorderWidth = function (size) {
	// for context menu demo purposes
	var newSize;
	if (typeof size === 'number') {
		this.border = Math.max(size, 0);
	} else {
		newSize = parseFloat(size);
		if (!isNaN(newSize)) {
			this.border = Math.max(newSize, 0);
		}
	}
	this.drawNew();
	this.changed();
};

BoxMorph.prototype.setBorderColor = function (color) {
	// for context menu demo purposes
	if (color) {
		this.borderColor = color;
		this.drawNew();
		this.changed();
	}
};

BoxMorph.prototype.setCornerSize = function (size) {
	// for context menu demo purposes
	var newSize;
	if (typeof size === 'number') {
		this.edge = Math.max(size, 0);
	} else {
		newSize = parseFloat(size);
		if (!isNaN(newSize)) {
			this.edge = Math.max(newSize, 0);
		}
	}
	this.drawNew();
	this.changed();
};

BoxMorph.prototype.colorSetters = function () {
	// for context menu demo purposes
	return ['color', 'borderColor'];
};

BoxMorph.prototype.numericalSetters = function () {
	// for context menu demo purposes
	var list = BoxMorph.uber.numericalSetters.call(this);
	list.push('setBorderWidth', 'setCornerSize');
	return list;
};

// SpeechBubbleMorph ///////////////////////////////////////////////////

/*
	I am a comic-style speech bubble that can display either a string,
	a Morph, a Canvas or a toString() representation of anything else.
	If I am invoked using popUp() I behave like a tool tip.
*/

// SpeechBubbleMorph: referenced constructors

var SpeechBubbleMorph;
var TextMorph;

// SpeechBubbleMorph inherits from BoxMorph:

SpeechBubbleMorph.prototype = new BoxMorph();
SpeechBubbleMorph.prototype.constructor = SpeechBubbleMorph;
SpeechBubbleMorph.uber = BoxMorph.prototype;

// SpeechBubbleMorph instance creation:

function SpeechBubbleMorph(
    contents,
    color,
    edge,
    border,
    borderColor,
    padding,
    isThought
) {
	this.init(contents, color, edge, border, borderColor, padding, isThought);
}

SpeechBubbleMorph.prototype.init = function (
	contents,
	color,
	edge,
	border,
	borderColor,
    padding,
    isThought
) {
    this.isPointingRight = true; // orientation of text
	this.contents = contents || '';
    this.padding = padding || 0; // additional vertical pixels
    this.isThought = isThought || false; // draw "think" bubble
	SpeechBubbleMorph.uber.init.call(
		this,
		edge || 6,
		border || ((border === 0) ? 0 : 1),
		borderColor || new Color(140, 140, 140)
	);
	this.color = color || new Color(230, 230, 230);
	this.drawNew();
};

// SpeechBubbleMorph invoking:

SpeechBubbleMorph.prototype.popUp = function (world, pos) {
	this.drawNew();
	this.setPosition(pos.subtract(new Point(0, this.height())));
	this.addShadow(new Point(2, 2), 80);
	this.keepWithin(world);
	world.add(this);
	this.changed();
	world.hand.destroyTemporaries();
	world.hand.temporaries.push(this);

	this.mouseEnter = function () {
		this.destroy();
	};
};

// SpeechBubbleMorph drawing:

SpeechBubbleMorph.prototype.drawNew = function () {
	// re-build my contents
	if (this.contentsMorph) {
		this.contentsMorph.destroy();
	}
	if (this.contents instanceof Morph) {
		this.contentsMorph = this.contents;
	} else if (isString(this.contents)) {
		this.contentsMorph = new TextMorph(
			this.contents,
			MorphicPreferences.bubbleHelpFontSize,
			null,
			false,
			true,
			'center'
		);
	} else if (this.contents instanceof HTMLCanvasElement) {
		this.contentsMorph = new Morph();
		this.contentsMorph.silentSetWidth(this.contents.width);
		this.contentsMorph.silentSetHeight(this.contents.height);
		this.contentsMorph.image = this.contents;
	} else {
		this.contentsMorph = new TextMorph(
			this.contents.toString(),
			MorphicPreferences.bubbleHelpFontSize,
			null,
			false,
			true,
			'center'
		);
	}
	this.add(this.contentsMorph);

	// adjust my layout
	this.silentSetWidth(this.contentsMorph.width()
        + (this.padding ? this.padding * 2 : this.edge * 2));
	this.silentSetHeight(this.contentsMorph.height()
		+ this.edge
		+ this.border * 2
        + this.padding * 2
		+ 2);

	// draw my outline
	SpeechBubbleMorph.uber.drawNew.call(this);

	// position my contents
    this.contentsMorph.setPosition(this.position().add(
		new Point(
            this.padding || this.edge,
            this.border + this.padding + 1
        )
	));
};

SpeechBubbleMorph.prototype.outlinePath = function (
	context,
	radius,
	inset
) {
	var	offset = radius + inset,
		w = this.width(),
		h = this.height(),
        rad;

    function circle(x, y, r) {
        context.moveTo(x + r, y);
        context.arc(x, y, r, radians(0), radians(360));
    }

	// top left:
	context.arc(
		offset,
		offset,
		radius,
		radians(-180),
		radians(-90),
		false
	);
	// top right:
	context.arc(
		w - offset,
		offset,
		radius,
		radians(-90),
		radians(-0),
		false
	);
	// bottom right:
	context.arc(
		w - offset,
		h - offset - radius,
		radius,
		radians(0),
		radians(90),
		false
	);
    if (!this.isThought) { // draw speech bubble hook
        if (this.isPointingRight) {
            context.lineTo(
                offset + radius,
                h - offset
            );
            context.lineTo(
                radius / 2 + inset,
                h - inset
            );
        } else { // pointing left
            context.lineTo(
                w - (radius / 2 + inset),
                h - inset
            );
            context.lineTo(
                w - (offset + radius),
                h - offset
            );
        }
    }
	// bottom left:
	context.arc(
		offset,
		h - offset - radius,
		radius,
		radians(90),
		radians(180),
		false
	);
    if (this.isThought) {
        // close large bubble:
        context.lineTo(
            inset,
            offset
        );
        // draw thought bubbles:
        if (this.isPointingRight) {
            // tip bubble:
            rad = radius / 4;
            circle(rad + inset, h - rad - inset, rad);
            // middle bubble:
            rad = radius / 3.2;
            circle(rad * 2 + inset, h - rad - inset * 2, rad);
            // top bubble:
            rad = radius / 2.8;
            circle(rad * 3 + inset * 2, h - rad - inset * 4, rad);
        } else { // pointing left
            // tip bubble:
            rad = radius / 4;
            circle(w - (rad + inset), h - rad - inset, rad);
            // middle bubble:
            rad = radius / 3.2;
            circle(w - (rad * 2 + inset), h - rad - inset * 2, rad);
            // top bubble:
            rad = radius / 2.8;
            circle(w - (rad * 3 + inset * 2), h - rad - inset * 4, rad);
        }
    }
};

// CircleBoxMorph //////////////////////////////////////////////////////

// I can be used for sliders

var CircleBoxMorph;

// CircleBoxMorph inherits from Morph:

CircleBoxMorph.prototype = new Morph();
CircleBoxMorph.prototype.constructor = CircleBoxMorph;
CircleBoxMorph.uber = Morph.prototype;

function CircleBoxMorph(orientation) {
	this.init(orientation || 'vertical');
}

CircleBoxMorph.prototype.init = function (orientation) {
	CircleBoxMorph.uber.init.call(this);
	this.orientation = orientation;
	this.autoOrient = true;
	this.setExtent(new Point(20, 100));
};

CircleBoxMorph.prototype.autoOrientation = function () {
	if (this.height() > this.width()) {
		this.orientation = 'vertical';
	} else {
		this.orientation = 'horizontal';
	}
};

CircleBoxMorph.prototype.drawNew = function () {
	var	radius, center1, center2, rect, points, x, y,
		context, ext,
		myself = this;

	if (this.autoOrient) {
		this.autoOrientation();
	}
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');

	if (this.orientation === 'vertical') {
		radius = this.width() / 2;
		x = this.center().x;
		center1 = new Point(x, this.top() + radius);
		center2 = new Point(x, this.bottom() - radius);
		rect = this.bounds.origin.add(new Point(0, radius)).corner(
			this.bounds.corner.subtract(new Point(0, radius))
		);
	} else {
		radius = this.height() / 2;
		y = this.center().y;
		center1 = new Point(this.left() + radius, y);
		center2 = new Point(this.right() - radius, y);
		rect = this.bounds.origin.add(new Point(radius, 0)).corner(
			this.bounds.corner.subtract(new Point(radius, 0))
		);
	}
	points = [ center1.subtract(this.bounds.origin),
		center2.subtract(this.bounds.origin)];
	points.forEach(function (center) {
		context.fillStyle = myself.color.toString();
		context.beginPath();
		context.arc(
			center.x,
			center.y,
			radius,
			0,
			2 * Math.PI,
			false
		);
		context.closePath();
		context.fill();
	});
	rect = rect.translateBy(this.bounds.origin.neg());
	ext = rect.extent();
	if (ext.x > 0 && ext.y > 0) {
		context.fillRect(
			rect.origin.x,
			rect.origin.y,
			rect.width(),
			rect.height()
		);
	}
};

// CircleBoxMorph menu:

CircleBoxMorph.prototype.developersMenu = function () {
	var menu = CircleBoxMorph.uber.developersMenu.call(this);
	menu.addLine();
	if (this.orientation === 'vertical') {
		menu.addItem(
			"horizontal...",
			'toggleOrientation',
			'toggle the\norientation'
		);
	} else {
		menu.addItem(
			"vertical...",
			'toggleOrientation',
			'toggle the\norientation'
		);
	}
	return menu;
};

CircleBoxMorph.prototype.toggleOrientation = function () {
	var center = this.center();
	this.changed();
	if (this.orientation === 'vertical') {
		this.orientation = 'horizontal';
	} else {
		this.orientation = 'vertical';
	}
	this.silentSetExtent(new Point(this.height(), this.width()));
	this.setCenter(center);
	this.drawNew();
	this.changed();
};

// SliderButtonMorph ///////////////////////////////////////////////////

var SliderButtonMorph;

// SliderButtonMorph inherits from CircleBoxMorph:

SliderButtonMorph.prototype = new CircleBoxMorph();
SliderButtonMorph.prototype.constructor = SliderButtonMorph;
SliderButtonMorph.uber = CircleBoxMorph.prototype;

function SliderButtonMorph(orientation) {
	this.init(orientation);
}

SliderButtonMorph.prototype.init = function (orientation) {
	this.color = new Color(80, 80, 80);
	this.highlightColor = new Color(90, 90, 140);
	this.pressColor = new Color(80, 80, 160);
	this.is3D = true;
	this.hasMiddleDip = true;
	SliderButtonMorph.uber.init.call(this, orientation);
};

SliderButtonMorph.prototype.autoOrientation = function () {
	nop();
};

SliderButtonMorph.prototype.drawNew = function () {
	var colorBak = this.color.copy();

	SliderButtonMorph.uber.drawNew.call(this);
	if (this.is3D) {
		this.drawEdges();
	}
	this.normalImage = this.image;

	this.color = this.highlightColor.copy();
	SliderButtonMorph.uber.drawNew.call(this);
	if (this.is3D) {
		this.drawEdges();
	}
	this.highlightImage = this.image;

	this.color = this.pressColor.copy();
	SliderButtonMorph.uber.drawNew.call(this);
	if (this.is3D) {
		this.drawEdges();
	}
	this.pressImage = this.image;

	this.color = colorBak;
	this.image = this.normalImage;

};

SliderButtonMorph.prototype.drawEdges = function () {
	var	context = this.image.getContext('2d'),
		gradient,
		radius,
		w = this.width(),
		h = this.height();

	context.lineJoin = 'round';
	context.lineCap = 'round';

	if (this.orientation === 'vertical') {
		context.lineWidth = w / 3;
		gradient = context.createLinearGradient(
			0,
			0,
			context.lineWidth,
			0
		);
		gradient.addColorStop(0, 'white');
		gradient.addColorStop(1, this.color.toString());

		context.strokeStyle = gradient;
		context.beginPath();
		context.moveTo(context.lineWidth * 0.5, w / 2);
		context.lineTo(context.lineWidth * 0.5, h - w / 2);
		context.stroke();

		gradient = context.createLinearGradient(
			w - context.lineWidth,
			0,
			w,
			0
		);
		gradient.addColorStop(0, this.color.toString());
		gradient.addColorStop(1, 'black');

		context.strokeStyle = gradient;
		context.beginPath();
		context.moveTo(w - context.lineWidth * 0.5, w / 2);
		context.lineTo(w - context.lineWidth * 0.5, h - w / 2);
		context.stroke();

		if (this.hasMiddleDip) {
			gradient = context.createLinearGradient(
				context.lineWidth,
				0,
				w - context.lineWidth,
				0
			);

			radius = w / 4;
			gradient.addColorStop(0, 'black');
			gradient.addColorStop(0.35, this.color.toString());
			gradient.addColorStop(0.65, this.color.toString());
			gradient.addColorStop(1, 'white');

			context.fillStyle = gradient;
			context.beginPath();
			context.arc(
				w / 2,
				h / 2,
				radius,
				radians(0),
				radians(360),
				false
			);
			context.closePath();
			context.fill();
		}
	} else if (this.orientation === 'horizontal') {
		context.lineWidth = h / 3;
		gradient = context.createLinearGradient(
			0,
			0,
			0,
			context.lineWidth
		);
		gradient.addColorStop(0, 'white');
		gradient.addColorStop(1, this.color.toString());

		context.strokeStyle = gradient;
		context.beginPath();
		context.moveTo(h / 2, context.lineWidth * 0.5);
		context.lineTo(w - h / 2, context.lineWidth * 0.5);
		context.stroke();

		gradient = context.createLinearGradient(
			0,
			h - context.lineWidth,
			0,
			h
		);
		gradient.addColorStop(0, this.color.toString());
		gradient.addColorStop(1, 'black');

		context.strokeStyle = gradient;
		context.beginPath();
		context.moveTo(h / 2, h - context.lineWidth * 0.5);
		context.lineTo(w - h / 2, h - context.lineWidth * 0.5);
		context.stroke();

		if (this.hasMiddleDip) {
			gradient = context.createLinearGradient(
				0,
				context.lineWidth,
				0,
				h - context.lineWidth
			);

			radius = h / 4;
			gradient.addColorStop(0, 'black');
			gradient.addColorStop(0.35, this.color.toString());
			gradient.addColorStop(0.65, this.color.toString());
			gradient.addColorStop(1, 'white');

			context.fillStyle = gradient;
			context.beginPath();
			context.arc(
				this.width() / 2,
				this.height() / 2,
				radius,
				radians(0),
				radians(360),
				false
			);
			context.closePath();
			context.fill();
		}
	}
};

//SliderButtonMorph events:

SliderButtonMorph.prototype.mouseEnter = function () {
	this.image = this.highlightImage;
	this.changed();
};

SliderButtonMorph.prototype.mouseLeave = function () {
	this.image = this.normalImage;
	this.changed();
};

SliderButtonMorph.prototype.mouseDownLeft = function (pos) {
	this.image = this.pressImage;
	this.changed();
	this.escalateEvent('mouseDownLeft', pos);
};

SliderButtonMorph.prototype.mouseClickLeft = function () {
	this.image = this.highlightImage;
	this.changed();
};

SliderButtonMorph.prototype.mouseMove = function () {
	// prevent my parent from getting picked up
	nop();
};

// SliderMorph ///////////////////////////////////////////////////

// SliderMorph inherits from CircleBoxMorph:

SliderMorph.prototype = new CircleBoxMorph();
SliderMorph.prototype.constructor = SliderMorph;
SliderMorph.uber = CircleBoxMorph.prototype;

function SliderMorph(start, stop, value, size, orientation, color) {
	this.init(
		start || 1,
		stop || 100,
		value || 50,
		size || 10,
		orientation || 'vertical',
        color
	);
}

SliderMorph.prototype.init = function (
	start,
	stop,
	value,
	size,
	orientation,
    color
) {
	this.target = null;
	this.action = null;
	this.start = start;
	this.stop = stop;
	this.value = value;
	this.size = size;
	this.offset = null;
	this.button = new SliderButtonMorph();
	this.button.isDraggable = false;
	this.button.color = new Color(200, 200, 200);
	this.button.highlightColor = new Color(210, 210, 255);
	this.button.pressColor = new Color(180, 180, 255);
	SliderMorph.uber.init.call(this, orientation);
	this.add(this.button);
	this.alpha = 0.3;
	this.color = color || new Color(0, 0, 0);
	this.setExtent(new Point(20, 100));
	// this.drawNew();
};

SliderMorph.prototype.autoOrientation = function () {
	nop();
};

SliderMorph.prototype.rangeSize = function () {
	return this.stop - this.start;
};

SliderMorph.prototype.ratio = function () {
	return this.size / this.rangeSize();
};

SliderMorph.prototype.unitSize = function () {
	if (this.orientation === 'vertical') {
		return (this.height() - this.button.height()) /
			this.rangeSize();
	}
    return (this.width() - this.button.width()) /
        this.rangeSize();
};

SliderMorph.prototype.drawNew = function () {
	var bw, bh, posX, posY;

	SliderMorph.uber.drawNew.call(this);
	this.button.orientation = this.orientation;
	if (this.orientation === 'vertical') {
		bw  = this.width() - 2;
		bh = Math.max(bw, Math.round(this.height() * this.ratio()));
		this.button.silentSetExtent(new Point(bw, bh));
		posX = 1;
		posY = Math.min(
			Math.round((this.value - this.start) * this.unitSize()),
			this.height() - this.button.height()
		);
	} else {
		bh = this.height() - 2;
		bw  = Math.max(bh, Math.round(this.width() * this.ratio()));
		this.button.silentSetExtent(new Point(bw, bh));
		posY = 1;
		posX = Math.min(
			Math.round((this.value - this.start) * this.unitSize()),
			this.width() - this.button.width()
		);
	}
	this.button.setPosition(
		new Point(posX, posY).add(this.bounds.origin)
	);
	this.button.drawNew();
	this.button.changed();
};

SliderMorph.prototype.updateValue = function () {
	var relPos;
	if (this.orientation === 'vertical') {
		relPos = this.button.top() - this.top();
	} else {
		relPos = this.button.left() - this.left();
	}
	this.value = Math.round(relPos / this.unitSize() + this.start);
	this.updateTarget();
};

SliderMorph.prototype.updateTarget = function () {
	if (this.action) {
		if (typeof this.action === 'function') {
			this.action.call(this.target, this.value);
		} else { // assume it's a String
			this.target[this.action].call(this.target, this.value);
		}
	}
};

// SliderMorph duplicating:

SliderMorph.prototype.copyRecordingReferences = function (dict) {
	// inherited, see comment in Morph
	var	c = SliderMorph.uber.copyRecordingReferences.call(
		this,
		dict
	);
	if (c.target && dict[this.target]) {
		c.target = (dict[this.target]);
	}
	if (c.button && dict[this.button]) {
		c.button = (dict[this.button]);
	}
	return c;
};

// SliderMorph menu:

SliderMorph.prototype.developersMenu = function () {
	var menu = SliderMorph.uber.developersMenu.call(this);
	menu.addItem(
		"show value...",
		'showValue',
		'display a dialog box\nshowing the selected number'
	);
	menu.addItem(
		"floor...",
		function () {
			this.prompt(
				menu.title + '\nfloor:',
				this.setStart,
				this,
				this.start.toString(),
				null,
				0,
				this.stop - this.size,
				true
			);
		},
		'set the minimum value\nwhich can be selected'
	);
	menu.addItem(
		"ceiling...",
		function () {
			this.prompt(
				menu.title + '\nceiling:',
				this.setStop,
				this,
				this.stop.toString(),
				null,
				this.start + this.size,
				this.size * 100,
				true
			);
		},
		'set the maximum value\nwhich can be selected'
	);
	menu.addItem(
		"button size...",
		function () {
			this.prompt(
				menu.title + '\nbutton size:',
				this.setSize,
				this,
				this.size.toString(),
				null,
				1,
				this.stop - this.start,
				true
			);
		},
		'set the range\ncovered by\nthe slider button'
	);
	menu.addLine();
	menu.addItem(
		'set target',
		"setTarget",
		'select another morph\nwhose numerical property\nwill be ' +
			'controlled by this one'
	);
	return menu;
};

SliderMorph.prototype.showValue = function () {
	this.inform(this.value);
};

SliderMorph.prototype.userSetStart = function (num) {
	// for context menu demo purposes
	this.start = Math.max(num, this.stop);
};

SliderMorph.prototype.setStart = function (num) {
	// for context menu demo purposes
	var newStart;
	if (typeof num === 'number') {
		this.start = Math.min(
			Math.max(num, 0),
			this.stop - this.size
		);
	} else {
		newStart = parseFloat(num);
		if (!isNaN(newStart)) {
			this.start = Math.min(
				Math.max(newStart, 0),
				this.stop - this.size
			);
		}
	}
	this.value = Math.max(this.value, this.start);
	this.updateTarget();
	this.drawNew();
	this.changed();
};

SliderMorph.prototype.setStop = function (num) {
	// for context menu demo purposes
	var newStop;
	if (typeof num === 'number') {
		this.stop = Math.max(num, this.start + this.size);
	} else {
		newStop = parseFloat(num);
		if (!isNaN(newStop)) {
			this.stop = Math.max(newStop, this.start + this.size);
		}
	}
	this.value = Math.min(this.value, this.stop);
	this.updateTarget();
	this.drawNew();
	this.changed();
};

SliderMorph.prototype.setSize = function (num) {
	// for context menu demo purposes
	var newSize;
	if (typeof num === 'number') {
		this.size = Math.min(
			Math.max(num, 1),
			this.stop - this.start
		);
	} else {
		newSize = parseFloat(num);
		if (!isNaN(newSize)) {
			this.size = Math.min(
				Math.max(newSize, 1),
				this.stop - this.start
			);
		}
	}
	this.value = Math.min(this.value, this.stop - this.size);
	this.updateTarget();
	this.drawNew();
	this.changed();
};

SliderMorph.prototype.setTarget = function () {
	var	choices = this.overlappedMorphs(),
		menu = new MenuMorph(this, 'choose target:'),
		myself = this;

	choices.push(this.world());
	choices.forEach(function (each) {
		menu.addItem(each.toString().slice(0, 50), function () {
			myself.target = each;
			myself.setTargetSetter();
		});
	});
	if (choices.length === 1) {
		this.target = choices[0];
		this.setTargetSetter();
	} else if (choices.length > 0) {
		menu.popUpAtHand(this.world());
	}
};

SliderMorph.prototype.setTargetSetter = function () {
	var	choices = this.target.numericalSetters(),
		menu = new MenuMorph(this, 'choose target property:'),
		myself = this;

	choices.forEach(function (each) {
		menu.addItem(each, function () {
			myself.action = each;
		});
	});
	if (choices.length === 1) {
		this.action = choices[0];
	} else if (choices.length > 0) {
		menu.popUpAtHand(this.world());
	}
};

SliderMorph.prototype.numericalSetters = function () {
	// for context menu demo purposes
	var list = SliderMorph.uber.numericalSetters.call(this);
	list.push('setStart', 'setStop', 'setSize');
	return list;
};

// SliderMorph stepping:

SliderMorph.prototype.step = null;

SliderMorph.prototype.mouseDownLeft = function (pos) {
	var	world, myself = this;

	if (!this.button.bounds.containsPoint(pos)) {
		this.offset = new Point(); // return null;
	} else {
		this.offset = pos.subtract(this.button.bounds.origin);
	}
	world = this.root();
	this.step = function () {
		var mousePos, newX, newY;
		if (world.hand.mouseButton) {
			mousePos = world.hand.bounds.origin;
			if (myself.orientation === 'vertical') {
				newX = myself.button.bounds.origin.x;
				newY = Math.max(
					Math.min(
						mousePos.y - myself.offset.y,
						myself.bottom() - myself.button.height()
					),
					myself.top()
				);
			} else {
				newY = myself.button.bounds.origin.y;
				newX = Math.max(
					Math.min(
						mousePos.x - myself.offset.x,
						myself.right() - myself.button.width()
					),
					myself.left()
				);
			}
			myself.button.setPosition(new Point(newX, newY));
			myself.updateValue();
		} else {
			this.step = null;
		}
	};
};

// MouseSensorMorph ////////////////////////////////////////////////////

// for demo and debuggin purposes only, to be removed later

var MouseSensorMorph;

// MouseSensorMorph inherits from BoxMorph:

MouseSensorMorph.prototype = new BoxMorph();
MouseSensorMorph.prototype.constructor = MouseSensorMorph;
MouseSensorMorph.uber = BoxMorph.prototype;

// MouseSensorMorph instance creation:

function MouseSensorMorph(edge, border, borderColor) {
	this.init(edge, border, borderColor);
}

MouseSensorMorph.prototype.init = function (edge, border, borderColor) {
	MouseSensorMorph.uber.init.call(this);
	this.edge = edge || 4;
	this.border = border || 2;
	this.color = new Color(255, 255, 255);
	this.borderColor = borderColor || new Color();
	this.isTouched = false;
	this.upStep = 0.05;
	this.downStep = 0.02;
	this.noticesTransparentClick = false;
	this.drawNew();
};

MouseSensorMorph.prototype.touch = function () {
	var	myself = this;
	if (!this.isTouched) {
		this.isTouched = true;
		this.alpha = 0.6;

		this.step = function () {
			if (myself.isTouched) {
				if (myself.alpha < 1) {
					myself.alpha = myself.alpha + myself.upStep;
				}
			} else if (myself.alpha > (myself.downStep)) {
				myself.alpha = myself.alpha - myself.downStep;
			} else {
				myself.alpha = 0;
				myself.step = null;
			}
			myself.changed();
		};
	}
};

MouseSensorMorph.prototype.unTouch = function () {
	this.isTouched = false;
};

MouseSensorMorph.prototype.mouseEnter = function () {
	this.touch();
};

MouseSensorMorph.prototype.mouseLeave = function () {
	this.unTouch();
};

MouseSensorMorph.prototype.mouseDownLeft = function () {
	this.touch();
};

MouseSensorMorph.prototype.mouseClickLeft = function () {
	this.unTouch();
};

// InspectorMorph //////////////////////////////////////////////////////

// InspectorMorph: referenced constructors

var ListMorph;
var TriggerMorph;

// InspectorMorph inherits from BoxMorph:

InspectorMorph.prototype = new BoxMorph();
InspectorMorph.prototype.constructor = InspectorMorph;
InspectorMorph.uber = BoxMorph.prototype;

// InspectorMorph instance creation:

function InspectorMorph(target) {
	this.init(target);
}

InspectorMorph.prototype.init = function (target) {
	// additional properties:
	this.target = target;
	this.currentProperty = null;
	this.showing = 'attributes';
    this.markOwnProperties = false;

	// initialize inherited properties:
	InspectorMorph.uber.init.call(this);

	// override inherited properties:
	this.silentSetExtent(
		new Point(
			MorphicPreferences.handleSize * 20,
			MorphicPreferences.handleSize * 20 * 2 / 3
		)
	);
	this.isDraggable = true;
	this.border = 1;
	this.edge = 5;
	this.color = new Color(60, 60, 60);
	this.borderColor = new Color(95, 95, 95);
	this.drawNew();

	// panes:
	this.label = null;
	this.list = null;
	this.detail = null;
	this.work = null;
	this.buttonInspect = null;
	this.buttonClose = null;
	this.buttonSubset = null;
	this.buttonEdit = null;
	this.resizer = null;

	if (this.target) {
		this.buildPanes();
	}
};

InspectorMorph.prototype.setTarget = function (target) {
	this.target = target;
	this.currentProperty = null;
	this.buildPanes();
};

InspectorMorph.prototype.buildPanes = function () {
	var attribs = [], property, myself = this, ctrl, ev;

	// remove existing panes
	this.children.forEach(function (m) {
		if (m !== this.work) { // keep work pane around
			m.destroy();
		}
	});
	this.children = [];

	// label
	this.label = new TextMorph(this.target.toString());
	this.label.fontSize = MorphicPreferences.menuFontSize;
	this.label.isBold = true;
	this.label.color = new Color(255, 255, 255);
	this.label.drawNew();
	this.add(this.label);

	// properties list
	for (property in this.target) {
		if (property) { // dummy condition, to be refined
			attribs.push(property);
		}
	}
	if (this.showing === 'attributes') {
		attribs = attribs.filter(function (prop) {
			return typeof myself.target[prop] !== 'function';
		});
	} else if (this.showing === 'methods') {
		attribs = attribs.filter(function (prop) {
			return typeof myself.target[prop] === 'function';
		});
	} // otherwise show all properties
	this.list = new ListMorph(
		this.target instanceof Array ? attribs : attribs.sort(),
        null, // label getter
        this.markOwnProperties ?
                [ // format list
                    [ // format element: [color, predicate(element]
                        new Color(0, 0, 180),
                        function (element) {
                            return myself.target.hasOwnProperty(element);
                        }
                    ]
                ]
                : null
	);
	this.list.action = function (selected) {
		var val, txt, cnts;
		val = myself.target[selected];
		myself.currentProperty = val;
		if (val === null) {
			txt = 'NULL';
		} else if (isString(val)) {
			txt = val;
		} else {
			txt = val.toString();
		}
		cnts = new TextMorph(txt);
		cnts.isEditable = true;
		cnts.enableSelecting();
		cnts.setReceiver(myself.target);
		myself.detail.setContents(cnts);
	};
	this.list.hBar.alpha = 0.6;
	this.list.vBar.alpha = 0.6;
	this.add(this.list);

	// details pane
	this.detail = new ScrollFrameMorph();
	this.detail.acceptsDrops = false;
	this.detail.contents.acceptsDrops = false;
	this.detail.isTextLineWrapping = true;
	this.detail.color = new Color(255, 255, 255);
	this.detail.hBar.alpha = 0.6;
	this.detail.vBar.alpha = 0.6;
	ctrl = new TextMorph('');
	ctrl.isEditable = true;
	ctrl.enableSelecting();
	ctrl.setReceiver(this.target);
	this.detail.setContents(ctrl);
	this.add(this.detail);

	// work ('evaluation') pane
	// don't refresh the work pane if it already exists
	if (this.work === null) {
		this.work = new ScrollFrameMorph();
		this.work.acceptsDrops = false;
		this.work.contents.acceptsDrops = false;
		this.work.isTextLineWrapping = true;
		this.work.color = new Color(255, 255, 255);
		this.work.hBar.alpha = 0.6;
		this.work.vBar.alpha = 0.6;
		ev = new TextMorph('');
		ev.isEditable = true;
		ev.enableSelecting();
		ev.setReceiver(this.target);
		this.work.setContents(ev);
	}
	this.add(this.work);

	// properties button
	this.buttonSubset = new TriggerMorph();
	this.buttonSubset.labelString = 'show...';
	this.buttonSubset.action = function () {
		var menu;
		menu = new MenuMorph();
		menu.addItem(
			'attributes',
			function () {
				myself.showing = 'attributes';
				myself.buildPanes();
			}
		);
		menu.addItem(
			'methods',
			function () {
				myself.showing = 'methods';
				myself.buildPanes();
			}
		);
		menu.addItem(
			'all',
			function () {
				myself.showing = 'all';
				myself.buildPanes();
			}
		);
        menu.addLine();
		menu.addItem(
			(myself.markOwnProperties ?
                    'un-mark own' : 'mark own'),
			function () {
				myself.markOwnProperties = !myself.markOwnProperties;
				myself.buildPanes();
			},
            'highlight\n\'own\' properties'
		);
		menu.popUpAtHand(myself.world());
	};
	this.add(this.buttonSubset);

	// inspect button
	this.buttonInspect = new TriggerMorph();
	this.buttonInspect.labelString = 'inspect...';
	this.buttonInspect.action = function () {
		var menu, world, inspector;
		if (isObject(myself.currentProperty)) {
			menu = new MenuMorph();
			menu.addItem(
				'in new inspector...',
				function () {
					world = myself.world();
					inspector = new InspectorMorph(
						myself.currentProperty
					);
					inspector.setPosition(world.hand.position());
					inspector.keepWithin(world);
					world.add(inspector);
					inspector.changed();
				}
			);
			menu.addItem(
				'here...',
				function () {
					myself.setTarget(myself.currentProperty);
				}
			);
			menu.popUpAtHand(myself.world());
		} else {
			myself.inform(
				(myself.currentProperty === null ?
						'null' : typeof myself.currentProperty) +
							'\nis not inspectable'
			);
		}
	};
	this.add(this.buttonInspect);

	// edit button

	this.buttonEdit = new TriggerMorph();
	this.buttonEdit.labelString = 'edit...';
	this.buttonEdit.action = function () {
		var menu;
		menu = new MenuMorph(myself);
		menu.addItem("save", 'save', 'accept changes');
		menu.addLine();
		menu.addItem("add property...", 'addProperty');
		menu.addItem("rename...", 'renameProperty');
		menu.addItem("remove...", 'removeProperty');
		menu.popUpAtHand(myself.world());
	};
	this.add(this.buttonEdit);

	// close button
	this.buttonClose = new TriggerMorph();
	this.buttonClose.labelString = 'close';
	this.buttonClose.action = function () {
		myself.destroy();
	};
	this.add(this.buttonClose);

	// resizer
	this.resizer = new HandleMorph(
		this,
		150,
		100,
		this.edge,
		this.edge
	);

	// update layout
	this.fixLayout();
};

InspectorMorph.prototype.fixLayout = function () {
	var x, y, r, b, w, h;

	Morph.prototype.trackChanges = false;

	// label
	x = this.left() + this.edge;
	y = this.top() + this.edge;
	r = this.right() - this.edge;
	w = r - x;
	this.label.setPosition(new Point(x, y));
	this.label.setWidth(w);
	if (this.label.height() > (this.height() - 50)) {
		this.silentSetHeight(this.label.height() + 50);
		this.drawNew();
		this.changed();
		this.resizer.drawNew();
	}

	// list
	y = this.label.bottom() + 2;
	w = Math.min(
		Math.floor(this.width() / 3),
		this.list.listContents.width()
	);

	w -= this.edge;
	b = this.bottom() - (2 * this.edge) -
		MorphicPreferences.handleSize;
	h = b - y;
	this.list.setPosition(new Point(x, y));
	this.list.setExtent(new Point(w, h));

	// detail
	x = this.list.right() + this.edge;
	r = this.right() - this.edge;
	w = r - x;
	this.detail.setPosition(new Point(x, y));
	this.detail.setExtent(new Point(w, (h * 2 / 3) - this.edge));

	// work
	y = this.detail.bottom() + this.edge;
	this.work.setPosition(new Point(x, y));
	this.work.setExtent(new Point(w, h / 3));

	// properties button
	x = this.list.left();
	y = this.list.bottom() + this.edge;
	w = this.list.width();
	h = MorphicPreferences.handleSize;
	this.buttonSubset.setPosition(new Point(x, y));
	this.buttonSubset.setExtent(new Point(w, h));

	// inspect button
	x = this.detail.left();
	w = this.detail.width() - this.edge -
		MorphicPreferences.handleSize;
	w = w / 3 - this.edge / 3;
	this.buttonInspect.setPosition(new Point(x, y));
	this.buttonInspect.setExtent(new Point(w, h));

	// edit button
	x = this.buttonInspect.right() + this.edge;
	this.buttonEdit.setPosition(new Point(x, y));
	this.buttonEdit.setExtent(new Point(w, h));

	// close button
	x = this.buttonEdit.right() + this.edge;
	r = this.detail.right() - this.edge -
		MorphicPreferences.handleSize;
	w = r - x;
	this.buttonClose.setPosition(new Point(x, y));
	this.buttonClose.setExtent(new Point(w, h));

	Morph.prototype.trackChanges = true;
	this.changed();

};

InspectorMorph.prototype.setExtent = function (aPoint) {
	InspectorMorph.uber.setExtent.call(this, aPoint);
	this.fixLayout();
};

//InspectorMorph editing ops:

InspectorMorph.prototype.save = function () {
	var	txt = this.detail.contents.children[0].text.toString(),
		prop = this.list.selected;
	try {
		// this.target[prop] = evaluate(txt);
		this.target.evaluateString('this.' + prop + ' = ' + txt);
		if (this.target.drawNew) {
			this.target.changed();
			this.target.drawNew();
			this.target.changed();
		}
	} catch (err) {
		this.inform(err);
	}
};

InspectorMorph.prototype.addProperty = function () {
	var myself = this;
	this.prompt(
		'new property name:',
		function (prop) {
			if (prop) {
				myself.target[prop] = null;
				myself.buildPanes();
				if (myself.target.drawNew) {
					myself.target.changed();
					myself.target.drawNew();
					myself.target.changed();
				}
			}
		},
		this,
		'property' // Chrome cannot handle empty strings (others do)
	);
};

InspectorMorph.prototype.renameProperty = function () {
	var	myself = this,
		propertyName = this.list.selected;
	this.prompt(
		'property name:',
		function (prop) {
			try {
				delete (myself.target[propertyName]);
				myself.target[prop] = myself.currentProperty;
			} catch (err) {
				myself.inform(err);
			}
			myself.buildPanes();
			if (myself.target.drawNew) {
				myself.target.changed();
				myself.target.drawNew();
				myself.target.changed();
			}
		},
		this,
		propertyName
	);
};

InspectorMorph.prototype.removeProperty = function () {
	var	prop = this.list.selected;
	try {
		delete (this.target[prop]);
		this.currentProperty = null;
		this.buildPanes();
		if (this.target.drawNew) {
			this.target.changed();
			this.target.drawNew();
			this.target.changed();
		}
	} catch (err) {
		this.inform(err);
	}
};

// MenuMorph ///////////////////////////////////////////////////////////

// MenuMorph: referenced constructors

var MenuItemMorph;

// MenuMorph inherits from BoxMorph:

MenuMorph.prototype = new BoxMorph();
MenuMorph.prototype.constructor = MenuMorph;
MenuMorph.uber = BoxMorph.prototype;

// MenuMorph instance creation:

function MenuMorph(target, title, environment, fontSize) {
	this.init(target, title, environment, fontSize);

	/*
	if target is a function, use it as callback:
	execute target as callback function with the action property
	of the triggered MenuItem as argument.
	Use the environment, if it is specified.
	Note: if action is also a function, instead of becoming
	the argument itself it will be called to answer the argument.
	For selections, Yes/No Choices etc.

	else (if target is not a function):

		if action is a function:
		execute the action with target as environment (can be null)
		for lambdafied (inline) actions

		else if action is a String:
		treat it as function property of target and execute it
		for selector-like actions
	*/
}

MenuMorph.prototype.init = function (target, title, environment, fontSize) {
	// additional properties:
	this.target = target;
	this.title = title || null;
	this.environment = environment || null;
	this.fontSize = fontSize || null;
	this.items = [];
	this.label = null;
	this.world = null;
	this.isListContents = false;

	// initialize inherited properties:
	MenuMorph.uber.init.call(this);

	// override inherited properties:
	this.isDraggable = false;

	// immutable properties:
	this.border = null;
	this.edge = null;
};

MenuMorph.prototype.addItem = function (labelString, action, hint, color) {
	this.items.push([labelString || 'close', action || nop, hint, color]);
};

MenuMorph.prototype.addLine = function (width) {
	this.items.push([0, width || 1]);
};

MenuMorph.prototype.createLabel = function () {
	var text;
	if (this.label !== null) {
		this.label.destroy();
	}
	text = new TextMorph(
		this.title,
		this.fontSize || MorphicPreferences.menuFontSize,
		MorphicPreferences.menuFontName,
		true,
		false,
		'center'
	);
	text.alignment = 'center';
	text.color = new Color(255, 255, 255);
	text.backgroundColor = this.borderColor;
	text.drawNew();
	this.label = new BoxMorph(3, 0);
	this.label.color = this.borderColor;
	this.label.borderColor = this.borderColor;
	this.label.setExtent(text.extent().add(4));
	this.label.drawNew();
	this.label.add(text);
	this.label.text = text;
};

MenuMorph.prototype.drawNew = function () {
	var	myself = this,
		item,
		fb,
		x,
		y,
		isLine = false;

	this.children.forEach(function (m) {
		m.destroy();
	});
	this.children = [];
	if (!this.isListContents) {
		this.edge = 5;
		this.border = 2;
	}
	this.color = new Color(255, 255, 255);
	this.borderColor = new Color(60, 60, 60);
	this.silentSetExtent(new Point(0, 0));

	y = 2;
	x = this.left() + 4;
	if (!this.isListContents) {
		if (this.title) {
			this.createLabel();
			this.label.setPosition(this.bounds.origin.add(4));
			this.add(this.label);
			y = this.label.bottom();
		} else {
			y = this.top() + 4;
		}
	}
	y += 1;
	this.items.forEach(function (tuple) {
		isLine = false;
		if (tuple instanceof StringFieldMorph ||
				tuple instanceof ColorPickerMorph ||
				tuple instanceof SliderMorph) {
			item = tuple;
		} else if (tuple[0] === 0) {
			isLine = true;
			item = new Morph();
			item.color = myself.borderColor;
			item.setHeight(tuple[1]);
		} else {
			item = new MenuItemMorph(
				myself.target,
				tuple[1],
				tuple[0],
				myself.fontSize || MorphicPreferences.menuFontSize,
				MorphicPreferences.menuFontName,
				myself.environment,
				tuple[2], // bubble help hint
                tuple[3] // color
			);
		}
		if (isLine) {
			y += 1;
		}
		item.setPosition(new Point(x, y));
		myself.add(item);
		y = y + item.height();
		if (isLine) {
			y += 1;
		}
	});

	fb = this.fullBounds();
	this.silentSetExtent(fb.extent().add(4));
	this.adjustWidths();
	MenuMorph.uber.drawNew.call(this);
};

MenuMorph.prototype.maxWidth = function () {
	var w = 0;

	if (this.parent instanceof FrameMorph) {
		if (this.parent.scrollFrame instanceof ScrollFrameMorph) {
			w = this.parent.width();
		}
	}

	this.children.forEach(function (item) {
		if ((item instanceof MenuItemMorph) ||
				(item instanceof StringFieldMorph) ||
				(item instanceof ColorPickerMorph) ||
				(item instanceof SliderMorph)) {
			w = Math.max(w, item.width());
		}
	});
	if (this.label) {
		w = Math.max(w, this.label.width());
	}
	return w;
};

MenuMorph.prototype.adjustWidths = function () {
	var	w = this.maxWidth(),
		myself = this;
	this.children.forEach(function (item) {
		item.silentSetWidth(w);
		if (item instanceof MenuItemMorph) {
			item.createBackgrounds();
		} else {
			item.drawNew();
			if (item === myself.label) {
				item.text.setPosition(
					item.center().subtract(
						item.text.extent().floorDivideBy(2)
					)
				);
			}
		}
	});
};

MenuMorph.prototype.unselectAllItems = function () {
	this.children.forEach(function (item) {
		if (item instanceof MenuItemMorph) {
			item.image = item.normalImage;
		}
	});
	this.changed();
};

MenuMorph.prototype.popup = function (world, pos) {
	this.drawNew();
	this.setPosition(pos);
	this.addShadow(new Point(2, 2), 80);
	this.keepWithin(world);
	if (world.activeMenu) {
		world.activeMenu.destroy();
	}
	world.add(this);
	world.activeMenu = this;
	this.fullChanged();
};

MenuMorph.prototype.popUpAtHand = function (world) {
	var wrrld = world || this.world;
	this.popup(wrrld, wrrld.hand.position());
};

MenuMorph.prototype.popUpCenteredAtHand = function (world) {
	var wrrld = world || this.world;
	this.drawNew();
	this.popup(
		wrrld,
		wrrld.hand.position().subtract(
			this.extent().floorDivideBy(2)
		)
	);
};

MenuMorph.prototype.popUpCenteredInWorld = function (world) {
	var wrrld = world || this.world;
	this.drawNew();
	this.popup(
		wrrld,
		wrrld.center().subtract(
			this.extent().floorDivideBy(2)
		)
	);
};

// StringMorph /////////////////////////////////////////////////////////

// I am a single line of text

// StringMorph inherits from Morph:

StringMorph.prototype = new Morph();
StringMorph.prototype.constructor = StringMorph;
StringMorph.uber = Morph.prototype;

// StringMorph instance creation:

function StringMorph(
	text,
	fontSize,
	fontStyle,
	bold,
	italic,
	isNumeric,
	shadowOffset,
	shadowColor,
    color
) {
	this.init(
		text,
		fontSize,
		fontStyle,
		bold,
		italic,
		isNumeric,
		shadowOffset,
		shadowColor,
        color
	);
}

StringMorph.prototype.init = function (
	text,
	fontSize,
	fontStyle,
	bold,
	italic,
	isNumeric,
	shadowOffset,
	shadowColor,
    color
) {
	// additional properties:
	this.text = text || ((text === '') ? '' : 'StringMorph');
	this.fontSize = fontSize || 12;
	this.fontStyle = fontStyle || 'sans-serif';
	this.isBold = bold || false;
	this.isItalic = italic || false;
	this.isEditable = false;
	this.isNumeric = isNumeric || false;
	this.shadowOffset = shadowOffset || new Point(0, 0);
	this.shadowColor = shadowColor || null;

	// additional properties for text-editing:
	this.currentlySelecting = false;
	this.startMark = 0;
	this.endMark = 0;
	this.markedTextColor = new Color(255, 255, 255);
	this.markedBackgoundColor = new Color(60, 60, 120);

	// initialize inherited properties:
	StringMorph.uber.init.call(this);

	// override inherited properites:
	this.color = color || new Color(0, 0, 0);
	this.noticesTransparentClick = true;
	this.drawNew();
};

StringMorph.prototype.toString = function () {
	// e.g. 'a StringMorph("Hello World")'
	return 'a '
		+ (this.constructor.name ||
			this.constructor.toString().split(' ')[1].split('(')[0])
		+ '("' + this.text.slice(0, 30) + '...")';
};

StringMorph.prototype.font = function () {
	// answer a font string, e.g. 'bold italic 12px sans-serif'
	var font = '';
	if (this.isBold) {
		font = font + 'bold ';
	}
	if (this.isItalic) {
		font = font + 'italic ';
	}
	return font + this.fontSize + 'px ' + this.fontStyle;
};

StringMorph.prototype.drawNew = function () {
	var	context, width, start, stop, i, p, c, x, y;

	// initialize my surface property
	this.image = newCanvas();
	context = this.image.getContext('2d');
	context.font = this.font();

	// set my extent
	width = Math.max(
		context.measureText(this.text).width
			+ Math.abs(this.shadowOffset.x),
		1
	);
	this.bounds.corner = this.bounds.origin.add(
		new Point(
			width,
			fontHeight(this.fontSize) + Math.abs(this.shadowOffset.y)
		)
	);
	this.image.width = width;
	this.image.height = this.height();

	// prepare context for drawing text
	context.font = this.font();
	context.textAlign = 'left';
	context.textBaseline = 'bottom';

	// first draw the shadow, if any
	if (this.shadowColor) {
		x = Math.max(this.shadowOffset.x, 0);
		y = Math.max(this.shadowOffset.y, 0);
		context.fillStyle = this.shadowColor.toString();
		context.fillText(this.text, x, fontHeight(this.fontSize) + y);
	}

	// now draw the actual text
	x = Math.abs(Math.min(this.shadowOffset.x, 0));
	y = Math.abs(Math.min(this.shadowOffset.y, 0));
	context.fillStyle = this.color.toString();
	context.fillText(this.text, x, fontHeight(this.fontSize) + y);

	// draw the selection
	start = Math.min(this.startMark, this.endMark);
	stop = Math.max(this.startMark, this.endMark);
	for (i = start; i < stop; i += 1) {
		p = this.slotPosition(i).subtract(this.position());
		c = this.text.charAt(i);
		context.fillStyle = this.markedBackgoundColor.toString();
		context.fillRect(p.x, p.y, context.measureText(c).width + 1 + x,
			fontHeight(this.fontSize) + y);
		context.fillStyle = this.markedTextColor.toString();
		context.fillText(c, p.x + x, fontHeight(this.fontSize) + y);
	}

	// notify my parent of layout change
	if (this.parent) {
		if (this.parent.fixLayout) {
			this.parent.fixLayout();
		}
	}
};

// StringMorph mesuring:

StringMorph.prototype.slotPosition = function (slot) {
	// answer the position point of the given index ("slot")
	// where the cursor should be placed
	var	dest = Math.min(Math.max(slot, 0), this.text.length),
		context = this.image.getContext('2d'),
		xOffset,
		x,
		y,
		idx;

	xOffset = 0;
	for (idx = 0; idx < dest; idx += 1) {
		xOffset += context.measureText(this.text[idx]).width;
	}
	this.pos = dest;
	x = this.left() + xOffset;
	y = this.top();
	return new Point(x, y);
};

StringMorph.prototype.slotAt = function (aPoint) {
	// answer the slot (index) closest to the given point
	// so the cursor can be moved accordingly
	var	idx = 0, charX = 0,
		context = this.image.getContext('2d');

	while (aPoint.x - this.left() > charX) {
		charX += context.measureText(this.text[idx]).width;
		idx += 1;
		if (idx === this.text.length) {
			if ((context.measureText(this.text).width -
					(context.measureText(this.text[idx - 1]).width / 2))
					< (aPoint.x - this.left())) {
				return idx;
			}
		}
	}
	return idx - 1;
};

StringMorph.prototype.upFrom = function (slot) {
	// answer the slot above the given one
	return slot;
};

StringMorph.prototype.downFrom = function (slot) {
	// answer the slot below the given one
	return slot;
};

StringMorph.prototype.startOfLine = function () {
	// answer the first slot (index) of the line for the given slot
	return 0;
};

StringMorph.prototype.endOfLine = function () {
	// answer the slot (index) indicating the EOL for the given slot
	return this.text.length;
};

// StringMorph menus:

StringMorph.prototype.developersMenu = function () {
	var menu = StringMorph.uber.developersMenu.call(this);

	menu.addLine();
	menu.addItem("edit", 'edit');
	menu.addItem(
		"font size...",
		function () {
			this.prompt(
				menu.title + '\nfont\nsize:',
				this.setFontSize,
				this,
				this.fontSize.toString(),
				null,
				6,
				500,
				true
			);
		},
		'set this String\'s\nfont point size'
	);
	if (this.fontStyle !== 'serif') {
		menu.addItem("serif", 'setSerif');
	}
	if (this.fontStyle !== 'sans-serif') {
		menu.addItem("sans-serif", 'setSansSerif');
	}
	if (this.isBold) {
		menu.addItem("normal weight", 'toggleWeight');
	} else {
		menu.addItem("bold", 'toggleWeight');
	}
	if (this.isItalic) {
		menu.addItem("normal style", 'toggleItalic');
	} else {
		menu.addItem("italic", 'toggleItalic');
	}
	return menu;
};

StringMorph.prototype.toggleIsDraggable = function () {
	// for context menu demo purposes
	this.isDraggable = !this.isDraggable;
	if (this.isDraggable) {
		this.disableSelecting();
	} else {
		this.enableSelecting();
	}
};

StringMorph.prototype.toggleWeight = function () {
	this.isBold = !this.isBold;
	this.changed();
	this.drawNew();
	this.changed();
};

StringMorph.prototype.toggleItalic = function () {
	this.isItalic = !this.isItalic;
	this.changed();
	this.drawNew();
	this.changed();
};

StringMorph.prototype.setSerif = function () {
	this.fontStyle = 'serif';
	this.changed();
	this.drawNew();
	this.changed();
};

StringMorph.prototype.setSansSerif = function () {
	this.fontStyle = 'sans-serif';
	this.changed();
	this.drawNew();
	this.changed();
};

StringMorph.prototype.setFontSize = function (size) {
	// for context menu demo purposes
	var newSize;
	if (typeof size === 'number') {
		this.fontSize = Math.round(Math.min(Math.max(size, 4), 500));
	} else {
		newSize = parseFloat(size);
		if (!isNaN(newSize)) {
			this.fontSize = Math.round(
				Math.min(Math.max(newSize, 4), 500)
			);
		}
	}
	this.changed();
	this.drawNew();
	this.changed();
};

StringMorph.prototype.setText = function (size) {
	// for context menu demo purposes
	this.text = Math.round(size).toString();
	this.changed();
	this.drawNew();
	this.changed();
};

StringMorph.prototype.numericalSetters = function () {
	// for context menu demo purposes
	return [
		'setLeft',
		'setTop',
		'setAlphaScaled',
		'setFontSize',
		'setText'
	];
};

// StringMorph editing:

StringMorph.prototype.edit = function () {
	this.root().edit(this);
};

StringMorph.prototype.selection = function () {
	var start, stop;
	start = Math.min(this.startMark, this.endMark);
	stop = Math.max(this.startMark, this.endMark);
	return this.text.slice(start, stop);
};

StringMorph.prototype.selectionStartSlot = function () {
	return Math.min(this.startMark, this.endMark);
};

StringMorph.prototype.clearSelection = function () {
	this.currentlySelecting = false;
	this.startMark = 0;
	this.endMark = 0;
	this.drawNew();
	this.changed();
};

StringMorph.prototype.deleteSelection = function () {
	var start, stop, text;
	text = this.text;
	start = Math.min(this.startMark, this.endMark);
	stop = Math.max(this.startMark, this.endMark);
	this.text = text.slice(0, start) + text.slice(stop);
	this.changed();
	this.clearSelection();
};

StringMorph.prototype.selectAll = function () {
	if (this.mouseDownLeft) { // make sure selecting is enabled
		this.startMark = 0;
		this.endMark = this.text.length;
		this.drawNew();
		this.changed();
	}
};

StringMorph.prototype.mouseClickLeft = function (pos) {
	if (this.isEditable) {
		if (!this.currentlySelecting) {
			this.edit();
		}
		this.root().cursor.gotoPos(pos);
		this.currentlySelecting = false;
	} else {
		this.escalateEvent('mouseClickLeft', pos);
	}
};

StringMorph.prototype.enableSelecting = function () {
	this.mouseDownLeft = function (pos) {
		this.clearSelection();
		if (this.isEditable && (!this.isDraggable)) {
			this.edit();
			this.root().cursor.gotoPos(pos);
			this.startMark = this.slotAt(pos);
			this.endMark = this.startMark;
			this.currentlySelecting = true;
		}
	};
	this.mouseMove = function (pos) {
		if (this.isEditable &&
				this.currentlySelecting &&
				(!this.isDraggable)) {
			var newMark = this.slotAt(pos);
			if (newMark !== this.endMark) {
				this.endMark = newMark;
				this.drawNew();
				this.changed();
			}
		}
	};
};

StringMorph.prototype.disableSelecting = function () {
	delete this.mouseDownLeft;
	delete this.mouseMove;
};

// TextMorph ///////////////////////////////////////////////////////////

// I am a multi-line, word-wrapping String

// TextMorph inherits from Morph:

TextMorph.prototype = new Morph();
TextMorph.prototype.constructor = TextMorph;
TextMorph.uber = Morph.prototype;

// TextMorph instance creation:

function TextMorph(
	text,
	fontSize,
	fontStyle,
	bold,
	italic,
	alignment,
	width
) {
	this.init(text, fontSize, fontStyle, bold, italic, alignment, width);
}

TextMorph.prototype.init = function (
	text,
	fontSize,
	fontStyle,
	bold,
	italic,
	alignment,
	width
) {
	// additional properties:
	this.text = text || (text === '' ? text : 'TextMorph');
	this.words = [];
	this.lines = [];
	this.lineSlots = [];
	this.fontSize = fontSize || 12;
	this.fontStyle = fontStyle || 'sans-serif';
	this.isBold = bold || false;
	this.isItalic = italic || false;
	this.alignment = alignment || 'left';
	this.maxWidth = width || 0;
	this.maxLineWidth = 0;
	this.backgroundColor = null;
	this.isEditable = false;

	//additional properties for ad-hoc evaluation:
	this.receiver = null;

	// additional properties for text-editing:
	this.currentlySelecting = false;
	this.startMark = 0;
	this.endMark = 0;
	this.markedTextColor = new Color(255, 255, 255);
	this.markedBackgoundColor = new Color(60, 60, 120);

	// initialize inherited properties:
	TextMorph.uber.init.call(this);

	// override inherited properites:
	this.color = new Color(0, 0, 0);
	this.noticesTransparentClick = true;
	this.drawNew();
};

TextMorph.prototype.toString = function () {
	// e.g. 'a TextMorph("Hello World")'
	return 'a TextMorph' + '("' + this.text.slice(0, 30) + '...")';
};

TextMorph.prototype.font = function () {
	// answer a font string, e.g. 'bold italic 12px sans-serif'
	var font = '';
	if (this.isBold) {
		font = font + 'bold ';
	}
	if (this.isItalic) {
		font = font + 'italic ';
	}
	return font + this.fontSize + 'px ' + this.fontStyle;
};

TextMorph.prototype.parse = function () {
	var	myself = this,
		paragraphs = this.text.split('\n'),
		canvas = newCanvas(),
		context = canvas.getContext('2d'),
		oldline = '',
		newline,
		w,
		slot = 0;

	context.font = this.font();
	this.maxLineWidth = 0;
	this.lines = [];
	this.lineSlots = [0];
	this.words = [];

	paragraphs.forEach(function (p) {
		myself.words = myself.words.concat(p.split(' '));
		myself.words.push('\n');
	});

	this.words.forEach(function (word) {
		if (word === '\n') {
			myself.lines.push(oldline);
			myself.lineSlots.push(slot);
			myself.maxLineWidth = Math.max(
				myself.maxLineWidth,
				context.measureText(oldline).width
			);
			oldline = '';
		} else {
			if (myself.maxWidth > 0) {
				newline = oldline + word + ' ';
				w = context.measureText(newline).width;
				if (w > myself.maxWidth) {
					myself.lines.push(oldline);
					myself.lineSlots.push(slot);
					myself.maxLineWidth = Math.max(
						myself.maxLineWidth,
						context.measureText(oldline).width
					);
					oldline = word + ' ';
				} else {
					oldline = newline;
				}
			} else {
				oldline = oldline + word + ' ';
			}
			slot += word.length + 1;
		}
	});
};

TextMorph.prototype.drawNew = function () {
	var context, height, i, line, width, x, y, start, stop, p, c;

	this.image = newCanvas();
	context = this.image.getContext('2d');
	context.font = this.font();
	this.parse();

	height = this.lines.length * fontHeight(this.fontSize);
	if (this.maxWidth === 0) {
		this.bounds = this.bounds.origin.extent(
			new Point(this.maxLineWidth, height)
		);
	} else {
		this.bounds = this.bounds.origin.extent(
			new Point(this.maxWidth, height)
		);
	}
	this.image.width = this.width();
	this.image.height = this.height();

	context = this.image.getContext('2d');
	if (this.backgroundColor) {
		context.fillStyle = this.backgroundColor.toString();
		context.fillRect(0, 0, this.width(), this.height());
	}
	context.fillStyle = this.color.toString();
	context.font = this.font();
	context.textAlign = 'left';
	context.textBaseline = 'bottom';

	for (i = 0; i < this.lines.length; i = i + 1) {
		line = this.lines[i];
		width = context.measureText(line).width;
		if (this.alignment === 'right') {
			x = this.width() - width;
		} else if (this.alignment === 'center') {
			x = (this.width() - width) / 2;
		} else { // 'left'
			x = 0;
		}
		y = (i + 1) * fontHeight(this.fontSize);
		context.fillText(line, x, y);
	}

	//draw the selection
	start = Math.min(this.startMark, this.endMark);
	stop = Math.max(this.startMark, this.endMark);
	for (i = start; i < stop; i += 1) {
		p = this.slotPosition(i).subtract(this.position());
		c = this.text.charAt(i);
		context.fillStyle = this.markedBackgoundColor.toString();
		context.fillRect(p.x, p.y, context.measureText(c).width + 1,
			fontHeight(this.fontSize));
		context.fillStyle = this.markedTextColor.toString();
		context.fillText(c, p.x, p.y + fontHeight(this.fontSize));
	}

	// notify my parent of layout change
	if (this.parent) {
		if (this.parent.layoutChanged) {
			this.parent.layoutChanged();
		}
	}
};

TextMorph.prototype.setExtent = function (aPoint) {
	this.maxWidth = Math.max(aPoint.x, 0);
	this.changed();
	this.drawNew();
};

// TextMorph mesuring:

TextMorph.prototype.columnRow = function (slot) {
	// answer the logical position point of the given index ("slot")
	var	row,
		col,
		idx = 0;

	for (row = 0; row < this.lines.length; row += 1) {
		idx = this.lineSlots[row];
		for (col = 0; col < this.lines[row].length; col += 1) {
			if (idx === slot) {
				return new Point(col, row);
			}
			idx += 1;
		}
	}
	// return new Point(0, 0);
	return new Point(
		this.lines[this.lines.length - 1].length - 1,
		this.lines.length - 1
	);
};

TextMorph.prototype.slotPosition = function (slot) {
	// answer the physical position point of the given index ("slot")
	// where the cursor should be placed
	var	colRow = this.columnRow(slot),
		context = this.image.getContext('2d'),
		xOffset = 0,
		yOffset,
		x,
		y,
		idx;

	yOffset = colRow.y * fontHeight(this.fontSize);
	for (idx = 0; idx < colRow.x; idx += 1) {
		xOffset += context.measureText(this.lines[colRow.y][idx]).width;
	}
	x = this.left() + xOffset;
	y = this.top() + yOffset;
	return new Point(x, y);
};

TextMorph.prototype.slotAt = function (aPoint) {
	// answer the slot (index) closest to the given point
	// so the cursor can be moved accordingly
	var	charX = 0,
		row = 0,
		col = 0,
		context = this.image.getContext('2d');

	while (aPoint.y - this.top() > (fontHeight(this.fontSize) * row)) {
		row += 1;
	}
	row = Math.max(row, 1);
	while (aPoint.x - this.left() > charX) {
		charX += context.measureText(this.lines[row - 1][col]).width;
		col += 1;
	}
	return this.lineSlots[Math.max(row - 1, 0)] + col - 1;
};

TextMorph.prototype.upFrom = function (slot) {
	// answer the slot above the given one
	var	above,
		colRow = this.columnRow(slot);
	if (colRow.y < 1) {
		return slot;
	}
    above = this.lines[colRow.y - 1];
    if (above.length < colRow.x - 1) {
        return this.lineSlots[colRow.y - 1] + above.length;
    }
    return this.lineSlots[colRow.y - 1] + colRow.x;
};

TextMorph.prototype.downFrom = function (slot) {
	// answer the slot below the given one
	var	below,
		colRow = this.columnRow(slot);
	if (colRow.y > this.lines.length - 2) {
		return slot;
	}
    below = this.lines[colRow.y + 1];
    if (below.length < colRow.x - 1) {
        return this.lineSlots[colRow.y + 1] + below.length;
    }
    return this.lineSlots[colRow.y + 1] + colRow.x;
};

TextMorph.prototype.startOfLine = function (slot) {
	// answer the first slot (index) of the line for the given slot
	return this.lineSlots[this.columnRow(slot).y];
};

TextMorph.prototype.endOfLine = function (slot) {
	// answer the slot (index) indicating the EOL for the given slot
	return this.startOfLine(slot) +
		this.lines[this.columnRow(slot).y].length - 1;
};

// TextMorph editing:

TextMorph.prototype.edit = function () {
	this.root().edit(this);
};

TextMorph.prototype.selection = function () {
	var start, stop;
	start = Math.min(this.startMark, this.endMark);
	stop = Math.max(this.startMark, this.endMark);
	return this.text.slice(start, stop);
};

TextMorph.prototype.selectionStartSlot = function () {
	return Math.min(this.startMark, this.endMark);
};

TextMorph.prototype.clearSelection = function () {
	this.currentlySelecting = false;
	this.startMark = 0;
	this.endMark = 0;
	this.drawNew();
	this.changed();
};

TextMorph.prototype.deleteSelection = function () {
	var start, stop, text;
	text = this.text;
	start = Math.min(this.startMark, this.endMark);
	stop = Math.max(this.startMark, this.endMark);
	this.text = text.slice(0, start) + text.slice(stop);
	this.changed();
	this.clearSelection();
};

TextMorph.prototype.selectAll = function () {
	this.startMark = 0;
	this.endMark = this.text.length;
	this.drawNew();
	this.changed();
};

TextMorph.prototype.selectAllAndEdit = function () {
	this.edit();
	this.selectAll();
};

TextMorph.prototype.mouseClickLeft = function (pos) {
	if (this.isEditable) {
		if (!this.currentlySelecting) {
			this.edit();
		}
		this.root().cursor.gotoPos(pos);
		this.currentlySelecting = false;
	} else {
		this.escalateEvent('mouseClickLeft', pos);
	}
};

TextMorph.prototype.enableSelecting = function () {
	this.mouseDownLeft = function (pos) {
		this.clearSelection();
		if (this.isEditable && (!this.isDraggable)) {
			this.edit();
			this.root().cursor.gotoPos(pos);
			this.startMark = this.slotAt(pos);
			this.endMark = this.startMark;
			this.currentlySelecting = true;
		}
	};
	this.mouseMove = function (pos) {
		if (this.isEditable &&
				this.currentlySelecting &&
				(!this.isDraggable)) {
			var newMark = this.slotAt(pos);
			if (newMark !== this.endMark) {
				this.endMark = newMark;
				this.drawNew();
				this.changed();
			}
		}
	};
};

TextMorph.prototype.disableSelecting = function () {
	delete this.mouseDownLeft;
	delete this.mouseMove;
};

// TextMorph menus:

TextMorph.prototype.developersMenu = function () {
	var menu = TextMorph.uber.developersMenu.call(this);
	menu.addLine();
	menu.addItem("edit", 'edit');
	menu.addItem(
		"font size...",
		function () {
			this.prompt(
				menu.title + '\nfont\nsize:',
				this.setFontSize,
				this,
				this.fontSize.toString(),
				null,
				6,
				100,
				true
			);
		},
		'set this Text\'s\nfont point size'
	);
	if (this.alignment !== 'left') {
		menu.addItem("align left", 'setAlignmentToLeft');
	}
	if (this.alignment !== 'right') {
		menu.addItem("align right", 'setAlignmentToRight');
	}
	if (this.alignment !== 'center') {
		menu.addItem("align center", 'setAlignmentToCenter');
	}
	menu.addLine();
	if (this.fontStyle !== 'serif') {
		menu.addItem("serif", 'setSerif');
	}
	if (this.fontStyle !== 'sans-serif') {
		menu.addItem("sans-serif", 'setSansSerif');
	}
	if (this.isBold) {
		menu.addItem("normal weight", 'toggleWeight');
	} else {
		menu.addItem("bold", 'toggleWeight');
	}
	if (this.isItalic) {
		menu.addItem("normal style", 'toggleItalic');
	} else {
		menu.addItem("italic", 'toggleItalic');
	}
	return menu;
};

TextMorph.prototype.toggleIsDraggable = function () {
	// for context menu demo purposes
	this.isDraggable = !this.isDraggable;
	if (this.isDraggable) {
		this.disableSelecting();
	} else {
		this.enableSelecting();
	}
};

TextMorph.prototype.setAlignmentToLeft = function () {
	this.alignment = 'left';
	this.drawNew();
	this.changed();
};

TextMorph.prototype.setAlignmentToRight = function () {
	this.alignment = 'right';
	this.drawNew();
	this.changed();
};

TextMorph.prototype.setAlignmentToCenter = function () {
	this.alignment = 'center';
	this.drawNew();
	this.changed();
};

TextMorph.prototype.toggleWeight = function () {
	this.isBold = !this.isBold;
	this.changed();
	this.drawNew();
	this.changed();
};

TextMorph.prototype.toggleItalic = function () {
	this.isItalic = !this.isItalic;
	this.changed();
	this.drawNew();
	this.changed();
};

TextMorph.prototype.setSerif = function () {
	this.fontStyle = 'serif';
	this.changed();
	this.drawNew();
	this.changed();
};

TextMorph.prototype.setSansSerif = function () {
	this.fontStyle = 'sans-serif';
	this.changed();
	this.drawNew();
	this.changed();
};

TextMorph.prototype.setText = function (size) {
	// for context menu demo purposes
	this.text = Math.round(size).toString();
	this.changed();
	this.drawNew();
	this.changed();
};

TextMorph.prototype.setFontSize = function (size) {
	// for context menu demo purposes
	var newSize;
	if (typeof size === 'number') {
		this.fontSize = Math.round(Math.min(Math.max(size, 4), 500));
	} else {
		newSize = parseFloat(size);
		if (!isNaN(newSize)) {
			this.fontSize = Math.round(
				Math.min(Math.max(newSize, 4), 500)
			);
		}
	}
	this.changed();
	this.drawNew();
	this.changed();
};

TextMorph.prototype.numericalSetters = function () {
	// for context menu demo purposes
	return [
		'setLeft',
		'setTop',
		'setAlphaScaled',
		'setFontSize',
		'setText'
	];
};

// TextMorph evaluation:

TextMorph.prototype.evaluationMenu = function () {
	var menu = new MenuMorph(this, null);
	menu.addItem(
		"do it",
		'doIt',
		'evaluate the\nselected expression'
	);
	menu.addItem(
		"show it",
		'showIt',
		'evaluate the\nselected expression\nand show the result'
	);
	menu.addItem(
		"inspect it",
		'inspectIt',
		'evaluate the\nselected expression\nand inspect the result'
	);
	menu.addLine();
	menu.addItem("select all", 'selectAllAndEdit');
	return menu;
};

TextMorph.prototype.setReceiver = function (obj) {
	this.receiver = obj;
	this.customContextMenu = this.evaluationMenu();
};

TextMorph.prototype.doIt = function () {
	this.receiver.evaluateString(this.selection());
	this.edit();
};

TextMorph.prototype.showIt = function () {
	var result = this.receiver.evaluateString(this.selection());
	if (result !== null) {
		this.inform(result);
	}
};

TextMorph.prototype.inspectIt = function () {
	var	result = this.receiver.evaluateString(this.selection()),
		world = this.world(),
		inspector;
	if (result !== null) {
		inspector = new InspectorMorph(result);
		inspector.setPosition(world.hand.position());
		inspector.keepWithin(world);
		world.add(inspector);
		inspector.changed();
	}
};

// TriggerMorph ////////////////////////////////////////////////////////

// I provide basic button functionality

// TriggerMorph inherits from Morph:

TriggerMorph.prototype = new Morph();
TriggerMorph.prototype.constructor = TriggerMorph;
TriggerMorph.uber = Morph.prototype;

// TriggerMorph instance creation:

function TriggerMorph(
	target,
	action,
	labelString,
	fontSize,
	fontStyle,
	environment,
	hint,
    labelColor
) {
	this.init(
		target,
		action,
		labelString,
		fontSize,
		fontStyle,
		environment,
		hint,
        labelColor
	);
}

TriggerMorph.prototype.init = function (
	target,
	action,
	labelString,
	fontSize,
	fontStyle,
	environment,
	hint,
    labelColor
) {
	// additional properties:
	this.target = target || null;
	this.action = action || null;
	this.environment = environment || null;
	this.labelString = labelString || null;
	this.label = null;
	this.hint = hint || null;
	this.fontSize = fontSize || MorphicPreferences.menuFontSize;
	this.fontStyle = fontStyle || 'sans-serif';
	this.highlightColor = new Color(192, 192, 192);
	this.pressColor = new Color(128, 128, 128);
    this.labelColor = labelColor || new Color(0, 0, 0);

	// initialize inherited properties:
	TriggerMorph.uber.init.call(this);

	// override inherited properites:
	this.color = new Color(255, 255, 255);
	this.drawNew();
};

// TriggerMorph drawing:

TriggerMorph.prototype.drawNew = function () {
	this.createBackgrounds();
	if (this.labelString !== null) {
		this.createLabel();
	}
};

TriggerMorph.prototype.createBackgrounds = function () {
	var	context,
		ext = this.extent();

	this.normalImage = newCanvas(ext);
	context = this.normalImage.getContext('2d');
	context.fillStyle = this.color.toString();
	context.fillRect(0, 0, ext.x, ext.y);

	this.highlightImage = newCanvas(ext);
	context = this.highlightImage.getContext('2d');
	context.fillStyle = this.highlightColor.toString();
	context.fillRect(0, 0, ext.x, ext.y);

	this.pressImage = newCanvas(ext);
	context = this.pressImage.getContext('2d');
	context.fillStyle = this.pressColor.toString();
	context.fillRect(0, 0, ext.x, ext.y);

	this.image = this.normalImage;
};

TriggerMorph.prototype.createLabel = function () {
	if (this.label !== null) {
		this.label.destroy();
	}
	this.label = new StringMorph(
		this.labelString,
		this.fontSize,
		this.fontStyle,
        false, // bold
        false, // italic
        false, // numeric
        null, // shadow offset
        null, // shadow color
        this.labelColor
	);
	this.label.setPosition(
		this.center().subtract(
			this.label.extent().floorDivideBy(2)
		)
	);
	this.add(this.label);
};

// TriggerMorph duplicating:

TriggerMorph.prototype.copyRecordingReferences = function (dict) {
	// inherited, see comment in Morph
	var	c = TriggerMorph.uber.copyRecordingReferences.call(
		this,
		dict
	);
	if (c.label && dict[this.label]) {
		c.label = (dict[this.label]);
	}
	return c;
};

// TriggerMorph action:

TriggerMorph.prototype.trigger = function () {
	/*
	if target is a function, use it as callback:
	execute target as callback function with action as argument
	in the environment as optionally specified.
	Note: if action is also a function, instead of becoming
	the argument itself it will be called to answer the argument.
	for selections, Yes/No Choices etc:

	else (if target is not a function):

		if action is a function:
		execute the action with target as environment (can be null)
		for lambdafied (inline) actions

		else if action is a String:
		treat it as function property of target and execute it
		for selector-like actions
	*/
	if (typeof this.target === 'function') {
		if (typeof this.action === 'function') {
			this.target.call(this.environment, this.action.call());
		} else {
			this.target.call(this.environment, this.action);
		}
	} else {
		if (typeof this.action === 'function') {
			this.action.call(this.target);
		} else { // assume it's a String
			this.target[this.action].call(this.target);
		}
	}
};

// TriggerMorph events:

TriggerMorph.prototype.mouseEnter = function () {
	this.image = this.highlightImage;
	this.changed();
	if (this.hint) {
		this.bubbleHelp(this.hint);
	}
};

TriggerMorph.prototype.mouseLeave = function () {
	this.image = this.normalImage;
	this.changed();
	if (this.hint) {
		this.world().hand.destroyTemporaries();
	}
};

TriggerMorph.prototype.mouseDownLeft = function () {
	this.image = this.pressImage;
	this.changed();
};

TriggerMorph.prototype.mouseClickLeft = function () {
	this.image = this.highlightImage;
	this.changed();
	this.trigger();
};

// TriggerMorph bubble help:

TriggerMorph.prototype.bubbleHelp = function (contents) {
	var myself = this;
	this.fps = 2;
	this.step = function () {
		if (this.bounds.containsPoint(this.world().hand.position())) {
			myself.popUpbubbleHelp(contents);
		}
		myself.fps = 0;
		delete myself.step;
	};
};

TriggerMorph.prototype.popUpbubbleHelp = function (contents) {
	new SpeechBubbleMorph(
		contents,
		null,
		null,
		1
	).popUp(this.world(), this.rightCenter().add(new Point(-8, 0)));
};

// MenuItemMorph ///////////////////////////////////////////////////////

// I automatically determine my bounds

var MenuItemMorph;

// MenuItemMorph inherits from TriggerMorph:

MenuItemMorph.prototype = new TriggerMorph();
MenuItemMorph.prototype.constructor = MenuItemMorph;
MenuItemMorph.uber = TriggerMorph.prototype;

// MenuItemMorph instance creation:

function MenuItemMorph(
	target,
	action,
	labelString,
	fontSize,
	fontStyle,
	environment,
	hint,
    color
) {
	this.init(
		target,
		action,
		labelString,
		fontSize,
		fontStyle,
		environment,
		hint,
        color
	);
}

MenuItemMorph.prototype.createLabel = function () {
	var np;
	if (this.label !== null) {
		this.label.destroy();
	}
	this.label = new StringMorph(
		this.labelString,
		this.fontSize,
		this.fontStyle,
        false, // bold
        false, // italic
        false, // numeric
        null, // shadow offset
        null, // shadow color
        this.labelColor
	);
	this.silentSetExtent(this.label.extent().add(new Point(8, 0)));
	np = this.position().add(new Point(4, 0));
	this.label.bounds = np.extent(this.label.extent());
	this.add(this.label);
};

// MenuItemMorph events:

MenuItemMorph.prototype.mouseEnter = function () {
	if (!this.isListItem()) {
		this.image = this.highlightImage;
		this.changed();
	}
	if (this.hint) {
		this.bubbleHelp(this.hint);
	}
};

MenuItemMorph.prototype.mouseLeave = function () {
	if (!this.isListItem()) {
		this.image = this.normalImage;
		this.changed();
	}
	if (this.hint) {
		this.world().hand.destroyTemporaries();
	}
};

MenuItemMorph.prototype.mouseDownLeft = function (pos) {
	if (this.isListItem()) {
		this.parent.unselectAllItems();
		this.escalateEvent('mouseDownLeft', pos);
	}
	this.image = this.pressImage;
	this.changed();
};

MenuItemMorph.prototype.mouseMove = function () {
	if (this.isListItem()) {
		this.escalateEvent('mouseMove');
	}
};

MenuItemMorph.prototype.mouseClickLeft = function () {
	if (!this.isListItem()) {
		this.parent.destroy();
		this.root().activeMenu = null;
	}
	this.trigger();
};

MenuItemMorph.prototype.isListItem = function () {
	if (this.parent) {
		return this.parent.isListContents;
	}
	return false;
};

MenuItemMorph.prototype.isSelectedListItem = function () {
	if (this.isListItem()) {
		return this.image === this.pressImage;
	}
	return false;
};

// FrameMorph //////////////////////////////////////////////////////////

// I clip my submorphs at my bounds

// Frames inherit from Morph:

FrameMorph.prototype = new Morph();
FrameMorph.prototype.constructor = FrameMorph;
FrameMorph.uber = Morph.prototype;

function FrameMorph(aScrollFrame) {
	this.init(aScrollFrame);
}

FrameMorph.prototype.init = function (aScrollFrame) {
	this.scrollFrame = aScrollFrame || null;

	FrameMorph.uber.init.call(this);
	this.color = new Color(255, 250, 245);
	this.drawNew();
	this.acceptsDrops = true;

	if (this.scrollFrame) {
		this.isDraggable = false;
		this.noticesTransparentClick = false;
		this.alpha = 0;
	}
};

FrameMorph.prototype.fullBounds = function () {
	var shadow = this.getShadow();
	if (shadow !== null) {
		return this.bounds.merge(shadow.bounds);
	}
    return this.bounds;
};

FrameMorph.prototype.fullImage = function () {
	// use only for shadows
	return this.image;
};

FrameMorph.prototype.fullDrawOn = function (aCanvas, aRect) {
	var myself = this, rectangle;
	if (!this.isVisible) {
		return null;
	}
	rectangle = aRect || this.fullBounds();
	this.drawOn(aCanvas, rectangle);
	this.children.forEach(function (child) {
		if (child instanceof ShadowMorph) {
			child.fullDrawOn(aCanvas, rectangle);
		} else {
			child.fullDrawOn(
				aCanvas,
				myself.bounds.intersect(rectangle)
			);
		}
	});
};

// FrameMorph scrolling optimization:

FrameMorph.prototype.moveBy = function (delta) {
	this.changed();
	this.bounds = this.bounds.translateBy(delta);
	this.children.forEach(function (child) {
		child.silentMoveBy(delta);
	});
	this.changed();
};

// FrameMorph scrolling support:

FrameMorph.prototype.submorphBounds = function () {
	var result = null;

	if (this.children.length > 0) {
		result = this.children[0].bounds;
		this.children.forEach(function (child) {
			result = result.merge(child.fullBounds());
		});
	}
	return result;
};

FrameMorph.prototype.keepInScrollFrame = function () {
	if (this.scrollFrame === null) {
		return null;
	}
	if (this.left() > this.scrollFrame.left()) {
		this.moveBy(
			new Point(this.scrollFrame.left() - this.left(), 0)
		);
	}
	if (this.right() < this.scrollFrame.right()) {
		this.moveBy(
			new Point(this.scrollFrame.right() - this.right(), 0)
		);
	}
	if (this.top() > this.scrollFrame.top()) {
		this.moveBy(
			new Point(0, this.scrollFrame.top() - this.top())
		);
	}
	if (this.bottom() < this.scrollFrame.bottom()) {
		this.moveBy(
			0,
			new Point(this.scrollFrame.bottom() - this.bottom(), 0)
		);
	}
};

FrameMorph.prototype.adjustBounds = function () {
	var	subBounds,
		newBounds,
		myself = this;

	if (this.scrollFrame === null) {
		return null;
	}

	subBounds = this.submorphBounds();
	if (subBounds && (!this.scrollFrame.isTextLineWrapping)) {
		newBounds = subBounds
			.expandBy(this.scrollFrame.padding)
			.merge(this.scrollFrame.bounds);
	} else {
		newBounds = this.scrollFrame.bounds.copy();
	}
	if (!this.bounds.eq(newBounds)) {
		this.bounds = newBounds;
		this.drawNew();
		this.keepInScrollFrame();
	}

	if (this.scrollFrame.isTextLineWrapping) {
		this.children.forEach(function (morph) {
			if (morph instanceof TextMorph) {
				morph.setWidth(myself.width());
				myself.setHeight(
					Math.max(morph.height(), myself.scrollFrame.height())
				);
			}
		});
	}

	this.scrollFrame.adjustScrollBars();
};

// FrameMorph dragging & dropping of contents:

FrameMorph.prototype.reactToDropOf = function () {
	this.adjustBounds();
};

FrameMorph.prototype.reactToGrabOf = function () {
	this.adjustBounds();
};

// FrameMorph duplicating:

FrameMorph.prototype.copyRecordingReferences = function (dict) {
	// inherited, see comment in Morph
	var	c = FrameMorph.uber.copyRecordingReferences.call(
		this,
		dict
	);
	if (c.frame && dict[this.scrollFrame]) {
		c.frame = (dict[this.scrollFrame]);
	}
	return c;
};

// FrameMorph menus:

FrameMorph.prototype.developersMenu = function () {
	var menu = FrameMorph.uber.developersMenu.call(this);
	if (this.children.length > 0) {
		menu.addLine();
		menu.addItem(
			"move all inside...",
			'keepAllSubmorphsWithin',
			'keep all submorphs\nwithin and visible'
		);
	}
	return menu;
};

FrameMorph.prototype.keepAllSubmorphsWithin = function () {
	var myself = this;
	this.children.forEach(function (m) {
		m.keepWithin(myself);
	});
};

// ScrollFrameMorph ////////////////////////////////////////////////////

ScrollFrameMorph.prototype = new FrameMorph();
ScrollFrameMorph.prototype.constructor = ScrollFrameMorph;
ScrollFrameMorph.uber = FrameMorph.prototype;

function ScrollFrameMorph(scroller, size, sliderColor) {
	this.init(scroller, size, sliderColor);
}

ScrollFrameMorph.prototype.init = function (scroller, size, sliderColor) {
	var myself = this;

	ScrollFrameMorph.uber.init.call(this);
	this.scrollBarSize = size || MorphicPreferences.scrollBarSize;
	this.autoScrollTrigger = null;
	this.isScrollingByDragging = true;	// change if desired
	this.hasVelocity = true; // dto.
	this.padding = 0; // around the scrollable area
	this.isTextLineWrapping = false;
	this.contents = scroller || new FrameMorph(this);
	this.add(this.contents);
	this.hBar = new SliderMorph(
		null, // start
		null, // stop
		null, // value
		null, // size
		'horizontal',
        sliderColor
	);
	this.hBar.setHeight(this.scrollBarSize);
	this.hBar.action = function (num) {
		myself.contents.setPosition(
			new Point(
				myself.left() - num,
				myself.contents.position().y
			)
		);
	};
	this.hBar.isDraggable = false;
	this.add(this.hBar);
	this.vBar = new SliderMorph(
		null, // start
		null, // stop
		null, // value
		null, // size
		'vertical',
        sliderColor
	);
	this.vBar.setWidth(this.scrollBarSize);
	this.vBar.action = function (num) {
		myself.contents.setPosition(
			new Point(
				myself.contents.position().x,
				myself.top() - num
			)
		);
	};
	this.vBar.isDraggable = false;
	this.add(this.vBar);
};

ScrollFrameMorph.prototype.adjustScrollBars = function () {
	var	hWidth = this.width() - this.scrollBarSize,
		vHeight = this.height() - this.scrollBarSize;

	this.changed();
	if (this.contents.width() > this.width() +
			MorphicPreferences.scrollBarSize) {
		this.hBar.show();
		if (this.hBar.width() !== hWidth) {
			this.hBar.setWidth(hWidth);
		}

		this.hBar.setPosition(
			new Point(
				this.left(),
				this.bottom() - this.hBar.height()
			)
		);
		this.hBar.start = 0;
		this.hBar.stop = this.contents.width() - this.width();
		this.hBar.size =
			this.width() / this.contents.width() * this.hBar.stop;
		this.hBar.value = this.left() - this.contents.left();
		this.hBar.drawNew();
	} else {
		this.hBar.hide();
	}

	if (this.contents.height() > this.height() +
			this.scrollBarSize) {
		this.vBar.show();
		if (this.vBar.height() !== vHeight) {
			this.vBar.setHeight(vHeight);
		}

		this.vBar.setPosition(
			new Point(
				this.right() - this.vBar.width(),
				this.top()
			)
		);
		this.vBar.start = 0;
		this.vBar.stop = this.contents.height() - this.height();
		this.vBar.size =
			this.height() / this.contents.height() * this.vBar.stop;
		this.vBar.value = this.top() - this.contents.top();
		this.vBar.drawNew();
	} else {
		this.vBar.hide();
	}
};

ScrollFrameMorph.prototype.addContents = function (aMorph) {
	this.contents.add(aMorph);
	this.contents.adjustBounds();
};

ScrollFrameMorph.prototype.setContents = function (aMorph) {
	this.contents.children.forEach(function (m) {
		m.destroy();
	});
	this.contents.children = [];
	aMorph.setPosition(this.position().add(new Point(2, 2)));
	this.addContents(aMorph);
};

ScrollFrameMorph.prototype.setExtent = function (aPoint) {
	if (this.isTextLineWrapping) {
		this.contents.setPosition(this.position().copy());
	}
	ScrollFrameMorph.uber.setExtent.call(this, aPoint);
	this.contents.adjustBounds();
};

// ScrollFrameMorph scrolling by dragging:

ScrollFrameMorph.prototype.scrollX = function (steps) {
	var cl = this.contents.left(),
		l = this.left(),
		cw = this.contents.width(),
		r = this.right(),
		newX;

	newX = cl + steps;
	if (newX > l) {
		newX = l;
	}
	if (newX + cw < r) {
		newX = r - cw;
	}
	if (newX !== cl) {
		this.contents.setLeft(newX);
	}
};

ScrollFrameMorph.prototype.scrollY = function (steps) {
	var	ct = this.contents.top(),
		t = this.top(),
		ch = this.contents.height(),
		b = this.bottom(),
		newY;

	newY = ct + steps;
	if (newY > t) {
		newY = t;
	}
	if (newY + ch < b) {
		newY = b - ch;
	}
	if (newY !== ct) {
		this.contents.setTop(newY);
	}
};

ScrollFrameMorph.prototype.step = function () {
	nop();
};

ScrollFrameMorph.prototype.mouseDownLeft = function (pos) {
	if (!this.isScrollingByDragging) {
		return null;
	}
	var	world = this.root(),
		oldPos = pos,
		myself = this,
		deltaX = 0,
		deltaY = 0,
		friction = 0.8;

	this.step = function () {
		var newPos;
		if (world.hand.mouseButton &&
				(world.hand.children.length === 0) &&
				(myself.bounds.containsPoint(world.hand.position()))) {
			newPos = world.hand.bounds.origin;
			deltaX = newPos.x - oldPos.x;
			if (deltaX !== 0) {
				myself.scrollX(deltaX);
			}
			deltaY = newPos.y - oldPos.y;
			if (deltaY !== 0) {
				myself.scrollY(deltaY);
			}
			oldPos = newPos;
		} else {
			if (!myself.hasVelocity) {
				myself.step = function () {
					nop();
				};
			} else {
				if ((Math.abs(deltaX) < 0.5) &&
						(Math.abs(deltaY) < 0.5)) {
					myself.step = function () {
						nop();
					};
				} else {
					deltaX = deltaX * friction;
					myself.scrollX(Math.round(deltaX));
					deltaY = deltaY * friction;
					myself.scrollY(Math.round(deltaY));
				}
			}
		}
		this.adjustScrollBars();
	};
};

ScrollFrameMorph.prototype.startAutoScrolling = function () {
	var	myself = this,
		inset = MorphicPreferences.scrollBarSize * 3,
		world = this.world(),
		hand,
		inner,
		pos;

	if (!world) {
		return null;
	}
	hand = world.hand;
	if (!this.autoScrollTrigger) {
		this.autoScrollTrigger = Date.now();
	}
	this.step = function () {
		pos = hand.bounds.origin;
		inner = myself.bounds.insetBy(inset);
		if ((myself.bounds.containsPoint(pos))
				&& (!(inner.containsPoint(pos)))
				&& (hand.children.length > 0)) {
			myself.autoScroll(pos);
		} else {
			myself.step = function () {
				nop();
			};
			myself.autoScrollTrigger = null;
		}
	};
};

ScrollFrameMorph.prototype.autoScroll = function (pos) {
	var inset, area;

	if (Date.now() - this.autoScrollTrigger < 500) {
		return null;
	}

	inset = MorphicPreferences.scrollBarSize * 3;
	area = this.topLeft().extent(new Point(this.width(), inset));
	if (area.containsPoint(pos)) {
		this.scrollY(inset - (pos.y - this.top()));
	}
	area = this.topLeft().extent(new Point(inset, this.height()));
	if (area.containsPoint(pos)) {
		this.scrollX(inset - (pos.x - this.left()));
	}
	area = (new Point(this.right() - inset, this.top()))
		.extent(new Point(inset, this.height()));
	if (area.containsPoint(pos)) {
		this.scrollX(-(inset - (this.right() - pos.x)));
	}
	area = (new Point(this.left(), this.bottom() - inset))
		.extent(new Point(this.width(), inset));
	if (area.containsPoint(pos)) {
		this.scrollY(-(inset - (this.bottom() - pos.y)));
	}
	this.adjustScrollBars();
};

// ScrollFrameMorph events:

ScrollFrameMorph.prototype.mouseScroll = function (y, x) {
    if (y) {
        this.scrollY(y * MorphicPreferences.mouseScrollAmount);
    }
    if (x) {
        this.scrollX(x * MorphicPreferences.mouseScrollAmount);
    }
	this.adjustScrollBars();
};

// ScrollFrameMorph duplicating:

ScrollFrameMorph.prototype.copyRecordingReferences = function (dict) {
	// inherited, see comment in Morph
	var	c = ScrollFrameMorph.uber.copyRecordingReferences.call(
		this,
		dict
	);
	if (c.contents && dict[this.contents]) {
		c.contents = (dict[this.contents]);
	}
	if (c.hBar && dict[this.hBar]) {
		c.hBar = (dict[this.hBar]);
		c.hBar.action = function (num) {
			c.contents.setPosition(
				new Point(c.left() - num, c.contents.position().y)
			);
		};
	}
	if (c.vBar && dict[this.vBar]) {
		c.vBar = (dict[this.vBar]);
		c.vBar.action = function (num) {
			c.contents.setPosition(
				new Point(c.contents.position().x, c.top() - num)
			);
		};
	}
	return c;
};

// ScrollFrameMorph menu:

ScrollFrameMorph.prototype.developersMenu = function () {
	var menu = ScrollFrameMorph.uber.developersMenu.call(this);
	if (this.isTextLineWrapping) {
		menu.addItem(
			"auto line wrap off...",
			'toggleTextLineWrapping',
			'turn automatic\nline wrapping\noff'
		);
	} else {
		menu.addItem(
			"auto line wrap on...",
			'toggleTextLineWrapping',
			'enable automatic\nline wrapping'
		);
	}
	return menu;
};


ScrollFrameMorph.prototype.toggleTextLineWrapping = function () {
	this.isTextLineWrapping = !this.isTextLineWrapping;
};

// ListMorph ///////////////////////////////////////////////////////////

ListMorph.prototype = new ScrollFrameMorph();
ListMorph.prototype.constructor = ListMorph;
ListMorph.uber = ScrollFrameMorph.prototype;

function ListMorph(elements, labelGetter, format) {
/*
    passing a format is optional. If the format parameter is specified
    it has to be of the following pattern:

        [
            [<color>, <single-argument predicate>],
            ...
        ]

    multiple color conditions can be passed in such a format list, the
    last predicate to evaluate true when given the list element sets
    the given color. If no condition is met, the default color (black)
    will be assigned.
    
    An example of how to use fomats can be found in the InspectorMorph's
    "markOwnProperties" mechanism.
*/
	this.init(
		elements || [],
		labelGetter || function (element) {
			if (isString(element)) {
				return element;
			}
            if (element.toSource) {
				return element.toSource();
			}
            return element.toString();
		},
        format || []
	);
}

ListMorph.prototype.init = function (elements, labelGetter, format) {
	ListMorph.uber.init.call(this);

	this.contents.acceptsDrops = false;
	this.color = new Color(255, 255, 255);
	this.hBar.alpha = 0.6;
	this.vBar.alpha = 0.6;
	this.elements = elements || [];
	this.labelGetter = labelGetter;
    this.format = format;
	this.listContents = null;
	this.selected = null;
	this.action = null;
	this.acceptsDrops = false;
	this.buildListContents();
};

ListMorph.prototype.buildListContents = function () {
	var myself = this;
	if (this.listContents) {
		this.listContents.destroy();
	}
	this.listContents = new MenuMorph(
		this.select,
		null,
		this
	);
	if (this.elements.length === 0) {
		this.elements = ['(empty)'];
	}
	this.elements.forEach(function (element) {
        var color = null;

        myself.format.forEach(function (pair) {
            if (pair[1].call(null, element)) {
                color = pair[0];
            }
        });
		myself.listContents.addItem(
			myself.labelGetter.call(myself, element), // label string
			element, // action
            null, // hint
            color
		);
	});
	this.listContents.setPosition(this.contents.position());
	this.listContents.isListContents = true;
	this.listContents.drawNew();
	this.addContents(this.listContents);
};

ListMorph.prototype.select = function (item) {
	this.selected = item;
	if (this.action) {
		this.action.call(null, item);
	}
};

ListMorph.prototype.setExtent = function (aPoint) {
	var	lb = this.listContents.bounds,
		nb = this.bounds.origin.copy().corner(
			this.bounds.origin.add(aPoint)
		);

	if (nb.right() > lb.right() && nb.width() <= lb.width()) {
		this.listContents.setRight(nb.right());
	}
	if (nb.bottom() > lb.bottom() && nb.height() <= lb.height()) {
		this.listContents.setBottom(nb.bottom());
	}
	ListMorph.uber.setExtent.call(this, aPoint);
};

// StringFieldMorph ////////////////////////////////////////////////////

// StringFieldMorph inherit from FrameMorph:

StringFieldMorph.prototype = new FrameMorph();
StringFieldMorph.prototype.constructor = StringFieldMorph;
StringFieldMorph.uber = FrameMorph.prototype;

function StringFieldMorph(
	defaultContents,
	minWidth,
	fontSize,
	fontStyle,
	bold,
	italic,
	isNumeric
) {
	this.init(
		defaultContents || '',
		minWidth || 100,
		fontSize || 12,
		fontStyle || 'sans-serif',
		bold || false,
		italic || false,
		isNumeric
	);
}

StringFieldMorph.prototype.init = function (
	defaultContents,
	minWidth,
	fontSize,
	fontStyle,
	bold,
	italic,
	isNumeric
) {
	this.defaultContents = defaultContents;
	this.minWidth = minWidth;
	this.fontSize = fontSize;
	this.fontStyle = fontStyle;
	this.isBold = bold;
	this.isItalic = italic;
	this.isNumeric = isNumeric || false;
	this.text = null;
	StringFieldMorph.uber.init.call(this);
	this.color = new Color(255, 255, 255);
	this.isEditable = true;
	this.acceptsDrops = false;
	this.drawNew();
};

StringFieldMorph.prototype.drawNew = function () {
	var txt;
	txt = this.text ? this.string() : this.defaultContents;
	this.text = null;
	this.children.forEach(function (child) {
		child.destroy();
	});
	this.children = [];
	this.text = new StringMorph(
		txt,
		this.fontSize,
		this.fontStyle,
		this.isBold,
		this.isItalic,
		this.isNumeric
	);

	this.text.isNumeric = this.isNumeric; // for whichever reason...
	this.text.setPosition(this.bounds.origin.copy());
	this.text.isEditable = this.isEditable;
	this.text.isDraggable = false;
	this.text.enableSelecting();
	this.silentSetExtent(
		new Point(
			Math.max(this.width(), this.minWidth),
			this.text.height()
		)
	);
	StringFieldMorph.uber.drawNew.call(this);
	this.add(this.text);
};

StringFieldMorph.prototype.string = function () {
	return this.text.text;
};

StringFieldMorph.prototype.mouseClickLeft = function () {
	if (this.isEditable) {
		this.text.edit();
	}
};

// StringFieldMorph duplicating:

StringFieldMorph.prototype.copyRecordingReferences = function (dict) {
	// inherited, see comment in Morph
	var	c = StringFieldMorph.uber.copyRecordingReferences.call(
		this,
		dict
	);
	if (c.text && dict[this.text]) {
		c.text = (dict[this.text]);
	}
	return c;
};

// BouncerMorph ////////////////////////////////////////////////////////

// I am a Demo of a stepping custom Morph

var BouncerMorph;

// Bouncers inherit from Morph:

BouncerMorph.prototype = new Morph();
BouncerMorph.prototype.constructor = BouncerMorph;
BouncerMorph.uber = Morph.prototype;

// BouncerMorph instance creation:

function BouncerMorph() {
	this.init();
}

// BouncerMorph initialization:

BouncerMorph.prototype.init = function (type, speed) {
	BouncerMorph.uber.init.call(this);
	this.fps = 50;

	// additional properties:
	this.isStopped = false;
	this.type = type || 'vertical';
	if (this.type === 'vertical') {
		this.direction = 'down';
	} else {
		this.direction = 'right';
	}
	this.speed = speed || 1;
};

// BouncerMorph moving:

BouncerMorph.prototype.moveUp = function () {
	this.moveBy(new Point(0, -this.speed));
};

BouncerMorph.prototype.moveDown = function () {
	this.moveBy(new Point(0, this.speed));
};

BouncerMorph.prototype.moveRight = function () {
	this.moveBy(new Point(this.speed, 0));
};

BouncerMorph.prototype.moveLeft = function () {
	this.moveBy(new Point(-this.speed, 0));
};

// BouncerMorph stepping:

BouncerMorph.prototype.step = function () {
	if (!this.isStopped) {
		if (this.type === 'vertical') {
			if (this.direction === 'down') {
				this.moveDown();
			} else {
				this.moveUp();
			}
			if (this.fullBounds().top() < this.parent.top() &&
					this.direction === 'up') {
				this.direction = 'down';
			}
			if (this.fullBounds().bottom() > this.parent.bottom() &&
					this.direction === 'down') {
				this.direction = 'up';
			}
		} else if (this.type === 'horizontal') {
			if (this.direction === 'right') {
				this.moveRight();
			} else {
				this.moveLeft();
			}
			if (this.fullBounds().left() < this.parent.left() &&
					this.direction === 'left') {
				this.direction = 'right';
			}
			if (this.fullBounds().right() > this.parent.right() &&
					this.direction === 'right') {
				this.direction = 'left';
			}
		}
	}
};

// HandMorph ///////////////////////////////////////////////////////////

// I represent the Mouse cursor

// HandMorph inherits from Morph:

HandMorph.prototype = new Morph();
HandMorph.prototype.constructor = HandMorph;
HandMorph.uber = Morph.prototype;

// HandMorph instance creation:

function HandMorph(aWorld) {
	this.init(aWorld);
}

// HandMorph initialization:

HandMorph.prototype.init = function (aWorld) {
	HandMorph.uber.init.call(this);
	this.bounds = new Rectangle();

	// additional properties:
	this.world = aWorld;
	this.mouseButton = null;
	this.mouseOverList = [];
	this.mouseDownMorph = null;
	this.morphToGrab = null;
	this.temporaries = [];
};

HandMorph.prototype.changed = function () {
	var	b;
	if (this.world !== null) {
		b = this.fullBounds();
		if (!b.extent().eq(new Point())) {
			this.world.broken.push(this.fullBounds().spread());
		}
	}

};

// HandMorph navigation:

HandMorph.prototype.morphAtPointer = function () {
	var	morphs = this.world.allChildren().slice(0).reverse(),
		myself = this,
		result = null;

	morphs.forEach(function (m) {
		if (m.visibleBounds().containsPoint(myself.bounds.origin) &&
				result === null &&
				m.isVisible &&
				(m.noticesTransparentClick ||
					(!m.isTransparentAt(myself.bounds.origin))) &&
				(!(m instanceof ShadowMorph))) {
			result = m;
		}
	});
	if (result !== null) {
		return result;
	}
    return this.world;
};

/*
	alternative -  more elegant and possibly more
	performant - solution for morphAtPointer.
	Has some issues, commented out for now

HandMorph.prototype.morphAtPointer = function () {
	var myself = this;
	return this.world.topMorphSuchThat(function (m) {
		return m.visibleBounds().containsPoint(myself.bounds.origin) &&
			m.isVisible &&
			(m.noticesTransparentClick ||
				(! m.isTransparentAt(myself.bounds.origin))) &&
			(! (m instanceof ShadowMorph));
	});
};
*/

HandMorph.prototype.allMorphsAtPointer = function () {
	var	morphs = this.world.allChildren(),
		myself = this;
	return morphs.filter(function (m) {
		return m.isVisible &&
			m.visibleBounds().containsPoint(myself.bounds.origin);
	});
};

// HandMorph dragging and dropping:
/*
	drag 'n' drop events, method(arg) -> receiver:

		prepareToBeGrabbed(handMorph) -> grabTarget
		reactToGrabOf(grabbedMorph) -> oldParent
		wantsDropOf(morphToDrop) ->  newParent
		justDropped(handMorph) -> droppedMorph
		reactToDropOf(droppedMorph) -> newParent
*/

HandMorph.prototype.dropTargetFor = function (aMorph) {
	var target = this.morphAtPointer();
	while (!target.wantsDropOf(aMorph)) {
		target = target.parent;
	}
	return target;
};

HandMorph.prototype.grab = function (aMorph) {
	var oldParent = aMorph.parent;
	if (aMorph instanceof WorldMorph) {
		return null;
	}
    if (this.children.length === 0) {
		this.world.stopEditing();
		aMorph.addShadow();
		if (aMorph.prepareToBeGrabbed) {
			aMorph.prepareToBeGrabbed(this);
		}
		this.add(aMorph);
		this.changed();
		if (oldParent && oldParent.reactToGrabOf) {
			oldParent.reactToGrabOf(aMorph);
		}
	}
};

HandMorph.prototype.drop = function () {
	var target, morphToDrop;
	if (this.children.length !== 0) {
		morphToDrop = this.children[0];
		target = this.dropTargetFor(morphToDrop);
		this.changed();
		target.add(morphToDrop);
		morphToDrop.changed();
		morphToDrop.removeShadow();
		this.children = [];
		this.setExtent(new Point());
		if (morphToDrop.justDropped) {
			morphToDrop.justDropped(this);
		}
		if (target.reactToDropOf) {
			target.reactToDropOf(morphToDrop);
		}
	}
};

// HandMorph event dispatching:
/*
	mouse events:

		mouseDownLeft
		mouseDownRight
		mouseClickLeft
		mouseClickRight
		mouseEnter
		mouseLeave
		mouseEnterDragging
		mouseLeaveDragging
		mouseMove
		mouseScroll
*/

HandMorph.prototype.processMouseDown = function (event) {
	var morph, expectedClick, actualClick;

	this.destroyTemporaries();
	this.morphToGrab = null;
	if (this.children.length !== 0) {
		this.drop();
		this.mouseButton = null;
	} else {
		morph = this.morphAtPointer();
		if (this.world.activeMenu) {
			if (!contains(
					morph.allParents(),
					this.world.activeMenu
				)) {
				this.world.activeMenu.destroy();
			}
		}
		if (this.world.activeHandle) {
			if (morph !== this.world.activeHandle) {
				this.world.activeHandle.destroy();
			}
		}
		if (this.world.cursor) {
			if (morph !== this.world.cursor.target) {
				this.world.stopEditing();
			}
		}
		if (!morph.mouseMove) {
			this.morphToGrab = morph.rootForGrab();
		}
		if (event.button === 2 || event.ctrlKey) {
			this.mouseButton = 'right';
			actualClick = 'mouseDownRight';
			expectedClick = 'mouseClickRight';
		} else {
			this.mouseButton = 'left';
			actualClick = 'mouseDownLeft';
			expectedClick = 'mouseClickLeft';
		}
		this.mouseDownMorph = morph;
		while (!this.mouseDownMorph[expectedClick]) {
			this.mouseDownMorph = this.mouseDownMorph.parent;
		}
		while (!morph[actualClick]) {
			morph = morph.parent;
		}
		morph[actualClick].call(morph, this.bounds.origin);
	}
};

HandMorph.prototype.processTouchStart = function (event) {
	if (this.mouseButton) { // simulate mouseRightclick
		this.processMouseDown({button: 2});
		this.processMouseUp({button: 2});
	} else {
		if (event.touches.length > 1) { // simulate mouseRightClick
			this.processTouchMove(event);
			this.processMouseDown({button: 2});
			this.processMouseUp({button: 2});
		} else {
			this.processTouchMove(event);
			this.processMouseDown({button: 0});
		}
	}
};

HandMorph.prototype.processMouseUp = function () {
	var	morph = this.morphAtPointer(),
		context,
		contextMenu,
		expectedClick;

	this.destroyTemporaries();
	if (this.children.length !== 0) {
		this.drop();
	} else {
		if (this.mouseButton === 'left') {
			expectedClick = 'mouseClickLeft';
		} else {
			expectedClick = 'mouseClickRight';
			if (this.mouseButton) {
				context = morph;
				contextMenu = context.contextMenu();
				while ((!contextMenu) &&
						context.parent) {
					context = context.parent;
					contextMenu = context.contextMenu();
				}
				if (contextMenu) {
					contextMenu.popUpAtHand(this.world);
				}
			}
		}
		while (!morph[expectedClick]) {
			morph = morph.parent;
		}
		morph[expectedClick].call(morph, this.bounds.origin);
	}
	this.mouseButton = null;
};

HandMorph.prototype.processMouseMove = function (event) {
	var	pos,
		posInDocument = getDocumentPositionOf(this.world.worldCanvas),
		mouseOverNew,
		myself = this,
		morph,
		topMorph,
		fb;

	pos = new Point(
		event.pageX - posInDocument.x,
		event.pageY - posInDocument.y
	);

	this.setPosition(pos);

    // determine the new mouse-over-list:
	// mouseOverNew = this.allMorphsAtPointer();
	mouseOverNew = this.morphAtPointer().allParents();

	if ((this.children.length === 0) &&
			(this.mouseButton === 'left')) {
		topMorph = this.morphAtPointer();
		morph = topMorph.rootForGrab();
		if (topMorph.mouseMove) {
			topMorph.mouseMove(pos);
		}

		// if a morph is marked for grabbing, just grab it
		if (this.morphToGrab) {
			if (this.morphToGrab.isDraggable) {
				morph = this.morphToGrab;
				this.grab(morph);
			} else if (this.morphToGrab.isTemplate) {
				morph = this.morphToGrab.fullCopy();
				morph.isTemplate = false;
				morph.isDraggable = true;
				this.grab(morph);
			}
			// if the mouse has left its fullBounds, center it
			fb = morph.fullBounds();
			if (!fb.containsPoint(pos)) {
				this.bounds.origin = fb.center();
				this.grab(morph);
				this.setPosition(pos);
			}

		}

/*
	original, more cautious code for grabbing Morphs,
	retained in case of needing	to fall back:

		if (morph === this.morphToGrab) {
			if (morph.isDraggable) {
				this.grab(morph);
			} else if (morph.isTemplate) {
				morph = morph.fullCopy();
				morph.isTemplate = false;
				morph.isDraggable = true;
				this.grab(morph);
			}
		}
*/

	}

	this.mouseOverList.forEach(function (old) {
		if (!contains(mouseOverNew, old)) {
			if (old.mouseLeave) {
				old.mouseLeave();
			}
			if (old.mouseLeaveDragging && this.mouseButton) {
				old.mouseLeaveDragging();
			}
		}
	});
	mouseOverNew.forEach(function (newMorph) {
		if (!contains(myself.mouseOverList, newMorph)) {
			if (newMorph.mouseEnter) {
				newMorph.mouseEnter();
			}
			if (newMorph.mouseEnterDragging && this.mouseButton) {
				newMorph.mouseEnterDragging();
			}
		}

		// autoScrolling support:
		if (myself.children.length > 0) {
			if (newMorph instanceof ScrollFrameMorph) {
				if (!newMorph.bounds.insetBy(
						MorphicPreferences.scrollBarSize * 3
					).containsPoint(myself.bounds.origin)) {
					newMorph.startAutoScrolling();
				}
			}
		}
	});
	this.mouseOverList = mouseOverNew;
};

HandMorph.prototype.processTouchMove = function (event) {
	var touch = event.touches[0];
	this.processMouseMove(touch);
};

HandMorph.prototype.processMouseScroll = function (event) {
    var morph = this.morphAtPointer();
    while (morph && !morph.mouseScroll) {
        morph = morph.parent;
    }
	if (morph) {
		morph.mouseScroll.call(
			morph,
			(event.detail / -3) || (
                event.hasOwnProperty('wheelDeltaY') ?
                        event.wheelDeltaY / 120 :
                        event.wheelDelta / 120
            ),
            event.wheelDeltaX / 120 || 0
		);
	}
};

/*
	drop event:

        droppedImage
*/

HandMorph.prototype.processDrop = function (event) {
/*
    find out whether an external image was dropped onto the world canvas,
    turn it into an offscreen canvas and dispatch the
    
        droppedImage(canvas)
    
    event to interested Morphs at the mouse pointer
*/
    var files = event.target.files || event.dataTransfer.files,
        file,
        txt = event.dataTransfer.getData('Text/HTML'),
        src,
        target = this.morphAtPointer(),
        img = new Image(),
        canvas,
        i;

    while (!target.droppedImage) {
        target = target.parent;
    }

    function readImage(aFile) {
        var pic = new Image(),
            frd = new FileReader();
        pic.onload = function () {
            canvas = newCanvas(new Point(pic.width, pic.height));
            canvas.getContext('2d').drawImage(pic, 0, 0);
            target.droppedImage(canvas);
        };
        frd = new FileReader();
        frd.onloadend = function (e) {
            pic.src = e.target.result;
        };
        frd.readAsDataURL(aFile);
    }

    function parseImgURL(html) {
        var url = '',
            i,
            c,
            start = html.indexOf('<img src="');
        if (start === -1) {return null; }
        start += 10;
        for (i = start; i < html.length; i += 1) {
            c = html[i];
            if (c === '"') {
                return url;
            }
            url = url.concat(c);
        }
        return null;
    }

    if (files.length > 0) {
        for (i = 0; i < files.length; i += 1) {
            file = files[i];
            if (file.type.indexOf("image") === 0) {
                readImage(file);
            }
        }
    } else if (txt) {
        img = new Image();
        img.onload = function () {
            canvas = newCanvas(new Point(img.width, img.height));
            canvas.getContext('2d').drawImage(img, 0, 0);
            target.droppedImage(canvas);
        };
        src = parseImgURL(txt);
        if (src) {img.src = src; }
    }
};

// HandMorph tools

HandMorph.prototype.destroyTemporaries = function () {
/*
	temporaries are just an array of morphs which will be deleted upon
	the next mouse click, or whenever another temporary Morph decides
	that it needs to remove them. The primary purpose of temporaries is
	to display tools tips of speech bubble help.
*/
	this.temporaries.forEach(function (morph) {
		morph.destroy();
	});
	this.temporaries = [];
};

// HandMorph dragging optimization

HandMorph.prototype.moveBy = function (delta) {
    Morph.prototype.trackChanges = false;
    HandMorph.uber.moveBy.call(this, delta);
	Morph.prototype.trackChanges = true;
	this.fullChanged();
};


// WorldMorph //////////////////////////////////////////////////////////

// I represent the <canvas> element

// WorldMorph inherits from FrameMorph:

WorldMorph.prototype = new FrameMorph();
WorldMorph.prototype.constructor = WorldMorph;
WorldMorph.uber = FrameMorph.prototype;

// WorldMorph instance creation:

function WorldMorph(aCanvas, fillPage) {
	this.init(aCanvas, fillPage);
}

// WorldMorph initialization:

WorldMorph.prototype.init = function (aCanvas, fillPage) {
	WorldMorph.uber.init.call(this);
	this.color = new Color(205, 205, 205); // (130, 130, 130)
	this.alpha = 1;
	this.bounds = new Rectangle(0, 0, aCanvas.width, aCanvas.height);
	this.drawNew();
	this.isVisible = true;
	this.isDraggable = false;
    this.currentKey = null; // currently pressed key code
	this.worldCanvas = aCanvas;

	// additional properties:
	this.useFillPage = fillPage;
	if (this.useFillPage === undefined) {
		this.useFillPage = true;
	}
	this.isDevMode = false;
	this.broken = [];
	this.hand = new HandMorph(this);
	this.keyboardReceiver = null;
	this.lastEditedText = null;
	this.cursor = null;
	this.activeMenu = null;
	this.activeHandle = null;
	this.trailsCanvas = null;

	this.initEventListeners();
};

WorldMorph.prototype.drawNew = function () {
	// initialize my surface property
	WorldMorph.uber.drawNew.call(this);
	this.trailsCanvas = newCanvas(this.extent());
};

// World Morph pen trails:

WorldMorph.prototype.penTrails = function () {
	// answer my pen trails canvas. default is to answer my image
	return this.trailsCanvas;
};

// World Morph display:

WorldMorph.prototype.brokenFor = function (aMorph) {
	// private
	var fb = aMorph.fullBounds();
	return this.broken.filter(function (rect) {
		return rect.intersects(fb);
	});
};

WorldMorph.prototype.fullDrawOn = function (aCanvas, aRect) {
	var rectangle, area, ctx, l, t, w, h;
	rectangle = aRect || this.fullBounds();
	area = rectangle.intersect(this.bounds);
	l = area.left();
	t = area.top();
	w = area.width();
	h = area.height();
	if ((w < 0) || (h < 0)) {
		return null;
	}

	ctx = aCanvas.getContext('2d');
	ctx.globalAlpha = 1;
	ctx.fillStyle = this.color.toString();
	ctx.fillRect(l, t, w, h);

	if (this.trailsCanvas && (w > 1) && (h > 1)) {
		ctx.drawImage(this.trailsCanvas, l, t, w, h, l, t, w, h);
	}

/* for debugging purposes:
		try {
			ctx.drawImage(this.trailsCanvas, l, t, w, h, l, t, w, h);
		} catch (err) {
			alert('error' + err
				+ '\nl: ' + l
				+ '\nt: ' + t
				+ '\nw: ' + w
				+ '\nh: ' + h
				+ '\ntrailsCanvas width: ' + this.trailsCanvas.width
				+ '\ntrailsCanvas height: ' + this.trailsCanvas.height
			);
		}

*/

	this.children.forEach(function (child) {
		child.fullDrawOn(aCanvas, rectangle);
	});
	this.hand.fullDrawOn(aCanvas, rectangle);
};

WorldMorph.prototype.updateBroken = function () {
	var myself = this;
	this.broken.forEach(function (rect) {
		if (rect.extent().gt(new Point(0, 0))) {
			myself.fullDrawOn(myself.worldCanvas, rect);
		}
	});
	this.broken = [];
};

WorldMorph.prototype.doOneCycle = function () {
	this.stepFrame();
	this.updateBroken();
};

WorldMorph.prototype.fillPage = function () {
	var	pos = getDocumentPositionOf(this.worldCanvas),
		clientHeight = window.innerHeight,
		myself = this;

	if (this.worldCanvas.width !== document.body.clientWidth) {
		this.worldCanvas.width = document.body.clientWidth;
		this.setWidth(document.body.clientWidth);
	}
	if (this.worldCanvas.height !== (clientHeight - (pos.y * 2.5))) {
		this.worldCanvas.height = (clientHeight - (pos.y * 2.5));
		this.setHeight(clientHeight - (pos.y * 2.5));
	}
	this.children.forEach(function (child) {
		if (child.reactToWorldResize) {
			child.reactToWorldResize(myself.bounds.copy());
		}
	});
};

// WorldMorph global pixel access:

WorldMorph.prototype.getGlobalPixelColor = function (point) {
/*
	answer the color at the given point.

	Note: for some strange reason this method works fine if the page is
	opened via HTTP, but *not*, if it is opened from a local uri
	(e.g. from a directory), in which case it's always null.

	This behavior is consistent throughout several browsers. I have no
	clue what's behind this, apparently the imageData attribute of
	canvas context only gets filled with meaningful data if transferred
	via HTTP ???

	This is somewhat of a showstopper for color detection in a planned
	offline version of Snap.

	The issue has also been discussed at: (join lines before pasting)
	http://stackoverflow.com/questions/4069400/
	canvas-getimagedata-doesnt-work-when-running-locally-on-windows-
	security-excep

	The suggestion solution appears to work, since the settings are
	applied globally.
*/
	var dta = this.worldCanvas.getContext('2d').getImageData(
		point.x,
		point.y,
		1,
		1
	).data;
	return new Color(dta[0], dta[1], dta[2]);
};

// WorldMorph events:

WorldMorph.prototype.initEventListeners = function () {
	var canvas = this.worldCanvas, myself = this;

	if (myself.useFillPage) {
		myself.fillPage();
	} else {
		this.changed();
	}

	canvas.addEventListener(
		"mousedown",
		function (event) {
			myself.hand.processMouseDown(event);
		},
		false
	);

	canvas.addEventListener(
		"touchstart",
		function (event) {
			myself.hand.processTouchStart(event);
			event.preventDefault();
		},
		false
	);

	canvas.addEventListener(
		"mouseup",
		function (event) {
			event.preventDefault();
			myself.hand.processMouseUp(event);
		},
		false
	);

	canvas.addEventListener(
		"touchend",
		function () {
			myself.hand.processMouseUp({button: 0});
		},
		false
	);

	canvas.addEventListener(
		"mousemove",
		function (event) {
			myself.hand.processMouseMove(event);
		},
		false
	);

	canvas.addEventListener(
		"touchmove",
		function (event) {
			myself.hand.processTouchMove(event);
		},
		false
	);

	canvas.addEventListener(
		"contextmenu",
		function (event) {
			// suppress context menu for Mac-Firefox
			event.preventDefault();
		},
		false
	);

	canvas.addEventListener(
		"contextmenu",
		function (event) {
			event.preventDefault();
		},
		false
	);

	canvas.addEventListener(
		"keydown",
		function (event) {
            // remember the keyCode in the world's currentKey property
            myself.currentKey = event.keyCode;
			if (myself.keyboardReceiver) {
				myself.keyboardReceiver.processKeyDown(event);
			}
			// supress backspace override
			if (event.keyIdentifier === 'U+0008'
					|| event.keyIdentifier === 'Backspace') {
				event.preventDefault();
			}
			// supress tab override and make sure tab gets
            // received by all browsers
			if (event.keyIdentifier === 'U+0009'
					|| event.keyIdentifier === 'Tab') {
                if (myself.keyboardReceiver) {
                    myself.keyboardReceiver.processKeyPress(event);
                }
				event.preventDefault();
			}
		},
		false
	);

	canvas.addEventListener(
		"keyup",
		function (event) {
            // flush the world's currentKey property
            myself.currentKey = null;
            // dispatch to keyboard receiver
            if (myself.keyboardReceiver) {
                if (myself.keyboardReceiver.processKeyUp) {
                    myself.keyboardReceiver.processKeyUp(event);
                }
            }
			event.preventDefault();
		},
		false
	);

	canvas.addEventListener(
		"keypress",
		function (event) {
			if (myself.keyboardReceiver) {
				myself.keyboardReceiver.processKeyPress(event);
			}
			event.preventDefault();
		},
		false
	);

	canvas.addEventListener( // Safari, Chrome
		"mousewheel",
		function (event) {
			myself.hand.processMouseScroll(event);
			event.preventDefault();
		},
		false
	);
	canvas.addEventListener( // Firefox
		"DOMMouseScroll",
		function (event) {
			myself.hand.processMouseScroll(event);
			event.preventDefault();
		},
		false
	);

	window.addEventListener(
		"dragover",
		function (event) {
            event.preventDefault();
		},
		false
	);
	window.addEventListener(
		"drop",
		function (event) {
            myself.hand.processDrop(event);
            event.preventDefault();
        },
        false
    );

	window.addEventListener(
		"resize",
		function () {
			if (myself.useFillPage) {
				myself.fillPage();
			}
		},
		false
	);

	window.onbeforeunload = function (evt) {
		var	e = evt || window.event,
			msg = "Are you sure you want to leave?";
		// For IE and Firefox
		if (e) {
			e.returnValue = msg;
		}
		// For Safari / chrome
		return msg;
	};
};

WorldMorph.prototype.mouseDownLeft = function () {
	nop();
};

WorldMorph.prototype.mouseClickLeft = function () {
	nop();
};

WorldMorph.prototype.mouseDownRight = function () {
	nop();
};

WorldMorph.prototype.mouseClickRight = function () {
	nop();
};

WorldMorph.prototype.wantsDropOf = function () {
	// allow handle drops if any drops are allowed
	return this.acceptsDrops;
};

WorldMorph.prototype.droppedImage = function () {
    return null;
};

// WorldMorph text field tabbing:

WorldMorph.prototype.nextTab = function (editField) {
	var	next = this.nextEntryField(editField);
	editField.clearSelection();
	next.selectAll();
	next.edit();
};

WorldMorph.prototype.previousTab = function (editField) {
	var	prev = this.previousEntryField(editField);
	editField.clearSelection();
	prev.selectAll();
	prev.edit();
};

// WorldMorph menu:

WorldMorph.prototype.contextMenu = function () {
	var menu;

	if (this.isDevMode) {
		menu = new MenuMorph(this, this.constructor.name ||
			this.constructor.toString().split(' ')[1].split('(')[0]);
	} else {
		menu = new MenuMorph(this, 'Morphic');
	}
	if (this.isDevMode) {
		menu.addItem("demo...", 'userCreateMorph', 'sample morphs');
		menu.addLine();
		menu.addItem("hide all...", 'hideAll');
		menu.addItem("show all...", 'showAllHiddens');
		menu.addItem(
			"move all inside...",
			'keepAllSubmorphsWithin',
			'keep all submorphs\nwithin and visible'
		);
		menu.addItem(
			"inspect...",
			'inspect',
			'open a window on\nall properties'
		);
		menu.addLine();
		menu.addItem(
			"restore display",
			'changed',
			'redraw the\nscreen once'
		);
		menu.addItem(
			"fill page...",
			'fillPage',
			'let the World automatically\nadjust to browser resizings'
		);
		if (useBlurredShadows) {
			menu.addItem(
				"sharp shadows...",
				'toggleBlurredShadows',
				'sharp drop shadows\nuse for old browsers'
			);
		} else {
			menu.addItem(
				"blurred shadows...",
				'toggleBlurredShadows',
				'blurry shades,\n use for new browsers'
			);
		}
		menu.addItem(
			"color...",
			function () {
				this.pickColor(
					menu.title + '\ncolor:',
					this.setColor,
					this,
					this.color
				);
			},
			'choose the World\'s\nbackground color'
		);
		if (MorphicPreferences === standardSettings) {
			menu.addItem(
				"touch screen settings",
				'togglePreferences',
				'bigger menu fonts\nand sliders'
			);
		} else {
			menu.addItem(
				"standard settings",
				'togglePreferences',
				'smaller menu fonts\nand sliders'
			);
		}
		menu.addLine();
	}
	if (this.isDevMode) {
		menu.addItem(
			"user mode...",
			'toggleDevMode',
			'disable developers\'\ncontext menus'
		);
	} else {
		menu.addItem("development mode...", 'toggleDevMode');
	}
	menu.addItem("about morphic.js...", 'about');
	return menu;
};

WorldMorph.prototype.userCreateMorph = function () {
	var myself = this, menu, newMorph;

	function create(aMorph) {
		aMorph.isDraggable = true;
		aMorph.pickUp(myself);
	}

	menu = new MenuMorph(this, 'make a morph');
	menu.addItem('rectangle', function () {
		create(new Morph());
	});
	menu.addItem('box', function () {
		create(new BoxMorph());
	});
	menu.addItem('circle box', function () {
		create(new CircleBoxMorph());
	});
	menu.addLine();
	menu.addItem('slider', function () {
		create(new SliderMorph());
	});
	menu.addItem('frame', function () {
		newMorph = new FrameMorph();
		newMorph.setExtent(new Point(350, 250));
		create(newMorph);
	});
	menu.addItem('scroll frame', function () {
		newMorph = new ScrollFrameMorph();
		newMorph.contents.acceptsDrops = true;
		newMorph.contents.adjustBounds();
		newMorph.setExtent(new Point(350, 250));
		create(newMorph);
	});
	menu.addItem('handle', function () {
		create(new HandleMorph());
	});
	menu.addLine();
	menu.addItem('string', function () {
		newMorph = new StringMorph('Hello, World!');
		newMorph.isEditable = true;
		create(newMorph);
	});
	menu.addItem('text', function () {
		newMorph = new TextMorph(
			"Ich wei\u00DF nicht, was soll es bedeuten, dass ich so " +
				"traurig bin, ein M\u00E4rchen aus uralten Zeiten, das " +
				"kommt mir nicht aus dem Sinn. Die Luft ist k\u00FChl " +
				"und es dunkelt, und ruhig flie\u00DFt der Rhein; der " +
				"Gipfel des Berges funkelt im Abendsonnenschein. " +
				"Die sch\u00F6nste Jungfrau sitzet dort oben wunderbar, " +
				"ihr gold'nes Geschmeide blitzet, sie k\u00E4mmt ihr " +
				"goldenes Haar, sie k\u00E4mmt es mit goldenem Kamme, " +
				"und singt ein Lied dabei; das hat eine wundersame, " +
				"gewalt'ge Melodei. Den Schiffer im kleinen " +
				"Schiffe, ergreift es mit wildem Weh; er schaut " +
				"nicht die Felsenriffe, er schaut nur hinauf in " +
				"die H\u00F6h'. Ich glaube, die Wellen verschlingen " +
				"am Ende Schiffer und Kahn, und das hat mit ihrem " +
				"Singen, die Loreley getan."
		);
		newMorph.isEditable = true;
		newMorph.maxWidth = 300;
		newMorph.drawNew();
		create(newMorph);
	});
	menu.addItem('speech bubble', function () {
		newMorph = new SpeechBubbleMorph('Hello, World!');
		create(newMorph);
	});
	menu.addLine();
	menu.addItem('gray scale palette', function () {
		create(new GrayPaletteMorph());
	});
	menu.addItem('color palette', function () {
		create(new ColorPaletteMorph());
	});
	menu.addItem('color picker', function () {
		create(new ColorPickerMorph());
	});
	menu.addLine();
	menu.addItem('sensor demo', function () {
		newMorph = new MouseSensorMorph();
		newMorph.setColor(new Color(230, 200, 100));
		newMorph.edge = 35;
		newMorph.border = 15;
		newMorph.borderColor = new Color(200, 100, 50);
		newMorph.alpha = 0.2;
		newMorph.setExtent(new Point(100, 100));
		create(newMorph);
	});
	menu.addItem('animation demo', function () {
		var foo, bar, baz, garply, fred;

		foo = new BouncerMorph();
		foo.setPosition(new Point(50, 20));
		foo.setExtent(new Point(300, 200));
		foo.alpha = 0.9;
		foo.speed = 3;

		bar = new BouncerMorph();
		bar.setColor(new Color(50, 50, 50));
		bar.setPosition(new Point(80, 80));
		bar.setExtent(new Point(80, 250));
		bar.type = 'horizontal';
		bar.direction = 'right';
		bar.alpha = 0.9;
		bar.speed = 5;

		baz = new BouncerMorph();
		baz.setColor(new Color(20, 20, 20));
		baz.setPosition(new Point(90, 140));
		baz.setExtent(new Point(40, 30));
		baz.type = 'horizontal';
		baz.direction = 'right';
		baz.speed = 3;

		garply = new BouncerMorph();
		garply.setColor(new Color(200, 20, 20));
		garply.setPosition(new Point(90, 140));
		garply.setExtent(new Point(20, 20));
		garply.type = 'vertical';
		garply.direction = 'up';
		garply.speed = 8;

		fred = new BouncerMorph();
		fred.setColor(new Color(20, 200, 20));
		fred.setPosition(new Point(120, 140));
		fred.setExtent(new Point(20, 20));
		fred.type = 'vertical';
		fred.direction = 'down';
		fred.speed = 4;

		bar.add(garply);
		bar.add(baz);
		foo.add(fred);
		foo.add(bar);

		create(foo);
	});
	menu.addItem('pen', function () {
		create(new PenMorph());
	});
	if (myself.customMorphs) {
		menu.addLine();
		myself.customMorphs().forEach(function (morph) {
			menu.addItem(morph.toString(), function () {
				create(morph);
			});
		});
	}
	menu.popUpAtHand(this);
};

WorldMorph.prototype.toggleDevMode = function () {
	this.isDevMode = !this.isDevMode;
};

WorldMorph.prototype.hideAll = function () {
	this.children.forEach(function (child) {
		child.hide();
	});
};

WorldMorph.prototype.showAllHiddens = function () {
	this.forAllChildren(function (child) {
		if (!child.isVisible) {
			child.show();
		}
	});
};

WorldMorph.prototype.about = function () {
	var versions = '', module;

	for (module in modules) {
        if (modules.hasOwnProperty(module)) {
            versions += ('\n' + module + ' (' + modules[module] + ')');
        }
	}
	if (versions !== '') {
		versions = '\n\nmodules:\n\n' +
			'morphic (' + morphicVersion + ')' +
			versions;
	}

	this.inform(
		'morphic.js\n\n' +
			'a lively Web GUI\ninspired by Squeak\n' +
			morphicVersion +
			'\n\nwritten by Jens M\u00F6nig\njens@moenig.org' +
			versions
	);
};

WorldMorph.prototype.edit = function (aStringOrTextMorph) {
	if (!aStringOrTextMorph.isEditable) {
		return null;
	}
	if (this.cursor) {
		this.cursor.destroy();
	}
	if (this.lastEditedText) {
		this.lastEditedText.clearSelection();
	}
	this.cursor = new CursorMorph(aStringOrTextMorph);
	aStringOrTextMorph.parent.add(this.cursor);
	this.keyboardReceiver = this.cursor;

	if (MorphicPreferences.useVirtualKeyboard) {
		if (!aStringOrTextMorph.parentThatIsA(MenuMorph)) {
			this.slide(aStringOrTextMorph);
		}
	}
};

WorldMorph.prototype.slide = function (aStringOrTextMorph) {
	// display a slider for numeric text entries
	var	val = parseFloat(aStringOrTextMorph.text),
		menu,
		slider;

	if (isNaN(val)) {
		val = 0;
	}
	menu = new MenuMorph();
	slider = new SliderMorph(
		val - 25,
		val + 25,
		val,
		10,
		'horizontal'
	);
	slider.alpha = 1;
	slider.color = new Color(225, 225, 225);
	slider.button.color = menu.borderColor;
	slider.button.highlightColor = slider.button.color.copy();
	slider.button.highlightColor.b += 100;
	slider.button.pressColor = slider.button.color.copy();
	slider.button.pressColor.b += 150;
	slider.silentSetHeight(MorphicPreferences.scrollBarSize);
	slider.silentSetWidth(MorphicPreferences.menuFontSize * 10);
	slider.drawNew();
	slider.action = function (num) {
		aStringOrTextMorph.changed();
		aStringOrTextMorph.text = Math.round(num).toString();
		aStringOrTextMorph.drawNew();
		aStringOrTextMorph.changed();
	};
	menu.items.push(slider);
	menu.popup(this, aStringOrTextMorph.bottomLeft().add(new Point(0, 5)));
};

WorldMorph.prototype.stopEditing = function () {
	if (this.cursor) {
		this.lastEditedText = this.cursor.target;
		this.cursor.destroy();
	}
	this.keyboardReceiver = null;
};

WorldMorph.prototype.toggleBlurredShadows = function () {
	useBlurredShadows = !useBlurredShadows;
};

WorldMorph.prototype.togglePreferences = function () {
	if (MorphicPreferences === standardSettings) {
		MorphicPreferences = touchScreenSettings;
	} else {
		MorphicPreferences = standardSettings;
	}
};

/*

	widgets.js

	additional GUI elements for morphic.js

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
	needs blocks.js and objects.js


	I. hierarchy
	-------------
	the following tree lists all constructors hierarchically,
	indentation indicating inheritance. Refer to this list to get a
	contextual overview:

	Morph*
		AlignmentMorph
		DialogBoxMorph
		InputFieldMorph
	TriggerMorph*
		PushButtonMorph
            ToggleButtonMorph
                TabMorph
			ToggleMorph
        ToggleElementMorph

	* from Morphic.js


	II. toc
	-------
	the following list shows the order in which all constructors are
	defined. Use this list to locate code in this document:

	PushButtonMorph
    ToggleButtonMorph
    TabMorph
	ToggleMorph
    ToggleElementMorph
	DialogBoxMorph
	AlignmentMorph
	InputFieldMorph

*/

// Global settings /////////////////////////////////////////////////////

/*global TriggerMorph, modules, Color, Point, BoxMorph, radians,
newCanvas, StringMorph, Morph, TextMorph, nop, detect, StringFieldMorph,
HTMLCanvasElement, fontHeight*/

modules.widgets = '2012-Mar-21';

var PushButtonMorph;
var ToggleButtonMorph;
var TabMorph;
var ToggleMorph;
var ToggleElementMorph;
var DialogBoxMorph;
var AlignmentMorph;
var InputFieldMorph;

// PushButtonMorph /////////////////////////////////////////////////////

// I am a Button with rounded corners and 3D-ish graphical effects

// PushButtonMorph inherits from TriggerMorph:

PushButtonMorph.prototype = new TriggerMorph();
PushButtonMorph.prototype.constructor = PushButtonMorph;
PushButtonMorph.uber = TriggerMorph.prototype;

// PushButtonMorph preferences settings:

PushButtonMorph.prototype.fontSize = 10;
PushButtonMorph.prototype.fontStyle = 'sans-serif';
PushButtonMorph.prototype.labelColor = new Color(0, 0, 0);
PushButtonMorph.prototype.labelShadowColor = new Color(240, 240, 240);
PushButtonMorph.prototype.labelShadowOffset = new Point(1, 1);

PushButtonMorph.prototype.color = new Color(220, 220, 220);
PushButtonMorph.prototype.pressColor = new Color(115, 180, 240);
PushButtonMorph.prototype.highlightColor
	= PushButtonMorph.prototype.pressColor.lighter(50);
PushButtonMorph.prototype.outlineColor = new Color(30, 30, 30);
PushButtonMorph.prototype.outlineGradient = false;
PushButtonMorph.prototype.contrast = 60;

PushButtonMorph.prototype.edge = 2;
PushButtonMorph.prototype.corner = 5;
PushButtonMorph.prototype.outline = 1.00001;
PushButtonMorph.prototype.padding = 3;

// PushButtonMorph instance creation:

function PushButtonMorph(
	target,
	action,
	labelString,
	environment,
	hint,
    template
) {
	this.init(
		target,
		action,
		labelString,
		environment,
		hint,
        template
	);
}

PushButtonMorph.prototype.init = function (
	target,
	action,
	labelString,
	environment,
	hint,
    template
) {
	// additional properties:
	this.target = target || null;
	this.action = action || null;
	this.environment = environment || null;
	this.labelString = labelString || null;
	this.label = null;
	this.hint = hint || null;
    this.template = template || null; // for pre-computed backbrounds
    // if a template is specified, its background images are used as cache

	// initialize inherited properties:
	TriggerMorph.uber.init.call(this);

	// override inherited properites:
	this.color = PushButtonMorph.prototype.color;
	this.drawNew();
	this.fixLayout();
};

// PushButtonMorph layout:

PushButtonMorph.prototype.fixLayout = function () {
	// make sure I at least encompass my label
	if (this.label !== null) {
		var padding = this.padding * 2 + this.outline * 2 + this.edge * 2;
		this.setExtent(new Point(
			this.label.width() + padding,
			this.label.height() + padding
		));
		this.label.setCenter(this.center());
	}
};

// PushButtonMorph events

PushButtonMorph.prototype.mouseDownLeft = function () {
	PushButtonMorph.uber.mouseDownLeft.call(this);
	if (this.label) {
		this.label.setCenter(this.center().add(1));
	}
};

PushButtonMorph.prototype.mouseClickLeft = function () {
	PushButtonMorph.uber.mouseClickLeft.call(this);
	if (this.label) {
		this.label.setCenter(this.center());
	}
};

PushButtonMorph.prototype.mouseLeave = function () {
	PushButtonMorph.uber.mouseLeave.call(this);
	if (this.label) {
		this.label.setCenter(this.center());
	}
};

// PushButtonMorph drawing:

PushButtonMorph.prototype.outlinePath = BoxMorph.prototype.outlinePath;

PushButtonMorph.prototype.drawOutline = function (context) {
	var outlineStyle;

	if (!this.outline) {return null; }
	if (this.outlineGradient) {
		outlineStyle = context.createLinearGradient(
			this.width() * 0.45,
			0,
			this.width() * 0.55,
			this.height()
		);
		outlineStyle.addColorStop(1, 'white');
		outlineStyle.addColorStop(0, this.outlineColor.darker().toString());
	} else {
		outlineStyle = this.outlineColor.toString();
	}
	context.fillStyle = outlineStyle;
	context.beginPath();
	this.outlinePath(
		context,
		this.corner,
		0
	);
	context.closePath();
	context.fill();
};

PushButtonMorph.prototype.drawBackground = function (context, color) {
	context.fillStyle = color.toString();
	context.beginPath();
	this.outlinePath(
		context,
		Math.max(this.corner - this.outline, 0),
		this.outline
	);
	context.closePath();
	context.fill();
	context.lineWidth = this.outline;
};

PushButtonMorph.prototype.drawEdges = function (
	context,
	color,
	topColor,
	bottomColor
) {
	var minInset = Math.max(this.corner, this.outline + this.edge),
		w = this.width(),
		h = this.height(),
		gradient;

	// top:
	gradient = context.createLinearGradient(
		0,
		this.outline,
		0,
		this.outline + this.edge
	);
	gradient.addColorStop(0, topColor.toString());
	gradient.addColorStop(1, color.toString());

	context.strokeStyle = gradient;
	context.lineCap = 'round';
	context.lineWidth = this.edge;
	context.beginPath();
	context.moveTo(minInset, this.outline + this.edge / 2);
	context.lineTo(w - minInset, this.outline + this.edge / 2);
	context.stroke();

	// top-left corner:
	gradient = context.createRadialGradient(
		this.corner,
		this.corner,
		Math.max(this.corner - this.outline - this.edge, 0),
		this.corner,
		this.corner,
		Math.max(this.corner - this.outline, 0)
	);
	gradient.addColorStop(1, topColor.toString());
	gradient.addColorStop(0, color.toString());

	context.strokeStyle = gradient;
	context.lineCap = 'round';
	context.lineWidth = this.edge;
	context.beginPath();
	context.arc(
		this.corner,
		this.corner,
		Math.max(this.corner - this.outline - this.edge / 2, 0),
		radians(180),
		radians(270),
		false
	);
	context.stroke();

	// left:
	gradient = context.createLinearGradient(
		this.outline,
		0,
		this.outline + this.edge,
		0
	);
	gradient.addColorStop(0, topColor.toString());
	gradient.addColorStop(1, color.toString());

	context.strokeStyle = gradient;
	context.lineCap = 'round';
	context.lineWidth = this.edge;
	context.beginPath();
	context.moveTo(this.outline + this.edge / 2, minInset);
	context.lineTo(this.outline + this.edge / 2, h - minInset);
	context.stroke();

	// bottom:
	gradient = context.createLinearGradient(
		0,
		h - this.outline,
		0,
		h - this.outline - this.edge
	);
	gradient.addColorStop(0, bottomColor.toString());
	gradient.addColorStop(1, color.toString());

	context.strokeStyle = gradient;
	context.lineCap = 'round';
	context.lineWidth = this.edge;
	context.beginPath();
	context.moveTo(minInset, h - this.outline - this.edge / 2);
	context.lineTo(w - minInset, h - this.outline - this.edge / 2);
	context.stroke();

	// bottom-right corner:
	gradient = context.createRadialGradient(
		w - this.corner,
		h - this.corner,
		Math.max(this.corner - this.outline - this.edge, 0),
		w - this.corner,
		h - this.corner,
		Math.max(this.corner - this.outline, 0)
	);
	gradient.addColorStop(1, bottomColor.toString());
	gradient.addColorStop(0, color.toString());

	context.strokeStyle = gradient;
	context.lineCap = 'round';
	context.lineWidth = this.edge;
	context.beginPath();
	context.arc(
		w - this.corner,
		h - this.corner,
		Math.max(this.corner - this.outline - this.edge / 2, 0),
		radians(0),
		radians(90),
		false
	);
	context.stroke();

	// right:
	gradient = context.createLinearGradient(
		w - this.outline,
		0,
		w - this.outline - this.edge,
		0
	);
	gradient.addColorStop(0, bottomColor.toString());
	gradient.addColorStop(1, color.toString());

	context.strokeStyle = gradient;
	context.lineCap = 'round';
	context.lineWidth = this.edge;
	context.beginPath();
	context.moveTo(w - this.outline - this.edge / 2, minInset);
	context.lineTo(w - this.outline - this.edge / 2, h - minInset);
	context.stroke();
};

PushButtonMorph.prototype.createBackgrounds = function () {
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
	this.drawOutline(context);
	this.drawBackground(context, this.color);
	this.drawEdges(
		context,
		this.color,
		this.color.lighter(this.contrast),
		this.color.darker(this.contrast)
	);

	this.highlightImage = newCanvas(ext);
	context = this.highlightImage.getContext('2d');
	this.drawOutline(context);
	this.drawBackground(context, this.highlightColor);
	this.drawEdges(
		context,
		this.highlightColor,
		this.highlightColor.lighter(this.contrast),
		this.highlightColor.darker(this.contrast)
	);

	this.pressImage = newCanvas(ext);
	context = this.pressImage.getContext('2d');
	this.drawOutline(context);
	this.drawBackground(context, this.pressColor);
	this.drawEdges(
		context,
		this.pressColor,
		this.pressColor.darker(this.contrast),
		this.pressColor.lighter(this.contrast)
	);

	this.image = this.normalImage;
};

PushButtonMorph.prototype.createLabel = function () {
	if (this.label !== null) {
		this.label.destroy();
	}
	this.label = new StringMorph(
		this.labelString,
		this.fontSize,
		this.fontStyle,
		true,
		false,
		false,
		this.labelShadowOffset,
		this.labelShadowColor,
        this.labelColor
	);
	this.add(this.label);
};

// ToggleButtonMorph ///////////////////////////////////////////////////////

/*
    I am a two-state PushButton. When my state is "true" I keep my "pressed"
    background color. I can also be set to not auto-layout my bounds, in
    which case my label will left-align.
*/

// ToggleButtonMorph inherits from PushButtonMorph:

ToggleButtonMorph.prototype = new PushButtonMorph();
ToggleButtonMorph.prototype.constructor = ToggleButtonMorph;
ToggleButtonMorph.uber = PushButtonMorph.prototype;

// ToggleButton settings

ToggleButtonMorph.prototype.contrast = 30;

// ToggleButtonMorph instance creation:

function ToggleButtonMorph(
	colors, // color overrides, <array>: [normal, highlight, pressed]
	target,
	action, // a toggle function
	labelString,
	query, // predicate/selector
	environment,
	hint,
    template, // optional, for cached background images
    minWidth, // <num> optional, if specified label will left-align
    hasPreview // <bool> show press color on left edge (e.g. Scratch category)
) {
	this.init(
		colors,
		target,
		action,
		labelString,
		query,
		environment,
		hint,
        template,
        minWidth,
        hasPreview
	);
}

ToggleButtonMorph.prototype.init = function (
	colors,
	target,
	action,
	labelString,
	query,
	environment,
	hint,
    template,
    minWidth,
    hasPreview
) {
	// additional properties:
	this.state = false;
	this.query = query || function () {return true; };
    this.minWidth = minWidth || null;
    this.hasPreview = hasPreview || false;

	// initialize inherited properties:
	ToggleButtonMorph.uber.init.call(
		this,
		target,
		action,
		labelString,
		environment,
		hint,
        template
	);

    // override default colors if others are specified
    if (colors) {
        this.color = colors[0];
        this.highlightColor = colors[1];
        this.pressColor = colors[2];
    }

	this.refresh();
	this.drawNew();
};

// ToggleButtonMorph events

ToggleButtonMorph.prototype.mouseEnter = function () {
    if (!this.state) {
        this.image = this.highlightImage;
        this.changed();
    }
	if (this.hint) {
		this.bubbleHelp(this.hint);
	}
};

ToggleButtonMorph.prototype.mouseLeave = function () {
    if (!this.state) {
        this.image = this.normalImage;
        this.changed();
    }
	if (this.hint) {
		this.world().hand.destroyTemporaries();
	}
};

ToggleButtonMorph.prototype.mouseDownLeft = function () {
    if (!this.state) {
        this.image = this.pressImage;
        this.changed();
    }
};

ToggleButtonMorph.prototype.mouseClickLeft = function () {
    if (!this.state) {
        this.image = this.highlightImage;
        this.changed();
    }
	this.trigger(); // allow me to be triggered again to force-update others
};

// ToggleButtonMorph action

ToggleButtonMorph.prototype.trigger = function () {
	ToggleButtonMorph.uber.trigger.call(this);
	this.refresh();
};

ToggleButtonMorph.prototype.refresh = function () {
/*
	if query is a function:
	execute the query with target as environment (can be null)
	for lambdafied (inline) actions

	else if query is a String:
	treat it as function property of target and execute it
	for selector-like queries
*/
	if (typeof this.query === 'function') {
		this.state = this.query.call(this.target);
	} else { // assume it's a String
		this.state = this.target[this.query].call(this.target);
	}
    if (this.state) {
        this.image = this.pressImage;
    } else {
        this.image = this.normalImage;
    }
    this.changed();
};

// ToggleButtonMorph layout:

ToggleButtonMorph.prototype.fixLayout = function () {
	if (this.label !== null) {
        var lw = this.label.width(),
            padding = this.padding * 2 + this.outline * 2 + this.edge * 2;
		this.setExtent(new Point(
            (this.minWidth ?
                    Math.max(this.minWidth, lw) + padding
                    : lw + padding),
            this.label.height() + padding
		));
		this.label.setCenter(this.center());
        if (this.minWidth) { // left-align along my corner
            this.label.setLeft(
                this.left()
                    + this.outline
                    + this.edge
                    + this.corner
                    + this.padding
            );
        }
	}
};

// ToggleButtonMorph drawing

ToggleButtonMorph.prototype.createBackgrounds = function () {
/*
    basically the same as inherited from PushButtonMorph, except for
    not inverting the pressImage 3D-ish border (because it stays that way),
    and optionally coloring the left edge in the press-color, previewing
    the selection color (e.g. in the case of Scratch palette-category
    selector. the latter is done in the drawEdges() method.
*/
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
	this.drawOutline(context);
	this.drawBackground(context, this.color);
	this.drawEdges(
		context,
		this.color,
		this.color.lighter(this.contrast),
		this.color.darker(this.contrast)
	);

	this.highlightImage = newCanvas(ext);
	context = this.highlightImage.getContext('2d');
	this.drawOutline(context);
	this.drawBackground(context, this.highlightColor);
	this.drawEdges(
		context,
		this.highlightColor,
		this.highlightColor.lighter(this.contrast),
		this.highlightColor.darker(this.contrast)
	);

    // note: don't invert the 3D-ish edges for pressedImage, because
    // it will stay that way, and should not look inverted (or should it?)
	this.pressImage = newCanvas(ext);
	context = this.pressImage.getContext('2d');
	this.drawOutline(context);
	this.drawBackground(context, this.pressColor);
	this.drawEdges(
		context,
		this.pressColor,
		this.pressColor.lighter(40),
		this.pressColor.darker(40)
	);

	this.image = this.normalImage;
};

ToggleButtonMorph.prototype.drawEdges = function (
	context,
	color,
	topColor,
	bottomColor
) {
    var gradient;

    ToggleButtonMorph.uber.drawEdges.call(
        this,
        context,
        color,
        topColor,
        bottomColor
    );

    if (this.hasPreview) { // indicate the possible selection color
        gradient = context.createLinearGradient(
            0,
            0,
            this.corner,
            0
        );
        gradient.addColorStop(0, this.pressColor.lighter(40).toString());
        gradient.addColorStop(1, this.pressColor.darker(40).toString());
        context.fillStyle = gradient; // this.pressColor.toString();
        context.beginPath();
        this.previewPath(
            context,
            Math.max(this.corner - this.outline, 0),
            this.outline
        );
        context.closePath();
        context.fill();
    }
};

ToggleButtonMorph.prototype.previewPath = function (context, radius, inset) {
	var	offset = radius + inset,
		h = this.height();

	// top left:
	context.arc(
		offset,
		offset,
		radius,
		radians(-180),
		radians(-90),
		false
	);
	// bottom left:
	context.arc(
		offset,
		h - offset,
		radius,
		radians(90),
		radians(180),
		false
	);
};

// TabMorph ///////////////////////////////////////////////////////

// TabMorph inherits from ToggleButtonMorph:

TabMorph.prototype = new ToggleButtonMorph();
TabMorph.prototype.constructor = TabMorph;
TabMorph.uber = ToggleButtonMorph.prototype;

// TabMorph instance creation:

function TabMorph(
	colors, // color overrides, <array>: [normal, highlight, pressed]
	target,
	action, // a toggle function
	labelString,
	query, // predicate/selector
	environment,
	hint
) {
	this.init(
		colors,
		target,
		action,
		labelString,
		query,
		environment,
		hint
    );
}

// TabMorph layout:

TabMorph.prototype.fixLayout = function () {
	if (this.label !== null) {
		this.setExtent(new Point(
            this.label.width()
                + this.padding * 2
                + this.corner * 3
                + this.edge * 2,
			this.label.height()
                + this.padding * 2
                + this.edge
		));
		this.label.setCenter(this.center());
	}
};

// TabMorph action:

TabMorph.prototype.refresh = function () {
    if (this.state) { // bring to front
        if (this.parent) {
            this.parent.add(this);
        }
    }
    TabMorph.uber.refresh.call(this);
};

// TabMorph drawing:

TabMorph.prototype.drawBackground = function (context, color) {
    var w = this.width(),
        h = this.height(),
        c = this.corner;

	context.fillStyle = color.toString();
	context.beginPath();
    context.moveTo(0, h);
    context.bezierCurveTo(c, h, c, 0, c * 2, 0);
    context.lineTo(w - c * 2, 0);
    context.bezierCurveTo(w - c, 0, w - c, h, w, h);
	context.closePath();
	context.fill();
};

TabMorph.prototype.drawOutline = function () {
    nop();
};

TabMorph.prototype.drawEdges = function (
	context,
	color,
	topColor,
	bottomColor
) {
    var w = this.width(),
        h = this.height(),
        c = this.corner,
        e = this.edge,
        eh = e / 2,
        gradient;

    nop(color); // argument not needed here

	gradient = context.createLinearGradient(0, 0, w, 0);
	gradient.addColorStop(0, topColor.toString());
	gradient.addColorStop(1, bottomColor.toString());

    context.strokeStyle = gradient;
	context.lineCap = 'round';
	context.lineWidth = e;

    context.beginPath();
    context.moveTo(0, h + eh);
    context.bezierCurveTo(c, h, c, 0, c * 2, eh);
    context.lineTo(w - c * 2, eh);
    context.bezierCurveTo(w - c, 0, w - c, h, w, h + eh);
    context.stroke();
};

// ToggleMorph ///////////////////////////////////////////////////////

/*
    I am a PushButton which toggles a check mark ( becoming check box)
    or a bullet (becoming a radio button). I can have both or either an
    additional label and an additional pictogram, whereas the pictogram
    can be either an instance of (any) Morph, in which case the pictogram
    will be an interactive toggle itself or a Canvas, in which case it
    is just going to be a picture.
*/

// ToggleMorph inherits from PushButtonMorph:

ToggleMorph.prototype = new PushButtonMorph();
ToggleMorph.prototype.constructor = ToggleMorph;
ToggleMorph.uber = PushButtonMorph.prototype;

// ToggleMorph instance creation:

function ToggleMorph(
	style, // 'checkbox' or 'radiobutton'
	target,
	action, // a toggle function
	labelString,
	query, // predicate/selector
	environment,
	hint,
    template,
    element, // optional Morph or Canvas to display
    builder // method which constructs the element (only for Morphs)
) {
	this.init(
		style,
		target,
		action,
		labelString,
		query,
		environment,
		hint,
        template,
        element,
        builder
	);
}

ToggleMorph.prototype.init = function (
	style,
	target,
	action,
	labelString,
	query,
	environment,
	hint,
    template,
    element,
    builder
) {
	// additional properties:
	this.padding = 1;
	style = style || 'checkbox';
	this.corner = (style === 'checkbox' ?
			0 : fontHeight(this.fontSize) / 2 + this.outline + this.padding);
	this.state = false;
	this.query = query || function () {return true; };
	this.tick = null;
	this.captionString = labelString || null;
	this.labelAlignment = 'right';
    this.element = element || null;
    this.builder = builder || null;
    this.toggleElement = null;

	// initialize inherited properties:
	ToggleMorph.uber.init.call(
		this,
		target,
		action,
		(style === 'checkbox' ? '\u2713' : '\u25CF'),
		environment,
		hint,
        template
	);
	this.refresh();
	this.drawNew();
};

// ToggleMorph layout:

ToggleMorph.prototype.fixLayout = function () {
	var	padding = this.padding * 2 + this.outline * 2,
		y;
	if (this.tick !== null) {
		this.silentSetHeight(this.tick.height() + padding);
		this.silentSetWidth(this.tick.width() + padding);

		this.setExtent(new Point(
			Math.max(this.width(), this.height()),
			Math.max(this.width(), this.height())
		));
		this.tick.setCenter(this.center());
	}
	if (this.state) {
		this.tick.show();
	} else {
		this.tick.hide();
	}
    if (this.toggleElement && (this.labelAlignment === 'right')) {
		y = this.top() + (this.height() - this.toggleElement.height()) / 2;
        this.toggleElement.setPosition(new Point(
            this.right() + padding,
            y
        ));
    }
	if (this.label !== null) {
		y = this.top() + (this.height() - this.label.height()) / 2;
		if (this.labelAlignment === 'right') {
            this.label.setPosition(new Point(
                this.toggleElement ?
                        this.toggleElement instanceof ToggleElementMorph ?
                                this.toggleElement.right()
                                : this.toggleElement.right() + padding
                        : this.right() + padding,
                y
            ));
		} else {
			this.label.setPosition(new Point(
				this.left() - this.label.width() - padding,
				y
			));
		}
	}
};

ToggleMorph.prototype.createLabel = function () {
	if (this.label === null) {
		if (this.captionString) {
			this.label = new TextMorph(
				this.captionString,
				this.fontSize,
				this.fontStyle,
				true
			);
			this.add(this.label);
		}
	}
	if (this.tick === null) {
		this.tick = new StringMorph(
			this.labelString,
			this.fontSize,
			this.fontStyle,
			true,
			false,
			false,
			new Point(1, 1),
			new Color(240, 240, 240)
		);
		this.add(this.tick);
	}
    if (this.toggleElement === null) {
        if (this.element) {
            if (this.element instanceof Morph) {
                this.toggleElement = new ToggleElementMorph(
                    this.target,
                    this.action,
                    this.element,
                    this.query,
                    this.environment,
                    this.hint,
                    this.builder
                );
            } else if (this.element instanceof HTMLCanvasElement) {
                this.toggleElement = new Morph();
                this.toggleElement.silentSetExtent(new Point(
                    this.element.width,
                    this.element.height
                ));
                this.toggleElement.image = this.element;
            }
            this.add(this.toggleElement);
        }
    }
};

// ToggleMorph action:

ToggleMorph.prototype.trigger = function () {
	ToggleMorph.uber.trigger.call(this);
	this.refresh();
};

ToggleMorph.prototype.refresh = function () {
	/*
	if query is a function:
	execute the query with target as environment (can be null)
	for lambdafied (inline) actions

	else if query is a String:
	treat it as function property of target and execute it
	for selector-like queries
	*/
	if (typeof this.query === 'function') {
		this.state = this.query.call(this.target);
	} else { // assume it's a String
		this.state = this.target[this.query].call(this.target);
	}
    if (this.state) {
        this.tick.show();
    } else {
        this.tick.hide();
    }
    if (this.toggleElement && this.toggleElement.refresh) {
        this.toggleElement.refresh();
    }
};

// ToggleMorph events

ToggleMorph.prototype.mouseDownLeft = function () {
	PushButtonMorph.uber.mouseDownLeft.call(this);
	if (this.tick) {
		this.tick.setCenter(this.center().add(1));
	}
};

ToggleMorph.prototype.mouseClickLeft = function () {
	PushButtonMorph.uber.mouseClickLeft.call(this);
	if (this.tick) {
		this.tick.setCenter(this.center());
	}
};

ToggleMorph.prototype.mouseLeave = function () {
	PushButtonMorph.uber.mouseLeave.call(this);
	if (this.tick) {
		this.tick.setCenter(this.center());
	}
};

// ToggleElementMorph /////////////////////////////////////////////////////
/*
    I am a picture of a Morph ("element") which acts as a toggle button.
    I am different from ToggleButton in that I neither create a label nor
    draw button outlines. Instead I display my element morph in specified
    contrasts of a given color, symbolizing whether it is selected or not
*/

// ToggleElementMorph inherits from TriggerMorph:

ToggleElementMorph.prototype = new TriggerMorph();
ToggleElementMorph.prototype.constructor = ToggleElementMorph;
ToggleElementMorph.uber = TriggerMorph.prototype;

// ToggleElementMorph preferences settings

ToggleElementMorph.prototype.contrast = 50;
ToggleElementMorph.prototype.shadowOffset = new Point(2, 2);
ToggleElementMorph.prototype.shadowAlpha = 0.6;
ToggleElementMorph.prototype.fontSize = 10; // only for (optional) labels
ToggleElementMorph.prototype.inactiveColor = new Color(180, 180, 180);

// ToggleElementMorph instance creation:

function ToggleElementMorph(
	target,
	action,
	element,
    query,
	environment,
	hint,
    builder,
    labelString
) {
	this.init(
		target,
		action,
		element,
        query,
		environment,
		hint,
        builder,
        labelString
	);
}

ToggleElementMorph.prototype.init = function (
	target,
	action,
	element, // mandatory
    query,
	environment,
	hint,
    builder, // optional function name that rebuilds the element
    labelString
) {
	// additional properties:
	this.target = target || null;
	this.action = action || null;
	this.element = element;
	this.query = query || function () {return true; };
	this.environment = environment || null;
	this.hint = hint || null;
    this.builder = builder || 'nop';
	this.captionString = labelString || null;
	this.labelAlignment = 'right';
	this.state = false;

	// initialize inherited properties:
	TriggerMorph.uber.init.call(this);

    // override inherited properties:
    this.color = element.color;
    this.createLabel();
};

// ToggleElementMorph drawing:

ToggleElementMorph.prototype.createBackgrounds = function () {
    this.color = this.element.color;
    this.element.removeShadow();
    this.element[this.builder].call(this.element);
	this.element.addShadow(this.shadowOffset, this.shadowAlpha);
    this.silentSetExtent(this.element.fullBounds().extent()); // w/ shadow
    this.pressImage = this.element.fullImage();

    this.element.removeShadow();
    this.element.setColor(this.inactiveColor);
    this.element[this.builder].call(this.element, this.contrast);
	this.element.addShadow(this.shadowOffset, 0);
    this.normalImage = this.element.fullImage();

    this.element.removeShadow();
    this.element.setColor(this.color.lighter(this.contrast));
    this.element[this.builder].call(this.element, this.contrast);
	this.element.addShadow(this.shadowOffset, this.shadowAlpha);
    this.highlightImage = this.element.fullImage();

    this.element.removeShadow();
    this.element.setColor(this.color);
    this.element[this.builder].call(this.element);
	this.image = this.normalImage;
};

ToggleElementMorph.prototype.setColor = function (aColor) {
    this.element.setColor(aColor);
    this.createBackgrounds();
    this.refresh();
};

// ToggleElementMorph layout:

ToggleElementMorph.prototype.createLabel = function () {
    var y;
    if (this.captionString) {
        this.label = new StringMorph(
            this.captionString,
            this.fontSize,
            this.fontStyle,
            true
        );
        this.add(this.label);
        y = this.top() + (this.height() - this.label.height()) / 2;
        if (this.labelAlignment === 'right') {
            this.label.setPosition(new Point(
                this.right(),
                y
            ));
        } else {
            this.label.setPosition(new Point(
                this.left() - this.label.width(),
                y
            ));
        }
    }
};

// ToggleElementMorph action

ToggleElementMorph.prototype.trigger
    = ToggleButtonMorph.prototype.trigger;

ToggleElementMorph.prototype.refresh
    = ToggleButtonMorph.prototype.refresh;

// ToggleElementMorph events

ToggleElementMorph.prototype.mouseEnter
    = ToggleButtonMorph.prototype.mouseEnter;

ToggleElementMorph.prototype.mouseLeave
    = ToggleButtonMorph.prototype.mouseLeave;

ToggleElementMorph.prototype.mouseDownLeft
    = ToggleButtonMorph.prototype.mouseDownLeft;

ToggleElementMorph.prototype.mouseClickLeft
    = ToggleButtonMorph.prototype.mouseClickLeft;

// DialogBoxMorph /////////////////////////////////////////////////////

// I am a DialogBox frame

// DialogBoxMorph inherits from Morph:

DialogBoxMorph.prototype = new Morph();
DialogBoxMorph.prototype.constructor = DialogBoxMorph;
DialogBoxMorph.uber = Morph.prototype;

// DialogBoxMorph preferences settings:

DialogBoxMorph.prototype.fontSize = 12;
DialogBoxMorph.prototype.titleFontSize = 14;
DialogBoxMorph.prototype.fontStyle = 'sans-serif';

DialogBoxMorph.prototype.color = PushButtonMorph.prototype.color;
DialogBoxMorph.prototype.titleTextColor = new Color(255, 255, 255);
DialogBoxMorph.prototype.titleBarColor
	= PushButtonMorph.prototype.pressColor;

DialogBoxMorph.prototype.contrast = 40;

DialogBoxMorph.prototype.corner = 12;
DialogBoxMorph.prototype.padding = 14;
DialogBoxMorph.prototype.titlePadding = 8;

DialogBoxMorph.prototype.buttonContrast = 50;
DialogBoxMorph.prototype.buttonFontSize = 12;
DialogBoxMorph.prototype.buttonCorner = 12;
DialogBoxMorph.prototype.buttonEdge = 6;
DialogBoxMorph.prototype.buttonPadding = 0;
DialogBoxMorph.prototype.buttonOutline = 3;
DialogBoxMorph.prototype.buttonOutlineColor
	= PushButtonMorph.prototype.color;
DialogBoxMorph.prototype.buttonOutlineGradient = true;


// DialogBoxMorph instance creation:

function DialogBoxMorph(target, action, environment) {
	this.init(target, action, environment);
}

DialogBoxMorph.prototype.init = function (target, action, environment) {
	// additional properties:
	this.target = target || null;
	this.action = action || null;
	this.environment = environment || null;

	this.labelString = null;
	this.label = null;
	this.head = null;
	this.body = null;
	this.buttons = null;

	// initialize inherited properties:
	DialogBoxMorph.uber.init.call(this);

	// override inherited properites:
	this.isDraggable = true;
	this.color = PushButtonMorph.prototype.color;
	this.createLabel();
	this.createButtons();
	this.setExtent(new Point(300, 150));
};

// DialogBoxMorph ops
DialogBoxMorph.prototype.inform = function (
	title,
	textString,
	world,
	pic
) {
	var txt = new TextMorph(
		textString,
		this.fontSize,
		this.fontStyle,
		true,
		false,
		'center'
	);
	this.labelString = title;
	this.createLabel();
	if (pic) {this.setPicture(pic); }
	this.addBody(txt);
	this.addButton('ok', 'Ok');
	this.drawNew();
	this.fixLayout();
	if (world) {
		world.add(this);
		world.keyboardReceiver = this;
		this.setCenter(world.center());
	}
};

DialogBoxMorph.prototype.askYesNo = function (
	title,
	textString,
	world,
	pic
) {
	var txt = new TextMorph(
		textString,
		this.fontSize,
		this.fontStyle,
		true,
		false,
		'center'
	);
	this.labelString = title;
	this.createLabel();
	if (pic) {this.setPicture(pic); }
	this.addBody(txt);
	this.addButton('ok', 'Yes');
	this.addButton('cancel', 'No');
    this.fixLayout();
	this.drawNew();
	this.fixLayout();
	if (world) {
		world.add(this);
		world.keyboardReceiver = this;
		this.setCenter(world.center());
	}
};

DialogBoxMorph.prototype.prompt = function (
	title,
	defaultString,
	world,
	pic
) {
	var txt = new InputFieldMorph(defaultString);
	txt.setWidth(250);
	this.labelString = title;
	this.createLabel();
	if (pic) {this.setPicture(pic); }
	this.addBody(txt);
	txt.drawNew();
	this.addButton('ok', 'Ok');
	this.addButton('cancel', 'Cancel');
    this.fixLayout();
	this.drawNew();
	this.fixLayout();
	if (world) {
		world.add(this);
		//world.keyboardReceiver = this;
		this.setCenter(world.center());
		this.edit();
	}
};

DialogBoxMorph.prototype.accept = function () {
	/*
	if target is a function, use it as callback:
	execute target as callback function with action as argument
	in the environment as optionally specified.
	Note: if action is also a function, instead of becoming
	the argument itself it will be called to answer the argument.
	for selections, Yes/No Choices etc:

	else (if target is not a function):

		if action is a function:
		execute the action with target as environment (can be null)
		for lambdafied (inline) actions

		else if action is a String:
		treat it as function property of target and execute it
		for selector-like actions
	*/
	if (this.action) {
		if (typeof this.target === 'function') {
			if (typeof this.action === 'function') {
				this.target.call(this.environment, this.action.call());
			} else {
				this.target.call(this.environment, this.action);
			}
		} else {
			if (typeof this.action === 'function') {
				this.action.call(this.target, this.getInput());
			} else { // assume it's a String
				this.target[this.action].call(
					this.target,
					this.getInput()
				);
			}
		}
	}
	this.destroy();
};

DialogBoxMorph.prototype.ok = function () {
	this.accept();
};

DialogBoxMorph.prototype.cancel = function () {
	this.destroy();
};

DialogBoxMorph.prototype.edit = function () {
	this.children.forEach(function (c) {
		if (c.edit) {
			return c.edit();
		}
	});
};

DialogBoxMorph.prototype.getInput = function () {
	if (this.body instanceof InputFieldMorph) {
		return this.body.getValue();
	}
	return null;
};

DialogBoxMorph.prototype.justDropped = function (hand) {
	hand.world.keyboardReceiver = this;
	this.edit();
};

DialogBoxMorph.prototype.destroy = function () {
	this.world().keyboardReceiver = null;
	DialogBoxMorph.uber.destroy.call(this);
};

DialogBoxMorph.prototype.normalizeSpaces = function (string) {
    var ans = '', i, c, flag = false;

    for (i = 0; i < string.length; i += 1) {
        c = string[i];
        if (c === ' ') {
            if (flag) {
                ans += c;
                flag = false;
            }
        } else {
            ans += c;
            flag = true;
        }
    }
    return ans.trim();
};

// DialogBoxMorph submorph construction

DialogBoxMorph.prototype.createLabel = function () {
	if (this.label) {
		this.label.destroy();
	}
	if (this.labelString) {
		this.label = new StringMorph(
			this.labelString,
			this.titleFontSize,
			this.fontStyle,
			true,
			false,
			false,
			new Point(2, 1),
			this.titleBarColor.darker(this.contrast)
		);
		this.label.color = this.titleTextColor;
		this.label.drawNew();
		this.add(this.label);
	}
};

DialogBoxMorph.prototype.createButtons = function () {
	if (this.buttons) {
		this.buttons.destroy();
	}
	this.buttons = new AlignmentMorph('row', this.padding);
	this.add(this.buttons);
};

DialogBoxMorph.prototype.addButton = function (action, label) {
	var button = new PushButtonMorph(
		this,
		action || 'ok',
		'  ' + (label || 'Ok') + '  '
	);
	button.fontSize = this.buttonFontSize;
	button.corner = this.buttonCorner;
	button.edge = this.buttonEdge;
	button.outline = this.buttonOutline;
	button.outlineColor = this.buttonOutlineColor;
	button.outlineGradient = this.buttonOutlineGradient;
	button.padding = this.buttonPadding;
    button.contrast = this.buttonContrast;
	button.drawNew();
	button.fixLayout();
	this.buttons.add(button);
    return button;
};

DialogBoxMorph.prototype.setPicture = function (aMorphOrCanvas) {
	var morph;
    if (aMorphOrCanvas instanceof Morph) {
        morph = aMorphOrCanvas;
    } else {
        morph = new Morph();
        morph.image = aMorphOrCanvas;
        morph.silentSetWidth(aMorphOrCanvas.width);
        morph.silentSetHeight(aMorphOrCanvas.height);
    }
	this.addHead(morph);
};

DialogBoxMorph.prototype.addHead = function (aMorph) {
	if (this.head) {
		this.head.destroy();
	}
	this.head = aMorph;
	this.add(this.head);
};

DialogBoxMorph.prototype.addBody = function (aMorph) {
	if (this.body) {
		this.body.destroy();
	}
	this.body = aMorph;
	this.add(this.body);
};

// DialogBoxMorph layout

DialogBoxMorph.prototype.addShadow = function () {nop(); };
DialogBoxMorph.prototype.removeShadow = function () {nop(); };

DialogBoxMorph.prototype.fixLayout = function () {
	var th = fontHeight(this.titleFontSize) + this.titlePadding * 2, w;

	if (this.head) {
		this.head.setPosition(this.position().add(new Point(
			this.padding,
			th + this.padding
		)));
		this.silentSetWidth(this.head.width() + this.padding * 2);
		this.silentSetHeight(
			this.head.height()
				+ this.padding * 2
				+ th
		);
	}

	if (this.body) {
		if (this.head) {
			this.body.setPosition(this.head.bottomLeft().add(new Point(
				0,
				this.padding
			)));
			this.silentSetWidth(Math.max(
				this.width(),
				this.body.width() + this.padding * 2
			));
			this.silentSetHeight(
				this.height()
					+ this.body.height()
					+ this.padding
			);
			w = this.width();
			this.head.setLeft(
				this.left()
					+ (w - this.head.width()) / 2
			);
			this.body.setLeft(
				this.left()
					+ (w - this.body.width()) / 2
			);
		} else {
			this.body.setPosition(this.position().add(new Point(
				this.padding,
				th + this.padding
			)));
			this.silentSetWidth(this.body.width() + this.padding * 2);
			this.silentSetHeight(
				this.body.height()
					+ this.padding * 2
					+ th
			);
		}
	}

	if (this.label) {
		this.label.setCenter(this.center());
		this.label.setTop(this.top() + (th - this.label.height()) / 2);
	}

	if (this.buttons && (this.buttons.children.length > 0)) {
		this.buttons.fixLayout();
		this.silentSetHeight(
			this.height()
					+ this.buttons.height()
					+ this.padding
		);
		this.buttons.setCenter(this.center());
		this.buttons.setBottom(this.bottom() - this.padding);
	}
};

// DialogBoxMorph keyboard events

DialogBoxMorph.prototype.processKeyPress = function () {nop(); };

DialogBoxMorph.prototype.processKeyDown = function (event) {
	// this.inspectKeyEvent(event);
	switch (event.keyCode) {
	case 13:
		this.ok();
		break;
	case 27:
		this.cancel();
		break;
	default:
		// this.inspectKeyEvent(event);
	}
};

// DialogBoxMorph drawing

DialogBoxMorph.prototype.drawNew = function () {
	this.fullChanged();
	Morph.prototype.trackChanges = false;
	DialogBoxMorph.uber.removeShadow.call(this);
	this.fixLayout();

	var	context,
		gradient,
		w = this.width(),
		h = this.height(),
		th = fontHeight(this.titleFontSize) + this.titlePadding * 2,
		shift = this.corner / 2,
		x,
		y;

	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');

	// title bar
	gradient = context.createLinearGradient(0, 0, 0, th);
	gradient.addColorStop(
		0,
		this.titleBarColor.lighter(this.contrast / 2).toString()
	);
	gradient.addColorStop(
		1,
		this.titleBarColor.darker(this.contrast).toString()
	);
	context.fillStyle = gradient;
	context.beginPath();
	this.outlinePathTitle(
		context,
		this.corner
	);
	context.closePath();
	context.fill();

	// flat shape
	// body
	context.fillStyle = this.color.toString();
	context.beginPath();
	this.outlinePathBody(
		context,
		this.corner
	);
	context.closePath();
	context.fill();

	// 3D-effect
	// bottom left corner
	gradient = context.createLinearGradient(
		0,
		h - this.corner,
		0,
		h
	);
	gradient.addColorStop(0, this.color.toString());
	gradient.addColorStop(1, this.color.darker(this.contrast.toString()));

	context.lineWidth = this.corner;
	context.lineCap = 'round';
	context.strokeStyle = gradient;

	context.beginPath();
	context.moveTo(this.corner, h - shift);
	context.lineTo(this.corner + 1, h - shift);
	context.stroke();

	// bottom edge
	gradient = context.createLinearGradient(
		0,
		h - this.corner,
		0,
		h
	);
	gradient.addColorStop(0, this.color.toString());
	gradient.addColorStop(1, this.color.darker(this.contrast.toString()));

	context.lineWidth = this.corner;
	context.lineCap = 'butt';
	context.strokeStyle = gradient;

	context.beginPath();
	context.moveTo(this.corner, h - shift);
	context.lineTo(w - this.corner, h - shift);
	context.stroke();

	// right body edge
	gradient = context.createLinearGradient(
		w - this.corner,
		0,
		w,
		0
	);
	gradient.addColorStop(0, this.color.toString());
	gradient.addColorStop(1, this.color.darker(this.contrast).toString());

	context.lineWidth = this.corner;
	context.lineCap = 'butt';
	context.strokeStyle = gradient;

	context.beginPath();
	context.moveTo(w - shift, th);
	context.lineTo(w - shift, h - this.corner);
	context.stroke();

	// bottom right corner
	x = w - this.corner;
	y = h - this.corner;

	gradient = context.createRadialGradient(
		x,
		y,
		0,
		x,
		y,
		this.corner
	);
	gradient.addColorStop(0, this.color.toString());
	gradient.addColorStop(1, this.color.darker(this.contrast.toString()));

	context.lineCap = 'butt';

	context.strokeStyle = gradient;

	context.beginPath();
	context.arc(
		x,
		y,
		shift,
		radians(90),
		radians(0),
		true
	);
	context.stroke();

	// left body edge
	gradient = context.createLinearGradient(
		0,
		0,
		this.corner,
		0
	);
	gradient.addColorStop(1, this.color.toString());
	gradient.addColorStop(
		0,
		this.color.lighter(this.contrast).toString()
	);

	context.lineCap = 'butt';
	context.strokeStyle = gradient;

	context.beginPath();
	context.moveTo(shift, th);
	context.lineTo(shift, h - this.corner * 2);
	context.stroke();

	// left vertical bottom corner
	gradient = context.createLinearGradient(
		0,
		0,
		this.corner,
		0
	);
	gradient.addColorStop(1, this.color.toString());
	gradient.addColorStop(
		0,
		this.color.lighter(this.contrast).toString()
	);

	context.lineCap = 'round';
	context.strokeStyle = gradient;

	context.beginPath();
	context.moveTo(shift, h - this.corner * 2);
	context.lineTo(shift, h - this.corner - shift);
	context.stroke();

	DialogBoxMorph.uber.addShadow.call(this);
	Morph.prototype.trackChanges = true;
	this.fullChanged();
};

DialogBoxMorph.prototype.outlinePathTitle = function (context, radius) {
	var	w = this.width(),
		h = fontHeight(this.titleFontSize) + this.titlePadding * 2;

	// top left:
	context.arc(
		radius,
		radius,
		radius,
		radians(-180),
		radians(-90),
		false
	);
	// top right:
	context.arc(
		w - radius,
		radius,
		radius,
		radians(-90),
		radians(-0),
		false
	);
	// bottom right:
	context.lineTo(w, h);

	// bottom left:
	context.lineTo(0, h);
};

DialogBoxMorph.prototype.outlinePathBody = function (context, radius) {
	var	w = this.width(),
		h = this.height(),
		th = fontHeight(this.titleFontSize) + this.titlePadding * 2;


	// top left:
	context.moveTo(0, th);

	// top right:
	context.lineTo(w, th);

	// bottom right:
	context.arc(
		w - radius,
		h - radius,
		radius,
		radians(0),
		radians(90),
		false
	);
	// bottom left:
	context.arc(
		radius,
		h - radius,
		radius,
		radians(90),
		radians(180),
		false
	);
};

// AlignmentMorph /////////////////////////////////////////////////////

// I am a reified layout, either a row or a column of submorphs

// AlignmentMorph inherits from Morph:

AlignmentMorph.prototype = new Morph();
AlignmentMorph.prototype.constructor = AlignmentMorph;
AlignmentMorph.uber = Morph.prototype;

// AlignmentMorph instance creation:

function AlignmentMorph(orientation, padding) {
	this.init(orientation, padding);
}

AlignmentMorph.prototype.init = function (orientation, padding) {
	// additional properties:
	this.orientation = orientation || 'row'; // or 'column'
	this.padding = padding || 0;
    this.respectHiddens = false;

	// initialize inherited properties:
	AlignmentMorph.uber.init.call(this);

	// override inherited properites:
};

// AlignmentMorph displaying and layout

AlignmentMorph.prototype.drawNew = function () {
	this.image = newCanvas(new Point(1, 1));
	this.fixLayout();
};

AlignmentMorph.prototype.fixLayout = function () {
	var	myself = this,
		last = null,
		newBounds;
	if (this.children.length === 0) {
		return null;
	}
	this.children.forEach(function (c) {
		var	cfb = c.fullBounds(),
			lfb;
        if (c.isVisible || myself.respectHiddens) {
            if (last) {
                lfb = last.fullBounds();
                if (myself.orientation === 'row') {
                    c.setPosition(
                        lfb.topRight().add(new Point(
                            myself.padding,
                            (lfb.height() - cfb.height()) / 2
                        ))
                    );
                } else { // orientation === 'column'
                    c.setPosition(
                        lfb.bottomLeft().add(new Point(
                            (lfb.width() - cfb.width()) / 2,
                            myself.padding
                        ))
                    );
                }
                newBounds = newBounds.merge(cfb);
            } else {
                newBounds = cfb;
            }
            last = c;
        }
	});
	this.bounds = newBounds;
};

// InputFieldMorph //////////////////////////////////////////////////////

// InputFieldMorph inherits from Morph:

InputFieldMorph.prototype = new Morph();
InputFieldMorph.prototype.constructor = InputFieldMorph;
InputFieldMorph.uber = Morph.prototype;

// InputFieldMorph settings

InputFieldMorph.prototype.edge = 2;
InputFieldMorph.prototype.fontSize = 12;
InputFieldMorph.prototype.typeInPadding = 4;
InputFieldMorph.prototype.contrast = 65;

// InputFieldMorph instance creation:

function InputFieldMorph(text, isNumeric) {
	this.init(text, isNumeric);
}

InputFieldMorph.prototype.init = function (text, isNumeric) {
	var	contents = new StringFieldMorph(text || '');

	this.isNumeric = isNumeric || false;

	contents.alpha = 0;
	contents.fontSize = this.fontSize;
	contents.drawNew();

	this.oldContentsExtent = contents.extent();
	this.isNumeric = isNumeric || false;

	InputFieldMorph.uber.init.call(this);
	this.color = new Color(255, 255, 255);
	this.add(contents);
	contents.isDraggable = false;
	this.drawNew();
};

// InputFieldMorph accessing:

InputFieldMorph.prototype.contents = function () {
	return detect(
		this.children,
		function (child) {
			return (child instanceof StringFieldMorph);
		}
	);
};

InputFieldMorph.prototype.setContents = function (aStringOrFloat) {
	var cnts = this.contents();
	cnts.text.text = aStringOrFloat;
	if (aStringOrFloat === undefined) {
		return null;
	}
    if (aStringOrFloat === null) {
		cnts.text.text = '';
	} else if (aStringOrFloat.toString) {
		cnts.text.text = aStringOrFloat.toString();
	}
	cnts.drawNew();
};

InputFieldMorph.prototype.edit = function () {
	var c = this.contents();
	c.text.edit();
	c.text.selectAll();
};

InputFieldMorph.prototype.setIsNumeric = function (bool) {
    var value;

    this.isNumeric = bool;
    this.contents().isNumeric = bool;
    this.contents().text.isNumeric = bool;

    // adjust my shown value to conform with the numeric flag
    value = this.getValue();
    if (this.isNumeric) {
        value = parseFloat(value);
        if (isNaN(value)) {
            value = null;
        }
    }
    this.setContents(value);
};

// InputSlotMorph layout:

InputFieldMorph.prototype.fixLayout = function () {
	var	contents = this.contents();

	if (!contents) {return null; }
	contents.isNumeric = this.isNumeric;
	this.silentSetHeight(
		contents.height()
			+ this.edge * 2
			+ this.typeInPadding * 2
	);
	this.silentSetWidth(Math.max(
		contents.minWidth
			+ this.edge * 2
			+ this.typeInPadding * 2,
		this.width()
	));

	contents.setWidth(
		this.width() - this.edge - this.typeInPadding
	);

	contents.silentSetPosition(new Point(
		this.edge,
		this.edge
	).add(this.typeInPadding).add(this.position()));
};

// InputFieldMorph retrieving:

InputFieldMorph.prototype.getValue = function () {
/*
	answer my content's text string. If I am numerical convert that
	string to a number. If the conversion fails answer the string
	otherwise the numerical value.
*/
	var	num,
		contents = this.contents();
	if (this.isNumeric) {
		num = parseFloat(contents.text);
		if (!isNaN(num)) {
			return num;
		}
	}
	return contents.string();
};

// InputFieldMorph drawing:

InputFieldMorph.prototype.drawNew = function () {
	var context, borderColor;

	this.fixLayout();

	// initialize my surface property
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	if (this.parent) {
		this.color = this.parent.color.lighter(this.contrast * 0.75);
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

InputFieldMorph.prototype.drawRectBorder = function (context) {
	var	shift = this.edge * 0.5,
		gradient;

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	context.shadowOffsetY = shift;
	context.shadowBlur = this.height() / 3;
	context.shadowColor = this.cachedClrDark;

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

modules.blocks = '2012-Mar-27';

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
				{
					sound1 : 'sound1',
					sound2 : 'sound2',
					sound3 : 'sound3'
				},
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
		blockWidth,
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
		blockWidth = this.arrows().width();
	} else if (this instanceof ReporterBlockMorph) {
		blockWidth = (this.rounding * 2) + (this.edge * 2);
	} else {
		blockWidth = (this.corner * 4)
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
	this.selector = null;	// name of method to be triggered
	this.blockSpec = '';	// formal description of label and arguments

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

/*

	threads.js

	a tail call optimized blocks-based programming language interpreter
	based on morphic.js and blocks.js
	inspired by Scratch, Scheme and Squeak

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
	needs blocks.js and objects.js


	toc
	---
	the following list shows the order in which all constructors are
	defined. Use this list to locate code in this document:

		ThreadManager
		Process
		Context
		VariableFrame
        UpvarReference


	credits
	-------
	John Maloney and Dave Feinberg designed the original Scratch evaluator
	Ivan Motyashov contributed initial porting from Squeak

*/

// globals from blocks.js:

/*global ArgMorph, ArrowMorph, BlockHighlightMorph, BlockMorph,
BooleanSlotMorph, BoxMorph, Color, ColorPaletteMorph, ColorSlotMorph,
CommandBlockMorph, CommandSlotMorph, FrameMorph, HatBlockMorph,
InputSlotMorph, MenuMorph, Morph, MultiArgMorph, Point,
ReporterBlockMorph, ScriptsMorph, ShadowMorph, StringMorph,
SyntaxElementMorph, TextMorph, WorldMorph, blocksVersion, contains,
degrees, detect, getDocumentPositionOf, newCanvas, nop, radians,
useBlurredShadows, ReporterSlotMorph, CSlotMorph*/

// globals from objects.js:

/*global StageMorph, SpriteMorph*/

// globals from morphic.js:

/*global modules, isString, copy*/

// globals from gui.js:

/*global WatcherMorph*/

// globals from lists.js:

/*global List, ListWatcherMorph*/

/*global alert, console*/

// Global stuff ////////////////////////////////////////////////////////

modules.threads = '2012-Mar-20';

var ThreadManager;
var Process;
var Context;
var VariableFrame;
var UpvarReference;

function snapEquals(a, b) {
	if (a instanceof List || (b instanceof List)) {
		if (a instanceof List && (b instanceof List)) {
			return a.equalTo(b);
		}
		return false;
	}
	var	x = parseFloat(a),
		y = parseFloat(b);
	if (isNaN(x) || isNaN(y)) {
		x = a;
		y = b;
	}
	return x === y;
}

// ThreadManager ///////////////////////////////////////////////////////

function ThreadManager() {
	this.processes = [];
}

ThreadManager.prototype.toggleProcess = function (block) {
	var	active = this.findProcess(block);
	if (active) {
		active.stop();
	} else {
		return this.startProcess(block);
	}
};

ThreadManager.prototype.startProcess = function (block) {
	var	active = this.findProcess(block),
		top = block.topBlock(),
		newProc;
	if (active) {
		active.stop();
		this.removeTerminatedProcesses();
	}
	top.addHighlight();
	newProc = new Process(block.topBlock());
	this.processes.push(newProc);
	return newProc;
};

ThreadManager.prototype.stopAll = function () {
	this.processes.forEach(function (proc) {
		proc.stop();
	});
};

ThreadManager.prototype.stopProcess = function (block) {
	var active = this.findProcess(block);
	if (active) {
		active.stop();
	}
};

ThreadManager.prototype.step = function () {
/*
	run each process until it gives up control, skipping processes
	for sprites that are currently picked up, then filter out any
	processes that have been terminated
*/
	this.processes.forEach(function (proc) {
		if (!proc.homeContext.receiver.isPickedUp()) {
			proc.runStep();
		}
	});
	this.removeTerminatedProcesses();
};

ThreadManager.prototype.removeTerminatedProcesses = function () {
	// and un-highlight their scripts
	var remaining = [];
	this.processes.forEach(function (proc) {
		if (!proc.isRunning() && !proc.errorFlag) {
			proc.topBlock.removeHighlight();
			if (proc.topBlock instanceof ReporterBlockMorph) {
				if (proc.homeContext.inputs[0] instanceof List) {
					proc.topBlock.showBubble(new ListWatcherMorph(
						proc.homeContext.inputs[0]
					));
				} else {
					proc.topBlock.showBubble(proc.homeContext.inputs[0]);
				}
			}

		} else {
			remaining.push(proc);
		}
	});
	this.processes = remaining;
};

ThreadManager.prototype.findProcess = function (block) {
	var top = block.topBlock();
	return detect(
		this.processes,
		function (each) {
			return each.topBlock === top;
		}
	);
};

// Process /////////////////////////////////////////////////////////////

/*
	A Process is what brings a stack of blocks to life. The process
	keeps track of which block to run next, evaluates block arguments,
	handles control structures, and so forth.

	The ThreadManager is the (passive) scheduler, telling each process
	when to run by calling its runStep() method. The runStep() method
	will execute some number of blocks, then voluntarily yield control
	so that the ThreadManager can run another process.

	The Scratch etiquette is that a process should yield control at the
	end of every loop iteration, and while it is running a timed command
	(e.g. "wait 5 secs") or a synchronous command (e.g. "broadcast xxx
	and wait"). Since Snap also has lambda and custom blocks Snap adds
	yields at the beginning of each non-atomic custom command block
	execution, and - to let users escape infinite loops and recursion -
	whenever the process runs into a timeout.

	a Process runs for a receiver, i.e. a sprite or the stage or any
	blocks-scriptable object that we'll introduce.

	structure:

	topBlock			the stack's first block, of which all others
						are children
	receiver			object (sprite) to which the process applies,
						cached from the top block
	context				the Context describing the current state
						of this process
	homeContext			stores information relevant to the whole process,
						i.e. its receiver, result etc.
	readyToYield		boolean indicating whether to yield control to
						another process
	readyToTerminate	boolean indicating whether the stop method has
						been called
	timeout				msecs after which to force yield
	lastYield			msecs when the process last yielded
	errorFlag			boolean indicating whether an error was encountered
*/

Process.prototype = {};
Process.prototype.contructor = Process;
Process.prototype.timeout = 500; // msecs after which to force yield
Process.prototype.isCatchingErrors = true;

function Process(topBlock) {
	this.topBlock = topBlock || null;

	this.readyToYield = false;
	this.readyToTerminate = false;
	this.errorFlag = false;
	this.context = null;
	this.homeContext = new Context();
	this.lastYield = Date.now();
	this.isAtomic = false;

	if (topBlock) {
		this.homeContext.receiver = topBlock.receiver();
		this.homeContext.variables.parentFrame =
			this.homeContext.receiver.variables;
		this.context = new Context(
			null,
			topBlock.blockSequence(),
			this.homeContext
		);
		this.pushContext('doYield'); // highlight top block
	}
}

// Process accessing

Process.prototype.isRunning = function () {
	return (this.context !== null) && (!this.readyToTerminate);
};

// Process entry points

Process.prototype.runStep = function () {
/*
	a step is an an uninterruptable 'atom', it can consist
	of several contexts, even of several blocks
*/
	this.readyToYield = false;
	while (!this.readyToYield
			&& this.context
			&& (Date.now() - this.lastYield < this.timeout)) {
		this.evaluateContext();
	}
	this.lastYield = Date.now();
	if (this.readyToTerminate) {
		while (this.context) {
			this.popContext();
		}
		if (this.homeContext.receiver) {
            if (this.homeContext.receiver.endWarp) {
                // pen optimization
                this.homeContext.receiver.endWarp();
            }
		}
	}
};

Process.prototype.stop = function () {
	this.readyToYield = true;
	this.readyToTerminate = true;
	this.errorFlag = false;
};

// Process evaluation

Process.prototype.evaluateContext = function () {
	var exp = this.context.expression;

	if (exp instanceof Array) {
		return this.evaluateSequence(exp);
	}
    if (exp instanceof MultiArgMorph) {
		return this.evaluateMultiSlot(exp, exp.inputs().length);
	}
    if (exp instanceof ArgMorph || exp.bindingID) {
		return this.evaluateInput(exp);
	}
    if (exp instanceof BlockMorph) {
		return this.evaluateBlock(exp, exp.inputs().length);
	}
    if (isString(exp)) {
		return this[exp].call(this);
	}
    this.popContext(); // default: just ignore it
};

Process.prototype.evaluateBlock = function (block, argCount) {
	// first evaluate all inputs, then apply the primitive
	var	rcvr = this.context.receiver,
		inputs = this.context.inputs;

	if (argCount > inputs.length) {
		this.evaluateNextInput(block);
	} else {
		if (this[block.selector]) {
			rcvr = this;
		}
        if (this.isCatchingErrors) {
            try {
                this.returnValueToParentContext(
                    rcvr[block.selector].apply(rcvr, inputs)
                );
                this.popContext();
            } catch (error) {
                this.handleError(error, block);
            }
        } else {
            this.returnValueToParentContext(
                rcvr[block.selector].apply(rcvr, inputs)
            );
            this.popContext();
        }
	}
};

Process.prototype.evaluateMultiSlot = function (multiSlot, argCount) {
	// first evaluate all subslots, then return a list of their values
	var inputs = this.context.inputs;
	if (argCount > inputs.length) {
		this.evaluateNextInput(multiSlot);
	} else {
		this.returnValueToParentContext(new List(inputs));
		this.popContext();
	}
};

Process.prototype.evaluateInput = function (input) {
	// evaluate the input unless it is bound to an implicit parameter
	var ans;
	if (input.bindingID) {
        if (this.isCatchingErrors) {
            try {
                ans = this.context.variables.getVar(input.bindingID);
            } catch (error) {
                this.handleError(error, input);
            }
        } else {
            ans = this.context.variables.getVar(input.bindingID);
        }
	} else {
		ans = input.evaluate();
		if (ans) {
			if (contains(
					[CommandSlotMorph, ReporterSlotMorph],
					input.constructor
				) || (input instanceof CSlotMorph && !input.isStatic)) {
				// I know, this still needs yet to be done right....
				ans = this.reify(ans, new List());
			}
		}
	}
	this.returnValueToParentContext(ans);
	this.popContext();
};


Process.prototype.evaluateSequence = function (arr) {
	var pc = this.context.pc,
        outer = this.context.outerContext,
        isLambda = this.context.isLambda,
        isCustomBlock = this.context.isCustomBlock,
        upvars = this.context.upvars;

    if (pc === (arr.length - 1)) { // tail call elimination
        this.context = new Context(
            this.context.parentContext,
            arr[pc],
            this.context.outerContext,
            this.context.receiver,
            this.context.isInsideCustomBlock
        );
        this.context.isLambda = isLambda;
        this.context.isCustomBlock = isCustomBlock;
        if (upvars) {
            this.context.upvars = new UpvarReference(upvars);
        }
    } else {
        if (pc >= arr.length) {
            this.popContext();
        } else {
            this.context.pc += 1;
            this.pushContext(arr[pc], outer);
        }
    }
};

/*
// version w/o tail call optimization:
--------------------------------------
Caution: we cannot just revert to this version of the method, because to make
tail call elimination work many tweaks had to be done to various primitives.
For the most part these tweaks are about schlepping the outer context (for
the variable bindings) and the isLambda flag along, and are indicated by a
short comment in the code. But to really revert would take a good measure
of trial and error as well as debugging. In the developers file archive there
is a version of threads.js dated 120119(2) which basically resembles the
last version before introducing tail call optimization on 120123.

Process.prototype.evaluateSequence = function (arr) {
	var	pc = this.context.pc;
	if (pc >= arr.length) {
		this.popContext();
	} else {
		this.context.pc += 1;
		this.pushContext(arr[pc]);
	}
};
*/

Process.prototype.evaluateNextInput = function (element) {
	var	nxt = this.context.inputs.length,
		args = element.inputs(),
		exp = args[nxt],
        outer = this.context.outerContext; // for tail call elimination

	if (exp.isUnevaluated) {
		if (exp.isUnevaluated()) { // just return the input as-is
			/*
				Note: we only reify the input here, it it's not and
                input to a reification primitive itself (THE BLOCK,
                THE SCRIPT), because those allow for additional
                explicit parameter bindings.
			*/
            if (contains(['reify', 'reportScript'],
                    this.context.expression.selector)) {
                this.context.addInput(exp);
            } else {
                this.context.addInput(this.reify(exp, new List()));
            }
		} else {
			this.pushContext(exp, outer);
		}
	} else {
		this.pushContext(exp, outer);
	}
};

Process.prototype.doYield = function () {
	this.popContext();
	if (!this.isAtomic) {
		this.readyToYield = true;
	}
};

// Process Exception Handling

Process.prototype.handleError = function (error, element) {
	this.errorFlag = true;
	this.topBlock.addErrorHighlight();
    (element || this.topBlock).showBubble(
        (element ? '' : 'Inside: ')
            + error.name
            + '\n'
            + error.message
    );
	while (this.context.parentContext) {
		this.popContext();
	}
};

// Process Lambda primitives

Process.prototype.reportScript = function (parameterNames, topBlock) {
	return this.reify(topBlock, parameterNames);
};

Process.prototype.reify = function (topBlock, parameterNames) {
	var	context = new Context(
			null,
			null,
			this.context ? this.context.outerContext : null
		),
		i = 0;

	if (topBlock) {
		context.expression = topBlock.fullCopy();

		// mark all empty slots with an identifier
		context.expression.allEmptySlots().forEach(function (slot) {
			i += 1;
			slot.bindingID = i;
		});
		// and remember the number of detected empty slots
		context.emptySlots = i;

	} else {
		context.expression = this.context.expression.fullCopy();
	}

	context.inputs = parameterNames.asArray();
	context.receiver
		= this.context ? this.context.receiver : topBlock.receiver();

	return context;
};

Process.prototype.doRun = function (context, args, isCustomBlock) {
	return this.evaluate(context, args, true, isCustomBlock);
};

Process.prototype.evaluate = function (
    context,
    args,
    isCommand,
    isCustomBlock
) {
    if (!context) {return null; }
	if (context.isContinuation) {
		return this.runContinuation(context, args);
	}

	var	outer = new Context(null, null, context.outerContext),
		runnable,
		extra,
		parms = args.asArray(),
		i,
		value,
        declarations = isCustomBlock ?
                this.context.expression.definition.declarations : null,
        upvars;

	if (!outer.receiver) {
		outer.receiver = context.receiver; // for custom blocks
	}
	runnable = new Context(
		this.context.parentContext,
		context.expression,
		outer,
		context.receiver,
        isCustomBlock || this.context.isInsideCustomBlock
	);
	extra = new Context(runnable, 'doYield');

	/*
		Note: if the context's expression is a ReporterBlockMorph,
		the extra context gets popped off immediately without taking
		effect (i.e. it doesn't yield within evaluating a stack of
		nested reporters)
	*/

	if (isCommand || (context.expression instanceof ReporterBlockMorph)) {
		this.context.parentContext = extra;
	} else {
		this.context.parentContext = runnable;
	}

	runnable.isLambda = true;
    runnable.isCustomBlock = isCustomBlock || false;

	// assing parameters if any were passed
	if (parms.length > 0) {

		// assign formal parameters
		for (i = 0; i < context.inputs.length; i += 1) {
			value = 0;
			if (parms[i]) {
				value = parms[i];
			}
			outer.variables.addVar(context.inputs[i], value);

            // if the parameter is an upvar,
            // create an UpvarReference to it
            if (isCustomBlock) {
                if (declarations[context.inputs[i]][0] === '%upvar') {
                    if (!upvars) { // lazy initialization
                        upvars = new UpvarReference(this.context.upvars);
                    }
                    upvars.addReference(
                        value,
                        context.inputs[i],
                        outer.variables
                    );
                }
            }
		}

		// assign implicit parameters if there are no formal ones
		if (context.inputs.length === 0) {
			// in case there is only one input
			// assign it to all empty slots
			if (parms.length === 1) {
				for (i = 1; i <= context.emptySlots; i += 1) {
					outer.variables.addVar(i, parms[0]);
				}

			// if the number of inputs matches the number
			// of empty slots distribute them sequentially
			} else if (parms.length === context.emptySlots) {
				for (i = 1; i <= parms.length; i += 1) {
					outer.variables.addVar(i, parms[i - 1]);
				}
			} else {
                throw new Error(
                    'expecting ' + context.emptySlots + ' input(s), '
                        + 'but getting ' + parms.length
                );
            }
		}
	} else { // check for empty slots
        if (context.emptySlots) {
            throw new Error(
                'expecting ' + context.emptySlots + ' input(s), '
                    + 'but getting none'
            );
        }
    }

    if (upvars) {
        runnable.upvars = upvars;
    } else if (this.context.upvars) {
        runnable.upvars = new UpvarReference(this.context.upvars);
    }

	if (runnable.expression instanceof CommandBlockMorph) {
		runnable.expression = runnable.expression.blockSequence();
	}
};

Process.prototype.fork = function (context, args) {
	if (context.isContinuation) {
		throw new Error(
			'continuations cannot be forked'
		);
	}

	var	outer = new Context(null, null, context.outerContext),
		runnable = new Context(null,
			context.expression,
			outer
			),
		parms = args.asArray(),
		i,
		value,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph),
		proc = new Process();

	runnable.isLambda = true;

	// assign parameters if any were passed
	if (parms.length > 0) {

		// assign formal parameters
		for (i = 0; i < context.inputs.length; i += 1) {
			value = 0;
			if (parms[i]) {
				value = parms[i];
			}
			outer.variables.addVar(context.inputs[i], value);
		}

		// assign implicit parameters if there are no formal ones
		if (context.inputs.length === 0) {
			// in case there is only one input
			// assign it to all empty slots
			if (parms.length === 1) {
				for (i = 1; i <= context.emptySlots; i += 1) {
					outer.variables.addVar(i, parms[0]);
				}

			// if the number of inputs matches the number
			// of empty slots distribute them sequentially
			} else if (parms.length === context.emptySlots) {
				for (i = 1; i <= parms.length; i += 1) {
					outer.variables.addVar(i, parms[i - 1]);
				}
			} else {
                throw new Error(
                    'expecting ' + context.emptySlots + ' input(s), '
                        + 'but getting ' + parms.length
                );
            }
		}
	} else { // check for empty slots
        if (context.emptySlots) {
            throw new Error(
                'expecting ' + context.emptySlots + ' input(s), '
                    + 'but getting none'
            );
        }
    }

	if (runnable.expression instanceof CommandBlockMorph) {
		runnable.expression = runnable.expression.blockSequence();
	}

	proc.homeContext = context.outerContext;
	proc.topBlock = context.expression;
	proc.context = runnable;
	proc.pushContext('doYield');
	stage.threads.processes.push(proc);
};

Process.prototype.doReport = function (value) {
    if (this.context.isInsideCustomBlock) {
        while (this.context && !this.context.isCustomBlock) {
            this.popContext();
        }
        if (this.context) {
            // now I'm back at the custom block sequence.
            // advance my pc to my expression's length
            this.context.pc = this.context.expression.length - 1;
        }
    } else {
        while (this.context && !this.context.isLambda) {
            this.popContext();
        }
    }
	return value;
};

// Process evaluation variants, commented out for now (redundant)

/*
Process.prototype.doRunWithInputList = function (context, args) {
    // provide an extra selector for the palette
	return this.doRun(context, args);
};

Process.prototype.evaluateWithInputList = function (context, args) {
    // provide an extra selector for the palette
    return this.evaluate(context, args);
};

Process.prototype.forkWithInputList = function (context, args) {
    // provide an extra selector for the palette
    return this.fork(context, args);
};
*/

// Process continuations primitives

Process.prototype.doCallCC = function (aContext) {
	this.evaluate(aContext, new List([this.context.continuation()]));
};

Process.prototype.reportCallCC = function (aContext) {
	this.doCallCC(aContext);
};

Process.prototype.runContinuation = function (aContext, args) {
	var parms = args.asArray();
	this.context.parentContext = aContext.copyForContinuation();
	// passing parameter if any was passed
	if (parms.length === 1) {
		this.context.parentContext.outerContext.variables.addVar(
			1,
			parms[0]
		);
	}
};

// Process custom block primitives

Process.prototype.evaluateCustomBlock = function () {
	var	lambda = this.context.expression.definition.body,
		args = new List(this.context.inputs);
	return this.doRun(lambda, args, true);
};

// Process variables primitives

Process.prototype.doDeclareVariables = function (varNames) {
	var varFrame = this.context.outerContext.variables;
	varNames.asArray().forEach(function (name) {
		varFrame.addVar(name);
	});
};

Process.prototype.doSetVar = function (varName, value) {
	var varFrame = this.context.variables;
	varFrame.setVar(varName, value, this.context.parentContext);
};

Process.prototype.doChangeVar = function (varName, value) {
	var varFrame = this.context.variables;
	varFrame.changeVar(varName, value, this.context.parentContext);
};

Process.prototype.reportGetVar = function () {
	// assumes a getter block whose blockSpec is a variable name
    var varName = this.context.expression.blockSpec,
        upvarReference;

    if (this.context.upvars) {
        upvarReference = this.context.upvars.find(varName);
        if (upvarReference) {
            return upvarReference.getVar(varName);
        }
    }
	return this.context.variables.getVar(
		varName,
		this.context.parentContext
	);
};

Process.prototype.doShowVar = function (varName) {
	var	varFrame = this.context.variables,
		stage,
		watcher,
		target,
		label,
		others;
	if (this.homeContext.receiver) {
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
		if (stage) {
			target = varFrame.find(varName, this.context.parentContext);

			// first try to find an existing (hidden) watcher
			watcher = detect(
				stage.children,
				function (morph) {
					return morph instanceof WatcherMorph
						&& morph.target === target
						&& morph.getter === varName;
				}
			);
			if (watcher !== null) {
				watcher.show();
				watcher.fixLayout(); // re-hide hidden parts
				return;
			}
			// if no watcher exists, create a new one
			if (target.owner) {
				label = varName;
			} else {
				label = varName + ' (temporary)';
			}
			watcher = new WatcherMorph(
				label,
				SpriteMorph.prototype.blockColor.variables,
				target,
				varName
			);
			watcher.setPosition(stage.position().add(10));
			others = stage.watchers(watcher.left());
			if (others.length > 0) {
				watcher.setTop(others[others.length - 1].bottom());
			}
			stage.add(watcher);
			watcher.fixLayout();
		}
	}
};

Process.prototype.doHideVar = function (varName) {
	// if no varName is specified delete all watchers on temporaries
	var	varFrame = this.context.variables,
		stage,
		watcher,
		target;
	if (!varName) {
		this.doRemoveTemporaries();
		return;
	}
	if (this.homeContext.receiver) {
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
		if (stage) {
			target = varFrame.find(varName, this.context.parentContext);
			watcher = detect(
				stage.children,
				function (morph) {
					return morph instanceof WatcherMorph
						&& morph.target === target
						&& morph.getter === varName;
				}
			);
			if (watcher !== null) {
				if (watcher.isTemporary()) {
					watcher.destroy();
				} else {
					watcher.hide();
				}
			}
		}
	}
};

Process.prototype.doRemoveTemporaries = function () {
	var	stage;
	if (this.homeContext.receiver) {
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
		if (stage) {
			stage.watchers().forEach(function (watcher) {
				if (watcher.isTemporary()) {
					watcher.destroy();
				}
			});
		}
	}
};

// Process lists primitives

Process.prototype.reportNewList = function (elements) {
	return elements;
};

Process.prototype.reportCONS = function (car, cdr) {
	return new List().cons(car, cdr);
};

Process.prototype.reportCDR = function (list) {
	return list.cdr();
};

Process.prototype.doAddToList = function (element, list) {
	list.add(element);
};

Process.prototype.doDeleteFromList = function (index, list) {
	var idx = index;
	if (index === 'all') {
		return list.clear();
	}
    if (index === '') {
		return null;
	}
    if (index === 'last') {
		idx = list.length();
	}
	list.remove(idx);
};

Process.prototype.doInsertInList = function (element, index, list) {
	var idx = index;
	if (index === '') {
		return null;
	}
    if (index === 'any') {
		idx = this.reportRandom(1, list.length());
	}
    if (index === 'last') {
		idx = list.length() + 1;
	}
	list.add(element, idx);
};

Process.prototype.doReplaceInList = function (index, list, element) {
	var idx = index;
	if (index === '') {
		return null;
	}
    if (index === 'any') {
		idx = this.reportRandom(1, list.length());
	}
    if (index === 'last') {
		idx = list.length();
	}
	list.put(element, idx);
};

Process.prototype.reportListItem = function (index, list) {
	var idx = index;
	if (index === '') {
		return null;
	}
    if (index === 'any') {
		idx = this.reportRandom(1, list.length());
	}
    if (index === 'last') {
		idx = list.length();
	}
	return list.at(idx);
};

Process.prototype.reportListLength = function (list) {
	return list.length();
};

Process.prototype.reportListContainsItem = function (list, element) {
	return list.contains(element);
};

// Process conditionals primitives

Process.prototype.doIf = function () {
	var args = this.context.inputs,
        outer = this.context.outerContext, // for tail call elimination
        isInsideCustomBlock = this.context.isInsideCustomBlock,
        isLambda = this.context.isLambda,
        isCustomBlock = this.context.isCustomBlock;

	this.popContext();
	if (args[0]) {
		if (args[1]) {
			this.pushContext(args[1].blockSequence(), outer);
            this.context.isInsideCustomBlock = isInsideCustomBlock;
            this.context.isLambda = isLambda;
            this.context.isCustomBlock = isCustomBlock;
		}
	}
	this.pushContext();
};

Process.prototype.doIfElse = function () {
	var args = this.context.inputs,
        outer = this.context.outerContext, // for tail call elimination
        isInsideCustomBlock = this.context.isInsideCustomBlock,
        isLambda = this.context.isLambda,
        isCustomBlock = this.context.isCustomBlock;

	this.popContext();
	if (args[0]) {
		if (args[1]) {
			this.pushContext(args[1].blockSequence(), outer);
		}
	} else {
		if (args[2]) {
			this.pushContext(args[2].blockSequence(), outer);
		}
	}
    if (this.context) {
        this.context.isInsideCustomBlock = isInsideCustomBlock;
        this.context.isLambda = isLambda;
        this.context.isCustomBlock = isCustomBlock;
    }

	this.pushContext();
};

// Process process related primitives

Process.prototype.doStop = function () {
	this.stop();
};

Process.prototype.doStopAll = function () {
	var stage;
	if (this.homeContext.receiver) {
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
		if (stage) {
            stage.keysPressed = {};
			stage.threads.stopAll();
		}
	}
};

Process.prototype.doWarp = function (body) {
	// execute my contents block atomically (more or less)
    var outer = this.context.outerContext, // for tail call elimination
        isInsideCustomBlock = this.context.isInsideCustomBlock,
        isLambda = this.context.isLambda,
        isCustomBlock = this.context.isCustomBlock;

	this.popContext();

	if (body) {
		if (this.homeContext.receiver) {
            if (this.homeContext.receiver.startWarp) {
                // pen optimization
                this.homeContext.receiver.startWarp();
            }
		}

		this.pushContext('doYield');

        // not sure of this is the correct location for the flags
        this.context.isInsideCustomBlock = isInsideCustomBlock;
        this.context.isLambda = isLambda;
        this.context.isCustomBlock = isCustomBlock;

		if (!this.isAtomic) {
			this.pushContext('doStopWarping');
		}
		this.pushContext(body.blockSequence(), outer);
		this.isAtomic = true;
	}
	this.pushContext();
};

Process.prototype.doStopWarping = function () {

	this.popContext();
	this.isAtomic = false;
	if (this.homeContext.receiver) {
        if (this.homeContext.receiver.endWarp) {
            // pen optimization
            this.homeContext.receiver.endWarp();
        }
	}
};

// Process loop primitives

Process.prototype.doForever = function (body) {
	this.pushContext('doYield');
	if (body) {
		this.pushContext(body.blockSequence());
	}
	this.pushContext();
};

Process.prototype.doRepeat = function (counter, body) {
	var block = this.context.expression,
        outer = this.context.outerContext, // for tail call elimination
        isInsideCustomBlock = this.context.isInsideCustomBlock,
        isLambda = this.context.isLambda,
        isCustomBlock = this.context.isCustomBlock;

	if (counter < 1) { // was '=== 0', which caused infinite loops on non-ints
		return null;
	}
	this.popContext();

	this.pushContext(block, outer);

    this.context.isInsideCustomBlock = isInsideCustomBlock;
    this.context.isLambda = isLambda;
    this.context.isCustomBlock = isCustomBlock;

	this.context.addInput(counter - 1);

	this.pushContext('doYield');
	if (body) {
		this.pushContext(body.blockSequence());
	}

	this.pushContext();
};

Process.prototype.doUntil = function (goalCondition, body) {
	if (goalCondition) {
		this.popContext();
		this.pushContext('doYield');
		return null;
	}
	this.context.inputs = [];
	this.pushContext('doYield');
	if (body) {
		this.pushContext(body.blockSequence());
	}
	this.pushContext();
};

Process.prototype.doWaitUntil = function (goalCondition) {
	if (goalCondition) {
		this.popContext();
		this.pushContext('doYield');
		return null;
	}
	this.context.inputs = [];
	this.pushContext('doYield');
	this.pushContext();
};

// Process interpolated primitives

Process.prototype.doWait = function (secs) {
	if (!this.context.startTime) {
		this.context.startTime = Date.now();
	}
	if ((Date.now() - this.context.startTime) >= (secs * 1000)) {
		return null;
	}
	this.pushContext('doYield');
	this.pushContext();
};

Process.prototype.doGlide = function (secs, endX, endY) {
	if (!this.context.startTime) {
		this.context.startTime = Date.now();
		this.context.startValue = new Point(
			this.homeContext.receiver.xPosition(),
			this.homeContext.receiver.yPosition()
		);
	}
	if ((Date.now() - this.context.startTime) >= (secs * 1000)) {
		this.homeContext.receiver.gotoXY(endX, endY);
		return null;
	}
	this.homeContext.receiver.glide(
		secs * 1000,
		endX,
		endY,
		Date.now() - this.context.startTime,
		this.context.startValue
	);

	this.pushContext('doYield');
	this.pushContext();
};

Process.prototype.doSayFor = function (data, secs) {
	if (!this.context.startTime) {
		this.context.startTime = Date.now();
        this.homeContext.receiver.bubble(data);
	}
	if ((Date.now() - this.context.startTime) >= (secs * 1000)) {
        this.homeContext.receiver.stopTalking();
		return null;
	}
	this.pushContext('doYield');
	this.pushContext();
};

Process.prototype.doThinkFor = function (data, secs) {
	if (!this.context.startTime) {
		this.context.startTime = Date.now();
        this.homeContext.receiver.doThink(data);
	}
	if ((Date.now() - this.context.startTime) >= (secs * 1000)) {
        this.homeContext.receiver.stopTalking();
		return null;
	}
	this.pushContext('doYield');
	this.pushContext();
};

// Process event messages primitives

Process.prototype.doBroadcast = function (message) {
	var stage = this.homeContext.receiver.parentThatIsA(StageMorph),
        hats = [],
        procs = [];

	if (message !== '') {
        stage.children.concat(stage).forEach(function (morph) {
            if (morph instanceof SpriteMorph || morph instanceof StageMorph) {
                hats = hats.concat(morph.allHatBlocksFor(message));
            }
        });
        hats.forEach(function (block) {
            procs.push(stage.threads.startProcess(block));
        });
	}
    return procs;
};

Process.prototype.doBroadcastAndWait = function (message) {
    if (!this.context.activeSends) {
        this.context.activeSends = this.doBroadcast(message);
    }
    this.context.activeSends = this.context.activeSends.filter(
        function (proc) {
            return proc.isRunning();
        }
    );
	if (this.context.activeSends.length === 0) {
		return null;
	}
	this.pushContext('doYield');
	this.pushContext();
};

// Process math primtives

Process.prototype.reportSum = function (a, b) {
	return parseFloat(a) + parseFloat(b);
};

Process.prototype.reportDifference = function (a, b) {
	return parseFloat(a) - parseFloat(b);
};

Process.prototype.reportProduct = function (a, b) {
	return parseFloat(a) * parseFloat(b);
};

Process.prototype.reportQuotient = function (a, b) {
	return parseFloat(a) / parseFloat(b);
};

Process.prototype.reportModulus = function (a, b) {
    var x = parseFloat(a),
        y = parseFloat(b);
	return ((x % y) + y) % y;
};

Process.prototype.reportRandom = function (min, max) {
	var	floor = parseFloat(min),
		ceil = parseFloat(max);
	if ((floor % 1 !== 0) || (ceil % 1 !== 0)) {
		return Math.random() * (ceil - floor) + floor;
	}
    return Math.floor(Math.random() * (ceil - floor + 1)) + floor;
};

Process.prototype.reportLessThan = function (a, b) {
	var	x = parseFloat(a),
		y = parseFloat(b);
	if (isNaN(x) || isNaN(y)) {
		x = a;
		y = b;
	}
	return x < y;
};

Process.prototype.reportAnd = function (a, b) {
	return a && b;
};

Process.prototype.reportOr = function (a, b) {
	return a || b;
};

Process.prototype.reportNot = function (bool) {
	return !bool;
};

Process.prototype.reportGreaterThan = function (a, b) {
	var	x = parseFloat(a),
		y = parseFloat(b);
	if (isNaN(x) || isNaN(y)) {
		x = a;
		y = b;
	}
	return x > y;
};

Process.prototype.reportEquals = function (a, b) {
	return snapEquals(a, b);
};

Process.prototype.reportTrue = function () {
	return true;
};

Process.prototype.reportFalse = function () {
	return false;
};

Process.prototype.reportRound = function (n) {
	return Math.round(parseFloat(n));
};

Process.prototype.reportJoin = function (a, b) {
    var x = (a || '').toString(),
        y = (b || '').toString();
	return x.concat(y);
};

Process.prototype.reportJoinWords = function (aList) {
    if (aList instanceof List) {
        return aList.asText();
    }
    return (aList || '').toString();
};

// Process string ops

Process.prototype.reportLetter = function (idx, string) {
    var i = parseFloat(idx || 0),
        str = (string || '').toString();
	return str[i - 1];
};

Process.prototype.reportStringSize = function (string) {
    var str = (string || '').toString();
	return str.length;
};

Process.prototype.reportUnicode = function (string) {
    var str = (string || '').toString()[0];
    return str ? str.charCodeAt(0) : 0;
};

Process.prototype.reportUnicodeAsLetter = function (num) {
    var code = parseFloat(num || 0);
    return String.fromCharCode(code);
};

// Process debugging

Process.prototype.alert = function (data) {
    // debugging primitives only work in dev mode, otherwise they're nop
    var world;
	if (this.homeContext.receiver) {
        world = this.homeContext.receiver.world();
        if (world.isDevMode) {
            alert('Snap! ' + data.asArray());
        }
    }
};

Process.prototype.log = function (data) {
    // debugging primitives only work in dev mode, otherwise they're nop
    var world;
	if (this.homeContext.receiver) {
        world = this.homeContext.receiver.world();
        if (world.isDevMode) {
            console.log('Snap! ' + data.asArray());
        }
    }
};

// Process sensing primitives

Process.prototype.reportTouchingObject = function (name) {
	var thisObj = this.homeContext.receiver,
        thatObj,
        stage,
        mouse;

	if (thisObj) {
        if (name === 'mouse-pointer') {
            mouse = thisObj.world().hand.position();
            if (thisObj.bounds.containsPoint(mouse)) {
                return !thisObj.isTransparentAt(mouse);
            }
            return false;
        }
		stage = thisObj.parentThatIsA(StageMorph);
		if (stage) {
            if (name === 'edge') {
                return !stage.bounds.containsRectangle(thisObj.bounds);
            }
            thatObj = detect(
                stage.children,
                function (morph) {return morph.name === name; }
            );
            if (thatObj) {
                return thisObj.isTouching(thatObj);
            }
		}
	}
	return false;
};

Process.prototype.reportMouseX = function () {
	var stage, world;
	if (this.homeContext.receiver) {
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
		if (stage) {
			world = stage.world();
			if (world) {
				return world.hand.position().x - stage.center().x;
			}
		}
	}
	return 0;
};

Process.prototype.reportMouseY = function () {
	var stage, world;
	if (this.homeContext.receiver) {
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
		if (stage) {
			world = stage.world();
			if (world) {
				return stage.center().y - world.hand.position().y;
			}
		}
	}
	return 0;
};

Process.prototype.reportMouseDown = function () {
	var world;
	if (this.homeContext.receiver) {
		world = this.homeContext.receiver.world();
		if (world) {
            return world.hand.mouseButton === 'left';
		}
	}
	return false;
};

Process.prototype.reportKeyPressed = function (keyString) {
	var stage;
	if (this.homeContext.receiver) {
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
		if (stage) {
            return stage.keysPressed[keyString] !== undefined;
		}
	}
	return false;
};

Process.prototype.doResetTimer = function () {
	var stage;
	if (this.homeContext.receiver) {
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
		if (stage) {
			stage.resetTimer();
		}
	}
};

Process.prototype.reportTimer = function () {
	var stage;
	if (this.homeContext.receiver) {
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
		if (stage) {
			return stage.getTimer();
		}
	}
	return 0;
};

// Process stack

Process.prototype.pushContext = function (expression, outerContext) {
    var upvars = this.context ? this.context.upvars : null;
	this.context = new Context(
		this.context,
		expression,
		outerContext || (this.context ? this.context.outerContext : null),
            // for tail call elimination
        this.context ? // check needed due to tail call elimination
                this.context.receiver : this.homeContext.receiver,
        this.context ? // check needed due to tail call elimination
                this.context.isInsideCustomBlock : false
	);
    if (upvars) {
        this.context.upvars = new UpvarReference(upvars);
    }
};

Process.prototype.popContext = function () {
	this.context = this.context ? this.context.parentContext : null;
};

Process.prototype.returnValueToParentContext = function (value) {
	// if no parent context exists treat value as result
	if (value !== undefined) {
		var target = this.context ? // in case of tail call elimination
                this.context.parentContext || this.homeContext
            : this.homeContext;
		target.addInput(value);
	}
};

// Context /////////////////////////////////////////////////////////////

/*
	A Context describes the state of a Process.

	Each Process has a pointer to a Context containing its
	state. Whenever the Process yields control, its Context
	tells it exactly where it left off.

	structure:

	parentContext	the Context to return to when this one has
					been evaluated.
	outerContext	the Context holding my lexical scope
	expression		SyntaxElementMorph, an array of blocks to evaluate,
					null or a String denoting a selector, e.g. 'doYield'
	receiver		the object to which the expression applies, if any
	variables		the current VariableFrame, if any
    upvars          the current UpvarReference, if any (default: null)
	inputs			an array of input values computed so far
					(if expression is a	BlockMorph)
	pc				the index of the next block to evaluate
					(if expression is an array)
	startTime		time when the context was first evaluated
	startValue		initial value for interpolated operations
	isLambda		marker for return ops
    isInsideCustomBlock marker for return ops
    isCustomBlock   marker for return ops
	emptySlots		caches the number of empty slots for reification
*/

function Context(
    parentContext,
    expression,
    outerContext,
    receiver,
    isInsideCustomBlock // marks every frame inside a custom block' body
) {
	this.outerContext = outerContext || null;
	this.parentContext = parentContext || null;
	this.expression = expression || null;
	this.receiver = receiver || null;
	this.variables = new VariableFrame();
	if (this.outerContext) {
		this.variables.parentFrame = this.outerContext.variables;
		this.receiver = this.outerContext.receiver;
	}
    this.upvars = null; // set to an UpvarReference in custom blocks
	this.inputs = [];
	this.pc = 0;
	this.startTime = null;
	this.isLambda = false; // marks the end of a lambda
    this.isInsideCustomBlock = isInsideCustomBlock || false;
    this.isCustomBlock = false; // marks the end of a custom block's stack
    this.emptySlots = 0; // used for block reification
}

Context.prototype.toString = function () {
	var pref = this.isLambda ? '\u03BB-' : '',
        expr = this.expression;

	if (expr instanceof Array) {
		if (expr.length > 0) {
			expr = '[' + expr[0] + ']';
		}
	}
	return pref + 'Context >> ' + expr + ' ' + this.variables;
};

Context.prototype.image = function () {
	if (this.expression instanceof Morph) {
		return this.expression.fullImage();
	}
    if (this.expression instanceof Array) {
		return this.expression[this.pc].fullImage();
	}
    return newCanvas();
};

// Context continuations:

Context.prototype.continuation = function () {
	var cont;
	if (this.expression instanceof Array) {
		cont = this;
	} else if (this.parentContext) {
		cont = this.parentContext;
	} else {
		return null;
	}
	cont = cont.copyForContinuation();
	cont.isContinuation = true;
	return cont;
};

Context.prototype.copyForContinuation = function () {
	var	cpy = copy(this),
		cur = cpy,
		isReporter = this.expression instanceof BlockMorph;

	if (isReporter) {
		cur.prepareContinuationForBinding();
	}
	while (cur.parentContext) {
		cur.parentContext = copy(cur.parentContext);
		cur = cur.parentContext;
		if (isReporter) {
			cur.inputs = [];
		}
	}
	return cpy;
};

Context.prototype.prepareContinuationForBinding = function () {
	this.expression = this.expression.fullCopy();
	this.inputs = [];

	// mark slot containing the call/cc reporter with an identifier
	detect(this.expression.inputs(), function (inp) {
		return inp.selector && (inp.selector === 'reportCallCC');
	}).bindingID = 1;

	// and remember the number of detected empty slots
	this.emptySlots = 1;
};

// Context accessing:

Context.prototype.addInput = function (input) {
	this.inputs.push(input);
};

// Context debugging

Context.prototype.stackSize = function () {
    if (!this.parentContext) {
        return 1;
    }
    return 1 + this.parentContext.stackSize();
};

// VariableFrame ///////////////////////////////////////////////////////

function VariableFrame(parentFrame, owner) {
	this.vars = {};
	this.parentFrame = parentFrame || null;
	this.owner = owner || null;
}

VariableFrame.prototype.toString = function () {
	return 'a VariableFrame {' + this.names() + '}';
};

VariableFrame.prototype.copy = function () {
	var frame = new VariableFrame(this.parentFrame);
	frame.vars = copy(this.vars);
	return frame;
};

VariableFrame.prototype.find = function (name, parentContext) {
/*
	answer the closest variable frame containing
	the specified variable. If it doesn't exist in
	the lexical scope look it up in the dynamical
	scope, and if it still doesn't exist, throw
	an exception.
*/
	if (this.vars[name] !== undefined) {
		return this;
	}
	if (this.parentFrame) {
		return this.parentFrame.find(name, parentContext);
	}
	if (parentContext) {
		return parentContext.variables.find(
			name,
			parentContext.parentContext
		);
	}
	throw new Error(
		'a variable of name \''
			+ name
			+ '\'\ndoes not exist in this context'
	);
};

VariableFrame.prototype.setVar = function (name, value, parentContext) {
/*
	change the specified variable if it exists
	else throw an error, because variables need to be
	declared explicitly (e.g. through a "script variables" block),
	before they can be accessed.
*/
	var	frame = this.find(name, parentContext),
		num = parseFloat(value);
	if (frame) {
		if (isNaN(num)) {
			frame.vars[name] = value;
		} else {
			frame.vars[name] = num;
		}
	}
};

VariableFrame.prototype.changeVar = function (name, delta, parentContext) {
/*
	change the specified variable if it exists
	else throw an error, because variables need to be
	declared explicitly (e.g. through a "script variables" block,
	before they can be accessed.
*/
	var	frame = this.find(name, parentContext),
		value;
	if (frame) {
		value = parseFloat(frame.vars[name]);
		if (isNaN(value)) {
			frame.vars[name] = delta;
		} else {
			frame.vars[name] += delta;
		}
	}
};

VariableFrame.prototype.getVar = function (name, parentContext) {
	var	frame = this.find(name, parentContext),
		value;
	if (frame) {
		value = frame.vars[name];
		return (value === 0 ? 0 : value || 0); // don't return null
	}
	return null;
};

VariableFrame.prototype.addVar = function (name, value) {
	this.vars[name] = (value === 0 ? 0 : value || null);
};

VariableFrame.prototype.deleteVar = function (name, parentContext) {
	var	frame = this.find(name, parentContext);
	if (frame) {
		delete frame.vars[name];
	}
};

// VariableFrame tools

VariableFrame.prototype.names = function () {
	var each, names = [];
	for (each in this.vars) {
        if (this.vars.hasOwnProperty(each)) {
            names.push(each);
        }
	}
	return names;
};

VariableFrame.prototype.allNamesDict = function () {
	var dict = {}, current = this;

	function addKeysToDict(srcDict, trgtDict) {
		var eachKey;
		for (eachKey in srcDict) {
            if (srcDict.hasOwnProperty(eachKey)) {
                trgtDict[eachKey] = eachKey;
            }
		}
	}

	while (current) {
		addKeysToDict(current.vars, dict);
		current = current.parentFrame;
	}
	return dict;
};

VariableFrame.prototype.allNames = function () {
/*
	only show the names of the lexical scope, hybrid scoping is
	reserved to the daring ;-)
*/
	var answer = [], each, dict = this.allNamesDict();

	for (each in dict) {
        if (dict.hasOwnProperty(each)) {
            answer.push(each);
        }
	}
	return answer;
};

// UpvarReference ///////////////////////////////////////////////////////////

// ... quasi-inherits some features from VariableFrame

function UpvarReference(parent) {
	this.vars = {}; // structure: {upvarName : [varName, varFrame]}
	this.parentFrame = parent || null;
}

UpvarReference.prototype.addReference = function (
    upvarName,
    varName,
    varFrame
) {
    this.vars[upvarName] = [varName, varFrame];
};

UpvarReference.prototype.find = function (name) {
/*
	answer the closest upvar reference containing
	the specified variable, or answer null.
*/
	if (this.vars[name] !== undefined) {
		return this;
	}
	if (this.parentFrame) {
		return this.parentFrame.find(name);
	}
    return null;
};

UpvarReference.prototype.getVar = function (name) {
	var varName = this.vars[name][0],
        varFrame = this.vars[name][1],
        value = varFrame.vars[varName];
    return (value === 0 ? 0 : value || 0); // don't return null
};

// UpvarReference tools

UpvarReference.prototype.toString = function () {
	return 'an UpvarReference {' + this.names() + '}';
};

// UpvarReference quasi-inheritance from VariableFrame

UpvarReference.prototype.names = VariableFrame.prototype.names;
UpvarReference.prototype.allNames = VariableFrame.prototype.allNames;
UpvarReference.prototype.allNamesDict = VariableFrame.prototype.allNamesDict;

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


	credits
	-------
	Ian Reynolds contributed initial porting of primitives from Squeak

*/

// gloabls from lists.js:

/*global ListWatcherMorph*/

// gloabls from widgets.js:

/*global PushButtonMorph, ToggleMorph, DialogBoxMorph*/

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

modules.objects = '2012-Mar-29';

var SpriteMorph;
var StageMorph;
var Costume;
var CostumeEditorMorph;
var CellMorph;
var WatcherMorph;

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
    }
    this.version = Date.now();
};

SpriteMorph.prototype.rotationCenter = function () {
    if (this.costume) {
        return this.position().add(this.rotationOffset);
    }
    return this.center();
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

        txt = new TextMorph(
            'sound primitives are\nnot yet implemented'
        );
        txt.fontSize = 9;
        txt.setColor(new Color(230, 230, 230));
        blocks.push(txt);

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

SpriteMorph.prototype.bubble = function (data, isThought) {
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
        this.bubbleBorderColor,
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
        procs.push(stage.threads.startProcess(block));
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
	Currently I inherit from FrameMorph and copy from SpriteMorph.
    Once I'm done I'll inherit from ObjectMorph
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
    this.version = Date.now(); // for observers

	this.timerStart = Date.now();

	this.watcherUpdateFrequency = 2;
	this.lastWatcherUpdate = Date.now();

    this.keysPressed = {}; // for handling keyboard events, do not persist
    this.blocksCache = {}; // not to be serialized (!)foo

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
        procs.push(myself.threads.startProcess(block));
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

        txt = new TextMorph(
            'sound primitives are\nnot yet implemented'
        );
        txt.fontSize = 9;
        txt.setColor(new Color(230, 230, 230));
        blocks.push(txt);

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
	this.drawNew();
	this.changed();
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

// StageMorph non-variable watchers

StageMorph.prototype.toggleWatcher
    = SpriteMorph.prototype.toggleWatcher;

StageMorph.prototype.showingWatcher
    = SpriteMorph.prototype.showingWatcher;

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
    this.background = this.createTexture();
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
    var rp, ctx, pattern;

    this.margin = this.size.subtract(this.costume.extent()).divideBy(2);
    rp = this.rotationCenter.add(this.margin);

    this.silentSetExtent(this.size);

    this.image = newCanvas(this.extent());
    ctx = this.image.getContext('2d');

    // draw the background
    pattern = ctx.createPattern(this.background, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, this.size.x, this.size.y);

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

function WatcherMorph(label, color, target, getter) {
	this.init(label, color, target, getter);
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
    saving and loading of projects has been contributed by
    Nathan Dinsmore

*/

/*global modules, Morph, SpriteMorph, BoxMorph, SyntaxElementMorph, Color,
ListWatcherMorph, isString, TextMorph, newCanvas, useBlurredShadows,
radians, VariableFrame, StringMorph, Point, SliderMorph, MenuMorph,
morphicVersion, DialogBoxMorph, ToggleButtonMorph, contains,
ScrollFrameMorph, StageMorph, PushButtonMorph, InputFieldMorph, FrameMorph,
Process, nop, XMLSerializer, ListMorph, detect, AlignmentMorph, TabMorph,
Costume, CostumeEditorMorph*/

// Global stuff ////////////////////////////////////////////////////////

modules.gui = '2012-Mar-27';

// Declarations

var IDE_Morph;
var SpriteIconMorph;
var CostumeIconMorph;
var WardrobeMorph;

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
        this.label.setLeft(this.projectButton.right() + padding);
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
        [
            myself.groupColor.darker(40),
            myself.groupColor.darker(60),
            myself.groupColor.lighter(30)
        ],
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
        scripts.color = this.color.copy();
        scripts.texture = 'scriptsPaneTexture.gif';

        this.spriteEditor = new ScrollFrameMorph(scripts);
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

IDE_Morph.prototype.droppedImage = function (aCanvas) {
    var costume = new Costume(aCanvas);
    this.currentSprite.addCostume(costume);
    this.currentSprite.wearCostume(costume);
    this.spriteBar.tabBar.tabTo('costumes');
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
        procs.push(myself.stage.threads.startProcess(block));
    });
    return procs;
};

IDE_Morph.prototype.stopAllScripts = function () {
    this.stage.keysPressed = {};
    this.stage.threads.stopAll();
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

    aboutTxt = 'Snap!\nBuild Your Own Blocks\n\n--- pre-alpha ---\n\n'
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
        + '\n\nIvan Motyashov\nInitial Squeak Porting'
        + '\n\nIan Reynolds\nUI Design, Event Bindings'
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

/*

	lists.js

	list data structure and GUI for SNAP!

	written by Jens Mönig and Brian Harvey
	jens@moenig.org, bh@cs.berkeley.edu

	Copyright (C) 2012 by Jens Mönig and Brian Harvey

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
	needs morphic.js, widgets.js and gui.js


	I. hierarchy
	-------------
	the following tree lists all constructors hierarchically,
	indentation indicating inheritance. Refer to this list to get a
	contextual overview:

	List

	BoxMorph*
		ListWatcherMorph

	* from Morphic.js


	II. toc
	-------
	the following list shows the order in which all constructors are
	defined. Use this list to locate code in this document:

	List
	ListWatcherMorph

*/

// Global settings /////////////////////////////////////////////////////

/*global modules, contains, BoxMorph, WorldMorph, HandleMorph,
PushButtonMorph, SyntaxElementMorph, Color, Point, WatcherMorph,
StringMorph, SpriteMorph, ScrollFrameMorph, CellMorph, ArrowMorph,
MenuMorph, snapEquals, Morph*/

modules.lists = '2012-Mar-14';

var List;
var ListWatcherMorph;

// List ////////////////////////////////////////////////////////////////

/*
	I am a dynamic array data structure for SNAP!
	My index starts with 1

	I am a "smart" hybrid list, because I can be used as both a linked
	list and as a dynamic array

	public interface:

	setters (linked):
	-----------------
	cons				- answer a new list with the given item in front
	cdr					- answer all but the first element

	setters (arrayed):
	------------------
	add(element, index)	- insert the element before the given slot,
	put(element, index)	- overwrite the element at the given slot
	remove(index)		- remove the given slot, shortening the list
	clear()				- remove all elements

	getters (all hybrid):
	---------------------
	length()			- number of slots
	at(index)			- element present in specified slot
	contains(element)	- <bool>

	conversion:
	-----------
	asArray()			- answer me as JavaScript array
    asText()            - answer my elements (recursively) concatenated
*/

// List instance creation:

function List(array) {
	this.contents = array || [];
	this.first = null;
	this.rest = null;
	this.isLinked = false;
	this.lastChanged = Date.now();
}

List.prototype.toString = function () {
    return 'a List [' + this.asArray + ']';
};

// List updating:

List.prototype.changed = function () {
	this.lastChanged = Date.now();
};

// Linked List ops:

List.prototype.cons = function (car, cdr) {
	var answer = new List();
	answer.first = car || null;
	answer.rest = cdr || null;
	answer.isLinked = true;
	return answer;
};

List.prototype.cdr = function () {
    function helper(i) {
        if (i > this.contents.length) {
            return new List();
        }
        return this.cons(this.at(i), helper.call(this, i + 1));
    }
    if (this.isLinked) {
        return this.rest || new List();
    }
    if (this.contents.length < 2) {
        return new List();
    }
    return helper.call(this, 2);
};

// List array setters:

List.prototype.add = function (element, index) {
/*
	insert the element before the given slot index,
	if no index is specifed, append the element
*/
	var	idx = index || this.length() + 1,
		obj = element || null;
	this.becomeArray();
	this.contents.splice(idx - 1, 0, obj);
	this.changed();
};

List.prototype.put = function (element, index) {
	// exchange the element at the given slot for another
	var data = element || null;
	this.becomeArray();
	this.contents[index - 1] = data;
	this.changed();
};

List.prototype.remove = function (index) {
	// remove the given slot, shortening the list
	this.becomeArray();
	this.contents.splice(index - 1, 1);
	this.changed();
};

List.prototype.clear = function () {
	this.contents = [];
	this.first = null;
	this.rest = null;
	this.isLinked = false;
	this.changed();
};

// List getters (all hybrid):

List.prototype.length = function () {
	if (this.isLinked) {
		return (this.first === undefined ? 0 : 1)
			+ (this.rest ? this.rest.length() : 0);
	}
    return this.contents.length;
};

List.prototype.at = function (index) {
	if (this.isLinked) {
		return index === 1 ? this.first : this.rest.at(index - 1);
	}
    return this.contents[index - 1];
};

List.prototype.contains = function (element) {
	var num = parseFloat(element);
	if (this.isLinked) {
		if (this.first === element) {
			return true;
		}
        if (!isNaN(num)) {
			if (this.first === num) {
				return true;
			}
		}
		if (this.rest instanceof List) {
			return this.rest.contains(element);
		}
		return false;
	}
    // in case I'm arrayed
    if (contains(this.contents, element)) {
        return true;
    }
    if (!isNaN(num)) {
        return (contains(this.contents, num));
    }
    return false;
};

// List conversion:

List.prototype.asArray = function () {
	// for use in the evaluator
	this.becomeArray();
	return this.contents;
};

List.prototype.asText = function () {
    var result = '',
        length = this.length(),
        element,
        i;
    for (i = 1; i <= length; i += 1) {
        element = this.at(i);
        if (element instanceof List) {
            result = result.concat(element.asText());
        } else {
            result = result.concat((element || '').toString());
        }
    }
    return result;
};

List.prototype.becomeArray = function () {
	if (this.isLinked) {
		var next = this;
		this.contents = [];
		while (next instanceof List && (next.length() > 0)) {
			this.contents.push(next.at(1));
			next = next.cdr();
		}
		this.isLinked = false;
	}
};

List.prototype.becomeLinked = function () {
	var i, stop, tail = this;
	if (!this.isLinked) {
		stop = this.length();
		for (i = 0; i < stop; i += 1) {
			tail.first = this.contents[i];
			tail.rest = new List();
			tail.isLinked = true;
			tail = tail.rest;
		}
		this.contents = [];
		this.isLinked = true;
	}
};

// List testing

List.prototype.equalTo = function (other) {
	var i;
	if (!(other instanceof List)) {
		return false;
	}
	if ((!this.isLinked) && (!other.isLinked)) {
		if (this.length() === 0 && (other.length() === 0)) {
			return true;
		}
		if (this.length() !== other.length()) {
			return false;
		}
		for (i = 0; i < this.length(); i += 1) {
			if (!snapEquals(this.contents[i], other.contents[i])) {
				return false;
			}
		}
		return true;
	}
	if (snapEquals(this.at(1), other.at(1))) {
		return this.cdr().equalTo(other.cdr());
	}
	return false;
};

// ListWatcherMorph ////////////////////////////////////////////////////

/*
	I am a little window which observes a list and continuously
	updates itself accordingly
*/

// ListWatcherMorph inherits from BoxMorph:

ListWatcherMorph.prototype = new BoxMorph();
ListWatcherMorph.prototype.constructor = ListWatcherMorph;
ListWatcherMorph.uber = BoxMorph.prototype;

// ListWatcherMorph default settings

ListWatcherMorph.prototype.cellColor =
	SpriteMorph.prototype.blockColor.lists;

// ListWatcherMorph instance creation:

function ListWatcherMorph(list) {
	this.init(list);
}

ListWatcherMorph.prototype.init = function (list) {
	var myself = this;

	this.list = list || new List();
	this.start = 1;
	this.range = 100;
	this.lastUpdated = Date.now();
	this.lastCell = null;

	// elements declarations
	this.label = new StringMorph(
		'length: ' + this.list.length(),
		SyntaxElementMorph.prototype.fontSize,
		null,
		false,
		false,
		false,
		new Point(1, 1),
		new Color(255, 255, 255)
	);
	this.label.mouseClickLeft = function () {myself.startIndexMenu(); };


	this.frame = new ScrollFrameMorph(null, 10);
	this.frame.alpha = 0;

	this.handle = new HandleMorph(
		this,
		80,
		70,
		3,
		3
	);
	this.handle.setExtent(new Point(13, 13));

	this.arrow = new ArrowMorph(
		'down',
		SyntaxElementMorph.prototype.fontSize
	);
	this.arrow.mouseClickLeft = function () {myself.startIndexMenu(); };
	this.arrow.setRight(this.handle.right());
	this.arrow.setBottom(this.handle.top());
	this.handle.add(this.arrow);

	this.plusButton = new PushButtonMorph(
		this.list,
		'add',
		'+'
	);
	this.plusButton.padding = 0;
	this.plusButton.edge = 0;
	this.plusButton.outlineColor = this.color;
	this.plusButton.drawNew();
	this.plusButton.fixLayout();

	ListWatcherMorph.uber.init.call(
		this,
		SyntaxElementMorph.prototype.rounding,
		1.000001, // shadow bug in Chrome,
		new Color(120, 120, 120)
	);

	this.color = new Color(220, 220, 220);
	this.isDraggable = true;
	this.setExtent(new Point(80, 70));
	this.add(this.label);
	this.add(this.frame);
	this.add(this.plusButton);
	this.add(this.handle);
	this.handle.drawNew();
	this.update();
	this.fixLayout();
};

// ListWatcherMorph updating:

ListWatcherMorph.prototype.update = function (anyway) {
	var	i, idx, ceil, morphs, cell, cnts, label, button, max,
		starttime, maxtime = 1000;

	this.frame.contents.children.forEach(function (m) {
		if (m instanceof CellMorph
				&& m.contentsMorph instanceof ListWatcherMorph) {
			m.contentsMorph.update();
		}
	});

	if (this.lastUpdated === this.list.lastChanged && !anyway) {
		return null;
	}

	this.updateLength(true);

	// adjust start index to current list length
	this.start = Math.max(
		Math.min(
			this.start,
			Math.floor((this.list.length() - 1) / this.range)
				* this.range + 1
		),
		1
	);

	// refresh existing cells
	// highest index shown:
	max = Math.min(
		this.start + this.range - 1,
		this.list.length()
	);

	// number of morphs available for refreshing
	ceil = Math.min(
		(max - this.start + 1) * 3,
		this.frame.contents.children.length
	);

	for (i = 0; i < ceil; i += 3) {
		idx = this.start + (i / 3);

		cell = this.frame.contents.children[i];
		label = this.frame.contents.children[i + 1];
		button = this.frame.contents.children[i + 2];
		cnts = this.list.at(idx);

		if (cell.contents !== cnts) {
			cell.contents = cnts;
			cell.drawNew();
			if (this.lastCell) {
				cell.setLeft(this.lastCell.left());
			}
		}
		this.lastCell = cell;

		if (label.text !== idx.toString()) {
			label.text = idx.toString();
			label.drawNew();
		}

		button.action = idx;
	}

	// remove excess cells
	// number of morphs to be shown
	morphs = (max - this.start + 1) * 3;

	while (this.frame.contents.children.length > morphs) {
		this.frame.contents.children[morphs].destroy();
	}

	// add additional cells
	ceil = morphs; //max * 3;
	i = this.frame.contents.children.length;

	starttime = Date.now();
	if (ceil > i + 1) {
		for (i; i < ceil; i += 3) {
			if (Date.now() - starttime > maxtime) {
				this.fixLayout();
				this.frame.contents.adjustBounds();
				this.frame.contents.setLeft(this.frame.left());
				return null;
			}
			idx = this.start + (i / 3);
			label = new StringMorph(
				idx.toString(),
				SyntaxElementMorph.prototype.fontSize,
				null,
				false,
				false,
				false,
				new Point(1, 1),
				new Color(255, 255, 255)
			);
			cell = new CellMorph(
				this.list.at(idx),
				this.cellColor
			);
			button = new PushButtonMorph(
				this.list.remove,
				idx,
				'-',
				this.list
			);
			button.padding = 1;
			button.edge = 0;
			button.corner = 1;
			button.outlineColor = this.color.darker();
			button.drawNew();
			button.fixLayout();

			this.frame.contents.add(cell);
			if (this.lastCell) {
				cell.setPosition(this.lastCell.bottomLeft());
			} else {
				cell.setTop(this.frame.contents.top());
			}
			this.lastCell = cell;
			label.setCenter(cell.center());
			label.setRight(cell.left() - 2);
			this.frame.contents.add(label);
			this.frame.contents.add(button);
		}
	}
	this.lastCell = null;

	this.fixLayout();
	this.frame.contents.adjustBounds();
	this.frame.contents.setLeft(this.frame.left());
	this.updateLength();
	this.lastUpdated = this.list.lastChanged;
};

ListWatcherMorph.prototype.updateLength = function (notDone) {
	this.label.text = 'length: ' + this.list.length();
	if (notDone) {
		this.label.color = new Color(0, 0, 100);
	} else {
		this.label.color = new Color(0, 0, 0);
	}
	this.label.drawNew();
	this.label.setCenter(this.center());
	this.label.setBottom(this.bottom() - 3);
};

ListWatcherMorph.prototype.startIndexMenu = function () {
	var	i,
		range,
		myself = this,
		items = Math.ceil(this.list.length() / this.range),
		menu = new MenuMorph(
			function (idx) {myself.setStartIndex(idx); },
			null,
			myself
		);
	menu.addItem('1...', 1);
	for (i = 1; i < items; i += 1) {
		range = i * 100 + 1;
		menu.addItem(range + '...', range);
	}
	menu.popUpAtHand(this.world());
};

ListWatcherMorph.prototype.setStartIndex = function (index) {
	this.start = index;
	this.list.changed();
};

ListWatcherMorph.prototype.fixLayout = function () {
	Morph.prototype.trackChanges = false;
	if (this.frame) {
		this.arrangeCells();
		this.frame.silentSetPosition(this.position().add(3));
		this.frame.bounds.corner = this.bounds.corner.subtract(new Point(
			3,
			17
		));
		this.frame.drawNew();
		this.frame.contents.adjustBounds();
	}

	this.label.setCenter(this.center());
	this.label.setBottom(this.bottom() - 3);
	this.plusButton.setLeft(this.left() + 3);
	this.plusButton.setBottom(this.bottom() - 3);

	Morph.prototype.trackChanges = true;
	this.changed();

	if (this.parent && this.parent.fixLayout) {
		this.parent.fixLayout();
	}
};

ListWatcherMorph.prototype.arrangeCells = function () {
	var	i, cell, label, button, lastCell,
		end = this.frame.contents.children.length;
	for (i = 0; i < end; i += 3) {
		cell = this.frame.contents.children[i];
		label = this.frame.contents.children[i + 1];
		button = this.frame.contents.children[i + 2];
		if (lastCell) {
			cell.setTop(lastCell.bottom());
		}
		if (label) {
			label.setTop(cell.center().y - label.height() / 2);
			label.setRight(cell.left() - 2);
		}
		if (button) {
			button.setCenter(cell.center());
			button.setLeft(cell.right() + 2);
		}
		lastCell = cell;
	}
	this.frame.contents.adjustBounds();
};

// ListWatcherMorph hiding/showing:

ListWatcherMorph.prototype.show = function () {
	ListWatcherMorph.uber.show.call(this);
	this.frame.contents.adjustBounds();
};

// ListWatcherMorph drawing:

ListWatcherMorph.prototype.drawNew = function () {
	WatcherMorph.prototype.drawNew.call(this);
	this.fixLayout();
};

/*

	byob.js

	"build your own blocks" for SNAP!
	based on morphic.js, widgets.js blocks.js, threads.js and objects.js
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
	needs blocks.js, threads.js, objects.js, widgets.js and morphic.js


	hierarchy
	---------
	the following tree lists all constructors hierarchically,
	indentation indicating inheritance. Refer to this list to get a
	contextual overview:

	BlockLabelFragment
	CustomBlockDefinition

	CommandBlockMorph***
		CustomCommandBlockMorph
		HatBlockMorph***
			PrototypeHatBlockMorph

	DialogBoxMorph**
		BlockDialogMorph
		BlockEditorMorph
		InputSlotDialogMorph
        VariableDialogMorph

    ReporterBlockMorph***
        CustomReporterBlockMorph
        JaggedBlockMorph
        

	StringMorph*
		BlockLabelFragmentMorph
        BlockLabelPlaceHolderMorph

    TemplateSlotMorph***
        BlockInputFragmentMorph

	* from morphic.js
	** from widgets.js
	*** from blocks.js


	toc
	---
	the following list shows the order in which all constructors are
	defined. Use this list to locate code in this document:

	CustomBlockDefinition
	CustomCommandBlockMorph
	CustomReporterBlockMorph
    JaggedBlockMorph
	BlockDialogMorph
	BlockEditorMorph
	PrototypeHatBlockMorph
	BlockLabelFragmentMorph
    BlockLabelPlaceHolderMorph
    BlockInputFragmentMorph
	InputSlotDialogMorph
    VariableDialogMorph
    
*/

/*global modules, CommandBlockMorph, SpriteMorph, TemplateSlotMorph,
StringMorph, Color, DialogBoxMorph, ScriptsMorph, ScrollFrameMorph,
Point, HandleMorph, HatBlockMorph, BlockMorph, detect, List, Process,
AlignmentMorph, ToggleMorph, InputFieldMorph, ReporterBlockMorph,
Context, StringMorph, nop, newCanvas, radians, BoxMorph,
ArrowMorph, PushButtonMorph, contains, InputSlotMorph, ShadowMorph,
ToggleButtonMorph, IDE_Morph, MenuMorph, copy, ToggleElementMorph,
Morph, fontHeight*/

// Global stuff ////////////////////////////////////////////////////////

modules.byob = '2012-Mar-20';

// Declarations

var CustomBlockDefinition;
var CustomCommandBlockMorph;
var CustomReporterBlockMorph;
var BlockDialogMorph;
var BlockEditorMorph;
var PrototypeHatBlockMorph;
var BlockLabelFragment;
var BlockLabelFragmentMorph;
var BlockInputFragmentMorph;
var BlockLabelPlaceHolderMorph;
var InputSlotDialogMorph;
var VariableDialogMorph;
var JaggedBlockMorph;

// CustomBlockDefinition ///////////////////////////////////////////////

// CustomBlockDefinition instance creation:

function CustomBlockDefinition(spec) {
	this.body = null; // a Context (i.e. a reified top block)
	this.category = null;
	this.isGlobal = false;
	this.type = 'command';
	this.spec = spec || '';
	this.declarations = {}; // {'inputName' : [type, default]}
}

// CustomBlockDefinition instantiating blocks

CustomBlockDefinition.prototype.blockInstance = function () {
	var block;
	if (this.type === 'command') {
		block = new CustomCommandBlockMorph(this);
	} else {
		block = new CustomReporterBlockMorph(
			this,
			this.type === 'predicate'
		);
	}
	block.isDraggable = true;
	return block;
};

CustomBlockDefinition.prototype.templateInstance = function () {
	var block;
	block = this.blockInstance();
    block.refreshDefaults();
	block.isDraggable = false;
	block.isTemplate = true;
	return block;
};

CustomBlockDefinition.prototype.prototypeInstance = function () {
	var block, slot, myself = this;

    // make a new block instance and mark it as prototype
	if (this.type === 'command') {
		block = new CustomCommandBlockMorph(this, true);
	} else {
		block = new CustomReporterBlockMorph(
			this,
			this.type === 'predicate',
			true
		);
	}

    // assign slot declarations to prototype inputs
    block.parts().forEach(function (part) {
        if (part instanceof BlockInputFragmentMorph) {
            slot = myself.declarations[part.fragment.labelString];
            if (slot) {
                part.fragment.type = slot[0];
                part.fragment.defaultValue = slot[1];
            }
        }
    });
	return block;
};

// CustomBlockDefinition duplicating

CustomBlockDefinition.prototype.copyAndBindTo = function (sprite) {
    var c = copy(this), outer;

    c.declarations = copy(this.declarations); // might have to go deeper
    c.body = Process.prototype.reify.call(
        null,
        this.body.expression,
        new List(this.inputNames())
    );
	outer = new Context();
	outer.receiver = sprite;
	outer.variables.parentFrame = sprite.variables;
	c.body.outerContext = outer;

    return c;
};

// CustomBlockDefinition accessing

CustomBlockDefinition.prototype.blockSpec = function () {
	var	myself = this,
		ans = [],
		parts = this.parseSpec(this.spec),
		spec;
	parts.forEach(function (part) {
		if (part[0] === '%') {
			spec = myself.typeOf(part.slice(1));
		} else {
			spec = part;
		}
		ans.push(spec);
		ans.push(' ');
	});
	return ''.concat.apply('', ans).trim();
};

CustomBlockDefinition.prototype.typeOf = function (inputName) {
	if (this.declarations[inputName]) {
		return this.declarations[inputName][0];
	}
	return '%s';
};

CustomBlockDefinition.prototype.defaultValueOf = function (inputName) {
	if (this.declarations[inputName]) {
		return this.declarations[inputName][1];
	}
	return '';
};

CustomBlockDefinition.prototype.defaultValueOfInputIdx = function (idx) {
    var inputName = this.inputNames()[idx];
    return this.defaultValueOf(inputName);
};

CustomBlockDefinition.prototype.inputNames = function () {
	var	vNames = [],
		parts = this.parseSpec(this.spec);
	parts.forEach(function (part) {
		if (part[0] === '%') {
			vNames.push(part.slice(1));
		}
	});
	return vNames;
};

CustomBlockDefinition.prototype.parseSpec = function (spec) {
	// private
	var parts = [], word = '', i, quoted = false, c;
	for (i = 0; i < spec.length; i += 1) {
		c = spec[i];
		if (c === "'") {
			quoted = !quoted;
		} else if (c === ' ' && !quoted) {
			parts.push(word);
			word = '';
		} else {
			word = word.concat(c);
		}
	}
	parts.push(word);
	return parts;
};

// CustomCommandBlockMorph /////////////////////////////////////////////

// CustomCommandBlockMorph inherits from CommandBlockMorph:

CustomCommandBlockMorph.prototype = new CommandBlockMorph();
CustomCommandBlockMorph.prototype.constructor = CustomCommandBlockMorph;
CustomCommandBlockMorph.uber = CommandBlockMorph.prototype;

// CustomCommandBlockMorph instance creation:

function CustomCommandBlockMorph(definition, isProto) {
	this.init(definition, isProto);
}

CustomCommandBlockMorph.prototype.init = function (definition, isProto) {
	this.definition = definition; // mandatory
	this.isPrototype = isProto || false; // optional

	CustomCommandBlockMorph.uber.init.call(this);

	this.selector = 'evaluateCustomBlock';
    if (definition) { // needed for de-serializing
        this.refresh();
    }
};

CustomCommandBlockMorph.prototype.refresh = function () {
    var def = this.definition,
        myself = this,
        newSpec = this.isPrototype ?
				def.spec : def.blockSpec(),
        idx = 0,
        clr = SpriteMorph.prototype.blockColor[
            def.category || 'other'
        ];

    // if I'm in a palette replace myself with a new template
    if (this.isTemplate && this.parent) {
        idx = this.parent.children.indexOf(this);
        if (idx > -1) {
            myself = def.templateInstance();
            myself.setPosition(this.position());
            myself.parent = this.parent;
            myself.parent.children[idx] = myself;
            myself.parent.changed();
            return null;
        }
    }

	this.setColor(clr);
    if (this.blockSpec !== newSpec) {
        this.setSpec(newSpec);
    }

    // in non-prototype block instances
    // find upvars and label them to their internal definition (default)
    if (!this.isPrototype) {
        idx = 0;
        this.inputs().forEach(function (inp) {
            if (inp instanceof TemplateSlotMorph) {
                inp.setContents(def.inputNames()[idx]);
            }
            idx += 1;
        });
    }
};

CustomCommandBlockMorph.prototype.refreshDefaults = function () {
    // fill my editable slots with the defaults specified in my definition
    var inputs = this.inputs(), idx = 0, myself = this;

    inputs.forEach(function (inp) {
        if (inp instanceof InputSlotMorph) {
            inp.setContents(myself.definition.defaultValueOfInputIdx(idx));
        }
        idx += 1;
    });
};

CustomCommandBlockMorph.prototype.refreshPrototype = function () {
    // create my label parts from my (edited) fragments only
    var hat,
        protoSpec,
        blockSpec,
        frags = [],
        myself = this,
        words,
        newFrag,
        i = 0;

    if (!this.isPrototype) {return null; }

    hat = this.parentThatIsA(PrototypeHatBlockMorph);

    // remember the edited fragments
    this.parts().forEach(function (part) {
        if (!part.fragment.isDeleted) {
            // take into consideration that a fragment may spawn others
            // if it isn't an input label consisting of several words
            if (part.fragment.type) { // marked as input, take label as is
                frags.push(part.fragment);
            } else { // not an input, devide into several non-input fragments
                words = myself.definition.parseSpec(
                    part.fragment.labelString
                );
                words.forEach(function (word) {
                    newFrag = part.fragment.copy();
                    newFrag.labelString = word;
                    frags.push(newFrag);
                });
            }
        }
    });

    // remember the edited prototype spec
    protoSpec = this.specFromFragments();


    // update the prototype's type 
    // and possibly exchange 'this' for 'myself'
    if (this instanceof CustomCommandBlockMorph
            && ((hat.type === 'reporter') || (hat.type === 'predicate'))) {
        myself = new CustomReporterBlockMorph(
            this.definition,
            hat.type === 'predicate',
            true
        );
        hat.silentReplaceInput(this, myself);
    } else if (this instanceof CustomReporterBlockMorph) {
        if (hat.type === 'command') {
            myself = new CustomCommandBlockMorph(
                this.definition,
                true
            );
            hat.silentReplaceInput(this, myself);
        } else {
            this.isPredicate = (hat.type === 'predicate');
            this.drawNew();
        }
    }

	myself.color = SpriteMorph.prototype.blockColor[
        hat.category || 'other'
	];

    // update the (new) prototype's appearance
	myself.setSpec(protoSpec);

    // update the (new) prototype's (new) fragments
    // with the previously edited ones

    myself.parts().forEach(function (part) {
        if (!(part instanceof BlockLabelPlaceHolderMorph)) {
            if (frags[i]) { // don't delete the default fragment
                part.fragment = frags[i];
            }
            i += 1;
        }
    });

    hat.fixLayout();

    // temporarily update all my instances elsewhere (without changing the
    // definition, so that the changes can be reverted in case the user
    // cancels the block editor

    blockSpec = myself.blockSpecFromFragments();
    myself.receiver().allBlockInstances(myself.definition).forEach(
        function (eachBlock) {
            eachBlock.setColor(myself.color);
            eachBlock.setSpec(blockSpec);
            i = 0;
            eachBlock.inputs().forEach(function (inp) {
                if (inp instanceof TemplateSlotMorph) {
                    inp.setContents(myself.upvarFragmentName(i));
                    i += 1;
                }
            });
        }
    );
};

CustomCommandBlockMorph.prototype.upvarFragmentNames = function () {
    // for the variable name slot drop-down menu (in the block editor)
    var ans = [];

    this.parts().forEach(function (part) {
        if (!part.fragment.isDeleted && (part.fragment.type === '%upvar')) {
            ans.push(part.fragment.labelString);
        }
    });
    return ans;
};

CustomCommandBlockMorph.prototype.upvarFragmentName = function (idx) {
    // for block prototypes while they are being edited
    return this.upvarFragmentNames()[idx] || '\u2191';
};

CustomCommandBlockMorph.prototype.specFromFragments = function () {
    // for block prototypes while they are being edited
    var ans = '';

    this.parts().forEach(function (part) {
        if (!part.fragment.isDeleted) {
            ans = ans + part.fragment.defSpecFragment() + ' ';
        }
    });
    return ans.trim();
};

CustomCommandBlockMorph.prototype.blockSpecFromFragments = function () {
    // for block instances while their prototype is being edited
    var ans = '';

    this.parts().forEach(function (part) {
        if (!part.fragment.isDeleted) {
            ans = ans + part.fragment.blockSpecFragment() + ' ';
        }
    });
    return ans.trim();
};

CustomCommandBlockMorph.prototype.declarationsFromFragments = function () {
    // format for type declarations: {inputName : [type, default]}
    var ans = {};

    this.parts().forEach(function (part) {
        if (part instanceof BlockInputFragmentMorph) {
            ans[part.fragment.labelString] =
                [part.fragment.type, part.fragment.defaultValue];
        }
    });
    return ans;
};

CustomCommandBlockMorph.prototype.parseSpec = function (spec) {
	if (!this.isPrototype) {
		return CustomCommandBlockMorph.uber.parseSpec.call(this, spec);
	}
	return this.definition.parseSpec.call(this, spec);
};

CustomCommandBlockMorph.prototype.mouseClickLeft = function () {
	if (!this.isPrototype) {
		return CustomCommandBlockMorph.uber.mouseClickLeft.call(this);
	}
    this.edit();
};

CustomCommandBlockMorph.prototype.edit = function () {
    var myself = this, block, hat;

	if (this.isPrototype) {
        block = this.definition.blockInstance();
        block.addShadow();
        hat = this.parentThatIsA(PrototypeHatBlockMorph);
        new BlockDialogMorph(
            null,
            function (definition) {
                if (definition) { // temporarily update everything
                    hat.category = definition.category;
                    hat.type = definition.type;
                    myself.refreshPrototype();
                }
            },
            myself
        ).openForChange(
            'Change block',
            hat.category,
            hat.type,
            myself.world(),
            block.fullImage(),
            myself.isInUse()
        );
	} else {
		new BlockEditorMorph(this.definition, this.receiver()).popUp();
	}
};

CustomCommandBlockMorph.prototype.labelPart = function (spec) {
	var part;

	if (!this.isPrototype) {
		return CustomCommandBlockMorph.uber.labelPart.call(this, spec);
	}
	if ((spec[0] === '%') && (spec.length > 1)) {
		part = new BlockInputFragmentMorph(spec.slice(1));
    } else {
		part = new BlockLabelFragmentMorph(spec);
		part.fontSize = this.fontSize;
		part.color = new Color(255, 255, 255);
		part.isBold = true;
		part.shadowColor = this.color.darker(this.labelContrast);
		part.shadowOffset = this.embossing;
		part.drawNew();
	}
	return part;
};

CustomCommandBlockMorph.prototype.placeHolder = function () {
	var part;

    part = new BlockLabelPlaceHolderMorph();
    part.fontSize = this.fontSize * 1.4;
    part.color = new Color(45, 45, 45);
    part.drawNew();
	return part;
};

CustomCommandBlockMorph.prototype.attachTargets = function () {
	if (this.isPrototype) {
		return [];
	}
	return CustomCommandBlockMorph.uber.attachTargets.call(this);
};

CustomCommandBlockMorph.prototype.isInUse = function () {
    // anser true if an instance of my definition is found
    // in any of my receiver's scripts or block definitions
    return this.receiver().usesBlockInstance(this.definition);
};

// CustomCommandBlockMorph menu:

CustomCommandBlockMorph.prototype.userMenu = function () {
	var	menu;

    if (this.isPrototype) {
        menu = new MenuMorph(this);
    } else {
        menu = this.constructor.uber.userMenu.call(this);
        if (!menu) {
            menu = new MenuMorph(this);
        } else {
            menu.addLine();
        }
        menu.addItem("delete block definition...", 'deleteBlockDefinition');
    }
	menu.addItem("edit...", 'edit'); // works also for prototypes
	return menu;
};

CustomCommandBlockMorph.prototype.deleteBlockDefinition = function () {
	var idx, rcvr, ide, myself = this, block;
	if (this.isPrototype) {
		return null; // under construction...
	}
    block = myself.definition.blockInstance();
    block.addShadow();
    new DialogBoxMorph(
        this,
        function () {
            rcvr = myself.receiver();
            rcvr.deleteAllBlockInstances(myself.definition);
            idx = rcvr.customBlocks.indexOf(myself.definition);
            if (idx !== -1) {
                rcvr.customBlocks.splice(idx, 1);
                ide = rcvr.parentThatIsA(IDE_Morph);
                if (ide) {
                    ide.refreshPalette();
                }
            }
        },
        this
    ).askYesNo(
        'Delete Custom Block',
        'Are you sure you want to delete this\n'
            + 'custom block and all its instances?',
        myself.world(),
        block.fullImage()
    );
};

// CustomReporterBlockMorph ////////////////////////////////////////////

// CustomReporterBlockMorph inherits from ReporterBlockMorph:

CustomReporterBlockMorph.prototype = new ReporterBlockMorph();
CustomReporterBlockMorph.prototype.constructor = CustomReporterBlockMorph;
CustomReporterBlockMorph.uber = ReporterBlockMorph.prototype;

// CustomReporterBlockMorph instance creation:

function CustomReporterBlockMorph(definition, isPredicate, isProto) {
	this.init(definition, isPredicate, isProto);
}

CustomReporterBlockMorph.prototype.init = function (
	definition,
	isPredicate,
	isProto
) {
	this.definition = definition; // mandatory
	this.isPrototype = isProto || false; // optional

	CustomReporterBlockMorph.uber.init.call(this, isPredicate);

	this.selector = 'evaluateCustomBlock';
    if (definition) { // needed for de-serializing
        this.refresh();
    }
};

CustomReporterBlockMorph.prototype.refresh = function () {
	CustomCommandBlockMorph.prototype.refresh.call(this);
    if (!this.isPrototype) {
        this.isPredicate = (this.definition.type === 'predicate');
    }
	this.drawNew();
};

CustomReporterBlockMorph.prototype.mouseClickLeft = function () {
	if (!this.isPrototype) {
		return CustomReporterBlockMorph.uber.mouseClickLeft.call(this);
	}
    this.edit();
};

CustomReporterBlockMorph.prototype.placeHolder
    = CustomCommandBlockMorph.prototype.placeHolder;

CustomReporterBlockMorph.prototype.parseSpec
	= CustomCommandBlockMorph.prototype.parseSpec;

CustomReporterBlockMorph.prototype.edit
	= CustomCommandBlockMorph.prototype.edit;

CustomReporterBlockMorph.prototype.labelPart
	= CustomCommandBlockMorph.prototype.labelPart;

CustomReporterBlockMorph.prototype.upvarFragmentNames
    = CustomCommandBlockMorph.prototype.upvarFragmentNames;

CustomReporterBlockMorph.prototype.upvarFragmentName
    = CustomCommandBlockMorph.prototype.upvarFragmentName;

CustomReporterBlockMorph.prototype.specFromFragments
    = CustomCommandBlockMorph.prototype.specFromFragments;

CustomReporterBlockMorph.prototype.blockSpecFromFragments
    = CustomCommandBlockMorph.prototype.blockSpecFromFragments;

CustomReporterBlockMorph.prototype.declarationsFromFragments
    = CustomCommandBlockMorph.prototype.declarationsFromFragments;

CustomReporterBlockMorph.prototype.refreshPrototype
    = CustomCommandBlockMorph.prototype.refreshPrototype;

CustomReporterBlockMorph.prototype.refreshDefaults
    = CustomCommandBlockMorph.prototype.refreshDefaults;

CustomReporterBlockMorph.prototype.isInUse
    = CustomCommandBlockMorph.prototype.isInUse;

// CustomReporterBlockMorph menu:

CustomReporterBlockMorph.prototype.userMenu
	= CustomCommandBlockMorph.prototype.userMenu;

CustomReporterBlockMorph.prototype.deleteBlockDefinition
	= CustomCommandBlockMorph.prototype.deleteBlockDefinition;


// JaggedBlockMorph ////////////////////////////////////////////////////

/*
    I am a reporter block with jagged left and right edges conveying the
    appearance of having the broken out of a bigger block. I am used to
    display input types in the long form input dialog.
*/

// JaggedBlockMorph inherits from ReporterBlockMorph:

JaggedBlockMorph.prototype = new ReporterBlockMorph();
JaggedBlockMorph.prototype.constructor = JaggedBlockMorph;
JaggedBlockMorph.uber = ReporterBlockMorph.prototype;

// JaggedBlockMorph preferences settings:

JaggedBlockMorph.prototype.jag = 5;

// JaggedBlockMorph instance creation:

function JaggedBlockMorph(spec) {
	this.init(spec);
}

JaggedBlockMorph.prototype.init = function (spec) {
	JaggedBlockMorph.uber.init.call(this);
    if (spec) {this.setSpec(spec); }
};

// JaggedBlockMorph drawing:

JaggedBlockMorph.prototype.drawNew = function () {
	var context;

	this.cachedClr = this.color.toString();
	this.cachedClrBright = this.bright();
	this.cachedClrDark = this.dark();
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	context.fillStyle = this.cachedClr;

    this.drawBackground(context);
    this.drawEdges(context);

	// erase CommandSlots
	this.eraseCSlotAreas(context);
};

JaggedBlockMorph.prototype.drawBackground = function (context) {
	var	w = this.width(),
		h = this.height(),
        jags = Math.round(h / this.jag),
        delta = h / jags,
        i,
        y;

	context.fillStyle = this.cachedClr;
	context.beginPath();

	context.moveTo(0, 0);
	context.lineTo(w, 0);

    y = 0;
    for (i = 0; i < jags; i += 1) {
        y += delta / 2;
        context.lineTo(w - this.jag / 2, y);
        y += delta / 2;
        context.lineTo(w, y);
    }

	context.lineTo(0, h);
    y = h;
    for (i = 0; i < jags; i += 1) {
        y -= delta / 2;
        context.lineTo(this.jag / 2, y);
        y -= delta / 2;
        context.lineTo(0, y);
    }

	context.closePath();
	context.fill();
};

JaggedBlockMorph.prototype.drawEdges = function (context) {
	var	w = this.width(),
		h = this.height(),
        jags = Math.round(h / this.jag),
        delta = h / jags,
        shift = this.edge / 2,
        gradient,
        i,
        y;

	context.lineWidth = this.edge;
	context.lineJoin = 'round';
	context.lineCap = 'round';

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
	context.moveTo(shift, shift);
	context.lineTo(w - shift, shift);
    context.stroke();

    y = 0;
    for (i = 0; i < jags; i += 1) {
        context.strokeStyle = this.cachedClrDark;
        context.beginPath();
        context.moveTo(w - shift, y);
        y += delta / 2;
        context.lineTo(w - this.jag / 2 - shift, y);
        context.stroke();
        y += delta / 2;
    }

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
    context.moveTo(w - shift, h - shift);
	context.lineTo(shift, h - shift);
    context.stroke();

    y = h;
    for (i = 0; i < jags; i += 1) {
        context.strokeStyle = this.cachedClrBright;
        context.beginPath();
        context.moveTo(shift, y);
        y -= delta / 2;
        context.lineTo(this.jag / 2 + shift, y);
        context.stroke();
        y -= delta / 2;
    }
};

// BlockDialogMorph ////////////////////////////////////////////////////

// BlockDialogMorph inherits from DialogBoxMorph:

BlockDialogMorph.prototype = new DialogBoxMorph();
BlockDialogMorph.prototype.constructor = BlockDialogMorph;
BlockDialogMorph.uber = DialogBoxMorph.prototype;

// BlockDialogMorph instance creation:

function BlockDialogMorph(target, action, environment) {
	this.init(target, action, environment);
}

BlockDialogMorph.prototype.init = function (target, action, environment) {
	// additional properties:
	this.blockType = 'command';
    this.category = 'other';
	this.types = null;
    this.categories = null;

	// initialize inherited properties:
	BlockDialogMorph.uber.init.call(
		this,
		target,
		action,
		environment
	);

	// override inherited properites:
	this.types = new AlignmentMorph('row', this.padding);
	this.add(this.types);

    this.categories = new BoxMorph();
    this.categories.color = SpriteMorph.prototype.paletteColor.lighter(8);
    this.categories.borderColor = this.categories.color.lighter(40);
    this.createCategoryButtons();
    this.fixCategoriesLayout();
    this.add(this.categories);

	this.createTypeButtons();
	this.fixLayout();
};

BlockDialogMorph.prototype.openForChange = function (
	title,
    category,
    type,
	world,
	pic,
    preventTypeChange // <bool>
) {
    var clr = SpriteMorph.prototype.blockColor[category];
    this.category = category;
	this.blockType = type;

    this.categories.children.forEach(function (each) {
        each.refresh();
    });
    this.types.children.forEach(function (each) {
        each.setColor(clr);
        each.refresh();
    });

	this.labelString = title;
	this.createLabel();
	if (pic) {this.setPicture(pic); }
	this.addButton('ok', 'Ok');
	this.addButton('cancel', 'Cancel');
    if (preventTypeChange) {
        this.types.destroy();
        this.types = null;
    }
    this.fixLayout();
	this.drawNew();
	if (world) {
		world.add(this);
		this.setCenter(world.center());
		this.edit();
	}
};

BlockDialogMorph.prototype.createCategoryButtons = function () {
	var myself = this,
        oldFlag = Morph.prototype.trackChanges;

    Morph.prototype.trackChanges = false;
    SpriteMorph.prototype.categories.forEach(function (cat) {
        myself.addCategoryButton(cat);
    });
    Morph.prototype.trackChanges = oldFlag;
};

BlockDialogMorph.prototype.addCategoryButton = function (category) {
	var labelWidth = 75,
        myself = this,
        colors = [
            SpriteMorph.prototype.paletteColor,
            SpriteMorph.prototype.paletteColor.darker(50),
            SpriteMorph.prototype.blockColor[category]
        ],
        button;

    button = new ToggleButtonMorph(
        colors,
        this, // this block dialog box is the target
        function () {
            myself.category = category;
            myself.categories.children.forEach(function (each) {
                each.refresh();
            });
            if (myself.types) {
                myself.types.children.forEach(function (each) {
                    each.setColor(colors[2]);
                });
            }
            myself.edit();
        },
        category[0].toUpperCase().concat(category.slice(1)), // UCase label
        function () {return myself.category === category; }, // query
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
    button.contrast = this.buttonContrast;
    button.fixLayout();
    button.refresh();
    this.categories.add(button);
    return button;
};

BlockDialogMorph.prototype.fixCategoriesLayout = function () {
    var buttonWidth = this.categories.children[0].width(), // all the same
        buttonHeight = this.categories.children[0].height(), // all the same
        xPadding = 15,
        yPadding = 2,
        border = 10, // this.categories.border,
        rows =  Math.ceil((this.categories.children.length) / 2),
        l = this.categories.left(),
        t = this.categories.top(),
        i = 0,
        row,
        col,
        oldFlag = Morph.prototype.trackChanges;

    Morph.prototype.trackChanges = false;

    this.categories.children.forEach(function (button) {
        i += 1;
        row = Math.ceil(i / 2);
        col = 2 - (i % 2);
        button.setPosition(new Point(
            l + (col * xPadding + ((col - 1) * buttonWidth)),
            t + (row * yPadding + ((row - 1) * buttonHeight) + border)
        ));
    });

    this.categories.setExtent(new Point(
        3 * xPadding + 2 * buttonWidth,
        (rows + 1) * yPadding + rows * buttonHeight + 2 * border
    ));

    Morph.prototype.trackChanges = oldFlag;
    this.categories.changed();
};

BlockDialogMorph.prototype.createTypeButtons = function () {
	var block,
        myself = this,
        clr = SpriteMorph.prototype.blockColor[this.category];


    block = new CommandBlockMorph();
    block.setColor(clr);
    block.setSpec('Command');
	this.addBlockTypeButton(
		function () {myself.setType('command'); },
		block,
		function () {return myself.blockType === 'command'; }
	);

    block = new ReporterBlockMorph();
    block.setColor(clr);
    block.setSpec('Reporter');
	this.addBlockTypeButton(
		function () {myself.setType('reporter'); },
		block,
		function () {return myself.blockType === 'reporter'; }
	);

    block = new ReporterBlockMorph(true);
    block.setColor(clr);
    block.setSpec('Predicate');
	this.addBlockTypeButton(
		function () {myself.setType('predicate'); },
		block,
		function () {return myself.blockType === 'predicate'; }
	);
};

BlockDialogMorph.prototype.addBlockTypeButton = function (
    action,
    element,
    query
) {
    var button = new ToggleElementMorph(
		this,
		action,
		element,
		query,
        null,
        null,
        'rebuild'
    );
    button.refresh();
	this.types.add(button);
	return button;
};

BlockDialogMorph.prototype.addTypeButton = function (action, label, query) {
	var button = new ToggleMorph(
		'radiobutton',
		this,
		action,
		label,
		query
	);
	button.edge = this.buttonEdge / 2;
	button.outline = this.buttonOutline / 2;
	button.outlineColor = this.buttonOutlineColor;
	button.outlineGradient = this.buttonOutlineGradient;
    button.contrast = this.buttonContrast;

	button.drawNew();
	button.fixLayout();
	this.types.add(button);
	return button;
};

BlockDialogMorph.prototype.setType = function (blockType) {
	this.blockType = blockType || this.blockType;
	this.types.children.forEach(function (c) {
		c.refresh();
	});
	this.edit();
};

BlockDialogMorph.prototype.getInput = function () {
	var spec, def;
	if (this.body instanceof InputFieldMorph) {
		spec = this.normalizeSpaces(this.body.getValue());
	}
    def = new CustomBlockDefinition(spec);
    def.type = this.blockType;
    def.category = this.category;
    return def;
};

BlockDialogMorph.prototype.fixLayout = function () {
	var th = fontHeight(this.titleFontSize) + this.titlePadding * 2;

	if (this.body) {
		this.body.setPosition(this.position().add(new Point(
			this.padding,
			th + this.padding
		)));
		this.silentSetWidth(this.body.width() + this.padding * 2);
		this.silentSetHeight(
			this.body.height()
				+ this.padding * 2
				+ th
		);
        if (this.categories) {
            this.categories.setCenter(this.body.center());
            this.categories.setTop(this.body.top());
            this.body.setTop(this.categories.bottom() + this.padding);
            this.silentSetHeight(
                this.height()
                    + this.categories.height()
                    + this.padding
            );
        }
	} else if (this.head) { // when changing an existing prototype    
        if (this.types) {
            this.types.fixLayout();
            this.silentSetWidth(
                Math.max(this.types.width(), this.head.width())
                    + this.padding * 2
            );
        } else {
            this.silentSetWidth(
                Math.max(this.categories.width(), this.head.width())
                    + this.padding * 2
            );
        }
        this.head.setCenter(this.center());
        this.head.setTop(th + this.padding);
		this.silentSetHeight(
			this.head.height()
				+ this.padding * 2
				+ th
		);
        if (this.categories) {
            this.categories.setCenter(this.center());
            this.categories.setTop(this.head.bottom() + this.padding);
            this.silentSetHeight(
                this.height()
                    + this.categories.height()
                    + this.padding
            );
        }
    }

	if (this.label) {
		this.label.setCenter(this.center());
		this.label.setTop(this.top() + (th - this.label.height()) / 2);
    }

	if (this.types) {
		this.types.fixLayout();
		this.silentSetHeight(
			this.height()
					+ this.types.height()
					+ this.padding
		);
		this.silentSetWidth(Math.max(
			this.width(),
			this.types.width() + this.padding * 2
		));
		this.types.setCenter(this.center());
		if (this.body) {
			this.types.setTop(this.body.bottom() + this.padding);
		} else if (this.categories) {
			this.types.setTop(this.categories.bottom() + this.padding);
        }
	}

	if (this.buttons && (this.buttons.children.length > 0)) {
		this.buttons.fixLayout();
		this.silentSetHeight(
			this.height()
					+ this.buttons.height()
					+ this.padding
		);
		this.buttons.setCenter(this.center());
		this.buttons.setBottom(this.bottom() - this.padding);
	}
};

// BlockEditorMorph ////////////////////////////////////////////////////

// BlockEditorMorph inherits from DialogBoxMorph:

BlockEditorMorph.prototype = new DialogBoxMorph();
BlockEditorMorph.prototype.constructor = BlockEditorMorph;
BlockEditorMorph.uber = DialogBoxMorph.prototype;

// BlockEditorMorph instance creation:

function BlockEditorMorph(definition, target) {
	this.init(definition, target);
}

BlockEditorMorph.prototype.init = function (definition, target) {
	var scripts, proto, scriptsFrame, myself = this;

	// additional properties:
	this.definition = definition;
	this.handle = null;

	// initialize inherited properties:
	BlockEditorMorph.uber.init.call(
		this,
		target,
		function () {myself.updateDefinition(); },
		target
	);

	// override inherited properites:
	this.labelString = 'Block Editor';
	this.createLabel();

	// create scripting area
	scripts = new ScriptsMorph(target);
	scripts.isDraggable = false;
	scripts.color = new Color(112, 112, 112);
	scripts.texture = 'scriptsPaneTexture.gif';
    scripts.cleanUpMargin = 10;

	proto = new PrototypeHatBlockMorph(this.definition);
	proto.setPosition(scripts.position().add(10));

	if (definition.body !== null) {
		proto.nextBlock(definition.body.expression.fullCopy());
	}

	scripts.add(proto);

	scriptsFrame = new ScrollFrameMorph(scripts);
	scriptsFrame.padding = 10;
	scriptsFrame.isDraggable = false;
	scriptsFrame.acceptsDrops = false;
	scriptsFrame.contents.acceptsDrops = true;
	scripts.scrollFrame = scriptsFrame;

	this.addBody(scriptsFrame);
	this.addButton('ok', 'Ok');
	this.addButton('cancel', 'Cancel');

	this.setExtent(new Point(375, 300));
	this.fixLayout();
};

BlockEditorMorph.prototype.popUp = function () {
	var world = this.target.world();
	if (world) {
		world.add(this);
		world.keyboardReceiver = this;
		this.handle = new HandleMorph(
			this,
			280,
			220,
			this.corner,
			this.corner
		);
		this.setCenter(world.center());
	}
};

// BlockEditorMorph ops

BlockEditorMorph.prototype.cancel = function () {
    this.refreshAllBlockInstances();
	this.destroy();
};

BlockEditorMorph.prototype.refreshAllBlockInstances = function () {
    var template = this.target.paletteBlockInstance(this.definition);

    this.target.allBlockInstances(this.definition).forEach(
        function (block) {
            block.refresh();
        }
    );
    if (template) {
        template.refreshDefaults();
    }
};

BlockEditorMorph.prototype.updateDefinition = function () {
	var ctx, head;

    this.definition.spec = this.prototypeSpec();
    this.definition.declarations = this.prototypeSlots();

    head = detect(
        this.body.contents.children,
        function (c) {return c instanceof PrototypeHatBlockMorph; }
    );
    if (head) {
        this.definition.category = head.category;
        this.definition.type = head.type;
    }

    ctx = this.context();
	if (ctx !== null) {
		this.definition.body = ctx;
	}
    this.refreshAllBlockInstances();
};

BlockEditorMorph.prototype.context = function () {
	// answer my script reified for deferred execution
	var head, topBlock, proto, stackFrame, outer;

	head = detect(
		this.body.contents.children,
		function (c) {return c instanceof PrototypeHatBlockMorph; }
	);
	topBlock = head.nextBlock();
	if (topBlock === null) {
		return null;
	}
	proto = head.parts()[0];
	stackFrame = Process.prototype.reify.call(
		null,
		topBlock,
		new List(this.definition.inputNames())
	);
	outer = new Context();
	outer.receiver = topBlock.receiver();
	outer.variables.parentFrame = outer.receiver.variables;
	stackFrame.outerContext = outer;
	return stackFrame;
};

BlockEditorMorph.prototype.prototypeSpec = function () {
	// answer the spec represented by my (edited) block prototype
	return detect(
		this.body.contents.children,
		function (c) {return c instanceof PrototypeHatBlockMorph; }
	).parts()[0].specFromFragments();
};

BlockEditorMorph.prototype.prototypeSlots = function () {
	// answer the slot declarations from my (edited) block prototype
	return detect(
		this.body.contents.children,
		function (c) {return c instanceof PrototypeHatBlockMorph; }
	).parts()[0].declarationsFromFragments();
};

// BlockEditorMorph layout

BlockEditorMorph.prototype.fixLayout = function () {
	var th = fontHeight(this.titleFontSize) + this.titlePadding * 2;

	if (this.buttons && (this.buttons.children.length > 0)) {
		this.buttons.fixLayout();
	}

	if (this.body) {
		this.body.setPosition(this.position().add(new Point(
			this.padding,
			th + this.padding
		)));
		this.body.setExtent(new Point(
			this.width() - this.padding * 2,
			this.height() - this.padding * 3 - th - this.buttons.height()
		));
	}

	if (this.label) {
		this.label.setCenter(this.center());
		this.label.setTop(this.top() + (th - this.label.height()) / 2);
	}

	if (this.buttons && (this.buttons.children.length > 0)) {
		this.buttons.setCenter(this.center());
		this.buttons.setBottom(this.bottom() - this.padding);
	}
};

// PrototypeHatBlockMorph /////////////////////////////////////////////

// PrototypeHatBlockMorph inherits from HatBlockMorph:

PrototypeHatBlockMorph.prototype = new HatBlockMorph();
PrototypeHatBlockMorph.prototype.constructor = PrototypeHatBlockMorph;
PrototypeHatBlockMorph.uber = HatBlockMorph.prototype;

// PrototypeHatBlockMorph instance creation:

function PrototypeHatBlockMorph(definition) {
	this.init(definition);
}

PrototypeHatBlockMorph.prototype.init = function (definition) {
	this.definition = definition;

    // additional attributes to store edited data
    this.category = definition ? definition.category : null;
    this.type = definition ? definition.type : null;

    // init inherited stuff
	HatBlockMorph.uber.init.call(this);
	this.color = SpriteMorph.prototype.blockColor.control;
	this.add(definition.prototypeInstance());
	this.fixLayout();
};

PrototypeHatBlockMorph.prototype.mouseClickLeft = function () {
    // relay the mouse click to my prototype block to
    // pop-up a Block Dialog

    this.children[0].mouseClickLeft();
};

PrototypeHatBlockMorph.prototype.userMenu = function () {
    return this.children[0].userMenu();
};

// BlockLabelFragment //////////////////////////////////////////////////

// BlockLabelFragment instance creation:

function BlockLabelFragment(labelString) {
	this.labelString = labelString || '';
	this.type = '%s';	// null for label, a spec for an input
	this.defaultValue = '';
	this.isDeleted = false;
}

BlockLabelFragment.prototype.defSpecFragment = function () {
    // answer a string representing my prototype's spec
	var pref = this.type ? '%\'' : '';
	return this.isDeleted ?
            '' : pref + this.labelString + (this.type ? '\'' : '');
};

BlockLabelFragment.prototype.blockSpecFragment = function () {
    // answer a string representing my block spec
    return this.isDeleted ? '' : this.type || this.labelString;
};

BlockLabelFragment.prototype.copy = function () {
	var ans = new BlockLabelFragment(this.labelString);
	ans.type = this.type;
	ans.defaultValue = this.defaultValue;
	return ans;
};

// arity

BlockLabelFragment.prototype.isSingleInput = function () {
    return !this.isMultipleInput() &&
        (this.type !== '%upvar');
};

BlockLabelFragment.prototype.isMultipleInput = function () {
    // answer true if the type begins with '%mult'
    if (!this.type) {
        return false; // not an input at all
    }
    return this.type.indexOf('%mult') > -1;
};

BlockLabelFragment.prototype.isUpvar = function () {
    if (!this.type) {
        return false; // not an input at all
    }
    return this.type === '%upvar';
};

BlockLabelFragment.prototype.setToSingleInput = function () {
    if (!this.type) {return null; } // not an input at all
    if (this.type === '%upvar') {
        this.type = '%s';
    } else {
        this.type = this.singleInputType();
    }
};

BlockLabelFragment.prototype.setToMultipleInput = function () {
    if (!this.type) {return null; } // not an input at all
    if (this.type === '%upvar') {
        this.type = '%s';
    }
    this.type = '%mult'.concat(this.singleInputType());
};

BlockLabelFragment.prototype.setToUpvar = function () {
    if (!this.type) {return null; } // not an input at all
    this.type = '%upvar';
};

BlockLabelFragment.prototype.singleInputType = function () {
    // answer the type of my input withtou any preceding '%mult'
    if (!this.type) {
        return null; // not an input at all
    }
    if (this.isMultipleInput()) {
        return this.type.substr(5); // everything following '%mult'
    }
    return this.type;
};

BlockLabelFragment.prototype.setSingleInputType = function (type) {
    if (!this.type || !this.isMultipleInput()) {
        this.type = type;
    } else {
        this.type = '%mult'.concat(type);
    }
};

// BlockLabelFragmentMorph ///////////////////////////////////////////////

/*
	I am a single word in a custom block prototype's label. I can be clicked
	to edit my contents and to turn me into an input placeholder.
*/

// BlockLabelFragmentMorph inherits from StringMorph:

BlockLabelFragmentMorph.prototype = new StringMorph();
BlockLabelFragmentMorph.prototype.constructor = BlockLabelFragmentMorph;
BlockLabelFragmentMorph.uber = StringMorph.prototype;

// BlockLabelFragmentMorph instance creation:

function BlockLabelFragmentMorph(text) {
	this.init(text);
}

BlockLabelFragmentMorph.prototype.init = function (text) {
	this.fragment = new BlockLabelFragment(text);
	this.fragment.type = null;
	this.sO = null; // temporary backup for shadowOffset
	BlockLabelFragmentMorph.uber.init.call(this, text);
};

// BlockLabelFragmentMorph events:

BlockLabelFragmentMorph.prototype.mouseEnter = function () {
	this.sO = this.shadowOffset;
	this.shadowOffset = this.sO.neg();
	this.drawNew();
	this.changed();
};

BlockLabelFragmentMorph.prototype.mouseLeave = function () {
	this.shadowOffset = this.sO;
	this.drawNew();
	this.changed();
};

BlockLabelFragmentMorph.prototype.mouseClickLeft = function () {
/*
    make a copy of my fragment object and open an InputSlotDialog on it.
    If the user acknowledges the DialogBox, assign the - edited - copy
    of the fragment object to be my new fragment object and update the
    custom block'label (the prototype in the block editor). Do not yet update
    the definition and every block instance, as this happens only after
    the user acknowledges and closes the block editor
*/
    var frag = this.fragment.copy(),
        myself = this,
        isPlaceHolder = this instanceof BlockLabelPlaceHolderMorph;

	new InputSlotDialogMorph(
		frag,
		null,
		function () {myself.updateBlockLabel(frag); },
		this,
        this.parent.definition.category
	).open(
		this instanceof BlockLabelFragmentMorph ?
                'Edit label fragment' :
                isPlaceHolder ? 'Create input name' : 'Edit input name',
		frag.labelString,
		this.world(),
        null,
        isPlaceHolder
	);
};

BlockLabelFragmentMorph.prototype.updateBlockLabel = function (newFragment) {
    var prot = this.parentThatIsA(BlockMorph);

    this.fragment = newFragment;
    if (prot) {
        prot.refreshPrototype();
    }
};

// BlockLabelPlaceHolderMorph ///////////////////////////////////////////////

/*
	I am a space between words or inputs in a custom block prototype's label.
    When I am moused over I display a plus sign on a colored background
    circle. I can be clicked to add a new word or input to the prototype.
*/

// BlockLabelPlaceHolderMorph inherits from StringMorph:

BlockLabelPlaceHolderMorph.prototype = new StringMorph();
BlockLabelPlaceHolderMorph.prototype.constructor = BlockLabelPlaceHolderMorph;
BlockLabelPlaceHolderMorph.uber = StringMorph.prototype;

// BlockLabelPlaceHolderMorph instance creation:

function BlockLabelPlaceHolderMorph() {
	this.init();
}

BlockLabelPlaceHolderMorph.prototype.init = function () {
	this.fragment = new BlockLabelFragment('');
	this.fragment.type = '%s';
    this.fragment.isDeleted = true;
    this.isHighlighted = false;
	BlockLabelFragmentMorph.uber.init.call(this, '+');
};

// BlockLabelPlaceHolderMorph drawing

BlockLabelPlaceHolderMorph.prototype.drawNew = function () {
	var	context, width, x, y, cx, cy;

	// initialize my surface property
	this.image = newCanvas();
	context = this.image.getContext('2d');
	context.font = this.font();

	// set my extent
	width = Math.max(
		context.measureText(this.text).width
			+ Math.abs(this.shadowOffset.x),
		1
	);
	this.bounds.corner = this.bounds.origin.add(
		new Point(
			width,
			fontHeight(this.fontSize) + Math.abs(this.shadowOffset.y)
		)
	);
	this.image.width = width;
	this.image.height = this.height();

    // draw background, if any
    if (this.isHighlighted) {
        cx = Math.floor(width / 2);
        cy = Math.floor(this.height() / 2);
        context.fillStyle = this.color.toString();
        context.beginPath();
        context.arc(
            cx,
            cy,
            Math.min(cx, cy),
            radians(0),
            radians(360),
            false
        );
        context.closePath();
        context.fill();
    }

	// prepare context for drawing text
	context.font = this.font();
	context.textAlign = 'left';
	context.textBaseline = 'bottom';

	// first draw the shadow, if any
	if (this.shadowColor) {
		x = Math.max(this.shadowOffset.x, 0);
		y = Math.max(this.shadowOffset.y, 0);
		context.fillStyle = this.shadowColor.toString();
		context.fillText(this.text, x, fontHeight(this.fontSize) + y);
	}

	// now draw the actual text
	x = Math.abs(Math.min(this.shadowOffset.x, 0));
	y = Math.abs(Math.min(this.shadowOffset.y, 0));
	context.fillStyle = this.isHighlighted ?
            'white' : this.color.toString();
	context.fillText(this.text, x, fontHeight(this.fontSize) + y);

	// notify my parent of layout change
	if (this.parent) {
		if (this.parent.fixLayout) {
			this.parent.fixLayout();
		}
	}
};

// BlockLabelPlaceHolderMorph events:

BlockLabelPlaceHolderMorph.prototype.mouseEnter = function () {
    this.isHighlighted = true;
	this.drawNew();
	this.changed();
};

BlockLabelPlaceHolderMorph.prototype.mouseLeave = function () {
    this.isHighlighted = false;
	this.drawNew();
	this.changed();
};

BlockLabelPlaceHolderMorph.prototype.mouseClickLeft
    = BlockLabelFragmentMorph.prototype.mouseClickLeft;

BlockLabelPlaceHolderMorph.prototype.updateBlockLabel
    = BlockLabelFragmentMorph.prototype.updateBlockLabel;

// BlockInputFragmentMorph ///////////////////////////////////////////////

/*
	I am a variable blob in a custom block prototype's label. I can be clicked
	to edit my contents and to turn me into an part of the block's label text.
*/

// BlockInputFragmentMorph inherits from TemplateSlotMorph:

BlockInputFragmentMorph.prototype = new TemplateSlotMorph();
BlockInputFragmentMorph.prototype.constructor = BlockInputFragmentMorph;
BlockInputFragmentMorph.uber = TemplateSlotMorph.prototype;

// BlockInputFragmentMorph instance creation:

function BlockInputFragmentMorph(text) {
	this.init(text);
}

BlockInputFragmentMorph.prototype.init = function (text) {
	this.fragment = new BlockLabelFragment(text);
	this.fragment.type = '%s';
	BlockInputFragmentMorph.uber.init.call(this, text);
};

// BlockInputFragmentMorph events:

BlockInputFragmentMorph.prototype.mouseClickLeft
    = BlockLabelFragmentMorph.prototype.mouseClickLeft;


BlockInputFragmentMorph.prototype.updateBlockLabel
    = BlockLabelFragmentMorph.prototype.updateBlockLabel;

// InputSlotDialogMorph ////////////////////////////////////////////////

// ... "inherits" some methods from BlockDialogMorph

// InputSlotDialogMorph inherits from DialogBoxMorph:

InputSlotDialogMorph.prototype = new DialogBoxMorph();
InputSlotDialogMorph.prototype.constructor = InputSlotDialogMorph;
InputSlotDialogMorph.uber = DialogBoxMorph.prototype;

// InputSlotDialogMorph instance creation:

function InputSlotDialogMorph(
    fragment,
    target,
    action,
    environment,
    category
) {
	this.init(fragment, target, action, environment, category);
}

InputSlotDialogMorph.prototype.init = function (
	fragment,
	target,
	action,
	environment,
    category
) {
    var fh = fontHeight(10);

	// additional properties:
    this.fragment = fragment || new BlockLabelFragment();
    this.types = null;
    this.slots = null;
    this.isExpanded = false;
    this.category = category || 'other';
    this.cachedRadioButton = null; // "template" for radio button backgrounds

	// initialize inherited properties:
	BlockDialogMorph.uber.init.call(
		this,
		target,
		action,
		environment
	);

	// override inherited properites:
	this.types = new AlignmentMorph('row', this.padding);
    this.types.respectHiddens = true; // prevent the arrow from flipping
	this.add(this.types);
    this.slots = new BoxMorph();
    this.slots.color = new Color(55, 55, 55); // same as palette
    this.slots.borderColor = this.slots.color.lighter(50);
    this.slots.setExtent(new Point((fh + 10) * 21, (fh + 9.5) * 10));
    this.add(this.slots);
    this.createSlotTypeButtons();
    this.fixSlotsLayout();
	this.createTypeButtons();
	this.fixLayout();
};

InputSlotDialogMorph.prototype.createTypeButtons = function () {
	var block,
        arrow,
        myself = this,
        clr = SpriteMorph.prototype.blockColor[this.category];


    block = new JaggedBlockMorph('Title text');
    block.setColor(clr);
	this.addBlockTypeButton(
		function () {myself.setType(null); },
		block,
		function () {return myself.fragment.type === null; }
	);

    block = new JaggedBlockMorph('%inputName');
    block.setColor(clr);
	this.addBlockTypeButton(
		function () {myself.setType('%s'); },
		block,
		function () {return myself.fragment.type !== null; }
	);

    // add an arrow button for long form/short form toggling
    arrow = new ArrowMorph(
        'right',
        PushButtonMorph.prototype.fontSize + 4,
        2
    );
    arrow.noticesTransparentClick = true;
	this.types.add(arrow);
    this.types.fixLayout();

    // configure arrow button
    arrow.refresh = function () {
        if (myself.fragment.type === null) {
            myself.isExpanded = false;
            arrow.hide();
            myself.drawNew();
        } else {
            arrow.show();
            if (myself.isExpanded) {
                arrow.direction = 'down';
            } else {
                arrow.direction = 'right';
            }
            arrow.drawNew();
            arrow.changed();
        }
    };

    arrow.mouseClickLeft = function () {
        if (arrow.isVisible) {
            myself.isExpanded = !myself.isExpanded;
            myself.types.children.forEach(function (c) {
                c.refresh();
            });
            myself.drawNew();
            myself.edit();
        }
    };

    arrow.refresh();
};

InputSlotDialogMorph.prototype.addTypeButton
	= BlockDialogMorph.prototype.addTypeButton;

InputSlotDialogMorph.prototype.addBlockTypeButton
	= BlockDialogMorph.prototype.addBlockTypeButton;

InputSlotDialogMorph.prototype.setType = function (fragmentType) {
	this.fragment.type = fragmentType || null;
	this.types.children.forEach(function (c) {
		c.refresh();
	});
	this.slots.children.forEach(function (c) {
		c.refresh();
	});
	this.edit();
};

InputSlotDialogMorph.prototype.getInput = function () {
	var lbl;
	if (this.body instanceof InputFieldMorph) {
		lbl = this.normalizeSpaces(this.body.getValue());
	}
	if (lbl) {
		this.fragment.labelString = lbl;
        this.fragment.defaultValue = this.slots.defaultInputField.getValue();
		return lbl;
	}
    this.fragment.isDeleted = true;
	return null;
};

InputSlotDialogMorph.prototype.fixLayout = function () {
	var maxWidth,
        left = this.left(),
        th = fontHeight(this.titleFontSize) + this.titlePadding * 2;

    if (!this.isExpanded) {
        if (this.slots) {
            this.slots.hide();
        }
        return BlockDialogMorph.prototype.fixLayout.call(this);
    }


    this.slots.show();
    maxWidth = this.slots.width();

    // arrange panes :
	// body (input field)
    this.body.setPosition(this.position().add(new Point(
        this.padding + (maxWidth - this.body.width()) / 2,
        th + this.padding
    )));

	// label
    this.label.setLeft(
        left + this.padding + (maxWidth - this.label.width()) / 2
    );
    this.label.setTop(this.top() + (th - this.label.height()) / 2);

	// types
    this.types.fixLayout();
    this.types.setTop(this.body.bottom() + this.padding);
    this.types.setLeft(
        left + this.padding + (maxWidth - this.types.width()) / 2
    );

    // slots
    this.slots.setPosition(new Point(
        this.left() + this.padding,
        this.types.bottom() + this.padding
    ));
	this.slots.children.forEach(function (c) {
		c.refresh();
	});

	// buttons
    this.buttons.fixLayout();
    this.buttons.setTop(this.slots.bottom() + this.padding);
    this.buttons.setLeft(
        left + this.padding + (maxWidth - this.buttons.width()) / 2
    );

    // set dialog box dimensions:
    this.silentSetHeight(this.buttons.bottom() - this.top() + this.padding);
    this.silentSetWidth(this.slots.right() - this.left() + this.padding);
};

InputSlotDialogMorph.prototype.open = function (
	title,
	defaultString,
	world,
	pic,
    noDeleteButton
) {
	var txt = new InputFieldMorph(defaultString),
        oldFlag = Morph.prototype.trackChanges;

    Morph.prototype.trackChanges = false;

	txt.setWidth(250);
	this.labelString = title;
	this.createLabel();
	if (pic) {this.setPicture(pic); }
	this.addBody(txt);
	txt.drawNew();
	this.addButton('ok', 'Ok');
    if (!noDeleteButton) {
        this.addButton('deleteFragment', 'Delete');
    }
	this.addButton('cancel', 'Cancel');
    this.fixLayout();
	this.drawNew();
	this.fixLayout();
	if (world) {
		world.add(this);
		this.setCenter(world.center());
		this.edit();
	}
    Morph.prototype.trackChanges = oldFlag;
    this.changed();
};

InputSlotDialogMorph.prototype.deleteFragment = function () {
    this.fragment.isDeleted = true;
    this.accept();
};

InputSlotDialogMorph.prototype.createSlotTypeButtons = function () {
    // populate my 'slots' area with radio buttons, labels and input fields
	var myself = this, defLabel, defInput,
        oldFlag = Morph.prototype.trackChanges;

    Morph.prototype.trackChanges = false;

    // slot types
	this.addSlotTypeButton('Object', '%obj');
	this.addSlotTypeButton('Text', '%txt');
	this.addSlotTypeButton('List', '%l');
	this.addSlotTypeButton('Number', '%n');
	this.addSlotTypeButton('Any type', '%s');
	this.addSlotTypeButton('Boolean (T/F)', '%b');
	this.addSlotTypeButton('Command\n(inline)', '%cmd');
	this.addSlotTypeButton('Reporter', '%r');
	this.addSlotTypeButton('Predicate', '%p');
	this.addSlotTypeButton('Command\n(C-shape)', '%cs');
	this.addSlotTypeButton('Any\n(unevaluated)', '%anyUE');
	this.addSlotTypeButton('Boolean\n(unevaluated)', '%boolUE');

    // arity and upvars
	this.slots.radioButtonSingle = this.addSlotArityButton(
		function () {myself.setSlotArity('single'); },
		"Single input.",
		function () {return myself.fragment.isSingleInput(); }
	);
	this.addSlotArityButton(
		function () {myself.setSlotArity('multiple'); },
		"Multiple inputs (value is list of inputs)",
		function () {return myself.fragment.isMultipleInput(); }
	);
	this.addSlotArityButton(
		function () {myself.setSlotArity('upvar'); },
		"Upvar - make internal variable visible to caller",
		function () {return myself.fragment.isUpvar(); }
	);

    // default values
    defLabel = new StringMorph('Default Value:');
    defLabel.fontSize = this.slots.radioButtonSingle.fontSize;
    defLabel.setColor(new Color(255, 255, 255));
    defLabel.refresh = function () {
        if (myself.isExpanded && contains(
                ['%s', '%n', '%txt', '%anyUE'],
                myself.fragment.type
            )) {
            defLabel.show();
        } else {
            defLabel.hide();
        }
    };
    this.slots.defaultInputLabel = defLabel;
    this.slots.add(defLabel);

    defInput = new InputFieldMorph(this.fragment.defaultValue);
    defInput.contents().fontSize = defLabel.fontSize;
    defInput.contrast = 90;
    defInput.contents().drawNew();
    defInput.setWidth(50);
    defInput.refresh = function () {
        if (defLabel.isVisible) {
            defInput.show();
            if (myself.fragment.type === '%n') {
                defInput.setIsNumeric(true);
            } else {
                defInput.setIsNumeric(false);
            }
        } else {
            defInput.hide();
        }
    };
    this.slots.defaultInputField = defInput;
    this.slots.add(defInput);
    defInput.drawNew();

    Morph.prototype.trackChanges = oldFlag;
};

InputSlotDialogMorph.prototype.setSlotType = function (type) {
    this.fragment.setSingleInputType(type);
	this.slots.children.forEach(function (c) {
		c.refresh();
	});
    this.edit();
};

InputSlotDialogMorph.prototype.setSlotArity = function (arity) {
    if (arity === 'single') {
        this.fragment.setToSingleInput();
    } else if (arity === 'multiple') {
        this.fragment.setToMultipleInput();
    } else if (arity === 'upvar') {
        this.fragment.setToUpvar();
        // hide other options - under construction
    }
	this.slots.children.forEach(function (c) {
		c.refresh();
	});
    this.edit();
};

InputSlotDialogMorph.prototype.addSlotTypeButton = function (
    label,
    spec
) {
/*
    this method produces a radio button with a picture of the
    slot type indicated by "spec" and the "label" text to
    its right.
    Note that you can make the slot picture interactive (turn
    it into a ToggleElementMorph by changing the
    
        element.fullImage()
    
    line to just
    
        element
        
    I've opted for the simpler representation because it reduces
    the duration of time it takes for the InputSlotDialog to load
    and show. But in the future computers and browsers may be
    faster.
*/
	var myself = this,
        action = function () {myself.setSlotType(spec); },
        query,
        element = new JaggedBlockMorph(spec),
        button;

    query = function () {
        return myself.fragment.singleInputType() === spec;
    };
    element.setColor(SpriteMorph.prototype.blockColor[this.category]);
    element.rebuild();
	button = new ToggleMorph(
		'radiobutton',
		this,
		action,
		label,
		query,
        null,
        null,
        this.cachedRadioButton,
        element.fullImage(), // delete the "fullImage()" part for interactive
        'rebuild'
	);
	button.edge = this.buttonEdge / 2;
	button.outline = this.buttonOutline / 2;
	button.outlineColor = this.buttonOutlineColor;
	button.outlineGradient = this.buttonOutlineGradient;
	button.drawNew();
	button.fixLayout();
    button.label.isBold = false;
    button.label.setColor(new Color(255, 255, 255));
    if (!this.cachedRadioButton) {
        this.cachedRadioButton = button;
    }
	this.slots.add(button);
	return button;
};

InputSlotDialogMorph.prototype.addSlotArityButton = function (
    action,
    label,
    query
) {
	var button = new ToggleMorph(
		'radiobutton',
		this,
		action,
		label,
		query,
        null,
        null,
        this.cachedRadioButton
	);
	button.edge = this.buttonEdge / 2;
	button.outline = this.buttonOutline / 2;
	button.outlineColor = this.buttonOutlineColor;
	button.outlineGradient = this.buttonOutlineGradient;

	button.drawNew();
	button.fixLayout();
    button.label.isBold = false;
    button.label.setColor(new Color(255, 255, 255));
	this.slots.add(button);
    if (!this.cachedRadioButton) {
        this.cachedRadioButton = button;
    }
	return button;
};

InputSlotDialogMorph.prototype.fixSlotsLayout = function () {
	var slots = this.slots,
        xPadding = 10,
        ypadding = 14,
        bh = fontHeight(10) + 13, // 23, // slot type button height
        ah = fontHeight(10) + 10, //20, // arity button height
        size = 12, // number slot type radio buttons
        cols = [
            slots.left() + xPadding,
            slots.left() + slots.width() / 3,
            slots.left() + slots.width() * 2 / 3
        ],
        rows = [
            slots.top() + ypadding,
            slots.top() + ypadding + bh,
            slots.top() + ypadding + bh * 2,
            slots.top() + ypadding + bh * 3,
            slots.top() + ypadding + bh * 4,
            slots.top() + ypadding + bh * 5,

            slots.top() + ypadding + bh * 5 + ah,
            slots.top() + ypadding + bh * 5 + ah * 2
        ],
        idx,
        row = -1,
        col,
        oldFlag = Morph.prototype.trackChanges;

    Morph.prototype.trackChanges = false;

    // slot types:

    for (idx = 0; idx < size; idx += 1) {
        col = idx % 3;
        if (idx % 3 === 0) {row += 1; }
        slots.children[idx].setPosition(new Point(
            cols[col],
            rows[row]
        ));
    }

    // arity:

    col = 0;
    row = 5;
    for (idx = size; idx < size + 3; idx += 1) {
        slots.children[idx].setPosition(new Point(
            cols[col],
            rows[row + idx - size]
        ));
    }

    // default input

    this.slots.defaultInputLabel.setPosition(
        this.slots.radioButtonSingle.label.topRight().add(new Point(5, 0))
    );
    this.slots.defaultInputField.setCenter(
        this.slots.defaultInputLabel.center().add(new Point(
            this.slots.defaultInputField.width() / 2
                + this.slots.defaultInputLabel.width() / 2 + 5,
            0
        ))
    );
    Morph.prototype.trackChanges = oldFlag;
    this.slots.changed();
};

// VariableDialogMorph ////////////////////////////////////////////////////

// VariableDialogMorph inherits from DialogBoxMorph:

VariableDialogMorph.prototype = new DialogBoxMorph();
VariableDialogMorph.prototype.constructor = VariableDialogMorph;
VariableDialogMorph.uber = DialogBoxMorph.prototype;

// ... and some behavior from BlockDialogMorph

// VariableDialogMorph instance creation:

function VariableDialogMorph(target, action, environment) {
	this.init(target, action, environment);
}

VariableDialogMorph.prototype.init = function (target, action, environment) {
	// additional properties:
    this.types = null;
    this.isGlobal = true;

	// initialize inherited properties:
	BlockDialogMorph.uber.init.call(
		this,
		target,
		action,
		environment
	);

	// override inherited properites:
	this.types = new AlignmentMorph('row', this.padding);
	this.add(this.types);
	this.createTypeButtons();
};

VariableDialogMorph.prototype.createTypeButtons = function () {
	var myself = this;

	this.addTypeButton(
		function () {myself.setType('gobal'); },
		"for all sprites",
		function () {return myself.isGlobal; }
	);
	this.addTypeButton(
		function () {myself.setType('local'); },
		"for this sprite only",
		function () {return !myself.isGlobal; }
	);
};

VariableDialogMorph.prototype.addTypeButton
    = BlockDialogMorph.prototype.addTypeButton;

VariableDialogMorph.prototype.setType = function (varType) {
	this.isGlobal = (varType === 'gobal');
	this.types.children.forEach(function (c) {
		c.refresh();
	});
	this.edit();
};

VariableDialogMorph.prototype.getInput = function () {
    // answer a tuple: [varName, isGlobal]
    return [
        this.normalizeSpaces(this.body.getValue()),
        this.isGlobal
    ];
};

VariableDialogMorph.prototype.fixLayout = function () {
	var th = fontHeight(this.titleFontSize) + this.titlePadding * 2;

    if (this.body) {
        this.body.setPosition(this.position().add(new Point(
            this.padding,
            th + this.padding
        )));
        this.silentSetWidth(this.body.width() + this.padding * 2);
        this.silentSetHeight(
            this.body.height()
                + this.padding * 2
                + th
        );
    }

	if (this.label) {
		this.label.setCenter(this.center());
		this.label.setTop(this.top() + (th - this.label.height()) / 2);
    }

	if (this.types) {
		this.types.fixLayout();
		this.silentSetHeight(
			this.height()
					+ this.types.height()
					+ this.padding
		);
		this.silentSetWidth(Math.max(
			this.width(),
			this.types.width() + this.padding * 2
		));
		this.types.setCenter(this.center());
		if (this.body) {
			this.types.setTop(this.body.bottom() + this.padding);
		} else if (this.categories) {
			this.types.setTop(this.categories.bottom() + this.padding);
        }
	}

	if (this.buttons && (this.buttons.children.length > 0)) {
		this.buttons.fixLayout();
		this.silentSetHeight(
			this.height()
					+ this.buttons.height()
					+ this.padding
		);
		this.buttons.setCenter(this.center());
		this.buttons.setBottom(this.bottom() - this.padding);
	}
};

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

*/

/*global modules, projectName:true, projectNotes:true, world, localStorage,
location, newCanvas, confirm, showMessage, detect, updatePalette,
updateHistory, Point, Rectangle, Color, Serializer, VariableFrame, Morph,
IDE_Morph, StageMorph, SpriteMorph, ScriptsMorph, BlockMorph, HatBlockMorph,
CommandBlockMorph, ReporterBlockMorph, CustomReporterBlockMorph,
CustomCommandBlockMorph, ArgMorph, MultiArgMorph, StringMorph, InputSlotMorph,
TemplateSlotMorph, ColorSlotMorph, BooleanSlotMorph, FunctionSlotMorph,
ReporterSlotMorph, CSlotMorph, WatcherMorph:true, BoxMorph, CommandSlotMorph,
List, CustomBlockDefinition, Context, ScrollFrameMorph, SyntaxElementMorph */

modules.store = '2012-Mar-27';

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
        if (model.stage.attributes.id) {
            this.objects[model.stage.attributes.id] = project.stage;
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
            sprite.gotoXY(
                +model.attributes.x || 0,
                +model.attributes.y || 0
            );
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
        this.loadCustomBlocks(object, blocks);
        this.populateCustomBlocks(object, blocks);
        this.loadVariables(object.variables, model.require('variables'));
        this.loadScripts(object.scripts, model.require('scripts'));
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
        var v, items, el, my = this;
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
            if (!this.nil(el = model.element('receiver'))
                    && el.isElement
                        && !this.nil(el.element('ref'))) {
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
               '<variables>%</variables>' +
               '<media></media>' +
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
               0,
               s.store(this.variables),
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
    return s.f('<sprite name="@" x="@" y="@" heading="@" color="@,@,@" ~>' +
               '<variables>%</variables>' +
               '<media></media>' +
               '<blocks>%</blocks>' +
               '<scripts>%</scripts>' +
               '</sprite>',
               this.name,
               position.x,
               -position.y,
               this.heading,
               this.color.r,
               this.color.g,
               this.color.b,
               s.store(this.variables),
               s.nil(this.customBlocks) ? '' : s.store(this.customBlocks),
               s.store(this.scripts));
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