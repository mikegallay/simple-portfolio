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