/*

	rectangles.js
	
	- the beginnings of a Morphic framework -
	
	Oct. 10, 2010
	
	written by Jens Mönig
	jens@moenig.org
	(c) 2010
	all rights reserved
	
	TOC
	---
	Global Values
	Global Functions
	
	Color
	Point
	Rectangle
	Node
		Morph
			Bouncer
			World (will inherit from Frame once this gets implemented)
	
*/

// Global Values ///////////////////////////////////////////////////////

// none as of now, but I'm sure there will be ;-)

// Global Functions ////////////////////////////////////////////////////

function isNil(something) {
	// currently unused - marked for removal
	return something === undefined || something === null;
}

function isExtendedNull(something) {
	// currently unused - marked for removal
	return isNil(something) || 
			something === [] ||
			something === '' ||
			something === 0;
}

function nop() {
	// do explicitly nothing - not sure if I like this at all
	return null;
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

// Colors //////////////////////////////////////////////////////////////

// Color instance creation:

function Color(r, g, b, a) {
	// all values are optional, just (r, g, b) is fine
	this.r = r || 0;
	this.g = g || 0;
	this.b = b || 0;
	this.a = a || 1;
}

// Color string representation: e.g. 'rgba(255,165,0,1)'

Color.prototype.toString = function () {
	return 'rgba(' + 
			this.r + ',' + 
			this.g + ',' + 
			this.b + ',' +
			this.a + ')';
};

// Color copying:

Color.prototype.copy = function () {
	return new Color(
			this.r,
			this.g,
			this.b,
			this.a);
};

// Points //////////////////////////////////////////////////////////////

// Point instance creation:

function Point(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

// Point string representation: e.g. '12@68'

Point.prototype.toString = function () {
	return this.x.toString() + '@' + this.y.toString();
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
	return new Point(- this.x, - this.y);
};

Point.prototype.mirror = function () {
	return new Point(this.y, this.x);
};

// Point arithmetic:

Point.prototype.add = function (other) {
	if (other instanceof Point) {
		return new Point(this.x + other.x, this.y + other.y);
	} else {
		return new Point(this.x + other, this.y + other);
	}
};

Point.prototype.subtract = function (other) {
	if (other instanceof Point) {
		return new Point(this.x - other.x, this.y - other.y);
	} else {
		return new Point(this.x - other, this.y - other);
	}
};

Point.prototype.mutltiplyBy = function (other) {
	if (other instanceof Point) {
		return new Point(this.x * other.x, this.y * other.y);
	} else {
		return new Point(this.x * other, this.y * other);
	}
};

Point.prototype.divideBy = function (other) {
	if (other instanceof Point) {
		return new Point(this.x / other.x, this.y / other.y);
	} else {
		return new Point(this.x / other, this.y / other);
	}
};

Point.prototype.floorDivideBy = function (other) {
	if (other instanceof Point) {
		return new Point(Math.floor(this.x / other.x), 
			Math.floor(this.y / other.y));
	} else {
		return new Point(Math.floor(this.x / other), 
			Math.floor(this.y / other));
	}
};

// Point polar coordinates:

Point.prototype.r = function () {
	return Math.sqrt(this.multiplyBy(this));
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
		return new Point(- offset.y, offset.y).add(center);
	} else if (direction === 'left') {
		return new Point(offset.y, - offset.y).add(center);
	} else { // direction === 'pi'
		return center.subtract(offset);
	}
};

Point.prototype.flip = function (direction, center) {
	// direction must be 'vertical' or 'horizontal'

	if (direction === 'vertical') {
		return new Point(this.x, center.y * 2 - this.y);
	} else { // direction === 'horizontal'
		return new Point(center.x * 2 - this.x, this.y);
	}
};

// Point transforming:

Point.prototype.scaleBy = function (scalePoint) {
	return this.multiplyBy(scalePoint);
};

Point.prototype.translateBy = function (deltaPoint) {
	return this.add(deltaPoint);
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
					this.corner.toString() + ']';
};

// Rectangle copying:

Rectangle.prototype.copy = function () {
	return new Rectangle(
			this.left(),
			this.top(),
			this.right(),
			this.bottom());
};

// creating Rectangle instances from Points:

Point.prototype.corner = function (cornerPoint) {
	// answer a new Rectangle
	return new Rectangle(this.x, 
							this.y, 
							cornerPoint.x, 
							cornerPoint.y);
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
	this.origin = new Point(left || this.left(), 
								top || this.top());
	this.corner = new Point(right || this.right(), 
								bottom || this.bottom());
};

// Rectangle accessing - getting:

Rectangle.prototype.area = function () {
//requires width() and height() to be defined

	var w = this.width();
	if (w < 0) {
		return 0;
	} else {
		return Math.max(w * this.height(), 0);
	}
};

Rectangle.prototype.bottom = function () {
	return this.corner.y;
};

Rectangle.prototype.bottomCenter = function () {
	return new Point(this.center().x, this.bottom());
};

Rectangle.prototype.bottomLeft = function () {
	return new Point(this.origin().x, this.corner().y);
};

Rectangle.prototype.bottomRight = function () {
	return new Point(this.corner);
};

Rectangle.prototype.boundingBox = function () {
	return this;
};

Rectangle.prototype.center = function () {
	return this.origin.add(
		this.corner.subtract(this.origin).floorDivideBy(2));
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

// Rectangle testing:

Rectangle.prototype.containsPoint = function (aPoint) {
	return this.origin.le(aPoint) && aPoint.lt(this.corner);
};

Rectangle.prototype.containsRectangle = function (aRect) {
	return aRect.origin.gt(this.origin) && 
		aRect.corner.lt(this.corner);
};

Rectangle.prototype.intersects = function (aRect) {
	var ro, rc;
	ro = aRect.origin;
	rc = aRect.corner;
	if (rc.x < this.origin.x) {
		return false;
	} else if (rc.y < this.origin.y) {
		return false;
	} else if (ro.x > this.corner.x) {
		return false;
	} else if (ro.y > this.corner.y) {
		return false;
	} else {
		return true;
	}
};

// Rectangle transforming:

Rectangle.prototype.scaleBy = function (scale) {
	// scale can be either a Point or a scalar
	
	var	o = this.origin.multiplyBy(scale), 
		c = this.corner.mulitplyBy(scale);
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

// Node string representation: e.g. 'aNode[3]'

Node.prototype.toString = function () {
	return 'aNode' + '[' + this.children.length.toString() + ']';
};

// Node accessing:

Node.prototype.addChild = function (aNode) {
	this.children.push(aNode);
	aNode.parent = this;
};

Node.prototype.removeChild = function (aNode) {
	var idx = this.indexOf(aNode);
	if (idx !== 1) {
		this.children.splice(idx, 1);
	}
};

// Node functions:

Node.prototype.root = function () {
	if (this.parent === null) {
		return this;
	} else {
		return this.parent.root();
	}
};

Node.prototype.depth = function () {
	if (this.parent === null) {
		return 0;
	} else {
		return this.parent.depth() + 1;
	}
};

Node.prototype.allChildren = function () {
	// includes myself
	
	var result = [this];
	this.children.forEach(function (child) {
		result.push(child.allChildren());
	});
	return result;
};

Node.prototype.allLeafs = function () {
	var result = [];
	this.allChildren().forEach(function (element) {
		if (element.children === []) {
			result.push(element);
		}
	});
	return result;
};

Node.prototype.allParents = function () {
	// includes myself

	var result = [this];
	if (this.parent !== null) {
		result.push(this.parent.allParents());
	}
	return result;
};

Node.prototype.siblings = function () {
	if (this.parent === null) {
		return [];
	} else {
		return this.parent.children.filter(function (child) {
			return child === this;
		});
	}
};

Node.prototype.parentThatIsA = function (constructor) {
	// excluding myself
	
	if (this.parent === null) {
		return null;
	} else if (this.parent.constructor === constructor) {
		return this.parent;
	} else {
		return this.parent.parentThatIsA(constructor);
	}
};

// Morphs //////////////////////////////////////////////////////////////
	
// Morph: referenced constructors

var Morph;
var World;

// Morph inherits from Node:

Morph.prototype = new Node();
Morph.prototype.constructor = Morph;
Morph.uber = Node.prototype;

// Morph instance creation:

function Morph() {
	this.init();
}

// Morph initialization:

Morph.prototype.init = function () {
	Morph.uber.init.call(this);
	this.bounds = new Rectangle(0, 0, 50, 40);
	this.color = new Color(80, 80, 80);
	this.alpha = 1;
	this.isVisible = true;
	this.isDraggable = true;
	this.drawNew();
	this.fps = 0;
	this.lastTime = Date.now();
};

// Morph string representation: e.g. 'aMorph 2 [20@45 | 130@250]'

Morph.prototype.toString = function () {
	return 'a' + this.constructor.name + ' ' + 
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

Morph.prototype.wantsToStep = function () {
	return this.isVisible;
};

Morph.prototype.stepFrame = function () {
	if (! this.wantsToStep()) {
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
	// default behavior, overridden by my heirs
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
	var result = this.bounds;
	this.children.forEach(function (child) {
		result = result.merge(child.fullBounds());
	});
	return result;
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

Morph.prototype.setPosition = function (aPoint) {
	var delta = aPoint.subtract(this.topLeft());
	if ((delta.x !== 0) || (delta.y !== 0)) {
		this.moveBy(delta);
	}
};

Morph.prototype.setCenter = function (aPoint) {
	this.setPosition(aPoint.subtract(
		this.extent().floorDivideBy(2)));
};

Morph.prototype.setFullCenter = function (aPoint) {
	this.setPosition(aPoint.subtract(
		this.fullBounds().extent().floorDivideBy(2)));
};

Morph.prototype.keepWithin = function (aMorph) {
	// make sure I am completely within another Morph's bounds
	
	var leftOff, rightOff, topOff, bottomOff;
	leftOff = this.fullBounds().left() - aMorph.left();
	if (leftOff < 0) {
		this.moveBy(new Point(- leftOff, 0));
	}
	rightOff = this.fullBounds().right() - aMorph.right();
	if (leftOff > 0) {
		this.moveBy(new Point(- rightOff, 0));
	}
	topOff = this.fullBounds().top() - aMorph.top();
	if (topOff < 0) {
		this.moveBy(new Point(0, - topOff));
	}
	bottomOff = this.fullBounds().bottom() - aMorph.bottom();
	if (bottomOff > 0) {
		this.moveBy(new Point(0, - bottomOff));
	}
};

// Morph accessing - dimensional changes requiring a complete redraw

Morph.prototype.setExtent = function (aPoint) {
	var newWidth, newHeight;
	newWidth = Math.max(aPoint.x, 0);
	newHeight = Math.max(aPoint.y, 0);
	this.changed();
	this.bounds.corner = new Point(this.bounds.origin.x + newWidth,
									this.bounds.origin.y + newHeight);
	this.changed();
	this.drawNew();
};

Morph.prototype.setWidth = function (width) {
	this.setExtent(new Point(width || 0, this.height()));
};

Morph.prototype.setHeight = function (height) {
	this.setExtent(new Point(this.width(), height || 0));
};

Morph.prototype.setColor = function (aColor) {
	this.color = aColor;
	this.changed();
	this.drawNew();
};


// Morph displaying:

Morph.prototype.drawNew = function () {
	// initialize my surface property

	this.image = newCanvas(this.extent());
	var context = this.image.getContext('2d');
	context.fillStyle = this.color.toString();
	context.fillRect(0, 0, this.width(), this.height());
};

Morph.prototype.drawOn = function (aCanvas, aRect) {
	var rectangle, area, delta, src, context;
	if (! this.isVisible) {
		return null;
	}
	rectangle = aRect || this.bounds();
	area = rectangle.intersect(this.bounds);
	if (area.extent().gt(new Point(0, 0))) {

		delta = this.position().neg();
		src = area.copy().translateBy(delta);
		context = aCanvas.getContext('2d');
		
		context.drawImage(
			this.image, 
			src.left(), 
			src.top(),
			src.width(),
			src.height(),
			area.left(),
			area.top(),
			src.width(),
			src.height());
	}
};

Morph.prototype.fullDrawOn = function (aCanvas, aRect) {
	var rectangle;
	if (! this.isVisible) {
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
	this.isVisible = (! this.isVisible);
	this.changed();
	this.children.forEach(function (child) {
		child.toggleVisibility();
	});
};


// Morph conversion:

/*
	methods for:

	- fullSurface
	- shadowSurface
	- shadow
	- addShadow
	- getShadow
	- removeShadow

	perhaps these aren't needed at all, because Canvas
	allows for a more elegant shading

*/

// Morph updating:

Morph.prototype.changed = function () {
	var w = this.root();
	if (w instanceof World) {
		w.broken.push(this.bounds.copy());
	}
};

Morph.prototype.fullChanged = function () {
	var w = this.root();
	if (w instanceof World) {
		w.broken.push(this.fullBounds().copy());
	}
};

// Morph accessing - structure:

Morph.prototype.world = function () {
	var root = this.root();
	if (root instanceof World) {
		return root;
	}
};

Morph.prototype.add = function (aMorph) {
	var owner = aMorph.parent;
	if (owner !== null) {
		owner.removeChild(aMorph);
	}
	this.addChild(aMorph);
	this.changed();
};

Morph.prototype.morphAt = function (aPoint) {
	var morphs = this.allChildren().slice(0).reverse();
	morphs.forEach(function (m) {
		if (m.fullBounds().containsPoint(aPoint)) {
			return m;
		}
	});
	return null;
};

// Bouncers ////////////////////////////////////////////////////////////

var Bouncer;

// Bouncers inherit from Morph:

Bouncer.prototype = new Morph();
Bouncer.prototype.constructor = Bouncer;
Bouncer.uber = Morph.prototype;

// Bouncer instance creation:

function Bouncer() {
	this.init();
}

// Bouncer initialization:

Bouncer.prototype.init = function (type, speed) {
	Bouncer.uber.init.call(this);
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

// Bouncer moving:

Bouncer.prototype.moveUp = function () {
	this.moveBy(new Point(0, -this.speed));
};

Bouncer.prototype.moveDown = function () {
	this.moveBy(new Point(0, this.speed));
};

Bouncer.prototype.moveRight = function () {
	this.moveBy(new Point(this.speed, 0));
};

Bouncer.prototype.moveLeft = function () {
	this.moveBy(new Point(-this.speed, 0));
};

// Bouncer stepping:

Bouncer.prototype.step = function () {
	if (! this.isStopped) {
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

// World ///////////////////////////////////////////////////////////////
// will inherit from Frame once Frame is implemented
// currently World inherits from Morph:

World.prototype = new Morph();
World.prototype.constructor = World;
World.uber = Morph.prototype;

// World instance creation:

function World(aCanvas) {
	this.init(aCanvas);
}

// World initialization:

World.prototype.init = function (aCanvas) {
	World.uber.init.call(this);
	this.color = new Color(130, 130, 130);
	this.alpha = 1;
	this.bounds = new Rectangle(0, 0, aCanvas.width, aCanvas.height);
	this.drawNew();
	this.isVisible = true;
	this.isDraggable = false;
	this.worldCanvas = aCanvas;
	
	// additional properties: 
	this.broken = [];
};

// ...

World.prototype.brokenFor = function (aMorph) {
	// private
	var fb = aMorph.fullBounds();
	return this.broken.filter(function (rect) {
		return rect.intersects(fb);
	});
};

// World displaying:

World.prototype.fullDrawOn = function (aCanvas, aRect) {
	var rectangle, ctx;
	rectangle = aRect || this.fullBounds();
	ctx = aCanvas.getContext('2d');
	ctx.fillStyle = this.color.toString();
	ctx.fillRect(rectangle.left(), 
				rectangle.top(), 
				rectangle.width(), 
				rectangle.height());

	this.children.forEach(function (child) {
		child.fullDrawOn(aCanvas, rectangle);
	});

};

// add hand to draw method	

// World stepping:

World.prototype.updateBroken = function () {
	var myself = this;
	this.broken.forEach(function (rect) {
		if (rect.extent().gt(new Point(0, 0))) {
			// myself.fullDrawOn(myself.image, rect);
			myself.fullDrawOn(this.worldCanvas, rect);
		}
	});
	this.broken = [];
};

World.prototype.doOneCycle = function () {
	this.stepFrame();
	this.updateBroken();
/*	
	this.worldCanvas.getContext('2d').drawImage(
			this.image, 
			0, 
			0);
*/
};
