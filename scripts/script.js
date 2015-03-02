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
			BootstrapDialog = $('#modal').modal();
			BootstrapDialog.show({
	            title: 'No searchTerm',
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


