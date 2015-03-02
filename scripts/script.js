// set the scene
$(function() {
    
    // display initial state videos
    for (var i = 0; i <= videoArray.length -1; i++){
	    displayVideo(videoArray[i], i);
	}

	registerDragDrop();
	setUpPlayList();
	setUpListeners();
});


// set up the playlist positioning
function setUpPlayList(){
	var playlistOffset = $('.playlist').offset();
	console.log(playlistOffset.top);
	console.log(playlistOffset.left);

	var playlistWidth = $('.playlist').css('width');
	$('.playlist').css({
		'position': 'fixed',
		'top': playlistOffset.top,
		'left': playlistOffset.left,
		'width': playlistWidth
	});
}


// set up listeners for various dome elements
function setUpListeners(){
	var searchButton = $('#basic-addon2');
	searchButton.click(function(ev) {
		searchText = $('#searchArea').val();
		if (searchText != ""){
			searchVideos(searchText);
		} else {
			//BootstrapDialog = $('#modal').modal();
			BootstrapDialog.show({
	            title: 'No search term',
	            message: 'Please enter a search term and try again'
	        });
		}
	});
}


// itterate the array of video objects to display results
function searchVideos(searchTerm){
	var searchMatches = [],
		searchTerm = searchTerm.toUpperCase();

	// search through objects for matching terms
	for (var i = 0; i < videoArray.length; i++){
		var vidObj = videoArray[i],
			match = false,
			thisValue = '';

		for (var key in vidObj){
			if( typeof vidObj[key] == 'string' ) {
				thisValue = vidObj[key].toUpperCase();
			    if (thisValue.indexOf(searchTerm) > -1){
			   		match = true;
			    }
			} else if (vidObj[key].constructor === Array){
				for (var arrItem in vidObj[key]){
					thisValue = vidObj[key][arrItem].toUpperCase();
			    	if (thisValue.indexOf(searchTerm) > -1){
			    		match = true;
			    	}   	
				}
			}
		}
		if (match){
			searchMatches.push(vidObj);
		}
	}

	// if the match is found call the displayVideo method
	if (searchMatches.length > 0){
		$('#video-grid').empty();
		$('h1').text("Results for '" + searchTerm + "'");
		for (var i = 0; i < searchMatches.length; i++){
			var vidMatch = searchMatches[i];
			displayVideo(vidMatch, i);
		}
		registerDragDrop();
	} else {
		alert("no match found");
	}
}


// displays the passed video within the video grid
function displayVideo(video, itemNum){

	// insert clearfix for uneaven height columns
	if (itemNum % 3 === 0){
    	$('#video-grid').append('<div class="clearfix"></div>');
    }
	
	// build the html for the requested video
	var videoString = '';
	videoString += '<article class="col-sm-4 draggable">';
	videoString += '<img src="http://img.youtube.com/vi/' + video.videoID + '/mqdefault.jpg" alt="' + video.title + '">';
	videoString += '<h3>' + video.title + '</h3>';
	videoString += '<button class="btn btn-sm btn-info btn-block" name="' + video.id + '">More info</button>';
	videoString += '<div class="tags">';
	for (var i = 0; i < video.tags.length; i++){
		videoString += '<span class="label label-success">' + video.tags[i] + '</span>';
	}
	videoString += '</div>';
	videoString += '</article>';

	// inject into dom
	$('#video-grid').append(videoString);
}


// sets up the jQueryUI drag and drop
function registerDragDrop(){
	$( ".draggable" ).draggable({
    	revert: true,
    	containment: 'window',
    	helper: 'clone'
    });
    $( ".droppable" ).droppable({
    	drop: handleDrop
	});
}


// called when the user drops a video onto the playlist
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

	// inject new droppable area
	var newDroppable = "<div class='droppable'></div>";
	$('aside').append(newDroppable);
	$( ".droppable" ).droppable({
    	drop: handleDrop
	});

	// position the dropped item over the playlist
	var offset = $(ui.draggable).offset();
	var playlistWidth = $('.playlist').css('width');
	$(ui.draggable).css({
		'position': 'fixed',
		'top': offset.top,
		'left': offset.left,
		'width': playlistWidth
	});
}


///////////////////////////// Video objects //////////////////////////////////////
var videoArray = []

var video1 = {
	id:1,
	title: "Why the web is dead",
	videoID: "CrcAPan028Y",
	tags: ["javascript", "css", "html", "ted talk", "christian heilmann", "social media"],
	description: "'The web is dead', was the introductory phrase of Christian Heilmann's TEDx speech. There is no excitement about new websites and the mobile phone is definitely not the easiest way of accessing the web when it comes to typing with your touch keyboard.</p><p> 'The problem with the internet was that we were like kittens with a laser pointer', he said. The new dawn of the internet was the app. There is an app for everything now days and the good thing is that apps are focused.",
	rating: 5
}
videoArray.push(video1)

var video2 = {
	id:2,
	title: "Put social back in social media",
	videoID: "gnbLLQwZxeA",
	tags: ["javascript", "ted talk", "christian heilmann", "social media", "meta data"],
	description: "'This talk was given at a local TEDx event, produced independently of the TED Conferences. Christian Heilmann brings into attention a simple, vital and yet ignored ideea: dont't look up, don't look down...look around, look inside and outside and be you and foremost be creative in all forms and sizes. Make sure that your online version is a true reflection of your offline version and not a projection of what you could be if there weren't so many life impediments to overcome.",
	rating: 5
}
videoArray.push(video2)

var video3 = {
	id:3,
	title: "jQuery Performance Myths and Realities",
	videoID: "ccFLVPNBRE4",
	tags: ["javascript", "jquery", "html", "Dave Methvin", "performance"],
	description: "Presented at jQuery Conference San Diego February 12-13, 2014. http://events.jquery.org/2014/san-diego/",
	rating: 4
}
videoArray.push(video3)

var video4 = {
	id:4,
	title: "The Power of Metadata",
	videoID: "i2a8pDbCabg",
	tags: ["meta data", "email", "ted talk", "christian heilmann", "social media"],
	description: "'MIT Media Lab graduate students Deepak Jagdish and Daniel Smilkov share some surprising insights from Immersion, a tool they built to make sense of email metadata. Try out Immersion yourself and learn more about the team behind it at https://immersion.media.mit.edu and learn more about TEDxCambridge at http://www.tedxcambridge.com.",
	rating: 3
}
videoArray.push(video4)

var video5 = {
	id:5,
	title: "Google Rich Snippets Introduction",
	videoID: "LnK0d2q2H4Q",
	tags: ["meta data", "rich snippets", "html", "seo"],
	description: "This video is 100% certain to get you adding Rich Snippets markup to your site to enhance your sites presence in the search results pages. In this video I show you what snippets are and where to find the markup examples.",
	rating: 5
}
videoArray.push(video5)

var video6 = {
	id:6,
	title: "How long does it take for rich snippets to appear?",
	videoID: "thS5ryMXN88",
	tags: ["meta data", "rich snippets", "html", "seo"],
	description: "How long should it take for my RDFa markup to appear in search results as a Rich Snippet after completing the submission form?",
	rating: 4
}
videoArray.push(video6)

var video7 = {
	id:7,
	title: "HTML 5 Tutorial",
	videoID: "kDyJN7qQETA",
	tags: ["HTML"],
	description: "Learn the basics of HTML in this quick tutorial",
	rating: 2
}
videoArray.push(video7)

var video8 = {
	id:8,
	title: "Paul Irish, 'Delivering the goods'",
	videoID: "R8W_6xWphtw",
	tags: ["javascript", "css", "html", "paul irish", "optimization"],
	description: "Paul Irish is a front-end developer who loves the web. He is on Google Chrome's Developer Relations team as well as jQuery's. He develops the HTML5 Boilerplate, the HTML5/CSS3 feature detection library Modernizr, HTML5 Please, CSS3 Please, and other bits and bobs of open source code.",
	rating: 5
}
videoArray.push(video8)

var video9 = {
	id:9,
	title: "The Goodness of JavaScript",
	videoID: "K9rb9Ba4VV4",
	tags: ["javascript", "web development"],
	description: "Aaron Frost & Dave Geddes present the goodness of JavaScript",
	rating: 5
}
videoArray.push(video9)

var video10 = {
	id:10,
	title: "JavaScript Puzzlers - Puzzles to Make You Think",
	videoID: "iPxgO0OjRYk",
	tags: ["javascript"],
	description: "I presented 'JavaScript Puzzlers - Puzzlers to Make You Think' to the folks of the Vancouver JavaScript Developers Group. We had some great interactions and some fantastic discussions afterwards. Big thanks to the VanJS folks for having me!",
	rating: 5
}
videoArray.push(video10)

var video11 = {
	id:11,
	title: "ECMAScript 6, A Better JavaScript for the Ambient Web Era",
	videoID: "ZGY8Cktn6W4",
	tags: ["javascript", "ECMAScript 6"],
	description: "We've entered the Ambient Computing Era and JavaScript is its dominant programing language, But a new computing era needs a new and better JavaScript. It's called ECMAScript 6 and it's about to become the new JavaScript standard. Why do we need it? Why did it take so long? What's in it? When can you use it? Answers will be given.",
	rating: 5
}
videoArray.push(video11)

var video12 = {
	id:12,
	title: "CSS Concatenation And Minification with Grunt",
	videoID: "MK_UhwymsvU",
	tags: ["javascript", "css", "minification"],
	description: "How to Concatenate and Minify CSS using Grunt.",
	rating: 5
}
videoArray.push(video12)

var video13 = {
	id:13,
	title: "Future of Frontend Frameworks",
	videoID: "oYlvLtKd0TE",
	tags: ["javascript", "css", "html", "bootstrap", "mark otto"],
	description: "Mark Otto, creater of Bootstrap, presents the future of front end frameworks",
	rating: 3
}
videoArray.push(video13)

var video14 = {
	id:14,
	title: "io.js vs Node.js",
	videoID: "wIUkWpg9FDY",
	tags: ["javascript", "node.js", "io.js", "Mikeal Rogers", "runtime"],
	description: "",
	rating: 4
}
videoArray.push(video14)

var video15 = {
	id:15,
	title: "Using Node.js for Everything",
	videoID: "wsuygCu_oPY",
	tags: ["javascript", "node.js", "charlie key", "forward js"],
	description: "In his Forward JS presentation Charlie Key, CEO at Modulus, covers how a fast-moving company can use Node.js and JavaScript for basically everything and succeed. ",
	rating: 5
}
videoArray.push(video15)

var video16 = {
	id:16,
	title: "Ryan Dahl: Original Node.js presentation",
	videoID: "ztspvPYybIY",
	tags: ["javascript", "node.js", "serverside javascript", "ryan dahl"],
	description: "The first presentation on Node.js from Ryan Dahl at JSConf 2009",
	rating: 2
}
videoArray.push(video16)

var video17 = {
	id:17,
	title: "The Myth of the Genius Programmer",
	videoID: "0SARbwvhupQ",
	tags: ["programmer", "java", "google i/o", "Brian Fitzpatrick", "Ben Collins-Sussman"],
	description: "A pervasive elitism hovers in the background of collaborative software development: everyone secretly wants to be seen as a genius. In this talk, we discuss how to avoid this trap and gracefully exchange personal ego for personal growth and super-charged collaboration. We'll also examine how software tools affect social behaviors, and how to successfully manage the growth of new ideas.",
	rating: 5
}
videoArray.push(video17)

var video18 = {
	id:18,
	title: "How to Teach Yourself Code",
	videoID: "T0qAjgQFR4c",
	tags: ["javascript", "css", "html", "christian heilmann", "social media"],
	description: "A presentation from internet weel on how to teach yourself to code by Mattan Griffel",
	rating: 4
}
videoArray.push(video18)

var video19 = {
	id:19,
	title: "The first 20 hours -- how to learn anything",
	videoID: "5MgBikgcWnY",
	tags: ["programming", "learning", "josh kaufman", "ukulele"],
	description: "Josh Kaufman is the author of the #1 international bestseller, 'The Personal MBA: Master the Art of Business', as well as the upcoming book 'The First 20 Hours: Mastering the Toughest Part of Learning Anything.' Josh specializes in teaching people from all walks of life how to master practical knowledge and skills. In his talk, he shares how having his first child inspired him to approach learning in a whole new way. ",
	rating: 5
}
videoArray.push(video19)

var video20 = {
	id:20,
	title: "Gettin' Flexy with Uncle Dave",
	videoID: "xXfXWojc_Mw",
	tags: ["css", "html", "flexbox", "responsive web design", "dave rupert"],
	description: "Dave Rupert, lead developer at Paravel and co-host of the Shop Talk Show, gives essential tips and tricks on becoming flexible in responsive web design.",
	rating: 5
}
videoArray.push(video20)

var video21 = {
	id:21,
	title: "Making Time to Learn with Side Projects",
	videoID: "HrJ0CBbn6f0",
	tags: ["css", "html", "web design", "side projects", "dave rupert"],
	description: "Dave Rupert, Lead Developer at Paravel, talks with Treehouse teacher Randy Hoyt about new HTML5 Tags, accessibility, British websites, and the importance of side projects.",
	rating: 5
}
videoArray.push(video21)

//////////////////////////// Libraries ///////////////////////////////////////////////

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

/* 
 * Copyright javanoob@hotmail.com
 * https://github.com/nakupanda/bootstrap3-dialog
 * Licensed under The MIT License.
 */
(function(a,b){if(typeof module!=="undefined"&&module.exports){module.exports=b(require("jquery")(a))}else{if(typeof define==="function"&&define.amd){define("bootstrap-dialog",["jquery"],function(c){return b(c)})}else{a.BootstrapDialog=b(a.jQuery)}}}(this,function(d){var b=d.fn.modal.Constructor;var c=function(f,e){b.call(this,f,e)};c.getModalVersion=function(){var e=null;if(typeof d.fn.modal.Constructor.VERSION==="undefined"){e="v3.1"}else{if(/3\.2\.\d+/.test(d.fn.modal.Constructor.VERSION)){e="v3.2"}else{e="v3.3"}}return e};c.ORIGINAL_BODY_PADDING=d("body").css("padding-right")||0;c.METHODS_TO_OVERRIDE={};c.METHODS_TO_OVERRIDE["v3.1"]={};c.METHODS_TO_OVERRIDE["v3.2"]={hide:function(g){if(g){g.preventDefault()}g=d.Event("hide.bs.modal");this.$element.trigger(g);if(!this.isShown||g.isDefaultPrevented()){return}this.isShown=false;var f=this.getGlobalOpenedDialogs();if(f.length===0){this.$body.removeClass("modal-open")}this.resetScrollbar();this.escape();d(document).off("focusin.bs.modal");this.$element.removeClass("in").attr("aria-hidden",true).off("click.dismiss.bs.modal");d.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",d.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal()}};c.METHODS_TO_OVERRIDE["v3.3"]={setScrollbar:function(){var e=c.ORIGINAL_BODY_PADDING;if(this.bodyIsOverflowing){this.$body.css("padding-right",e+this.scrollbarWidth)}},resetScrollbar:function(){var e=this.getGlobalOpenedDialogs();if(e.length===0){this.$body.css("padding-right",c.ORIGINAL_BODY_PADDING)}},hideModal:function(){this.$element.hide();this.backdrop(d.proxy(function(){var e=this.getGlobalOpenedDialogs();if(e.length===0){this.$body.removeClass("modal-open")}this.resetAdjustments();this.resetScrollbar();this.$element.trigger("hidden.bs.modal")},this))}};c.prototype={constructor:c,getGlobalOpenedDialogs:function(){var e=[];d.each(a.dialogs,function(g,f){if(f.isRealized()&&f.isOpened()){e.push(f)}});return e}};c.prototype=d.extend(c.prototype,b.prototype,c.METHODS_TO_OVERRIDE[c.getModalVersion()]);var a=function(e){this.defaultOptions=d.extend(true,{id:a.newGuid(),buttons:[],data:{},onshow:null,onshown:null,onhide:null,onhidden:null},a.defaultOptions);this.indexedButtons={};this.registeredButtonHotkeys={};this.draggableData={isMouseDown:false,mouseOffset:{}};this.realized=false;this.opened=false;this.initOptions(e);this.holdThisInstance()};a.BootstrapDialogModal=c;a.NAMESPACE="bootstrap-dialog";a.TYPE_DEFAULT="type-default";a.TYPE_INFO="type-info";a.TYPE_PRIMARY="type-primary";a.TYPE_SUCCESS="type-success";a.TYPE_WARNING="type-warning";a.TYPE_DANGER="type-danger";a.DEFAULT_TEXTS={};a.DEFAULT_TEXTS[a.TYPE_DEFAULT]="Information";a.DEFAULT_TEXTS[a.TYPE_INFO]="Information";a.DEFAULT_TEXTS[a.TYPE_PRIMARY]="Information";a.DEFAULT_TEXTS[a.TYPE_SUCCESS]="Success";a.DEFAULT_TEXTS[a.TYPE_WARNING]="Warning";a.DEFAULT_TEXTS[a.TYPE_DANGER]="Danger";a.DEFAULT_TEXTS.OK="OK";a.DEFAULT_TEXTS.CANCEL="Cancel";a.DEFAULT_TEXTS.CONFIRM="Confirmation";a.SIZE_NORMAL="size-normal";a.SIZE_SMALL="size-small";a.SIZE_WIDE="size-wide";a.SIZE_LARGE="size-large";a.BUTTON_SIZES={};a.BUTTON_SIZES[a.SIZE_NORMAL]="";a.BUTTON_SIZES[a.SIZE_SMALL]="";a.BUTTON_SIZES[a.SIZE_WIDE]="";a.BUTTON_SIZES[a.SIZE_LARGE]="btn-lg";a.ICON_SPINNER="glyphicon glyphicon-asterisk";a.defaultOptions={type:a.TYPE_PRIMARY,size:a.SIZE_NORMAL,cssClass:"",title:null,message:null,nl2br:true,closable:true,closeByBackdrop:true,closeByKeyboard:true,spinicon:a.ICON_SPINNER,autodestroy:true,draggable:false,animate:true,description:""};a.configDefaultOptions=function(e){a.defaultOptions=d.extend(true,a.defaultOptions,e)};a.dialogs={};a.openAll=function(){d.each(a.dialogs,function(f,e){e.open()})};a.closeAll=function(){d.each(a.dialogs,function(f,e){e.close()})};a.moveFocus=function(){var e=null;d.each(a.dialogs,function(g,f){e=f});if(e!==null&&e.isRealized()){e.getModal().focus()}};a.METHODS_TO_OVERRIDE={};a.METHODS_TO_OVERRIDE["v3.1"]={handleModalBackdropEvent:function(){this.getModal().on("click",{dialog:this},function(e){e.target===this&&e.data.dialog.isClosable()&&e.data.dialog.canCloseByBackdrop()&&e.data.dialog.close()});return this},updateZIndex:function(){var g=1040;var h=1050;var i=0;d.each(a.dialogs,function(j,k){i++});var f=this.getModal();var e=f.data("bs.modal").$backdrop;f.css("z-index",h+(i-1)*20);e.css("z-index",g+(i-1)*20);return this},open:function(){!this.isRealized()&&this.realize();this.getModal().modal("show");this.updateZIndex();this.setOpened(true);return this}};a.METHODS_TO_OVERRIDE["v3.2"]={handleModalBackdropEvent:a.METHODS_TO_OVERRIDE["v3.1"]["handleModalBackdropEvent"],updateZIndex:a.METHODS_TO_OVERRIDE["v3.1"]["updateZIndex"],open:a.METHODS_TO_OVERRIDE["v3.1"]["open"]};a.METHODS_TO_OVERRIDE["v3.3"]={};a.prototype={constructor:a,initOptions:function(e){this.options=d.extend(true,this.defaultOptions,e);return this},holdThisInstance:function(){a.dialogs[this.getId()]=this;return this},initModalStuff:function(){this.setModal(this.createModal()).setModalDialog(this.createModalDialog()).setModalContent(this.createModalContent()).setModalHeader(this.createModalHeader()).setModalBody(this.createModalBody()).setModalFooter(this.createModalFooter());this.getModal().append(this.getModalDialog());this.getModalDialog().append(this.getModalContent());this.getModalContent().append(this.getModalHeader()).append(this.getModalBody()).append(this.getModalFooter());return this},createModal:function(){var e=d('<div class="modal" tabindex="-1" role="dialog" aria-hidden="true"></div>');e.prop("id",this.getId()).attr("aria-labelledby",this.getId()+"_title");return e},getModal:function(){return this.$modal},setModal:function(e){this.$modal=e;return this},createModalDialog:function(){return d('<div class="modal-dialog"></div>')},getModalDialog:function(){return this.$modalDialog},setModalDialog:function(e){this.$modalDialog=e;return this},createModalContent:function(){return d('<div class="modal-content"></div>')},getModalContent:function(){return this.$modalContent},setModalContent:function(e){this.$modalContent=e;return this},createModalHeader:function(){return d('<div class="modal-header"></div>')},getModalHeader:function(){return this.$modalHeader},setModalHeader:function(e){this.$modalHeader=e;return this},createModalBody:function(){return d('<div class="modal-body"></div>')},getModalBody:function(){return this.$modalBody},setModalBody:function(e){this.$modalBody=e;return this},createModalFooter:function(){return d('<div class="modal-footer"></div>')},getModalFooter:function(){return this.$modalFooter},setModalFooter:function(e){this.$modalFooter=e;return this},createDynamicContent:function(f){var e=null;if(typeof f==="function"){e=f.call(f,this)}else{e=f}if(typeof e==="string"){e=this.formatStringContent(e)}return e},formatStringContent:function(e){if(this.options.nl2br){return e.replace(/\r\n/g,"<br />").replace(/[\r\n]/g,"<br />")}return e},setData:function(e,f){this.options.data[e]=f;return this},getData:function(e){return this.options.data[e]},setId:function(e){this.options.id=e;return this},getId:function(){return this.options.id},getType:function(){return this.options.type},setType:function(e){this.options.type=e;this.updateType();return this},updateType:function(){if(this.isRealized()){var e=[a.TYPE_DEFAULT,a.TYPE_INFO,a.TYPE_PRIMARY,a.TYPE_SUCCESS,a.TYPE_WARNING,a.TYPE_DANGER];this.getModal().removeClass(e.join(" ")).addClass(this.getType())}return this},getSize:function(){return this.options.size},setSize:function(e){this.options.size=e;this.updateSize();return this},updateSize:function(){if(this.isRealized()){var e=this;this.getModal().removeClass(a.SIZE_NORMAL).removeClass(a.SIZE_SMALL).removeClass(a.SIZE_WIDE).removeClass(a.SIZE_LARGE);this.getModal().addClass(this.getSize());this.getModalDialog().removeClass("modal-sm");if(this.getSize()===a.SIZE_SMALL){this.getModalDialog().addClass("modal-sm")}this.getModalDialog().removeClass("modal-lg");if(this.getSize()===a.SIZE_WIDE){this.getModalDialog().addClass("modal-lg")}d.each(this.options.buttons,function(g,i){var k=e.getButton(i.id);var f=["btn-lg","btn-sm","btn-xs"];var j=false;if(typeof i.cssClass==="string"){var h=i.cssClass.split(" ");d.each(h,function(l,m){if(d.inArray(m,f)!==-1){j=true}})}if(!j){k.removeClass(f.join(" "));k.addClass(e.getButtonSize())}})}return this},getCssClass:function(){return this.options.cssClass},setCssClass:function(e){this.options.cssClass=e;return this},getTitle:function(){return this.options.title},setTitle:function(e){this.options.title=e;this.updateTitle();return this},updateTitle:function(){if(this.isRealized()){var e=this.getTitle()!==null?this.createDynamicContent(this.getTitle()):this.getDefaultText();this.getModalHeader().find("."+this.getNamespace("title")).html("").append(e).prop("id",this.getId()+"_title")}return this},getMessage:function(){return this.options.message},setMessage:function(e){this.options.message=e;this.updateMessage();return this},updateMessage:function(){if(this.isRealized()){var e=this.createDynamicContent(this.getMessage());this.getModalBody().find("."+this.getNamespace("message")).html("").append(e)}return this},isClosable:function(){return this.options.closable},setClosable:function(e){this.options.closable=e;this.updateClosable();return this},setCloseByBackdrop:function(e){this.options.closeByBackdrop=e;return this},canCloseByBackdrop:function(){return this.options.closeByBackdrop},setCloseByKeyboard:function(e){this.options.closeByKeyboard=e;return this},canCloseByKeyboard:function(){return this.options.closeByKeyboard},isAnimate:function(){return this.options.animate},setAnimate:function(e){this.options.animate=e;return this},updateAnimate:function(){if(this.isRealized()){this.getModal().toggleClass("fade",this.isAnimate())}return this},getSpinicon:function(){return this.options.spinicon},setSpinicon:function(e){this.options.spinicon=e;return this},addButton:function(e){this.options.buttons.push(e);return this},addButtons:function(f){var e=this;d.each(f,function(g,h){e.addButton(h)});return this},getButtons:function(){return this.options.buttons},setButtons:function(e){this.options.buttons=e;this.updateButtons();return this},getButton:function(e){if(typeof this.indexedButtons[e]!=="undefined"){return this.indexedButtons[e]}return null},getButtonSize:function(){if(typeof a.BUTTON_SIZES[this.getSize()]!=="undefined"){return a.BUTTON_SIZES[this.getSize()]}return""},updateButtons:function(){if(this.isRealized()){if(this.getButtons().length===0){this.getModalFooter().hide()}else{this.getModalFooter().show().find("."+this.getNamespace("footer")).html("").append(this.createFooterButtons())}}return this},isAutodestroy:function(){return this.options.autodestroy},setAutodestroy:function(e){this.options.autodestroy=e},getDescription:function(){return this.options.description},setDescription:function(e){this.options.description=e;return this},getDefaultText:function(){return a.DEFAULT_TEXTS[this.getType()]},getNamespace:function(e){return a.NAMESPACE+"-"+e},createHeaderContent:function(){var e=d("<div></div>");e.addClass(this.getNamespace("header"));e.append(this.createTitleContent());e.prepend(this.createCloseButton());return e},createTitleContent:function(){var e=d("<div></div>");e.addClass(this.getNamespace("title"));return e},createCloseButton:function(){var f=d("<div></div>");f.addClass(this.getNamespace("close-button"));var e=d('<button class="close">&times;</button>');f.append(e);f.on("click",{dialog:this},function(g){g.data.dialog.close()});return f},createBodyContent:function(){var e=d("<div></div>");e.addClass(this.getNamespace("body"));e.append(this.createMessageContent());return e},createMessageContent:function(){var e=d("<div></div>");e.addClass(this.getNamespace("message"));return e},createFooterContent:function(){var e=d("<div></div>");e.addClass(this.getNamespace("footer"));return e},createFooterButtons:function(){var e=this;var f=d("<div></div>");f.addClass(this.getNamespace("footer-buttons"));this.indexedButtons={};d.each(this.options.buttons,function(g,h){if(!h.id){h.id=a.newGuid()}var i=e.createButton(h);e.indexedButtons[h.id]=i;f.append(i)});return f},createButton:function(e){var f=d('<button class="btn"></button>');f.prop("id",e.id);f.data("button",e);if(typeof e.icon!=="undefined"&&d.trim(e.icon)!==""){f.append(this.createButtonIcon(e.icon))}if(typeof e.label!=="undefined"){f.append(e.label)}if(typeof e.cssClass!=="undefined"&&d.trim(e.cssClass)!==""){f.addClass(e.cssClass)}else{f.addClass("btn-default")}if(typeof e.hotkey!=="undefined"){this.registeredButtonHotkeys[e.hotkey]=f}f.on("click",{dialog:this,$button:f,button:e},function(i){var h=i.data.dialog;var j=i.data.$button;var g=j.data("button");if(typeof g.action==="function"){g.action.call(j,h,i)}if(g.autospin){j.toggleSpin(true)}});this.enhanceButton(f);return f},enhanceButton:function(e){e.dialog=this;e.toggleEnable=function(f){var g=this;if(typeof f!=="undefined"){g.prop("disabled",!f).toggleClass("disabled",!f)}else{g.prop("disabled",!g.prop("disabled"))}return g};e.enable=function(){var f=this;f.toggleEnable(true);return f};e.disable=function(){var f=this;f.toggleEnable(false);return f};e.toggleSpin=function(i){var h=this;var g=h.dialog;var f=h.find("."+g.getNamespace("button-icon"));if(typeof i==="undefined"){i=!(e.find(".icon-spin").length>0)}if(i){f.hide();e.prepend(g.createButtonIcon(g.getSpinicon()).addClass("icon-spin"))}else{f.show();e.find(".icon-spin").remove()}return h};e.spin=function(){var f=this;f.toggleSpin(true);return f};e.stopSpin=function(){var f=this;f.toggleSpin(false);return f};return this},createButtonIcon:function(f){var e=d("<span></span>");e.addClass(this.getNamespace("button-icon")).addClass(f);return e},enableButtons:function(e){d.each(this.indexedButtons,function(g,f){f.toggleEnable(e)});return this},updateClosable:function(){if(this.isRealized()){this.getModalHeader().find("."+this.getNamespace("close-button")).toggle(this.isClosable())}return this},onShow:function(e){this.options.onshow=e;return this},onShown:function(e){this.options.onshown=e;return this},onHide:function(e){this.options.onhide=e;return this},onHidden:function(e){this.options.onhidden=e;return this},isRealized:function(){return this.realized},setRealized:function(e){this.realized=e;return this},isOpened:function(){return this.opened},setOpened:function(e){this.opened=e;return this},handleModalEvents:function(){this.getModal().on("show.bs.modal",{dialog:this},function(g){var f=g.data.dialog;f.setOpened(true);if(f.isModalEvent(g)&&typeof f.options.onshow==="function"){var e=f.options.onshow(f);if(e===false){f.setOpened(false)}return e}});this.getModal().on("shown.bs.modal",{dialog:this},function(f){var e=f.data.dialog;e.isModalEvent(f)&&typeof e.options.onshown==="function"&&e.options.onshown(e)});this.getModal().on("hide.bs.modal",{dialog:this},function(f){var e=f.data.dialog;e.setOpened(false);if(e.isModalEvent(f)&&typeof e.options.onhide==="function"){var g=e.options.onhide(e);if(g===false){e.setOpened(true)}return g}});this.getModal().on("hidden.bs.modal",{dialog:this},function(f){var e=f.data.dialog;e.isModalEvent(f)&&typeof e.options.onhidden==="function"&&e.options.onhidden(e);if(e.isAutodestroy()){delete a.dialogs[e.getId()];d(this).remove()}a.moveFocus()});this.handleModalBackdropEvent();this.getModal().on("keyup",{dialog:this},function(e){e.which===27&&e.data.dialog.isClosable()&&e.data.dialog.canCloseByKeyboard()&&e.data.dialog.close()});this.getModal().on("keyup",{dialog:this},function(f){var e=f.data.dialog;if(typeof e.registeredButtonHotkeys[f.which]!=="undefined"){var g=d(e.registeredButtonHotkeys[f.which]);!g.prop("disabled")&&g.focus().trigger("click")}});return this},handleModalBackdropEvent:function(){this.getModal().on("click",{dialog:this},function(e){d(e.target).hasClass("modal-backdrop")&&e.data.dialog.isClosable()&&e.data.dialog.canCloseByBackdrop()&&e.data.dialog.close()});return this},isModalEvent:function(e){return typeof e.namespace!=="undefined"&&e.namespace==="bs.modal"},makeModalDraggable:function(){if(this.options.draggable){this.getModalHeader().addClass(this.getNamespace("draggable")).on("mousedown",{dialog:this},function(g){var f=g.data.dialog;f.draggableData.isMouseDown=true;var e=f.getModalDialog().offset();f.draggableData.mouseOffset={top:g.clientY-e.top,left:g.clientX-e.left}});this.getModal().on("mouseup mouseleave",{dialog:this},function(e){e.data.dialog.draggableData.isMouseDown=false});d("body").on("mousemove",{dialog:this},function(f){var e=f.data.dialog;if(!e.draggableData.isMouseDown){return}e.getModalDialog().offset({top:f.clientY-e.draggableData.mouseOffset.top,left:f.clientX-e.draggableData.mouseOffset.left})})}return this},realize:function(){this.initModalStuff();this.getModal().addClass(a.NAMESPACE).addClass(this.getCssClass());this.updateSize();if(this.getDescription()){this.getModal().attr("aria-describedby",this.getDescription())}this.getModalFooter().append(this.createFooterContent());this.getModalHeader().append(this.createHeaderContent());this.getModalBody().append(this.createBodyContent());this.getModal().data("bs.modal",new c(this.getModal(),{backdrop:"static",keyboard:false,show:false}));this.makeModalDraggable();this.handleModalEvents();this.setRealized(true);this.updateButtons();this.updateType();this.updateTitle();this.updateMessage();this.updateClosable();this.updateAnimate();this.updateSize();return this},open:function(){!this.isRealized()&&this.realize();this.getModal().modal("show");return this},close:function(){this.getModal().modal("hide");return this}};a.prototype=d.extend(a.prototype,a.METHODS_TO_OVERRIDE[c.getModalVersion()]);a.newGuid=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(g){var f=Math.random()*16|0,e=g==="x"?f:(f&3|8);return e.toString(16)})};a.show=function(e){return new a(e).open()};a.alert=function(){var f={};var e={type:a.TYPE_PRIMARY,title:null,message:null,closable:false,draggable:false,buttonLabel:a.DEFAULT_TEXTS.OK,callback:null};if(typeof arguments[0]==="object"&&arguments[0].constructor==={}.constructor){f=d.extend(true,e,arguments[0])}else{f=d.extend(true,e,{message:arguments[0],callback:typeof arguments[1]!=="undefined"?arguments[1]:null})}return new a({type:f.type,title:f.title,message:f.message,closable:f.closable,draggable:f.draggable,data:{callback:f.callback},onhide:function(g){!g.getData("btnClicked")&&g.isClosable()&&typeof g.getData("callback")==="function"&&g.getData("callback")(false)},buttons:[{label:f.buttonLabel,action:function(g){g.setData("btnClicked",true);typeof g.getData("callback")==="function"&&g.getData("callback")(true);g.close()}}]}).open()};a.confirm=function(){var f={};var e={type:a.TYPE_PRIMARY,title:null,message:null,closable:false,draggable:false,btnCancelLabel:a.DEFAULT_TEXTS.CANCEL,btnOKLabel:a.DEFAULT_TEXTS.OK,btnOKClass:null,callback:null};if(typeof arguments[0]==="object"&&arguments[0].constructor==={}.constructor){f=d.extend(true,e,arguments[0])}else{f=d.extend(true,e,{message:arguments[0],closable:false,buttonLabel:a.DEFAULT_TEXTS.OK,callback:typeof arguments[1]!=="undefined"?arguments[1]:null})}if(f.btnOKClass===null){f.btnOKClass=["btn",f.type.split("-")[1]].join("-")}return new a({type:f.type,title:f.title,message:f.message,closable:f.closable,draggable:f.draggable,data:{callback:f.callback},buttons:[{label:f.btnCancelLabel,action:function(g){typeof g.getData("callback")==="function"&&g.getData("callback")(false);g.close()}},{label:f.btnOKLabel,cssClass:f.btnOKClass,action:function(g){typeof g.getData("callback")==="function"&&g.getData("callback")(true);g.close()}}]}).open()};a.warning=function(e,f){return new a({type:a.TYPE_WARNING,message:e}).open()};a.danger=function(e,f){return new a({type:a.TYPE_DANGER,message:e}).open()};a.success=function(e,f){return new a({type:a.TYPE_SUCCESS,message:e}).open()};return a}));


