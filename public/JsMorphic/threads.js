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

/*global StageMorph, SpriteMorph, StagePrompterMorph*/

// globals from morphic.js:

/*global modules, isString, copy*/

// globals from gui.js:

/*global WatcherMorph*/

// globals from lists.js:

/*global List, ListWatcherMorph*/

/*global alert, console*/

// Global stuff ////////////////////////////////////////////////////////

modules.threads = '2012-Apr-17';

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

ThreadManager.prototype.startProcess = function (block, isThreadSafe) {
	var	active = this.findProcess(block),
		top = block.topBlock(),
		newProc;
	if (active) {
        if (isThreadSafe) {
            return active;
        }
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

            if (proc.prompter) {
                proc.prompter.destroy();
                if (proc.homeContext.receiver.stopTalking) {
                    proc.homeContext.receiver.stopTalking();
                }
            }

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
    prompter            active instance of StagePrompterMorph
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
    this.prompter = null;

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
        isCustomBlock = this.context.isCustomBlock,
        upvars = this.context.upvars;

	this.popContext();
	if (args[0]) {
		if (args[1]) {
			this.pushContext(args[1].blockSequence(), outer);
            this.context.isInsideCustomBlock = isInsideCustomBlock;
            this.context.isLambda = isLambda;
            this.context.isCustomBlock = isCustomBlock;
            this.context.upvars = new UpvarReference(upvars);
		}
	}
	this.pushContext();
};

Process.prototype.doIfElse = function () {
	var args = this.context.inputs,
        outer = this.context.outerContext, // for tail call elimination
        isInsideCustomBlock = this.context.isInsideCustomBlock,
        isLambda = this.context.isLambda,
        isCustomBlock = this.context.isCustomBlock,
        upvars = this.context.upvars;

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
        this.context.upvars = new UpvarReference(upvars);
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
            stage.children.forEach(function (morph) {
                if (morph.stopTalking) {
                    morph.stopTalking();
                }
            });
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
        isCustomBlock = this.context.isCustomBlock,
        upvars = this.context.upvars;

	if (counter < 1) { // was '=== 0', which caused infinite loops on non-ints
		return null;
	}
	this.popContext();

	this.pushContext(block, outer);

    this.context.isInsideCustomBlock = isInsideCustomBlock;
    this.context.isLambda = isLambda;
    this.context.isCustomBlock = isCustomBlock;
    this.context.upvars = new UpvarReference(upvars);

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

// Process sound primitives (interpolated)

Process.prototype.doPlaySoundUntilDone = function (name) {
    var sprite = this.homeContext.receiver;
    //console.log(Date.now() + ': ' + this.context.toString());
    if (this.context.activeAudio === null) {
        this.context.activeAudio = sprite.playSound(name);
    }
    if (this.context.activeAudio.ended
            || this.context.activeAudio.terminated) {
        return null;
	}
    this.pushContext('doYield');
    this.pushContext();
};

Process.prototype.doStopAllSounds = function () {
    var stage = this.homeContext.receiver.parentThatIsA(StageMorph);
    if (stage) {
        stage.threads.processes.forEach(function (thread) {
            if (thread.context && thread.context.activeAudio) {
                thread.popContext();
            }
        });
        stage.stopAllActiveSounds();
    }
};

// Process user prompting primitives (interpolated)

Process.prototype.doAsk = function (data) {
    var stage = this.homeContext.receiver.parentThatIsA(StageMorph),
        isStage = this.homeContext.receiver instanceof StageMorph,
        activePrompter;

	if (!this.prompter) {
        activePrompter = detect(
            stage.children,
            function (morph) {return morph instanceof StagePrompterMorph; }
        );
        if (!activePrompter) {
            if (!isStage) {
                this.homeContext.receiver.bubble(data, false, true);
            }
            this.prompter = new StagePrompterMorph(isStage ? data : null);
            this.prompter.setCenter(stage.center());
            this.prompter.setBottom(stage.bottom() - this.prompter.border);
            stage.add(this.prompter);
            this.prompter.inputField.edit();
            stage.changed();
        }
	} else {
        if (this.prompter.isDone) {
            stage.lastAnswer = this.prompter.inputField.getValue();
            this.prompter.destroy();
            this.prompter = null;
            if (!isStage) {this.homeContext.receiver.stopTalking(); }
            return null;
        }
	}
	this.pushContext('doYield');
	this.pushContext();
};

Process.prototype.reportLastAnswer = function () {
    return this.homeContext.receiver.parentThatIsA(StageMorph).lastAnswer;
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
            procs.push(stage.threads.startProcess(block, stage.isThreadSafe));
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
    activeAudio     audio buffer for interpolated operations, don't persist
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
    this.activeAudio = null;
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
		return new Context(null, 'doStop');
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
