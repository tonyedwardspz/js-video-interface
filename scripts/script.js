

$(function() {
    $( ".draggable" ).draggable({
    	revert: true,
    	containment: 'window',
    	helper: 'clone'
    });
    $( ".droppable" ).droppable({
    	// hoverClass: "ui-state-hover",
    	drop: handleDrop
	});
});


function handleDrop (event, ui ) {
    console.log("dropped");

    // disable the current draggable and droppable elements
    ui.draggable.draggable( 'disable' );
	$(this).droppable( 'disable' );

	// position the dropped element, disableing the revert
    ui.draggable.position({ 
    	of: $(this), 
    	my: 'left top', 
    	at: 'left top' 
    });
	ui.draggable.draggable( 'option', 'revert', false );

	// inject new droppable area
	var newDroppable = "<div class='droppable'></div>";
	$('aside').append(newDroppable);
	$( ".droppable" ).droppable({
    	// hoverClass: "ui-state-hover",
    	drop: handleDrop
	});
}
	


/*! jQuery UI Touch Punch 0.2.3 - For tablet devices
 * Copyright 2011–2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.*/
!function(a){function f(a,b){if(!(a.originalEvent.touches.length>1)){a.preventDefault();var c=a.originalEvent.changedTouches[0],d=document.createEvent("MouseEvents");d.initMouseEvent(b,!0,!0,window,1,c.screenX,c.screenY,c.clientX,c.clientY,!1,!1,!1,!1,0,null),a.target.dispatchEvent(d)}}if(a.support.touch="ontouchend"in document,a.support.touch){var e,b=a.ui.mouse.prototype,c=b._mouseInit,d=b._mouseDestroy;b._touchStart=function(a){var b=this;!e&&b._mouseCapture(a.originalEvent.changedTouches[0])&&(e=!0,b._touchMoved=!1,f(a,"mouseover"),f(a,"mousemove"),f(a,"mousedown"))},b._touchMove=function(a){e&&(this._touchMoved=!0,f(a,"mousemove"))},b._touchEnd=function(a){e&&(f(a,"mouseup"),f(a,"mouseout"),this._touchMoved||f(a,"click"),e=!1)},b._mouseInit=function(){var b=this;b.element.bind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),c.call(b)},b._mouseDestroy=function(){var b=this;b.element.unbind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),d.call(b)}}}(jQuery);

/*!
 * Classie - class helper functions
 * from Bonzo https://github.com/ded/bonzo
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * Copyright 2014, Dustin Diaz
 * http://www.codrops.com
 */
!function(s){"use strict";function e(s){return new RegExp("(^|\\s+)"+s+"(\\s+|$)")}function n(s,e){var n=a(s,e)?c:t;n(s,e)}var a,t,c;"classList"in document.documentElement?(a=function(s,e){return s.classList.contains(e)},t=function(s,e){s.classList.add(e)},c=function(s,e){s.classList.remove(e)}):(a=function(s,n){return e(n).test(s.className)},t=function(s,e){a(s,e)||(s.className=s.className+" "+e)},c=function(s,n){s.className=s.className.replace(e(n)," ")});var i={hasClass:a,addClass:t,removeClass:c,toggleClass:n,has:a,add:t,remove:c,toggle:n};"function"==typeof define&&define.amd?define(i):s.classie=i}(window);

/**
 * main.js
 * http://www.codrops.com
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
!function(){function e(){n()}function n(){d.addEventListener("click",t),i&&i.addEventListener("click",t),o.addEventListener("click",function(e){var n=e.target;u&&n!==d&&t()})}function t(){u?classie.remove(c,"show-menu"):classie.add(c,"show-menu"),u=!u}var c=document.body,o=document.querySelector(".container"),d=document.getElementById("open-button"),i=document.getElementById("close-button"),u=!1;e()}();
