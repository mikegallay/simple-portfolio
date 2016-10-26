// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.
 
/*! Picturefill - v3.0.1 - 2015-09-30
 * http://scottjehl.github.io/picturefill
 * Copyright (c) 2015 https://github.com/scottjehl/picturefill/blob/master/Authors.txt; Licensed MIT
 */
/*! Gecko-Picture - v1.0
 * https://github.com/scottjehl/picturefill/tree/3.0/src/plugins/gecko-picture
 * Firefox's early picture implementation (prior to FF41) is static and does
 * not react to viewport changes. This tiny module fixes this.
 */
(function(window) {
	/*jshint eqnull:true */
	var ua = navigator.userAgent;

	if ( window.HTMLPictureElement && ((/ecko/).test(ua) && ua.match(/rv\:(\d+)/) && RegExp.$1 < 41) ) {
		addEventListener("resize", (function() {
			var timer;

			var dummySrc = document.createElement("source");

			var fixRespimg = function(img) {
				var source, sizes;
				var picture = img.parentNode;

				if (picture.nodeName.toUpperCase() === "PICTURE") {
					source = dummySrc.cloneNode();

					picture.insertBefore(source, picture.firstElementChild);
					setTimeout(function() {
						picture.removeChild(source);
					});
				} else if (!img._pfLastSize || img.offsetWidth > img._pfLastSize) {
					img._pfLastSize = img.offsetWidth;
					sizes = img.sizes;
					img.sizes += ",100vw";
					setTimeout(function() {
						img.sizes = sizes;
					});
				}
			};

			var findPictureImgs = function() {
				var i;
				var imgs = document.querySelectorAll("picture > img, img[srcset][sizes]");
				for (i = 0; i < imgs.length; i++) {
					fixRespimg(imgs[i]);
				}
			};
			var onResize = function() {
				clearTimeout(timer);
				timer = setTimeout(findPictureImgs, 99);
			};
			var mq = window.matchMedia && matchMedia("(orientation: landscape)");
			var init = function() {
				onResize();

				if (mq && mq.addListener) {
					mq.addListener(onResize);
				}
			};

			dummySrc.srcset = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

			if (/^[c|i]|d$/.test(document.readyState || "")) {
				init();
			} else {
				document.addEventListener("DOMContentLoaded", init);
			}

			return onResize;
		})());
	}
})(window);

/*! Picturefill - v3.0.1
 * http://scottjehl.github.io/picturefill
 * Copyright (c) 2015 https://github.com/scottjehl/picturefill/blob/master/Authors.txt;
 *  License: MIT
 */

(function( window, document, undefined ) {
	// Enable strict mode
	"use strict";

	// HTML shim|v it for old IE (IE9 will still need the HTML video tag workaround)
	document.createElement( "picture" );

	var warn, eminpx, alwaysCheckWDescriptor, evalId;
	// local object for method references and testing exposure
	var pf = {};
	var noop = function() {};
	var image = document.createElement( "img" );
	var getImgAttr = image.getAttribute;
	var setImgAttr = image.setAttribute;
	var removeImgAttr = image.removeAttribute;
	var docElem = document.documentElement;
	var types = {};
	var cfg = {
		//resource selection:
		algorithm: ""
	};
	var srcAttr = "data-pfsrc";
	var srcsetAttr = srcAttr + "set";
	// ua sniffing is done for undetectable img loading features,
	// to do some non crucial perf optimizations
	var ua = navigator.userAgent;
	var supportAbort = (/rident/).test(ua) || ((/ecko/).test(ua) && ua.match(/rv\:(\d+)/) && RegExp.$1 > 35 );
	var curSrcProp = "currentSrc";
	var regWDesc = /\s+\+?\d+(e\d+)?w/;
	var regSize = /(\([^)]+\))?\s*(.+)/;
	var setOptions = window.picturefillCFG;
	/**
	 * Shortcut property for https://w3c.github.io/webappsec/specs/mixedcontent/#restricts-mixed-content ( for easy overriding in tests )
	 */
	// baseStyle also used by getEmValue (i.e.: width: 1em is important)
	var baseStyle = "position:absolute;left:0;visibility:hidden;display:block;padding:0;border:none;font-size:1em;width:1em;overflow:hidden;clip:rect(0px, 0px, 0px, 0px)";
	var fsCss = "font-size:100%!important;";
	var isVwDirty = true;

	var cssCache = {};
	var sizeLengthCache = {};
	var DPR = window.devicePixelRatio;
	var units = {
		px: 1,
		"in": 96
	};
	var anchor = document.createElement( "a" );
	/**
	 * alreadyRun flag used for setOptions. is it true setOptions will reevaluate
	 * @type {boolean}
	 */
	var alreadyRun = false;

	// Reusable, non-"g" Regexes

	// (Don't use \s, to avoid matching non-breaking space.)
	var regexLeadingSpaces = /^[ \t\n\r\u000c]+/,
	    regexLeadingCommasOrSpaces = /^[, \t\n\r\u000c]+/,
	    regexLeadingNotSpaces = /^[^ \t\n\r\u000c]+/,
	    regexTrailingCommas = /[,]+$/,
	    regexNonNegativeInteger = /^\d+$/,

	    // ( Positive or negative or unsigned integers or decimals, without or without exponents.
	    // Must include at least one digit.
	    // According to spec tests any decimal point must be followed by a digit.
	    // No leading plus sign is allowed.)
	    // https://html.spec.whatwg.org/multipage/infrastructure.html#valid-floating-point-number
	    regexFloatingPoint = /^-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/;

	var on = function(obj, evt, fn, capture) {
		if ( obj.addEventListener ) {
			obj.addEventListener(evt, fn, capture || false);
		} else if ( obj.attachEvent ) {
			obj.attachEvent( "on" + evt, fn);
		}
	};

	/**
	 * simple memoize function:
	 */

	var memoize = function(fn) {
		var cache = {};
		return function(input) {
			if ( !(input in cache) ) {
				cache[ input ] = fn(input);
			}
			return cache[ input ];
		};
	};

	// UTILITY FUNCTIONS

	// Manual is faster than RegEx
	// http://jsperf.com/whitespace-character/5
	function isSpace(c) {
		return (c === "\u0020" || // space
		        c === "\u0009" || // horizontal tab
		        c === "\u000A" || // new line
		        c === "\u000C" || // form feed
		        c === "\u000D");  // carriage return
	}

	/**
	 * gets a mediaquery and returns a boolean or gets a css length and returns a number
	 * @param css mediaqueries or css length
	 * @returns {boolean|number}
	 *
	 * based on: https://gist.github.com/jonathantneal/db4f77009b155f083738
	 */
	var evalCSS = (function() {

		var regLength = /^([\d\.]+)(em|vw|px)$/;
		var replace = function() {
			var args = arguments, index = 0, string = args[0];
			while (++index in args) {
				string = string.replace(args[index], args[++index]);
			}
			return string;
		};

		var buildStr = memoize(function(css) {

			return "return " + replace((css || "").toLowerCase(),
				// interpret `and`
				/\band\b/g, "&&",

				// interpret `,`
				/,/g, "||",

				// interpret `min-` as >=
				/min-([a-z-\s]+):/g, "e.$1>=",

				// interpret `max-` as <=
				/max-([a-z-\s]+):/g, "e.$1<=",

				//calc value
				/calc([^)]+)/g, "($1)",

				// interpret css values
				/(\d+[\.]*[\d]*)([a-z]+)/g, "($1 * e.$2)",
				//make eval less evil
				/^(?!(e.[a-z]|[0-9\.&=|><\+\-\*\(\)\/])).*/ig, ""
			) + ";";
		});

		return function(css, length) {
			var parsedLength;
			if (!(css in cssCache)) {
				cssCache[css] = false;
				if (length && (parsedLength = css.match( regLength ))) {
					cssCache[css] = parsedLength[ 1 ] * units[parsedLength[ 2 ]];
				} else {
					/*jshint evil:true */
					try{
						cssCache[css] = new Function("e", buildStr(css))(units);
					} catch(e) {}
					/*jshint evil:false */
				}
			}
			return cssCache[css];
		};
	})();

	var setResolution = function( candidate, sizesattr ) {
		if ( candidate.w ) { // h = means height: || descriptor.type === 'h' do not handle yet...
			candidate.cWidth = pf.calcListLength( sizesattr || "100vw" );
			candidate.res = candidate.w / candidate.cWidth ;
		} else {
			candidate.res = candidate.d;
		}
		return candidate;
	};

	/**
	 *
	 * @param opt
	 */
	var picturefill = function( opt ) {
		var elements, i, plen;

		var options = opt || {};

		if ( options.elements && options.elements.nodeType === 1 ) {
			if ( options.elements.nodeName.toUpperCase() === "IMG" ) {
				options.elements =  [ options.elements ];
			} else {
				options.context = options.elements;
				options.elements =  null;
			}
		}

		elements = options.elements || pf.qsa( (options.context || document), ( options.reevaluate || options.reselect ) ? pf.sel : pf.selShort );

		if ( (plen = elements.length) ) {

			pf.setupRun( options );
			alreadyRun = true;

			// Loop through all elements
			for ( i = 0; i < plen; i++ ) {
				pf.fillImg(elements[ i ], options);
			}

			pf.teardownRun( options );
		}
	};

	/**
	 * outputs a warning for the developer
	 * @param {message}
	 * @type {Function}
	 */
	warn = ( window.console && console.warn ) ?
		function( message ) {
			console.warn( message );
		} :
		noop
	;

	if ( !(curSrcProp in image) ) {
		curSrcProp = "src";
	}

	// Add support for standard mime types.
	types[ "image/jpeg" ] = true;
	types[ "image/gif" ] = true;
	types[ "image/png" ] = true;

	function detectTypeSupport( type, typeUri ) {
		// based on Modernizr's lossless img-webp test
		// note: asynchronous
		var image = new window.Image();
		image.onerror = function() {
			types[ type ] = false;
			picturefill();
		};
		image.onload = function() {
			types[ type ] = image.width === 1;
			picturefill();
		};
		image.src = typeUri;
		return "pending";
	}

	// test svg support
	types[ "image/svg+xml" ] = document.implementation.hasFeature( "http://wwwindow.w3.org/TR/SVG11/feature#Image", "1.1" );

	/**
	 * updates the internal vW property with the current viewport width in px
	 */
	function updateMetrics() {

		isVwDirty = false;
		DPR = window.devicePixelRatio;
		cssCache = {};
		sizeLengthCache = {};

		pf.DPR = DPR || 1;

		units.width = Math.max(window.innerWidth || 0, docElem.clientWidth);
		units.height = Math.max(window.innerHeight || 0, docElem.clientHeight);

		units.vw = units.width / 100;
		units.vh = units.height / 100;

		evalId = [ units.height, units.width, DPR ].join("-");

		units.em = pf.getEmValue();
		units.rem = units.em;
	}

	function chooseLowRes( lowerValue, higherValue, dprValue, isCached ) {
		var bonusFactor, tooMuch, bonus, meanDensity;

		//experimental
		if (cfg.algorithm === "saveData" ){
			if ( lowerValue > 2.7 ) {
				meanDensity = dprValue + 1;
			} else {
				tooMuch = higherValue - dprValue;
				bonusFactor = Math.pow(lowerValue - 0.6, 1.5);

				bonus = tooMuch * bonusFactor;

				if (isCached) {
					bonus += 0.1 * bonusFactor;
				}

				meanDensity = lowerValue + bonus;
			}
		} else {
			meanDensity = (dprValue > 1) ?
				Math.sqrt(lowerValue * higherValue) :
				lowerValue;
		}

		return meanDensity > dprValue;
	}

	function applyBestCandidate( img ) {
		var srcSetCandidates;
		var matchingSet = pf.getSet( img );
		var evaluated = false;
		if ( matchingSet !== "pending" ) {
			evaluated = evalId;
			if ( matchingSet ) {
				srcSetCandidates = pf.setRes( matchingSet );
				pf.applySetCandidate( srcSetCandidates, img );
			}
		}
		img[ pf.ns ].evaled = evaluated;
	}

	function ascendingSort( a, b ) {
		return a.res - b.res;
	}

	function setSrcToCur( img, src, set ) {
		var candidate;
		if ( !set && src ) {
			set = img[ pf.ns ].sets;
			set = set && set[set.length - 1];
		}

		candidate = getCandidateForSrc(src, set);

		if ( candidate ) {
			src = pf.makeUrl(src);
			img[ pf.ns ].curSrc = src;
			img[ pf.ns ].curCan = candidate;

			if ( !candidate.res ) {
				setResolution( candidate, candidate.set.sizes );
			}
		}
		return candidate;
	}

	function getCandidateForSrc( src, set ) {
		var i, candidate, candidates;
		if ( src && set ) {
			candidates = pf.parseSet( set );
			src = pf.makeUrl(src);
			for ( i = 0; i < candidates.length; i++ ) {
				if ( src === pf.makeUrl(candidates[ i ].url) ) {
					candidate = candidates[ i ];
					break;
				}
			}
		}
		return candidate;
	}

	function getAllSourceElements( picture, candidates ) {
		var i, len, source, srcset;

		// SPEC mismatch intended for size and perf:
		// actually only source elements preceding the img should be used
		// also note: don't use qsa here, because IE8 sometimes doesn't like source as the key part in a selector
		var sources = picture.getElementsByTagName( "source" );

		for ( i = 0, len = sources.length; i < len; i++ ) {
			source = sources[ i ];
			source[ pf.ns ] = true;
			srcset = source.getAttribute( "srcset" );

			// if source does not have a srcset attribute, skip
			if ( srcset ) {
				candidates.push( {
					srcset: srcset,
					media: source.getAttribute( "media" ),
					type: source.getAttribute( "type" ),
					sizes: source.getAttribute( "sizes" )
				} );
			}
		}
	}

	/**
	 * Srcset Parser
	 * By Alex Bell |  MIT License
	 *
	 * @returns Array [{url: _, d: _, w: _, h:_, set:_(????)}, ...]
	 *
	 * Based super duper closely on the reference algorithm at:
	 * https://html.spec.whatwg.org/multipage/embedded-content.html#parse-a-srcset-attribute
	 */

	// 1. Let input be the value passed to this algorithm.
	// (TO-DO : Explain what "set" argument is here. Maybe choose a more
	// descriptive & more searchable name.  Since passing the "set" in really has
	// nothing to do with parsing proper, I would prefer this assignment eventually
	// go in an external fn.)
	function parseSrcset(input, set) {

		function collectCharacters(regEx) {
			var chars,
			    match = regEx.exec(input.substring(pos));
			if (match) {
				chars = match[ 0 ];
				pos += chars.length;
				return chars;
			}
		}

		var inputLength = input.length,
		    url,
		    descriptors,
		    currentDescriptor,
		    state,
		    c,

		    // 2. Let position be a pointer into input, initially pointing at the start
		    //    of the string.
		    pos = 0,

		    // 3. Let candidates be an initially empty source set.
		    candidates = [];

		/**
		* Adds descriptor properties to a candidate, pushes to the candidates array
		* @return undefined
		*/
		// (Declared outside of the while loop so that it's only created once.
		// (This fn is defined before it is used, in order to pass JSHINT.
		// Unfortunately this breaks the sequencing of the spec comments. :/ )
		function parseDescriptors() {

			// 9. Descriptor parser: Let error be no.
			var pError = false,

			// 10. Let width be absent.
			// 11. Let density be absent.
			// 12. Let future-compat-h be absent. (We're implementing it now as h)
			    w, d, h, i,
			    candidate = {},
			    desc, lastChar, value, intVal, floatVal;

			// 13. For each descriptor in descriptors, run the appropriate set of steps
			// from the following list:
			for (i = 0 ; i < descriptors.length; i++) {
				desc = descriptors[ i ];

				lastChar = desc[ desc.length - 1 ];
				value = desc.substring(0, desc.length - 1);
				intVal = parseInt(value, 10);
				floatVal = parseFloat(value);

				// If the descriptor consists of a valid non-negative integer followed by
				// a U+0077 LATIN SMALL LETTER W character
				if (regexNonNegativeInteger.test(value) && (lastChar === "w")) {

					// If width and density are not both absent, then let error be yes.
					if (w || d) {pError = true;}

					// Apply the rules for parsing non-negative integers to the descriptor.
					// If the result is zero, let error be yes.
					// Otherwise, let width be the result.
					if (intVal === 0) {pError = true;} else {w = intVal;}

				// If the descriptor consists of a valid floating-point number followed by
				// a U+0078 LATIN SMALL LETTER X character
				} else if (regexFloatingPoint.test(value) && (lastChar === "x")) {

					// If width, density and future-compat-h are not all absent, then let error
					// be yes.
					if (w || d || h) {pError = true;}

					// Apply the rules for parsing floating-point number values to the descriptor.
					// If the result is less than zero, let error be yes. Otherwise, let density
					// be the result.
					if (floatVal < 0) {pError = true;} else {d = floatVal;}

				// If the descriptor consists of a valid non-negative integer followed by
				// a U+0068 LATIN SMALL LETTER H character
				} else if (regexNonNegativeInteger.test(value) && (lastChar === "h")) {

					// If height and density are not both absent, then let error be yes.
					if (h || d) {pError = true;}

					// Apply the rules for parsing non-negative integers to the descriptor.
					// If the result is zero, let error be yes. Otherwise, let future-compat-h
					// be the result.
					if (intVal === 0) {pError = true;} else {h = intVal;}

				// Anything else, Let error be yes.
				} else {pError = true;}
			} // (close step 13 for loop)

			// 15. If error is still no, then append a new image source to candidates whose
			// URL is url, associated with a width width if not absent and a pixel
			// density density if not absent. Otherwise, there is a parse error.
			if (!pError) {
				candidate.url = url;

				if (w) { candidate.w = w;}
				if (d) { candidate.d = d;}
				if (h) { candidate.h = h;}
				if (!h && !d && !w) {candidate.d = 1;}
				if (candidate.d === 1) {set.has1x = true;}
				candidate.set = set;

				candidates.push(candidate);
			}
		} // (close parseDescriptors fn)

		/**
		* Tokenizes descriptor properties prior to parsing
		* Returns undefined.
		* (Again, this fn is defined before it is used, in order to pass JSHINT.
		* Unfortunately this breaks the logical sequencing of the spec comments. :/ )
		*/
		function tokenize() {

			// 8.1. Descriptor tokeniser: Skip whitespace
			collectCharacters(regexLeadingSpaces);

			// 8.2. Let current descriptor be the empty string.
			currentDescriptor = "";

			// 8.3. Let state be in descriptor.
			state = "in descriptor";

			while (true) {

				// 8.4. Let c be the character at position.
				c = input.charAt(pos);

				//  Do the following depending on the value of state.
				//  For the purpose of this step, "EOF" is a special character representing
				//  that position is past the end of input.

				// In descriptor
				if (state === "in descriptor") {
					// Do the following, depending on the value of c:

				  // Space character
				  // If current descriptor is not empty, append current descriptor to
				  // descriptors and let current descriptor be the empty string.
				  // Set state to after descriptor.
					if (isSpace(c)) {
						if (currentDescriptor) {
							descriptors.push(currentDescriptor);
							currentDescriptor = "";
							state = "after descriptor";
						}

					// U+002C COMMA (,)
					// Advance position to the next character in input. If current descriptor
					// is not empty, append current descriptor to descriptors. Jump to the step
					// labeled descriptor parser.
					} else if (c === ",") {
						pos += 1;
						if (currentDescriptor) {
							descriptors.push(currentDescriptor);
						}
						parseDescriptors();
						return;

					// U+0028 LEFT PARENTHESIS (()
					// Append c to current descriptor. Set state to in parens.
					} else if (c === "\u0028") {
						currentDescriptor = currentDescriptor + c;
						state = "in parens";

					// EOF
					// If current descriptor is not empty, append current descriptor to
					// descriptors. Jump to the step labeled descriptor parser.
					} else if (c === "") {
						if (currentDescriptor) {
							descriptors.push(currentDescriptor);
						}
						parseDescriptors();
						return;

					// Anything else
					// Append c to current descriptor.
					} else {
						currentDescriptor = currentDescriptor + c;
					}
				// (end "in descriptor"

				// In parens
				} else if (state === "in parens") {

					// U+0029 RIGHT PARENTHESIS ())
					// Append c to current descriptor. Set state to in descriptor.
					if (c === ")") {
						currentDescriptor = currentDescriptor + c;
						state = "in descriptor";

					// EOF
					// Append current descriptor to descriptors. Jump to the step labeled
					// descriptor parser.
					} else if (c === "") {
						descriptors.push(currentDescriptor);
						parseDescriptors();
						return;

					// Anything else
					// Append c to current descriptor.
					} else {
						currentDescriptor = currentDescriptor + c;
					}

				// After descriptor
				} else if (state === "after descriptor") {

					// Do the following, depending on the value of c:
					// Space character: Stay in this state.
					if (isSpace(c)) {

					// EOF: Jump to the step labeled descriptor parser.
					} else if (c === "") {
						parseDescriptors();
						return;

					// Anything else
					// Set state to in descriptor. Set position to the previous character in input.
					} else {
						state = "in descriptor";
						pos -= 1;

					}
				}

				// Advance position to the next character in input.
				pos += 1;

			// Repeat this step.
			} // (close while true loop)
		}

		// 4. Splitting loop: Collect a sequence of characters that are space
		//    characters or U+002C COMMA characters. If any U+002C COMMA characters
		//    were collected, that is a parse error.
		while (true) {
			collectCharacters(regexLeadingCommasOrSpaces);

			// 5. If position is past the end of input, return candidates and abort these steps.
			if (pos >= inputLength) {
				return candidates; // (we're done, this is the sole return path)
			}

			// 6. Collect a sequence of characters that are not space characters,
			//    and let that be url.
			url = collectCharacters(regexLeadingNotSpaces);

			// 7. Let descriptors be a new empty list.
			descriptors = [];

			// 8. If url ends with a U+002C COMMA character (,), follow these substeps:
			//		(1). Remove all trailing U+002C COMMA characters from url. If this removed
			//         more than one character, that is a parse error.
			if (url.slice(-1) === ",") {
				url = url.replace(regexTrailingCommas, "");
				// (Jump ahead to step 9 to skip tokenization and just push the candidate).
				parseDescriptors();

			//	Otherwise, follow these substeps:
			} else {
				tokenize();
			} // (close else of step 8)

		// 16. Return to the step labeled splitting loop.
		} // (Close of big while loop.)
	}

	/*
	 * Sizes Parser
	 *
	 * By Alex Bell |  MIT License
	 *
	 * Non-strict but accurate and lightweight JS Parser for the string value <img sizes="here">
	 *
	 * Reference algorithm at:
	 * https://html.spec.whatwg.org/multipage/embedded-content.html#parse-a-sizes-attribute
	 *
	 * Most comments are copied in directly from the spec
	 * (except for comments in parens).
	 *
	 * Grammar is:
	 * <source-size-list> = <source-size># [ , <source-size-value> ]? | <source-size-value>
	 * <source-size> = <media-condition> <source-size-value>
	 * <source-size-value> = <length>
	 * http://www.w3.org/html/wg/drafts/html/master/embedded-content.html#attr-img-sizes
	 *
	 * E.g. "(max-width: 30em) 100vw, (max-width: 50em) 70vw, 100vw"
	 * or "(min-width: 30em), calc(30vw - 15px)" or just "30vw"
	 *
	 * Returns the first valid <css-length> with a media condition that evaluates to true,
	 * or "100vw" if all valid media conditions evaluate to false.
	 *
	 */

	function parseSizes(strValue) {

		// (Percentage CSS lengths are not allowed in this case, to avoid confusion:
		// https://html.spec.whatwg.org/multipage/embedded-content.html#valid-source-size-list
		// CSS allows a single optional plus or minus sign:
		// http://www.w3.org/TR/CSS2/syndata.html#numbers
		// CSS is ASCII case-insensitive:
		// http://www.w3.org/TR/CSS2/syndata.html#characters )
		// Spec allows exponential notation for <number> type:
		// http://dev.w3.org/csswg/css-values/#numbers
		var regexCssLengthWithUnits = /^(?:[+-]?[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?(?:ch|cm|em|ex|in|mm|pc|pt|px|rem|vh|vmin|vmax|vw)$/i;

		// (This is a quick and lenient test. Because of optional unlimited-depth internal
		// grouping parens and strict spacing rules, this could get very complicated.)
		var regexCssCalc = /^calc\((?:[0-9a-z \.\+\-\*\/\(\)]+)\)$/i;

		var i;
		var unparsedSizesList;
		var unparsedSizesListLength;
		var unparsedSize;
		var lastComponentValue;
		var size;

		// UTILITY FUNCTIONS

		//  (Toy CSS parser. The goals here are:
		//  1) expansive test coverage without the weight of a full CSS parser.
		//  2) Avoiding regex wherever convenient.
		//  Quick tests: http://jsfiddle.net/gtntL4gr/3/
		//  Returns an array of arrays.)
		function parseComponentValues(str) {
			var chrctr;
			var component = "";
			var componentArray = [];
			var listArray = [];
			var parenDepth = 0;
			var pos = 0;
			var inComment = false;

			function pushComponent() {
				if (component) {
					componentArray.push(component);
					component = "";
				}
			}

			function pushComponentArray() {
				if (componentArray[0]) {
					listArray.push(componentArray);
					componentArray = [];
				}
			}

			// (Loop forwards from the beginning of the string.)
			while (true) {
				chrctr = str.charAt(pos);

				if (chrctr === "") { // ( End of string reached.)
					pushComponent();
					pushComponentArray();
					return listArray;
				} else if (inComment) {
					if ((chrctr === "*") && (str[pos + 1] === "/")) { // (At end of a comment.)
						inComment = false;
						pos += 2;
						pushComponent();
						continue;
					} else {
						pos += 1; // (Skip all characters inside comments.)
						continue;
					}
				} else if (isSpace(chrctr)) {
					// (If previous character in loop was also a space, or if
					// at the beginning of the string, do not add space char to
					// component.)
					if ( (str.charAt(pos - 1) && isSpace( str.charAt(pos - 1) ) ) || !component ) {
						pos += 1;
						continue;
					} else if (parenDepth === 0) {
						pushComponent();
						pos +=1;
						continue;
					} else {
						// (Replace any space character with a plain space for legibility.)
						chrctr = " ";
					}
				} else if (chrctr === "(") {
					parenDepth += 1;
				} else if (chrctr === ")") {
					parenDepth -= 1;
				} else if (chrctr === ",") {
					pushComponent();
					pushComponentArray();
					pos += 1;
					continue;
				} else if ( (chrctr === "/") && (str.charAt(pos + 1) === "*") ) {
					inComment = true;
					pos += 2;
					continue;
				}

				component = component + chrctr;
				pos += 1;
			}
		}

		function isValidNonNegativeSourceSizeValue(s) {
			if (regexCssLengthWithUnits.test(s) && (parseFloat(s) >= 0)) {return true;}
			if (regexCssCalc.test(s)) {return true;}
			// ( http://www.w3.org/TR/CSS2/syndata.html#numbers says:
			// "-0 is equivalent to 0 and is not a negative number." which means that
			// unitless zero and unitless negative zero must be accepted as special cases.)
			if ((s === "0") || (s === "-0") || (s === "+0")) {return true;}
			return false;
		}

		// When asked to parse a sizes attribute from an element, parse a
		// comma-separated list of component values from the value of the element's
		// sizes attribute (or the empty string, if the attribute is absent), and let
		// unparsed sizes list be the result.
		// http://dev.w3.org/csswg/css-syntax/#parse-comma-separated-list-of-component-values

		unparsedSizesList = parseComponentValues(strValue);
		unparsedSizesListLength = unparsedSizesList.length;

		// For each unparsed size in unparsed sizes list:
		for (i = 0; i < unparsedSizesListLength; i++) {
			unparsedSize = unparsedSizesList[i];

			// 1. Remove all consecutive <whitespace-token>s from the end of unparsed size.
			// ( parseComponentValues() already omits spaces outside of parens. )

			// If unparsed size is now empty, that is a parse error; continue to the next
			// iteration of this algorithm.
			// ( parseComponentValues() won't push an empty array. )

			// 2. If the last component value in unparsed size is a valid non-negative
			// <source-size-value>, let size be its value and remove the component value
			// from unparsed size. Any CSS function other than the calc() function is
			// invalid. Otherwise, there is a parse error; continue to the next iteration
			// of this algorithm.
			// http://dev.w3.org/csswg/css-syntax/#parse-component-value
			lastComponentValue = unparsedSize[unparsedSize.length - 1];

			if (isValidNonNegativeSourceSizeValue(lastComponentValue)) {
				size = lastComponentValue;
				unparsedSize.pop();
			} else {
				continue;
			}

			// 3. Remove all consecutive <whitespace-token>s from the end of unparsed
			// size. If unparsed size is now empty, return size and exit this algorithm.
			// If this was not the last item in unparsed sizes list, that is a parse error.
			if (unparsedSize.length === 0) {
				return size;
			}

			// 4. Parse the remaining component values in unparsed size as a
			// <media-condition>. If it does not parse correctly, or it does parse
			// correctly but the <media-condition> evaluates to false, continue to the
			// next iteration of this algorithm.
			// (Parsing all possible compound media conditions in JS is heavy, complicated,
			// and the payoff is unclear. Is there ever an situation where the
			// media condition parses incorrectly but still somehow evaluates to true?
			// Can we just rely on the browser/polyfill to do it?)
			unparsedSize = unparsedSize.join(" ");
			if (!(pf.matchesMedia( unparsedSize ) ) ) {
				continue;
			}

			// 5. Return size and exit this algorithm.
			return size;
		}

		// If the above algorithm exhausts unparsed sizes list without returning a
		// size value, return 100vw.
		return "100vw";
	}

	// namespace
	pf.ns = ("pf" + new Date().getTime()).substr(0, 9);

	// srcset support test
	pf.supSrcset = "srcset" in image;
	pf.supSizes = "sizes" in image;
	pf.supPicture = !!window.HTMLPictureElement;

	if (pf.supSrcset && pf.supPicture && !pf.supSizes) {
		(function(image2) {
			image.srcset = "data:,a";
			image2.src = "data:,a";
			pf.supSrcset = image.complete === image2.complete;
			pf.supPicture = pf.supSrcset && pf.supPicture;
		})(document.createElement("img"));
	}

	// using pf.qsa instead of dom traversing does scale much better,
	// especially on sites mixing responsive and non-responsive images
	pf.selShort = "picture>img,img[srcset]";
	pf.sel = pf.selShort;
	pf.cfg = cfg;

	if ( pf.supSrcset ) {
		pf.sel += ",img[" + srcsetAttr + "]";
	}

	/**
	 * Shortcut property for `devicePixelRatio` ( for easy overriding in tests )
	 */
	pf.DPR = (DPR  || 1 );
	pf.u = units;

	// container of supported mime types that one might need to qualify before using
	pf.types =  types;

	alwaysCheckWDescriptor = pf.supSrcset && !pf.supSizes;

	pf.setSize = noop;

	/**
	 * Gets a string and returns the absolute URL
	 * @param src
	 * @returns {String} absolute URL
	 */

	pf.makeUrl = memoize(function(src) {
		anchor.href = src;
		return anchor.href;
	});

	/**
	 * Gets a DOM element or document and a selctor and returns the found matches
	 * Can be extended with jQuery/Sizzle for IE7 support
	 * @param context
	 * @param sel
	 * @returns {NodeList}
	 */
	pf.qsa = function(context, sel) {
		return context.querySelectorAll(sel);
	};

	/**
	 * Shortcut method for matchMedia ( for easy overriding in tests )
	 * wether native or pf.mMQ is used will be decided lazy on first call
	 * @returns {boolean}
	 */
	pf.matchesMedia = function() {
		if ( window.matchMedia && (matchMedia( "(min-width: 0.1em)" ) || {}).matches ) {
			pf.matchesMedia = function( media ) {
				return !media || ( matchMedia( media ).matches );
			};
		} else {
			pf.matchesMedia = pf.mMQ;
		}

		return pf.matchesMedia.apply( this, arguments );
	};

	/**
	 * A simplified matchMedia implementation for IE8 and IE9
	 * handles only min-width/max-width with px or em values
	 * @param media
	 * @returns {boolean}
	 */
	pf.mMQ = function( media ) {
		return media ? evalCSS(media) : true;
	};

	/**
	 * Returns the calculated length in css pixel from the given sourceSizeValue
	 * http://dev.w3.org/csswg/css-values-3/#length-value
	 * intended Spec mismatches:
	 * * Does not check for invalid use of CSS functions
	 * * Does handle a computed length of 0 the same as a negative and therefore invalid value
	 * @param sourceSizeValue
	 * @returns {Number}
	 */
	pf.calcLength = function( sourceSizeValue ) {

		var value = evalCSS(sourceSizeValue, true) || false;
		if (value < 0) {
			value = false;
		}

		return value;
	};

	/**
	 * Takes a type string and checks if its supported
	 */

	pf.supportsType = function( type ) {
		return ( type ) ? types[ type ] : true;
	};

	/**
	 * Parses a sourceSize into mediaCondition (media) and sourceSizeValue (length)
	 * @param sourceSizeStr
	 * @returns {*}
	 */
	pf.parseSize = memoize(function( sourceSizeStr ) {
		var match = ( sourceSizeStr || "" ).match(regSize);
		return {
			media: match && match[1],
			length: match && match[2]
		};
	});

	pf.parseSet = function( set ) {
		if ( !set.cands ) {
			set.cands = parseSrcset(set.srcset, set);
		}
		return set.cands;
	};

	/**
	 * returns 1em in css px for html/body default size
	 * function taken from respondjs
	 * @returns {*|number}
	 */
	pf.getEmValue = function() {
		var body;
		if ( !eminpx && (body = document.body) ) {
			var div = document.createElement( "div" ),
				originalHTMLCSS = docElem.style.cssText,
				originalBodyCSS = body.style.cssText;

			div.style.cssText = baseStyle;

			// 1em in a media query is the value of the default font size of the browser
			// reset docElem and body to ensure the correct value is returned
			docElem.style.cssText = fsCss;
			body.style.cssText = fsCss;

			body.appendChild( div );
			eminpx = div.offsetWidth;
			body.removeChild( div );

			//also update eminpx before returning
			eminpx = parseFloat( eminpx, 10 );

			// restore the original values
			docElem.style.cssText = originalHTMLCSS;
			body.style.cssText = originalBodyCSS;

		}
		return eminpx || 16;
	};

	/**
	 * Takes a string of sizes and returns the width in pixels as a number
	 */
	pf.calcListLength = function( sourceSizeListStr ) {
		// Split up source size list, ie ( max-width: 30em ) 100%, ( max-width: 50em ) 50%, 33%
		//
		//                           or (min-width:30em) calc(30% - 15px)
		if ( !(sourceSizeListStr in sizeLengthCache) || cfg.uT ) {
			var winningLength = pf.calcLength( parseSizes( sourceSizeListStr ) );

			sizeLengthCache[ sourceSizeListStr ] = !winningLength ? units.width : winningLength;
		}

		return sizeLengthCache[ sourceSizeListStr ];
	};

	/**
	 * Takes a candidate object with a srcset property in the form of url/
	 * ex. "images/pic-medium.png 1x, images/pic-medium-2x.png 2x" or
	 *     "images/pic-medium.png 400w, images/pic-medium-2x.png 800w" or
	 *     "images/pic-small.png"
	 * Get an array of image candidates in the form of
	 *      {url: "/foo/bar.png", resolution: 1}
	 * where resolution is http://dev.w3.org/csswg/css-values-3/#resolution-value
	 * If sizes is specified, res is calculated
	 */
	pf.setRes = function( set ) {
		var candidates;
		if ( set ) {

			candidates = pf.parseSet( set );

			for ( var i = 0, len = candidates.length; i < len; i++ ) {
				setResolution( candidates[ i ], set.sizes );
			}
		}
		return candidates;
	};

	pf.setRes.res = setResolution;

	pf.applySetCandidate = function( candidates, img ) {
		if ( !candidates.length ) {return;}
		var candidate,
			i,
			j,
			length,
			bestCandidate,
			curSrc,
			curCan,
			candidateSrc,
			abortCurSrc;

		var imageData = img[ pf.ns ];
		var dpr = pf.DPR;

		curSrc = imageData.curSrc || img[curSrcProp];

		curCan = imageData.curCan || setSrcToCur(img, curSrc, candidates[0].set);

		// if we have a current source, we might either become lazy or give this source some advantage
		if ( curCan && curCan.set === candidates[ 0 ].set ) {

			// if browser can abort image request and the image has a higher pixel density than needed
			// and this image isn't downloaded yet, we skip next part and try to save bandwidth
			abortCurSrc = (supportAbort && !img.complete && curCan.res - 0.1 > dpr);

			if ( !abortCurSrc ) {
				curCan.cached = true;

				// if current candidate is "best", "better" or "okay",
				// set it to bestCandidate
				if ( curCan.res >= dpr ) {
					bestCandidate = curCan;
				}
			}
		}

		if ( !bestCandidate ) {

			candidates.sort( ascendingSort );

			length = candidates.length;
			bestCandidate = candidates[ length - 1 ];

			for ( i = 0; i < length; i++ ) {
				candidate = candidates[ i ];
				if ( candidate.res >= dpr ) {
					j = i - 1;

					// we have found the perfect candidate,
					// but let's improve this a little bit with some assumptions ;-)
					if (candidates[ j ] &&
						(abortCurSrc || curSrc !== pf.makeUrl( candidate.url )) &&
						chooseLowRes(candidates[ j ].res, candidate.res, dpr, candidates[ j ].cached)) {

						bestCandidate = candidates[ j ];

					} else {
						bestCandidate = candidate;
					}
					break;
				}
			}
		}

		if ( bestCandidate ) {

			candidateSrc = pf.makeUrl( bestCandidate.url );

			imageData.curSrc = candidateSrc;
			imageData.curCan = bestCandidate;

			if ( candidateSrc !== curSrc ) {
				pf.setSrc( img, bestCandidate );
			}
			pf.setSize( img );
		}
	};

	pf.setSrc = function( img, bestCandidate ) {
		var origWidth;
		img.src = bestCandidate.url;

		// although this is a specific Safari issue, we don't want to take too much different code paths
		if ( bestCandidate.set.type === "image/svg+xml" ) {
			origWidth = img.style.width;
			img.style.width = (img.offsetWidth + 1) + "px";

			// next line only should trigger a repaint
			// if... is only done to trick dead code removal
			if ( img.offsetWidth + 1 ) {
				img.style.width = origWidth;
			}
		}
	};

	pf.getSet = function( img ) {
		var i, set, supportsType;
		var match = false;
		var sets = img [ pf.ns ].sets;

		for ( i = 0; i < sets.length && !match; i++ ) {
			set = sets[i];

			if ( !set.srcset || !pf.matchesMedia( set.media ) || !(supportsType = pf.supportsType( set.type )) ) {
				continue;
			}

			if ( supportsType === "pending" ) {
				set = supportsType;
			}

			match = set;
			break;
		}

		return match;
	};

	pf.parseSets = function( element, parent, options ) {
		var srcsetAttribute, imageSet, isWDescripor, srcsetParsed;

		var hasPicture = parent && parent.nodeName.toUpperCase() === "PICTURE";
		var imageData = element[ pf.ns ];

		if ( imageData.src === undefined || options.src ) {
			imageData.src = getImgAttr.call( element, "src" );
			if ( imageData.src ) {
				setImgAttr.call( element, srcAttr, imageData.src );
			} else {
				removeImgAttr.call( element, srcAttr );
			}
		}

		if ( imageData.srcset === undefined || options.srcset || !pf.supSrcset || element.srcset ) {
			srcsetAttribute = getImgAttr.call( element, "srcset" );
			imageData.srcset = srcsetAttribute;
			srcsetParsed = true;
		}

		imageData.sets = [];

		if ( hasPicture ) {
			imageData.pic = true;
			getAllSourceElements( parent, imageData.sets );
		}

		if ( imageData.srcset ) {
			imageSet = {
				srcset: imageData.srcset,
				sizes: getImgAttr.call( element, "sizes" )
			};

			imageData.sets.push( imageSet );

			isWDescripor = (alwaysCheckWDescriptor || imageData.src) && regWDesc.test(imageData.srcset || "");

			// add normal src as candidate, if source has no w descriptor
			if ( !isWDescripor && imageData.src && !getCandidateForSrc(imageData.src, imageSet) && !imageSet.has1x ) {
				imageSet.srcset += ", " + imageData.src;
				imageSet.cands.push({
					url: imageData.src,
					d: 1,
					set: imageSet
				});
			}

		} else if ( imageData.src ) {
			imageData.sets.push( {
				srcset: imageData.src,
				sizes: null
			} );
		}

		imageData.curCan = null;
		imageData.curSrc = undefined;

		// if img has picture or the srcset was removed or has a srcset and does not support srcset at all
		// or has a w descriptor (and does not support sizes) set support to false to evaluate
		imageData.supported = !( hasPicture || ( imageSet && !pf.supSrcset ) || isWDescripor );

		if ( srcsetParsed && pf.supSrcset && !imageData.supported ) {
			if ( srcsetAttribute ) {
				setImgAttr.call( element, srcsetAttr, srcsetAttribute );
				element.srcset = "";
			} else {
				removeImgAttr.call( element, srcsetAttr );
			}
		}

		if (imageData.supported && !imageData.srcset && ((!imageData.src && element.src) ||  element.src !== pf.makeUrl(imageData.src))) {
			if (imageData.src === null) {
				element.removeAttribute("src");
			} else {
				element.src = imageData.src;
			}
		}

		imageData.parsed = true;
	};

	pf.fillImg = function(element, options) {
		var imageData;
		var extreme = options.reselect || options.reevaluate;

		// expando for caching data on the img
		if ( !element[ pf.ns ] ) {
			element[ pf.ns ] = {};
		}

		imageData = element[ pf.ns ];

		// if the element has already been evaluated, skip it
		// unless `options.reevaluate` is set to true ( this, for example,
		// is set to true when running `picturefill` on `resize` ).
		if ( !extreme && imageData.evaled === evalId ) {
			return;
		}

		if ( !imageData.parsed || options.reevaluate ) {
			pf.parseSets( element, element.parentNode, options );
		}

		if ( !imageData.supported ) {
			applyBestCandidate( element );
		} else {
			imageData.evaled = evalId;
		}
	};

	pf.setupRun = function() {
		if ( !alreadyRun || isVwDirty || (DPR !== window.devicePixelRatio) ) {
			updateMetrics();
		}
	};

	// If picture is supported, well, that's awesome.
	if ( pf.supPicture ) {
		picturefill = noop;
		pf.fillImg = noop;
	} else {

		 // Set up picture polyfill by polling the document
		(function() {
			var isDomReady;
			var regReady = window.attachEvent ? /d$|^c/ : /d$|^c|^i/;

			var run = function() {
				var readyState = document.readyState || "";

				timerId = setTimeout(run, readyState === "loading" ? 200 :  999);
				if ( document.body ) {
					pf.fillImgs();
					isDomReady = isDomReady || regReady.test(readyState);
					if ( isDomReady ) {
						clearTimeout( timerId );
					}

				}
			};

			var timerId = setTimeout(run, document.body ? 9 : 99);

			// Also attach picturefill on resize and readystatechange
			// http://modernjavascript.blogspot.com/2013/08/building-better-debounce.html
			var debounce = function(func, wait) {
				var timeout, timestamp;
				var later = function() {
					var last = (new Date()) - timestamp;

					if (last < wait) {
						timeout = setTimeout(later, wait - last);
					} else {
						timeout = null;
						func();
					}
				};

				return function() {
					timestamp = new Date();

					if (!timeout) {
						timeout = setTimeout(later, wait);
					}
				};
			};
			var lastClientWidth = docElem.clientHeight;
			var onResize = function() {
				isVwDirty = Math.max(window.innerWidth || 0, docElem.clientWidth) !== units.width || docElem.clientHeight !== lastClientWidth;
				lastClientWidth = docElem.clientHeight;
				if ( isVwDirty ) {
					pf.fillImgs();
				}
			};

			on( window, "resize", debounce(onResize, 99 ) );
			on( document, "readystatechange", run );
		})();
	}

	pf.picturefill = picturefill;
	//use this internally for easy monkey patching/performance testing
	pf.fillImgs = picturefill;
	pf.teardownRun = noop;

	/* expose methods for testing */
	picturefill._ = pf;

	window.picturefillCFG = {
		pf: pf,
		push: function(args) {
			var name = args.shift();
			if (typeof pf[name] === "function") {
				pf[name].apply(pf, args);
			} else {
				cfg[name] = args[0];
				if (alreadyRun) {
					pf.fillImgs( { reselect: true } );
				}
			}
		}
	};

	while (setOptions && setOptions.length) {
		window.picturefillCFG.push(setOptions.shift());
	}

	/* expose picturefill */
	window.picturefill = picturefill;

	/* expose picturefill */
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// CommonJS, just export
		module.exports = picturefill;
	} else if ( typeof define === "function" && define.amd ) {
		// AMD support
		define( "picturefill", function() { return picturefill; } );
	}

	// IE8 evals this sync, so it must be the last thing we do
	if ( !pf.supPicture ) {
		types[ "image/webp" ] = detectTypeSupport("image/webp", "data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA==" );
	}

} )( window, document );

// End PictureFill
////////////////////////////////////

//dropkick
!function(){if(!window.CustomEvent&&document.createEventObject)return void(window.CustomEvent=function(e,t){if(!arguments.length)throw new Error("Not enough arguments");var s={type:e,bubbles:!1,cancelable:!1,detail:null},i=document.createEventObject();for(var n in s)i[n]=s[n];for(var n in t)i[n]=t[n];return i});try{new CustomEvent("test")}catch(e){var t=function(e,t){if(!arguments.length)throw new Error("Not enough arguments");var s={bubbles:!1,cancelable:!1,detail:null};for(var i in t)s[i]=t[i];var n=document.createEvent("CustomEvent");return n.initCustomEvent(e,s.bubbles,s.cancelable,s.detail),n};t.prototype=(window.CustomEvent||window.Event).prototype,window.CustomEvent=t}}(),function(){if(!document.addEventListener&&window.Element&&window.Event){var e="__events",t="__immediateStopped";Event.prototype.NONE=Event.NONE=0,Event.prototype.CAPTURING_PHASE=Event.CAPTURING_PHASE=1,Event.prototype.AT_TARGET=Event.AT_TARGET=2,Event.prototype.BUBBLING_PHASE=Event.BUBBLING_PHASE=3,Event.prototype.preventDefault=function(){this.cancelable!==!1&&(this.returnValue=!1)},Event.prototype.stopPropagation=function(){this.cancelBubble=!0},Event.prototype.stopImmediatePropagation=function(){this[t]=this.cancelBubble=!0};for(var s=function(e,t){return e.timeStamp=+new Date,e.target||(e.target=e.srcElement||t),e.pageX=e.clientX+document.documentElement.scrollLeft,e.pageY=e.clientY+document.documentElement.scrollTop,"mouseover"==e.type?e.relatedTarget=e.fromElement:"mouseout"==e.type?e.relatedTarget=e.toElement:e.relatedTarget=null,e},i=function(e,t,s){for(var i=0;i<e.length;i++){var n=e[i];if(n.useCapture==s&&n.listener==t)return i}return-1},n=function(e,t,s){e.currentTarget=s,"function"==typeof t?t.call(s,e):t.handleEvent(e)},a=function(e){for(var t=[];e.parentNode;)t.unshift(e.parentNode),e=e.parentNode;return t},o=function(s,i,a){s.eventPhase=a;for(var o=0;o<i.length;o++){for(var r=i[o],l=[],d=(r[e]||{})[s.type]||[],h=0;h<d.length;h++){var c=d[h];c.useCapture&&a==Event.BUBBLING_PHASE||(c.useCapture||a!=Event.CAPTURING_PHASE)&&l.push(c.listener)}for(h=0;h<l.length;)try{for(;h<l.length;){var u=l[h++];if(n(s,u,r),s[t])return!0}}catch(p){setTimeout(function(){throw p},0)}if(s.cancelBubble)return!0}return!1},r=function(e){s(e,this);var t=a(e.target);return t.length&&o(e,t,Event.CAPTURING_PHASE)?e.returnValue:o(e,[e.target],Event.AT_TARGET)?e.returnValue:t.length&&e.bubbles!==!1&&(t.reverse(),o(e,t,Event.BUBBLING_PHASE))?e.returnValue:(e.stopPropagation(),e.returnValue)},l=({addEventListener:function(t,s,n){var a=this,o=(this[e]||{})[t]||[],l=o.length;if(!(i(o,s,n)>-1)){if(e in this)var d=this[e];else{var d={_handler:function(){r.apply(a,arguments)}};this[e]=d}t in d||(d[t]=[]),d[t].push({listener:s,useCapture:n}),l||this.attachEvent("on"+t,d._handler)}},removeEventListener:function(t,s,n){var a=(this[e]||{})[t]||[],o=i(a,s,n);-1!=o&&(a.splice(o,1),a.length||this.detachEvent("on"+t,this[e]._handler))},dispatchEvent:function(e){return e.returnValue=!0,r.call(this,e)}}),d=[Element,window.constructor,document.constructor];d.length;){var h=d.pop();for(var c in l)h.prototype[c]=l[c]}}}(),Array.prototype.forEach||(Array.prototype.forEach=function(e,t){var s,i;if(null==this)throw new TypeError(" this is null or not defined");var n=Object(this),a=n.length>>>0;if("function"!=typeof e)throw new TypeError(e+" is not a function");for(arguments.length>1&&(s=t),i=0;a>i;){var o;i in n&&(o=n[i],e.call(s,o,i,n)),i++}}),Array.prototype.indexOf||(Array.prototype.indexOf=function(e,t){var s;if(null==this)throw new TypeError('"this" is null or not defined');var i=Object(this),n=i.length>>>0;if(0===n)return-1;var a=+t||0;if(Math.abs(a)===1/0&&(a=0),a>=n)return-1;for(s=Math.max(a>=0?a:n-Math.abs(a),0);n>s;){if(s in i&&i[s]===e)return s;s++}return-1}),function(e){var t;if("object"==typeof exports){try{t=require("jquery")}catch(s){}module.exports=e(window,document,t)}else"function"==typeof define&&define.amd?define([],function(){return e(window,document,window.jQuery)}):window.Dropkick=e(window,document,window.jQuery)}(function(e,t,s,i){var n,a=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),o=e.parent!==e.self,r=-1!==navigator.appVersion.indexOf("MSIE"),l=function(s,i){var n,a;if(this===e)return new l(s,i);for("string"==typeof s&&"#"===s[0]&&(s=t.getElementById(s.substr(1))),n=0;n<l.uid;n++)if(a=l.cache[n],a instanceof l&&a.data.select===s)return c.extend(a.data.settings,i),a;return s?s.length<1?(console.error("You must have options inside your <select>: ",s),!1):"SELECT"===s.nodeName?this.init(s,i):void 0:(console.error("You must pass a select to DropKick"),!1)},d=function(){},h={initialize:d,mobile:!1,change:d,open:d,close:d,search:"strict",bubble:!0},c={hasClass:function(e,t){var s=new RegExp("(^|\\s+)"+t+"(\\s+|$)");return e&&s.test(e.className)},addClass:function(e,t){e&&!c.hasClass(e,t)&&(e.className+=" "+t)},removeClass:function(e,t){var s=new RegExp("(^|\\s+)"+t+"(\\s+|$)");e&&(e.className=e.className.replace(s," "))},toggleClass:function(e,t){var s=c.hasClass(e,t)?"remove":"add";c[s+"Class"](e,t)},extend:function(e){return Array.prototype.slice.call(arguments,1).forEach(function(t){if(t)for(var s in t)e[s]=t[s]}),e},offset:function(s){var i=s.getBoundingClientRect()||{top:0,left:0},n=t.documentElement,a=r?n.scrollTop:e.pageYOffset,o=r?n.scrollLeft:e.pageXOffset;return{top:i.top+a-n.clientTop,left:i.left+o-n.clientLeft}},position:function(e,t){for(var s={top:0,left:0};e&&e!==t;)s.top+=e.offsetTop,s.left+=e.offsetLeft,e=e.parentNode;return s},closest:function(e,t){for(;e;){if(e===t)return e;e=e.parentNode}return!1},create:function(e,s){var i,n=t.createElement(e);s||(s={});for(i in s)s.hasOwnProperty(i)&&("innerHTML"===i?n.innerHTML=s[i]:n.setAttribute(i,s[i]));return n},deferred:function(t){return function(){var s=arguments,i=this;e.setTimeout(function(){t.apply(i,s)},1)}}};return l.cache={},l.uid=0,l.prototype={add:function(e,s){var i,n,a;"string"==typeof e&&(i=e,e=t.createElement("option"),e.text=i),"OPTION"===e.nodeName&&(n=c.create("li",{"class":"dk-option","data-value":e.value,innerHTML:e.text,role:"option","aria-selected":"false",id:"dk"+this.data.cacheID+"-"+(e.id||e.value.replace(" ","-"))}),c.addClass(n,e.className),this.length+=1,e.disabled&&(c.addClass(n,"dk-option-disabled"),n.setAttribute("aria-disabled","true")),e.hidden&&(c.addClass(n,"dk-option-hidden"),n.setAttribute("aria-hidden","true")),this.data.select.add(e,s),"number"==typeof s&&(s=this.item(s)),a=this.options.indexOf(s),a>-1?(s.parentNode.insertBefore(n,s),this.options.splice(a,0,n)):(this.data.elem.lastChild.appendChild(n),this.options.push(n)),n.addEventListener("mouseover",this),e.selected&&this.select(a))},item:function(e){return e=0>e?this.options.length+e:e,this.options[e]||null},remove:function(e){var t=this.item(e);t.parentNode.removeChild(t),this.options.splice(e,1),this.data.select.remove(e),this.select(this.data.select.selectedIndex),this.length-=1},init:function(e,s){var i,r=l.build(e,"dk"+l.uid);if(this.data={},this.data.select=e,this.data.elem=r.elem,this.data.settings=c.extend({},h,s),this.disabled=e.disabled,this.form=e.form,this.length=e.length,this.multiple=e.multiple,this.options=r.options.slice(0),this.selectedIndex=e.selectedIndex,this.selectedOptions=r.selected.slice(0),this.value=e.value,this.data.cacheID=l.uid,l.cache[this.data.cacheID]=this,this.data.settings.initialize.call(this),l.uid+=1,this._changeListener||(e.addEventListener("change",this),this._changeListener=!0),!a||this.data.settings.mobile){if(e.parentNode.insertBefore(this.data.elem,e),e.setAttribute("data-dkCacheId",this.data.cacheID),this.data.elem.addEventListener("click",this),this.data.elem.addEventListener("keydown",this),this.data.elem.addEventListener("keypress",this),this.form&&this.form.addEventListener("reset",this),!this.multiple)for(i=0;i<this.options.length;i++)this.options[i].addEventListener("mouseover",this);n||(t.addEventListener("click",l.onDocClick),o&&parent.document.addEventListener("click",l.onDocClick),n=!0)}return this},close:function(){var e,t=this.data.elem;if(!this.isOpen||this.multiple)return!1;for(e=0;e<this.options.length;e++)c.removeClass(this.options[e],"dk-option-highlight");t.lastChild.setAttribute("aria-expanded","false"),c.removeClass(t.lastChild,"dk-select-options-highlight"),c.removeClass(t,"dk-select-open-(up|down)"),this.isOpen=!1,this.data.settings.close.call(this)},open:c.deferred(function(){var s,n,a,o,r,l,d=this.data.elem,h=d.lastChild,u=e.pageXOffset!==i,p="CSS1Compat"===(t.compatMode||""),f=u?e.pageYOffset:p?t.documentElement.scrollTop:t.body.scrollTop;return r=c.offset(d).top-f,l=e.innerHeight-(r+d.offsetHeight),this.isOpen||this.multiple?!1:(h.style.display="block",s=h.offsetHeight,h.style.display="",n=r>s,a=l>s,o=n&&!a?"-up":"-down",this.isOpen=!0,c.addClass(d,"dk-select-open"+o),h.setAttribute("aria-expanded","true"),this._scrollTo(this.options.length-1),this._scrollTo(this.selectedIndex),void this.data.settings.open.call(this))}),disable:function(e,t){var s="dk-option-disabled";0!==arguments.length&&"boolean"!=typeof e||(t=e===i,e=this.data.elem,s="dk-select-disabled",this.disabled=t),t===i&&(t=!0),"number"==typeof e&&(e=this.item(e)),t?(e.setAttribute("aria-disabled",!0),c.addClass(e,s)):(e.setAttribute("aria-disabled",!1),c.removeClass(e,s))},hide:function(e,t){var s="dk-option-hidden";t===i&&(t=!0),e=this.item(e),t?(e.setAttribute("aria-hidden",!0),c.addClass(e,s)):(e.setAttribute("aria-hidden",!1),c.removeClass(e,s))},select:function(e,t){var s,i,n,a,o=this.data.select;if("number"==typeof e&&(e=this.item(e)),"string"==typeof e)for(s=0;s<this.length;s++)this.options[s].getAttribute("data-value")===e&&(e=this.options[s]);return!e||"string"==typeof e||!t&&c.hasClass(e,"dk-option-disabled")?!1:c.hasClass(e,"dk-option")?(i=this.options.indexOf(e),n=o.options[i],this.multiple?(c.toggleClass(e,"dk-option-selected"),n.selected=!n.selected,c.hasClass(e,"dk-option-selected")?(e.setAttribute("aria-selected","true"),this.selectedOptions.push(e)):(e.setAttribute("aria-selected","false"),i=this.selectedOptions.indexOf(e),this.selectedOptions.splice(i,1))):(a=this.data.elem.firstChild,this.selectedOptions.length&&(c.removeClass(this.selectedOptions[0],"dk-option-selected"),this.selectedOptions[0].setAttribute("aria-selected","false")),c.addClass(e,"dk-option-selected"),e.setAttribute("aria-selected","true"),a.setAttribute("aria-activedescendant",e.id),a.className="dk-selected "+n.className,a.innerHTML=n.text,this.selectedOptions[0]=e,n.selected=!0),this.selectedIndex=o.selectedIndex,this.value=o.value,t||this.data.select.dispatchEvent(new CustomEvent("change",{bubbles:this.data.settings.bubble})),e):void 0},selectOne:function(e,t){return this.reset(!0),this._scrollTo(e),this.select(e,t)},search:function(e,t){var s,i,n,a,o,r,l,d,h=this.data.select.options,c=[];if(!e)return this.options;for(t=t?t.toLowerCase():"strict",t="fuzzy"===t?2:"partial"===t?1:0,d=new RegExp((t?"":"^")+e,"i"),s=0;s<h.length;s++)if(n=h[s].text.toLowerCase(),2==t){for(i=e.toLowerCase().split(""),a=o=r=l=0;o<n.length;)n[o]===i[a]?(r+=1+r,a++):r=0,l+=r,o++;a===i.length&&c.push({e:this.options[s],s:l,i:s})}else d.test(n)&&c.push(this.options[s]);return 2===t&&(c=c.sort(function(e,t){return t.s-e.s||e.i-t.i}).reduce(function(e,t){return e[e.length]=t.e,e},[])),c},focus:function(){this.disabled||(this.multiple?this.data.elem:this.data.elem.children[0]).focus()},reset:function(e){var t,s=this.data.select;for(this.selectedOptions.length=0,t=0;t<s.options.length;t++)s.options[t].selected=!1,c.removeClass(this.options[t],"dk-option-selected"),this.options[t].setAttribute("aria-selected","false"),!e&&s.options[t].defaultSelected&&this.select(t,!0);this.selectedOptions.length||this.multiple||this.select(0,!0)},refresh:function(){Object.keys(this).length>0&&(!a||this.data.settings.mobile)&&this.dispose().init(this.data.select,this.data.settings)},dispose:function(){return Object.keys(this).length>0&&(!a||this.data.settings.mobile)&&(delete l.cache[this.data.cacheID],this.data.elem.parentNode.removeChild(this.data.elem),this.data.select.removeAttribute("data-dkCacheId")),this},handleEvent:function(e){if(!this.disabled)switch(e.type){case"click":this._delegate(e);break;case"keydown":this._keyHandler(e);break;case"keypress":this._searchOptions(e);break;case"mouseover":this._highlight(e);break;case"reset":this.reset();break;case"change":this.data.settings.change.call(this)}},_delegate:function(t){var s,i,n,a,o=t.target;if(c.hasClass(o,"dk-option-disabled"))return!1;if(this.multiple){if(c.hasClass(o,"dk-option"))if(s=e.getSelection(),"Range"===s.type&&s.collapseToStart(),t.shiftKey)if(n=this.options.indexOf(this.selectedOptions[0]),a=this.options.indexOf(this.selectedOptions[this.selectedOptions.length-1]),i=this.options.indexOf(o),i>n&&a>i&&(i=n),i>a&&a>n&&(a=n),this.reset(!0),a>i)for(;a+1>i;)this.select(i++);else for(;i>a-1;)this.select(i--);else t.ctrlKey||t.metaKey?this.select(o):(this.reset(!0),this.select(o))}else this[this.isOpen?"close":"open"](),c.hasClass(o,"dk-option")&&this.select(o)},_highlight:function(e){var t,s=e.target;if(!this.multiple){for(t=0;t<this.options.length;t++)c.removeClass(this.options[t],"dk-option-highlight");c.addClass(this.data.elem.lastChild,"dk-select-options-highlight"),c.addClass(s,"dk-option-highlight")}},_keyHandler:function(e){var t,s,i=this.selectedOptions,n=this.options,a=1,o={tab:9,enter:13,esc:27,space:32,up:38,down:40};switch(e.keyCode){case o.up:a=-1;case o.down:if(e.preventDefault(),t=i[i.length-1],c.hasClass(this.data.elem.lastChild,"dk-select-options-highlight"))for(c.removeClass(this.data.elem.lastChild,"dk-select-options-highlight"),s=0;s<n.length;s++)c.hasClass(n[s],"dk-option-highlight")&&(c.removeClass(n[s],"dk-option-highlight"),t=n[s]);a=n.indexOf(t)+a,a>n.length-1?a=n.length-1:0>a&&(a=0),this.data.select.options[a].disabled||(this.reset(!0),this.select(a),this._scrollTo(a));break;case o.space:if(!this.isOpen){e.preventDefault(),this.open();break}case o.tab:case o.enter:for(a=0;a<n.length;a++)c.hasClass(n[a],"dk-option-highlight")&&this.select(a);case o.esc:this.isOpen&&(e.preventDefault(),this.close())}},_searchOptions:function(e){var t,s=this,n=String.fromCharCode(e.keyCode||e.which),a=function(){s.data.searchTimeout&&clearTimeout(s.data.searchTimeout),s.data.searchTimeout=setTimeout(function(){s.data.searchString=""},1e3)};this.data.searchString===i&&(this.data.searchString=""),a(),this.data.searchString+=n,t=this.search(this.data.searchString,this.data.settings.search),t.length&&(c.hasClass(t[0],"dk-option-disabled")||this.selectOne(t[0]))},_scrollTo:function(e){var t,s,i,n=this.data.elem.lastChild;return-1===e||"number"!=typeof e&&!e||!this.isOpen&&!this.multiple?!1:("number"==typeof e&&(e=this.item(e)),t=c.position(e,n).top,s=t-n.scrollTop,i=s+e.offsetHeight,void(i>n.offsetHeight?(t+=e.offsetHeight,n.scrollTop=t-n.offsetHeight):0>s&&(n.scrollTop=t)))}},l.build=function(e,t){var s,i,n,a=[],o={elem:null,options:[],selected:[]},r=function(e){var s,i,n,a,l=[];switch(e.nodeName){case"OPTION":s=c.create("li",{"class":"dk-option ","data-value":e.value,innerHTML:e.text,role:"option","aria-selected":"false",id:t+"-"+(e.id||e.value.replace(" ","-"))}),c.addClass(s,e.className),e.disabled&&(c.addClass(s,"dk-option-disabled"),s.setAttribute("aria-disabled","true")),e.hidden&&(c.addClass(s,"dk-option-hidden"),s.setAttribute("aria-hidden","true")),e.selected&&(c.addClass(s,"dk-option-selected"),s.setAttribute("aria-selected","true"),o.selected.push(s)),o.options.push(this.appendChild(s));break;case"OPTGROUP":for(i=c.create("li",{"class":"dk-optgroup"}),e.label&&i.appendChild(c.create("div",{"class":"dk-optgroup-label",innerHTML:e.label})),n=c.create("ul",{"class":"dk-optgroup-options"}),a=e.children.length;a--;l.unshift(e.children[a]));l.forEach(r,n),this.appendChild(i).appendChild(n)}};for(o.elem=c.create("div",{"class":"dk-select"+(e.multiple?"-multi":"")}),i=c.create("ul",{"class":"dk-select-options",id:t+"-listbox",role:"listbox"}),e.disabled&&(c.addClass(o.elem,"dk-select-disabled"),o.elem.setAttribute("aria-disabled",!0)),o.elem.id=t+(e.id?"-"+e.id:""),c.addClass(o.elem,e.className),e.multiple?(o.elem.setAttribute("tabindex",e.getAttribute("tabindex")||"0"),i.setAttribute("aria-multiselectable","true")):(s=e.options[e.selectedIndex],o.elem.appendChild(c.create("div",{"class":"dk-selected "+s.className,tabindex:e.tabindex||0,innerHTML:s?s.text:"&nbsp;",id:t+"-combobox","aria-live":"assertive","aria-owns":i.id,role:"combobox"})),i.setAttribute("aria-expanded","false")),n=e.children.length;n--;a.unshift(e.children[n]));return a.forEach(r,o.elem.appendChild(i)),o},l.onDocClick=function(e){var t,s;if(1!==e.target.nodeType)return!1;null!==(t=e.target.getAttribute("data-dkcacheid"))&&l.cache[t].focus();for(s in l.cache)c.closest(e.target,l.cache[s].data.elem)||s===t||l.cache[s].disabled||l.cache[s].close()},s!==i&&(s.fn.dropkick=function(){var e=Array.prototype.slice.call(arguments);return s(this).each(function(){e[0]&&"object"!=typeof e[0]?"string"==typeof e[0]&&l.prototype[e[0]].apply(new l(this),e.slice(1)):new l(this,e[0]||{})})}),l});
/*! @vimeo/player v1.0.6 | (c) 2016 Vimeo | MIT License | https://github.com/vimeo/player.js */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e.Vimeo=e.Vimeo||{},e.Vimeo.Player=t())}(this,function(){"use strict";function e(e,t){return t={exports:{}},e(t,t.exports),t.exports}function t(e,t,n){var r=T.get(e.element)||{};t in r||(r[t]=[]),r[t].push(n),T.set(e.element,r)}function n(e,t){var n=T.get(e.element)||{};return n[t]||[]}function r(e,t,n){var r=T.get(e.element)||{};if(!r[t])return!0;if(!n)return r[t]=[],T.set(e.element,r),!0;var o=r[t].indexOf(n);return o!==-1&&r[t].splice(o,1),T.set(e.element,r),r[t]&&0===r[t].length}function o(e,t){var n=T.get(e);T.set(t,n),T.delete(e)}function i(e,t){return 0===e.indexOf(t.toLowerCase())?e:""+t.toLowerCase()+e.substr(0,1).toUpperCase()+e.substr(1)}function a(e){return e instanceof window.HTMLElement}function u(e){return!isNaN(parseFloat(e))&&isFinite(e)&&Math.floor(e)==e}function s(e){return/^(https?:)?\/\/(player.)?vimeo.com(?=$|\/)/.test(e)}function c(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],t=e.id,n=e.url,r=t||n;if(!r)throw new Error("An id or url must be passed, either in an options object or as a data-vimeo-id or data-vimeo-url attribute.");if(u(r))return"https://vimeo.com/"+r;if(s(r))return r.replace("http:","https:");if(t)throw new TypeError("“"+t+"” is not a valid video id.");throw new TypeError("“"+r+"” is not a vimeo.com url.")}function f(e){for(var t=arguments.length<=1||void 0===arguments[1]?{}:arguments[1],n=_,r=Array.isArray(n),o=0,n=r?n:n[Symbol.iterator]();;){var i;if(r){if(o>=n.length)break;i=n[o++]}else{if(o=n.next(),o.done)break;i=o.value}var a=i,u=e.getAttribute("data-vimeo-"+a);(u||""===u)&&(t[a]=""===u?1:u)}return t}function l(e){var t=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];return new Promise(function(n,r){if(!s(e))throw new TypeError("“"+e+"” is not a vimeo.com url.");var o="https://vimeo.com/api/oembed.json?url="+encodeURIComponent(e);for(var i in t)t.hasOwnProperty(i)&&(o+="&"+i+"="+encodeURIComponent(t[i]));var a="XDomainRequest"in window?new XDomainRequest:new XMLHttpRequest;a.open("GET",o,!0),a.onload=function(){if(404===a.status)return void r(new Error("“"+e+"” was not found."));if(403===a.status)return void r(new Error("“"+e+"” is not embeddable."));try{var t=JSON.parse(a.responseText);n(t)}catch(e){r(e)}},a.onerror=function(){var e=a.status?" ("+a.status+")":"";r(new Error("There was an error fetching the embed code from Vimeo"+e+"."))},a.send()})}function h(e,t){var n=e.html;if(!t)throw new TypeError("An element must be provided");if(null!==t.getAttribute("data-vimeo-initialized"))return t.querySelector("iframe");var r=document.createElement("div");return r.innerHTML=n,t.appendChild(r.firstChild),t.setAttribute("data-vimeo-initialized","true"),t.querySelector("iframe")}function d(){var e=arguments.length<=0||void 0===arguments[0]?document:arguments[0],t=[].slice.call(e.querySelectorAll("[data-vimeo-id], [data-vimeo-url]")),n=function(e){"console"in window&&console.error&&console.error("There was an error creating an embed: "+e)},r=function(){if(i){if(a>=o.length)return"break";u=o[a++]}else{if(a=o.next(),a.done)return"break";u=a.value}var e=u;try{if(null!==e.getAttribute("data-vimeo-defer"))return"continue";var t=f(e),r=c(t);l(r,t).then(function(t){return h(t,e)}).catch(n)}catch(e){n(e)}};e:for(var o=t,i=Array.isArray(o),a=0,o=i?o:o[Symbol.iterator]();;){var u,s=r();switch(s){case"break":break e;case"continue":continue}}}function p(e){return"string"==typeof e&&(e=JSON.parse(e)),e}function v(e,t,n){if(e.element.contentWindow.postMessage){var r={method:t};void 0!==n&&(r.value=n);var o=parseFloat(navigator.userAgent.toLowerCase().replace(/^.*msie (\d+).*$/,"$1"));o>=8&&o<10&&(r=JSON.stringify(r)),e.element.contentWindow.postMessage(r,e.origin)}}function y(e,t){t=p(t);var o=[],i=void 0;if(t.event){if("error"===t.event)for(var a=n(e,t.data.method),u=a,s=Array.isArray(u),c=0,u=s?u:u[Symbol.iterator]();;){var f;if(s){if(c>=u.length)break;f=u[c++]}else{if(c=u.next(),c.done)break;f=c.value}var l=f,h=new Error(t.data.message);h.name=t.data.name,l.reject(h),r(e,t.data.method,l)}o=n(e,"event:"+t.event),i=t.data}else t.method&&(o=n(e,t.method),i=t.value,r(e,t.method));for(var d=o,v=Array.isArray(d),y=0,d=v?d:d[Symbol.iterator]();;){var m;if(v){if(y>=d.length)break;m=d[y++]}else{if(y=d.next(),y.done)break;m=y.value}var g=m;try{if("function"==typeof g){g.call(e,i);continue}g.resolve(i)}catch(e){}}}var m="undefined"!=typeof Array.prototype.indexOf,g="undefined"!=typeof window.postMessage;if(!m||!g)throw new Error("Sorry, the Vimeo Player API is not available in this browser.");var w="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},b=(e(function(e,t){!function(e){function t(e,t){function r(e){return this&&this.constructor===r?(this._keys=[],this._values=[],this._itp=[],this.objectOnly=t,void(e&&n.call(this,e))):new r(e)}return t||w(e,"size",{get:y}),e.constructor=r,r.prototype=e,r}function n(e){this.add?e.forEach(this.add,this):e.forEach(function(e){this.set(e[0],e[1])},this)}function r(e){return this.has(e)&&(this._keys.splice(g,1),this._values.splice(g,1),this._itp.forEach(function(e){g<e[0]&&e[0]--})),-1<g}function o(e){return this.has(e)?this._values[g]:void 0}function i(e,t){if(this.objectOnly&&t!==Object(t))throw new TypeError("Invalid value used as weak collection key");if(t!=t||0===t)for(g=e.length;g--&&!b(e[g],t););else g=e.indexOf(t);return-1<g}function a(e){return i.call(this,this._values,e)}function u(e){return i.call(this,this._keys,e)}function s(e,t){return this.has(e)?this._values[g]=t:this._values[this._keys.push(e)-1]=t,this}function c(e){return this.has(e)||this._values.push(e),this}function f(){(this._keys||0).length=this._values.length=0}function l(){return v(this._itp,this._keys)}function h(){return v(this._itp,this._values)}function d(){return v(this._itp,this._keys,this._values)}function p(){return v(this._itp,this._values,this._values)}function v(e,t,n){var r=[0],o=!1;return e.push(r),{next:function(){var i,a=r[0];return!o&&a<t.length?(i=n?[t[a],n[a]]:t[a],r[0]++):(o=!0,e.splice(e.indexOf(r),1)),{done:o,value:i}}}}function y(){return this._values.length}function m(e,t){for(var n=this.entries();;){var r=n.next();if(r.done)break;e.call(t,r.value[1],r.value[0],this)}}var g,w=Object.defineProperty,b=function(e,t){return e===t||e!==e&&t!==t};"undefined"==typeof WeakMap&&(e.WeakMap=t({delete:r,clear:f,get:o,has:u,set:s},!0)),"undefined"!=typeof Map&&"function"==typeof(new Map).values&&(new Map).values().next||(e.Map=t({delete:r,has:u,get:o,set:s,keys:l,values:h,entries:d,forEach:m,clear:f})),"undefined"!=typeof Set&&"function"==typeof(new Set).values&&(new Set).values().next||(e.Set=t({has:a,add:c,delete:r,clear:f,keys:h,values:h,entries:p,forEach:m})),"undefined"==typeof WeakSet&&(e.WeakSet=t({delete:r,add:c,clear:f,has:a},!0))}("undefined"!=typeof t&&"undefined"!=typeof w?w:window)}),e(function(e){!function(t,n,r){n[t]=n[t]||r(),"undefined"!=typeof e&&e.exports?e.exports=n[t]:"function"==typeof define&&define.amd&&define(function(){return n[t]})}("Promise","undefined"!=typeof w?w:w,function(){function e(e,t){h.add(e,t),l||(l=p(h.drain))}function t(e){var t,n=typeof e;return null==e||"object"!=n&&"function"!=n||(t=e.then),"function"==typeof t&&t}function n(){for(var e=0;e<this.chain.length;e++)r(this,1===this.state?this.chain[e].success:this.chain[e].failure,this.chain[e]);this.chain.length=0}function r(e,n,r){var o,i;try{n===!1?r.reject(e.msg):(o=n===!0?e.msg:n.call(void 0,e.msg),o===r.promise?r.reject(TypeError("Promise-chain cycle")):(i=t(o))?i.call(o,r.resolve,r.reject):r.resolve(o))}catch(e){r.reject(e)}}function o(r){var a,s=this;if(!s.triggered){s.triggered=!0,s.def&&(s=s.def);try{(a=t(r))?e(function(){var e=new u(s);try{a.call(r,function(){o.apply(e,arguments)},function(){i.apply(e,arguments)})}catch(t){i.call(e,t)}}):(s.msg=r,s.state=1,s.chain.length>0&&e(n,s))}catch(e){i.call(new u(s),e)}}}function i(t){var r=this;r.triggered||(r.triggered=!0,r.def&&(r=r.def),r.msg=t,r.state=2,r.chain.length>0&&e(n,r))}function a(e,t,n,r){for(var o=0;o<t.length;o++)!function(o){e.resolve(t[o]).then(function(e){n(o,e)},r)}(o)}function u(e){this.def=e,this.triggered=!1}function s(e){this.promise=e,this.state=0,this.triggered=!1,this.chain=[],this.msg=void 0}function c(t){if("function"!=typeof t)throw TypeError("Not a function");if(0!==this.__NPO__)throw TypeError("Not a promise");this.__NPO__=1;var r=new s(this);this.then=function(t,o){var i={success:"function"!=typeof t||t,failure:"function"==typeof o&&o};return i.promise=new this.constructor(function(e,t){if("function"!=typeof e||"function"!=typeof t)throw TypeError("Not a function");i.resolve=e,i.reject=t}),r.chain.push(i),0!==r.state&&e(n,r),i.promise},this.catch=function(e){return this.then(void 0,e)};try{t.call(void 0,function(e){o.call(r,e)},function(e){i.call(r,e)})}catch(e){i.call(r,e)}}var f,l,h,d=Object.prototype.toString,p="undefined"!=typeof setImmediate?function(e){return setImmediate(e)}:setTimeout;try{Object.defineProperty({},"x",{}),f=function(e,t,n,r){return Object.defineProperty(e,t,{value:n,writable:!0,configurable:r!==!1})}}catch(e){f=function(e,t,n){return e[t]=n,e}}h=function(){function e(e,t){this.fn=e,this.self=t,this.next=void 0}var t,n,r;return{add:function(o,i){r=new e(o,i),n?n.next=r:t=r,n=r,r=void 0},drain:function(){var e=t;for(t=n=l=void 0;e;)e.fn.call(e.self),e=e.next}}}();var v=f({},"constructor",c,!1);return c.prototype=v,f(v,"__NPO__",0,!1),f(c,"resolve",function(e){var t=this;return e&&"object"==typeof e&&1===e.__NPO__?e:new t(function(t,n){if("function"!=typeof t||"function"!=typeof n)throw TypeError("Not a function");t(e)})}),f(c,"reject",function(e){return new this(function(t,n){if("function"!=typeof t||"function"!=typeof n)throw TypeError("Not a function");n(e)})}),f(c,"all",function(e){var t=this;return"[object Array]"!=d.call(e)?t.reject(TypeError("Not an array")):0===e.length?t.resolve([]):new t(function(n,r){if("function"!=typeof n||"function"!=typeof r)throw TypeError("Not a function");var o=e.length,i=Array(o),u=0;a(t,e,function(e,t){i[e]=t,++u===o&&n(i)},r)})}),f(c,"race",function(e){var t=this;return"[object Array]"!=d.call(e)?t.reject(TypeError("Not an array")):new t(function(n,r){if("function"!=typeof n||"function"!=typeof r)throw TypeError("Not a function");a(t,e,function(e,t){n(t)},r)})}),c})})),E=b&&"object"==typeof b&&"default"in b?b.default:b,T=new WeakMap,_=["id","url","width","maxwidth","height","maxheight","portrait","title","byline","color","autoplay","autopause","loop","responsive"],k=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},x=new WeakMap,j=new WeakMap,Player=function(){function Player(e){var t=this,n=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];if(k(this,Player),window.jQuery&&e instanceof jQuery&&(e.length>1&&window.console&&console.warn&&console.warn("A jQuery object with multiple elements was passed, using the first element."),e=e[0]),"string"==typeof e&&(e=document.getElementById(e)),!a(e))throw new TypeError("You must pass either a valid element or a valid id.");if("IFRAME"!==e.nodeName){var r=e.querySelector("iframe");r&&(e=r)}if("IFRAME"===e.nodeName&&!s(e.getAttribute("src")||""))throw new Error("The player element passed isn’t a Vimeo embed.");if(x.has(e))return x.get(e);this.element=e,this.origin="*";var i=new E(function(r,i){var a=function(e){if(s(e.origin)&&t.element.contentWindow===e.source){"*"===t.origin&&(t.origin=e.origin);var n=p(e.data),o="event"in n&&"ready"===n.event,i="method"in n&&"ping"===n.method;return o||i?(t.element.setAttribute("data-ready","true"),void r()):void y(t,n)}};if(window.addEventListener?window.addEventListener("message",a,!1):window.attachEvent&&window.attachEvent("onmessage",a),"IFRAME"!==t.element.nodeName){var u=f(e,n),d=c(u);l(d,u).then(function(n){var r=h(n,e);return t.element=r,o(e,r),n}).catch(function(e){return i(e)})}});return j.set(this,i),x.set(this.element,this),"IFRAME"===this.element.nodeName&&v(this,"ping"),this}return Player.prototype.then=function(e){var t=arguments.length<=1||void 0===arguments[1]?function(){}:arguments[1];return this.ready().then(e,t)},Player.prototype.callMethod=function(e){var n=this,r=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];return new E(function(o,i){return n.ready().then(function(){t(n,e,{resolve:o,reject:i}),v(n,e,r)})})},Player.prototype.get=function(e){var n=this;return new E(function(r,o){return e=i(e,"get"),n.ready().then(function(){t(n,e,{resolve:r,reject:o}),v(n,e)})})},Player.prototype.set=function(e,n){var r=this;return E.resolve(n).then(function(n){if(e=i(e,"set"),void 0===n||null===n)throw new TypeError("There must be a value to set.");return r.ready().then(function(){return new E(function(o,i){t(r,e,{resolve:o,reject:i}),v(r,e,n)})})})},Player.prototype.on=function(e,r){if(!e)throw new TypeError("You must pass an event name.");if(!r)throw new TypeError("You must pass a callback function.");if("function"!=typeof r)throw new TypeError("The callback must be a function.");var o=n(this,"event:"+e);0===o.length&&this.callMethod("addEventListener",e).catch(function(){}),t(this,"event:"+e,r)},Player.prototype.off=function(e,t){if(!e)throw new TypeError("You must pass an event name.");if(t&&"function"!=typeof t)throw new TypeError("The callback must be a function.");var n=r(this,"event:"+e,t);n&&this.callMethod("removeEventListener",e).catch(function(e){})},Player.prototype.loadVideo=function(e){return this.callMethod("loadVideo",e)},Player.prototype.ready=function(){var e=j.get(this);return E.resolve(e)},Player.prototype.enableTextTrack=function(e,t){if(!e)throw new TypeError("You must pass a language.");return this.callMethod("enableTextTrack",{language:e,kind:t})},Player.prototype.disableTextTrack=function(){return this.callMethod("disableTextTrack")},Player.prototype.pause=function(){return this.callMethod("pause")},Player.prototype.play=function(){return this.callMethod("play")},Player.prototype.unload=function(){return this.callMethod("unload")},Player.prototype.getAutopause=function(){return this.get("autopause")},Player.prototype.setAutopause=function(e){return this.set("autopause",e)},Player.prototype.getColor=function(){return this.get("color")},Player.prototype.setColor=function(e){return this.set("color",e)},Player.prototype.getCurrentTime=function(){return this.get("currentTime")},Player.prototype.setCurrentTime=function(e){return this.set("currentTime",e)},Player.prototype.getDuration=function(){return this.get("duration")},Player.prototype.getEnded=function(){return this.get("ended")},Player.prototype.getLoop=function(){return this.get("loop")},Player.prototype.setLoop=function(e){return this.set("loop",e)},Player.prototype.getPaused=function(){return this.get("paused")},Player.prototype.getTextTracks=function(){return this.get("textTracks")},Player.prototype.getVideoEmbedCode=function(){return this.get("videoEmbedCode")},Player.prototype.getVideoId=function(){return this.get("videoId")},Player.prototype.getVideoTitle=function(){return this.get("videoTitle")},Player.prototype.getVideoWidth=function(){return this.get("videoWidth")},Player.prototype.getVideoHeight=function(){return this.get("videoHeight")},Player.prototype.getVideoUrl=function(){return this.get("videoUrl")},Player.prototype.getVolume=function(){return this.get("volume")},Player.prototype.setVolume=function(e){return this.set("volume",e)},Player}();return d(),Player});
/*!
Waypoints - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
!function(){"use strict";function t(o){if(!o)throw new Error("No options passed to Waypoint constructor");if(!o.element)throw new Error("No element option passed to Waypoint constructor");if(!o.handler)throw new Error("No handler option passed to Waypoint constructor");this.key="waypoint-"+e,this.options=t.Adapter.extend({},t.defaults,o),this.element=this.options.element,this.adapter=new t.Adapter(this.element),this.callback=o.handler,this.axis=this.options.horizontal?"horizontal":"vertical",this.enabled=this.options.enabled,this.triggerPoint=null,this.group=t.Group.findOrCreate({name:this.options.group,axis:this.axis}),this.context=t.Context.findOrCreateByElement(this.options.context),t.offsetAliases[this.options.offset]&&(this.options.offset=t.offsetAliases[this.options.offset]),this.group.add(this),this.context.add(this),i[this.key]=this,e+=1}var e=0,i={};t.prototype.queueTrigger=function(t){this.group.queueTrigger(this,t)},t.prototype.trigger=function(t){this.enabled&&this.callback&&this.callback.apply(this,t)},t.prototype.destroy=function(){this.context.remove(this),this.group.remove(this),delete i[this.key]},t.prototype.disable=function(){return this.enabled=!1,this},t.prototype.enable=function(){return this.context.refresh(),this.enabled=!0,this},t.prototype.next=function(){return this.group.next(this)},t.prototype.previous=function(){return this.group.previous(this)},t.invokeAll=function(t){var e=[];for(var o in i)e.push(i[o]);for(var n=0,r=e.length;r>n;n++)e[n][t]()},t.destroyAll=function(){t.invokeAll("destroy")},t.disableAll=function(){t.invokeAll("disable")},t.enableAll=function(){t.Context.refreshAll();for(var e in i)i[e].enabled=!0;return this},t.refreshAll=function(){t.Context.refreshAll()},t.viewportHeight=function(){return window.innerHeight||document.documentElement.clientHeight},t.viewportWidth=function(){return document.documentElement.clientWidth},t.adapters=[],t.defaults={context:window,continuous:!0,enabled:!0,group:"default",horizontal:!1,offset:0},t.offsetAliases={"bottom-in-view":function(){return this.context.innerHeight()-this.adapter.outerHeight()},"right-in-view":function(){return this.context.innerWidth()-this.adapter.outerWidth()}},window.Waypoint=t}(),function(){"use strict";function t(t){window.setTimeout(t,1e3/60)}function e(t){this.element=t,this.Adapter=n.Adapter,this.adapter=new this.Adapter(t),this.key="waypoint-context-"+i,this.didScroll=!1,this.didResize=!1,this.oldScroll={x:this.adapter.scrollLeft(),y:this.adapter.scrollTop()},this.waypoints={vertical:{},horizontal:{}},t.waypointContextKey=this.key,o[t.waypointContextKey]=this,i+=1,n.windowContext||(n.windowContext=!0,n.windowContext=new e(window)),this.createThrottledScrollHandler(),this.createThrottledResizeHandler()}var i=0,o={},n=window.Waypoint,r=window.onload;e.prototype.add=function(t){var e=t.options.horizontal?"horizontal":"vertical";this.waypoints[e][t.key]=t,this.refresh()},e.prototype.checkEmpty=function(){var t=this.Adapter.isEmptyObject(this.waypoints.horizontal),e=this.Adapter.isEmptyObject(this.waypoints.vertical),i=this.element==this.element.window;t&&e&&!i&&(this.adapter.off(".waypoints"),delete o[this.key])},e.prototype.createThrottledResizeHandler=function(){function t(){e.handleResize(),e.didResize=!1}var e=this;this.adapter.on("resize.waypoints",function(){e.didResize||(e.didResize=!0,n.requestAnimationFrame(t))})},e.prototype.createThrottledScrollHandler=function(){function t(){e.handleScroll(),e.didScroll=!1}var e=this;this.adapter.on("scroll.waypoints",function(){(!e.didScroll||n.isTouch)&&(e.didScroll=!0,n.requestAnimationFrame(t))})},e.prototype.handleResize=function(){n.Context.refreshAll()},e.prototype.handleScroll=function(){var t={},e={horizontal:{newScroll:this.adapter.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.adapter.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};for(var i in e){var o=e[i],n=o.newScroll>o.oldScroll,r=n?o.forward:o.backward;for(var s in this.waypoints[i]){var a=this.waypoints[i][s];if(null!==a.triggerPoint){var l=o.oldScroll<a.triggerPoint,h=o.newScroll>=a.triggerPoint,p=l&&h,u=!l&&!h;(p||u)&&(a.queueTrigger(r),t[a.group.id]=a.group)}}}for(var c in t)t[c].flushTriggers();this.oldScroll={x:e.horizontal.newScroll,y:e.vertical.newScroll}},e.prototype.innerHeight=function(){return this.element==this.element.window?n.viewportHeight():this.adapter.innerHeight()},e.prototype.remove=function(t){delete this.waypoints[t.axis][t.key],this.checkEmpty()},e.prototype.innerWidth=function(){return this.element==this.element.window?n.viewportWidth():this.adapter.innerWidth()},e.prototype.destroy=function(){var t=[];for(var e in this.waypoints)for(var i in this.waypoints[e])t.push(this.waypoints[e][i]);for(var o=0,n=t.length;n>o;o++)t[o].destroy()},e.prototype.refresh=function(){var t,e=this.element==this.element.window,i=e?void 0:this.adapter.offset(),o={};this.handleScroll(),t={horizontal:{contextOffset:e?0:i.left,contextScroll:e?0:this.oldScroll.x,contextDimension:this.innerWidth(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:e?0:i.top,contextScroll:e?0:this.oldScroll.y,contextDimension:this.innerHeight(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};for(var r in t){var s=t[r];for(var a in this.waypoints[r]){var l,h,p,u,c,d=this.waypoints[r][a],f=d.options.offset,w=d.triggerPoint,y=0,g=null==w;d.element!==d.element.window&&(y=d.adapter.offset()[s.offsetProp]),"function"==typeof f?f=f.apply(d):"string"==typeof f&&(f=parseFloat(f),d.options.offset.indexOf("%")>-1&&(f=Math.ceil(s.contextDimension*f/100))),l=s.contextScroll-s.contextOffset,d.triggerPoint=Math.floor(y+l-f),h=w<s.oldScroll,p=d.triggerPoint>=s.oldScroll,u=h&&p,c=!h&&!p,!g&&u?(d.queueTrigger(s.backward),o[d.group.id]=d.group):!g&&c?(d.queueTrigger(s.forward),o[d.group.id]=d.group):g&&s.oldScroll>=d.triggerPoint&&(d.queueTrigger(s.forward),o[d.group.id]=d.group)}}return n.requestAnimationFrame(function(){for(var t in o)o[t].flushTriggers()}),this},e.findOrCreateByElement=function(t){return e.findByElement(t)||new e(t)},e.refreshAll=function(){for(var t in o)o[t].refresh()},e.findByElement=function(t){return o[t.waypointContextKey]},window.onload=function(){r&&r(),e.refreshAll()},n.requestAnimationFrame=function(e){var i=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||t;i.call(window,e)},n.Context=e}(),function(){"use strict";function t(t,e){return t.triggerPoint-e.triggerPoint}function e(t,e){return e.triggerPoint-t.triggerPoint}function i(t){this.name=t.name,this.axis=t.axis,this.id=this.name+"-"+this.axis,this.waypoints=[],this.clearTriggerQueues(),o[this.axis][this.name]=this}var o={vertical:{},horizontal:{}},n=window.Waypoint;i.prototype.add=function(t){this.waypoints.push(t)},i.prototype.clearTriggerQueues=function(){this.triggerQueues={up:[],down:[],left:[],right:[]}},i.prototype.flushTriggers=function(){for(var i in this.triggerQueues){var o=this.triggerQueues[i],n="up"===i||"left"===i;o.sort(n?e:t);for(var r=0,s=o.length;s>r;r+=1){var a=o[r];(a.options.continuous||r===o.length-1)&&a.trigger([i])}}this.clearTriggerQueues()},i.prototype.next=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints),o=i===this.waypoints.length-1;return o?null:this.waypoints[i+1]},i.prototype.previous=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints);return i?this.waypoints[i-1]:null},i.prototype.queueTrigger=function(t,e){this.triggerQueues[e].push(t)},i.prototype.remove=function(t){var e=n.Adapter.inArray(t,this.waypoints);e>-1&&this.waypoints.splice(e,1)},i.prototype.first=function(){return this.waypoints[0]},i.prototype.last=function(){return this.waypoints[this.waypoints.length-1]},i.findOrCreate=function(t){return o[t.axis][t.name]||new i(t)},n.Group=i}(),function(){"use strict";function t(t){this.$element=e(t)}var e=window.jQuery,i=window.Waypoint;e.each(["innerHeight","innerWidth","off","offset","on","outerHeight","outerWidth","scrollLeft","scrollTop"],function(e,i){t.prototype[i]=function(){var t=Array.prototype.slice.call(arguments);return this.$element[i].apply(this.$element,t)}}),e.each(["extend","inArray","isEmptyObject"],function(i,o){t[o]=e[o]}),i.adapters.push({name:"jquery",Adapter:t}),i.Adapter=t}(),function(){"use strict";function t(t){return function(){var i=[],o=arguments[0];return t.isFunction(arguments[0])&&(o=t.extend({},arguments[1]),o.handler=arguments[0]),this.each(function(){var n=t.extend({},o,{element:this});"string"==typeof n.context&&(n.context=t(this).closest(n.context)[0]),i.push(new e(n))}),i}}var e=window.Waypoint;window.jQuery&&(window.jQuery.fn.waypoint=t(window.jQuery)),window.Zepto&&(window.Zepto.fn.waypoint=t(window.Zepto))}();

/*!
Waypoints Inview Shortcut - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
!function(){"use strict";function t(){}function e(t){this.options=i.Adapter.extend({},e.defaults,t),this.axis=this.options.horizontal?"horizontal":"vertical",this.waypoints=[],this.element=this.options.element,this.createWaypoints()}var i=window.Waypoint;e.prototype.createWaypoints=function(){for(var t={vertical:[{down:"enter",up:"exited",offset:"100%"},{down:"entered",up:"exit",offset:"bottom-in-view"},{down:"exit",up:"entered",offset:0},{down:"exited",up:"enter",offset:function(){return-this.adapter.outerHeight()}}],horizontal:[{right:"enter",left:"exited",offset:"100%"},{right:"entered",left:"exit",offset:"right-in-view"},{right:"exit",left:"entered",offset:0},{right:"exited",left:"enter",offset:function(){return-this.adapter.outerWidth()}}]},e=0,i=t[this.axis].length;i>e;e++){var n=t[this.axis][e];this.createWaypoint(n)}},e.prototype.createWaypoint=function(t){var e=this;this.waypoints.push(new i({context:this.options.context,element:this.options.element,enabled:this.options.enabled,handler:function(t){return function(i){e.options[t[i]].call(e,i)}}(t),offset:t.offset,horizontal:this.options.horizontal}))},e.prototype.destroy=function(){for(var t=0,e=this.waypoints.length;e>t;t++)this.waypoints[t].destroy();this.waypoints=[]},e.prototype.disable=function(){for(var t=0,e=this.waypoints.length;e>t;t++)this.waypoints[t].disable()},e.prototype.enable=function(){for(var t=0,e=this.waypoints.length;e>t;t++)this.waypoints[t].enable()},e.defaults={context:window,enabled:!0,enter:t,entered:t,exit:t,exited:t},i.Inview=e}();
/*! lazysizes - v1.5.0 */
!function(a,b){var c=b(a,a.document);a.lazySizes=c,"object"==typeof module&&module.exports&&(module.exports=c)}(window,function(a,b){"use strict";if(b.getElementsByClassName){var c,d=b.documentElement,e=a.HTMLPictureElement&&"sizes"in b.createElement("img"),f="addEventListener",g="getAttribute",h=a[f],i=a.setTimeout,j=a.requestAnimationFrame||i,k=/^picture$/i,l=["load","error","lazyincluded","_lazyloaded"],m={},n=Array.prototype.forEach,o=function(a,b){return m[b]||(m[b]=new RegExp("(\\s|^)"+b+"(\\s|$)")),m[b].test(a[g]("class")||"")&&m[b]},p=function(a,b){o(a,b)||a.setAttribute("class",(a[g]("class")||"").trim()+" "+b)},q=function(a,b){var c;(c=o(a,b))&&a.setAttribute("class",(a[g]("class")||"").replace(c," "))},r=function(a,b,c){var d=c?f:"removeEventListener";c&&r(a,b),l.forEach(function(c){a[d](c,b)})},s=function(a,c,d,e,f){var g=b.createEvent("CustomEvent");return g.initCustomEvent(c,!e,!f,d||{}),a.dispatchEvent(g),g},t=function(b,d){var f;!e&&(f=a.picturefill||c.pf)?f({reevaluate:!0,elements:[b]}):d&&d.src&&(b.src=d.src)},u=function(a,b){return(getComputedStyle(a,null)||{})[b]},v=function(a,b,d){for(d=d||a.offsetWidth;d<c.minSize&&b&&!a._lazysizesWidth;)d=b.offsetWidth,b=b.parentNode;return d},w=function(b){var c,d=0,e=a.Date,f=function(){c=!1,d=e.now(),b()},g=function(){i(f)},h=function(){j(g)};return function(){if(!c){var a=125-(e.now()-d);c=!0,6>a&&(a=6),i(h,a)}}},x=function(){var e,l,m,v,x,z,A,B,C,D,E,F,G,H,I,J=/^img$/i,K=/^iframe$/i,L="onscroll"in a&&!/glebot/.test(navigator.userAgent),M=0,N=0,O=0,P=0,Q=function(a){O--,a&&a.target&&r(a.target,Q),(!a||0>O||!a.target)&&(O=0)},R=function(a,c){var e,f=a,g="hidden"==u(b.body,"visibility")||"hidden"!=u(a,"visibility");for(C-=c,F+=c,D-=c,E+=c;g&&(f=f.offsetParent)&&f!=b.body&&f!=d;)g=(u(f,"opacity")||1)>0,g&&"visible"!=u(f,"overflow")&&(e=f.getBoundingClientRect(),g=E>e.left&&D<e.right&&F>e.top-1&&C<e.bottom+1);return g},S=function(){var a,b,f,h,i,j,k,n,o;if((x=c.loadMode)&&8>O&&(a=e.length)){b=0,P++,null==H&&("expand"in c||(c.expand=d.clientHeight>600?d.clientWidth>600?550:410:359),G=c.expand,H=G*c.expFactor),H>N&&1>O&&P>3&&x>2?(N=H,P=0):N=x>1&&P>2&&6>O?G:M;for(;a>b;b++)if(e[b]&&!e[b]._lazyRace)if(L)if((n=e[b][g]("data-expand"))&&(j=1*n)||(j=N),o!==j&&(A=innerWidth+j*I,B=innerHeight+j,k=-1*j,o=j),f=e[b].getBoundingClientRect(),(F=f.bottom)>=k&&(C=f.top)<=B&&(E=f.right)>=k*I&&(D=f.left)<=A&&(F||E||D||C)&&(m&&3>O&&!n&&(3>x||4>P)||R(e[b],j))){if(Z(e[b]),i=!0,O>9)break}else!i&&m&&!h&&4>O&&4>P&&x>2&&(l[0]||c.preloadAfterLoad)&&(l[0]||!n&&(F||E||D||C||"auto"!=e[b][g](c.sizesAttr)))&&(h=l[0]||e[b]);else Z(e[b]);h&&!i&&Z(h)}},T=w(S),U=function(a){p(a.target,c.loadedClass),q(a.target,c.loadingClass),r(a.target,V)},V=function(a){a={target:a.target},j(function(){U(a)})},W=function(a,b){try{a.contentWindow.location.replace(b)}catch(c){a.src=b}},X=function(a){var b,d,e=a[g](c.srcsetAttr);(b=c.customMedia[a[g]("data-media")||a[g]("media")])&&a.setAttribute("media",b),e&&a.setAttribute("srcset",e),b&&(d=a.parentNode,d.insertBefore(a.cloneNode(),a),d.removeChild(a))},Y=function(){var a,b=[],c=function(){for(;b.length;)b.shift()();a=!1},d=function(d){b.push(d),a||(a=!0,j(c))};return{add:d,run:c}}(),Z=function(a){var b,d,e,f,h,l,u,w=J.test(a.nodeName),x=w&&(a[g](c.sizesAttr)||a[g]("sizes")),z="auto"==x;(!z&&m||!w||!a.src&&!a.srcset||a.complete||o(a,c.errorClass))&&(z&&(u=a.offsetWidth),a._lazyRace=!0,O++,c.rC&&(u=c.rC(a,u)||u),Y.add(function(){(h=s(a,"lazybeforeunveil")).defaultPrevented||(x&&(z?(y.updateElem(a,!0,u),p(a,c.autosizesClass)):a.setAttribute("sizes",x)),d=a[g](c.srcsetAttr),b=a[g](c.srcAttr),w&&(e=a.parentNode,f=e&&k.test(e.nodeName||"")),l=h.detail.firesLoad||"src"in a&&(d||b||f),h={target:a},l&&(r(a,Q,!0),clearTimeout(v),v=i(Q,2500),p(a,c.loadingClass),r(a,V,!0)),f&&n.call(e.getElementsByTagName("source"),X),d?a.setAttribute("srcset",d):b&&!f&&(K.test(a.nodeName)?W(a,b):a.src=b),(d||f)&&t(a,{src:b})),j(function(){a._lazyRace&&delete a._lazyRace,q(a,c.lazyClass),(!l||a.complete)&&(l?Q(h):O--,U(h))})}))},$=function(){if(!m){if(Date.now()-z<999)return void i($,999);var a,d=function(){c.loadMode=3,T()};m=!0,c.loadMode=3,b.hidden?(S(),Y.run()):T(),h("scroll",function(){3==c.loadMode&&(c.loadMode=2),clearTimeout(a),a=i(d,99)},!0)}};return{_:function(){z=Date.now(),e=b.getElementsByClassName(c.lazyClass),l=b.getElementsByClassName(c.lazyClass+" "+c.preloadClass),I=c.hFac,h("scroll",T,!0),h("resize",T,!0),a.MutationObserver?new MutationObserver(T).observe(d,{childList:!0,subtree:!0,attributes:!0}):(d[f]("DOMNodeInserted",T,!0),d[f]("DOMAttrModified",T,!0),setInterval(T,999)),h("hashchange",T,!0),["focus","mouseover","click","load","transitionend","animationend","webkitAnimationEnd"].forEach(function(a){b[f](a,T,!0)}),/d$|^c/.test(b.readyState)?$():(h("load",$),b[f]("DOMContentLoaded",T),i($,2e4)),T(e.length>0)},checkElems:T,unveil:Z}}(),y=function(){var a,d=function(a,b,c){var d,e,f,g,h=a.parentNode;if(h&&(c=v(a,h,c),g=s(a,"lazybeforesizes",{width:c,dataAttr:!!b}),!g.defaultPrevented&&(c=g.detail.width,c&&c!==a._lazysizesWidth))){if(a._lazysizesWidth=c,c+="px",a.setAttribute("sizes",c),k.test(h.nodeName||""))for(d=h.getElementsByTagName("source"),e=0,f=d.length;f>e;e++)d[e].setAttribute("sizes",c);g.detail.dataAttr||t(a,g.detail)}},e=function(){var b,c=a.length;if(c)for(b=0;c>b;b++)d(a[b])},f=w(e);return{_:function(){a=b.getElementsByClassName(c.autosizesClass),h("resize",f)},checkElems:f,updateElem:d}}(),z=function(){z.i||(z.i=!0,y._(),x._())};return function(){var b,d={lazyClass:"lazyload",loadedClass:"lazyloaded",loadingClass:"lazyloading",preloadClass:"lazypreload",errorClass:"lazyerror",autosizesClass:"lazyautosizes",srcAttr:"data-src",srcsetAttr:"data-srcset",sizesAttr:"data-sizes",minSize:40,customMedia:{},init:!0,expFactor:1.7,hFac:.8,loadMode:2};c=a.lazySizesConfig||a.lazysizesConfig||{};for(b in d)b in c||(c[b]=d[b]);a.lazySizesConfig=c,i(function(){c.init&&z()})}(),{cfg:c,autoSizer:y,loader:x,init:z,uP:t,aC:p,rC:q,hC:o,fire:s,gW:v}}});
/*jshint browser:true */
/*!
* FitVids 1.1
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
*/

;(function( $ ){

  'use strict';

  $.fn.fitVids = function( options ) {
    var settings = {
      customSelector: null,
      ignore: null
    };

    if(!document.getElementById('fit-vids-style')) {
      // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
      var head = document.head || document.getElementsByTagName('head')[0];
      var css = '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
      var div = document.createElement("div");
      div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';
      head.appendChild(div.childNodes[1]);
    }

    if ( options ) {
      $.extend( settings, options );
    }

    return this.each(function(){
      var selectors = [
        'iframe[src*="player.vimeo.com"]',
        'iframe[src*="youtube.com"]',
        'iframe[src*="youtube-nocookie.com"]',
        'iframe[src*="kickstarter.com"][src*="video.html"]',
        'object',
        'embed'
      ];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var ignoreList = '.fitvidsignore';

      if(settings.ignore) {
        ignoreList = ignoreList + ', ' + settings.ignore;
      }

      var $allVideos = $(this).find(selectors.join(','));
      $allVideos = $allVideos.not('object object'); // SwfObj conflict patch
      $allVideos = $allVideos.not(ignoreList); // Disable FitVids on this video.

      $allVideos.each(function(){
        var $this = $(this);
        if($this.parents(ignoreList).length > 0) {
          return; // Disable FitVids on this video.
        }
        if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) { return; }
        if ((!$this.css('height') && !$this.css('width')) && (isNaN($this.attr('height')) || isNaN($this.attr('width'))))
        {
          $this.attr('height', 9);
          $this.attr('width', 16);
        }
        var height = ( this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))) ) ? parseInt($this.attr('height'), 10) : $this.height(),
            width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
            aspectRatio = height / width;
        if(!$this.attr('name')){
          var videoName = 'fitvid' + $.fn.fitVids._count;
          $this.attr('name', videoName);
          $.fn.fitVids._count++;
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+'%');
        $this.removeAttr('height').removeAttr('width');
      });
    });
  };
  
  // Internal counter for unique video names.
  $.fn.fitVids._count = 0;
  
// Works with either jQuery or Zepto
})( window.jQuery || window.Zepto );

/*!
 * VERSION: 1.18.2
 * DATE: 2015-12-22
 * UPDATES AND DOCS AT: http://greensock.com
 * 
 * Includes all of the following: TweenLite, TweenMax, TimelineLite, TimelineMax, EasePack, CSSPlugin, RoundPropsPlugin, BezierPlugin, AttrPlugin, DirectionalRotationPlugin
 *
 * @license Copyright (c) 2008-2016, GreenSock. All rights reserved.
 * This work is subject to the terms at http://greensock.com/standard-license or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/
var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window;(_gsScope._gsQueue||(_gsScope._gsQueue=[])).push(function(){"use strict";_gsScope._gsDefine("TweenMax",["core.Animation","core.SimpleTimeline","TweenLite"],function(a,b,c){var d=function(a){var b,c=[],d=a.length;for(b=0;b!==d;c.push(a[b++]));return c},e=function(a,b,c){var d,e,f=a.cycle;for(d in f)e=f[d],a[d]="function"==typeof e?e.call(b[c],c):e[c%e.length];delete a.cycle},f=function(a,b,d){c.call(this,a,b,d),this._cycle=0,this._yoyo=this.vars.yoyo===!0,this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._dirty=!0,this.render=f.prototype.render},g=1e-10,h=c._internals,i=h.isSelector,j=h.isArray,k=f.prototype=c.to({},.1,{}),l=[];f.version="1.18.2",k.constructor=f,k.kill()._gc=!1,f.killTweensOf=f.killDelayedCallsTo=c.killTweensOf,f.getTweensOf=c.getTweensOf,f.lagSmoothing=c.lagSmoothing,f.ticker=c.ticker,f.render=c.render,k.invalidate=function(){return this._yoyo=this.vars.yoyo===!0,this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._uncache(!0),c.prototype.invalidate.call(this)},k.updateTo=function(a,b){var d,e=this.ratio,f=this.vars.immediateRender||a.immediateRender;b&&this._startTime<this._timeline._time&&(this._startTime=this._timeline._time,this._uncache(!1),this._gc?this._enabled(!0,!1):this._timeline.insert(this,this._startTime-this._delay));for(d in a)this.vars[d]=a[d];if(this._initted||f)if(b)this._initted=!1,f&&this.render(0,!0,!0);else if(this._gc&&this._enabled(!0,!1),this._notifyPluginsOfEnabled&&this._firstPT&&c._onPluginEvent("_onDisable",this),this._time/this._duration>.998){var g=this._totalTime;this.render(0,!0,!1),this._initted=!1,this.render(g,!0,!1)}else if(this._initted=!1,this._init(),this._time>0||f)for(var h,i=1/(1-e),j=this._firstPT;j;)h=j.s+j.c,j.c*=i,j.s=h-j.c,j=j._next;return this},k.render=function(a,b,c){this._initted||0===this._duration&&this.vars.repeat&&this.invalidate();var d,e,f,i,j,k,l,m,n=this._dirty?this.totalDuration():this._totalDuration,o=this._time,p=this._totalTime,q=this._cycle,r=this._duration,s=this._rawPrevTime;if(a>=n-1e-7?(this._totalTime=n,this._cycle=this._repeat,this._yoyo&&0!==(1&this._cycle)?(this._time=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0):(this._time=r,this.ratio=this._ease._calcEnd?this._ease.getRatio(1):1),this._reversed||(d=!0,e="onComplete",c=c||this._timeline.autoRemoveChildren),0===r&&(this._initted||!this.vars.lazy||c)&&(this._startTime===this._timeline._duration&&(a=0),(0>s||0>=a&&a>=-1e-7||s===g&&"isPause"!==this.data)&&s!==a&&(c=!0,s>g&&(e="onReverseComplete")),this._rawPrevTime=m=!b||a||s===a?a:g)):1e-7>a?(this._totalTime=this._time=this._cycle=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0,(0!==p||0===r&&s>0)&&(e="onReverseComplete",d=this._reversed),0>a&&(this._active=!1,0===r&&(this._initted||!this.vars.lazy||c)&&(s>=0&&(c=!0),this._rawPrevTime=m=!b||a||s===a?a:g)),this._initted||(c=!0)):(this._totalTime=this._time=a,0!==this._repeat&&(i=r+this._repeatDelay,this._cycle=this._totalTime/i>>0,0!==this._cycle&&this._cycle===this._totalTime/i&&this._cycle--,this._time=this._totalTime-this._cycle*i,this._yoyo&&0!==(1&this._cycle)&&(this._time=r-this._time),this._time>r?this._time=r:this._time<0&&(this._time=0)),this._easeType?(j=this._time/r,k=this._easeType,l=this._easePower,(1===k||3===k&&j>=.5)&&(j=1-j),3===k&&(j*=2),1===l?j*=j:2===l?j*=j*j:3===l?j*=j*j*j:4===l&&(j*=j*j*j*j),1===k?this.ratio=1-j:2===k?this.ratio=j:this._time/r<.5?this.ratio=j/2:this.ratio=1-j/2):this.ratio=this._ease.getRatio(this._time/r)),o===this._time&&!c&&q===this._cycle)return void(p!==this._totalTime&&this._onUpdate&&(b||this._callback("onUpdate")));if(!this._initted){if(this._init(),!this._initted||this._gc)return;if(!c&&this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration))return this._time=o,this._totalTime=p,this._rawPrevTime=s,this._cycle=q,h.lazyTweens.push(this),void(this._lazy=[a,b]);this._time&&!d?this.ratio=this._ease.getRatio(this._time/r):d&&this._ease._calcEnd&&(this.ratio=this._ease.getRatio(0===this._time?0:1))}for(this._lazy!==!1&&(this._lazy=!1),this._active||!this._paused&&this._time!==o&&a>=0&&(this._active=!0),0===p&&(2===this._initted&&a>0&&this._init(),this._startAt&&(a>=0?this._startAt.render(a,b,c):e||(e="_dummyGS")),this.vars.onStart&&(0!==this._totalTime||0===r)&&(b||this._callback("onStart"))),f=this._firstPT;f;)f.f?f.t[f.p](f.c*this.ratio+f.s):f.t[f.p]=f.c*this.ratio+f.s,f=f._next;this._onUpdate&&(0>a&&this._startAt&&this._startTime&&this._startAt.render(a,b,c),b||(this._totalTime!==p||d)&&this._callback("onUpdate")),this._cycle!==q&&(b||this._gc||this.vars.onRepeat&&this._callback("onRepeat")),e&&(!this._gc||c)&&(0>a&&this._startAt&&!this._onUpdate&&this._startTime&&this._startAt.render(a,b,c),d&&(this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!b&&this.vars[e]&&this._callback(e),0===r&&this._rawPrevTime===g&&m!==g&&(this._rawPrevTime=0))},f.to=function(a,b,c){return new f(a,b,c)},f.from=function(a,b,c){return c.runBackwards=!0,c.immediateRender=0!=c.immediateRender,new f(a,b,c)},f.fromTo=function(a,b,c,d){return d.startAt=c,d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender,new f(a,b,d)},f.staggerTo=f.allTo=function(a,b,g,h,k,m,n){h=h||0;var o,p,q,r,s=0,t=[],u=function(){g.onComplete&&g.onComplete.apply(g.onCompleteScope||this,arguments),k.apply(n||g.callbackScope||this,m||l)},v=g.cycle,w=g.startAt&&g.startAt.cycle;for(j(a)||("string"==typeof a&&(a=c.selector(a)||a),i(a)&&(a=d(a))),a=a||[],0>h&&(a=d(a),a.reverse(),h*=-1),o=a.length-1,q=0;o>=q;q++){p={};for(r in g)p[r]=g[r];if(v&&e(p,a,q),w){w=p.startAt={};for(r in g.startAt)w[r]=g.startAt[r];e(p.startAt,a,q)}p.delay=s+(p.delay||0),q===o&&k&&(p.onComplete=u),t[q]=new f(a[q],b,p),s+=h}return t},f.staggerFrom=f.allFrom=function(a,b,c,d,e,g,h){return c.runBackwards=!0,c.immediateRender=0!=c.immediateRender,f.staggerTo(a,b,c,d,e,g,h)},f.staggerFromTo=f.allFromTo=function(a,b,c,d,e,g,h,i){return d.startAt=c,d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender,f.staggerTo(a,b,d,e,g,h,i)},f.delayedCall=function(a,b,c,d,e){return new f(b,0,{delay:a,onComplete:b,onCompleteParams:c,callbackScope:d,onReverseComplete:b,onReverseCompleteParams:c,immediateRender:!1,useFrames:e,overwrite:0})},f.set=function(a,b){return new f(a,0,b)},f.isTweening=function(a){return c.getTweensOf(a,!0).length>0};var m=function(a,b){for(var d=[],e=0,f=a._first;f;)f instanceof c?d[e++]=f:(b&&(d[e++]=f),d=d.concat(m(f,b)),e=d.length),f=f._next;return d},n=f.getAllTweens=function(b){return m(a._rootTimeline,b).concat(m(a._rootFramesTimeline,b))};f.killAll=function(a,c,d,e){null==c&&(c=!0),null==d&&(d=!0);var f,g,h,i=n(0!=e),j=i.length,k=c&&d&&e;for(h=0;j>h;h++)g=i[h],(k||g instanceof b||(f=g.target===g.vars.onComplete)&&d||c&&!f)&&(a?g.totalTime(g._reversed?0:g.totalDuration()):g._enabled(!1,!1))},f.killChildTweensOf=function(a,b){if(null!=a){var e,g,k,l,m,n=h.tweenLookup;if("string"==typeof a&&(a=c.selector(a)||a),i(a)&&(a=d(a)),j(a))for(l=a.length;--l>-1;)f.killChildTweensOf(a[l],b);else{e=[];for(k in n)for(g=n[k].target.parentNode;g;)g===a&&(e=e.concat(n[k].tweens)),g=g.parentNode;for(m=e.length,l=0;m>l;l++)b&&e[l].totalTime(e[l].totalDuration()),e[l]._enabled(!1,!1)}}};var o=function(a,c,d,e){c=c!==!1,d=d!==!1,e=e!==!1;for(var f,g,h=n(e),i=c&&d&&e,j=h.length;--j>-1;)g=h[j],(i||g instanceof b||(f=g.target===g.vars.onComplete)&&d||c&&!f)&&g.paused(a)};return f.pauseAll=function(a,b,c){o(!0,a,b,c)},f.resumeAll=function(a,b,c){o(!1,a,b,c)},f.globalTimeScale=function(b){var d=a._rootTimeline,e=c.ticker.time;return arguments.length?(b=b||g,d._startTime=e-(e-d._startTime)*d._timeScale/b,d=a._rootFramesTimeline,e=c.ticker.frame,d._startTime=e-(e-d._startTime)*d._timeScale/b,d._timeScale=a._rootTimeline._timeScale=b,b):d._timeScale},k.progress=function(a){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&0!==(1&this._cycle)?1-a:a)+this._cycle*(this._duration+this._repeatDelay),!1):this._time/this.duration()},k.totalProgress=function(a){return arguments.length?this.totalTime(this.totalDuration()*a,!1):this._totalTime/this.totalDuration()},k.time=function(a,b){return arguments.length?(this._dirty&&this.totalDuration(),a>this._duration&&(a=this._duration),this._yoyo&&0!==(1&this._cycle)?a=this._duration-a+this._cycle*(this._duration+this._repeatDelay):0!==this._repeat&&(a+=this._cycle*(this._duration+this._repeatDelay)),this.totalTime(a,b)):this._time},k.duration=function(b){return arguments.length?a.prototype.duration.call(this,b):this._duration},k.totalDuration=function(a){return arguments.length?-1===this._repeat?this:this.duration((a-this._repeat*this._repeatDelay)/(this._repeat+1)):(this._dirty&&(this._totalDuration=-1===this._repeat?999999999999:this._duration*(this._repeat+1)+this._repeatDelay*this._repeat,this._dirty=!1),this._totalDuration)},k.repeat=function(a){return arguments.length?(this._repeat=a,this._uncache(!0)):this._repeat},k.repeatDelay=function(a){return arguments.length?(this._repeatDelay=a,this._uncache(!0)):this._repeatDelay},k.yoyo=function(a){return arguments.length?(this._yoyo=a,this):this._yoyo},f},!0),_gsScope._gsDefine("TimelineLite",["core.Animation","core.SimpleTimeline","TweenLite"],function(a,b,c){var d=function(a){b.call(this,a),this._labels={},this.autoRemoveChildren=this.vars.autoRemoveChildren===!0,this.smoothChildTiming=this.vars.smoothChildTiming===!0,this._sortChildren=!0,this._onUpdate=this.vars.onUpdate;var c,d,e=this.vars;for(d in e)c=e[d],i(c)&&-1!==c.join("").indexOf("{self}")&&(e[d]=this._swapSelfInParams(c));i(e.tweens)&&this.add(e.tweens,0,e.align,e.stagger)},e=1e-10,f=c._internals,g=d._internals={},h=f.isSelector,i=f.isArray,j=f.lazyTweens,k=f.lazyRender,l=_gsScope._gsDefine.globals,m=function(a){var b,c={};for(b in a)c[b]=a[b];return c},n=function(a,b,c){var d,e,f=a.cycle;for(d in f)e=f[d],a[d]="function"==typeof e?e.call(b[c],c):e[c%e.length];delete a.cycle},o=g.pauseCallback=function(){},p=function(a){var b,c=[],d=a.length;for(b=0;b!==d;c.push(a[b++]));return c},q=d.prototype=new b;return d.version="1.18.2",q.constructor=d,q.kill()._gc=q._forcingPlayhead=q._hasPause=!1,q.to=function(a,b,d,e){var f=d.repeat&&l.TweenMax||c;return b?this.add(new f(a,b,d),e):this.set(a,d,e)},q.from=function(a,b,d,e){return this.add((d.repeat&&l.TweenMax||c).from(a,b,d),e)},q.fromTo=function(a,b,d,e,f){var g=e.repeat&&l.TweenMax||c;return b?this.add(g.fromTo(a,b,d,e),f):this.set(a,e,f)},q.staggerTo=function(a,b,e,f,g,i,j,k){var l,o,q=new d({onComplete:i,onCompleteParams:j,callbackScope:k,smoothChildTiming:this.smoothChildTiming}),r=e.cycle;for("string"==typeof a&&(a=c.selector(a)||a),a=a||[],h(a)&&(a=p(a)),f=f||0,0>f&&(a=p(a),a.reverse(),f*=-1),o=0;o<a.length;o++)l=m(e),l.startAt&&(l.startAt=m(l.startAt),l.startAt.cycle&&n(l.startAt,a,o)),r&&n(l,a,o),q.to(a[o],b,l,o*f);return this.add(q,g)},q.staggerFrom=function(a,b,c,d,e,f,g,h){return c.immediateRender=0!=c.immediateRender,c.runBackwards=!0,this.staggerTo(a,b,c,d,e,f,g,h)},q.staggerFromTo=function(a,b,c,d,e,f,g,h,i){return d.startAt=c,d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender,this.staggerTo(a,b,d,e,f,g,h,i)},q.call=function(a,b,d,e){return this.add(c.delayedCall(0,a,b,d),e)},q.set=function(a,b,d){return d=this._parseTimeOrLabel(d,0,!0),null==b.immediateRender&&(b.immediateRender=d===this._time&&!this._paused),this.add(new c(a,0,b),d)},d.exportRoot=function(a,b){a=a||{},null==a.smoothChildTiming&&(a.smoothChildTiming=!0);var e,f,g=new d(a),h=g._timeline;for(null==b&&(b=!0),h._remove(g,!0),g._startTime=0,g._rawPrevTime=g._time=g._totalTime=h._time,e=h._first;e;)f=e._next,b&&e instanceof c&&e.target===e.vars.onComplete||g.add(e,e._startTime-e._delay),e=f;return h.add(g,0),g},q.add=function(e,f,g,h){var j,k,l,m,n,o;if("number"!=typeof f&&(f=this._parseTimeOrLabel(f,0,!0,e)),!(e instanceof a)){if(e instanceof Array||e&&e.push&&i(e)){for(g=g||"normal",h=h||0,j=f,k=e.length,l=0;k>l;l++)i(m=e[l])&&(m=new d({tweens:m})),this.add(m,j),"string"!=typeof m&&"function"!=typeof m&&("sequence"===g?j=m._startTime+m.totalDuration()/m._timeScale:"start"===g&&(m._startTime-=m.delay())),j+=h;return this._uncache(!0)}if("string"==typeof e)return this.addLabel(e,f);if("function"!=typeof e)throw"Cannot add "+e+" into the timeline; it is not a tween, timeline, function, or string.";e=c.delayedCall(0,e)}if(b.prototype.add.call(this,e,f),(this._gc||this._time===this._duration)&&!this._paused&&this._duration<this.duration())for(n=this,o=n.rawTime()>e._startTime;n._timeline;)o&&n._timeline.smoothChildTiming?n.totalTime(n._totalTime,!0):n._gc&&n._enabled(!0,!1),n=n._timeline;return this},q.remove=function(b){if(b instanceof a){this._remove(b,!1);var c=b._timeline=b.vars.useFrames?a._rootFramesTimeline:a._rootTimeline;return b._startTime=(b._paused?b._pauseTime:c._time)-(b._reversed?b.totalDuration()-b._totalTime:b._totalTime)/b._timeScale,this}if(b instanceof Array||b&&b.push&&i(b)){for(var d=b.length;--d>-1;)this.remove(b[d]);return this}return"string"==typeof b?this.removeLabel(b):this.kill(null,b)},q._remove=function(a,c){b.prototype._remove.call(this,a,c);var d=this._last;return d?this._time>d._startTime+d._totalDuration/d._timeScale&&(this._time=this.duration(),this._totalTime=this._totalDuration):this._time=this._totalTime=this._duration=this._totalDuration=0,this},q.append=function(a,b){return this.add(a,this._parseTimeOrLabel(null,b,!0,a))},q.insert=q.insertMultiple=function(a,b,c,d){return this.add(a,b||0,c,d)},q.appendMultiple=function(a,b,c,d){return this.add(a,this._parseTimeOrLabel(null,b,!0,a),c,d)},q.addLabel=function(a,b){return this._labels[a]=this._parseTimeOrLabel(b),this},q.addPause=function(a,b,d,e){var f=c.delayedCall(0,o,d,e||this);return f.vars.onComplete=f.vars.onReverseComplete=b,f.data="isPause",this._hasPause=!0,this.add(f,a)},q.removeLabel=function(a){return delete this._labels[a],this},q.getLabelTime=function(a){return null!=this._labels[a]?this._labels[a]:-1},q._parseTimeOrLabel=function(b,c,d,e){var f;if(e instanceof a&&e.timeline===this)this.remove(e);else if(e&&(e instanceof Array||e.push&&i(e)))for(f=e.length;--f>-1;)e[f]instanceof a&&e[f].timeline===this&&this.remove(e[f]);if("string"==typeof c)return this._parseTimeOrLabel(c,d&&"number"==typeof b&&null==this._labels[c]?b-this.duration():0,d);if(c=c||0,"string"!=typeof b||!isNaN(b)&&null==this._labels[b])null==b&&(b=this.duration());else{if(f=b.indexOf("="),-1===f)return null==this._labels[b]?d?this._labels[b]=this.duration()+c:c:this._labels[b]+c;c=parseInt(b.charAt(f-1)+"1",10)*Number(b.substr(f+1)),b=f>1?this._parseTimeOrLabel(b.substr(0,f-1),0,d):this.duration()}return Number(b)+c},q.seek=function(a,b){return this.totalTime("number"==typeof a?a:this._parseTimeOrLabel(a),b!==!1)},q.stop=function(){return this.paused(!0)},q.gotoAndPlay=function(a,b){return this.play(a,b)},q.gotoAndStop=function(a,b){return this.pause(a,b)},q.render=function(a,b,c){this._gc&&this._enabled(!0,!1);var d,f,g,h,i,l,m,n=this._dirty?this.totalDuration():this._totalDuration,o=this._time,p=this._startTime,q=this._timeScale,r=this._paused;if(a>=n-1e-7)this._totalTime=this._time=n,this._reversed||this._hasPausedChild()||(f=!0,h="onComplete",i=!!this._timeline.autoRemoveChildren,0===this._duration&&(0>=a&&a>=-1e-7||this._rawPrevTime<0||this._rawPrevTime===e)&&this._rawPrevTime!==a&&this._first&&(i=!0,this._rawPrevTime>e&&(h="onReverseComplete"))),this._rawPrevTime=this._duration||!b||a||this._rawPrevTime===a?a:e,a=n+1e-4;else if(1e-7>a)if(this._totalTime=this._time=0,(0!==o||0===this._duration&&this._rawPrevTime!==e&&(this._rawPrevTime>0||0>a&&this._rawPrevTime>=0))&&(h="onReverseComplete",f=this._reversed),0>a)this._active=!1,this._timeline.autoRemoveChildren&&this._reversed?(i=f=!0,h="onReverseComplete"):this._rawPrevTime>=0&&this._first&&(i=!0),this._rawPrevTime=a;else{if(this._rawPrevTime=this._duration||!b||a||this._rawPrevTime===a?a:e,0===a&&f)for(d=this._first;d&&0===d._startTime;)d._duration||(f=!1),d=d._next;a=0,this._initted||(i=!0)}else{if(this._hasPause&&!this._forcingPlayhead&&!b){if(a>=o)for(d=this._first;d&&d._startTime<=a&&!l;)d._duration||"isPause"!==d.data||d.ratio||0===d._startTime&&0===this._rawPrevTime||(l=d),d=d._next;else for(d=this._last;d&&d._startTime>=a&&!l;)d._duration||"isPause"===d.data&&d._rawPrevTime>0&&(l=d),d=d._prev;l&&(this._time=a=l._startTime,this._totalTime=a+this._cycle*(this._totalDuration+this._repeatDelay))}this._totalTime=this._time=this._rawPrevTime=a}if(this._time!==o&&this._first||c||i||l){if(this._initted||(this._initted=!0),this._active||!this._paused&&this._time!==o&&a>0&&(this._active=!0),0===o&&this.vars.onStart&&0!==this._time&&(b||this._callback("onStart")),m=this._time,m>=o)for(d=this._first;d&&(g=d._next,m===this._time&&(!this._paused||r));)(d._active||d._startTime<=m&&!d._paused&&!d._gc)&&(l===d&&this.pause(),d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)),d=g;else for(d=this._last;d&&(g=d._prev,m===this._time&&(!this._paused||r));){if(d._active||d._startTime<=o&&!d._paused&&!d._gc){if(l===d){for(l=d._prev;l&&l.endTime()>this._time;)l.render(l._reversed?l.totalDuration()-(a-l._startTime)*l._timeScale:(a-l._startTime)*l._timeScale,b,c),l=l._prev;l=null,this.pause()}d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)}d=g}this._onUpdate&&(b||(j.length&&k(),this._callback("onUpdate"))),h&&(this._gc||(p===this._startTime||q!==this._timeScale)&&(0===this._time||n>=this.totalDuration())&&(f&&(j.length&&k(),this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!b&&this.vars[h]&&this._callback(h)))}},q._hasPausedChild=function(){for(var a=this._first;a;){if(a._paused||a instanceof d&&a._hasPausedChild())return!0;a=a._next}return!1},q.getChildren=function(a,b,d,e){e=e||-9999999999;for(var f=[],g=this._first,h=0;g;)g._startTime<e||(g instanceof c?b!==!1&&(f[h++]=g):(d!==!1&&(f[h++]=g),a!==!1&&(f=f.concat(g.getChildren(!0,b,d)),h=f.length))),g=g._next;return f},q.getTweensOf=function(a,b){var d,e,f=this._gc,g=[],h=0;for(f&&this._enabled(!0,!0),d=c.getTweensOf(a),e=d.length;--e>-1;)(d[e].timeline===this||b&&this._contains(d[e]))&&(g[h++]=d[e]);return f&&this._enabled(!1,!0),g},q.recent=function(){return this._recent},q._contains=function(a){for(var b=a.timeline;b;){if(b===this)return!0;b=b.timeline}return!1},q.shiftChildren=function(a,b,c){c=c||0;for(var d,e=this._first,f=this._labels;e;)e._startTime>=c&&(e._startTime+=a),e=e._next;if(b)for(d in f)f[d]>=c&&(f[d]+=a);return this._uncache(!0)},q._kill=function(a,b){if(!a&&!b)return this._enabled(!1,!1);for(var c=b?this.getTweensOf(b):this.getChildren(!0,!0,!1),d=c.length,e=!1;--d>-1;)c[d]._kill(a,b)&&(e=!0);return e},q.clear=function(a){var b=this.getChildren(!1,!0,!0),c=b.length;for(this._time=this._totalTime=0;--c>-1;)b[c]._enabled(!1,!1);return a!==!1&&(this._labels={}),this._uncache(!0)},q.invalidate=function(){for(var b=this._first;b;)b.invalidate(),b=b._next;return a.prototype.invalidate.call(this)},q._enabled=function(a,c){if(a===this._gc)for(var d=this._first;d;)d._enabled(a,!0),d=d._next;return b.prototype._enabled.call(this,a,c)},q.totalTime=function(b,c,d){this._forcingPlayhead=!0;var e=a.prototype.totalTime.apply(this,arguments);return this._forcingPlayhead=!1,e},q.duration=function(a){return arguments.length?(0!==this.duration()&&0!==a&&this.timeScale(this._duration/a),this):(this._dirty&&this.totalDuration(),this._duration)},q.totalDuration=function(a){if(!arguments.length){if(this._dirty){for(var b,c,d=0,e=this._last,f=999999999999;e;)b=e._prev,e._dirty&&e.totalDuration(),e._startTime>f&&this._sortChildren&&!e._paused?this.add(e,e._startTime-e._delay):f=e._startTime,e._startTime<0&&!e._paused&&(d-=e._startTime,this._timeline.smoothChildTiming&&(this._startTime+=e._startTime/this._timeScale),this.shiftChildren(-e._startTime,!1,-9999999999),f=0),c=e._startTime+e._totalDuration/e._timeScale,c>d&&(d=c),e=b;this._duration=this._totalDuration=d,this._dirty=!1}return this._totalDuration}return a&&this.totalDuration()?this.timeScale(this._totalDuration/a):this},q.paused=function(b){if(!b)for(var c=this._first,d=this._time;c;)c._startTime===d&&"isPause"===c.data&&(c._rawPrevTime=0),c=c._next;return a.prototype.paused.apply(this,arguments)},q.usesFrames=function(){for(var b=this._timeline;b._timeline;)b=b._timeline;return b===a._rootFramesTimeline},q.rawTime=function(){return this._paused?this._totalTime:(this._timeline.rawTime()-this._startTime)*this._timeScale},d},!0),_gsScope._gsDefine("TimelineMax",["TimelineLite","TweenLite","easing.Ease"],function(a,b,c){var d=function(b){a.call(this,b),this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._cycle=0,this._yoyo=this.vars.yoyo===!0,this._dirty=!0},e=1e-10,f=b._internals,g=f.lazyTweens,h=f.lazyRender,i=new c(null,null,1,0),j=d.prototype=new a;return j.constructor=d,j.kill()._gc=!1,d.version="1.18.2",j.invalidate=function(){return this._yoyo=this.vars.yoyo===!0,this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._uncache(!0),a.prototype.invalidate.call(this)},j.addCallback=function(a,c,d,e){return this.add(b.delayedCall(0,a,d,e),c)},j.removeCallback=function(a,b){if(a)if(null==b)this._kill(null,a);else for(var c=this.getTweensOf(a,!1),d=c.length,e=this._parseTimeOrLabel(b);--d>-1;)c[d]._startTime===e&&c[d]._enabled(!1,!1);return this},j.removePause=function(b){return this.removeCallback(a._internals.pauseCallback,b)},j.tweenTo=function(a,c){c=c||{};var d,e,f,g={ease:i,useFrames:this.usesFrames(),immediateRender:!1};for(e in c)g[e]=c[e];return g.time=this._parseTimeOrLabel(a),d=Math.abs(Number(g.time)-this._time)/this._timeScale||.001,f=new b(this,d,g),g.onStart=function(){f.target.paused(!0),f.vars.time!==f.target.time()&&d===f.duration()&&f.duration(Math.abs(f.vars.time-f.target.time())/f.target._timeScale),c.onStart&&f._callback("onStart")},f},j.tweenFromTo=function(a,b,c){c=c||{},a=this._parseTimeOrLabel(a),c.startAt={onComplete:this.seek,onCompleteParams:[a],callbackScope:this},c.immediateRender=c.immediateRender!==!1;var d=this.tweenTo(b,c);return d.duration(Math.abs(d.vars.time-a)/this._timeScale||.001)},j.render=function(a,b,c){this._gc&&this._enabled(!0,!1);var d,f,i,j,k,l,m,n,o=this._dirty?this.totalDuration():this._totalDuration,p=this._duration,q=this._time,r=this._totalTime,s=this._startTime,t=this._timeScale,u=this._rawPrevTime,v=this._paused,w=this._cycle;if(a>=o-1e-7)this._locked||(this._totalTime=o,this._cycle=this._repeat),this._reversed||this._hasPausedChild()||(f=!0,j="onComplete",k=!!this._timeline.autoRemoveChildren,0===this._duration&&(0>=a&&a>=-1e-7||0>u||u===e)&&u!==a&&this._first&&(k=!0,u>e&&(j="onReverseComplete"))),this._rawPrevTime=this._duration||!b||a||this._rawPrevTime===a?a:e,this._yoyo&&0!==(1&this._cycle)?this._time=a=0:(this._time=p,a=p+1e-4);else if(1e-7>a)if(this._locked||(this._totalTime=this._cycle=0),this._time=0,(0!==q||0===p&&u!==e&&(u>0||0>a&&u>=0)&&!this._locked)&&(j="onReverseComplete",f=this._reversed),0>a)this._active=!1,this._timeline.autoRemoveChildren&&this._reversed?(k=f=!0,j="onReverseComplete"):u>=0&&this._first&&(k=!0),this._rawPrevTime=a;else{if(this._rawPrevTime=p||!b||a||this._rawPrevTime===a?a:e,0===a&&f)for(d=this._first;d&&0===d._startTime;)d._duration||(f=!1),d=d._next;a=0,this._initted||(k=!0)}else if(0===p&&0>u&&(k=!0),this._time=this._rawPrevTime=a,this._locked||(this._totalTime=a,0!==this._repeat&&(l=p+this._repeatDelay,this._cycle=this._totalTime/l>>0,0!==this._cycle&&this._cycle===this._totalTime/l&&this._cycle--,this._time=this._totalTime-this._cycle*l,this._yoyo&&0!==(1&this._cycle)&&(this._time=p-this._time),this._time>p?(this._time=p,a=p+1e-4):this._time<0?this._time=a=0:a=this._time)),this._hasPause&&!this._forcingPlayhead&&!b){if(a=this._time,a>=q)for(d=this._first;d&&d._startTime<=a&&!m;)d._duration||"isPause"!==d.data||d.ratio||0===d._startTime&&0===this._rawPrevTime||(m=d),d=d._next;else for(d=this._last;d&&d._startTime>=a&&!m;)d._duration||"isPause"===d.data&&d._rawPrevTime>0&&(m=d),d=d._prev;m&&(this._time=a=m._startTime,this._totalTime=a+this._cycle*(this._totalDuration+this._repeatDelay))}if(this._cycle!==w&&!this._locked){var x=this._yoyo&&0!==(1&w),y=x===(this._yoyo&&0!==(1&this._cycle)),z=this._totalTime,A=this._cycle,B=this._rawPrevTime,C=this._time;if(this._totalTime=w*p,this._cycle<w?x=!x:this._totalTime+=p,this._time=q,this._rawPrevTime=0===p?u-1e-4:u,this._cycle=w,this._locked=!0,q=x?0:p,this.render(q,b,0===p),b||this._gc||this.vars.onRepeat&&this._callback("onRepeat"),q!==this._time)return;if(y&&(q=x?p+1e-4:-1e-4,this.render(q,!0,!1)),this._locked=!1,this._paused&&!v)return;this._time=C,this._totalTime=z,this._cycle=A,this._rawPrevTime=B}if(!(this._time!==q&&this._first||c||k||m))return void(r!==this._totalTime&&this._onUpdate&&(b||this._callback("onUpdate")));if(this._initted||(this._initted=!0),this._active||!this._paused&&this._totalTime!==r&&a>0&&(this._active=!0),0===r&&this.vars.onStart&&0!==this._totalTime&&(b||this._callback("onStart")),n=this._time,n>=q)for(d=this._first;d&&(i=d._next,n===this._time&&(!this._paused||v));)(d._active||d._startTime<=this._time&&!d._paused&&!d._gc)&&(m===d&&this.pause(),d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)),d=i;else for(d=this._last;d&&(i=d._prev,n===this._time&&(!this._paused||v));){if(d._active||d._startTime<=q&&!d._paused&&!d._gc){if(m===d){for(m=d._prev;m&&m.endTime()>this._time;)m.render(m._reversed?m.totalDuration()-(a-m._startTime)*m._timeScale:(a-m._startTime)*m._timeScale,b,c),m=m._prev;m=null,this.pause()}d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)}d=i}this._onUpdate&&(b||(g.length&&h(),this._callback("onUpdate"))),j&&(this._locked||this._gc||(s===this._startTime||t!==this._timeScale)&&(0===this._time||o>=this.totalDuration())&&(f&&(g.length&&h(),this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!b&&this.vars[j]&&this._callback(j)))},j.getActive=function(a,b,c){null==a&&(a=!0),null==b&&(b=!0),null==c&&(c=!1);var d,e,f=[],g=this.getChildren(a,b,c),h=0,i=g.length;for(d=0;i>d;d++)e=g[d],e.isActive()&&(f[h++]=e);return f},j.getLabelAfter=function(a){a||0!==a&&(a=this._time);var b,c=this.getLabelsArray(),d=c.length;for(b=0;d>b;b++)if(c[b].time>a)return c[b].name;return null},j.getLabelBefore=function(a){null==a&&(a=this._time);for(var b=this.getLabelsArray(),c=b.length;--c>-1;)if(b[c].time<a)return b[c].name;return null},j.getLabelsArray=function(){var a,b=[],c=0;for(a in this._labels)b[c++]={time:this._labels[a],name:a};return b.sort(function(a,b){return a.time-b.time}),b},j.progress=function(a,b){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&0!==(1&this._cycle)?1-a:a)+this._cycle*(this._duration+this._repeatDelay),b):this._time/this.duration()},j.totalProgress=function(a,b){return arguments.length?this.totalTime(this.totalDuration()*a,b):this._totalTime/this.totalDuration()},j.totalDuration=function(b){return arguments.length?-1!==this._repeat&&b?this.timeScale(this.totalDuration()/b):this:(this._dirty&&(a.prototype.totalDuration.call(this),this._totalDuration=-1===this._repeat?999999999999:this._duration*(this._repeat+1)+this._repeatDelay*this._repeat),this._totalDuration)},j.time=function(a,b){return arguments.length?(this._dirty&&this.totalDuration(),a>this._duration&&(a=this._duration),this._yoyo&&0!==(1&this._cycle)?a=this._duration-a+this._cycle*(this._duration+this._repeatDelay):0!==this._repeat&&(a+=this._cycle*(this._duration+this._repeatDelay)),this.totalTime(a,b)):this._time},j.repeat=function(a){return arguments.length?(this._repeat=a,this._uncache(!0)):this._repeat},j.repeatDelay=function(a){return arguments.length?(this._repeatDelay=a,this._uncache(!0)):this._repeatDelay},j.yoyo=function(a){return arguments.length?(this._yoyo=a,this):this._yoyo},j.currentLabel=function(a){return arguments.length?this.seek(a,!0):this.getLabelBefore(this._time+1e-8)},d},!0),function(){var a=180/Math.PI,b=[],c=[],d=[],e={},f=_gsScope._gsDefine.globals,g=function(a,b,c,d){this.a=a,this.b=b,this.c=c,this.d=d,this.da=d-a,this.ca=c-a,this.ba=b-a},h=",x,y,z,left,top,right,bottom,marginTop,marginLeft,marginRight,marginBottom,paddingLeft,paddingTop,paddingRight,paddingBottom,backgroundPosition,backgroundPosition_y,",i=function(a,b,c,d){var e={a:a},f={},g={},h={c:d},i=(a+b)/2,j=(b+c)/2,k=(c+d)/2,l=(i+j)/2,m=(j+k)/2,n=(m-l)/8;return e.b=i+(a-i)/4,f.b=l+n,e.c=f.a=(e.b+f.b)/2,f.c=g.a=(l+m)/2,g.b=m-n,h.b=k+(d-k)/4,g.c=h.a=(g.b+h.b)/2,[e,f,g,h]},j=function(a,e,f,g,h){var j,k,l,m,n,o,p,q,r,s,t,u,v,w=a.length-1,x=0,y=a[0].a;for(j=0;w>j;j++)n=a[x],k=n.a,l=n.d,m=a[x+1].d,h?(t=b[j],u=c[j],v=(u+t)*e*.25/(g?.5:d[j]||.5),o=l-(l-k)*(g?.5*e:0!==t?v/t:0),p=l+(m-l)*(g?.5*e:0!==u?v/u:0),q=l-(o+((p-o)*(3*t/(t+u)+.5)/4||0))):(o=l-(l-k)*e*.5,p=l+(m-l)*e*.5,q=l-(o+p)/2),o+=q,p+=q,n.c=r=o,0!==j?n.b=y:n.b=y=n.a+.6*(n.c-n.a),n.da=l-k,n.ca=r-k,n.ba=y-k,f?(s=i(k,y,r,l),a.splice(x,1,s[0],s[1],s[2],s[3]),x+=4):x++,y=p;n=a[x],n.b=y,n.c=y+.4*(n.d-y),n.da=n.d-n.a,n.ca=n.c-n.a,n.ba=y-n.a,f&&(s=i(n.a,y,n.c,n.d),a.splice(x,1,s[0],s[1],s[2],s[3]))},k=function(a,d,e,f){var h,i,j,k,l,m,n=[];if(f)for(a=[f].concat(a),i=a.length;--i>-1;)"string"==typeof(m=a[i][d])&&"="===m.charAt(1)&&(a[i][d]=f[d]+Number(m.charAt(0)+m.substr(2)));if(h=a.length-2,0>h)return n[0]=new g(a[0][d],0,0,a[-1>h?0:1][d]),n;for(i=0;h>i;i++)j=a[i][d],k=a[i+1][d],n[i]=new g(j,0,0,k),e&&(l=a[i+2][d],b[i]=(b[i]||0)+(k-j)*(k-j),c[i]=(c[i]||0)+(l-k)*(l-k));return n[i]=new g(a[i][d],0,0,a[i+1][d]),n},l=function(a,f,g,i,l,m){var n,o,p,q,r,s,t,u,v={},w=[],x=m||a[0];l="string"==typeof l?","+l+",":h,null==f&&(f=1);for(o in a[0])w.push(o);if(a.length>1){for(u=a[a.length-1],t=!0,n=w.length;--n>-1;)if(o=w[n],Math.abs(x[o]-u[o])>.05){t=!1;break}t&&(a=a.concat(),m&&a.unshift(m),a.push(a[1]),m=a[a.length-3])}for(b.length=c.length=d.length=0,n=w.length;--n>-1;)o=w[n],e[o]=-1!==l.indexOf(","+o+","),v[o]=k(a,o,e[o],m);for(n=b.length;--n>-1;)b[n]=Math.sqrt(b[n]),c[n]=Math.sqrt(c[n]);if(!i){for(n=w.length;--n>-1;)if(e[o])for(p=v[w[n]],s=p.length-1,q=0;s>q;q++)r=p[q+1].da/c[q]+p[q].da/b[q],d[q]=(d[q]||0)+r*r;for(n=d.length;--n>-1;)d[n]=Math.sqrt(d[n])}for(n=w.length,q=g?4:1;--n>-1;)o=w[n],p=v[o],j(p,f,g,i,e[o]),t&&(p.splice(0,q),p.splice(p.length-q,q));return v},m=function(a,b,c){b=b||"soft";var d,e,f,h,i,j,k,l,m,n,o,p={},q="cubic"===b?3:2,r="soft"===b,s=[];if(r&&c&&(a=[c].concat(a)),null==a||a.length<q+1)throw"invalid Bezier data";for(m in a[0])s.push(m);for(j=s.length;--j>-1;){for(m=s[j],p[m]=i=[],n=0,l=a.length,k=0;l>k;k++)d=null==c?a[k][m]:"string"==typeof(o=a[k][m])&&"="===o.charAt(1)?c[m]+Number(o.charAt(0)+o.substr(2)):Number(o),r&&k>1&&l-1>k&&(i[n++]=(d+i[n-2])/2),i[n++]=d;for(l=n-q+1,n=0,k=0;l>k;k+=q)d=i[k],e=i[k+1],f=i[k+2],h=2===q?0:i[k+3],i[n++]=o=3===q?new g(d,e,f,h):new g(d,(2*e+d)/3,(2*e+f)/3,f);i.length=n}return p},n=function(a,b,c){for(var d,e,f,g,h,i,j,k,l,m,n,o=1/c,p=a.length;--p>-1;)for(m=a[p],f=m.a,g=m.d-f,h=m.c-f,i=m.b-f,d=e=0,k=1;c>=k;k++)j=o*k,l=1-j,d=e-(e=(j*j*g+3*l*(j*h+l*i))*j),n=p*c+k-1,b[n]=(b[n]||0)+d*d},o=function(a,b){b=b>>0||6;var c,d,e,f,g=[],h=[],i=0,j=0,k=b-1,l=[],m=[];for(c in a)n(a[c],g,b);for(e=g.length,d=0;e>d;d++)i+=Math.sqrt(g[d]),f=d%b,m[f]=i,f===k&&(j+=i,f=d/b>>0,l[f]=m,h[f]=j,i=0,m=[]);return{length:j,lengths:h,segments:l}},p=_gsScope._gsDefine.plugin({propName:"bezier",priority:-1,version:"1.3.4",API:2,global:!0,init:function(a,b,c){this._target=a,b instanceof Array&&(b={values:b}),this._func={},this._round={},this._props=[],this._timeRes=null==b.timeResolution?6:parseInt(b.timeResolution,10);
var d,e,f,g,h,i=b.values||[],j={},k=i[0],n=b.autoRotate||c.vars.orientToBezier;this._autoRotate=n?n instanceof Array?n:[["x","y","rotation",n===!0?0:Number(n)||0]]:null;for(d in k)this._props.push(d);for(f=this._props.length;--f>-1;)d=this._props[f],this._overwriteProps.push(d),e=this._func[d]="function"==typeof a[d],j[d]=e?a[d.indexOf("set")||"function"!=typeof a["get"+d.substr(3)]?d:"get"+d.substr(3)]():parseFloat(a[d]),h||j[d]!==i[0][d]&&(h=j);if(this._beziers="cubic"!==b.type&&"quadratic"!==b.type&&"soft"!==b.type?l(i,isNaN(b.curviness)?1:b.curviness,!1,"thruBasic"===b.type,b.correlate,h):m(i,b.type,j),this._segCount=this._beziers[d].length,this._timeRes){var p=o(this._beziers,this._timeRes);this._length=p.length,this._lengths=p.lengths,this._segments=p.segments,this._l1=this._li=this._s1=this._si=0,this._l2=this._lengths[0],this._curSeg=this._segments[0],this._s2=this._curSeg[0],this._prec=1/this._curSeg.length}if(n=this._autoRotate)for(this._initialRotations=[],n[0]instanceof Array||(this._autoRotate=n=[n]),f=n.length;--f>-1;){for(g=0;3>g;g++)d=n[f][g],this._func[d]="function"==typeof a[d]?a[d.indexOf("set")||"function"!=typeof a["get"+d.substr(3)]?d:"get"+d.substr(3)]:!1;d=n[f][2],this._initialRotations[f]=this._func[d]?this._func[d].call(this._target):this._target[d]}return this._startRatio=c.vars.runBackwards?1:0,!0},set:function(b){var c,d,e,f,g,h,i,j,k,l,m=this._segCount,n=this._func,o=this._target,p=b!==this._startRatio;if(this._timeRes){if(k=this._lengths,l=this._curSeg,b*=this._length,e=this._li,b>this._l2&&m-1>e){for(j=m-1;j>e&&(this._l2=k[++e])<=b;);this._l1=k[e-1],this._li=e,this._curSeg=l=this._segments[e],this._s2=l[this._s1=this._si=0]}else if(b<this._l1&&e>0){for(;e>0&&(this._l1=k[--e])>=b;);0===e&&b<this._l1?this._l1=0:e++,this._l2=k[e],this._li=e,this._curSeg=l=this._segments[e],this._s1=l[(this._si=l.length-1)-1]||0,this._s2=l[this._si]}if(c=e,b-=this._l1,e=this._si,b>this._s2&&e<l.length-1){for(j=l.length-1;j>e&&(this._s2=l[++e])<=b;);this._s1=l[e-1],this._si=e}else if(b<this._s1&&e>0){for(;e>0&&(this._s1=l[--e])>=b;);0===e&&b<this._s1?this._s1=0:e++,this._s2=l[e],this._si=e}h=(e+(b-this._s1)/(this._s2-this._s1))*this._prec}else c=0>b?0:b>=1?m-1:m*b>>0,h=(b-c*(1/m))*m;for(d=1-h,e=this._props.length;--e>-1;)f=this._props[e],g=this._beziers[f][c],i=(h*h*g.da+3*d*(h*g.ca+d*g.ba))*h+g.a,this._round[f]&&(i=Math.round(i)),n[f]?o[f](i):o[f]=i;if(this._autoRotate){var q,r,s,t,u,v,w,x=this._autoRotate;for(e=x.length;--e>-1;)f=x[e][2],v=x[e][3]||0,w=x[e][4]===!0?1:a,g=this._beziers[x[e][0]],q=this._beziers[x[e][1]],g&&q&&(g=g[c],q=q[c],r=g.a+(g.b-g.a)*h,t=g.b+(g.c-g.b)*h,r+=(t-r)*h,t+=(g.c+(g.d-g.c)*h-t)*h,s=q.a+(q.b-q.a)*h,u=q.b+(q.c-q.b)*h,s+=(u-s)*h,u+=(q.c+(q.d-q.c)*h-u)*h,i=p?Math.atan2(u-s,t-r)*w+v:this._initialRotations[e],n[f]?o[f](i):o[f]=i)}}}),q=p.prototype;p.bezierThrough=l,p.cubicToQuadratic=i,p._autoCSS=!0,p.quadraticToCubic=function(a,b,c){return new g(a,(2*b+a)/3,(2*b+c)/3,c)},p._cssRegister=function(){var a=f.CSSPlugin;if(a){var b=a._internals,c=b._parseToProxy,d=b._setPluginRatio,e=b.CSSPropTween;b._registerComplexSpecialProp("bezier",{parser:function(a,b,f,g,h,i){b instanceof Array&&(b={values:b}),i=new p;var j,k,l,m=b.values,n=m.length-1,o=[],q={};if(0>n)return h;for(j=0;n>=j;j++)l=c(a,m[j],g,h,i,n!==j),o[j]=l.end;for(k in b)q[k]=b[k];return q.values=o,h=new e(a,"bezier",0,0,l.pt,2),h.data=l,h.plugin=i,h.setRatio=d,0===q.autoRotate&&(q.autoRotate=!0),!q.autoRotate||q.autoRotate instanceof Array||(j=q.autoRotate===!0?0:Number(q.autoRotate),q.autoRotate=null!=l.end.left?[["left","top","rotation",j,!1]]:null!=l.end.x?[["x","y","rotation",j,!1]]:!1),q.autoRotate&&(g._transform||g._enableTransforms(!1),l.autoRotate=g._target._gsTransform),i._onInitTween(l.proxy,q,g._tween),h}})}},q._roundProps=function(a,b){for(var c=this._overwriteProps,d=c.length;--d>-1;)(a[c[d]]||a.bezier||a.bezierThrough)&&(this._round[c[d]]=b)},q._kill=function(a){var b,c,d=this._props;for(b in this._beziers)if(b in a)for(delete this._beziers[b],delete this._func[b],c=d.length;--c>-1;)d[c]===b&&d.splice(c,1);return this._super._kill.call(this,a)}}(),_gsScope._gsDefine("plugins.CSSPlugin",["plugins.TweenPlugin","TweenLite"],function(a,b){var c,d,e,f,g=function(){a.call(this,"css"),this._overwriteProps.length=0,this.setRatio=g.prototype.setRatio},h=_gsScope._gsDefine.globals,i={},j=g.prototype=new a("css");j.constructor=g,g.version="1.18.2",g.API=2,g.defaultTransformPerspective=0,g.defaultSkewType="compensated",g.defaultSmoothOrigin=!0,j="px",g.suffixMap={top:j,right:j,bottom:j,left:j,width:j,height:j,fontSize:j,padding:j,margin:j,perspective:j,lineHeight:""};var k,l,m,n,o,p,q=/(?:\d|\-\d|\.\d|\-\.\d)+/g,r=/(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,s=/(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi,t=/(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g,u=/(?:\d|\-|\+|=|#|\.)*/g,v=/opacity *= *([^)]*)/i,w=/opacity:([^;]*)/i,x=/alpha\(opacity *=.+?\)/i,y=/^(rgb|hsl)/,z=/([A-Z])/g,A=/-([a-z])/gi,B=/(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi,C=function(a,b){return b.toUpperCase()},D=/(?:Left|Right|Width)/i,E=/(M11|M12|M21|M22)=[\d\-\.e]+/gi,F=/progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,G=/,(?=[^\)]*(?:\(|$))/gi,H=Math.PI/180,I=180/Math.PI,J={},K=document,L=function(a){return K.createElementNS?K.createElementNS("http://www.w3.org/1999/xhtml",a):K.createElement(a)},M=L("div"),N=L("img"),O=g._internals={_specialProps:i},P=navigator.userAgent,Q=function(){var a=P.indexOf("Android"),b=L("a");return m=-1!==P.indexOf("Safari")&&-1===P.indexOf("Chrome")&&(-1===a||Number(P.substr(a+8,1))>3),o=m&&Number(P.substr(P.indexOf("Version/")+8,1))<6,n=-1!==P.indexOf("Firefox"),(/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(P)||/Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(P))&&(p=parseFloat(RegExp.$1)),b?(b.style.cssText="top:1px;opacity:.55;",/^0.55/.test(b.style.opacity)):!1}(),R=function(a){return v.test("string"==typeof a?a:(a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?parseFloat(RegExp.$1)/100:1},S=function(a){window.console&&console.log(a)},T="",U="",V=function(a,b){b=b||M;var c,d,e=b.style;if(void 0!==e[a])return a;for(a=a.charAt(0).toUpperCase()+a.substr(1),c=["O","Moz","ms","Ms","Webkit"],d=5;--d>-1&&void 0===e[c[d]+a];);return d>=0?(U=3===d?"ms":c[d],T="-"+U.toLowerCase()+"-",U+a):null},W=K.defaultView?K.defaultView.getComputedStyle:function(){},X=g.getStyle=function(a,b,c,d,e){var f;return Q||"opacity"!==b?(!d&&a.style[b]?f=a.style[b]:(c=c||W(a))?f=c[b]||c.getPropertyValue(b)||c.getPropertyValue(b.replace(z,"-$1").toLowerCase()):a.currentStyle&&(f=a.currentStyle[b]),null==e||f&&"none"!==f&&"auto"!==f&&"auto auto"!==f?f:e):R(a)},Y=O.convertToPixels=function(a,c,d,e,f){if("px"===e||!e)return d;if("auto"===e||!d)return 0;var h,i,j,k=D.test(c),l=a,m=M.style,n=0>d;if(n&&(d=-d),"%"===e&&-1!==c.indexOf("border"))h=d/100*(k?a.clientWidth:a.clientHeight);else{if(m.cssText="border:0 solid red;position:"+X(a,"position")+";line-height:0;","%"!==e&&l.appendChild&&"v"!==e.charAt(0)&&"rem"!==e)m[k?"borderLeftWidth":"borderTopWidth"]=d+e;else{if(l=a.parentNode||K.body,i=l._gsCache,j=b.ticker.frame,i&&k&&i.time===j)return i.width*d/100;m[k?"width":"height"]=d+e}l.appendChild(M),h=parseFloat(M[k?"offsetWidth":"offsetHeight"]),l.removeChild(M),k&&"%"===e&&g.cacheWidths!==!1&&(i=l._gsCache=l._gsCache||{},i.time=j,i.width=h/d*100),0!==h||f||(h=Y(a,c,d,e,!0))}return n?-h:h},Z=O.calculateOffset=function(a,b,c){if("absolute"!==X(a,"position",c))return 0;var d="left"===b?"Left":"Top",e=X(a,"margin"+d,c);return a["offset"+d]-(Y(a,b,parseFloat(e),e.replace(u,""))||0)},$=function(a,b){var c,d,e,f={};if(b=b||W(a,null))if(c=b.length)for(;--c>-1;)e=b[c],(-1===e.indexOf("-transform")||za===e)&&(f[e.replace(A,C)]=b.getPropertyValue(e));else for(c in b)(-1===c.indexOf("Transform")||ya===c)&&(f[c]=b[c]);else if(b=a.currentStyle||a.style)for(c in b)"string"==typeof c&&void 0===f[c]&&(f[c.replace(A,C)]=b[c]);return Q||(f.opacity=R(a)),d=La(a,b,!1),f.rotation=d.rotation,f.skewX=d.skewX,f.scaleX=d.scaleX,f.scaleY=d.scaleY,f.x=d.x,f.y=d.y,Ba&&(f.z=d.z,f.rotationX=d.rotationX,f.rotationY=d.rotationY,f.scaleZ=d.scaleZ),f.filters&&delete f.filters,f},_=function(a,b,c,d,e){var f,g,h,i={},j=a.style;for(g in c)"cssText"!==g&&"length"!==g&&isNaN(g)&&(b[g]!==(f=c[g])||e&&e[g])&&-1===g.indexOf("Origin")&&("number"==typeof f||"string"==typeof f)&&(i[g]="auto"!==f||"left"!==g&&"top"!==g?""!==f&&"auto"!==f&&"none"!==f||"string"!=typeof b[g]||""===b[g].replace(t,"")?f:0:Z(a,g),void 0!==j[g]&&(h=new oa(j,g,j[g],h)));if(d)for(g in d)"className"!==g&&(i[g]=d[g]);return{difs:i,firstMPT:h}},aa={width:["Left","Right"],height:["Top","Bottom"]},ba=["marginLeft","marginRight","marginTop","marginBottom"],ca=function(a,b,c){var d=parseFloat("width"===b?a.offsetWidth:a.offsetHeight),e=aa[b],f=e.length;for(c=c||W(a,null);--f>-1;)d-=parseFloat(X(a,"padding"+e[f],c,!0))||0,d-=parseFloat(X(a,"border"+e[f]+"Width",c,!0))||0;return d},da=function(a,b){if("contain"===a||"auto"===a||"auto auto"===a)return a+" ";(null==a||""===a)&&(a="0 0");var c=a.split(" "),d=-1!==a.indexOf("left")?"0%":-1!==a.indexOf("right")?"100%":c[0],e=-1!==a.indexOf("top")?"0%":-1!==a.indexOf("bottom")?"100%":c[1];return null==e?e="center"===d?"50%":"0":"center"===e&&(e="50%"),("center"===d||isNaN(parseFloat(d))&&-1===(d+"").indexOf("="))&&(d="50%"),a=d+" "+e+(c.length>2?" "+c[2]:""),b&&(b.oxp=-1!==d.indexOf("%"),b.oyp=-1!==e.indexOf("%"),b.oxr="="===d.charAt(1),b.oyr="="===e.charAt(1),b.ox=parseFloat(d.replace(t,"")),b.oy=parseFloat(e.replace(t,"")),b.v=a),b||a},ea=function(a,b){return"string"==typeof a&&"="===a.charAt(1)?parseInt(a.charAt(0)+"1",10)*parseFloat(a.substr(2)):parseFloat(a)-parseFloat(b)},fa=function(a,b){return null==a?b:"string"==typeof a&&"="===a.charAt(1)?parseInt(a.charAt(0)+"1",10)*parseFloat(a.substr(2))+b:parseFloat(a)},ga=function(a,b,c,d){var e,f,g,h,i,j=1e-6;return null==a?h=b:"number"==typeof a?h=a:(e=360,f=a.split("_"),i="="===a.charAt(1),g=(i?parseInt(a.charAt(0)+"1",10)*parseFloat(f[0].substr(2)):parseFloat(f[0]))*(-1===a.indexOf("rad")?1:I)-(i?0:b),f.length&&(d&&(d[c]=b+g),-1!==a.indexOf("short")&&(g%=e,g!==g%(e/2)&&(g=0>g?g+e:g-e)),-1!==a.indexOf("_cw")&&0>g?g=(g+9999999999*e)%e-(g/e|0)*e:-1!==a.indexOf("ccw")&&g>0&&(g=(g-9999999999*e)%e-(g/e|0)*e)),h=b+g),j>h&&h>-j&&(h=0),h},ha={aqua:[0,255,255],lime:[0,255,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,255],navy:[0,0,128],white:[255,255,255],fuchsia:[255,0,255],olive:[128,128,0],yellow:[255,255,0],orange:[255,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[255,0,0],pink:[255,192,203],cyan:[0,255,255],transparent:[255,255,255,0]},ia=function(a,b,c){return a=0>a?a+1:a>1?a-1:a,255*(1>6*a?b+(c-b)*a*6:.5>a?c:2>3*a?b+(c-b)*(2/3-a)*6:b)+.5|0},ja=g.parseColor=function(a,b){var c,d,e,f,g,h,i,j,k,l,m;if(a)if("number"==typeof a)c=[a>>16,a>>8&255,255&a];else{if(","===a.charAt(a.length-1)&&(a=a.substr(0,a.length-1)),ha[a])c=ha[a];else if("#"===a.charAt(0))4===a.length&&(d=a.charAt(1),e=a.charAt(2),f=a.charAt(3),a="#"+d+d+e+e+f+f),a=parseInt(a.substr(1),16),c=[a>>16,a>>8&255,255&a];else if("hsl"===a.substr(0,3))if(c=m=a.match(q),b){if(-1!==a.indexOf("="))return a.match(r)}else g=Number(c[0])%360/360,h=Number(c[1])/100,i=Number(c[2])/100,e=.5>=i?i*(h+1):i+h-i*h,d=2*i-e,c.length>3&&(c[3]=Number(a[3])),c[0]=ia(g+1/3,d,e),c[1]=ia(g,d,e),c[2]=ia(g-1/3,d,e);else c=a.match(q)||ha.transparent;c[0]=Number(c[0]),c[1]=Number(c[1]),c[2]=Number(c[2]),c.length>3&&(c[3]=Number(c[3]))}else c=ha.black;return b&&!m&&(d=c[0]/255,e=c[1]/255,f=c[2]/255,j=Math.max(d,e,f),k=Math.min(d,e,f),i=(j+k)/2,j===k?g=h=0:(l=j-k,h=i>.5?l/(2-j-k):l/(j+k),g=j===d?(e-f)/l+(f>e?6:0):j===e?(f-d)/l+2:(d-e)/l+4,g*=60),c[0]=g+.5|0,c[1]=100*h+.5|0,c[2]=100*i+.5|0),c},ka=function(a,b){var c,d,e,f=a.match(la)||[],g=0,h=f.length?"":a;for(c=0;c<f.length;c++)d=f[c],e=a.substr(g,a.indexOf(d,g)-g),g+=e.length+d.length,d=ja(d,b),3===d.length&&d.push(1),h+=e+(b?"hsla("+d[0]+","+d[1]+"%,"+d[2]+"%,"+d[3]:"rgba("+d.join(","))+")";return h},la="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3}){1,2}\\b";for(j in ha)la+="|"+j+"\\b";la=new RegExp(la+")","gi"),g.colorStringFilter=function(a){var b,c=a[0]+a[1];la.lastIndex=0,la.test(c)&&(b=-1!==c.indexOf("hsl(")||-1!==c.indexOf("hsla("),a[0]=ka(a[0],b),a[1]=ka(a[1],b))},b.defaultStringFilter||(b.defaultStringFilter=g.colorStringFilter);var ma=function(a,b,c,d){if(null==a)return function(a){return a};var e,f=b?(a.match(la)||[""])[0]:"",g=a.split(f).join("").match(s)||[],h=a.substr(0,a.indexOf(g[0])),i=")"===a.charAt(a.length-1)?")":"",j=-1!==a.indexOf(" ")?" ":",",k=g.length,l=k>0?g[0].replace(q,""):"";return k?e=b?function(a){var b,m,n,o;if("number"==typeof a)a+=l;else if(d&&G.test(a)){for(o=a.replace(G,"|").split("|"),n=0;n<o.length;n++)o[n]=e(o[n]);return o.join(",")}if(b=(a.match(la)||[f])[0],m=a.split(b).join("").match(s)||[],n=m.length,k>n--)for(;++n<k;)m[n]=c?m[(n-1)/2|0]:g[n];return h+m.join(j)+j+b+i+(-1!==a.indexOf("inset")?" inset":"")}:function(a){var b,f,m;if("number"==typeof a)a+=l;else if(d&&G.test(a)){for(f=a.replace(G,"|").split("|"),m=0;m<f.length;m++)f[m]=e(f[m]);return f.join(",")}if(b=a.match(s)||[],m=b.length,k>m--)for(;++m<k;)b[m]=c?b[(m-1)/2|0]:g[m];return h+b.join(j)+i}:function(a){return a}},na=function(a){return a=a.split(","),function(b,c,d,e,f,g,h){var i,j=(c+"").split(" ");for(h={},i=0;4>i;i++)h[a[i]]=j[i]=j[i]||j[(i-1)/2>>0];return e.parse(b,h,f,g)}},oa=(O._setPluginRatio=function(a){this.plugin.setRatio(a);for(var b,c,d,e,f,g=this.data,h=g.proxy,i=g.firstMPT,j=1e-6;i;)b=h[i.v],i.r?b=Math.round(b):j>b&&b>-j&&(b=0),i.t[i.p]=b,i=i._next;if(g.autoRotate&&(g.autoRotate.rotation=h.rotation),1===a||0===a)for(i=g.firstMPT,f=1===a?"e":"b";i;){if(c=i.t,c.type){if(1===c.type){for(e=c.xs0+c.s+c.xs1,d=1;d<c.l;d++)e+=c["xn"+d]+c["xs"+(d+1)];c[f]=e}}else c[f]=c.s+c.xs0;i=i._next}},function(a,b,c,d,e){this.t=a,this.p=b,this.v=c,this.r=e,d&&(d._prev=this,this._next=d)}),pa=(O._parseToProxy=function(a,b,c,d,e,f){var g,h,i,j,k,l=d,m={},n={},o=c._transform,p=J;for(c._transform=null,J=b,d=k=c.parse(a,b,d,e),J=p,f&&(c._transform=o,l&&(l._prev=null,l._prev&&(l._prev._next=null)));d&&d!==l;){if(d.type<=1&&(h=d.p,n[h]=d.s+d.c,m[h]=d.s,f||(j=new oa(d,"s",h,j,d.r),d.c=0),1===d.type))for(g=d.l;--g>0;)i="xn"+g,h=d.p+"_"+i,n[h]=d.data[i],m[h]=d[i],f||(j=new oa(d,i,h,j,d.rxp[i]));d=d._next}return{proxy:m,end:n,firstMPT:j,pt:k}},O.CSSPropTween=function(a,b,d,e,g,h,i,j,k,l,m){this.t=a,this.p=b,this.s=d,this.c=e,this.n=i||b,a instanceof pa||f.push(this.n),this.r=j,this.type=h||0,k&&(this.pr=k,c=!0),this.b=void 0===l?d:l,this.e=void 0===m?d+e:m,g&&(this._next=g,g._prev=this)}),qa=function(a,b,c,d,e,f){var g=new pa(a,b,c,d-c,e,-1,f);return g.b=c,g.e=g.xs0=d,g},ra=g.parseComplex=function(a,b,c,d,e,f,g,h,i,j){c=c||f||"",g=new pa(a,b,0,0,g,j?2:1,null,!1,h,c,d),d+="";var l,m,n,o,p,s,t,u,v,w,x,y,z,A=c.split(", ").join(",").split(" "),B=d.split(", ").join(",").split(" "),C=A.length,D=k!==!1;for((-1!==d.indexOf(",")||-1!==c.indexOf(","))&&(A=A.join(" ").replace(G,", ").split(" "),B=B.join(" ").replace(G,", ").split(" "),C=A.length),C!==B.length&&(A=(f||"").split(" "),C=A.length),g.plugin=i,g.setRatio=j,la.lastIndex=0,l=0;C>l;l++)if(o=A[l],p=B[l],u=parseFloat(o),u||0===u)g.appendXtra("",u,ea(p,u),p.replace(r,""),D&&-1!==p.indexOf("px"),!0);else if(e&&la.test(o))y=","===p.charAt(p.length-1)?"),":")",z=-1!==p.indexOf("hsl")&&Q,o=ja(o,z),p=ja(p,z),v=o.length+p.length>6,v&&!Q&&0===p[3]?(g["xs"+g.l]+=g.l?" transparent":"transparent",g.e=g.e.split(B[l]).join("transparent")):(Q||(v=!1),z?g.appendXtra(v?"hsla(":"hsl(",o[0],ea(p[0],o[0]),",",!1,!0).appendXtra("",o[1],ea(p[1],o[1]),"%,",!1).appendXtra("",o[2],ea(p[2],o[2]),v?"%,":"%"+y,!1):g.appendXtra(v?"rgba(":"rgb(",o[0],p[0]-o[0],",",!0,!0).appendXtra("",o[1],p[1]-o[1],",",!0).appendXtra("",o[2],p[2]-o[2],v?",":y,!0),v&&(o=o.length<4?1:o[3],g.appendXtra("",o,(p.length<4?1:p[3])-o,y,!1))),la.lastIndex=0;else if(s=o.match(q)){if(t=p.match(r),!t||t.length!==s.length)return g;for(n=0,m=0;m<s.length;m++)x=s[m],w=o.indexOf(x,n),g.appendXtra(o.substr(n,w-n),Number(x),ea(t[m],x),"",D&&"px"===o.substr(w+x.length,2),0===m),n=w+x.length;g["xs"+g.l]+=o.substr(n)}else g["xs"+g.l]+=g.l?" "+p:p;if(-1!==d.indexOf("=")&&g.data){for(y=g.xs0+g.data.s,l=1;l<g.l;l++)y+=g["xs"+l]+g.data["xn"+l];g.e=y+g["xs"+l]}return g.l||(g.type=-1,g.xs0=g.e),g.xfirst||g},sa=9;for(j=pa.prototype,j.l=j.pr=0;--sa>0;)j["xn"+sa]=0,j["xs"+sa]="";j.xs0="",j._next=j._prev=j.xfirst=j.data=j.plugin=j.setRatio=j.rxp=null,j.appendXtra=function(a,b,c,d,e,f){var g=this,h=g.l;return g["xs"+h]+=f&&h?" "+a:a||"",c||0===h||g.plugin?(g.l++,g.type=g.setRatio?2:1,g["xs"+g.l]=d||"",h>0?(g.data["xn"+h]=b+c,g.rxp["xn"+h]=e,g["xn"+h]=b,g.plugin||(g.xfirst=new pa(g,"xn"+h,b,c,g.xfirst||g,0,g.n,e,g.pr),g.xfirst.xs0=0),g):(g.data={s:b+c},g.rxp={},g.s=b,g.c=c,g.r=e,g)):(g["xs"+h]+=b+(d||""),g)};var ta=function(a,b){b=b||{},this.p=b.prefix?V(a)||a:a,i[a]=i[this.p]=this,this.format=b.formatter||ma(b.defaultValue,b.color,b.collapsible,b.multi),b.parser&&(this.parse=b.parser),this.clrs=b.color,this.multi=b.multi,this.keyword=b.keyword,this.dflt=b.defaultValue,this.pr=b.priority||0},ua=O._registerComplexSpecialProp=function(a,b,c){"object"!=typeof b&&(b={parser:c});var d,e,f=a.split(","),g=b.defaultValue;for(c=c||[g],d=0;d<f.length;d++)b.prefix=0===d&&b.prefix,b.defaultValue=c[d]||g,e=new ta(f[d],b)},va=function(a){if(!i[a]){var b=a.charAt(0).toUpperCase()+a.substr(1)+"Plugin";ua(a,{parser:function(a,c,d,e,f,g,j){var k=h.com.greensock.plugins[b];return k?(k._cssRegister(),i[d].parse(a,c,d,e,f,g,j)):(S("Error: "+b+" js file not loaded."),f)}})}};j=ta.prototype,j.parseComplex=function(a,b,c,d,e,f){var g,h,i,j,k,l,m=this.keyword;if(this.multi&&(G.test(c)||G.test(b)?(h=b.replace(G,"|").split("|"),i=c.replace(G,"|").split("|")):m&&(h=[b],i=[c])),i){for(j=i.length>h.length?i.length:h.length,g=0;j>g;g++)b=h[g]=h[g]||this.dflt,c=i[g]=i[g]||this.dflt,m&&(k=b.indexOf(m),l=c.indexOf(m),k!==l&&(-1===l?h[g]=h[g].split(m).join(""):-1===k&&(h[g]+=" "+m)));b=h.join(", "),c=i.join(", ")}return ra(a,this.p,b,c,this.clrs,this.dflt,d,this.pr,e,f)},j.parse=function(a,b,c,d,f,g,h){return this.parseComplex(a.style,this.format(X(a,this.p,e,!1,this.dflt)),this.format(b),f,g)},g.registerSpecialProp=function(a,b,c){ua(a,{parser:function(a,d,e,f,g,h,i){var j=new pa(a,e,0,0,g,2,e,!1,c);return j.plugin=h,j.setRatio=b(a,d,f._tween,e),j},priority:c})},g.useSVGTransformAttr=m||n;var wa,xa="scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent".split(","),ya=V("transform"),za=T+"transform",Aa=V("transformOrigin"),Ba=null!==V("perspective"),Ca=O.Transform=function(){this.perspective=parseFloat(g.defaultTransformPerspective)||0,this.force3D=g.defaultForce3D!==!1&&Ba?g.defaultForce3D||"auto":!1},Da=window.SVGElement,Ea=function(a,b,c){var d,e=K.createElementNS("http://www.w3.org/2000/svg",a),f=/([a-z])([A-Z])/g;for(d in c)e.setAttributeNS(null,d.replace(f,"$1-$2").toLowerCase(),c[d]);return b.appendChild(e),e},Fa=K.documentElement,Ga=function(){var a,b,c,d=p||/Android/i.test(P)&&!window.chrome;return K.createElementNS&&!d&&(a=Ea("svg",Fa),b=Ea("rect",a,{width:100,height:50,x:100}),c=b.getBoundingClientRect().width,b.style[Aa]="50% 50%",b.style[ya]="scaleX(0.5)",d=c===b.getBoundingClientRect().width&&!(n&&Ba),Fa.removeChild(a)),d}(),Ha=function(a,b,c,d,e){var f,h,i,j,k,l,m,n,o,p,q,r,s,t,u=a._gsTransform,v=Ka(a,!0);u&&(s=u.xOrigin,t=u.yOrigin),(!d||(f=d.split(" ")).length<2)&&(m=a.getBBox(),b=da(b).split(" "),f=[(-1!==b[0].indexOf("%")?parseFloat(b[0])/100*m.width:parseFloat(b[0]))+m.x,(-1!==b[1].indexOf("%")?parseFloat(b[1])/100*m.height:parseFloat(b[1]))+m.y]),c.xOrigin=j=parseFloat(f[0]),c.yOrigin=k=parseFloat(f[1]),d&&v!==Ja&&(l=v[0],m=v[1],n=v[2],o=v[3],p=v[4],q=v[5],r=l*o-m*n,h=j*(o/r)+k*(-n/r)+(n*q-o*p)/r,i=j*(-m/r)+k*(l/r)-(l*q-m*p)/r,j=c.xOrigin=f[0]=h,k=c.yOrigin=f[1]=i),u&&(e||e!==!1&&g.defaultSmoothOrigin!==!1?(h=j-s,i=k-t,u.xOffset+=h*v[0]+i*v[2]-h,u.yOffset+=h*v[1]+i*v[3]-i):u.xOffset=u.yOffset=0),a.setAttribute("data-svg-origin",f.join(" "))},Ia=function(a){return!!(Da&&"function"==typeof a.getBBox&&a.getCTM&&(!a.parentNode||a.parentNode.getBBox&&a.parentNode.getCTM))},Ja=[1,0,0,1,0,0],Ka=function(a,b){var c,d,e,f,g,h=a._gsTransform||new Ca,i=1e5;if(ya?d=X(a,za,null,!0):a.currentStyle&&(d=a.currentStyle.filter.match(E),d=d&&4===d.length?[d[0].substr(4),Number(d[2].substr(4)),Number(d[1].substr(4)),d[3].substr(4),h.x||0,h.y||0].join(","):""),c=!d||"none"===d||"matrix(1, 0, 0, 1, 0, 0)"===d,(h.svg||a.getBBox&&Ia(a))&&(c&&-1!==(a.style[ya]+"").indexOf("matrix")&&(d=a.style[ya],c=0),e=a.getAttribute("transform"),c&&e&&(-1!==e.indexOf("matrix")?(d=e,c=0):-1!==e.indexOf("translate")&&(d="matrix(1,0,0,1,"+e.match(/(?:\-|\b)[\d\-\.e]+\b/gi).join(",")+")",c=0))),c)return Ja;for(e=(d||"").match(/(?:\-|\b)[\d\-\.e]+\b/gi)||[],sa=e.length;--sa>-1;)f=Number(e[sa]),e[sa]=(g=f-(f|=0))?(g*i+(0>g?-.5:.5)|0)/i+f:f;return b&&e.length>6?[e[0],e[1],e[4],e[5],e[12],e[13]]:e},La=O.getTransform=function(a,c,d,f){if(a._gsTransform&&d&&!f)return a._gsTransform;var h,i,j,k,l,m,n=d?a._gsTransform||new Ca:new Ca,o=n.scaleX<0,p=2e-5,q=1e5,r=Ba?parseFloat(X(a,Aa,c,!1,"0 0 0").split(" ")[2])||n.zOrigin||0:0,s=parseFloat(g.defaultTransformPerspective)||0;if(n.svg=!(!a.getBBox||!Ia(a)),n.svg&&(Ha(a,X(a,Aa,e,!1,"50% 50%")+"",n,a.getAttribute("data-svg-origin")),wa=g.useSVGTransformAttr||Ga),h=Ka(a),h!==Ja){if(16===h.length){var t,u,v,w,x,y=h[0],z=h[1],A=h[2],B=h[3],C=h[4],D=h[5],E=h[6],F=h[7],G=h[8],H=h[9],J=h[10],K=h[12],L=h[13],M=h[14],N=h[11],O=Math.atan2(E,J);n.zOrigin&&(M=-n.zOrigin,K=G*M-h[12],L=H*M-h[13],M=J*M+n.zOrigin-h[14]),n.rotationX=O*I,O&&(w=Math.cos(-O),x=Math.sin(-O),t=C*w+G*x,u=D*w+H*x,v=E*w+J*x,G=C*-x+G*w,H=D*-x+H*w,J=E*-x+J*w,N=F*-x+N*w,C=t,D=u,E=v),O=Math.atan2(-A,J),n.rotationY=O*I,O&&(w=Math.cos(-O),x=Math.sin(-O),t=y*w-G*x,u=z*w-H*x,v=A*w-J*x,H=z*x+H*w,J=A*x+J*w,N=B*x+N*w,y=t,z=u,A=v),O=Math.atan2(z,y),n.rotation=O*I,O&&(w=Math.cos(-O),x=Math.sin(-O),y=y*w+C*x,u=z*w+D*x,D=z*-x+D*w,E=A*-x+E*w,z=u),n.rotationX&&Math.abs(n.rotationX)+Math.abs(n.rotation)>359.9&&(n.rotationX=n.rotation=0,n.rotationY=180-n.rotationY),n.scaleX=(Math.sqrt(y*y+z*z)*q+.5|0)/q,n.scaleY=(Math.sqrt(D*D+H*H)*q+.5|0)/q,n.scaleZ=(Math.sqrt(E*E+J*J)*q+.5|0)/q,n.skewX=0,n.perspective=N?1/(0>N?-N:N):0,n.x=K,n.y=L,n.z=M,n.svg&&(n.x-=n.xOrigin-(n.xOrigin*y-n.yOrigin*C),n.y-=n.yOrigin-(n.yOrigin*z-n.xOrigin*D))}else if((!Ba||f||!h.length||n.x!==h[4]||n.y!==h[5]||!n.rotationX&&!n.rotationY)&&(void 0===n.x||"none"!==X(a,"display",c))){var P=h.length>=6,Q=P?h[0]:1,R=h[1]||0,S=h[2]||0,T=P?h[3]:1;n.x=h[4]||0,n.y=h[5]||0,j=Math.sqrt(Q*Q+R*R),k=Math.sqrt(T*T+S*S),l=Q||R?Math.atan2(R,Q)*I:n.rotation||0,m=S||T?Math.atan2(S,T)*I+l:n.skewX||0,Math.abs(m)>90&&Math.abs(m)<270&&(o?(j*=-1,m+=0>=l?180:-180,l+=0>=l?180:-180):(k*=-1,m+=0>=m?180:-180)),n.scaleX=j,n.scaleY=k,n.rotation=l,n.skewX=m,Ba&&(n.rotationX=n.rotationY=n.z=0,n.perspective=s,n.scaleZ=1),n.svg&&(n.x-=n.xOrigin-(n.xOrigin*Q+n.yOrigin*S),n.y-=n.yOrigin-(n.xOrigin*R+n.yOrigin*T))}n.zOrigin=r;for(i in n)n[i]<p&&n[i]>-p&&(n[i]=0)}return d&&(a._gsTransform=n,n.svg&&(wa&&a.style[ya]?b.delayedCall(.001,function(){Pa(a.style,ya)}):!wa&&a.getAttribute("transform")&&b.delayedCall(.001,function(){a.removeAttribute("transform")}))),n},Ma=function(a){var b,c,d=this.data,e=-d.rotation*H,f=e+d.skewX*H,g=1e5,h=(Math.cos(e)*d.scaleX*g|0)/g,i=(Math.sin(e)*d.scaleX*g|0)/g,j=(Math.sin(f)*-d.scaleY*g|0)/g,k=(Math.cos(f)*d.scaleY*g|0)/g,l=this.t.style,m=this.t.currentStyle;if(m){c=i,i=-j,j=-c,b=m.filter,l.filter="";var n,o,q=this.t.offsetWidth,r=this.t.offsetHeight,s="absolute"!==m.position,t="progid:DXImageTransform.Microsoft.Matrix(M11="+h+", M12="+i+", M21="+j+", M22="+k,w=d.x+q*d.xPercent/100,x=d.y+r*d.yPercent/100;if(null!=d.ox&&(n=(d.oxp?q*d.ox*.01:d.ox)-q/2,o=(d.oyp?r*d.oy*.01:d.oy)-r/2,w+=n-(n*h+o*i),x+=o-(n*j+o*k)),s?(n=q/2,o=r/2,t+=", Dx="+(n-(n*h+o*i)+w)+", Dy="+(o-(n*j+o*k)+x)+")"):t+=", sizingMethod='auto expand')",-1!==b.indexOf("DXImageTransform.Microsoft.Matrix(")?l.filter=b.replace(F,t):l.filter=t+" "+b,(0===a||1===a)&&1===h&&0===i&&0===j&&1===k&&(s&&-1===t.indexOf("Dx=0, Dy=0")||v.test(b)&&100!==parseFloat(RegExp.$1)||-1===b.indexOf(b.indexOf("Alpha"))&&l.removeAttribute("filter")),!s){var y,z,A,B=8>p?1:-1;for(n=d.ieOffsetX||0,o=d.ieOffsetY||0,d.ieOffsetX=Math.round((q-((0>h?-h:h)*q+(0>i?-i:i)*r))/2+w),d.ieOffsetY=Math.round((r-((0>k?-k:k)*r+(0>j?-j:j)*q))/2+x),sa=0;4>sa;sa++)z=ba[sa],y=m[z],c=-1!==y.indexOf("px")?parseFloat(y):Y(this.t,z,parseFloat(y),y.replace(u,""))||0,A=c!==d[z]?2>sa?-d.ieOffsetX:-d.ieOffsetY:2>sa?n-d.ieOffsetX:o-d.ieOffsetY,l[z]=(d[z]=Math.round(c-A*(0===sa||2===sa?1:B)))+"px"}}},Na=O.set3DTransformRatio=O.setTransformRatio=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,o,p,q,r,s,t,u,v,w,x,y,z=this.data,A=this.t.style,B=z.rotation,C=z.rotationX,D=z.rotationY,E=z.scaleX,F=z.scaleY,G=z.scaleZ,I=z.x,J=z.y,K=z.z,L=z.svg,M=z.perspective,N=z.force3D;if(((1===a||0===a)&&"auto"===N&&(this.tween._totalTime===this.tween._totalDuration||!this.tween._totalTime)||!N)&&!K&&!M&&!D&&!C&&1===G||wa&&L||!Ba)return void(B||z.skewX||L?(B*=H,x=z.skewX*H,y=1e5,b=Math.cos(B)*E,e=Math.sin(B)*E,c=Math.sin(B-x)*-F,f=Math.cos(B-x)*F,x&&"simple"===z.skewType&&(s=Math.tan(x),s=Math.sqrt(1+s*s),c*=s,f*=s,z.skewY&&(b*=s,e*=s)),L&&(I+=z.xOrigin-(z.xOrigin*b+z.yOrigin*c)+z.xOffset,J+=z.yOrigin-(z.xOrigin*e+z.yOrigin*f)+z.yOffset,wa&&(z.xPercent||z.yPercent)&&(p=this.t.getBBox(),I+=.01*z.xPercent*p.width,J+=.01*z.yPercent*p.height),p=1e-6,p>I&&I>-p&&(I=0),p>J&&J>-p&&(J=0)),u=(b*y|0)/y+","+(e*y|0)/y+","+(c*y|0)/y+","+(f*y|0)/y+","+I+","+J+")",L&&wa?this.t.setAttribute("transform","matrix("+u):A[ya]=(z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) matrix(":"matrix(")+u):A[ya]=(z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) matrix(":"matrix(")+E+",0,0,"+F+","+I+","+J+")");if(n&&(p=1e-4,p>E&&E>-p&&(E=G=2e-5),p>F&&F>-p&&(F=G=2e-5),!M||z.z||z.rotationX||z.rotationY||(M=0)),B||z.skewX)B*=H,q=b=Math.cos(B),r=e=Math.sin(B),z.skewX&&(B-=z.skewX*H,q=Math.cos(B),r=Math.sin(B),"simple"===z.skewType&&(s=Math.tan(z.skewX*H),s=Math.sqrt(1+s*s),q*=s,r*=s,z.skewY&&(b*=s,e*=s))),c=-r,f=q;else{if(!(D||C||1!==G||M||L))return void(A[ya]=(z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) translate3d(":"translate3d(")+I+"px,"+J+"px,"+K+"px)"+(1!==E||1!==F?" scale("+E+","+F+")":""));b=f=1,c=e=0}j=1,d=g=h=i=k=l=0,m=M?-1/M:0,o=z.zOrigin,p=1e-6,v=",",w="0",B=D*H,B&&(q=Math.cos(B),r=Math.sin(B),h=-r,k=m*-r,d=b*r,g=e*r,j=q,m*=q,b*=q,e*=q),B=C*H,B&&(q=Math.cos(B),r=Math.sin(B),s=c*q+d*r,t=f*q+g*r,i=j*r,l=m*r,d=c*-r+d*q,g=f*-r+g*q,j*=q,m*=q,c=s,f=t),1!==G&&(d*=G,g*=G,j*=G,m*=G),1!==F&&(c*=F,f*=F,i*=F,l*=F),1!==E&&(b*=E,e*=E,h*=E,k*=E),(o||L)&&(o&&(I+=d*-o,J+=g*-o,K+=j*-o+o),L&&(I+=z.xOrigin-(z.xOrigin*b+z.yOrigin*c)+z.xOffset,J+=z.yOrigin-(z.xOrigin*e+z.yOrigin*f)+z.yOffset),p>I&&I>-p&&(I=w),p>J&&J>-p&&(J=w),p>K&&K>-p&&(K=0)),u=z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) matrix3d(":"matrix3d(",u+=(p>b&&b>-p?w:b)+v+(p>e&&e>-p?w:e)+v+(p>h&&h>-p?w:h),u+=v+(p>k&&k>-p?w:k)+v+(p>c&&c>-p?w:c)+v+(p>f&&f>-p?w:f),C||D||1!==G?(u+=v+(p>i&&i>-p?w:i)+v+(p>l&&l>-p?w:l)+v+(p>d&&d>-p?w:d),u+=v+(p>g&&g>-p?w:g)+v+(p>j&&j>-p?w:j)+v+(p>m&&m>-p?w:m)+v):u+=",0,0,0,0,1,0,",u+=I+v+J+v+K+v+(M?1+-K/M:1)+")",A[ya]=u};j=Ca.prototype,j.x=j.y=j.z=j.skewX=j.skewY=j.rotation=j.rotationX=j.rotationY=j.zOrigin=j.xPercent=j.yPercent=j.xOffset=j.yOffset=0,j.scaleX=j.scaleY=j.scaleZ=1,ua("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,svgOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent,smoothOrigin",{parser:function(a,b,c,d,f,h,i){if(d._lastParsedTransform===i)return f;d._lastParsedTransform=i;var j,k,l,m,n,o,p,q,r,s,t=a._gsTransform,u=a.style,v=1e-6,w=xa.length,x=i,y={},z="transformOrigin";if(i.display?(m=X(a,"display"),u.display="block",j=La(a,e,!0,i.parseTransform),u.display=m):j=La(a,e,!0,i.parseTransform),d._transform=j,"string"==typeof x.transform&&ya)m=M.style,m[ya]=x.transform,m.display="block",m.position="absolute",K.body.appendChild(M),k=La(M,null,!1),K.body.removeChild(M),k.perspective||(k.perspective=j.perspective),null!=x.xPercent&&(k.xPercent=fa(x.xPercent,j.xPercent)),null!=x.yPercent&&(k.yPercent=fa(x.yPercent,j.yPercent));else if("object"==typeof x){if(k={scaleX:fa(null!=x.scaleX?x.scaleX:x.scale,j.scaleX),scaleY:fa(null!=x.scaleY?x.scaleY:x.scale,j.scaleY),scaleZ:fa(x.scaleZ,j.scaleZ),x:fa(x.x,j.x),y:fa(x.y,j.y),z:fa(x.z,j.z),xPercent:fa(x.xPercent,j.xPercent),yPercent:fa(x.yPercent,j.yPercent),perspective:fa(x.transformPerspective,j.perspective)},q=x.directionalRotation,null!=q)if("object"==typeof q)for(m in q)x[m]=q[m];else x.rotation=q;"string"==typeof x.x&&-1!==x.x.indexOf("%")&&(k.x=0,k.xPercent=fa(x.x,j.xPercent)),"string"==typeof x.y&&-1!==x.y.indexOf("%")&&(k.y=0,k.yPercent=fa(x.y,j.yPercent)),k.rotation=ga("rotation"in x?x.rotation:"shortRotation"in x?x.shortRotation+"_short":"rotationZ"in x?x.rotationZ:j.rotation,j.rotation,"rotation",y),Ba&&(k.rotationX=ga("rotationX"in x?x.rotationX:"shortRotationX"in x?x.shortRotationX+"_short":j.rotationX||0,j.rotationX,"rotationX",y),k.rotationY=ga("rotationY"in x?x.rotationY:"shortRotationY"in x?x.shortRotationY+"_short":j.rotationY||0,j.rotationY,"rotationY",y)),k.skewX=null==x.skewX?j.skewX:ga(x.skewX,j.skewX),k.skewY=null==x.skewY?j.skewY:ga(x.skewY,j.skewY),(l=k.skewY-j.skewY)&&(k.skewX+=l,k.rotation+=l)}for(Ba&&null!=x.force3D&&(j.force3D=x.force3D,p=!0),j.skewType=x.skewType||j.skewType||g.defaultSkewType,o=j.force3D||j.z||j.rotationX||j.rotationY||k.z||k.rotationX||k.rotationY||k.perspective,o||null==x.scale||(k.scaleZ=1);--w>-1;)c=xa[w],n=k[c]-j[c],(n>v||-v>n||null!=x[c]||null!=J[c])&&(p=!0,f=new pa(j,c,j[c],n,f),c in y&&(f.e=y[c]),f.xs0=0,f.plugin=h,d._overwriteProps.push(f.n));return n=x.transformOrigin,j.svg&&(n||x.svgOrigin)&&(r=j.xOffset,s=j.yOffset,Ha(a,da(n),k,x.svgOrigin,x.smoothOrigin),f=qa(j,"xOrigin",(t?j:k).xOrigin,k.xOrigin,f,z),f=qa(j,"yOrigin",(t?j:k).yOrigin,k.yOrigin,f,z),(r!==j.xOffset||s!==j.yOffset)&&(f=qa(j,"xOffset",t?r:j.xOffset,j.xOffset,f,z),f=qa(j,"yOffset",t?s:j.yOffset,j.yOffset,f,z)),n=wa?null:"0px 0px"),(n||Ba&&o&&j.zOrigin)&&(ya?(p=!0,c=Aa,n=(n||X(a,c,e,!1,"50% 50%"))+"",f=new pa(u,c,0,0,f,-1,z),f.b=u[c],f.plugin=h,Ba?(m=j.zOrigin,n=n.split(" "),j.zOrigin=(n.length>2&&(0===m||"0px"!==n[2])?parseFloat(n[2]):m)||0,f.xs0=f.e=n[0]+" "+(n[1]||"50%")+" 0px",f=new pa(j,"zOrigin",0,0,f,-1,f.n),f.b=m,f.xs0=f.e=j.zOrigin):f.xs0=f.e=n):da(n+"",j)),p&&(d._transformType=j.svg&&wa||!o&&3!==this._transformType?2:3),f},prefix:!0}),ua("boxShadow",{defaultValue:"0px 0px 0px 0px #999",prefix:!0,color:!0,multi:!0,keyword:"inset"}),ua("borderRadius",{defaultValue:"0px",parser:function(a,b,c,f,g,h){b=this.format(b);var i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y=["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],z=a.style;for(q=parseFloat(a.offsetWidth),r=parseFloat(a.offsetHeight),i=b.split(" "),j=0;j<y.length;j++)this.p.indexOf("border")&&(y[j]=V(y[j])),m=l=X(a,y[j],e,!1,"0px"),-1!==m.indexOf(" ")&&(l=m.split(" "),m=l[0],l=l[1]),n=k=i[j],o=parseFloat(m),t=m.substr((o+"").length),u="="===n.charAt(1),u?(p=parseInt(n.charAt(0)+"1",10),n=n.substr(2),p*=parseFloat(n),s=n.substr((p+"").length-(0>p?1:0))||""):(p=parseFloat(n),s=n.substr((p+"").length)),""===s&&(s=d[c]||t),s!==t&&(v=Y(a,"borderLeft",o,t),w=Y(a,"borderTop",o,t),"%"===s?(m=v/q*100+"%",l=w/r*100+"%"):"em"===s?(x=Y(a,"borderLeft",1,"em"),m=v/x+"em",l=w/x+"em"):(m=v+"px",l=w+"px"),u&&(n=parseFloat(m)+p+s,k=parseFloat(l)+p+s)),g=ra(z,y[j],m+" "+l,n+" "+k,!1,"0px",g);return g},prefix:!0,formatter:ma("0px 0px 0px 0px",!1,!0)}),ua("backgroundPosition",{
defaultValue:"0 0",parser:function(a,b,c,d,f,g){var h,i,j,k,l,m,n="background-position",o=e||W(a,null),q=this.format((o?p?o.getPropertyValue(n+"-x")+" "+o.getPropertyValue(n+"-y"):o.getPropertyValue(n):a.currentStyle.backgroundPositionX+" "+a.currentStyle.backgroundPositionY)||"0 0"),r=this.format(b);if(-1!==q.indexOf("%")!=(-1!==r.indexOf("%"))&&(m=X(a,"backgroundImage").replace(B,""),m&&"none"!==m)){for(h=q.split(" "),i=r.split(" "),N.setAttribute("src",m),j=2;--j>-1;)q=h[j],k=-1!==q.indexOf("%"),k!==(-1!==i[j].indexOf("%"))&&(l=0===j?a.offsetWidth-N.width:a.offsetHeight-N.height,h[j]=k?parseFloat(q)/100*l+"px":parseFloat(q)/l*100+"%");q=h.join(" ")}return this.parseComplex(a.style,q,r,f,g)},formatter:da}),ua("backgroundSize",{defaultValue:"0 0",formatter:da}),ua("perspective",{defaultValue:"0px",prefix:!0}),ua("perspectiveOrigin",{defaultValue:"50% 50%",prefix:!0}),ua("transformStyle",{prefix:!0}),ua("backfaceVisibility",{prefix:!0}),ua("userSelect",{prefix:!0}),ua("margin",{parser:na("marginTop,marginRight,marginBottom,marginLeft")}),ua("padding",{parser:na("paddingTop,paddingRight,paddingBottom,paddingLeft")}),ua("clip",{defaultValue:"rect(0px,0px,0px,0px)",parser:function(a,b,c,d,f,g){var h,i,j;return 9>p?(i=a.currentStyle,j=8>p?" ":",",h="rect("+i.clipTop+j+i.clipRight+j+i.clipBottom+j+i.clipLeft+")",b=this.format(b).split(",").join(j)):(h=this.format(X(a,this.p,e,!1,this.dflt)),b=this.format(b)),this.parseComplex(a.style,h,b,f,g)}}),ua("textShadow",{defaultValue:"0px 0px 0px #999",color:!0,multi:!0}),ua("autoRound,strictUnits",{parser:function(a,b,c,d,e){return e}}),ua("border",{defaultValue:"0px solid #000",parser:function(a,b,c,d,f,g){return this.parseComplex(a.style,this.format(X(a,"borderTopWidth",e,!1,"0px")+" "+X(a,"borderTopStyle",e,!1,"solid")+" "+X(a,"borderTopColor",e,!1,"#000")),this.format(b),f,g)},color:!0,formatter:function(a){var b=a.split(" ");return b[0]+" "+(b[1]||"solid")+" "+(a.match(la)||["#000"])[0]}}),ua("borderWidth",{parser:na("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")}),ua("float,cssFloat,styleFloat",{parser:function(a,b,c,d,e,f){var g=a.style,h="cssFloat"in g?"cssFloat":"styleFloat";return new pa(g,h,0,0,e,-1,c,!1,0,g[h],b)}});var Oa=function(a){var b,c=this.t,d=c.filter||X(this.data,"filter")||"",e=this.s+this.c*a|0;100===e&&(-1===d.indexOf("atrix(")&&-1===d.indexOf("radient(")&&-1===d.indexOf("oader(")?(c.removeAttribute("filter"),b=!X(this.data,"filter")):(c.filter=d.replace(x,""),b=!0)),b||(this.xn1&&(c.filter=d=d||"alpha(opacity="+e+")"),-1===d.indexOf("pacity")?0===e&&this.xn1||(c.filter=d+" alpha(opacity="+e+")"):c.filter=d.replace(v,"opacity="+e))};ua("opacity,alpha,autoAlpha",{defaultValue:"1",parser:function(a,b,c,d,f,g){var h=parseFloat(X(a,"opacity",e,!1,"1")),i=a.style,j="autoAlpha"===c;return"string"==typeof b&&"="===b.charAt(1)&&(b=("-"===b.charAt(0)?-1:1)*parseFloat(b.substr(2))+h),j&&1===h&&"hidden"===X(a,"visibility",e)&&0!==b&&(h=0),Q?f=new pa(i,"opacity",h,b-h,f):(f=new pa(i,"opacity",100*h,100*(b-h),f),f.xn1=j?1:0,i.zoom=1,f.type=2,f.b="alpha(opacity="+f.s+")",f.e="alpha(opacity="+(f.s+f.c)+")",f.data=a,f.plugin=g,f.setRatio=Oa),j&&(f=new pa(i,"visibility",0,0,f,-1,null,!1,0,0!==h?"inherit":"hidden",0===b?"hidden":"inherit"),f.xs0="inherit",d._overwriteProps.push(f.n),d._overwriteProps.push(c)),f}});var Pa=function(a,b){b&&(a.removeProperty?(("ms"===b.substr(0,2)||"webkit"===b.substr(0,6))&&(b="-"+b),a.removeProperty(b.replace(z,"-$1").toLowerCase())):a.removeAttribute(b))},Qa=function(a){if(this.t._gsClassPT=this,1===a||0===a){this.t.setAttribute("class",0===a?this.b:this.e);for(var b=this.data,c=this.t.style;b;)b.v?c[b.p]=b.v:Pa(c,b.p),b=b._next;1===a&&this.t._gsClassPT===this&&(this.t._gsClassPT=null)}else this.t.getAttribute("class")!==this.e&&this.t.setAttribute("class",this.e)};ua("className",{parser:function(a,b,d,f,g,h,i){var j,k,l,m,n,o=a.getAttribute("class")||"",p=a.style.cssText;if(g=f._classNamePT=new pa(a,d,0,0,g,2),g.setRatio=Qa,g.pr=-11,c=!0,g.b=o,k=$(a,e),l=a._gsClassPT){for(m={},n=l.data;n;)m[n.p]=1,n=n._next;l.setRatio(1)}return a._gsClassPT=g,g.e="="!==b.charAt(1)?b:o.replace(new RegExp("\\s*\\b"+b.substr(2)+"\\b"),"")+("+"===b.charAt(0)?" "+b.substr(2):""),a.setAttribute("class",g.e),j=_(a,k,$(a),i,m),a.setAttribute("class",o),g.data=j.firstMPT,a.style.cssText=p,g=g.xfirst=f.parse(a,j.difs,g,h)}});var Ra=function(a){if((1===a||0===a)&&this.data._totalTime===this.data._totalDuration&&"isFromStart"!==this.data.data){var b,c,d,e,f,g=this.t.style,h=i.transform.parse;if("all"===this.e)g.cssText="",e=!0;else for(b=this.e.split(" ").join("").split(","),d=b.length;--d>-1;)c=b[d],i[c]&&(i[c].parse===h?e=!0:c="transformOrigin"===c?Aa:i[c].p),Pa(g,c);e&&(Pa(g,ya),f=this.t._gsTransform,f&&(f.svg&&(this.t.removeAttribute("data-svg-origin"),this.t.removeAttribute("transform")),delete this.t._gsTransform))}};for(ua("clearProps",{parser:function(a,b,d,e,f){return f=new pa(a,d,0,0,f,2),f.setRatio=Ra,f.e=b,f.pr=-10,f.data=e._tween,c=!0,f}}),j="bezier,throwProps,physicsProps,physics2D".split(","),sa=j.length;sa--;)va(j[sa]);j=g.prototype,j._firstPT=j._lastParsedTransform=j._transform=null,j._onInitTween=function(a,b,h){if(!a.nodeType)return!1;this._target=a,this._tween=h,this._vars=b,k=b.autoRound,c=!1,d=b.suffixMap||g.suffixMap,e=W(a,""),f=this._overwriteProps;var j,n,p,q,r,s,t,u,v,x=a.style;if(l&&""===x.zIndex&&(j=X(a,"zIndex",e),("auto"===j||""===j)&&this._addLazySet(x,"zIndex",0)),"string"==typeof b&&(q=x.cssText,j=$(a,e),x.cssText=q+";"+b,j=_(a,j,$(a)).difs,!Q&&w.test(b)&&(j.opacity=parseFloat(RegExp.$1)),b=j,x.cssText=q),b.className?this._firstPT=n=i.className.parse(a,b.className,"className",this,null,null,b):this._firstPT=n=this.parse(a,b,null),this._transformType){for(v=3===this._transformType,ya?m&&(l=!0,""===x.zIndex&&(t=X(a,"zIndex",e),("auto"===t||""===t)&&this._addLazySet(x,"zIndex",0)),o&&this._addLazySet(x,"WebkitBackfaceVisibility",this._vars.WebkitBackfaceVisibility||(v?"visible":"hidden"))):x.zoom=1,p=n;p&&p._next;)p=p._next;u=new pa(a,"transform",0,0,null,2),this._linkCSSP(u,null,p),u.setRatio=ya?Na:Ma,u.data=this._transform||La(a,e,!0),u.tween=h,u.pr=-1,f.pop()}if(c){for(;n;){for(s=n._next,p=q;p&&p.pr>n.pr;)p=p._next;(n._prev=p?p._prev:r)?n._prev._next=n:q=n,(n._next=p)?p._prev=n:r=n,n=s}this._firstPT=q}return!0},j.parse=function(a,b,c,f){var g,h,j,l,m,n,o,p,q,r,s=a.style;for(g in b)n=b[g],h=i[g],h?c=h.parse(a,n,g,this,c,f,b):(m=X(a,g,e)+"",q="string"==typeof n,"color"===g||"fill"===g||"stroke"===g||-1!==g.indexOf("Color")||q&&y.test(n)?(q||(n=ja(n),n=(n.length>3?"rgba(":"rgb(")+n.join(",")+")"),c=ra(s,g,m,n,!0,"transparent",c,0,f)):!q||-1===n.indexOf(" ")&&-1===n.indexOf(",")?(j=parseFloat(m),o=j||0===j?m.substr((j+"").length):"",(""===m||"auto"===m)&&("width"===g||"height"===g?(j=ca(a,g,e),o="px"):"left"===g||"top"===g?(j=Z(a,g,e),o="px"):(j="opacity"!==g?0:1,o="")),r=q&&"="===n.charAt(1),r?(l=parseInt(n.charAt(0)+"1",10),n=n.substr(2),l*=parseFloat(n),p=n.replace(u,"")):(l=parseFloat(n),p=q?n.replace(u,""):""),""===p&&(p=g in d?d[g]:o),n=l||0===l?(r?l+j:l)+p:b[g],o!==p&&""!==p&&(l||0===l)&&j&&(j=Y(a,g,j,o),"%"===p?(j/=Y(a,g,100,"%")/100,b.strictUnits!==!0&&(m=j+"%")):"em"===p||"rem"===p||"vw"===p||"vh"===p?j/=Y(a,g,1,p):"px"!==p&&(l=Y(a,g,l,p),p="px"),r&&(l||0===l)&&(n=l+j+p)),r&&(l+=j),!j&&0!==j||!l&&0!==l?void 0!==s[g]&&(n||n+""!="NaN"&&null!=n)?(c=new pa(s,g,l||j||0,0,c,-1,g,!1,0,m,n),c.xs0="none"!==n||"display"!==g&&-1===g.indexOf("Style")?n:m):S("invalid "+g+" tween value: "+b[g]):(c=new pa(s,g,j,l-j,c,0,g,k!==!1&&("px"===p||"zIndex"===g),0,m,n),c.xs0=p)):c=ra(s,g,m,n,!0,null,c,0,f)),f&&c&&!c.plugin&&(c.plugin=f);return c},j.setRatio=function(a){var b,c,d,e=this._firstPT,f=1e-6;if(1!==a||this._tween._time!==this._tween._duration&&0!==this._tween._time)if(a||this._tween._time!==this._tween._duration&&0!==this._tween._time||this._tween._rawPrevTime===-1e-6)for(;e;){if(b=e.c*a+e.s,e.r?b=Math.round(b):f>b&&b>-f&&(b=0),e.type)if(1===e.type)if(d=e.l,2===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2;else if(3===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2+e.xn2+e.xs3;else if(4===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2+e.xn2+e.xs3+e.xn3+e.xs4;else if(5===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2+e.xn2+e.xs3+e.xn3+e.xs4+e.xn4+e.xs5;else{for(c=e.xs0+b+e.xs1,d=1;d<e.l;d++)c+=e["xn"+d]+e["xs"+(d+1)];e.t[e.p]=c}else-1===e.type?e.t[e.p]=e.xs0:e.setRatio&&e.setRatio(a);else e.t[e.p]=b+e.xs0;e=e._next}else for(;e;)2!==e.type?e.t[e.p]=e.b:e.setRatio(a),e=e._next;else for(;e;){if(2!==e.type)if(e.r&&-1!==e.type)if(b=Math.round(e.s+e.c),e.type){if(1===e.type){for(d=e.l,c=e.xs0+b+e.xs1,d=1;d<e.l;d++)c+=e["xn"+d]+e["xs"+(d+1)];e.t[e.p]=c}}else e.t[e.p]=b+e.xs0;else e.t[e.p]=e.e;else e.setRatio(a);e=e._next}},j._enableTransforms=function(a){this._transform=this._transform||La(this._target,e,!0),this._transformType=this._transform.svg&&wa||!a&&3!==this._transformType?2:3};var Sa=function(a){this.t[this.p]=this.e,this.data._linkCSSP(this,this._next,null,!0)};j._addLazySet=function(a,b,c){var d=this._firstPT=new pa(a,b,0,0,this._firstPT,2);d.e=c,d.setRatio=Sa,d.data=this},j._linkCSSP=function(a,b,c,d){return a&&(b&&(b._prev=a),a._next&&(a._next._prev=a._prev),a._prev?a._prev._next=a._next:this._firstPT===a&&(this._firstPT=a._next,d=!0),c?c._next=a:d||null!==this._firstPT||(this._firstPT=a),a._next=b,a._prev=c),a},j._kill=function(b){var c,d,e,f=b;if(b.autoAlpha||b.alpha){f={};for(d in b)f[d]=b[d];f.opacity=1,f.autoAlpha&&(f.visibility=1)}return b.className&&(c=this._classNamePT)&&(e=c.xfirst,e&&e._prev?this._linkCSSP(e._prev,c._next,e._prev._prev):e===this._firstPT&&(this._firstPT=c._next),c._next&&this._linkCSSP(c._next,c._next._next,e._prev),this._classNamePT=null),a.prototype._kill.call(this,f)};var Ta=function(a,b,c){var d,e,f,g;if(a.slice)for(e=a.length;--e>-1;)Ta(a[e],b,c);else for(d=a.childNodes,e=d.length;--e>-1;)f=d[e],g=f.type,f.style&&(b.push($(f)),c&&c.push(f)),1!==g&&9!==g&&11!==g||!f.childNodes.length||Ta(f,b,c)};return g.cascadeTo=function(a,c,d){var e,f,g,h,i=b.to(a,c,d),j=[i],k=[],l=[],m=[],n=b._internals.reservedProps;for(a=i._targets||i.target,Ta(a,k,m),i.render(c,!0,!0),Ta(a,l),i.render(0,!0,!0),i._enabled(!0),e=m.length;--e>-1;)if(f=_(m[e],k[e],l[e]),f.firstMPT){f=f.difs;for(g in d)n[g]&&(f[g]=d[g]);h={};for(g in f)h[g]=k[e][g];j.push(b.fromTo(m[e],c,h,f))}return j},a.activate([g]),g},!0),function(){var a=_gsScope._gsDefine.plugin({propName:"roundProps",version:"1.5",priority:-1,API:2,init:function(a,b,c){return this._tween=c,!0}}),b=function(a){for(;a;)a.f||a.blob||(a.r=1),a=a._next},c=a.prototype;c._onInitAllProps=function(){for(var a,c,d,e=this._tween,f=e.vars.roundProps.join?e.vars.roundProps:e.vars.roundProps.split(","),g=f.length,h={},i=e._propLookup.roundProps;--g>-1;)h[f[g]]=1;for(g=f.length;--g>-1;)for(a=f[g],c=e._firstPT;c;)d=c._next,c.pg?c.t._roundProps(h,!0):c.n===a&&(2===c.f&&c.t?b(c.t._firstPT):(this._add(c.t,a,c.s,c.c),d&&(d._prev=c._prev),c._prev?c._prev._next=d:e._firstPT===c&&(e._firstPT=d),c._next=c._prev=null,e._propLookup[a]=i)),c=d;return!1},c._add=function(a,b,c,d){this._addTween(a,b,c,c+d,b,!0),this._overwriteProps.push(b)}}(),function(){_gsScope._gsDefine.plugin({propName:"attr",API:2,version:"0.5.0",init:function(a,b,c){var d;if("function"!=typeof a.setAttribute)return!1;for(d in b)this._addTween(a,"setAttribute",a.getAttribute(d)+"",b[d]+"",d,!1,d),this._overwriteProps.push(d);return!0}})}(),_gsScope._gsDefine.plugin({propName:"directionalRotation",version:"0.2.1",API:2,init:function(a,b,c){"object"!=typeof b&&(b={rotation:b}),this.finals={};var d,e,f,g,h,i,j=b.useRadians===!0?2*Math.PI:360,k=1e-6;for(d in b)"useRadians"!==d&&(i=(b[d]+"").split("_"),e=i[0],f=parseFloat("function"!=typeof a[d]?a[d]:a[d.indexOf("set")||"function"!=typeof a["get"+d.substr(3)]?d:"get"+d.substr(3)]()),g=this.finals[d]="string"==typeof e&&"="===e.charAt(1)?f+parseInt(e.charAt(0)+"1",10)*Number(e.substr(2)):Number(e)||0,h=g-f,i.length&&(e=i.join("_"),-1!==e.indexOf("short")&&(h%=j,h!==h%(j/2)&&(h=0>h?h+j:h-j)),-1!==e.indexOf("_cw")&&0>h?h=(h+9999999999*j)%j-(h/j|0)*j:-1!==e.indexOf("ccw")&&h>0&&(h=(h-9999999999*j)%j-(h/j|0)*j)),(h>k||-k>h)&&(this._addTween(a,d,f,f+h,d),this._overwriteProps.push(d)));return!0},set:function(a){var b;if(1!==a)this._super.setRatio.call(this,a);else for(b=this._firstPT;b;)b.f?b.t[b.p](this.finals[b.p]):b.t[b.p]=this.finals[b.p],b=b._next}})._autoCSS=!0,_gsScope._gsDefine("easing.Back",["easing.Ease"],function(a){var b,c,d,e=_gsScope.GreenSockGlobals||_gsScope,f=e.com.greensock,g=2*Math.PI,h=Math.PI/2,i=f._class,j=function(b,c){var d=i("easing."+b,function(){},!0),e=d.prototype=new a;return e.constructor=d,e.getRatio=c,d},k=a.register||function(){},l=function(a,b,c,d,e){var f=i("easing."+a,{easeOut:new b,easeIn:new c,easeInOut:new d},!0);return k(f,a),f},m=function(a,b,c){this.t=a,this.v=b,c&&(this.next=c,c.prev=this,this.c=c.v-b,this.gap=c.t-a)},n=function(b,c){var d=i("easing."+b,function(a){this._p1=a||0===a?a:1.70158,this._p2=1.525*this._p1},!0),e=d.prototype=new a;return e.constructor=d,e.getRatio=c,e.config=function(a){return new d(a)},d},o=l("Back",n("BackOut",function(a){return(a-=1)*a*((this._p1+1)*a+this._p1)+1}),n("BackIn",function(a){return a*a*((this._p1+1)*a-this._p1)}),n("BackInOut",function(a){return(a*=2)<1?.5*a*a*((this._p2+1)*a-this._p2):.5*((a-=2)*a*((this._p2+1)*a+this._p2)+2)})),p=i("easing.SlowMo",function(a,b,c){b=b||0===b?b:.7,null==a?a=.7:a>1&&(a=1),this._p=1!==a?b:0,this._p1=(1-a)/2,this._p2=a,this._p3=this._p1+this._p2,this._calcEnd=c===!0},!0),q=p.prototype=new a;return q.constructor=p,q.getRatio=function(a){var b=a+(.5-a)*this._p;return a<this._p1?this._calcEnd?1-(a=1-a/this._p1)*a:b-(a=1-a/this._p1)*a*a*a*b:a>this._p3?this._calcEnd?1-(a=(a-this._p3)/this._p1)*a:b+(a-b)*(a=(a-this._p3)/this._p1)*a*a*a:this._calcEnd?1:b},p.ease=new p(.7,.7),q.config=p.config=function(a,b,c){return new p(a,b,c)},b=i("easing.SteppedEase",function(a){a=a||1,this._p1=1/a,this._p2=a+1},!0),q=b.prototype=new a,q.constructor=b,q.getRatio=function(a){return 0>a?a=0:a>=1&&(a=.999999999),(this._p2*a>>0)*this._p1},q.config=b.config=function(a){return new b(a)},c=i("easing.RoughEase",function(b){b=b||{};for(var c,d,e,f,g,h,i=b.taper||"none",j=[],k=0,l=0|(b.points||20),n=l,o=b.randomize!==!1,p=b.clamp===!0,q=b.template instanceof a?b.template:null,r="number"==typeof b.strength?.4*b.strength:.4;--n>-1;)c=o?Math.random():1/l*n,d=q?q.getRatio(c):c,"none"===i?e=r:"out"===i?(f=1-c,e=f*f*r):"in"===i?e=c*c*r:.5>c?(f=2*c,e=f*f*.5*r):(f=2*(1-c),e=f*f*.5*r),o?d+=Math.random()*e-.5*e:n%2?d+=.5*e:d-=.5*e,p&&(d>1?d=1:0>d&&(d=0)),j[k++]={x:c,y:d};for(j.sort(function(a,b){return a.x-b.x}),h=new m(1,1,null),n=l;--n>-1;)g=j[n],h=new m(g.x,g.y,h);this._prev=new m(0,0,0!==h.t?h:h.next)},!0),q=c.prototype=new a,q.constructor=c,q.getRatio=function(a){var b=this._prev;if(a>b.t){for(;b.next&&a>=b.t;)b=b.next;b=b.prev}else for(;b.prev&&a<=b.t;)b=b.prev;return this._prev=b,b.v+(a-b.t)/b.gap*b.c},q.config=function(a){return new c(a)},c.ease=new c,l("Bounce",j("BounceOut",function(a){return 1/2.75>a?7.5625*a*a:2/2.75>a?7.5625*(a-=1.5/2.75)*a+.75:2.5/2.75>a?7.5625*(a-=2.25/2.75)*a+.9375:7.5625*(a-=2.625/2.75)*a+.984375}),j("BounceIn",function(a){return(a=1-a)<1/2.75?1-7.5625*a*a:2/2.75>a?1-(7.5625*(a-=1.5/2.75)*a+.75):2.5/2.75>a?1-(7.5625*(a-=2.25/2.75)*a+.9375):1-(7.5625*(a-=2.625/2.75)*a+.984375)}),j("BounceInOut",function(a){var b=.5>a;return a=b?1-2*a:2*a-1,a=1/2.75>a?7.5625*a*a:2/2.75>a?7.5625*(a-=1.5/2.75)*a+.75:2.5/2.75>a?7.5625*(a-=2.25/2.75)*a+.9375:7.5625*(a-=2.625/2.75)*a+.984375,b?.5*(1-a):.5*a+.5})),l("Circ",j("CircOut",function(a){return Math.sqrt(1-(a-=1)*a)}),j("CircIn",function(a){return-(Math.sqrt(1-a*a)-1)}),j("CircInOut",function(a){return(a*=2)<1?-.5*(Math.sqrt(1-a*a)-1):.5*(Math.sqrt(1-(a-=2)*a)+1)})),d=function(b,c,d){var e=i("easing."+b,function(a,b){this._p1=a>=1?a:1,this._p2=(b||d)/(1>a?a:1),this._p3=this._p2/g*(Math.asin(1/this._p1)||0),this._p2=g/this._p2},!0),f=e.prototype=new a;return f.constructor=e,f.getRatio=c,f.config=function(a,b){return new e(a,b)},e},l("Elastic",d("ElasticOut",function(a){return this._p1*Math.pow(2,-10*a)*Math.sin((a-this._p3)*this._p2)+1},.3),d("ElasticIn",function(a){return-(this._p1*Math.pow(2,10*(a-=1))*Math.sin((a-this._p3)*this._p2))},.3),d("ElasticInOut",function(a){return(a*=2)<1?-.5*(this._p1*Math.pow(2,10*(a-=1))*Math.sin((a-this._p3)*this._p2)):this._p1*Math.pow(2,-10*(a-=1))*Math.sin((a-this._p3)*this._p2)*.5+1},.45)),l("Expo",j("ExpoOut",function(a){return 1-Math.pow(2,-10*a)}),j("ExpoIn",function(a){return Math.pow(2,10*(a-1))-.001}),j("ExpoInOut",function(a){return(a*=2)<1?.5*Math.pow(2,10*(a-1)):.5*(2-Math.pow(2,-10*(a-1)))})),l("Sine",j("SineOut",function(a){return Math.sin(a*h)}),j("SineIn",function(a){return-Math.cos(a*h)+1}),j("SineInOut",function(a){return-.5*(Math.cos(Math.PI*a)-1)})),i("easing.EaseLookup",{find:function(b){return a.map[b]}},!0),k(e.SlowMo,"SlowMo","ease,"),k(c,"RoughEase","ease,"),k(b,"SteppedEase","ease,"),o},!0)}),_gsScope._gsDefine&&_gsScope._gsQueue.pop()(),function(a,b){"use strict";var c=a.GreenSockGlobals=a.GreenSockGlobals||a;if(!c.TweenLite){var d,e,f,g,h,i=function(a){var b,d=a.split("."),e=c;for(b=0;b<d.length;b++)e[d[b]]=e=e[d[b]]||{};return e},j=i("com.greensock"),k=1e-10,l=function(a){var b,c=[],d=a.length;for(b=0;b!==d;c.push(a[b++]));return c},m=function(){},n=function(){var a=Object.prototype.toString,b=a.call([]);return function(c){return null!=c&&(c instanceof Array||"object"==typeof c&&!!c.push&&a.call(c)===b)}}(),o={},p=function(d,e,f,g){this.sc=o[d]?o[d].sc:[],o[d]=this,this.gsClass=null,this.func=f;var h=[];this.check=function(j){for(var k,l,m,n,q,r=e.length,s=r;--r>-1;)(k=o[e[r]]||new p(e[r],[])).gsClass?(h[r]=k.gsClass,s--):j&&k.sc.push(this);if(0===s&&f)for(l=("com.greensock."+d).split("."),m=l.pop(),n=i(l.join("."))[m]=this.gsClass=f.apply(f,h),g&&(c[m]=n,q="undefined"!=typeof module&&module.exports,!q&&"function"==typeof define&&define.amd?define((a.GreenSockAMDPath?a.GreenSockAMDPath+"/":"")+d.split(".").pop(),[],function(){return n}):d===b&&q&&(module.exports=n)),r=0;r<this.sc.length;r++)this.sc[r].check()},this.check(!0)},q=a._gsDefine=function(a,b,c,d){return new p(a,b,c,d)},r=j._class=function(a,b,c){return b=b||function(){},q(a,[],function(){return b},c),b};q.globals=c;var s=[0,0,1,1],t=[],u=r("easing.Ease",function(a,b,c,d){this._func=a,this._type=c||0,this._power=d||0,this._params=b?s.concat(b):s},!0),v=u.map={},w=u.register=function(a,b,c,d){for(var e,f,g,h,i=b.split(","),k=i.length,l=(c||"easeIn,easeOut,easeInOut").split(",");--k>-1;)for(f=i[k],e=d?r("easing."+f,null,!0):j.easing[f]||{},g=l.length;--g>-1;)h=l[g],v[f+"."+h]=v[h+f]=e[h]=a.getRatio?a:a[h]||new a};for(f=u.prototype,f._calcEnd=!1,f.getRatio=function(a){if(this._func)return this._params[0]=a,this._func.apply(null,this._params);var b=this._type,c=this._power,d=1===b?1-a:2===b?a:.5>a?2*a:2*(1-a);return 1===c?d*=d:2===c?d*=d*d:3===c?d*=d*d*d:4===c&&(d*=d*d*d*d),1===b?1-d:2===b?d:.5>a?d/2:1-d/2},d=["Linear","Quad","Cubic","Quart","Quint,Strong"],e=d.length;--e>-1;)f=d[e]+",Power"+e,w(new u(null,null,1,e),f,"easeOut",!0),w(new u(null,null,2,e),f,"easeIn"+(0===e?",easeNone":"")),w(new u(null,null,3,e),f,"easeInOut");v.linear=j.easing.Linear.easeIn,v.swing=j.easing.Quad.easeInOut;var x=r("events.EventDispatcher",function(a){this._listeners={},this._eventTarget=a||this});f=x.prototype,f.addEventListener=function(a,b,c,d,e){e=e||0;var f,i,j=this._listeners[a],k=0;for(null==j&&(this._listeners[a]=j=[]),i=j.length;--i>-1;)f=j[i],f.c===b&&f.s===c?j.splice(i,1):0===k&&f.pr<e&&(k=i+1);j.splice(k,0,{c:b,s:c,up:d,pr:e}),this!==g||h||g.wake()},f.removeEventListener=function(a,b){var c,d=this._listeners[a];if(d)for(c=d.length;--c>-1;)if(d[c].c===b)return void d.splice(c,1)},f.dispatchEvent=function(a){var b,c,d,e=this._listeners[a];if(e)for(b=e.length,c=this._eventTarget;--b>-1;)d=e[b],d&&(d.up?d.c.call(d.s||c,{type:a,target:c}):d.c.call(d.s||c))};var y=a.requestAnimationFrame,z=a.cancelAnimationFrame,A=Date.now||function(){return(new Date).getTime()},B=A();for(d=["ms","moz","webkit","o"],e=d.length;--e>-1&&!y;)y=a[d[e]+"RequestAnimationFrame"],z=a[d[e]+"CancelAnimationFrame"]||a[d[e]+"CancelRequestAnimationFrame"];r("Ticker",function(a,b){var c,d,e,f,i,j=this,l=A(),n=b!==!1&&y?"auto":!1,o=500,p=33,q="tick",r=function(a){var b,g,h=A()-B;h>o&&(l+=h-p),B+=h,j.time=(B-l)/1e3,b=j.time-i,(!c||b>0||a===!0)&&(j.frame++,i+=b+(b>=f?.004:f-b),g=!0),a!==!0&&(e=d(r)),g&&j.dispatchEvent(q)};x.call(j),j.time=j.frame=0,j.tick=function(){r(!0)},j.lagSmoothing=function(a,b){o=a||1/k,p=Math.min(b,o,0)},j.sleep=function(){null!=e&&(n&&z?z(e):clearTimeout(e),d=m,e=null,j===g&&(h=!1))},j.wake=function(a){null!==e?j.sleep():a?l+=-B+(B=A()):j.frame>10&&(B=A()-o+5),d=0===c?m:n&&y?y:function(a){return setTimeout(a,1e3*(i-j.time)+1|0)},j===g&&(h=!0),r(2)},j.fps=function(a){return arguments.length?(c=a,f=1/(c||60),i=this.time+f,void j.wake()):c},j.useRAF=function(a){return arguments.length?(j.sleep(),n=a,void j.fps(c)):n},j.fps(a),setTimeout(function(){"auto"===n&&j.frame<5&&"hidden"!==document.visibilityState&&j.useRAF(!1)},1500)}),f=j.Ticker.prototype=new j.events.EventDispatcher,f.constructor=j.Ticker;var C=r("core.Animation",function(a,b){if(this.vars=b=b||{},this._duration=this._totalDuration=a||0,this._delay=Number(b.delay)||0,this._timeScale=1,this._active=b.immediateRender===!0,this.data=b.data,this._reversed=b.reversed===!0,V){h||g.wake();var c=this.vars.useFrames?U:V;c.add(this,c._time),this.vars.paused&&this.paused(!0)}});g=C.ticker=new j.Ticker,f=C.prototype,f._dirty=f._gc=f._initted=f._paused=!1,f._totalTime=f._time=0,f._rawPrevTime=-1,f._next=f._last=f._onUpdate=f._timeline=f.timeline=null,f._paused=!1;var D=function(){h&&A()-B>2e3&&g.wake(),setTimeout(D,2e3)};D(),f.play=function(a,b){return null!=a&&this.seek(a,b),this.reversed(!1).paused(!1)},f.pause=function(a,b){return null!=a&&this.seek(a,b),this.paused(!0)},f.resume=function(a,b){return null!=a&&this.seek(a,b),this.paused(!1)},f.seek=function(a,b){return this.totalTime(Number(a),b!==!1)},f.restart=function(a,b){return this.reversed(!1).paused(!1).totalTime(a?-this._delay:0,b!==!1,!0)},f.reverse=function(a,b){return null!=a&&this.seek(a||this.totalDuration(),b),this.reversed(!0).paused(!1)},f.render=function(a,b,c){},f.invalidate=function(){return this._time=this._totalTime=0,this._initted=this._gc=!1,this._rawPrevTime=-1,(this._gc||!this.timeline)&&this._enabled(!0),this},f.isActive=function(){var a,b=this._timeline,c=this._startTime;return!b||!this._gc&&!this._paused&&b.isActive()&&(a=b.rawTime())>=c&&a<c+this.totalDuration()/this._timeScale},f._enabled=function(a,b){return h||g.wake(),this._gc=!a,this._active=this.isActive(),b!==!0&&(a&&!this.timeline?this._timeline.add(this,this._startTime-this._delay):!a&&this.timeline&&this._timeline._remove(this,!0)),!1},f._kill=function(a,b){return this._enabled(!1,!1)},f.kill=function(a,b){return this._kill(a,b),this},f._uncache=function(a){for(var b=a?this:this.timeline;b;)b._dirty=!0,b=b.timeline;return this},f._swapSelfInParams=function(a){for(var b=a.length,c=a.concat();--b>-1;)"{self}"===a[b]&&(c[b]=this);return c},f._callback=function(a){var b=this.vars;b[a].apply(b[a+"Scope"]||b.callbackScope||this,b[a+"Params"]||t)},f.eventCallback=function(a,b,c,d){if("on"===(a||"").substr(0,2)){var e=this.vars;if(1===arguments.length)return e[a];null==b?delete e[a]:(e[a]=b,e[a+"Params"]=n(c)&&-1!==c.join("").indexOf("{self}")?this._swapSelfInParams(c):c,e[a+"Scope"]=d),"onUpdate"===a&&(this._onUpdate=b)}return this},f.delay=function(a){return arguments.length?(this._timeline.smoothChildTiming&&this.startTime(this._startTime+a-this._delay),this._delay=a,this):this._delay},f.duration=function(a){return arguments.length?(this._duration=this._totalDuration=a,this._uncache(!0),this._timeline.smoothChildTiming&&this._time>0&&this._time<this._duration&&0!==a&&this.totalTime(this._totalTime*(a/this._duration),!0),this):(this._dirty=!1,this._duration)},f.totalDuration=function(a){return this._dirty=!1,arguments.length?this.duration(a):this._totalDuration},f.time=function(a,b){return arguments.length?(this._dirty&&this.totalDuration(),this.totalTime(a>this._duration?this._duration:a,b)):this._time},f.totalTime=function(a,b,c){if(h||g.wake(),!arguments.length)return this._totalTime;if(this._timeline){if(0>a&&!c&&(a+=this.totalDuration()),this._timeline.smoothChildTiming){this._dirty&&this.totalDuration();var d=this._totalDuration,e=this._timeline;if(a>d&&!c&&(a=d),this._startTime=(this._paused?this._pauseTime:e._time)-(this._reversed?d-a:a)/this._timeScale,e._dirty||this._uncache(!1),e._timeline)for(;e._timeline;)e._timeline._time!==(e._startTime+e._totalTime)/e._timeScale&&e.totalTime(e._totalTime,!0),e=e._timeline}this._gc&&this._enabled(!0,!1),(this._totalTime!==a||0===this._duration)&&(I.length&&X(),this.render(a,b,!1),I.length&&X())}return this},f.progress=f.totalProgress=function(a,b){var c=this.duration();return arguments.length?this.totalTime(c*a,b):c?this._time/c:this.ratio},f.startTime=function(a){return arguments.length?(a!==this._startTime&&(this._startTime=a,this.timeline&&this.timeline._sortChildren&&this.timeline.add(this,a-this._delay)),this):this._startTime},f.endTime=function(a){return this._startTime+(0!=a?this.totalDuration():this.duration())/this._timeScale},f.timeScale=function(a){if(!arguments.length)return this._timeScale;if(a=a||k,this._timeline&&this._timeline.smoothChildTiming){var b=this._pauseTime,c=b||0===b?b:this._timeline.totalTime();this._startTime=c-(c-this._startTime)*this._timeScale/a}return this._timeScale=a,this._uncache(!1)},f.reversed=function(a){return arguments.length?(a!=this._reversed&&(this._reversed=a,this.totalTime(this._timeline&&!this._timeline.smoothChildTiming?this.totalDuration()-this._totalTime:this._totalTime,!0)),this):this._reversed},f.paused=function(a){if(!arguments.length)return this._paused;var b,c,d=this._timeline;return a!=this._paused&&d&&(h||a||g.wake(),b=d.rawTime(),c=b-this._pauseTime,!a&&d.smoothChildTiming&&(this._startTime+=c,this._uncache(!1)),this._pauseTime=a?b:null,this._paused=a,this._active=this.isActive(),!a&&0!==c&&this._initted&&this.duration()&&(b=d.smoothChildTiming?this._totalTime:(b-this._startTime)/this._timeScale,this.render(b,b===this._totalTime,!0))),this._gc&&!a&&this._enabled(!0,!1),this};var E=r("core.SimpleTimeline",function(a){C.call(this,0,a),this.autoRemoveChildren=this.smoothChildTiming=!0});f=E.prototype=new C,f.constructor=E,f.kill()._gc=!1,f._first=f._last=f._recent=null,f._sortChildren=!1,f.add=f.insert=function(a,b,c,d){var e,f;if(a._startTime=Number(b||0)+a._delay,a._paused&&this!==a._timeline&&(a._pauseTime=a._startTime+(this.rawTime()-a._startTime)/a._timeScale),a.timeline&&a.timeline._remove(a,!0),a.timeline=a._timeline=this,a._gc&&a._enabled(!0,!0),e=this._last,this._sortChildren)for(f=a._startTime;e&&e._startTime>f;)e=e._prev;return e?(a._next=e._next,e._next=a):(a._next=this._first,this._first=a),a._next?a._next._prev=a:this._last=a,a._prev=e,this._recent=a,this._timeline&&this._uncache(!0),this},f._remove=function(a,b){return a.timeline===this&&(b||a._enabled(!1,!0),a._prev?a._prev._next=a._next:this._first===a&&(this._first=a._next),a._next?a._next._prev=a._prev:this._last===a&&(this._last=a._prev),a._next=a._prev=a.timeline=null,a===this._recent&&(this._recent=this._last),this._timeline&&this._uncache(!0)),this},f.render=function(a,b,c){var d,e=this._first;for(this._totalTime=this._time=this._rawPrevTime=a;e;)d=e._next,(e._active||a>=e._startTime&&!e._paused)&&(e._reversed?e.render((e._dirty?e.totalDuration():e._totalDuration)-(a-e._startTime)*e._timeScale,b,c):e.render((a-e._startTime)*e._timeScale,b,c)),e=d},f.rawTime=function(){return h||g.wake(),this._totalTime};var F=r("TweenLite",function(b,c,d){if(C.call(this,c,d),this.render=F.prototype.render,null==b)throw"Cannot tween a null target.";this.target=b="string"!=typeof b?b:F.selector(b)||b;var e,f,g,h=b.jquery||b.length&&b!==a&&b[0]&&(b[0]===a||b[0].nodeType&&b[0].style&&!b.nodeType),i=this.vars.overwrite;if(this._overwrite=i=null==i?T[F.defaultOverwrite]:"number"==typeof i?i>>0:T[i],(h||b instanceof Array||b.push&&n(b))&&"number"!=typeof b[0])for(this._targets=g=l(b),this._propLookup=[],this._siblings=[],e=0;e<g.length;e++)f=g[e],f?"string"!=typeof f?f.length&&f!==a&&f[0]&&(f[0]===a||f[0].nodeType&&f[0].style&&!f.nodeType)?(g.splice(e--,1),this._targets=g=g.concat(l(f))):(this._siblings[e]=Y(f,this,!1),1===i&&this._siblings[e].length>1&&$(f,this,null,1,this._siblings[e])):(f=g[e--]=F.selector(f),"string"==typeof f&&g.splice(e+1,1)):g.splice(e--,1);else this._propLookup={},this._siblings=Y(b,this,!1),1===i&&this._siblings.length>1&&$(b,this,null,1,this._siblings);(this.vars.immediateRender||0===c&&0===this._delay&&this.vars.immediateRender!==!1)&&(this._time=-k,this.render(-this._delay))},!0),G=function(b){return b&&b.length&&b!==a&&b[0]&&(b[0]===a||b[0].nodeType&&b[0].style&&!b.nodeType)},H=function(a,b){var c,d={};for(c in a)S[c]||c in b&&"transform"!==c&&"x"!==c&&"y"!==c&&"width"!==c&&"height"!==c&&"className"!==c&&"border"!==c||!(!P[c]||P[c]&&P[c]._autoCSS)||(d[c]=a[c],delete a[c]);a.css=d};f=F.prototype=new C,f.constructor=F,f.kill()._gc=!1,f.ratio=0,f._firstPT=f._targets=f._overwrittenProps=f._startAt=null,f._notifyPluginsOfEnabled=f._lazy=!1,F.version="1.18.2",F.defaultEase=f._ease=new u(null,null,1,1),F.defaultOverwrite="auto",F.ticker=g,F.autoSleep=120,F.lagSmoothing=function(a,b){g.lagSmoothing(a,b)},F.selector=a.$||a.jQuery||function(b){var c=a.$||a.jQuery;return c?(F.selector=c,c(b)):"undefined"==typeof document?b:document.querySelectorAll?document.querySelectorAll(b):document.getElementById("#"===b.charAt(0)?b.substr(1):b)};var I=[],J={},K=/(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,L=function(a){for(var b,c=this._firstPT,d=1e-6;c;)b=c.blob?a?this.join(""):this.start:c.c*a+c.s,c.r?b=Math.round(b):d>b&&b>-d&&(b=0),c.f?c.fp?c.t[c.p](c.fp,b):c.t[c.p](b):c.t[c.p]=b,c=c._next},M=function(a,b,c,d){var e,f,g,h,i,j,k,l=[a,b],m=0,n="",o=0;for(l.start=a,c&&(c(l),a=l[0],b=l[1]),l.length=0,e=a.match(K)||[],f=b.match(K)||[],d&&(d._next=null,d.blob=1,l._firstPT=d),i=f.length,h=0;i>h;h++)k=f[h],j=b.substr(m,b.indexOf(k,m)-m),n+=j||!h?j:",",m+=j.length,o?o=(o+1)%5:"rgba("===j.substr(-5)&&(o=1),k===e[h]||e.length<=h?n+=k:(n&&(l.push(n),n=""),g=parseFloat(e[h]),l.push(g),l._firstPT={_next:l._firstPT,t:l,p:l.length-1,s:g,c:("="===k.charAt(1)?parseInt(k.charAt(0)+"1",10)*parseFloat(k.substr(2)):parseFloat(k)-g)||0,f:0,r:o&&4>o}),m+=k.length;return n+=b.substr(m),n&&l.push(n),l.setRatio=L,l},N=function(a,b,c,d,e,f,g,h){var i,j,k="get"===c?a[b]:c,l=typeof a[b],m="string"==typeof d&&"="===d.charAt(1),n={t:a,p:b,s:k,f:"function"===l,pg:0,n:e||b,r:f,pr:0,c:m?parseInt(d.charAt(0)+"1",10)*parseFloat(d.substr(2)):parseFloat(d)-k||0};return"number"!==l&&("function"===l&&"get"===c&&(j=b.indexOf("set")||"function"!=typeof a["get"+b.substr(3)]?b:"get"+b.substr(3),n.s=k=g?a[j](g):a[j]()),"string"==typeof k&&(g||isNaN(k))?(n.fp=g,i=M(k,d,h||F.defaultStringFilter,n),n={t:i,p:"setRatio",s:0,c:1,f:2,pg:0,n:e||b,pr:0}):m||(n.s=parseFloat(k),n.c=parseFloat(d)-n.s||0)),n.c?((n._next=this._firstPT)&&(n._next._prev=n),this._firstPT=n,n):void 0},O=F._internals={isArray:n,isSelector:G,lazyTweens:I,blobDif:M},P=F._plugins={},Q=O.tweenLookup={},R=0,S=O.reservedProps={ease:1,delay:1,overwrite:1,onComplete:1,onCompleteParams:1,onCompleteScope:1,useFrames:1,runBackwards:1,startAt:1,onUpdate:1,onUpdateParams:1,onUpdateScope:1,onStart:1,onStartParams:1,onStartScope:1,onReverseComplete:1,onReverseCompleteParams:1,onReverseCompleteScope:1,onRepeat:1,onRepeatParams:1,onRepeatScope:1,easeParams:1,yoyo:1,immediateRender:1,repeat:1,repeatDelay:1,data:1,paused:1,reversed:1,autoCSS:1,lazy:1,onOverwrite:1,callbackScope:1,stringFilter:1},T={none:0,all:1,auto:2,concurrent:3,allOnStart:4,preexisting:5,"true":1,"false":0},U=C._rootFramesTimeline=new E,V=C._rootTimeline=new E,W=30,X=O.lazyRender=function(){
var a,b=I.length;for(J={};--b>-1;)a=I[b],a&&a._lazy!==!1&&(a.render(a._lazy[0],a._lazy[1],!0),a._lazy=!1);I.length=0};V._startTime=g.time,U._startTime=g.frame,V._active=U._active=!0,setTimeout(X,1),C._updateRoot=F.render=function(){var a,b,c;if(I.length&&X(),V.render((g.time-V._startTime)*V._timeScale,!1,!1),U.render((g.frame-U._startTime)*U._timeScale,!1,!1),I.length&&X(),g.frame>=W){W=g.frame+(parseInt(F.autoSleep,10)||120);for(c in Q){for(b=Q[c].tweens,a=b.length;--a>-1;)b[a]._gc&&b.splice(a,1);0===b.length&&delete Q[c]}if(c=V._first,(!c||c._paused)&&F.autoSleep&&!U._first&&1===g._listeners.tick.length){for(;c&&c._paused;)c=c._next;c||g.sleep()}}},g.addEventListener("tick",C._updateRoot);var Y=function(a,b,c){var d,e,f=a._gsTweenID;if(Q[f||(a._gsTweenID=f="t"+R++)]||(Q[f]={target:a,tweens:[]}),b&&(d=Q[f].tweens,d[e=d.length]=b,c))for(;--e>-1;)d[e]===b&&d.splice(e,1);return Q[f].tweens},Z=function(a,b,c,d){var e,f,g=a.vars.onOverwrite;return g&&(e=g(a,b,c,d)),g=F.onOverwrite,g&&(f=g(a,b,c,d)),e!==!1&&f!==!1},$=function(a,b,c,d,e){var f,g,h,i;if(1===d||d>=4){for(i=e.length,f=0;i>f;f++)if((h=e[f])!==b)h._gc||h._kill(null,a,b)&&(g=!0);else if(5===d)break;return g}var j,l=b._startTime+k,m=[],n=0,o=0===b._duration;for(f=e.length;--f>-1;)(h=e[f])===b||h._gc||h._paused||(h._timeline!==b._timeline?(j=j||_(b,0,o),0===_(h,j,o)&&(m[n++]=h)):h._startTime<=l&&h._startTime+h.totalDuration()/h._timeScale>l&&((o||!h._initted)&&l-h._startTime<=2e-10||(m[n++]=h)));for(f=n;--f>-1;)if(h=m[f],2===d&&h._kill(c,a,b)&&(g=!0),2!==d||!h._firstPT&&h._initted){if(2!==d&&!Z(h,b))continue;h._enabled(!1,!1)&&(g=!0)}return g},_=function(a,b,c){for(var d=a._timeline,e=d._timeScale,f=a._startTime;d._timeline;){if(f+=d._startTime,e*=d._timeScale,d._paused)return-100;d=d._timeline}return f/=e,f>b?f-b:c&&f===b||!a._initted&&2*k>f-b?k:(f+=a.totalDuration()/a._timeScale/e)>b+k?0:f-b-k};f._init=function(){var a,b,c,d,e,f=this.vars,g=this._overwrittenProps,h=this._duration,i=!!f.immediateRender,j=f.ease;if(f.startAt){this._startAt&&(this._startAt.render(-1,!0),this._startAt.kill()),e={};for(d in f.startAt)e[d]=f.startAt[d];if(e.overwrite=!1,e.immediateRender=!0,e.lazy=i&&f.lazy!==!1,e.startAt=e.delay=null,this._startAt=F.to(this.target,0,e),i)if(this._time>0)this._startAt=null;else if(0!==h)return}else if(f.runBackwards&&0!==h)if(this._startAt)this._startAt.render(-1,!0),this._startAt.kill(),this._startAt=null;else{0!==this._time&&(i=!1),c={};for(d in f)S[d]&&"autoCSS"!==d||(c[d]=f[d]);if(c.overwrite=0,c.data="isFromStart",c.lazy=i&&f.lazy!==!1,c.immediateRender=i,this._startAt=F.to(this.target,0,c),i){if(0===this._time)return}else this._startAt._init(),this._startAt._enabled(!1),this.vars.immediateRender&&(this._startAt=null)}if(this._ease=j=j?j instanceof u?j:"function"==typeof j?new u(j,f.easeParams):v[j]||F.defaultEase:F.defaultEase,f.easeParams instanceof Array&&j.config&&(this._ease=j.config.apply(j,f.easeParams)),this._easeType=this._ease._type,this._easePower=this._ease._power,this._firstPT=null,this._targets)for(a=this._targets.length;--a>-1;)this._initProps(this._targets[a],this._propLookup[a]={},this._siblings[a],g?g[a]:null)&&(b=!0);else b=this._initProps(this.target,this._propLookup,this._siblings,g);if(b&&F._onPluginEvent("_onInitAllProps",this),g&&(this._firstPT||"function"!=typeof this.target&&this._enabled(!1,!1)),f.runBackwards)for(c=this._firstPT;c;)c.s+=c.c,c.c=-c.c,c=c._next;this._onUpdate=f.onUpdate,this._initted=!0},f._initProps=function(b,c,d,e){var f,g,h,i,j,k;if(null==b)return!1;J[b._gsTweenID]&&X(),this.vars.css||b.style&&b!==a&&b.nodeType&&P.css&&this.vars.autoCSS!==!1&&H(this.vars,b);for(f in this.vars)if(k=this.vars[f],S[f])k&&(k instanceof Array||k.push&&n(k))&&-1!==k.join("").indexOf("{self}")&&(this.vars[f]=k=this._swapSelfInParams(k,this));else if(P[f]&&(i=new P[f])._onInitTween(b,this.vars[f],this)){for(this._firstPT=j={_next:this._firstPT,t:i,p:"setRatio",s:0,c:1,f:1,n:f,pg:1,pr:i._priority},g=i._overwriteProps.length;--g>-1;)c[i._overwriteProps[g]]=this._firstPT;(i._priority||i._onInitAllProps)&&(h=!0),(i._onDisable||i._onEnable)&&(this._notifyPluginsOfEnabled=!0),j._next&&(j._next._prev=j)}else c[f]=N.call(this,b,f,"get",k,f,0,null,this.vars.stringFilter);return e&&this._kill(e,b)?this._initProps(b,c,d,e):this._overwrite>1&&this._firstPT&&d.length>1&&$(b,this,c,this._overwrite,d)?(this._kill(c,b),this._initProps(b,c,d,e)):(this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration)&&(J[b._gsTweenID]=!0),h)},f.render=function(a,b,c){var d,e,f,g,h=this._time,i=this._duration,j=this._rawPrevTime;if(a>=i-1e-7)this._totalTime=this._time=i,this.ratio=this._ease._calcEnd?this._ease.getRatio(1):1,this._reversed||(d=!0,e="onComplete",c=c||this._timeline.autoRemoveChildren),0===i&&(this._initted||!this.vars.lazy||c)&&(this._startTime===this._timeline._duration&&(a=0),(0>j||0>=a&&a>=-1e-7||j===k&&"isPause"!==this.data)&&j!==a&&(c=!0,j>k&&(e="onReverseComplete")),this._rawPrevTime=g=!b||a||j===a?a:k);else if(1e-7>a)this._totalTime=this._time=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0,(0!==h||0===i&&j>0)&&(e="onReverseComplete",d=this._reversed),0>a&&(this._active=!1,0===i&&(this._initted||!this.vars.lazy||c)&&(j>=0&&(j!==k||"isPause"!==this.data)&&(c=!0),this._rawPrevTime=g=!b||a||j===a?a:k)),this._initted||(c=!0);else if(this._totalTime=this._time=a,this._easeType){var l=a/i,m=this._easeType,n=this._easePower;(1===m||3===m&&l>=.5)&&(l=1-l),3===m&&(l*=2),1===n?l*=l:2===n?l*=l*l:3===n?l*=l*l*l:4===n&&(l*=l*l*l*l),1===m?this.ratio=1-l:2===m?this.ratio=l:.5>a/i?this.ratio=l/2:this.ratio=1-l/2}else this.ratio=this._ease.getRatio(a/i);if(this._time!==h||c){if(!this._initted){if(this._init(),!this._initted||this._gc)return;if(!c&&this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration))return this._time=this._totalTime=h,this._rawPrevTime=j,I.push(this),void(this._lazy=[a,b]);this._time&&!d?this.ratio=this._ease.getRatio(this._time/i):d&&this._ease._calcEnd&&(this.ratio=this._ease.getRatio(0===this._time?0:1))}for(this._lazy!==!1&&(this._lazy=!1),this._active||!this._paused&&this._time!==h&&a>=0&&(this._active=!0),0===h&&(this._startAt&&(a>=0?this._startAt.render(a,b,c):e||(e="_dummyGS")),this.vars.onStart&&(0!==this._time||0===i)&&(b||this._callback("onStart"))),f=this._firstPT;f;)f.f?f.t[f.p](f.c*this.ratio+f.s):f.t[f.p]=f.c*this.ratio+f.s,f=f._next;this._onUpdate&&(0>a&&this._startAt&&a!==-1e-4&&this._startAt.render(a,b,c),b||(this._time!==h||d)&&this._callback("onUpdate")),e&&(!this._gc||c)&&(0>a&&this._startAt&&!this._onUpdate&&a!==-1e-4&&this._startAt.render(a,b,c),d&&(this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!b&&this.vars[e]&&this._callback(e),0===i&&this._rawPrevTime===k&&g!==k&&(this._rawPrevTime=0))}},f._kill=function(a,b,c){if("all"===a&&(a=null),null==a&&(null==b||b===this.target))return this._lazy=!1,this._enabled(!1,!1);b="string"!=typeof b?b||this._targets||this.target:F.selector(b)||b;var d,e,f,g,h,i,j,k,l,m=c&&this._time&&c._startTime===this._startTime&&this._timeline===c._timeline;if((n(b)||G(b))&&"number"!=typeof b[0])for(d=b.length;--d>-1;)this._kill(a,b[d],c)&&(i=!0);else{if(this._targets){for(d=this._targets.length;--d>-1;)if(b===this._targets[d]){h=this._propLookup[d]||{},this._overwrittenProps=this._overwrittenProps||[],e=this._overwrittenProps[d]=a?this._overwrittenProps[d]||{}:"all";break}}else{if(b!==this.target)return!1;h=this._propLookup,e=this._overwrittenProps=a?this._overwrittenProps||{}:"all"}if(h){if(j=a||h,k=a!==e&&"all"!==e&&a!==h&&("object"!=typeof a||!a._tempKill),c&&(F.onOverwrite||this.vars.onOverwrite)){for(f in j)h[f]&&(l||(l=[]),l.push(f));if((l||!a)&&!Z(this,c,b,l))return!1}for(f in j)(g=h[f])&&(m&&(g.f?g.t[g.p](g.s):g.t[g.p]=g.s,i=!0),g.pg&&g.t._kill(j)&&(i=!0),g.pg&&0!==g.t._overwriteProps.length||(g._prev?g._prev._next=g._next:g===this._firstPT&&(this._firstPT=g._next),g._next&&(g._next._prev=g._prev),g._next=g._prev=null),delete h[f]),k&&(e[f]=1);!this._firstPT&&this._initted&&this._enabled(!1,!1)}}return i},f.invalidate=function(){return this._notifyPluginsOfEnabled&&F._onPluginEvent("_onDisable",this),this._firstPT=this._overwrittenProps=this._startAt=this._onUpdate=null,this._notifyPluginsOfEnabled=this._active=this._lazy=!1,this._propLookup=this._targets?{}:[],C.prototype.invalidate.call(this),this.vars.immediateRender&&(this._time=-k,this.render(-this._delay)),this},f._enabled=function(a,b){if(h||g.wake(),a&&this._gc){var c,d=this._targets;if(d)for(c=d.length;--c>-1;)this._siblings[c]=Y(d[c],this,!0);else this._siblings=Y(this.target,this,!0)}return C.prototype._enabled.call(this,a,b),this._notifyPluginsOfEnabled&&this._firstPT?F._onPluginEvent(a?"_onEnable":"_onDisable",this):!1},F.to=function(a,b,c){return new F(a,b,c)},F.from=function(a,b,c){return c.runBackwards=!0,c.immediateRender=0!=c.immediateRender,new F(a,b,c)},F.fromTo=function(a,b,c,d){return d.startAt=c,d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender,new F(a,b,d)},F.delayedCall=function(a,b,c,d,e){return new F(b,0,{delay:a,onComplete:b,onCompleteParams:c,callbackScope:d,onReverseComplete:b,onReverseCompleteParams:c,immediateRender:!1,lazy:!1,useFrames:e,overwrite:0})},F.set=function(a,b){return new F(a,0,b)},F.getTweensOf=function(a,b){if(null==a)return[];a="string"!=typeof a?a:F.selector(a)||a;var c,d,e,f;if((n(a)||G(a))&&"number"!=typeof a[0]){for(c=a.length,d=[];--c>-1;)d=d.concat(F.getTweensOf(a[c],b));for(c=d.length;--c>-1;)for(f=d[c],e=c;--e>-1;)f===d[e]&&d.splice(c,1)}else for(d=Y(a).concat(),c=d.length;--c>-1;)(d[c]._gc||b&&!d[c].isActive())&&d.splice(c,1);return d},F.killTweensOf=F.killDelayedCallsTo=function(a,b,c){"object"==typeof b&&(c=b,b=!1);for(var d=F.getTweensOf(a,b),e=d.length;--e>-1;)d[e]._kill(c,a)};var aa=r("plugins.TweenPlugin",function(a,b){this._overwriteProps=(a||"").split(","),this._propName=this._overwriteProps[0],this._priority=b||0,this._super=aa.prototype},!0);if(f=aa.prototype,aa.version="1.18.0",aa.API=2,f._firstPT=null,f._addTween=N,f.setRatio=L,f._kill=function(a){var b,c=this._overwriteProps,d=this._firstPT;if(null!=a[this._propName])this._overwriteProps=[];else for(b=c.length;--b>-1;)null!=a[c[b]]&&c.splice(b,1);for(;d;)null!=a[d.n]&&(d._next&&(d._next._prev=d._prev),d._prev?(d._prev._next=d._next,d._prev=null):this._firstPT===d&&(this._firstPT=d._next)),d=d._next;return!1},f._roundProps=function(a,b){for(var c=this._firstPT;c;)(a[this._propName]||null!=c.n&&a[c.n.split(this._propName+"_").join("")])&&(c.r=b),c=c._next},F._onPluginEvent=function(a,b){var c,d,e,f,g,h=b._firstPT;if("_onInitAllProps"===a){for(;h;){for(g=h._next,d=e;d&&d.pr>h.pr;)d=d._next;(h._prev=d?d._prev:f)?h._prev._next=h:e=h,(h._next=d)?d._prev=h:f=h,h=g}h=b._firstPT=e}for(;h;)h.pg&&"function"==typeof h.t[a]&&h.t[a]()&&(c=!0),h=h._next;return c},aa.activate=function(a){for(var b=a.length;--b>-1;)a[b].API===aa.API&&(P[(new a[b])._propName]=a[b]);return!0},q.plugin=function(a){if(!(a&&a.propName&&a.init&&a.API))throw"illegal plugin definition.";var b,c=a.propName,d=a.priority||0,e=a.overwriteProps,f={init:"_onInitTween",set:"setRatio",kill:"_kill",round:"_roundProps",initAll:"_onInitAllProps"},g=r("plugins."+c.charAt(0).toUpperCase()+c.substr(1)+"Plugin",function(){aa.call(this,c,d),this._overwriteProps=e||[]},a.global===!0),h=g.prototype=new aa(c);h.constructor=g,g.API=a.API;for(b in f)"function"==typeof a[b]&&(h[f[b]]=a[b]);return g.version=a.version,aa.activate([g]),g},d=a._gsQueue){for(e=0;e<d.length;e++)d[e]();for(f in o)o[f].func||a.console.log("GSAP encountered missing dependency: com.greensock."+f)}h=!1}}("undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window,"TweenMax");
/*!
 * VERSION: 0.0.9
 * DATE: 2015-12-10
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2016, GreenSock. All rights reserved.
 * DrawSVGPlugin is a Club GreenSock membership benefit; You must have a valid membership to use
 * this code without violating the terms of use. Visit http://greensock.com/club/ to sign up or get more details.
 * This work is subject to the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window;(_gsScope._gsQueue||(_gsScope._gsQueue=[])).push(function(){"use strict";function a(a,b,c,d){return c=parseFloat(c)-parseFloat(a),d=parseFloat(d)-parseFloat(b),Math.sqrt(c*c+d*d)}function b(a){return"string"!=typeof a&&a.nodeType||(a=_gsScope.TweenLite.selector(a),a.length&&(a=a[0])),a}function c(a,b,c){var d,e,f=a.indexOf(" ");return-1===f?(d=void 0!==c?c+"":a,e=a):(d=a.substr(0,f),e=a.substr(f+1)),d=-1!==d.indexOf("%")?parseFloat(d)/100*b:parseFloat(d),e=-1!==e.indexOf("%")?parseFloat(e)/100*b:parseFloat(e),d>e?[e,d]:[d,e]}function d(c){if(!c)return 0;c=b(c);var d,e,f,g,h,i,j,k,l=c.tagName.toLowerCase();if("path"===l){h=c.style.strokeDasharray,c.style.strokeDasharray="none",d=c.getTotalLength()||0;try{e=c.getBBox()}catch(m){}c.style.strokeDasharray=h}else if("rect"===l)d=2*c.getAttribute("width")+2*c.getAttribute("height");else if("circle"===l)d=2*Math.PI*parseFloat(c.getAttribute("r"));else if("line"===l)d=a(c.getAttribute("x1"),c.getAttribute("y1"),c.getAttribute("x2"),c.getAttribute("y2"));else if("polyline"===l||"polygon"===l)for(f=c.getAttribute("points").split(", ").join(",").split(" "),d=0,h=f[0].split(","),""===f[f.length-1]&&f.pop(),"polygon"===l&&(f.push(f[0]),-1===f[0].indexOf(",")&&f.push(f[1])),i=1;i<f.length;i++)g=f[i].split(","),1===g.length&&(g[1]=f[i++]),2===g.length&&(d+=a(h[0],h[1],g[0],g[1])||0,h=g);else"ellipse"===l&&(j=parseFloat(c.getAttribute("rx")),k=parseFloat(c.getAttribute("ry")),d=Math.PI*(3*(j+k)-Math.sqrt((3*j+k)*(j+3*k))));return d||0}function e(a,c){if(!a)return[0,0];a=b(a),c=c||d(a)+1;var e=g(a),f=e.strokeDasharray||"",h=parseFloat(e.strokeDashoffset),i=f.indexOf(",");return 0>i&&(i=f.indexOf(" ")),f=0>i?c:parseFloat(f.substr(0,i))||1e-5,f>c&&(f=c),[Math.max(0,-h),Math.max(0,f-h)]}var f,g=document.defaultView?document.defaultView.getComputedStyle:function(){};f=_gsScope._gsDefine.plugin({propName:"drawSVG",API:2,version:"0.0.9",global:!0,overwriteProps:["drawSVG"],init:function(a,b,f){if(!a.getBBox)return!1;var g,h,i,j=d(a)+1;return this._style=a.style,b===!0||"true"===b?b="0 100%":b?-1===(b+"").indexOf(" ")&&(b="0 "+b):b="0 0",g=e(a,j),h=c(b,j,g[0]),this._length=j+10,0===g[0]&&0===h[0]?(i=Math.max(1e-5,h[1]-j),this._dash=j+i,this._offset=j-g[1]+i,this._addTween(this,"_offset",this._offset,j-h[1]+i,"drawSVG")):(this._dash=g[1]-g[0]||1e-6,this._offset=-g[0],this._addTween(this,"_dash",this._dash,h[1]-h[0]||1e-5,"drawSVG"),this._addTween(this,"_offset",this._offset,-h[0],"drawSVG")),!0},set:function(a){this._firstPT&&(this._super.setRatio.call(this,a),this._style.strokeDashoffset=this._offset,1===a||0===a?this._style.strokeDasharray=this._offset<.001&&this._length-this._dash<=10?"none":this._offset===this._dash?"0px, 999999px":this._dash+"px,"+this._length+"px":this._style.strokeDasharray=this._dash+"px,"+this._length+"px")}}),f.getLength=d,f.getPosition=e}),_gsScope._gsDefine&&_gsScope._gsQueue.pop()();
// Module to handle site functionality (loading,scrolling,resizing)
var mgbMainSys = {
	currPage: null,
	mainContentLoaded: false,
	allCultureLoaded: false,
	allNewsLoaded: false,
	mobileNavMaxWidth: 768 - 16,//1024,
	
	//load targets for tiles
  	pLoadTarget: 6,
	cLoadTarget:5,
	nLoadTargets: 4,
	pLoaded:6,
	cLoaded:5,
	nLoadTargets: 4,
	cMoreTarget:5,
	pMoreTarget:6,
	nMoreTargets: 4,
	
	waypointsInitialized: false,
	glitchesInitialized: false,
	
	currSelection: null,
	currCoun: 'us',
	currCity: 'glo',
	currLang: 'en',
	
	pinnedDismissed: false,
	// permHidePinned: false,
	
	init : function() {
		
		// console.log('pd',this.pinnedDismissed);
		var that = this;
		
		
		setTimeout(function(){
			if($(".homeSection").length > 0) {
				that.initWaypoints(); 
			}
			
			mgbContent.setCultureTileHeight();
		
		},2000);
		
		if (localStorage.getItem('pinnedContent') == 'dismissed'){
			this.pinnedDismissed = true;
		}else{
			setTimeout(function(){
				that.checkLocation();
			},2000);
		}
		
		this.addListeners();
		
		
	},
	
	createWaypoint: function(id){
		var waypoint = $('#'+id).waypoint(function(direction) {
			var elemId = this.element.id;
			mgbHeader.deactivateNavActive();
			$("#nav-" + elemId).addClass('active');
		}, {
			offset: '10%'
		})
		
	},
	
	initWaypoints : function(){
		
		//not woring properly
		var that = this;
		
		if (mgbMainSys.mainContentLoaded == true) {
			
			this.waypointsInitialized = true;
			
			var inviewNews = new Waypoint.Inview({
			  element: $('#news')[0],
			  enter: function(direction) {
				  if (direction == "down") $('#news .sectionButton').addClass('show');
			  },
			  entered: function(direction) {
				  if (direction == "down") $('#news .sectionButton').removeClass('show');
			if (direction == "up") $('#news .sectionButton').addClass('show');
			  },
			  exit: function(direction) {
				  if (direction == "up") $('#news .sectionButton').addClass('show');
			  },
			  exited: function(direction) {
				  $('#news .sectionButton').removeClass('show');
			  }
			})
	
			var inviewCulture = new Waypoint.Inview({
			  element: $('#culture')[0],
			  enter: function(direction) {
				  if (direction == "down") $('#culture .sectionButton').addClass('show');
			    // console.log('Enter triggered with direction ' + direction)
			  },
			  entered: function(direction) {
				  if (direction == "down") $('#culture .sectionButton').removeClass('show');
			     // console.log('Entered triggered with direction ' + direction)
			  },
			  exit: function(direction) {
				  if (direction == "up") $('#culture .sectionButton').addClass('show');
			    // console.log('Exit triggered with direction ' + direction)
			  },
			  exited: function(direction) {
				  $('#culture .sectionButton').removeClass('show');
			    // console.log('Exited triggered with direction ' + direction)
			  }
			})
			
		}
		
		
		
	},
	
	expandNav: function(){
		mgbHeader.deactivateNavActive();
		$('#header').removeClass("sticky");
		$('nav').removeClass("sticky");
		$("nav #mbLogo").css({'position': '', 'margin-top' : '' });
		if (!$('#header').hasClass('mobile')) mgbHeader.hideLogo();
		setTimeout(function(){
			if (!$('#header').hasClass('settle')) $('#header').addClass('settle');
		},1500);
		
	},
	
	collapseNav: function(){
		
		
		$('#header').addClass("sticky");
		$('nav').addClass("sticky");
		$("#mbLogo").off('mouseout');
		mgbHeader.showLogo();
		setTimeout(function(){
			if (!$('#header').hasClass('settle')) $('#header').addClass('settle');
		},1500);
	},
	
	showPinned : function(){
		
		$('body').addClass("showPinned");
		$('body').removeClass('pinnedActive');
		if ($('body').hasClass('nothome')){
			var h = 0;
			if($("#heroImage").length > 0) h = $('#heroImage img').innerHeight();
			$('.contentWrapper').css('margin-top',-h+"px");
		}
		
	},
	
	showFooter : function(){
		console.log("showfooter");
		$('footer').removeClass('absolute').addClass("tempHide");
		setTimeout(function(){
			// console.log("showfooterIn");
			
			console.log($('footer').position().top, $(window).height())
			if ($('footer').position().top + 63 < $(window).height()){
				$('footer').addClass('absolute').removeClass('tempHide');
				// $('footer').css('bottom', 0 + 'px');
			}
			$('footer').removeClass('tempHide');
		},1000);
	},

	checkLocation : function(){
		// this.showPinned();
		setTimeout(function(){
			if ($(window).attr('scrollY') == 0 && $('body').hasClass('ishome')) mgbMainSys.showPinned();
			// $("body").addClass("showPinned");
		},4000)
	
	},
	
	hidePinned : function(hideForever){
		// console.log('hidePinned');
		
		if (hideForever == false){
			$('body').addClass('pinnedActive');
		}else{
			console.log('set global pinned to hidden');
			this.pinnedDismissed = true;
			localStorage.setItem('pinnedContent', 'dismissed');
			//var hiddenCookie = document.cookie.replace(/(?:(?:^|.*;\s*)mgbHeaderHidden\s*\=\s*([^;]*).*$)|^.*$/, "$1");
			
			//if(hiddenCookie !== "true"){
				//document.cookie = "mgbHeaderHidden=true;max-age=2592e3";
		}
		$('body').removeClass("showPinned");
		
		// if ($('body').hasClass('nothome')){
			$('.contentWrapper').css('margin-top',0+"px");
		// }
		
	},
	
	scrollToSection : function(section,t){
		$("html, body").animate({
				scrollTop: $("#"+section).offset().top - 70,
			}, t);
	},
	
	addGlitch : function(tar,t){
		$(tar).addClass("glitch");

		setTimeout(function(){
			$(tar).removeClass("glitch");
		},t);
	},
	
	selectRandomItemToGlitch : function(el,t){
		
		var arr = el.split('|');
		var index = Math.floor(Math.random()*arr.length);
		this.addGlitch(arr[index],t);
		
	},
	
	initializeGlitches : function(t){
		
		var that = this;
		
		this.glitchesInitialized = true;
		
		//header glitches
		//offset by 1 second from the rest
		/*setTimeout(function(){
			that.selectRandomItemToGlitch('#mbLogo|.menu');
		},1000);*/
		
		setTimeout(function(){
			
			//video section
			that.selectRandomItemToGlitch('#welcomeImage|.responsive-video|.headerHeroText|.moreMsg');
			
			/*
			//culture section
			var targets = '#culture .sectionHeading|#culture .moreButton|';
			for (var i=0;i<that.cLoaded;i++){
				targets += '.cultureTile:nth-child('+i+') img|'
			}
			
			(function(tars){
				setTimeout(function(){that.selectRandomItemToGlitch(tars,500);},0);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,250);},200);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,150);},300);
			}(targets));
			
			//work section
			targets = '#work .sectionHeading|#work .moreButton|';
			for (var i=0;i<that.pLoaded;i++){
				targets += '.projectTile:nth-child('+i+') img|'
			}
			
			(function(tars){
				setTimeout(function(){that.selectRandomItemToGlitch(tars,500);},0);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,250);},200);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,150);},300);
			}(targets));
			
			
			//office section
			targets = '#offices .sectionHeading|';
			for (var i=0;i<$('.officeTile').length;i++){
				targets += '.officeTile:nth-child('+i+') img|'
			}
			
			(function(tars){
				setTimeout(function(){that.selectRandomItemToGlitch(tars,500);},0);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,250);},200);
			}(targets));
			
			*/
			
			//clients/jobs section
			/*
			targets = '#clients .sectionHeading|.joinTeamCTA|';
			for (var i=0;i<$('.clientLogo').length;i++){
				targets += '.clientLogo:nth-child('+i+')|'
			}
			
			(function(tars){
				setTimeout(function(){that.selectRandomItemToGlitch(tars,500);},0);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,250);},200);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,150);},300);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,150);},300);
			}(targets));
			*/
			
			//footer
			targets = '.legal|';
			for (var i=0;i<$('.socialIcons a').length;i++){
				targets += '.socialIcons a:nth-child('+i+')|'
			}
			that.selectRandomItemToGlitch(targets,250);
			
			that.initializeGlitches(3000 + Math.random() * 2000);
			
		},t);
	
	},
	
	addListeners : function(){
		var that = this;
		$(document).on('click', '[data-tracking-label]', function(e) {
			
			if ($(this).attr('id') == 'homeLogo' && $('body').hasClass('ishome')){
				e.preventDefault();
				$("html, body").animate({
						scrollTop: 0,
					}, 500);
				return;
				
			}
			
			if($(this).attr('target') != "_blank" ) { 
				//console.log("asdfasdfasdf")
				e.preventDefault();
			}
			var virtualPath = $(this).attr('data-tracking-label');
			that.gaTracking(virtualPath,$(this));
		});
		
		$('.showPinned').children('button').on('click', function(){
			//console.log("hide pinned clicked");
			$(that).hidePinned(true);
		});
		
		$('#removePinnedHeader').on('click', function(){
			//var hiddenCookie = document.cookie.replace(/(?:(?:^|.*;\s*)mgbHeaderHidden\s*\=\s*([^;]*).*$)|^.*$/, "$1");
			
			//if(hiddenCookie !== "true"){
				//document.cookie = "mgbHeaderHidden=true;max-age=2592e3";
				
				mgbMainSys.hidePinned(true);
				//}
		});
	},
	
	handleOfficeChange : function(val){
		var currId = this.currCoun;
		$('.flag').removeClass(currId);
	    var selVal = val;
		
		var selArr = selVal.split('-');
		this.currCoun = selArr[0];
		this.currCity = selArr[1];
		this.currLang = selArr[2];
		$('.flag').addClass(this.currCoun);
	},
	
	handleOfficeSelector : function(){
		var that = this;
		
		if ($('body').hasClass('autoplay')){
			//not a mobile device/table: use dropkick
			//fire "selection" on close to allow for keyboard control
			$("#office-selector").dropkick({
				change: function () {
					//set global selection on change (fired using down arrow on keyboard)
					that.currSelection = this;
				},
				close: function () {
					setTimeout(function(){
						//if global is set (from keyboard control): use it; if not use mouse value
						var v = (that.currSelection != null) ? that.currSelection.value : this.value;
						
						if (v) that.handleOfficeChange(v);
						that.currSelection = null; //reset global
					},100);
					
					
				}
			});
		} else{
			//use tradition select/option
			$('#office-selector').change(function(){
				that.handleOfficeChange($('#office-selector').val());
			});
		}
	},
	
	gaTracking : function(virtualPath,$self){
	    var pieces = virtualPath.split('|');
		
		/*if ($self){
			if ($self.hasClass('cultureLink')){
				$self.toggleClass('active');
				if (!$self.hasClass('active')) pieces[2] += "_close";
			}	
		}	*/	
		
	    if (pieces.length == 3) {
			console.log(pieces[0]+'/'+pieces[1]+'/'+pieces[2]);
	        if ($self && $self.attr('href') && $self.attr('href')[0] != '#' && $self.attr('target') != '_blank') {
	            // internal exit page link
	            
				
	            // makes sure to get interaction data before user leaves site
	          //  ga('send', 'event', pieces[0], pieces[1], pieces[2], {
	               // 'hitCallback': function() {
	                    //don't use location href = window.location.href = $self.attr('href');
						mgbMainSys.getPage($self.attr('href'));
	               // }
			   // });
	        } else {
	           // ga('send', 'event', pieces[0], pieces[1], pieces[2]);
	        }
			   
	    }
		
	},
	
	resize : function(){
		this.checkTileLoad();
		this.showFooter(); 
		mgbMainSys.checkInView('.ll-all');
	},
	
	isScrolledIntoView : function(elem) {
	    var docViewTop = $(window).scrollTop();
	    var docViewBottom = docViewTop + $(window).height();

	    var elemTop = $(elem).offset().top;
	    var elemBottom = elemTop + $(elem).height()/4;

	    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
	},	
	
	checkTileLoad : function(){
		if (lastWindowWidth >= mgbMainSys.mobileNavMaxWidth){
			//console.log("tile load >1024");
			this.cLoadTarget = 7;
			this.pLoadTarget = 6;
			this.nLoadTarget = 6;
			
			if (this.cLoaded < this.cLoadTarget){
				mgbContent.loadMoreContent('cultureTile',this.cLoadTarget - this.cLoaded);
				this.cLoaded = this.cLoadTarget;
			}
			
			if (this.pLoaded < this.pLoadTarget){
				mgbContent.loadMoreContent('projectTile',this.pLoadTarget - this.pLoaded);
				this.pLoaded = this.pLoadTarget;
			}
			
			if (this.nLoaded < this.nLoadTarget){
				mgbContent.loadMoreContent('newsTile', this.nLoadTarget - this.nLoaded);
				this.nLoaded = this.nLoadTarget;
			}
			
			this.cMoreTarget = 7;
			this.pMoreTarget = 8;
			this.nMoreTarget = 6;
			
		}
		
		if (lastWindowWidth >= 1900){
			this.cLoadTarget = 10;
			this.pLoadTarget = 9;
			this.nLoadTarget = 6;
			
			/*
			// make sure the target is a multiple of 5 just in case the user 
			// has loaded more at a smaller size and made the screen bigger
			if (this.cLoaded > this.cLoadTarget && this.cLoaded%5 != 0){
				this.cLoadTarget =  round(this.cLoaded/5) * 5;
			}
			*/
			
			if (this.cLoaded < this.cLoadTarget){
				mgbContent.loadMoreContent('cultureTile',this.cLoadTarget - this.cLoaded);
				this.cLoaded = this.cLoadTarget;
			}
			
			if (this.pLoaded < this.pLoadTarget){
				mgbContent.loadMoreContent('projectTile',this.pLoadTarget - this.pLoaded);
				this.pLoaded = this.pLoadTarget;
			}
			
			if (this.nLoaded < this.nLoadTarget){
				mgbContent.loadMoreContent('newsTile', this.nLoadTarget - this.nLoaded);
				this.nLoaded = this.nLoadTarget;
			}
			
			this.cMoreTarget = 5;
			this.pMoreTarget = 6;
			this.nMoreTarget = 6;
			
		}
	},
	
	handleScrolling : function(){
		
		// move the parallax header
		var yPos = -($(window).scrollTop() / 4); 
		var topOff = yPos + 'px';
		$('.parallaxHeader').css({ top: topOff });
		
		if ($('body').hasClass('showPinned')){
			var global = false;
			
			mgbMainSys.hidePinned(global);
			
			
		}
		
		var currScroll = $(window).attr('scrollY');
		
		
		if (currScroll == 0 && mgbMainSys.pinnedDismissed == false){
			if($('body').hasClass('ishome')) {
				mgbMainSys.showPinned();
			
			}
		}
		
		// var scrollBottom = $(document).height() - $("body").height();
		
		var stickyNavRevealY = mgbHeroVideo.maxVideoHeight - 90
		
		//removed because overlay doesn't use this anymore
		/*if ($('#overlayContent').hasClass('active')){
			if($("#heroImage").length > 0) {
				stickyNavRevealY = $('#heroImage img').innerHeight() - 75;
			}else{
				stickyNavRevealY = 50;
			}
		}*/
		
		//there is extra code here, but we only want this to happen on the homepage now
		if($('body').hasClass('ishome')){
			if(currScroll > stickyNavRevealY) {
				mgbMainSys.collapseNav();
				/*$('#header').addClass("sticky");
				if(!$('nav').hasClass("sticky")) {
					//if (lastWindowWidth > mgbMainSys.mobileNavMaxWidth) {
						$('nav').addClass("sticky");
		
					$("#mbLogo").off('mouseout');
					mgbHeader.showLogo();
					//if (lastWindowWidth >= mgbMainSys.mobileNavMaxWidth) mgbHeader.showLogo();
				}*/
			} else {
				mgbMainSys.expandNav();
				/*mgbHeader.deactivateNavActive();
				//if (!$('#header').hasClass('mobile')) 
				$('#header').removeClass("sticky");
				//if(!$('nav').hasClass("overlayActive")) {
					// $('nav a').removeClass('active');
					$('nav').removeClass("sticky");
					// $('#header').removeClass("sticky");
					$("nav #mbLogo").css({'position': '', 'margin-top' : '' });
					if (!$('#header').hasClass('mobile')) mgbHeader.hideLogo();*/
			}
		}
		
		/*
		// update the navigation based on which section is at the top of the viewport
		$('section').each(function(){
		
			var diff = Math.abs($(this).offset().top - $(window).scrollTop());
			var hashName = $(this).attr('id');
			
			if(diff <= 600) {			
				// $('nav a').removeClass('active');
				$('nav a[href="#'+hashName+'"]').addClass('active');
				$('#'+hashName).find("span[data-forward]").addClass('forwardVisible');			
				
				if(hashName === "Timeline") {
					if(mgbTimeLine !== null) {
						mgbTimeLine.drawTimeline();
					}
				}
			}
		
			if($(window).scrollTop() === scrollBottom) {
				// $('nav a').removeClass('active');
				// $('.navigation li:last-child a').addClass('active');
			} 
		});	*/
		var el = '.ll';
		if (mgbMainSys.allCultureLoaded || mgbMainSys.allNewsLoaded) {el = '.ll-all';}
		mgbMainSys.checkInView(el);
	},
	
	checkInView : function(el){
		
		// lazyload images into view when they are in the viewport
		$(el).each(function () {
		  if (mgbMainSys.isScrolledIntoView(this) === true) {
		      $(this).addClass('in-view');
			  var _parent = $(this).parent().next();
	 
			  if (_parent.hasClass('officeInfo') || _parent.hasClass('arrow')) {
				  _parent.addClass('showDetails');
			  }
		  }
		});
	},
	
    pushHistoryState: function (page, bool) {
		// console.log('push',page);
		
		var root = appRoot;
		
		// if (page == "/") {
// 			page = '';
// 		}

	console.log("root=",root," page=",page);
		if (root == page) {
			root = '';
		}else if (page == "/"){
			root = root.substring(0, root.length - 1);
		}
		
		
		
        if (window.history.pushState) {
            if (bool !== false) { //-- do not add to history if using back button
                // console.log('pushing ', page, ' to history');
                window.history.pushState({
                    url: page
                }, "", root + page);
            }
        } else {
            window.location.hash = page;
        }
    },
	
    getPage: function (page, bool) {
		
		var sliced;
		
		if (page.slice(0,1) == "/" && page != "/") {
			sliced = page.slice(1,page.length);
			page = sliced;
		}
		
		console.log("page", page);
		
		this.pushHistoryState(page, bool);
		
		//check to see if they home section array contains the page
		var homeSectionIndex = jQuery.inArray(page, homeSections);
		var isHomeSection = (homeSectionIndex != -1);
		       
		mgbMainSys.currPage = page;
		
		mgbMainSys.hidePinned(true);
		
		$('#header').removeClass('removed');
		// $('#overlayCover').removeClass('white');
		
		var intContent = true;
		
		console.log('isHomeSection',isHomeSection)
		
		console.log('page',page);
		
		if (page == "/") page = appRoot;
		
		if (page == appRoot || isHomeSection){
			page = 'index.php'; 
			intContent = false;
			
			//your on the homepage and hit one of the top navs
			/*
			if (!$('#overlayCover').hasClass('active')){
							mgbMainSys.scrollToSection(homeSections[homeSectionIndex],1000);
							return;
						}*/
			
		}else{
			page += '.php';
		}
		
		var reqUrl = appRoot + page + '?ajax=1'; //-- appRoot defined in site-pref.php
		
		if (reqUrl.indexOf('global-leadership/') != -1){
			//is an extended bio page
			var bioArr = reqUrl.split('/');
			var bio = bioArr[bioArr.length-1];
			var bio_id = bio.replace('.php?ajax=1','');
			reqUrl = appRoot + "leader-bio.php?ajax=1&bio="+bio_id;
			// reqUrl = "/extended-bio.php?ajax=1";
		}
		
		if (reqUrl.indexOf('people/') != -1){
			//is an extended bio page
			var bioArr = reqUrl.split('/');
			var bio = bioArr[bioArr.length-1];
			var bio_id = bio.replace('.php?ajax=1','');
			reqUrl = appRoot + "people-bio.php?ajax=1&bio="+bio_id;
			// reqUrl = "/extended-bio.php?ajax=1";
		}
		
		if (reqUrl.indexOf('work/') != -1){
			//is an extended bio page
			var portArr = reqUrl.split('/');
			var port = portArr[portArr.length-1];
			var port_id = port.replace('.php?ajax=1','');
			reqUrl = appRoot + "case-study.php?ajax=1&port="+port_id;
			// reqUrl = "/extended-bio.php?ajax=1";
		}
		
		// if (reqUrl = "/.php?ajax=1"){
// 			reqUrl = "/index.php?ajax=1";
// 		}
		console.log('req',reqUrl);
		
		if (this.mainContentLoaded == true && !intContent){ // if going to home page, check if content is already loaded before ajax call
			
			console.log("home already loaded");
			
			// $('#overlayCover').removeClass('active');
			
			$('footer').removeAttr('style');
			
			$('body').removeClass('nothome').addClass('ishome');
			
			/*$("nav").removeClass("overlayActive sticky");
			// $('nav').removeClass('settle sticky');
			mgbHeader.hideLogo();
			mgbHeader.deactivateNavActive();*/
			
			// $('#header').removeClass('settle');
			mgbMainSys.expandNav();
			
			mgbInternalContent.kill();
			
			$('#mainContent .contentWrapper').css({'top':mgbHeroVideo.maxVideoHeight + "px","margin-bottom":mgbHeroVideo.maxVideoHeight + "px"}).addClass('settle');
			
			$("#mainContent").removeClass("inactive");
			
			//run the word cycle again
			mgbHeroVideo.headerWords.restart()
			
			setTimeout(function(){
				
				$("#internalContent").empty();

			},500);
			
			setTimeout(function(){
				
				if (isHomeSection) mgbMainSys.scrollToSection(homeSections[homeSectionIndex],1000);

			},1000);
			
			return;
		}
		
		// Fire immediately on getPage
		// $('#header').removeClass('settle'); //this hides the nav instantly during page transitions
		mgbInternalContent.kill();
		$('footer').addClass('tempHide');
		
		// if (reqUrl.indexOf('all-culture') != -1){
// 			$("#overlayCover").addClass("white");
// 		}
		
		//if (intContent) $('body').addClass('overlayReady'); //turn white bg gray to hide a flash of white when the overlay is building.

        var request = $.ajax({
            url: reqUrl,
            dataType: 'text',
            beforeSend: function () {
                //-- unslick carousel before we go!
                try {
					
                } catch (err) {
                    // if (window.console && window.console.log) console.error('carousel destroy error');
                }
            }
        });
		
        request.done(function (response) {
			
			mgbMainSys.allCultureLoaded = false;
			mgbMainSys.allNewsLoaded = false;
			
			// $('#header').removeClass('settle')
			
			if (intContent){ //request page is an internal page
				
				if ($('#internalContent').hasClass('active')){
					$('#internalContent').removeClass('active');
				} 
				
				// if (!$('#overlayCover').hasClass('active')){
// 					$('#overlayCover').addClass('active');
// 					$('body').removeClass('overlayReady');
// 				}
				
				/*setTimeout(function(){	
					
					$('#overlayCover').addClass('active'); //css takes 500ms
					
				},500);*/
				
				setTimeout(function(){
					window.scrollTo(0, 0);
					
					$('body').removeClass('ishome').addClass('nothome');
					
					//lock the nav as gray bar on sub pages
					mgbMainSys.collapseNav();
					$("nav").addClass("overlayActive");
					
					/*$('nav').addClass('settle sticky');
					mgbHeader.showLogo();*/
					
					$("#mainContent").addClass("inactive");

					$("#internalContent").html(response);
					
					 //call js to init current page
					mgbInternalContent.init();
					
					//if is global-leadership content, initialize that content.
					if (reqUrl.indexOf('global-leadership.') != -1){
						
						// setTimeout(function(){
							 mgbInternalContent.addAllCultureListeners();
							 mgbMainSys.checkInView('.ll-all');
							 resize();
						//}, 1000);
						
					}
					
					//if is all-news content, initialize that content.
					if (reqUrl.indexOf('all-news.') != -1){
						
						 setTimeout(function(){
							 mgbInternalContent.addAllNewsListeners();
							 mgbMainSys.checkInView('.ll-all');
							 resize();
						}, 1000);
						
					}
					
					
					mgbMainSys.checkInView('.ll-all');
					mgbMainSys.showFooter();

				},500);
				
			}else{ //back to homepage
				
				// console.log('repsonse ' ,response);
				// 

				$('body').removeClass('nothome').addClass('ishome');

				// $('#overlayCover').removeClass('active');
				
				$('footer').removeAttr('style');
				
				$("#mainContent").html(response);
				$("#mainContent").removeClass("inactive");
				
				mgbMainSys.mainContentLoaded = true;
				
				mgbContent.init();
				mgbContent.resize();
				mgbHeroVideo.init();
				
				
				mgbHeader.deactivateNavActive();
				
				if (!mgbMainSys.waypointsInitialized) mgbMainSys.initWaypoints();
				
				mgbHeroVideo.loadHeaderVideo();
				
				/*mgbHeader.deactivateNavActive();
				$("nav").removeClass("overlayActive sticky");
				$('nav').removeClass('settle sticky');
				mgbHeader.hideLogo();*/
				
				mgbMainSys.expandNav();
				$("nav").removeClass("overlayActive");
				
				// mgbInternalContent.kill();
				mgbMainSys.showFooter();
				
				setTimeout(function(){
					
					$("#internalContent").empty();
					mgbMainSys.checkTileLoad();
					
				},500);
				
				setTimeout(function(){
					if (isHomeSection) mgbMainSys.scrollToSection(homeSections[homeSectionIndex],1000);
				},2000);
				
				
			}

        });
		
        request.fail(function (err) {
            if (window.console && window.console.log) console.error("Page failed to load: ", page);
        });
		
        request.always(function (content) {});
    }
};

	
// Module to handle site navigation
var mgbHeader = {
	navContainer : null,
	giveFocus: true, 
	// mainContainer : null,
	navHeight : $("nav").height(),
	ts : TweenMax.set,
	logoAnimation : new TimelineMax(),

	init : function() {
		this.navContainer = $('nav');
		// this.mainContainer = $('section:nth-child(2)');
		
		TweenMax.set(rect,{rotation:-90,transformOrigin:"50% 50%"});
		
		this.logoAnimation.to(rect,.3,{transformOrigin:"50% 50%", drawSVG:"0%"}).
		to(bowenTXT,.2,{x:102, ease:Quad.easeIn}, .2).
		to(cgarryContainer,.2,{width:102, ease:Quad.easeIn}, .2).
		to(owenContainer,.2,{width:79, ease:Quad.easeOut}, .4);
		
		this.logoAnimation.stop();	
		
		this.addListeners();
		
	},
	
	addListeners : function(){
		var that = this;
		/*$('#homeLogo').one('click',function(e){
			e.preventDefault();		
			
			if (!$('body').hasClass('ishome')){
				console.log('ar',appRoot);
				mgbHeader.deactivateNavActive();
				// mgbMainSys.getPage(appRoot, true);
			
				mgbContent.deactivateActiveContent();
			} else{
				if ($(window).attr('scrollY') > 0) {
					$("html, body").animate({
							scrollTop: 0,
						}, 500);
				}
			}
		});*/
		
		
		$('#menuToggleHolder, .hiddenNavToggle').on('click', function(e){
			e.preventDefault();
			
			var newAlt, alt = $('#menuToggleHolder').attr('aria-label');
			 
            if (alt.indexOf('Open') != -1) { // has 'open'
                newAlt = alt.replace('Open', 'Close');
            } else { // has 'close'
                newAlt = alt.replace('Close', 'Open');
            }
			
			$('#menuToggleHolder').attr('aria-label', newAlt);
			$('.hiddenNavToggle').attr('aria-label', newAlt);
			$('.hiddenNavToggle').html(newAlt);
			
			$('#menuToggleHolder').toggleClass("active");
			$('#navWrapper').toggleClass('active');
			if ($('#menuToggleHolder').hasClass("active")){
				that.showMobileNav();
			}else{
				that.hideMobileNav();
			}	
		});
	
	
		$('nav .menu a').on('click', function(e){
			//e.preventDefault();
			
			$('nav #menuToggleHolder').removeClass("active");
						
						that.hideMobileNav();
						var currLink = $(this);
			
			/*if (mgbMainSys.currPage != appRoot) {
				mgbMainSys.getPage('/',true);
				return;
			}*/
			
			// $(this).removeClass('active');
			

			//var hashValue = $(this).attr('href');
			
			//scroll nav
			
			/*$("html, body").animate({
				scrollTop: $(hashValue).offset().top,
			}, 1000, function() {
				$(hashValue).find("span[data-forward]").addClass('forwardVisible'); // animate the text for the section

				$(hashValue).children('.ll').each(function () {
				  if (mgbMainSys.isScrolledIntoView(this) === true) {
				      $(this).addClass('in-view');
					  $(this).parent().next().css('opacity', '1');
				  }
				});

				currLink.addClass('active');	
			});	*/	
		});
	
	
		$('#homeLogo').mouseover(function(){
			if (lastWindowWidth >= mgbMainSys.mobileNavMaxWidth) mgbHeader.showLogo();
		});

		$('#homeLogo').mouseout(function(){
			if (lastWindowWidth >= mgbMainSys.mobileNavMaxWidth) mgbHeader.hideLogo();
		});
	},
	
	deactivateNavActive : function(){
		$('nav .menu a').removeClass('active');
	},
	
	showMobileNav : function(){
		this.showLogo();
		// $('#mbLogo').css('margin-top','-10px');
		//$('#overlayCover').addClass('mobileNav');
		$('.menu,#header,#mbLogo').addClass('mobile');
	},
	
	hideMobileNav : function(){
		this.hideLogo();
		$('#mbLogo').removeAttr('style');
		//$('#overlayCover').removeClass('mobileNav');
		$('.menu,#header,#mbLogo').removeClass('mobile');
	},
	
	resize : function(){
		var scope = this;
		
		setTimeout(function(){
			$('#header').addClass('settle');
			mgbMainSys.handleScrolling();
		}, 1500);
		
		this.navHeight = $('nav').height();

		if (lastWindowWidth >= mgbMainSys.mobileNavMaxWidth) {
			$('#menuToggleHolder').removeClass('active');
			this.hideMobileNav();
		}
		
/*
		// check to see if overlay is required
		var loc = $(location).attr('href');
		
		if (loc.indexOf('work') != -1){
			
			// $("#mainContent").addClass("inactive");
			
			// $(".navigation").fadeOut(200);
			
			setTimeout(function(){			
				// $("nav").toggleClass("overlayActive sticky");
				// mgbHeader.logoAnimation.progress(1, false);
			},1000)
			
			
		}else{
			
			// this.mainContainer.addClass('settle');
		}*/
	},
	showLogo : function() {
		this.logoAnimation.play();
	},
	
	hideLogo : function() {
		if (!this.navContainer.hasClass('sticky')) this.logoAnimation.pause().reverse();
	}
};

// var mgbTimeLine = {
// 	mgbtl: null,
// 	timelineAnimation : new TimelineMax(),
// 	init: function(){
// 		mgbtl = $('#mb_timeline_path2');
//
// 		TweenMax.set(mgbtl, {drawSVG: "100% 100%"});
//
// 		this.timelineAnimation.eventCallback("onComplete", function(){
// 			$(".timelineDate").addClass("active");
// 		});
// 	},
//
// 	drawTimeline: function(){
// 		this.timelineAnimation.to(mgbtl, 2, {drawSVG: "100% 0%", ease: Cubic.easeInOut});
// 		this.timelineAnimation.play();
// 	}
// };

var mgbHeroVideo = {
	overlayContainer : null,
	videoHeaderContainer : null,
	welcomeContainer : null,
	videoPlayerContainer : null,
	msgContainer: null,
	vimeoPlayer: null,
	aboutUsVideoId: '176376361',
	wordArray: null,
	firstWord: '',
	videoHeight : 0,
	aspectRatio : 16/9,
	videoWidth : $(window).width(),
	maxVideoHeight : 500,
	arrowAnimation : new TimelineMax(),
	headerWords: new TimelineMax({onComplete: function(){mgbHeroVideo.wordCycleComplete()}}),

	init : function() {
		
		var that = this;
		
		if (mgbMainSys.mainContentLoaded == true) 
		{
			this.overlayContainer = $('.video-overlay');
			this.videoHeaderContainer = $(".videoHeader");
			this.welcomeContainer = $("#welcomeVideo");
			this.videoPlayerContainer = $(".responsive-video");

			this.messageContainer = $(".headerHeroText");
			
			this.initHeaderCopy();
			
			this.arrowAnimation.to(downArrow,1,{y:"-20", delay:0,ease:Back.easeInOut}).
			to(downArrow,1,{y:"0", delay:0.75, ease:Bounce.easeOut, overwrite:false });
			this.arrowAnimation.repeat(-1).play();
			
			$('.aboutUsClose .videoClose').on('click',function(e){
				that.killAboutUsVideo();
			})

		}
		
	},
	
	resize : function(){
		var scope = this;

		if (mgbMainSys.mainContentLoaded == true) {
			
			this.overlayContainer.addClass('settle');

			

			if ($('#welcomeVideo').hasClass('aboutUs')){
				// console.log('yes');
				this.videoWidth = lastWindowWidth;
				this.videoHeight = this.videoWidth / this.aspectRatio;
				
				// var screenAR = lastWindowWidth / this.videoHeight;
				
				$('.contentWrapper').css('top',this.videoHeight + 'px').css('margin-bottom',this.videoHeight + 'px');
				$('.videoHeader').css('height',this.videoHeight + 'px')
				
			}else{
				setTimeout(function(){
					scope.videoHeaderContainer.addClass('settle');
					$('#mainContent .contentWrapper').css({'top':scope.maxVideoHeight + "px","margin-bottom":scope.maxVideoHeight + "px"}).addClass('settle');
				}, 1000);
				
				// console.log('no');
				//$('.contentWrapper').css('top',this.maxVideoHeight + 'px').css('margin-bottom',this.maxVideoHeight + 'px')
				
				this.videoHeight = lastWindowHeight;
				
				if (this.videoHeight > this.maxVideoHeight) {
					this.videoHeight = this.maxVideoHeight;
				}
				
				var videoHolderHeight = this.videoHeight;

				this.videoHeaderContainer.css('height',videoHolderHeight+'px');

				this.videoWidth = (this.videoHeight * this.aspectRatio);

				
			
		}
		
		var screenAR = lastWindowWidth / this.videoHeight;
	
		//reset all inline styles
		this.overlayContainer.css('margin-top',0);
		this.videoPlayerContainer.css({'margin-top' : '0', 'margin-left' : '0' });
		this.welcomeContainer.css('height','100%');

		if (screenAR > this.aspectRatio){ //if screen is wider than 16:9 use video width to set the video size

			this.videoWidth = lastWindowWidth;
			this.videoHeight = (this.videoWidth * (1/this.aspectRatio));

			var videoDiff = (this.videoHeight - videoHolderHeight)/2;

			var mt = -videoDiff; //(lastWindowHeight - videoHeight)/2; //calculate the margin-top offset

			this.videoPlayerContainer.css('margin-top',mt+"px");
			this.overlayContainer.css('margin-top',mt+"px"); //offset video overlay so content stays centered vertically
			this.welcomeContainer.css('height',lastWindowHeight+'px');

		} else { //if screen is skinnier than 16:9 use video height (set above line 43) to set the video size

			var ml = (lastWindowWidth-this.videoWidth)/2; //calculate the margin-left offset
			this.videoPlayerContainer.css('margin-left',ml+"px");
		}

		this.videoPlayerContainer.css('width', this.videoWidth + 'px');
		this.videoPlayerContainer.css('height', this.videoHeight+'px');
		this.overlayContainer.css('height',this.videoHeight + 'px');
	}
		
		// check to see if overlay is required
		/*var loc = $(location).attr('href');
		
		console.log(loc);
		
		if (loc.indexOf('work') != -1){ //this is the work section
						
			setTimeout(function(){			
					
				if (mgbMainSys.mainContentLoaded == true) scope.overlayContainer.addClass('settle');
				
		        $("#overlayContent").addClass("active");
				
				mgbHeader.logoAnimation.progress(1, false);
				
			},1000)
			
			setTimeout(function(){
				
				if (scope.mainContainer) {
					
					scope.videoHeaderContainer.addClass('settle');

					scope.videoHeaderContainer.css('height',videoHolderHeight+'px');
				}
				
			},3000)
			
		}else{
			
			this.overlayContainer.addClass('settle');

			setTimeout(function(){
				scope.videoHeaderContainer.addClass('settle');
			}, 1000);
			
			this.videoHeaderContainer.css('height',videoHolderHeight+'px');
		}*/	
	},
	
	toggleHeaderElements: function() {
		// $("#header").fadeOut('fast');
		// $("#downArrow").fadeOut('fast');
		// $(".video-overlay").fadeOut('fast');
		
		$("#header").addClass('hidden');
		$("#downArrow").addClass('hidden');
		$(".video-overlay").addClass('hidden');
		
		$('#welcomeVideo').addClass('aboutUs');
		
	},
	
	killAboutUsVideo:function(){
		
		// $("#header").fadeIn('fast');
		// $("#downArrow").fadeIn('fast');
		// $(".video-overlay").fadeIn('fast');
		
		$("#header").removeClass('hidden');
		$("#downArrow").removeClass('hidden');
		$(".video-overlay").removeClass('hidden');
		
		$('#welcomeVideo').removeClass('aboutUs');
		
		this.loadHeaderVideo();
		
	},
	
	initWordCycle:function(){
		var that = this;
		// var headerWords = new TimelineMax({onComplete: function(){that.wordCycleComplete()}});
		var spinLength = 1;
		var n = 0;
		
		for (i=0; i < spinLength*10; i++){
			this.headerWords.addCallback(function(){that.changeHeaderCopy()}, i * .1);
		}
		
		for (i=0;i<13;i++){
			if (i > 0) n += ((i-1) * .1)/2.5;
			this.headerWords.addCallback(function(){that.changeHeaderCopy()}, spinLength + n);
		}	
	},
	
	initHeaderCopy:function(){
		var that = this;
		
		this.wordArray = $(".headerHeroText").data("words").split(",").sort(function() { return 0.5 - Math.random() });
		
		this.messageContainer.on('click', function(){
			$(".headerHeroText").text('');
		});
		
		this.messageContainer.keypress(function(e){
			var code = e.which;
			if(e.which == 13){
				e.preventDefault();
				mgbMainSys.gaTracking('Home|HeaderText|'+$(".headerHeroText").text());
				mgbHeroVideo.headerWords.restart();
				$(".headerHeroText").blur();
			}
		});
		
		$(".cta").on("click", function(){
			that.aboutUsVideoId = $(this).data('content');
			
			that.toggleHeaderElements();
			
			$("#headerVideo").html('<iframe src="https://player.vimeo.com/video/' + that.aboutUsVideoId + '?background=0 width="400" height="225" frameborder="0" id="vimeoPlayer" data-vimeoId="'+that.aboutUsVideoId+'" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
			
			that.vimeoPlayer = new Vimeo.Player($('#headerVideo'));
			
			that.vimeoPlayer.ready().then(function(){
				that.vimeoPlayer.setLoop(false);
				that.addVideoEvents();
				
				// that.vimeoPlayer.play();
				// that.vimeoPlayer.setVolume(1);
				// $("#headerVideo #vimeoPlayer").css({"width": "100%", "height":"100%" });
				// 
			});
			
			$('#headerVideo').fitVids();
			
			that.resize();
			
			/*that.vimeoPlayer.loadVideo(vId).then(function(id) {
				//that.vimeoplayer.setVolume(1);
				//that.vimeoPlayer.setLoop(false);
				//that.vimeoPlayer.play();	
				
				setTimeout(function(){
					$("#headerVideo #vimeoPlayer").css({"width": "100%", "height":"100%" });
				}, 1000);
		//	}).catch(function(error) {
				
				//console.log('Could not load video');
				// that.resize();
				$('#headerVideo').fitVids();
			});*/
		});
		
		
		this.changeHeaderCopy();
		
		if(location.hash === '') {
			this.initWordCycle();
		}
	},
	
	addVideoEvents : function(){
		var that = this;
		var vimeoProgress = 0;
		
		this.vimeoPlayer.on('pause', function() {
			mgbMainSys.gaTracking('AboutUs_Video|'+that.aboutUsVideoId+'|_PAUSED');
		});
		
		this.vimeoPlayer.on('ended', function() {
			mgbMainSys.gaTracking('AboutUs_Video|'+that.aboutUsVideoId+'|_COMPLETE');
		});
		
		this.vimeoPlayer.on('timeupdate', function(e) {
			var progress = e.percent * 100;
			if (progress > 0 && progress <= 25) {
				if (vimeoProgress !== 0 ) {
					mgbMainSys.gaTracking('AboutUs_Video|'+that.aboutUsVideoId+'|_STARTED');
					vimeoProgress = 0;
				}
			} else if (progress > 25 && progress <= 50) {
				if (vimeoProgress !== 25 ) {
					mgbMainSys.gaTracking('AboutUs_Video|'+that.aboutUsVideoId+'|_25');
					vimeoProgress = 25;
				}
			} else if (progress > 50 && progress <= 75) {
				if (vimeoProgress !== 50) {
					mgbMainSys.gaTracking('AboutUs_Video|'+that.aboutUsVideoId+'|_50');
					vimeoProgress = 50;
				}
			} else if (progress > 75) {
				if (vimeoProgress !== 75) {
					mgbMainSys.gaTracking('AboutUs_Video|'+that.aboutUsVideoId+'|_75');
					vimeoProgress = 75;
				}
			}
		});
		
		this.vimeoPlayer.play();	
		
	},
	
	changeHeaderCopy:function(){
		this.firstWord = this.wordArray.shift();
		this.messageContainer.html(this.firstWord);
		this.wordArray.push(this.firstWord);
	},
	
	wordCycleComplete:function(){
		
		$(".moreMsg").delay(500).slideDown();
		if(this.giveFocus === true) {
			mgbHeader.messageContainer.focus();
		}
		
		//mgbMainSys.addGlitch('.fullBleed, #mbLogo, .menu, .responsive-video,.video-overlay,.socialIcons,.legal',250);
		mgbMainSys.addGlitch('#mbLogo, .menu, .responsive-video,.video-overlay,.socialIcons,.legal',250);
		
		if (this.glitchesInitialized == false) {
			mgbMainSys.initializeGlitches(2000);
		}
	},
	
	loadHeaderVideo: function() {
		var that = this;
		this.maxVideoHeight = 700;
		//var headerVideoPath = 'assets/videos/Main_Sequence_opt';
		
		$("#headerVideo").html('<iframe src="https://player.vimeo.com/video/176376361?background=1 width="400" height="225" frameborder="0" id="vimeoPlayer" data-vimeoId="176376361" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
		
		that.vimeoPlayer = new Vimeo.Player($('#headerVideo'));
		
		that.vimeoPlayer.ready().then(function(){
			that.vimeoPlayer.setLoop(true);
		});
		
		//setTimeout(function(){
			$("#headerVideo #vimeoPlayer").css({"width": "100%", "height":"100%" });
			//}, 1000);

		// $('.videoWrapper').fitVids();
		
		this.resize();
	}
};

// Module to handle site content
var mgbContent = {
    portfolioContent: null,
    cultureContent: null,
    officeClocks: null,
	cultureTimeout: null,
	newsContent: null,
	
	cultureContentInit:false,
    
    init: function() {
        this.portfolioContent = $('.projectTile');
        this.cultureContent = $('.cultureTile');
        this.officeClocks = $('.officeTile');
		this.newsContent = $('.newsTile');
        
        this.initPortfolioCnt();
        this.initCultureCnt();
        this.initClockCnt();
		this.initNewsCnt();
    },
	
	deactivateActiveContent : function(){
		if (mgbMainSys.mainContentLoaded == true) {
			this.portfolioContent.each(function(){
				if($(this).children("a").hasClass("active")) {
					$(this).children("a").removeClass("active");
				}
			});
		}
	},
    
    initPortfolioCnt: function() {		
		var that = this;
		
        var c_obj = {
            slide: '.vimeoSlide',
            autoplay: false,
            dots: false,
            speed: 300,
            infinite: false,
            fade: false,
			centerMode: true,
            prevArrow: '<button type="button" data-ga-label="Arrow_Left" class="slick-prev">View previous home page carousel slide</button>',
            nextArrow: '<button type="button" data-ga-label="Arrow_Right" class="slick-next">View next home page carousel slide</button>',
            customPaging: function (slick, index) {
                return '<button type="button" data-ga-label="MarqueeDot' + (index + 1) + '" data-role="none" role="button" aria-required="false" tabindex="0">Slide ' + (index + 1) + ' of ' + slick.slideCount + '</button>';
            },
            onInit: function () {

                //$('.carousel-wrapper').fadeTo(600, 1);
				
				//setTimeout(function(){ $('.vimeoVideos').slick('slickPlay'); }, 500)
				
				//addPlayPause('pause');
                //$('.vimeoVideos').append('<p class="slide-count">' + setSlideCount(this.currentSlide) + '</p>');

              //  $('.vimeoVideos .slick-prev, .slick-next').on('click', function () {
                    /*var getButton = $(event.target).data( "ga-label" );
					
                    if(getButton == "Arrow_Right"){
                        trackGAEvent("header", "click", "Arrow_Right");
                    }
                    else{
                        trackGAEvent("header", "click", "Arrow_Left");
                    }

					$('.vimeoVideos').slick('slickPause');
					
					//togglePlayPause('play');*/
                   
             //   });

                //for ada removing the slide count on init
                //$('.slide-count').remove();
            },
            onBeforeChange: function (event, slick) {
               // $('.vimeoVideos .slick-prev, .slick-next').attr('disabled', true);
            },
            onAfterChange: function (event, slick) {
				
                //-- one rotation
                /*var oneRotation = this.currentSlide + 1 * getTotalSlides() == getTotalSlides();
                if (oneRotation) {
                    $(".vimeoVideos").slickPause();
                }*/
                
            }
        };
		
        this.portfolioContent.each(function() {
            $(this).children("a").on('click', function(e) {
				e.preventDefault();
				/*$(".vimeoVideos").empty(); // clear out carousel
				
                var videoID = $(this).attr("data-url").split(","); // get the id's for this video
				
                var header = $(this).attr("data-header");
				var title = $(this).attr("data-title");
				var defUrl = "http://player.vimeo.com/video/"; // default vimeo url
				
                if(videoID[0] !== "") {
					// loop through ID's and create the video slide show
					
					for(var i = 0, len = videoID.length; i < len; i++){	
						var frameFrag = '<div class="vimeoSlide"><div class="vimeoHolder"><div class="vimeoVideo"><iframe src="https://player.vimeo.com/video/'+videoID[i]+'?title=0&byline=0&portrait=0&badge=0&api=1" width="400" height="225" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div><div class="vimeoTitle">title</div></div></div>';
						
						$(".vimeoVideos").append(frameFrag);
					}
					
					$('.vimeoVideos').fitVids();
					
					setTimeout(function(){
						
			            $(".vimeoVideos").on('init', function (event, slick) {
			                slick.options.onInit(event, slick);
			            });
			            $(".vimeoVideos").on('beforeChange', function (event, slick) {
			                slick.options.onBeforeChange(event, slick);
			            });
			            $(".vimeoVideos").on('afterChange', function (event, slick) {
			                slick.options.onAfterChange(event, slick);
			            });

			            $(".vimeoVideos").slick(c_obj); //-- passing object from above into carousel
						
						$('.vimeoContainer').addClass('loaded');
						
					},1000);
								
				
                    $("nav").toggleClass("overlayActive");
					$(".navigation").fadeOut(200);
                    $(".vimeoContainer").addClass("active");
					$(".vimeoContainer").children(".videoTitle").html(header);
					$(".vimeoContainer").children(".videoDescription").html(title);
                    $(this).addClass("active");
                }*/
               
			   mgbHeader.deactivateNavActive();
			   $("#nav-work").addClass('active');
				var thisPage = $(this).data('content');
				mgbMainSys.getPage(thisPage,true);	
            });
        });
		
		$('#projectTileMore').on('click',function(e){
			e.preventDefault();
			
			that.loadMoreContent('projectTile',mgbMainSys.pMoreTarget);
			mgbMainSys.pLoaded += mgbMainSys.pMoreTarget;
		});
    },
    
    
    initCultureCnt: function() {
        var that = this;
		
		console.log('inicultureContentInit')
		this.cultureContentInit = true;
		/*$('.closeCulture').on('click', function(e) {
			$('.cultureTile').removeClass('shrinkMe stretchOut');
		});*/
		
        this.pushLeftPushRight($('.homeSection .pushLeft .cultureLink'),$('.homeSection .pushRight .cultureLink'));
		
		$('#cultureTileMore').on('click',function(e){
			e.preventDefault();
			
			that.loadMoreContent('cultureTile',mgbMainSys.cMoreTarget);
			
			mgbMainSys.cLoaded += mgbMainSys.cMoreTarget;
		});
    },
	
	findNext : function(el){
		//used to find next culture item
		//important on all culture page when "next" item may be hidden
		var $el = el,p = $el.parent().next();
		for (var i=0;i<10;i++){
			if (p.hasClass('hide')) {
				$el = p;
				p = $el.next();
			}else{
				return p;
			}
		}
		
		return p;
	},
	
	findPrev : function(el){
		//used to find prev culture item
		//important on all culture page when "prev" item may be hidden
		var $el = el,p = $el.parent().prev();
		for (var i=0;i<10;i++){
			if (p.hasClass('hide')) {
				$el = p;
				p = $el.prev();
			}else{
				return p;
			}
		}
		
		return p;
	},
	
	
	pushLeftPushRight : function(leftEl,rightEl){
		var that = this;
		var elR = rightEl;
		var elL = leftEl;

		$(elR).each(function(index) {
			var cleanup;
	        $(this).on('mouseenter', function(e) {
					 // e.preventDefault();
					e.stopPropagation();
			
					that.setCultureTileHeight();
					
				//	clearTimeout(cleanup);
            		
		            if (!$(this).parent().hasClass("stretchOut")) {
		                $(this).parent().siblings().removeClass("shrinkMe stretchOut");
		            }
            
		            var nextTile = that.findNext($(this));
		            var picHolder = nextTile.find('.picHolder');
            
		            var colW = picHolder.width();
		            //move this to a global var on resize???
            
		            if (!$(this).parent().hasClass('stretchOut')) {
		                picHolder.css('min-width', colW + 'px');
		            }
			
		            nextTile.toggleClass("shrinkMe");
		            $(this).parent().toggleClass('stretchOut');
				});
				
			$(this).on('mouseleave',function(e){
				e.stopPropagation();
				$('.cultureTile').removeClass('shrinkMe stretchOut'); 
				/*cleanup = setTimeout(function(){
					$('.picHolder').removeAttr('style');
				},1500);*/
				
			})
		});
		
		$(elL).each(function(index) {
			var cleanup;
	        $(this).on('mouseenter', function(e) {
				// e.preventDefault();
					e.stopPropagation();

					that.setCultureTileHeight();
					
					//clearTimeout(cleanup);

					if (!$(this).parent().hasClass("stretchOut")) {
					    $(this).parent().siblings().removeClass("shrinkMe stretchOut");
					}

					var prevTile =  that.findPrev($(this));//$(this).parent().prev();
					var picHolder = prevTile.find('.picHolder');

					var colW = picHolder.width();
					//move this to a global var on resize???

					if (!$(this).parent().hasClass('stretchOut')) {
					    picHolder.css('min-width', colW + 'px');
					}

					prevTile.toggleClass("shrinkMe");
					$(this).parent().toggleClass('stretchOut');
				});
				
			$(this).on('mouseleave',function(e){
				e.stopPropagation();
				$('.cultureTile').removeClass('shrinkMe stretchOut'); 
				/*cleanup = setTimeout(function(){
					
					$('.picHolder').removeAttr('style');
				},1500);*/
			});
		});
       
	},
	
	loadMoreContent:function(tar,num){
		
		//make sure the culture tiles have a height to animate against
		if (tar == 'cultureTile') {
			this.setCultureTileHeight();
			$('#news .sectionButton').removeClass('show');
		  	setTimeout(function(){
				//contents on the page will more down, so reset waypoints.
		    	mgbMainSys.initWaypoints();
		    }, 500);
		}
		
		//REMOVED THIS TEMPORARILY. WAS WONKY ON SAFARI!!
		//make sure the project tiles have a height to animate against
		//then remove it once the animation is complete.
		/*if (tar == 'projectTile'){
			
			//use the fourth project because it is guaranteed to have a 1x1 ratio
			var colW = $('.projectTile:nth-child(4) a').width();
			$('.projectTile').css('height', colW + 'px');
			
		  	setTimeout(function(){
		    	$('.projectTile').removeAttr('style');
		    }, 2000);
		}*/
		
		var newContent = $("."+tar+".notLoaded").slice(0, num);
		
		for (var i=0, len = newContent.length; i < len; i++){
			var nc = $(newContent[i]);
			nc.removeClass('notLoaded');
			
			(function(content){
			  	setTimeout(function(){
					//removing 'notShowing' removes the zero value for margin and height
			    	content.removeClass('notShowing');
			    }, 150);
				
				setTimeout(function(){
					//removing 'lazy' fades the image in
			    	content.find('img').removeClass('lazy');
			    }, 450);
				
			  }(nc));
		
		}
		
		//remove the plus button
		if ($("."+tar+".notLoaded").length == 0) {
			setTimeout(function(){$("#"+tar+"More").parent().removeClass('active'); }, 500);
		}
	},

	initClockCnt: function() {
		$(".officeTile").each(function(index) {
			var timeOffset = parseInt($(this).data("timeOffset")), 
			d = new Date(), 
			utc = d.getTime() + (d.getTimezoneOffset() * 60000), 
			nd = new Date(utc + (3600000 * timeOffset));

			var ndHours = nd.getHours();
			var ndMinutes = nd.getMinutes();

			var ampm = "AM";
			if (ndHours > 12) {
			ndHours -= 12;
			ampm = "PM";

			}

			var clockHours = Math.floor((ndHours / 12) * 100) + "%";
			var clockMinutes = Math.floor(100 * (ndMinutes / 60)) + "%";

			/* nd = nd.toLocaleString({
			hour: 'numeric',
			minute: 'numeric'
			}).replace(/:\d{2}\s/, ' ').split(",")[1];*/

			if (ndHours == 0) ndHours = 12;
			if (ndMinutes < 10) ndMinutes = "0" + ndMinutes;
			var displayTime = ndHours + ":" + ndMinutes + " " + ampm;
			// console.log("nd",displayTime);

			$(this).children("a").find("time").text(displayTime);

			var hrEle = $(this).find(".clockHours");
			var minEle = $(this).find(".clockMinutes");

			TweenMax.to(hrEle, 1, {
				transformOrigin: "50% 50%",
				drawSVG: clockHours,
				overwrite: true
			});
			
			TweenMax.to(minEle, 1, {
				transformOrigin: "50% 50%",
				drawSVG: clockMinutes,
				overwrite: false
			});
			
			var btn = $(this).find('a');
			btn.on('click', function() {
				var currThis = $(this).parent();
				currThis.siblings().children("a").removeClass("active");
				currThis.children("a").addClass("active");

				var officeDataText = currThis.children('article').html();
				
				$("#officeDetails").removeClass('showDetails');
				
				$("#officeDetails").html('');
				$("#officeDetails").html(officeDataText);
				
				/*var titleLength = $("#officeDetails h3").text().length;
				if (titleLength > 10) {
					$(".rightSide h3").addClass("long");
				}else{
					$(".rightSide h3").removeClass("long");
				}*/
				
				
				// setTimeout(function(){
				// 					var rightHeight = $("#officeDetails").find(".rightSide").height();
				// 					$("#officeDetails").find(".leftSide").attr("max-height", rightHeight + "px");
				// 				}, 1000);

				// location.hash = 'officeDetails';
				
				mgbMainSys.scrollToSection("offices",250);

				setTimeout(function() {
					/*var rs = $('.rightSide .info').height();
					$("#officeDetails").css('height',rs+"px");
					var statsH = $('.officeStats').height() 
					$(".leftSide").css('height',(rs + statsH + 22)+"px");*/
					
					
					//animated the margin to exposes section
					$("#officeDetails").css('margin-bottom','600px');
					
					setTimeout(function() {
						
						$("#officeDetails").addClass('showDetails mb0');
						$("#officeDetails").css('visibility','visible');
						$("#officeDetails").css('margin-bottom',total+"px").css('opacity',1);
						
						$(".rightSide").attr("tabindex",-1).focus();
						
						var rs = $('.rightSide').height();
						var pt = $('.rightSide').css('padding-top').replace("px", "");
						var pb = $('.rightSide').css('padding-bottom').replace("px", "");
						var total = (Number(rs) + Number(pt) /*+ Number(pb) - 6*/);
						
						// console.log(rs,pt,pb,total);
						// $("#officeDetails").css('height',total+"px");
						$(".leftSide").css('height',total+"px");
						
						
						
					}, 750);
					
					$('.closeMe').on('click', function(e) {
						e.preventDefault();
						
						$('.officeTile a').removeClass("active");
						
						$("#officeDetails").addClass('removed').removeClass('mb0');
						
						setTimeout(function(){
							$("#officeDetails").removeClass('showDetails').removeAttr("style").removeClass('removed');
							$("#officeDetails").html('');
						},300)
						
					});
					
				}, 500);
			});
		});

		setInterval(function(){
			$(".officeTile").each(function(index){
				var timeOffset = parseInt($(this).data("timeOffset")),
				d = new Date(),
				utc = d.getTime() + (d.getTimezoneOffset() * 60000),
				nd = new Date(utc + (3600000*timeOffset));

				var ndHours = nd.getHours();
				var ndMinutes = nd.getMinutes();

				var ampm = "AM";
				if (ndHours > 12) {
				    ndHours -= 12;
					ampm = "PM";
				}

				var clockHours = Math.floor((ndHours / 12) * 100) + "%";
				var clockMinutes = Math.floor(100 * (ndMinutes / 60)) + "%";

				if (ndHours == 0) ndHours = 12;
				if (ndMinutes < 10) ndMinutes = "0" + ndMinutes;
				var displayTime = ndHours + ":" + ndMinutes + " " + ampm;
			
				$(this).children("a").find("time").text(displayTime);

				var hrEle = $(this).find(".clockHours");
				var minEle = $(this).find(".clockMinutes");

				TweenMax.to(hrEle, 1, {transformOrigin:"50% 50%", drawSVG: clockHours, overwrite:true});
				TweenMax.to(minEle, 1, {transformOrigin:"50% 50%", drawSVG: clockMinutes, overwrite:false});
				});
			}, 60000);
    },
	
	initNewsCnt : function() {
		var that = this;
		
		$('#newsTileMore').on('click',function(e){
			e.preventDefault();
			
			that.loadMoreContent('newsTile',mgbMainSys.pMoreTarget);
			mgbMainSys.pLoaded += mgbMainSys.pMoreTarget;
		});
	},
	
	setCultureTileHeight: function(){
		var that = this;
			
		clearTimeout(this.cultureTimeout);
		
		// console.log('setCultureTileHeight')
				
		this.cultureTimeout = setTimeout(function(){
			
			// var colW = that.cultureContent.first().next().find('.picHolder').innerWidth();
			
			var firstStatic = $('.cultureTile.static').first();
			
			if ($('#mainContent').hasClass('inactive')) firstStatic = $('#globalLeadershipWrapper .cultureTile.static').first();
			
			var colW = firstStatic.find('.picHolder').innerWidth();
			
			/*//for the global culture page where there is no static content
			if (firstStatic.length == 0){
				colW = $('#globalLeadershipWrapper .cultureTile').first().find('.picHolder').innerWidth();
			}
			console.log('colW',colW);*/
			$('.cultureTile').removeAttr('style').css('height', colW + 'px');
			
			//checker for page load to make sure the content is ready.
			if (colW < 50) {
				$('.cultureTile').removeAttr('style');
				that.setCultureTileHeight();
			}
			
			if ($('.cultureTile').length > 0){// && !$('.cultureTile').hasAttr('style')){
				var attr = $('.cultureTile').attr('style');
				
				if (attr == undefined) {
					that.setCultureTileHeight();
					console.log('cultureTile does not have style attribute');
				}
				
			}
	
		},350);
		
	},
	
	resize: function() {
		var that = this;

		this.setCultureTileHeight();
		
		$('.arrow').addClass('offTile');
		$('.picHolder').removeAttr('style');
		if(that.cultureContent) that.cultureContent.removeClass("stretchOut shrinkMe");
		
		setTimeout(function(){		
			$('.arrow').removeClass('offTile');
		},600);

		if ($("#officeDetails").hasClass('showDetails')) {
			$('.ribbon').addClass('moving');
			setTimeout(function(){
				$('.ribbon').removeClass('moving');
			},350);
			
			var rs = $('.rightSide').height();
			var pt = $('.rightSide').css('padding-top').replace("px", "");
			var pb = $('.rightSide').css('padding-bottom').replace("px", "");
			//$("#officeDetails").css('height',rs+"px");
			//r statsH = $('.officeStats').height() 
			var total = (Number(rs) + Number(pt) /*+ Number(pb)- 6*/ );
			console.log('update office ',total);
			$(".leftSide").css('height',total+"px");
			
		}
		
		
	},
};


var mgbInternalContent = {
	allCultureFilter : [],
	vimeoPlayer:null,
	vimeoId:null,
	init: function() {
		var that = this;
		
		this.addListeners();
		setTimeout(function(){that.resize();$("#internalContent").addClass("active");},500);
		// mgbMainSys.showFooter();
	},
	
	kill : function(){
		$("#internalContent").removeClass("active");
		// $('#overlayCover').removeClass('active');
	},
	addListeners : function(){
		var that = this;
		
		$('.subnav a').on('click',function(e){
			e.preventDefault();		
			// mgbHeader.deactivateNavActive();
			mgbMainSys.getPage($(this).attr('href'), true);
		
			mgbContent.deactivateActiveContent();
		});
		
		$('.workThumb a').on('click', function(e){
			e.preventDefault();
			if ($(this).hasClass('active')) return;
			$('.workThumb a').removeClass('active');
			$(this).addClass('active');
			var vidId = $(this).attr('data-content');
			that.loadVideo(vidId);
		});
		
		$('.videoClose').on('click', function(e){
			e.preventDefault();
			$('.workThumb a').removeClass('active');
			that.removeVideo();
		});
	},
	addAllNewsListeners : function(){
		mgbMainSys.allNewsLoaded = true;
	},
	addAllCultureListeners : function(){
		
		this.allCultureFilter = [];
		var that = this;

		if (mgbContent.cultureContentInit == false) mgbContent.initCultureCnt();
		mgbContent.cultureContent = $('.cultureTile');
		mgbContent.setCultureTileHeight();
		mgbMainSys.allCultureLoaded = true;
		that.filterAllCulture('all');
		
		$('input:checkbox[name=radio-select]').change(function() {
			
			$('#globalLeadershipWrapper label').removeClass('active');
			that.allCultureFilter = [];
			
			that.allCultureFilter.push(this.value);
			$('#label-select-'+this.value).addClass('active');
			
			$('select').val(this.value);
			
			var filterOption = "";
			if (that.allCultureFilter[0] == "all") filterOption = "all";
			that.filterAllCulture(filterOption);
		});
	   
	   $('select').change(function() {
		   $('#globalLeadershipWrapper label').removeClass('active');
		   
		   	that.allCultureFilter = [];
		   	that.allCultureFilter.push(this.value);
		  	
			$('#label-select-'+this.value).addClass('active');
			
			var filterOption = "";
			if (that.allCultureFilter[0] == "all") filterOption = "all";
			that.filterAllCulture(filterOption);
	   });
	   
	},	
	
	filterAllCulture : function(filterList){
		
		var that = this;
		var tempCultureList = [];
		$( "#globalLeadershipWrapper .cultureTile" ).each(function( index ) {
			var filter = $( this ).data('office-filter');
			var tile = $(this);
			var chosen = jQuery.inArray(filter, that.allCultureFilter);
			
			// if (tile.hasClass('col-2-by-1')) chosen = 1;
			
			tile.removeClass('shrinkMe');
			tile.removeClass('stretchOut');
			tile.removeClass('hide');
			
			
			if (chosen == -1 && filterList != "all") {
				if (!tile.hasClass('static')) tile.addClass('hide');
			}else{
				// var hasInfo = (tile.hasClass('pushLeft') || tile.hasClass('pushRight')) ? true : false;
				var hasInfo = false;
				if (tile.hasClass('pushLeft') || tile.hasClass('pushRight')){
					hasInfo = true;
					tile.removeClass('pushLeft');
					tile.removeClass('pushRight');
				}
				
				if (!tile.hasClass('static')) tempCultureList.push('count');
				
				if (tile.hasClass('col-2-by-1')) tempCultureList.push('count');
				
				if (hasInfo){
					if (tempCultureList.length % 2 ==0){
						tile.addClass('pushLeft');
					}else{
						tile.addClass('pushRight');
					}
				}
			}
		});
		$('footer').addClass('tempHide');
		
		mgbContent.setCultureTileHeight();
		mgbMainSys.showFooter();
		
		setTimeout(function(){
			mgbMainSys.checkInView('.ll-all');
			$( "#globalLeadershipWrapper .cultureLink").off( "mouseenter mouseleave" );
			mgbContent.pushLeftPushRight($( "#globalLeadershipWrapper .pushLeft .cultureLink"),$( "#globalLeadershipWrapper .pushRight .cultureLink"));
		},1000);
		
	},
	
	loadVideo : function(id){
		var that = this;
		$('.videoHolder').empty();
		// console.log($('#heroImage').height())
		$('.videoHolder').css('height',$('#heroImage').height() + "px");
		
		$('#heroImage').addClass('faded collapsed');
		$('#header').addClass('removed');
		$('.videoClose').addClass('revealed');
		
		
		var videoHeight = (lastWindowWidth*9)/16;
		
		setTimeout(function(){
			$('.videoHolder').addClass('growing');
			$('.contentWrapper').addClass('growing');
			
			$('.videoHolder').css('height',videoHeight + "px");
			
			
			$('.videoHolder').html('<div class="videoWrapper"><iframe src="https://player.vimeo.com/video/'+id+'?title=0&byline=0&portrait=0&badge=0&autoplay=1&player_id=vimeoPlayer" width="400" height="225" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen id="vimeoPlayer" data-vimeoId='+id+'></iframe></div>');
		
			$('.videoWrapper').fitVids();
					
			
			$('html,body').animate({ scrollTop: 0 }, 'fast');

			
			that.initVideo();
			
			setTimeout(function(){mgbInternalContent.resize();},300);
			
			setTimeout(function(){
				$('.videoHolder').addClass('expanded').removeClass('growing');
				$('.contentWrapper').removeClass('growing');
			},600);
			
			
		},300);
	},
	
	initVideo : function(){
		// var that = this;
		// var iframe = $('#vimeoPlayer')[0];
		// var player = $f(iframe);
		
		var that = this;
		
		
		this.vimeoPlayer = new Vimeo.Player($('#vimeoPlayer'));
		
		this.vimeoPlayer.ready().then(function(){
			that.vimeoPlayer.setLoop(false);
			
			that.vimeoPlayer.getVideoId().then(function(id) {
	   		 	that.vimeoId = id;
				that.addVideoEvents();
			});
		});
		
	},
	
	addVideoEvents : function(){
		var that = this;
		var vimeoProgress = 0;
		
		this.vimeoPlayer.on('pause', function() {
			mgbMainSys.gaTracking('CS_Video|'+that.vimeoId+'|_PAUSED');
		});
		
		this.vimeoPlayer.on('ended', function() {
			mgbMainSys.gaTracking('CS_Video|'+that.vimeoId+'|_COMPLETE');
		});
		
		this.vimeoPlayer.on('timeupdate', function(e) {
			var progress = e.percent * 100;
			if (progress > 0 && progress <= 25) {
				if (vimeoProgress !== 0 ) {
					mgbMainSys.gaTracking('CS_Video|'+that.vimeoId+'|_STARTED');
					vimeoProgress = 0;
				}
			} else if (progress > 25 && progress <= 50) {
				if (vimeoProgress !== 25 ) {
					mgbMainSys.gaTracking('CS_Video|'+that.vimeoId+'|_25');
					vimeoProgress = 25;
				}
			} else if (progress > 50 && progress <= 75) {
				if (vimeoProgress !== 50) {
					mgbMainSys.gaTracking('CS_Video|'+that.vimeoId+'|_50');
					vimeoProgress = 50;
				}
			} else if (progress > 75) {
				if (vimeoProgress !== 75) {
					mgbMainSys.gaTracking('CS_Video|'+that.vimeoId+'|_75');
					vimeoProgress = 75;
				}
			}
		});
		
		this.vimeoPlayer.play();	
		
	},
	
	removeVideo : function(){
		$('.videoHolder').empty();
		$('.videoHolder').removeAttr('style');
		$('.videoHolder').removeClass('expanded');
		$('.videoHolder').css('height','0px');
		$('#heroImage').removeClass('faded collapsed');
		$('#header').removeClass('removed');
		$('.videoClose').removeClass('revealed');
		mgbInternalContent.resize();
		
		// setTimeout(function(){
		// },300);
	},

	resize : function(){
		/*$('footer').removeAttr('style');
		var footerY = Math.round($('footer').position().top);
		var footerH = lastWindowHeight - footerY;// - 16;
		$('footer').css('height',footerH+'px');*/
		
		//add height style to hero image to be able to collapse it using css3
		
		var maxHero = 350;
		
		if($("#heroImage").length > 0) {
			var hi = $('#heroImage img').innerHeight();
			if (hi>maxHero) hi=maxHero;
			// if (hi<400) hi=400;
			$('.subpageHeader').css('height',hi + "px");
			$('#heroImage').css('height',hi + "px");
			$('#internalContent .contentWrapper').css({'top':hi + "px",'margin-bottom':hi + "px"});
			// $('.videoHolder').css('height',hi + "px");
		}
		
		if($(".videoHolder").length > 0 ) {
			var hv = $('.videoWrapper').height();
			$('.videoHolder').css('height',hv+'px');
			$('.subpageHeader').css('height',hv + "px");
			$('#internalContent .contentWrapper').css({'top':hv + "px",'margin-bottom':hv + "px"});
		}
		
		mgbMainSys.showFooter();
	}
};



//can this device support autoplaying video (not a mobile device or tablet)

if($("body").hasClass("ishome")) { //this is the homepage
    mgbContent.init();
	mgbMainSys.mainContentLoaded = true;
	var pathname = window.location.pathname;
	
	if (pathname != appRoot){
		var section = pathname.replace('/', '');
		setTimeout(function(){mgbMainSys.scrollToSection(section,1000);},2000);	
	}
	// if (useHeaderVideo) loadHeaderVideo();
}else{
	// $('#overlayCover').addClass('active');
	mgbHeader.logoAnimation.progress(1, false);
	mgbInternalContent.init();
}


// mgbUtils.init();
mgbMainSys.init();
mgbHeader.init();
mgbHeroVideo.init();
//mgbTimeLine.init();

if(!isMobile.any()) {
	$('body').removeClass('no-autoplay').addClass('autoplay');
}


//globalization/flags
//uncomment .flag and select in _header_inc.php
//uncomment #header nav ul.menu:after css in _header.css
// mgbMainSys.handleOfficeSelector();


if($("body").hasClass("ishome") && !isMobile.any()) {
	mgbHeroVideo.loadHeaderVideo();
	
	// Check for location in header section
	/*if("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(function(pos){

			var lat = pos.coords.latitude;
			var lng = pos.coords.longitude;

			$.ajax({ url:'https://nominatim.openstreetmap.org/reverse?format=json&lat='+lat+'&lon='+lng+'&zoom=18&addressdetails=1',
			         success: function(data){
			             var countryCode = data.address.country_code;
			 
						 if(countryCode === "us") {
							 setTimeout(function(){
							 	$("#siteSelect").fadeIn();
							 }, 2000);
						 }
			         }
			});
		}, function(){
			console.log("Not able to get location.");
		});
	}*/
}


if($("body").hasClass("ishome")) {
	mgbMainSys.currPage = appRoot;
	
}else{
	mgbMainSys.collapseNav();
}

window.onscroll = mgbMainSys.handleScrolling;
window.onresize = resizeChecker;
// window.onunload = displayCurrentContent;


window.onpopstate = function (event) {
	//console.log('pop',event,loc = window.location.pathname);
	
    if (event.state) {
        // console.log('retrieving ', event.state.url, ' from history');
        mgbMainSys.getPage(event.state.url, false);
    }else{
    	mgbMainSys.getPage(window.location.pathname, false);
    }
};

// setTimeout(function(){
	//console.log("init reseize")
	// resize();
	// mgbMainSys.showFooter(); // show the footer once page is loaded
 // }, 750);

window.onload = resize;

var lastWindowHeight = $(window).height();
var lastWindowWidth = $(window).width();


	
function resizeChecker() {
    //confirm window was actually resized
    if ($(window).height() != lastWindowHeight || $(window).width() != lastWindowWidth) {
        //set this windows size
        lastWindowHeight = $(window).height();
        lastWindowWidth = $(window).width();
		
		
		
		//call resize function
        resize();
	}
}

function resize(){
	
	// console.log('resize')
	mgbHeader.resize();
	mgbHeroVideo.resize();
	
	if (lastWindowWidth < (768 - 16)){
		$('body').addClass('small');
	}else{
		$('body').removeClass('small');
	}
		
	if (mgbMainSys.mainContentLoaded == true || mgbMainSys.allCultureLoaded == true || mgbMainSys.allNewsLoaded == true) {
		mgbMainSys.resize();
		mgbContent.resize();
	}
	
	if ($('#internalContent').hasClass('active')) mgbInternalContent.resize();
}



