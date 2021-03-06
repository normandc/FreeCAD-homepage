// SLIDESHOW +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

/**
* TinyFader 2.0.2 - scriptiny.com/tinyfader
* License: GNU GPL v3.0 - scriptiny.com/license
*/

var TINY = {};

function T$( i ) {
	return document.getElementById(i);
}
function T$$( e, p ) {
	return p.getElementsByTagName(e);
}

TINY.fader = function() {
	var p = {
		position: 0,
		auto: 0,
		navEvent: "click",
		duration: .25
	};
	function init( n, o ) {
		p.n = n;
		for ( s in o ) {
			p[s] = o[s]
		}
		this.build();
	}
	
	// Create slideshow object
	init.prototype.build = function() {
		var fader = T$(p.id),
		slides = p.slides = T$$("li", fader),
		total = slides.length,
		i = p.count = 0;
		fader.style.overflow = "hidden";
		for ( i; i < total; i++ ) {
			var slide = slides[i];
			if ( slide.parentNode == fader ) {
				slide.className += " fader-slide";
				slide.opacity = 0;
				slide.style.filter = "alpha(opacity=0)";
				p.count++;
			}
			if ( p.pauseHover ) {
				slide.onmouseover = new Function(p.n + ".pause()");
				slide.onmouseout = new Function(p.n + ".play()");
			}
		}
		if ( p.navid ) {
			var nav = T$(p.navid);
			if ( p.pauseHover ) {
				nav.onmouseover = new Function(p.n + ".pause()");
				nav.onmouseout = new Function(p.n + ".play()");
			}
			nav.style.display = "block";
			p.nav = T$$("li", nav);
			for ( var x = 0; x < p.count; x++ ) {
				if ( p.nav[x].addEventListener ) {
					p.nav[x].addEventListener(p.navEvent, new Function(p.n + ".pos(" + x + ")"), 0);
				} else {
					p.nav[x].attachEvent("on" + p.navEvent, new Function(p.n + ".pos(" + x + ")"), 0);
				}
			}
		}
		p.cssTrans = ( document.body.style.webkitTransition !== undefined ) || ( document.body.style.MozTransition !== undefined );
		this.pos(p.position, p.auto, 1);
	};
	
	// Start the automatic rotation
	init.prototype.play = function() {
		if ( !p.slides.ai ) {
			p.slides.ai = setInterval(new Function(p.n + ".move(1, 1)"), p.auto * 1000);
		}
	};
	
	// Pause the automatic rotation
	init.prototype.pause = function() {
		clearInterval(p.slides.ai);
		p.slides.ai = 0;
	};
	
	// Transition the slideshow to the left (-1) or right (1)
	init.prototype.move = function( dir, auto ) {
		var target = p.current + dir,
		index = ( dir == 1 ) ? ( target == p.count ) ? 0 : target : ( target < 0 ) ? p.count - 1 : target;
		this.pos(index, auto);
	};
	
	// Transition the slideshow to a particular slide
	init.prototype.pos = function( index, auto ) {
		if ( p.current != index ) {
			var slide = p.slides[index];
			for ( var x = 0; x < p.count; x++ ) {
				p.slides[x].style.zIndex = ( x == index ) ? 3 : ( x == p.current ) ? 2 : 1;
			}
			clearInterval(slide.si);
			this.pause();
			if (p.nav) {
				for ( var x = 0; x < p.count; x++ ) {
					p.nav[x].className = ( x == index ) ? p.activeClass : "";
				}
			}
			if ( p.duration ) {
				if ( p.cssTrans ) {
					if ( slide.className.indexOf("fader-fade") != -1 ) {
						slide.className = slide.className.replace(" fader-fade", "");
					}
					slide.si = setTimeout( function(){
						slide.className += " fader-fade";
					}, 20);
					if ( ( auto || ( p.auto && p.resume ) ) && !p.slides.ai ) {
						this.play();
					}
				} else {
					if ( slide.opacity >= 100 ) {
						slide.opacity = slide.style.opacity = 0;
						slide.style.filter = "alpha(opacity=0)";
					}
					slide.si = setInterval(new Function(p.n + ".fade(" + index + ", " + auto + ")"), ( (p.duration * 1000) / 10 ));
				}
				p.current = index;
			}
		}
	};
	
	// Slide fade transition
	init.prototype.fade = function( index, auto ) {
		var slide = p.slides[index];
		if ( slide.opacity >= 100 ) {
			clearInterval(slide.si);
			if ( ( auto || ( p.auto && p.resume ) ) && !p.slides.ai ) {
				this.play();
			}
		} else {
			slide.opacity += 10;
			slide.style.opacity = slide.opacity / 100;
			slide.style.filter = "alpha(opacity=" + slide.opacity + ")";
		}
	};
	
	return{init:init}
}();


// FEED READER +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

function JSONscriptRequest(fullUrl) {
    // REST request path
    this.fullUrl = fullUrl; 
    // Get the DOM location to put the script tag
    this.headLoc = document.getElementsByTagName("head").item(0);
    // Generate a unique script tag id
    this.scriptId = 'JscriptId' + JSONscriptRequest.scriptCounter++;
}

// Static script ID counter
JSONscriptRequest.scriptCounter = 1;

JSONscriptRequest.prototype.buildScriptTag = function () {
    // Create the script tag
    this.scriptObj = document.createElement("script");
    // Add script object attributes
    this.scriptObj.setAttribute("type", "text/javascript");
    this.scriptObj.setAttribute("charset", "utf-8");
    this.scriptObj.setAttribute("src", this.fullUrl);
    this.scriptObj.setAttribute("id", this.scriptId);
}

JSONscriptRequest.prototype.removeScriptTag = function () {
    // Destroy the script tag
    this.headLoc.removeChild(this.scriptObj);  
}

JSONscriptRequest.prototype.addScriptTag = function () {
    // Create the script tag
    this.headLoc.appendChild(this.scriptObj);
}

function loadJSON(jsonfeed) {
    ddiv = document.getElementById("newsfeed");
    ddiv.innerHTML = "Connecting to yahoo pipes...";
    var obj=new JSONscriptRequest(jsonfeed+'&_callback=showJSON');
    obj.buildScriptTag(); // Build the script tag
    obj.addScriptTag(); // Execute (add) the script tag
    ddiv.innerHTML = "Retrieving feed...";
}

function showJSON(data) {
    ddiv = document.getElementById("newsfeed");
    html = '';
    var x;
    for (x = 1; x < 11 ; x++) {
        var pubdate = data.value.items[x].pubDate;
        var title = truncate(data.value.items[x].title);
        //var title = data.value.items[x].title;
        pubdate = "<small>" + pubdate.substr(0,4) + "." + pubdate.substr(5,2) + "." + pubdate.substr(8,2) + ": </small> ";
        var buildstring = "<li>" + pubdate + "<a href=" + data.value.items[x].link + ">" + title + "</a></li>";
        html += buildstring;
        buildstring = null;
    }
    ddiv.innerHTML = html;
}

 /* truncate function, Author: Andrew Hedges, andrew@hedges.name
 * License: free to use, alter, and redistribute without attribution */

function truncate(str) {
    var bits, i;
    var limit=100;
    bits = str.split("");
    if (bits.length > limit) {
        for (i = bits.length - 1; i > -1; --i) {
            if (i > limit) {
                bits.length = i;
            }
            else if (" " === bits[i]) {
                bits.length = i;
                break;
            }
        }
        bits.push(" (...)");
    }
    return bits.join("");
}
    
