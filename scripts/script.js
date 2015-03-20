// persistent ui selectors
var searchArea,
	playButton,
	searchButton,
	homeButton,
	favesButton,
	videoGrid,
	body,
	playlist,
	droppable;


// set the scene
$(function() {
    
    // retrive persistent elements from the dom
	searchArea = $( "#searchArea" );
	playButton = $('#play-btn');
	searchButton = $('#basic-addon2');
	homeButton = $('#home');
	favesButton = $('#favourites');
	videoGrid = $('#video-grid');
	body = $('body');
	playlist = $('.playlist');
	droppable = $(".droppable");

    displayAllVideos();
	setUpPlayList();
	registerDragDrop();
	setUpListeners();

	searchArea.autocomplete({
      source: availableTags
    });

    $( "#sortable" ).sortable({
    	items: 'article:not(.unsortable)'
    });

    // Start the welcome tour if this is the first visit
	tour.init();
	tour.start();
});


// set up listeners for various dom elements
var setUpListeners = function(){
	
	searchButton.click(function(ev) {
		checkMenu();
		var searchText = searchArea.val();
		if (searchText != ""){
			searchVideos(searchText);
		} else {
			generalDialog('No search term', 'Please enter a search term and try again');
		}
	});

	// trigger search by pressing enter when within the seach box
	searchArea.keypress(function( event ) {
		checkMenu();
		if ( event.which == 13 ) {
		    event.preventDefault();
		    var searchText = searchArea.val();
		    if (searchText != ""){
				searchVideos(searchText);
			} else {
				generalDialog('No search term', 'Please enter a search term and try again');
			}
		}
	});

	playButton.click(function(ev) {
		checkMenu();
		buildPlaylist();
		nowPlayingDialog();
	});

	homeButton.click(function(ev) {
		checkMenu();
		searchVideos("");
	});

	favesButton.click(function(ev) {
		checkMenu();
		faveVideosDialog();
	});

	moreInfoListener();
	tagsListener();
}


// set up the more info listeners
var moreInfoListener = function(){
	var moreInfoButton = document.querySelectorAll('.more-info-btn');

	checkMenu();
	for (var i = 0; i < moreInfoButton.length; i++){
		moreInfoButton[i].addEventListener('click', function(ev) {
			moreInfoDialog(videoArray[this.name - 1]);
		});
	}
}


// set up the listeners for tags
var tagsListener = function (dialogRef){
	var tags = document.querySelectorAll('.individualTag');

	checkMenu();
	for (var i = 0; i < tags.length; i++){
		tags[i].addEventListener('click', function(ev) {
			var clickedTag = $(this).html();
			searchVideos(clickedTag);
			if (body.hasClass('show-menu')){
				body.removeClass('show-menu');
			}
    	});
	}	
}


// listener for add to queue button on more infor screen
var addToQueueListener = function(title, image, id){
	var addToQueue = $('.addToQueue');
	image = 'http://img.youtube.com/vi/' + image + '/mqdefault.jpg"';
	addToQueue.click(function(ev) {
		addToPlayList(title, image, id);
	});
}


// listener for the social sharing icons
var socialShareListener = function(){
	var socialimage = $('#socialIMG');
	socialimage.click(function(ev) {
		generalDialog('Video Shared', "Congratulations, You've shared think video on social media");
	});
}


// Add user tags button listener on the more info dialog
var addTagListener = function(){
	var addTag = $('#addTag');
	addTag.click(function(ev) {
		addUserTag(addTag);
	});
}


// displays the users favourited videos in popup dialog
var faveVideosDialog = function(){
	var faveVideosMessage = buildFaveVideos();

	BootstrapDialog.show({
        title: 'My favourites',
        message: faveVideosMessage,
        size: 'size-wide',
        buttons: [{
            label: 'Dismiss',
            cssClass: 'btn-danger',
            action: function(dialogRef){
                dialogRef.close();
            }
        }],
        onshown: function(dialogRef){
            moreInfoListener(document.querySelectorAll('.popup-more-info-btn'));
        },
    });
}


// display more information dialog for selected video
var moreInfoDialog = function(video){
	var moreInfoMessage = createVideoMessage(video);

	BootstrapDialog.show({
        title: video.title,
        message: moreInfoMessage,
        size: 'size-wide',
        buttons: [{
            label: 'Add to favourites',
            cssClass: 'btn-primary addToQueue',
            action: function(dialogRef){
                favouriteVideos.push(video);
                generalDialog("Added to favourites", video.title + " has been added to your favourites list.");
            }
        },{
            label: 'Add to Queue',
            cssClass: 'btn-success addToQueue',
            action: function(dialogRef){
                dialogRef.close();
                addToPlayList(video.title, 'http://img.youtube.com/vi/' + video.videoID + '/mqdefault.jpg', video.id);
            }
        },{
            label: 'Dismiss',
            cssClass: 'btn-danger',
            action: function(dialogRef){
                dialogRef.close();
            }
        }],
        onshown: function(dialogRef){
            $('.screenshot').append('<iframe width="430" height="300" src="https://www.youtube.com/embed/' + video.videoID + '" frameborder="0" allowfullscreen></iframe>');
            createRaty(video);
            socialShareListener();
            tagsListener(dialogRef);
            addTagListener();
        },
    });
}


// Dialog for user feedback - e.g no search term
var generalDialog = function(title, message){
	BootstrapDialog.show({
        title: title,
        message: message,        
        buttons: [{
            label: 'Dismiss',
            cssClass: 'btn-danger',
            action: function(dialogRef){
                dialogRef.close();
            }
        }]
    });
}


// display the now playing dialog
var playlistItem = 0;
var nowPlayingDialog = function(){
	var moreInfoMessage,
		video = findVideoByID(playQueue[playlistItem]);

	// if there is no video, return to the main screen, after displaying message
	if (!video){ 
		displayAllVideos();
		registerDragDrop();
		playButton.removeClass('btn-success').addClass('btn-primary');
		generalDialog("End of playlist", "You have reached the end of your playlist. You can now build another");
		emptyPlaylist();
		moreInfoListener();
		tagsListener();
		return 
	}
	moreInfoMessage = createVideoMessage(video);
	
	BootstrapDialog.show({
        title: 'Now playing',
        message: moreInfoMessage,
        size: 'size-wide',
        buttons: [{
            label: '<i class="fa fa-forward fa-2x">',
            cssClass: 'btn-primary',
            action: function(dialogRef){
            	if (findVideoByID(playQueue[playlistItem])){
	                dialogRef.close();
	                playlistItem++;
	                nowPlayingDialog();
	            } else {
	            	dialogRef.close();
	            	playlistItem = 0;
	            }
            }
        }, {
        	label: '<i class="fa fa-stop fa-2x">',
        	cssClass: 'btn-danger',
            action: function(dialogItself){
            	playButton.removeClass('btn-success').addClass('btn-primary');
                dialogItself.close();
            }
        }],
        onshown: function(dialogRef){
            $('.screenshot').append('<img src="http://img.youtube.com/vi/' + video.videoID + '/mqdefault.jpg" alt="' + video.title + '">');
            createRaty(video);
        },
    });
    playButton.removeClass('btn-primary').addClass('btn-success');
}


// itterate the array of video objects to display results
var searchVideos = function(searchTerm){
	var searchMatches = [],
		searchTerm = searchTerm.toUpperCase();

	// search through objects for matching terms
	for (var i = 0; i < videoArray.length; i++){
		var vidObj = videoArray[i],
			match = false,
			thisValue = '';

		// check the title and description for a match
		for (var key in vidObj){
			if( typeof vidObj[key] == 'string' ) {
				thisValue = vidObj[key].toUpperCase();
			    if (thisValue.indexOf(searchTerm) > -1){
			    	buildPlaylist();
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

	// if the match is found call the displayVideo method, unless its in the user playlist
	if (searchMatches.length > 0){
		videoGrid.empty();

		searchTerm = searchTerm.toLowerCase().capitalizeFirstLetter();
		$('h1').text("Results for '" + searchTerm + "'");
		
		buildPlaylist();
		var vidMatch = null,
			doNotDisplay = false;
		for (var i = 0; i < searchMatches.length; i++){
			vidMatch = searchMatches[i];
			doNotDisplay = false;

			for (var j = 0; j < playQueue.length; j++){
				if (vidMatch.id == playQueue[j]){
					doNotDisplay = true;
					break;
				}
			}
			if (!doNotDisplay){
				displayVideo(vidMatch, i);
			}
		}
		registerDragDrop();
		moreInfoListener();
		tagsListener();
	} else {
		generalDialog("No Matches", "Please try another search term");
	}
}


// displays the passed video within the video grid
var displayVideo = function(video, itemNum){
	var videoString = '';

	// insert clearfix for uneaven height columns
	if (itemNum % 3 === 0){
    	videoGrid.append('<div class="clearfix"></div>');
    }
	
	videoString += '<article class="col-sm-4 draggable" id="' + video.id + '" itemprop="video" itemscope itemtype="http://schema.org/VideoObject">';
	videoString += '<meta itemprop="duration" content="T04M50S" />';
	videoString += '<meta itemprop="thumbnailURL" content="http://i.ytimg.com/vi/' + video.videoID + '/hqdefault.jpg" />';
	videoString += '<meta itemprop="embedURL" content="https://youtube.googleapis.com/v/' + video.videoID + '" />';
	videoString += '<img src="http://img.youtube.com/vi/' + video.videoID + '/mqdefault.jpg" alt="' + video.title + '">';
	videoString += '<h3 itemprop="name">' + video.title + '</h3>';
	videoString += '<button class="btn btn-sm btn-info btn-block more-info-btn" name="' + video.id + '">More info</button>';
	videoString += '<div class="tags">';
	for (var i = 0; i < video.tags.length; i++){
		videoString += '<span class="label label-success individualTag">' + video.tags[i] + '</span>';
	}
	videoString += '</div>';
	videoString += '</article>';

	videoGrid.append(videoString);
}


// create the video message for now playing and more info, including rich snippets
var createVideoMessage = function(video){
	var moreInfoMessage = '';

	moreInfoMessage += '<div class="more-info-container" itemprop="video" itemscope itemtype="http://schema.org/VideoObject">';
	moreInfoMessage += '<meta itemprop="duration" content="T04M50S" />';
	moreInfoMessage += '<meta itemprop="thumbnailURL" content="http://i.ytimg.com/vi/' + video.videoID + '/hqdefault.jpg" />';
	moreInfoMessage += '<meta itemprop="embedURL" content="https://youtube.googleapis.com/v/' + video.videoID + '" />';
	moreInfoMessage += '<div class="screenshot" id="schema-videoobject"></div>';
	moreInfoMessage += '<div class="description" itemprop="description"><p>' + video.description + '</p></div>';
	moreInfoMessage += '<div class="ratings">Average rating: </div>';
	moreInfoMessage += '<div class="tags">';
	moreInfoMessage += '<input id="userTag" placeholder="your tag" class="form-control"/>';
	moreInfoMessage += '<button id="addTag" class="btn btn-primary" data-video-id="' + video.id + '">Add Tag</button>';
	for (var i = 0; i < video.tags.length; i++){
			moreInfoMessage += '<span class="label label-success individualTag">' + video.tags[i] + '</span>';
		}
	moreInfoMessage += '</div>';
	moreInfoMessage += '<div class="userRatings">Your rating: <div></div></div>';
	moreInfoMessage += '<div class="clearfix"></div>';
	moreInfoMessage += '<div class="socialIcons"><image src="images/socialIcons.png" title="share this video" id="socialIMG"></div>'
	moreInfoMessage += '</div>';

	return moreInfoMessage;
}


// build the favourite video items
var buildFaveVideos = function(){
	var faveVideosMessage = '';

	// create a message for every entry in the favourites array
	for (var i = 0; i < favouriteVideos.length; i++){
		faveVideosMessage += '<div class="faves-container">';
		faveVideosMessage += '<div class="screenshotFave"><img src="http://img.youtube.com/vi/' + favouriteVideos[i].videoID + '/mqdefault.jpg" alt="' + favouriteVideos[i].title + '"></div>';
		faveVideosMessage += '<div class="title-tags">';
		faveVideosMessage += '<h2>' + favouriteVideos[i].title + '</h2>';
		for (var j = 0; j < favouriteVideos[i].tags.length; j++){
			faveVideosMessage += '<span class="label label-success individualTag">' + favouriteVideos[i].tags[j] + '</span>';
		}
		faveVideosMessage += '</div>';
		faveVideosMessage += '<div class="description">' + favouriteVideos[i].description.substring(0,150) + '......</div>';
		faveVideosMessage += '<button class="btn btn-sm btn-info btn-block popup-more-info-btn more-info-btn" name="' + favouriteVideos[i].id + '">More info</button>';
		faveVideosMessage += '</div>';
		faveVideosMessage += '<div class="clearfix"></div>';
	}
	return faveVideosMessage;
}


// display all video objects after refreshing the video grid
var displayAllVideos = function(){
	videoGrid.empty();
	for (var i = 0; i <= videoArray.length -1; i++){
	    displayVideo(videoArray[i], i);
	}
}


// set up the playlist positioning
var  setUpPlayList = function(){
	var playlistOffset = playlist.offset(),
		playlistWidth = playlist.css('width');

	playlist.css({
		'position': 'fixed',
		'top': playlistOffset.top,
		'left': playlistOffset.left,
		'width': playlistWidth
	});
}


// sets up the jQueryUI drag and drop
var registerDragDrop = function(){

	$( ".draggable" ).draggable({
    	revert: false,
    	helper: 'clone',
    	containment: "body"
    });
    droppable.droppable({
    	hoverClass: "ui-state-hover",
    	drop: handleDrop
	});
}


// called when the user drops a video onto the playlist
var handleDrop = function(event, ui ) {
	if (!ui.draggable.hasClass('dropped')){
		var title = ui.draggable.children('h3').text(),
			image = ui.draggable.children('img').attr('src'),
			id = ui.draggable.attr('id');

		ui.draggable.draggable( 'disable' );
		$('.ui-draggable-disabled').remove();
	}
	addToPlayList(title, image, id);
}


// search the video objects by ID
var findVideoByID = function(videoID){
	if (!videoID){ 
		return false 
	}

	for (var i = 0; i < videoArray.length; i++){
		var vidObj = videoArray[i];

		if (vidObj.id == videoID){
			return videoArray[i];
		}
	}
	return false;
}


// setup the user ratings system
var createRaty = function(video){
	userRating = getUserScore(video.id);

	$('.ratings').raty({
    	score: video.rating,
    	readOnly: true
    });
    if (userRating != null){
        $('.userRatings div').raty({
        	score: userRating,
        	mouseout: function(score, evt) {
				if (score > 0){
					setUserScore(video.id, score);
				}
			}
        });
    } else {
    	$('.userRatings div').raty({
        	mouseout: function(score, evt) {
				if (score > 0){
					setUserScore(video.id, score);
				}
			}
        });
    }
}


// add video information to playlist
var addToPlayList = function(title, image, id){
	var playlistItem = '';

	playlistItem += '<article class="dropped" id="' + id + '">';
	playlistItem += '<img src="' + image + '" alt="' + title + '">';
	playlistItem += '<h3>' + title + '</h3>';
	playlistItem += '<div class="clearfix"></div>';
	playlistItem += '<a href="#" title="Remove item" id="remove' + id +'"><i class="fa fa-minus-circle"></i></a>';
	playlistItem += '</article>';

	$(playlistItem).insertBefore(droppable);
	$('main article#' + id).remove();
	
	$('.playlist #remove' + id).click(function(ev) {
		removePlaylistItem(id);
	});
	fixClearfix();
}


// remove an item from the playlist
var removePlaylistItem = function(id){
	var itemToRemove = $('aside article[id=' + id + ']');
	itemToRemove.remove();

	var video = findVideoByID(id);
	displayVideo(video, id);
	fixClearfix();
	moreInfoListener();
	tagsListener();
}


// add a new user tag to more infor dialog and the video grid
var addUserTag = function(buttonRef){
	var videoid = buttonRef.attr("data-video-id"),
		newTag = $('#userTag').val();

	if (newTag != ''){
		var video = findVideoByID(videoid);
		video.tags.push(newTag);
		$('article#' + videoid + ' .tags').append('<span class="label label-success individualTag">' + newTag + '</span>')
		$('.modal-dialog .tags').append('<span class="label label-success individualTag">' + newTag + '</span>');
		$('.tag-cloud').append('<a href="#"><span class="label label-success individualTag">' + newTag + '</span></a>');
		$('#userTag').val('')
		tagsListener();
	} else {
		generalDialog('Error', 'Please enter text before adding a tag.');
	}
}


// capitilise the first letter of a string
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


// getter for the user scores array
var getUserScore = function(videoID){
	for (var i = 0; i < userScores.length; i++){
		if (userScores[i][0] === videoID){
			return userScores[i][1];
		} 
	}
}


// setter for the user scores array
var setUserScore = function(videoID, score){
	userScores.push([videoID, score]);
}


// close menu if its open
var checkMenu = function(){
	if (body.hasClass('show-menu')){
		body.removeClass('show-menu');
	}
}


// build the user playlist, called from play button
var buildPlaylist = function(){
	playQueue = [];
	$( ".dropped" ).each(function( index ) {
	    playQueue.push($(this).attr('id'));
	});
}


// empty the playlist after user finishes watching videos
var emptyPlaylist = function(){
	$( ".dropped" ).each(function( index ) {
	    $(this).remove();
	});
}


// rejig the clearfixes after video grid manipulation
var fixClearfix = function(){
	var i = 0;
	$('#video-grid .clearfix').remove();
	$('section article').each(function(){
		i++;
		if (i % 3 === 0 ){
			$(this).after('<div class="clearfix"></div>');
		}
	});
}


///////////////////////////// Data //////////////////////////////////////
var videoArray = [],
	favouriteVideos = [],
	playQueue = [],
	userScores = [[1,3],[4,5],[8,4],[9,5],[12,5],[18,3]],
	availableTags = ["Java", "JavaScript", "HTML", "CSS", "Node.js", "jQuery", "Dave Rupert", "Christian Heilmann", "io.js",
		   			 "Social Media", "SEO", "Meta Data", "Rich Snippets", "email", "Ted talk", "Paul Irish", "Ryan Dahl",
		   			 "Bootstrap", "Mark Otto", "Web Development", "Optimization"];

var video1 = {
	id:1,
	title: "Why the web is dead",
	videoID: "CrcAPan028Y",
	tags: ["javascript", "css", "html", "ted talk", "christian heilmann", "social media"],
	description: "'The web is dead', was the introductory phrase of Christian Heilmann's TEDx speech. There is no excitement about new websites and the mobile phone is definitely not the easiest way of accessing the web when it comes to typing with your touch keyboard.</p><p> 'The problem with the internet was that we were like kittens with a laser pointer', he said. The new dawn of the internet was the app. There is an app for everything now days and the good thing is that apps are focused.",
	rating: 5
}
videoArray.push(video1);
favouriteVideos.push(video1);

var video2 = {
	id:2,
	title: "Put social back in social media",
	videoID: "gnbLLQwZxeA",
	tags: ["javascript", "ted talk", "christian heilmann", "social media", "meta data"],
	description: "'This talk was given at a local TEDx event, produced independently of the TED Conferences. Christian Heilmann brings into attention a simple, vital and yet ignored ideea: dont't look up, don't look down...look around, look inside and outside and be you and foremost be creative in all forms and sizes. Make sure that your online version is a true reflection of your offline version and not a projection of what you could be if there weren't so many life impediments to overcome.",
	rating: 5
}
videoArray.push(video2);

var video3 = {
	id:3,
	title: "jQuery Performance Myths and Realities",
	videoID: "ccFLVPNBRE4",
	tags: ["javascript", "jquery", "html", "Dave Methvin", "performance"],
	description: "Presented at jQuery Conference San Diego February 12-13, 2014. http://events.jquery.org/2014/san-diego/",
	rating: 4
}
videoArray.push(video3);
favouriteVideos.push(video3);

var video4 = {
	id:4,
	title: "The Power of Metadata",
	videoID: "i2a8pDbCabg",
	tags: ["meta data", "email", "rich snippets"],
	description: "'MIT Media Lab graduate students Deepak Jagdish and Daniel Smilkov share some surprising insights from Immersion, a tool they built to make sense of email metadata. Try out Immersion yourself and learn more about the team behind it at https://immersion.media.mit.edu and learn more about TEDxCambridge at http://www.tedxcambridge.com.",
	rating: 3
}
videoArray.push(video4);

var video5 = {
	id:5,
	title: "Google Rich Snippets Introduction",
	videoID: "LnK0d2q2H4Q",
	tags: ["meta data", "rich snippets", "html", "seo"],
	description: "This video is 100% certain to get you adding Rich Snippets markup to your site to enhance your sites presence in the search results pages. In this video I show you what snippets are and where to find the markup examples.",
	rating: 5
}
videoArray.push(video5);

var video6 = {
	id:6,
	title: "How long does it take for rich snippets to appear?",
	videoID: "thS5ryMXN88",
	tags: ["meta data", "rich snippets", "html", "seo"],
	description: "How long should it take for my RDFa markup to appear in search results as a Rich Snippet after completing the submission form?",
	rating: 4
}
videoArray.push(video6);

var video7 = {
	id:7,
	title: "HTML 5 Tutorial",
	videoID: "kDyJN7qQETA",
	tags: ["HTML"],
	description: "Learn the basics of HTML in this quick tutorial",
	rating: 2
}
videoArray.push(video7);
favouriteVideos.push(video7);

var video8 = {
	id:8,
	title: "Paul Irish, 'Delivering the goods'",
	videoID: "R8W_6xWphtw",
	tags: ["javascript", "css", "html", "paul irish", "optimization"],
	description: "Paul Irish is a front-end developer who loves the web. He is on Google Chrome's Developer Relations team as well as jQuery's. He develops the HTML5 Boilerplate, the HTML5/CSS3 feature detection library Modernizr, HTML5 Please, CSS3 Please, and other bits and bobs of open source code.",
	rating: 5
}
videoArray.push(video8);

var video9 = {
	id:9,
	title: "The Goodness of JavaScript",
	videoID: "K9rb9Ba4VV4",
	tags: ["javascript", "web development"],
	description: "Aaron Frost & Dave Geddes present the goodness of JavaScript",
	rating: 5
}
videoArray.push(video9);
favouriteVideos.push(video9);

var video10 = {
	id:10,
	title: "JavaScript Puzzlers - Puzzles to Make You Think",
	videoID: "iPxgO0OjRYk",
	tags: ["javascript"],
	description: "I presented 'JavaScript Puzzlers - Puzzlers to Make You Think' to the folks of the Vancouver JavaScript Developers Group. We had some great interactions and some fantastic discussions afterwards. Big thanks to the VanJS folks for having me!",
	rating: 5
}
videoArray.push(video10);

var video11 = {
	id:11,
	title: "ECMAScript 6, A Better JavaScript for the Ambient Web Era",
	videoID: "ZGY8Cktn6W4",
	tags: ["javascript", "ECMAScript 6"],
	description: "We've entered the Ambient Computing Era and JavaScript is its dominant programing language, But a new computing era needs a new and better JavaScript. It's called ECMAScript 6 and it's about to become the new JavaScript standard. Why do we need it? Why did it take so long? What's in it? When can you use it? Answers will be given.",
	rating: 5
}
videoArray.push(video11);

var video12 = {
	id:12,
	title: "CSS Concatenation And Minification with Grunt",
	videoID: "MK_UhwymsvU",
	tags: ["javascript", "css", "minification"],
	description: "How to Concatenate and Minify CSS using Grunt.",
	rating: 5
}
videoArray.push(video12);

var video13 = {
	id:13,
	title: "Future of Frontend Frameworks",
	videoID: "oYlvLtKd0TE",
	tags: ["javascript", "css", "html", "bootstrap", "mark otto"],
	description: "Mark Otto, creater of Bootstrap, presents the future of front end frameworks",
	rating: 3
}
videoArray.push(video13);

var video14 = {
	id:14,
	title: "io.js vs Node.js",
	videoID: "wIUkWpg9FDY",
	tags: ["javascript", "node.js", "io.js", "Mikeal Rogers", "runtime"],
	description: "",
	rating: 4
}
videoArray.push(video14);
favouriteVideos.push(video4);

var video15 = {
	id:15,
	title: "Using Node.js for Everything",
	videoID: "wsuygCu_oPY",
	tags: ["javascript", "node.js", "charlie key", "forward js"],
	description: "In his Forward JS presentation Charlie Key, CEO at Modulus, covers how a fast-moving company can use Node.js and JavaScript for basically everything and succeed. ",
	rating: 5
}
videoArray.push(video15);

var video16 = {
	id:16,
	title: "Ryan Dahl: Original Node.js presentation",
	videoID: "ztspvPYybIY",
	tags: ["javascript", "node.js", "serverside javascript", "ryan dahl"],
	description: "The first presentation on Node.js from Ryan Dahl at JSConf 2009",
	rating: 2
}
videoArray.push(video16);

var video17 = {
	id:17,
	title: "The Myth of the Genius Programmer",
	videoID: "0SARbwvhupQ",
	tags: ["programmer", "java", "google i/o", "Brian Fitzpatrick", "Ben Collins-Sussman"],
	description: "A pervasive elitism hovers in the background of collaborative software development: everyone secretly wants to be seen as a genius. In this talk, we discuss how to avoid this trap and gracefully exchange personal ego for personal growth and super-charged collaboration. We'll also examine how software tools affect social behaviors, and how to successfully manage the growth of new ideas.",
	rating: 5
}
videoArray.push(video17);

var video18 = {
	id:18,
	title: "How to Teach Yourself Code",
	videoID: "T0qAjgQFR4c",
	tags: ["javascript", "css", "html"],
	description: "A presentation from internet weel on how to teach yourself to code by Mattan Griffel",
	rating: 4
}
videoArray.push(video18);

var video19 = {
	id:19,
	title: "The first 20 hours -- how to learn anything",
	videoID: "5MgBikgcWnY",
	tags: ["programming", "learning", "josh kaufman", "ukulele"],
	description: "Josh Kaufman is the author of the #1 international bestseller, 'The Personal MBA: Master the Art of Business', as well as the upcoming book 'The First 20 Hours: Mastering the Toughest Part of Learning Anything.' Josh specializes in teaching people from all walks of life how to master practical knowledge and skills. In his talk, he shares how having his first child inspired him to approach learning in a whole new way. ",
	rating: 5
}
videoArray.push(video19);

var video20 = {
	id:20,
	title: "Gettin' Flexy with Uncle Dave",
	videoID: "xXfXWojc_Mw",
	tags: ["css", "html", "flexbox", "responsive web design", "dave rupert"],
	description: "Dave Rupert, lead developer at Paravel and co-host of the Shop Talk Show, gives essential tips and tricks on becoming flexible in responsive web design.",
	rating: 5
}
videoArray.push(video20);
favouriteVideos.push(video20);

var video21 = {
	id:21,
	title: "Making Time to Learn with Side Projects",
	videoID: "HrJ0CBbn6f0",
	tags: ["css", "html", "web design", "side projects", "dave rupert"],
	description: "Dave Rupert, Lead Developer at Paravel, talks with Treehouse teacher Randy Hoyt about new HTML5 Tags, accessibility, British websites, and the importance of side projects.",
	rating: 5
}
videoArray.push(video21);

//////////////////////////// Libraries ///////////////////////////////////////////////

/* Bootstrap v3.3.2 (http://getbootstrap.com)
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){"use strict";var b=a.fn.jquery.split(" ")[0].split(".");if(b[0]<2&&b[1]<9||1==b[0]&&9==b[1]&&b[2]<1)throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher")}(jQuery),+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one("bsTransitionEnd",function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b(),a.support.transition&&(a.event.special.bsTransitionEnd={bindType:a.support.transition.end,delegateType:a.support.transition.end,handle:function(b){return a(b.target).is(this)?b.handleObj.handler.apply(this,arguments):void 0}})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var c=a(this),e=c.data("bs.alert");e||c.data("bs.alert",e=new d(this)),"string"==typeof b&&e[b].call(c)})}var c='[data-dismiss="alert"]',d=function(b){a(b).on("click",c,this.close)};d.VERSION="3.3.2",d.TRANSITION_DURATION=150,d.prototype.close=function(b){function c(){g.detach().trigger("closed.bs.alert").remove()}var e=a(this),f=e.attr("data-target");f||(f=e.attr("href"),f=f&&f.replace(/.*(?=#[^\s]*$)/,""));var g=a(f);b&&b.preventDefault(),g.length||(g=e.closest(".alert")),g.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(g.removeClass("in"),a.support.transition&&g.hasClass("fade")?g.one("bsTransitionEnd",c).emulateTransitionEnd(d.TRANSITION_DURATION):c())};var e=a.fn.alert;a.fn.alert=b,a.fn.alert.Constructor=d,a.fn.alert.noConflict=function(){return a.fn.alert=e,this},a(document).on("click.bs.alert.data-api",c,d.prototype.close)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof b&&b;e||d.data("bs.button",e=new c(this,f)),"toggle"==b?e.toggle():b&&e.setState(b)})}var c=function(b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.isLoading=!1};c.VERSION="3.3.2",c.DEFAULTS={loadingText:"loading..."},c.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",null==f.resetText&&d.data("resetText",d[e]()),setTimeout(a.proxy(function(){d[e](null==f[b]?this.options[b]:f[b]),"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c))},this),0)},c.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")&&(c.prop("checked")&&this.$element.hasClass("active")?a=!1:b.find(".active").removeClass("active")),a&&c.prop("checked",!this.$element.hasClass("active")).trigger("change")}else this.$element.attr("aria-pressed",!this.$element.hasClass("active"));a&&this.$element.toggleClass("active")};var d=a.fn.button;a.fn.button=b,a.fn.button.Constructor=c,a.fn.button.noConflict=function(){return a.fn.button=d,this},a(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function(c){var d=a(c.target);d.hasClass("btn")||(d=d.closest(".btn")),b.call(d,"toggle"),c.preventDefault()}).on("focus.bs.button.data-api blur.bs.button.data-api",'[data-toggle^="button"]',function(b){a(b.target).closest(".btn").toggleClass("focus",/^focus(in)?$/.test(b.type))})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b),g="string"==typeof b?b:f.slide;e||d.data("bs.carousel",e=new c(this,f)),"number"==typeof b?e.to(b):g?e[g]():f.interval&&e.pause().cycle()})}var c=function(b,c){this.$element=a(b),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=this.sliding=this.interval=this.$active=this.$items=null,this.options.keyboard&&this.$element.on("keydown.bs.carousel",a.proxy(this.keydown,this)),"hover"==this.options.pause&&!("ontouchstart"in document.documentElement)&&this.$element.on("mouseenter.bs.carousel",a.proxy(this.pause,this)).on("mouseleave.bs.carousel",a.proxy(this.cycle,this))};c.VERSION="3.3.2",c.TRANSITION_DURATION=600,c.DEFAULTS={interval:5e3,pause:"hover",wrap:!0,keyboard:!0},c.prototype.keydown=function(a){if(!/input|textarea/i.test(a.target.tagName)){switch(a.which){case 37:this.prev();break;case 39:this.next();break;default:return}a.preventDefault()}},c.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},c.prototype.getItemIndex=function(a){return this.$items=a.parent().children(".item"),this.$items.index(a||this.$active)},c.prototype.getItemForDirection=function(a,b){var c=this.getItemIndex(b),d="prev"==a&&0===c||"next"==a&&c==this.$items.length-1;if(d&&!this.options.wrap)return b;var e="prev"==a?-1:1,f=(c+e)%this.$items.length;return this.$items.eq(f)},c.prototype.to=function(a){var b=this,c=this.getItemIndex(this.$active=this.$element.find(".item.active"));return a>this.$items.length-1||0>a?void 0:this.sliding?this.$element.one("slid.bs.carousel",function(){b.to(a)}):c==a?this.pause().cycle():this.slide(a>c?"next":"prev",this.$items.eq(a))},c.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},c.prototype.next=function(){return this.sliding?void 0:this.slide("next")},c.prototype.prev=function(){return this.sliding?void 0:this.slide("prev")},c.prototype.slide=function(b,d){var e=this.$element.find(".item.active"),f=d||this.getItemForDirection(b,e),g=this.interval,h="next"==b?"left":"right",i=this;if(f.hasClass("active"))return this.sliding=!1;var j=f[0],k=a.Event("slide.bs.carousel",{relatedTarget:j,direction:h});if(this.$element.trigger(k),!k.isDefaultPrevented()){if(this.sliding=!0,g&&this.pause(),this.$indicators.length){this.$indicators.find(".active").removeClass("active");var l=a(this.$indicators.children()[this.getItemIndex(f)]);l&&l.addClass("active")}var m=a.Event("slid.bs.carousel",{relatedTarget:j,direction:h});return a.support.transition&&this.$element.hasClass("slide")?(f.addClass(b),f[0].offsetWidth,e.addClass(h),f.addClass(h),e.one("bsTransitionEnd",function(){f.removeClass([b,h].join(" ")).addClass("active"),e.removeClass(["active",h].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger(m)},0)}).emulateTransitionEnd(c.TRANSITION_DURATION)):(e.removeClass("active"),f.addClass("active"),this.sliding=!1,this.$element.trigger(m)),g&&this.cycle(),this}};var d=a.fn.carousel;a.fn.carousel=b,a.fn.carousel.Constructor=c,a.fn.carousel.noConflict=function(){return a.fn.carousel=d,this};var e=function(c){var d,e=a(this),f=a(e.attr("data-target")||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""));if(f.hasClass("carousel")){var g=a.extend({},f.data(),e.data()),h=e.attr("data-slide-to");h&&(g.interval=!1),b.call(f,g),h&&f.data("bs.carousel").to(h),c.preventDefault()}};a(document).on("click.bs.carousel.data-api","[data-slide]",e).on("click.bs.carousel.data-api","[data-slide-to]",e),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var c=a(this);b.call(c,c.data())})})}(jQuery),+function(a){"use strict";function b(b){var c,d=b.attr("data-target")||(c=b.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,"");return a(d)}function c(b){return this.each(function(){var c=a(this),e=c.data("bs.collapse"),f=a.extend({},d.DEFAULTS,c.data(),"object"==typeof b&&b);!e&&f.toggle&&"show"==b&&(f.toggle=!1),e||c.data("bs.collapse",e=new d(this,f)),"string"==typeof b&&e[b]()})}var d=function(b,c){this.$element=a(b),this.options=a.extend({},d.DEFAULTS,c),this.$trigger=a(this.options.trigger).filter('[href="#'+b.id+'"], [data-target="#'+b.id+'"]'),this.transitioning=null,this.options.parent?this.$parent=this.getParent():this.addAriaAndCollapsedClass(this.$element,this.$trigger),this.options.toggle&&this.toggle()};d.VERSION="3.3.2",d.TRANSITION_DURATION=350,d.DEFAULTS={toggle:!0,trigger:'[data-toggle="collapse"]'},d.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},d.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var b,e=this.$parent&&this.$parent.children(".panel").children(".in, .collapsing");if(!(e&&e.length&&(b=e.data("bs.collapse"),b&&b.transitioning))){var f=a.Event("show.bs.collapse");if(this.$element.trigger(f),!f.isDefaultPrevented()){e&&e.length&&(c.call(e,"hide"),b||e.data("bs.collapse",null));var g=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[g](0).attr("aria-expanded",!0),this.$trigger.removeClass("collapsed").attr("aria-expanded",!0),this.transitioning=1;var h=function(){this.$element.removeClass("collapsing").addClass("collapse in")[g](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return h.call(this);var i=a.camelCase(["scroll",g].join("-"));this.$element.one("bsTransitionEnd",a.proxy(h,this)).emulateTransitionEnd(d.TRANSITION_DURATION)[g](this.$element[0][i])}}}},d.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded",!1),this.$trigger.addClass("collapsed").attr("aria-expanded",!1),this.transitioning=1;var e=function(){this.transitioning=0,this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")};return a.support.transition?void this.$element[c](0).one("bsTransitionEnd",a.proxy(e,this)).emulateTransitionEnd(d.TRANSITION_DURATION):e.call(this)}}},d.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()},d.prototype.getParent=function(){return a(this.options.parent).find('[data-toggle="collapse"][data-parent="'+this.options.parent+'"]').each(a.proxy(function(c,d){var e=a(d);this.addAriaAndCollapsedClass(b(e),e)},this)).end()},d.prototype.addAriaAndCollapsedClass=function(a,b){var c=a.hasClass("in");a.attr("aria-expanded",c),b.toggleClass("collapsed",!c).attr("aria-expanded",c)};var e=a.fn.collapse;a.fn.collapse=c,a.fn.collapse.Constructor=d,a.fn.collapse.noConflict=function(){return a.fn.collapse=e,this},a(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function(d){var e=a(this);e.attr("data-target")||d.preventDefault();var f=b(e),g=f.data("bs.collapse"),h=g?"toggle":a.extend({},e.data(),{trigger:this});c.call(f,h)})}(jQuery),+function(a){"use strict";function b(b){b&&3===b.which||(a(e).remove(),a(f).each(function(){var d=a(this),e=c(d),f={relatedTarget:this};e.hasClass("open")&&(e.trigger(b=a.Event("hide.bs.dropdown",f)),b.isDefaultPrevented()||(d.attr("aria-expanded","false"),e.removeClass("open").trigger("hidden.bs.dropdown",f)))}))}function c(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}function d(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new g(this)),"string"==typeof b&&d[b].call(c)})}var e=".dropdown-backdrop",f='[data-toggle="dropdown"]',g=function(b){a(b).on("click.bs.dropdown",this.toggle)};g.VERSION="3.3.2",g.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=c(e),g=f.hasClass("open");if(b(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click",b);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;e.trigger("focus").attr("aria-expanded","true"),f.toggleClass("open").trigger("shown.bs.dropdown",h)}return!1}},g.prototype.keydown=function(b){if(/(38|40|27|32)/.test(b.which)&&!/input|textarea/i.test(b.target.tagName)){var d=a(this);if(b.preventDefault(),b.stopPropagation(),!d.is(".disabled, :disabled")){var e=c(d),g=e.hasClass("open");if(!g&&27!=b.which||g&&27==b.which)return 27==b.which&&e.find(f).trigger("focus"),d.trigger("click");var h=" li:not(.divider):visible a",i=e.find('[role="menu"]'+h+', [role="listbox"]'+h);if(i.length){var j=i.index(b.target);38==b.which&&j>0&&j--,40==b.which&&j<i.length-1&&j++,~j||(j=0),i.eq(j).trigger("focus")}}}};var h=a.fn.dropdown;a.fn.dropdown=d,a.fn.dropdown.Constructor=g,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=h,this},a(document).on("click.bs.dropdown.data-api",b).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",f,g.prototype.toggle).on("keydown.bs.dropdown.data-api",f,g.prototype.keydown).on("keydown.bs.dropdown.data-api",'[role="menu"]',g.prototype.keydown).on("keydown.bs.dropdown.data-api",'[role="listbox"]',g.prototype.keydown)}(jQuery),+function(a){"use strict";function b(b,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},c.DEFAULTS,e.data(),"object"==typeof b&&b);f||e.data("bs.modal",f=new c(this,g)),"string"==typeof b?f[b](d):g.show&&f.show(d)})}var c=function(b,c){this.options=c,this.$body=a(document.body),this.$element=a(b),this.$backdrop=this.isShown=null,this.scrollbarWidth=0,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};c.VERSION="3.3.2",c.TRANSITION_DURATION=300,c.BACKDROP_TRANSITION_DURATION=150,c.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},c.prototype.toggle=function(a){return this.isShown?this.hide():this.show(a)},c.prototype.show=function(b){var d=this,e=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(e),this.isShown||e.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.setScrollbar(),this.$body.addClass("modal-open"),this.escape(),this.resize(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.backdrop(function(){var e=a.support.transition&&d.$element.hasClass("fade");d.$element.parent().length||d.$element.appendTo(d.$body),d.$element.show().scrollTop(0),d.options.backdrop&&d.adjustBackdrop(),d.adjustDialog(),e&&d.$element[0].offsetWidth,d.$element.addClass("in").attr("aria-hidden",!1),d.enforceFocus();var f=a.Event("shown.bs.modal",{relatedTarget:b});e?d.$element.find(".modal-dialog").one("bsTransitionEnd",function(){d.$element.trigger("focus").trigger(f)}).emulateTransitionEnd(c.TRANSITION_DURATION):d.$element.trigger("focus").trigger(f)}))},c.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.escape(),this.resize(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").attr("aria-hidden",!0).off("click.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",a.proxy(this.hideModal,this)).emulateTransitionEnd(c.TRANSITION_DURATION):this.hideModal())},c.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.trigger("focus")},this))},c.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keydown.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keydown.dismiss.bs.modal")},c.prototype.resize=function(){this.isShown?a(window).on("resize.bs.modal",a.proxy(this.handleUpdate,this)):a(window).off("resize.bs.modal")},c.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.$body.removeClass("modal-open"),a.resetAdjustments(),a.resetScrollbar(),a.$element.trigger("hidden.bs.modal")})},c.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},c.prototype.backdrop=function(b){var d=this,e=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var f=a.support.transition&&e;if(this.$backdrop=a('<div class="modal-backdrop '+e+'" />').prependTo(this.$element).on("click.dismiss.bs.modal",a.proxy(function(a){a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus.call(this.$element[0]):this.hide.call(this))},this)),f&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;f?this.$backdrop.one("bsTransitionEnd",b).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):b()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var g=function(){d.removeBackdrop(),b&&b()};a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",g).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):g()}else b&&b()},c.prototype.handleUpdate=function(){this.options.backdrop&&this.adjustBackdrop(),this.adjustDialog()},c.prototype.adjustBackdrop=function(){this.$backdrop.css("height",0).css("height",this.$element[0].scrollHeight)},c.prototype.adjustDialog=function(){var a=this.$element[0].scrollHeight>document.documentElement.clientHeight;this.$element.css({paddingLeft:!this.bodyIsOverflowing&&a?this.scrollbarWidth:"",paddingRight:this.bodyIsOverflowing&&!a?this.scrollbarWidth:""})},c.prototype.resetAdjustments=function(){this.$element.css({paddingLeft:"",paddingRight:""})},c.prototype.checkScrollbar=function(){this.bodyIsOverflowing=document.body.scrollHeight>document.documentElement.clientHeight,this.scrollbarWidth=this.measureScrollbar()},c.prototype.setScrollbar=function(){var a=parseInt(this.$body.css("padding-right")||0,10);this.bodyIsOverflowing&&this.$body.css("padding-right",a+this.scrollbarWidth)},c.prototype.resetScrollbar=function(){this.$body.css("padding-right","")},c.prototype.measureScrollbar=function(){var a=document.createElement("div");a.className="modal-scrollbar-measure",this.$body.append(a);var b=a.offsetWidth-a.clientWidth;return this.$body[0].removeChild(a),b};var d=a.fn.modal;a.fn.modal=b,a.fn.modal.Constructor=c,a.fn.modal.noConflict=function(){return a.fn.modal=d,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(c){var d=a(this),e=d.attr("href"),f=a(d.attr("data-target")||e&&e.replace(/.*(?=#[^\s]+$)/,"")),g=f.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(e)&&e},f.data(),d.data());d.is("a")&&c.preventDefault(),f.one("show.bs.modal",function(a){a.isDefaultPrevented()||f.one("hidden.bs.modal",function(){d.is(":visible")&&d.trigger("focus")})}),b.call(f,g,this)})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof b&&b;(e||"destroy"!=b)&&(e||d.data("bs.tooltip",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",a,b)};c.VERSION="3.3.2",c.TRANSITION_DURATION=150,c.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},c.prototype.init=function(b,c,d){this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&a(this.options.viewport.selector||this.options.viewport);for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},c.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},c.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c&&c.$tip&&c.$tip.is(":visible")?void(c.hoverState="in"):(c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show())},c.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide()},c.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(b);var d=a.contains(this.$element[0].ownerDocument.documentElement,this.$element[0]);if(b.isDefaultPrevented()||!d)return;var e=this,f=this.tip(),g=this.getUID(this.type);this.setContent(),f.attr("id",g),this.$element.attr("aria-describedby",g),this.options.animation&&f.addClass("fade");var h="function"==typeof this.options.placement?this.options.placement.call(this,f[0],this.$element[0]):this.options.placement,i=/\s?auto?\s?/i,j=i.test(h);j&&(h=h.replace(i,"")||"top"),f.detach().css({top:0,left:0,display:"block"}).addClass(h).data("bs."+this.type,this),this.options.container?f.appendTo(this.options.container):f.insertAfter(this.$element);var k=this.getPosition(),l=f[0].offsetWidth,m=f[0].offsetHeight;if(j){var n=h,o=this.options.container?a(this.options.container):this.$element.parent(),p=this.getPosition(o);h="bottom"==h&&k.bottom+m>p.bottom?"top":"top"==h&&k.top-m<p.top?"bottom":"right"==h&&k.right+l>p.width?"left":"left"==h&&k.left-l<p.left?"right":h,f.removeClass(n).addClass(h)}var q=this.getCalculatedOffset(h,k,l,m);this.applyPlacement(q,h);var r=function(){var a=e.hoverState;e.$element.trigger("shown.bs."+e.type),e.hoverState=null,"out"==a&&e.leave(e)};a.support.transition&&this.$tip.hasClass("fade")?f.one("bsTransitionEnd",r).emulateTransitionEnd(c.TRANSITION_DURATION):r()}},c.prototype.applyPlacement=function(b,c){var d=this.tip(),e=d[0].offsetWidth,f=d[0].offsetHeight,g=parseInt(d.css("margin-top"),10),h=parseInt(d.css("margin-left"),10);isNaN(g)&&(g=0),isNaN(h)&&(h=0),b.top=b.top+g,b.left=b.left+h,a.offset.setOffset(d[0],a.extend({using:function(a){d.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),d.addClass("in");var i=d[0].offsetWidth,j=d[0].offsetHeight;"top"==c&&j!=f&&(b.top=b.top+f-j);var k=this.getViewportAdjustedDelta(c,b,i,j);k.left?b.left+=k.left:b.top+=k.top;var l=/top|bottom/.test(c),m=l?2*k.left-e+i:2*k.top-f+j,n=l?"offsetWidth":"offsetHeight";d.offset(b),this.replaceArrow(m,d[0][n],l)},c.prototype.replaceArrow=function(a,b,c){this.arrow().css(c?"left":"top",50*(1-a/b)+"%").css(c?"top":"left","")},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},c.prototype.hide=function(b){function d(){"in"!=e.hoverState&&f.detach(),e.$element.removeAttr("aria-describedby").trigger("hidden.bs."+e.type),b&&b()}var e=this,f=this.tip(),g=a.Event("hide.bs."+this.type);return this.$element.trigger(g),g.isDefaultPrevented()?void 0:(f.removeClass("in"),a.support.transition&&this.$tip.hasClass("fade")?f.one("bsTransitionEnd",d).emulateTransitionEnd(c.TRANSITION_DURATION):d(),this.hoverState=null,this)},c.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},c.prototype.hasContent=function(){return this.getTitle()},c.prototype.getPosition=function(b){b=b||this.$element;var c=b[0],d="BODY"==c.tagName,e=c.getBoundingClientRect();null==e.width&&(e=a.extend({},e,{width:e.right-e.left,height:e.bottom-e.top}));var f=d?{top:0,left:0}:b.offset(),g={scroll:d?document.documentElement.scrollTop||document.body.scrollTop:b.scrollTop()},h=d?{width:a(window).width(),height:a(window).height()}:null;return a.extend({},e,g,h,f)},c.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},c.prototype.getViewportAdjustedDelta=function(a,b,c,d){var e={top:0,left:0};if(!this.$viewport)return e;var f=this.options.viewport&&this.options.viewport.padding||0,g=this.getPosition(this.$viewport);if(/right|left/.test(a)){var h=b.top-f-g.scroll,i=b.top+f-g.scroll+d;h<g.top?e.top=g.top-h:i>g.top+g.height&&(e.top=g.top+g.height-i)}else{var j=b.left-f,k=b.left+f+c;j<g.left?e.left=g.left-j:k>g.width&&(e.left=g.left+g.width-k)}return e},c.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},c.prototype.getUID=function(a){do a+=~~(1e6*Math.random());while(document.getElementById(a));return a},c.prototype.tip=function(){return this.$tip=this.$tip||a(this.options.template)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},c.prototype.enable=function(){this.enabled=!0},c.prototype.disable=function(){this.enabled=!1},c.prototype.toggleEnabled=function(){this.enabled=!this.enabled},c.prototype.toggle=function(b){var c=this;b&&(c=a(b.currentTarget).data("bs."+this.type),c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c))),c.tip().hasClass("in")?c.leave(c):c.enter(c)},c.prototype.destroy=function(){var a=this;clearTimeout(this.timeout),this.hide(function(){a.$element.off("."+a.type).removeData("bs."+a.type)})};var d=a.fn.tooltip;a.fn.tooltip=b,a.fn.tooltip.Constructor=c,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=d,this}}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof b&&b;(e||"destroy"!=b)&&(e||d.data("bs.popover",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");c.VERSION="3.3.2",c.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),c.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),c.prototype.constructor=c,c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content").children().detach().end()[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},c.prototype.hasContent=function(){return this.getTitle()||this.getContent()},c.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")},c.prototype.tip=function(){return this.$tip||(this.$tip=a(this.options.template)),this.$tip};var d=a.fn.popover;a.fn.popover=b,a.fn.popover.Constructor=c,a.fn.popover.noConflict=function(){return a.fn.popover=d,this}}(jQuery),+function(a){"use strict";function b(c,d){var e=a.proxy(this.process,this);this.$body=a("body"),this.$scrollElement=a(a(c).is("body")?window:c),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",e),this.refresh(),this.process()}function c(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})}b.VERSION="3.3.2",b.DEFAULTS={offset:10},b.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},b.prototype.refresh=function(){var b="offset",c=0;a.isWindow(this.$scrollElement[0])||(b="position",c=this.$scrollElement.scrollTop()),this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight();var d=this;this.$body.find(this.selector).map(function(){var d=a(this),e=d.data("target")||d.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[b]().top+c,e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){d.offsets.push(this[0]),d.targets.push(this[1])})},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.getScrollHeight(),d=this.options.offset+c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(this.scrollHeight!=c&&this.refresh(),b>=d)return g!=(a=f[f.length-1])&&this.activate(a);if(g&&b<e[0])return this.activeTarget=null,this.clear();for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(!e[a+1]||b<=e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){this.activeTarget=b,this.clear();var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")},b.prototype.clear=function(){a(this.selector).parentsUntil(this.options.target,".active").removeClass("active")};var d=a.fn.scrollspy;a.fn.scrollspy=c,a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=d,this},a(window).on("load.bs.scrollspy.data-api",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);c.call(b,b.data())})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new c(this)),"string"==typeof b&&e[b]()})}var c=function(b){this.element=a(b)};c.VERSION="3.3.2",c.TRANSITION_DURATION=150,c.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a"),f=a.Event("hide.bs.tab",{relatedTarget:b[0]}),g=a.Event("show.bs.tab",{relatedTarget:e[0]});if(e.trigger(f),b.trigger(g),!g.isDefaultPrevented()&&!f.isDefaultPrevented()){var h=a(d);this.activate(b.closest("li"),c),this.activate(h,h.parent(),function(){e.trigger({type:"hidden.bs.tab",relatedTarget:b[0]}),b.trigger({type:"shown.bs.tab",relatedTarget:e[0]})})}}},c.prototype.activate=function(b,d,e){function f(){g.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),b.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),h?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu")&&b.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),e&&e()
}var g=d.find("> .active"),h=e&&a.support.transition&&(g.length&&g.hasClass("fade")||!!d.find("> .fade").length);g.length&&h?g.one("bsTransitionEnd",f).emulateTransitionEnd(c.TRANSITION_DURATION):f(),g.removeClass("in")};var d=a.fn.tab;a.fn.tab=b,a.fn.tab.Constructor=c,a.fn.tab.noConflict=function(){return a.fn.tab=d,this};var e=function(c){c.preventDefault(),b.call(a(this),"show")};a(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',e).on("click.bs.tab.data-api",'[data-toggle="pill"]',e)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof b&&b;e||d.data("bs.affix",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function(b,d){this.options=a.extend({},c.DEFAULTS,d),this.$target=a(this.options.target).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(b),this.affixed=this.unpin=this.pinnedOffset=null,this.checkPosition()};c.VERSION="3.3.2",c.RESET="affix affix-top affix-bottom",c.DEFAULTS={offset:0,target:window},c.prototype.getState=function(a,b,c,d){var e=this.$target.scrollTop(),f=this.$element.offset(),g=this.$target.height();if(null!=c&&"top"==this.affixed)return c>e?"top":!1;if("bottom"==this.affixed)return null!=c?e+this.unpin<=f.top?!1:"bottom":a-d>=e+g?!1:"bottom";var h=null==this.affixed,i=h?e:f.top,j=h?g:b;return null!=c&&c>=e?"top":null!=d&&i+j>=a-d?"bottom":!1},c.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(c.RESET).addClass("affix");var a=this.$target.scrollTop(),b=this.$element.offset();return this.pinnedOffset=b.top-a},c.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},c.prototype.checkPosition=function(){if(this.$element.is(":visible")){var b=this.$element.height(),d=this.options.offset,e=d.top,f=d.bottom,g=a("body").height();"object"!=typeof d&&(f=e=d),"function"==typeof e&&(e=d.top(this.$element)),"function"==typeof f&&(f=d.bottom(this.$element));var h=this.getState(g,b,e,f);if(this.affixed!=h){null!=this.unpin&&this.$element.css("top","");var i="affix"+(h?"-"+h:""),j=a.Event(i+".bs.affix");if(this.$element.trigger(j),j.isDefaultPrevented())return;this.affixed=h,this.unpin="bottom"==h?this.getPinnedOffset():null,this.$element.removeClass(c.RESET).addClass(i).trigger(i.replace("affix","affixed")+".bs.affix")}"bottom"==h&&this.$element.offset({top:g-b-f})}};var d=a.fn.affix;a.fn.affix=b,a.fn.affix.Constructor=c,a.fn.affix.noConflict=function(){return a.fn.affix=d,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var c=a(this),d=c.data();d.offset=d.offset||{},null!=d.offsetBottom&&(d.offset.bottom=d.offsetBottom),null!=d.offsetTop&&(d.offset.top=d.offsetTop),b.call(c,d)})})}(jQuery);

/* jQuery UI Touch Punch 0.2.3 - For tablet devices
 * Copyright 2011–2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.*/
!function(a){function f(a,b){if(!(a.originalEvent.touches.length>1)){a.preventDefault();var c=a.originalEvent.changedTouches[0],d=document.createEvent("MouseEvents");d.initMouseEvent(b,!0,!0,window,1,c.screenX,c.screenY,c.clientX,c.clientY,!1,!1,!1,!1,0,null),a.target.dispatchEvent(d)}}if(a.support.touch="ontouchend"in document,a.support.touch){var e,b=a.ui.mouse.prototype,c=b._mouseInit,d=b._mouseDestroy;b._touchStart=function(a){var b=this;!e&&b._mouseCapture(a.originalEvent.changedTouches[0])&&(e=!0,b._touchMoved=!1,f(a,"mouseover"),f(a,"mousemove"),f(a,"mousedown"))},b._touchMove=function(a){e&&(this._touchMoved=!0,f(a,"mousemove"))},b._touchEnd=function(a){e&&(f(a,"mouseup"),f(a,"mouseout"),this._touchMoved||f(a,"click"),e=!1)},b._mouseInit=function(){var b=this;b.element.bind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),c.call(b)},b._mouseDestroy=function(){var b=this;b.element.unbind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),d.call(b)}}}(jQuery);

/* Classie - class helper functions
 * from Bonzo https://github.com/ded/bonzo
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * Copyright 2014, Dustin Diaz
 * http://www.codrops.com
 */
!function(s){"use strict";function e(s){return new RegExp("(^|\\s+)"+s+"(\\s+|$)")}function n(s,e){var n=a(s,e)?c:t;n(s,e)}var a,t,c;"classList"in document.documentElement?(a=function(s,e){return s.classList.contains(e)},t=function(s,e){s.classList.add(e)},c=function(s,e){s.classList.remove(e)}):(a=function(s,n){return e(n).test(s.className)},t=function(s,e){a(s,e)||(s.className=s.className+" "+e)},c=function(s,n){s.className=s.className.replace(e(n)," ")});var i={hasClass:a,addClass:t,removeClass:c,toggleClass:n,has:a,add:t,remove:c,toggle:n};"function"==typeof define&&define.amd?define(i):s.classie=i}(window);

/* http://tympanus.net/codrops/2014/09/16/off-canvas-menu-effects/
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * Copyright 2014, Codrops
 */
!function(){function e(){n()}function n(){d.addEventListener("click",t),i&&i.addEventListener("click",t),o.addEventListener("click",function(e){var n=e.target;u&&n!==d&&t()})}function t(){u?classie.remove(c,"show-menu"):classie.add(c,"show-menu"),u=!u}var c=document.body,o=document.querySelector(".container"),d=document.getElementById("open-button"),i=document.getElementById("close-button"),u=!1;e()}();

/* Copyright javanoob@hotmail.com
 * https://github.com/nakupanda/bootstrap3-dialog
 * Licensed under The MIT License.
 */
(function(a,b){if(typeof module!=="undefined"&&module.exports){module.exports=b(require("jquery")(a))}else{if(typeof define==="function"&&define.amd){define("bootstrap-dialog",["jquery"],function(c){return b(c)})}else{a.BootstrapDialog=b(a.jQuery)}}}(this,function(d){var b=d.fn.modal.Constructor;var c=function(f,e){b.call(this,f,e)};c.getModalVersion=function(){var e=null;if(typeof d.fn.modal.Constructor.VERSION==="undefined"){e="v3.1"}else{if(/3\.2\.\d+/.test(d.fn.modal.Constructor.VERSION)){e="v3.2"}else{e="v3.3"}}return e};c.ORIGINAL_BODY_PADDING=d("body").css("padding-right")||0;c.METHODS_TO_OVERRIDE={};c.METHODS_TO_OVERRIDE["v3.1"]={};c.METHODS_TO_OVERRIDE["v3.2"]={hide:function(g){if(g){g.preventDefault()}g=d.Event("hide.bs.modal");this.$element.trigger(g);if(!this.isShown||g.isDefaultPrevented()){return}this.isShown=false;var f=this.getGlobalOpenedDialogs();if(f.length===0){this.$body.removeClass("modal-open")}this.resetScrollbar();this.escape();d(document).off("focusin.bs.modal");this.$element.removeClass("in").attr("aria-hidden",true).off("click.dismiss.bs.modal");d.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",d.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal()}};c.METHODS_TO_OVERRIDE["v3.3"]={setScrollbar:function(){var e=c.ORIGINAL_BODY_PADDING;if(this.bodyIsOverflowing){this.$body.css("padding-right",e+this.scrollbarWidth)}},resetScrollbar:function(){var e=this.getGlobalOpenedDialogs();if(e.length===0){this.$body.css("padding-right",c.ORIGINAL_BODY_PADDING)}},hideModal:function(){this.$element.hide();this.backdrop(d.proxy(function(){var e=this.getGlobalOpenedDialogs();if(e.length===0){this.$body.removeClass("modal-open")}this.resetAdjustments();this.resetScrollbar();this.$element.trigger("hidden.bs.modal")},this))}};c.prototype={constructor:c,getGlobalOpenedDialogs:function(){var e=[];d.each(a.dialogs,function(g,f){if(f.isRealized()&&f.isOpened()){e.push(f)}});return e}};c.prototype=d.extend(c.prototype,b.prototype,c.METHODS_TO_OVERRIDE[c.getModalVersion()]);var a=function(e){this.defaultOptions=d.extend(true,{id:a.newGuid(),buttons:[],data:{},onshow:null,onshown:null,onhide:null,onhidden:null},a.defaultOptions);this.indexedButtons={};this.registeredButtonHotkeys={};this.draggableData={isMouseDown:false,mouseOffset:{}};this.realized=false;this.opened=false;this.initOptions(e);this.holdThisInstance()};a.BootstrapDialogModal=c;a.NAMESPACE="bootstrap-dialog";a.TYPE_DEFAULT="type-default";a.TYPE_INFO="type-info";a.TYPE_PRIMARY="type-primary";a.TYPE_SUCCESS="type-success";a.TYPE_WARNING="type-warning";a.TYPE_DANGER="type-danger";a.DEFAULT_TEXTS={};a.DEFAULT_TEXTS[a.TYPE_DEFAULT]="Information";a.DEFAULT_TEXTS[a.TYPE_INFO]="Information";a.DEFAULT_TEXTS[a.TYPE_PRIMARY]="Information";a.DEFAULT_TEXTS[a.TYPE_SUCCESS]="Success";a.DEFAULT_TEXTS[a.TYPE_WARNING]="Warning";a.DEFAULT_TEXTS[a.TYPE_DANGER]="Danger";a.DEFAULT_TEXTS.OK="OK";a.DEFAULT_TEXTS.CANCEL="Cancel";a.DEFAULT_TEXTS.CONFIRM="Confirmation";a.SIZE_NORMAL="size-normal";a.SIZE_SMALL="size-small";a.SIZE_WIDE="size-wide";a.SIZE_LARGE="size-large";a.BUTTON_SIZES={};a.BUTTON_SIZES[a.SIZE_NORMAL]="";a.BUTTON_SIZES[a.SIZE_SMALL]="";a.BUTTON_SIZES[a.SIZE_WIDE]="";a.BUTTON_SIZES[a.SIZE_LARGE]="btn-lg";a.ICON_SPINNER="glyphicon glyphicon-asterisk";a.defaultOptions={type:a.TYPE_PRIMARY,size:a.SIZE_NORMAL,cssClass:"",title:null,message:null,nl2br:true,closable:true,closeByBackdrop:true,closeByKeyboard:true,spinicon:a.ICON_SPINNER,autodestroy:true,draggable:false,animate:true,description:""};a.configDefaultOptions=function(e){a.defaultOptions=d.extend(true,a.defaultOptions,e)};a.dialogs={};a.openAll=function(){d.each(a.dialogs,function(f,e){e.open()})};a.closeAll=function(){d.each(a.dialogs,function(f,e){e.close()})};a.moveFocus=function(){var e=null;d.each(a.dialogs,function(g,f){e=f});if(e!==null&&e.isRealized()){e.getModal().focus()}};a.METHODS_TO_OVERRIDE={};a.METHODS_TO_OVERRIDE["v3.1"]={handleModalBackdropEvent:function(){this.getModal().on("click",{dialog:this},function(e){e.target===this&&e.data.dialog.isClosable()&&e.data.dialog.canCloseByBackdrop()&&e.data.dialog.close()});return this},updateZIndex:function(){var g=1040;var h=1050;var i=0;d.each(a.dialogs,function(j,k){i++});var f=this.getModal();var e=f.data("bs.modal").$backdrop;f.css("z-index",h+(i-1)*20);e.css("z-index",g+(i-1)*20);return this},open:function(){!this.isRealized()&&this.realize();this.getModal().modal("show");this.updateZIndex();this.setOpened(true);return this}};a.METHODS_TO_OVERRIDE["v3.2"]={handleModalBackdropEvent:a.METHODS_TO_OVERRIDE["v3.1"]["handleModalBackdropEvent"],updateZIndex:a.METHODS_TO_OVERRIDE["v3.1"]["updateZIndex"],open:a.METHODS_TO_OVERRIDE["v3.1"]["open"]};a.METHODS_TO_OVERRIDE["v3.3"]={};a.prototype={constructor:a,initOptions:function(e){this.options=d.extend(true,this.defaultOptions,e);return this},holdThisInstance:function(){a.dialogs[this.getId()]=this;return this},initModalStuff:function(){this.setModal(this.createModal()).setModalDialog(this.createModalDialog()).setModalContent(this.createModalContent()).setModalHeader(this.createModalHeader()).setModalBody(this.createModalBody()).setModalFooter(this.createModalFooter());this.getModal().append(this.getModalDialog());this.getModalDialog().append(this.getModalContent());this.getModalContent().append(this.getModalHeader()).append(this.getModalBody()).append(this.getModalFooter());return this},createModal:function(){var e=d('<div class="modal" tabindex="-1" role="dialog" aria-hidden="true"></div>');e.prop("id",this.getId()).attr("aria-labelledby",this.getId()+"_title");return e},getModal:function(){return this.$modal},setModal:function(e){this.$modal=e;return this},createModalDialog:function(){return d('<div class="modal-dialog"></div>')},getModalDialog:function(){return this.$modalDialog},setModalDialog:function(e){this.$modalDialog=e;return this},createModalContent:function(){return d('<div class="modal-content"></div>')},getModalContent:function(){return this.$modalContent},setModalContent:function(e){this.$modalContent=e;return this},createModalHeader:function(){return d('<div class="modal-header"></div>')},getModalHeader:function(){return this.$modalHeader},setModalHeader:function(e){this.$modalHeader=e;return this},createModalBody:function(){return d('<div class="modal-body"></div>')},getModalBody:function(){return this.$modalBody},setModalBody:function(e){this.$modalBody=e;return this},createModalFooter:function(){return d('<div class="modal-footer"></div>')},getModalFooter:function(){return this.$modalFooter},setModalFooter:function(e){this.$modalFooter=e;return this},createDynamicContent:function(f){var e=null;if(typeof f==="function"){e=f.call(f,this)}else{e=f}if(typeof e==="string"){e=this.formatStringContent(e)}return e},formatStringContent:function(e){if(this.options.nl2br){return e.replace(/\r\n/g,"<br />").replace(/[\r\n]/g,"<br />")}return e},setData:function(e,f){this.options.data[e]=f;return this},getData:function(e){return this.options.data[e]},setId:function(e){this.options.id=e;return this},getId:function(){return this.options.id},getType:function(){return this.options.type},setType:function(e){this.options.type=e;this.updateType();return this},updateType:function(){if(this.isRealized()){var e=[a.TYPE_DEFAULT,a.TYPE_INFO,a.TYPE_PRIMARY,a.TYPE_SUCCESS,a.TYPE_WARNING,a.TYPE_DANGER];this.getModal().removeClass(e.join(" ")).addClass(this.getType())}return this},getSize:function(){return this.options.size},setSize:function(e){this.options.size=e;this.updateSize();return this},updateSize:function(){if(this.isRealized()){var e=this;this.getModal().removeClass(a.SIZE_NORMAL).removeClass(a.SIZE_SMALL).removeClass(a.SIZE_WIDE).removeClass(a.SIZE_LARGE);this.getModal().addClass(this.getSize());this.getModalDialog().removeClass("modal-sm");if(this.getSize()===a.SIZE_SMALL){this.getModalDialog().addClass("modal-sm")}this.getModalDialog().removeClass("modal-lg");if(this.getSize()===a.SIZE_WIDE){this.getModalDialog().addClass("modal-lg")}d.each(this.options.buttons,function(g,i){var k=e.getButton(i.id);var f=["btn-lg","btn-sm","btn-xs"];var j=false;if(typeof i.cssClass==="string"){var h=i.cssClass.split(" ");d.each(h,function(l,m){if(d.inArray(m,f)!==-1){j=true}})}if(!j){k.removeClass(f.join(" "));k.addClass(e.getButtonSize())}})}return this},getCssClass:function(){return this.options.cssClass},setCssClass:function(e){this.options.cssClass=e;return this},getTitle:function(){return this.options.title},setTitle:function(e){this.options.title=e;this.updateTitle();return this},updateTitle:function(){if(this.isRealized()){var e=this.getTitle()!==null?this.createDynamicContent(this.getTitle()):this.getDefaultText();this.getModalHeader().find("."+this.getNamespace("title")).html("").append(e).prop("id",this.getId()+"_title")}return this},getMessage:function(){return this.options.message},setMessage:function(e){this.options.message=e;this.updateMessage();return this},updateMessage:function(){if(this.isRealized()){var e=this.createDynamicContent(this.getMessage());this.getModalBody().find("."+this.getNamespace("message")).html("").append(e)}return this},isClosable:function(){return this.options.closable},setClosable:function(e){this.options.closable=e;this.updateClosable();return this},setCloseByBackdrop:function(e){this.options.closeByBackdrop=e;return this},canCloseByBackdrop:function(){return this.options.closeByBackdrop},setCloseByKeyboard:function(e){this.options.closeByKeyboard=e;return this},canCloseByKeyboard:function(){return this.options.closeByKeyboard},isAnimate:function(){return this.options.animate},setAnimate:function(e){this.options.animate=e;return this},updateAnimate:function(){if(this.isRealized()){this.getModal().toggleClass("fade",this.isAnimate())}return this},getSpinicon:function(){return this.options.spinicon},setSpinicon:function(e){this.options.spinicon=e;return this},addButton:function(e){this.options.buttons.push(e);return this},addButtons:function(f){var e=this;d.each(f,function(g,h){e.addButton(h)});return this},getButtons:function(){return this.options.buttons},setButtons:function(e){this.options.buttons=e;this.updateButtons();return this},getButton:function(e){if(typeof this.indexedButtons[e]!=="undefined"){return this.indexedButtons[e]}return null},getButtonSize:function(){if(typeof a.BUTTON_SIZES[this.getSize()]!=="undefined"){return a.BUTTON_SIZES[this.getSize()]}return""},updateButtons:function(){if(this.isRealized()){if(this.getButtons().length===0){this.getModalFooter().hide()}else{this.getModalFooter().show().find("."+this.getNamespace("footer")).html("").append(this.createFooterButtons())}}return this},isAutodestroy:function(){return this.options.autodestroy},setAutodestroy:function(e){this.options.autodestroy=e},getDescription:function(){return this.options.description},setDescription:function(e){this.options.description=e;return this},getDefaultText:function(){return a.DEFAULT_TEXTS[this.getType()]},getNamespace:function(e){return a.NAMESPACE+"-"+e},createHeaderContent:function(){var e=d("<div></div>");e.addClass(this.getNamespace("header"));e.append(this.createTitleContent());e.prepend(this.createCloseButton());return e},createTitleContent:function(){var e=d("<div></div>");e.addClass(this.getNamespace("title"));return e},createCloseButton:function(){var f=d("<div></div>");f.addClass(this.getNamespace("close-button"));var e=d('<button class="close">&times;</button>');f.append(e);f.on("click",{dialog:this},function(g){g.data.dialog.close()});return f},createBodyContent:function(){var e=d("<div></div>");e.addClass(this.getNamespace("body"));e.append(this.createMessageContent());return e},createMessageContent:function(){var e=d("<div></div>");e.addClass(this.getNamespace("message"));return e},createFooterContent:function(){var e=d("<div></div>");e.addClass(this.getNamespace("footer"));return e},createFooterButtons:function(){var e=this;var f=d("<div></div>");f.addClass(this.getNamespace("footer-buttons"));this.indexedButtons={};d.each(this.options.buttons,function(g,h){if(!h.id){h.id=a.newGuid()}var i=e.createButton(h);e.indexedButtons[h.id]=i;f.append(i)});return f},createButton:function(e){var f=d('<button class="btn"></button>');f.prop("id",e.id);f.data("button",e);if(typeof e.icon!=="undefined"&&d.trim(e.icon)!==""){f.append(this.createButtonIcon(e.icon))}if(typeof e.label!=="undefined"){f.append(e.label)}if(typeof e.cssClass!=="undefined"&&d.trim(e.cssClass)!==""){f.addClass(e.cssClass)}else{f.addClass("btn-default")}if(typeof e.hotkey!=="undefined"){this.registeredButtonHotkeys[e.hotkey]=f}f.on("click",{dialog:this,$button:f,button:e},function(i){var h=i.data.dialog;var j=i.data.$button;var g=j.data("button");if(typeof g.action==="function"){g.action.call(j,h,i)}if(g.autospin){j.toggleSpin(true)}});this.enhanceButton(f);return f},enhanceButton:function(e){e.dialog=this;e.toggleEnable=function(f){var g=this;if(typeof f!=="undefined"){g.prop("disabled",!f).toggleClass("disabled",!f)}else{g.prop("disabled",!g.prop("disabled"))}return g};e.enable=function(){var f=this;f.toggleEnable(true);return f};e.disable=function(){var f=this;f.toggleEnable(false);return f};e.toggleSpin=function(i){var h=this;var g=h.dialog;var f=h.find("."+g.getNamespace("button-icon"));if(typeof i==="undefined"){i=!(e.find(".icon-spin").length>0)}if(i){f.hide();e.prepend(g.createButtonIcon(g.getSpinicon()).addClass("icon-spin"))}else{f.show();e.find(".icon-spin").remove()}return h};e.spin=function(){var f=this;f.toggleSpin(true);return f};e.stopSpin=function(){var f=this;f.toggleSpin(false);return f};return this},createButtonIcon:function(f){var e=d("<span></span>");e.addClass(this.getNamespace("button-icon")).addClass(f);return e},enableButtons:function(e){d.each(this.indexedButtons,function(g,f){f.toggleEnable(e)});return this},updateClosable:function(){if(this.isRealized()){this.getModalHeader().find("."+this.getNamespace("close-button")).toggle(this.isClosable())}return this},onShow:function(e){this.options.onshow=e;return this},onShown:function(e){this.options.onshown=e;return this},onHide:function(e){this.options.onhide=e;return this},onHidden:function(e){this.options.onhidden=e;return this},isRealized:function(){return this.realized},setRealized:function(e){this.realized=e;return this},isOpened:function(){return this.opened},setOpened:function(e){this.opened=e;return this},handleModalEvents:function(){this.getModal().on("show.bs.modal",{dialog:this},function(g){var f=g.data.dialog;f.setOpened(true);if(f.isModalEvent(g)&&typeof f.options.onshow==="function"){var e=f.options.onshow(f);if(e===false){f.setOpened(false)}return e}});this.getModal().on("shown.bs.modal",{dialog:this},function(f){var e=f.data.dialog;e.isModalEvent(f)&&typeof e.options.onshown==="function"&&e.options.onshown(e)});this.getModal().on("hide.bs.modal",{dialog:this},function(f){var e=f.data.dialog;e.setOpened(false);if(e.isModalEvent(f)&&typeof e.options.onhide==="function"){var g=e.options.onhide(e);if(g===false){e.setOpened(true)}return g}});this.getModal().on("hidden.bs.modal",{dialog:this},function(f){var e=f.data.dialog;e.isModalEvent(f)&&typeof e.options.onhidden==="function"&&e.options.onhidden(e);if(e.isAutodestroy()){delete a.dialogs[e.getId()];d(this).remove()}a.moveFocus()});this.handleModalBackdropEvent();this.getModal().on("keyup",{dialog:this},function(e){e.which===27&&e.data.dialog.isClosable()&&e.data.dialog.canCloseByKeyboard()&&e.data.dialog.close()});this.getModal().on("keyup",{dialog:this},function(f){var e=f.data.dialog;if(typeof e.registeredButtonHotkeys[f.which]!=="undefined"){var g=d(e.registeredButtonHotkeys[f.which]);!g.prop("disabled")&&g.focus().trigger("click")}});return this},handleModalBackdropEvent:function(){this.getModal().on("click",{dialog:this},function(e){d(e.target).hasClass("modal-backdrop")&&e.data.dialog.isClosable()&&e.data.dialog.canCloseByBackdrop()&&e.data.dialog.close()});return this},isModalEvent:function(e){return typeof e.namespace!=="undefined"&&e.namespace==="bs.modal"},makeModalDraggable:function(){if(this.options.draggable){this.getModalHeader().addClass(this.getNamespace("draggable")).on("mousedown",{dialog:this},function(g){var f=g.data.dialog;f.draggableData.isMouseDown=true;var e=f.getModalDialog().offset();f.draggableData.mouseOffset={top:g.clientY-e.top,left:g.clientX-e.left}});this.getModal().on("mouseup mouseleave",{dialog:this},function(e){e.data.dialog.draggableData.isMouseDown=false});d("body").on("mousemove",{dialog:this},function(f){var e=f.data.dialog;if(!e.draggableData.isMouseDown){return}e.getModalDialog().offset({top:f.clientY-e.draggableData.mouseOffset.top,left:f.clientX-e.draggableData.mouseOffset.left})})}return this},realize:function(){this.initModalStuff();this.getModal().addClass(a.NAMESPACE).addClass(this.getCssClass());this.updateSize();if(this.getDescription()){this.getModal().attr("aria-describedby",this.getDescription())}this.getModalFooter().append(this.createFooterContent());this.getModalHeader().append(this.createHeaderContent());this.getModalBody().append(this.createBodyContent());this.getModal().data("bs.modal",new c(this.getModal(),{backdrop:"static",keyboard:false,show:false}));this.makeModalDraggable();this.handleModalEvents();this.setRealized(true);this.updateButtons();this.updateType();this.updateTitle();this.updateMessage();this.updateClosable();this.updateAnimate();this.updateSize();return this},open:function(){!this.isRealized()&&this.realize();this.getModal().modal("show");return this},close:function(){this.getModal().modal("hide");return this}};a.prototype=d.extend(a.prototype,a.METHODS_TO_OVERRIDE[c.getModalVersion()]);a.newGuid=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(g){var f=Math.random()*16|0,e=g==="x"?f:(f&3|8);return e.toString(16)})};a.show=function(e){return new a(e).open()};a.alert=function(){var f={};var e={type:a.TYPE_PRIMARY,title:null,message:null,closable:false,draggable:false,buttonLabel:a.DEFAULT_TEXTS.OK,callback:null};if(typeof arguments[0]==="object"&&arguments[0].constructor==={}.constructor){f=d.extend(true,e,arguments[0])}else{f=d.extend(true,e,{message:arguments[0],callback:typeof arguments[1]!=="undefined"?arguments[1]:null})}return new a({type:f.type,title:f.title,message:f.message,closable:f.closable,draggable:f.draggable,data:{callback:f.callback},onhide:function(g){!g.getData("btnClicked")&&g.isClosable()&&typeof g.getData("callback")==="function"&&g.getData("callback")(false)},buttons:[{label:f.buttonLabel,action:function(g){g.setData("btnClicked",true);typeof g.getData("callback")==="function"&&g.getData("callback")(true);g.close()}}]}).open()};a.confirm=function(){var f={};var e={type:a.TYPE_PRIMARY,title:null,message:null,closable:false,draggable:false,btnCancelLabel:a.DEFAULT_TEXTS.CANCEL,btnOKLabel:a.DEFAULT_TEXTS.OK,btnOKClass:null,callback:null};if(typeof arguments[0]==="object"&&arguments[0].constructor==={}.constructor){f=d.extend(true,e,arguments[0])}else{f=d.extend(true,e,{message:arguments[0],closable:false,buttonLabel:a.DEFAULT_TEXTS.OK,callback:typeof arguments[1]!=="undefined"?arguments[1]:null})}if(f.btnOKClass===null){f.btnOKClass=["btn",f.type.split("-")[1]].join("-")}return new a({type:f.type,title:f.title,message:f.message,closable:f.closable,draggable:f.draggable,data:{callback:f.callback},buttons:[{label:f.btnCancelLabel,action:function(g){typeof g.getData("callback")==="function"&&g.getData("callback")(false);g.close()}},{label:f.btnOKLabel,cssClass:f.btnOKClass,action:function(g){typeof g.getData("callback")==="function"&&g.getData("callback")(true);g.close()}}]}).open()};a.warning=function(e,f){return new a({type:a.TYPE_WARNING,message:e}).open()};a.danger=function(e,f){return new a({type:a.TYPE_DANGER,message:e}).open()};a.success=function(e,f){return new a({type:a.TYPE_SUCCESS,message:e}).open()};return a}));

/* jQuery Raty FA - A Star Rating Plugin with Font Awesome
 * Licensed under The MIT License
 * @author  : Jacob Overgaard
 */
!function(t){var a={init:function(e){return this.each(function(){a.destroy.call(this),this.opt=t.extend(!0,{},t.fn.raty.defaults,e);var s=t(this),i=["number","readOnly","score","scoreName"];a._callback.call(this,i),this.opt.precision&&a._adjustPrecision.call(this),this.opt.number=a._between(this.opt.number,0,this.opt.numberMax),this.stars=a._createStars.call(this),this.score=a._createScore.call(this),a._apply.call(this,this.opt.score),this.opt.cancel&&(this.cancel=a._createCancel.call(this)),this.opt.width&&s.css("width",this.opt.width),this.opt.readOnly?a._lock.call(this):(s.css("cursor","pointer"),a._binds.call(this)),a._target.call(this,this.opt.score),s.data({settings:this.opt,raty:!0})})},_adjustPrecision:function(){this.opt.targetType="score",this.opt.half=!0},_apply:function(t){t&&t>0&&(t=a._between(t,0,this.opt.number),this.score.val(t)),a._fill.call(this,t),t&&a._roundStars.call(this,t)},_between:function(t,a,e){return Math.min(Math.max(parseFloat(t),a),e)},_binds:function(){this.cancel&&a._bindCancel.call(this),a._bindClick.call(this),a._bindOut.call(this),a._bindOver.call(this)},_bindCancel:function(){a._bindClickCancel.call(this),a._bindOutCancel.call(this),a._bindOverCancel.call(this)},_bindClick:function(){var a=this,e=t(a);a.stars.on("click.raty",function(s){a.score.val(a.opt.half||a.opt.precision?e.data("score"):t(this).data("score")),a.opt.click&&a.opt.click.call(a,parseFloat(a.score.val()),s)})},_bindClickCancel:function(){var t=this;t.cancel.on("click.raty",function(a){t.score.removeAttr("value"),t.opt.click&&t.opt.click.call(t,null,a)})},_bindOut:function(){var e=this;t(this).on("mouseleave.raty",function(t){var s=parseFloat(e.score.val())||void 0;a._apply.call(e,s),a._target.call(e,s,t),e.opt.mouseout&&e.opt.mouseout.call(e,s,t)})},_bindOutCancel:function(){var a=this;a.cancel.on("mouseleave.raty",function(e){t(this).attr("class",a.opt.cancelOff),a.opt.mouseout&&a.opt.mouseout.call(a,a.score.val()||null,e)})},_bindOverCancel:function(){var e=this;e.cancel.on("mouseover.raty",function(s){t(this).attr("class",e.opt.cancelOn),e.stars.attr("class",e.opt.starOff),a._target.call(e,null,s),e.opt.mouseover&&e.opt.mouseover.call(e,null)})},_bindOver:function(){var e=this,s=t(e),i=e.opt.half?"mousemove.raty":"mouseover.raty";e.stars.on(i,function(i){var r=parseInt(t(this).data("score"),10);if(e.opt.half){var o=parseFloat((i.pageX-t(this).offset().left)/(e.opt.size?e.opt.size:parseInt(s.css("font-size")))),n=o>.5?1:.5;r=r-1+n,a._fill.call(e,r),e.opt.precision&&(r=r-n+o),a._roundStars.call(e,r),s.data("score",r)}else a._fill.call(e,r);a._target.call(e,r,i),e.opt.mouseover&&e.opt.mouseover.call(e,r,i)})},_callback:function(t){for(var a in t)"function"==typeof this.opt[t[a]]&&(this.opt[t[a]]=this.opt[t[a]].call(this))},_createCancel:function(){var a=t(this),e=this.opt.cancelOff,s=t("<i />",{"class":e,title:this.opt.cancelHint});return"left"==this.opt.cancelPlace?a.prepend("&#160;").prepend(s):a.append("&#160;").append(s),s},_createScore:function(){return t("<input />",{type:"hidden",name:this.opt.scoreName}).appendTo(this)},_createStars:function(){for(var e=t(this),s=1;s<=this.opt.number;s++){var i=a._getHint.call(this,s),r=this.opt.score&&this.opt.score>=s?"starOn":"starOff";r=this.opt[r],t("<i />",{"class":r,title:i,"data-score":s}).appendTo(this),this.opt.space&&e.append(s<this.opt.number?"&#160;":"")}return e.children("i")},_error:function(a){t(this).html(a),t.error(a)},_fill:function(t){for(var a=this,e=0,s=1;s<=a.stars.length;s++){var i=a.stars.eq(s-1),r=a.opt.single?s==t:t>=s;if(a.opt.iconRange&&a.opt.iconRange.length>e){var o=a.opt.iconRange[e],n=o.on||a.opt.starOn,c=o.off||a.opt.starOff,l=r?n:c;s<=o.range&&i.attr("class",l),s==o.range&&e++}else{var l=r?"starOn":"starOff";i.attr("class",this.opt[l])}}},_getHint:function(t){var a=this.opt.hints[t-1];return""===a?"":a||t},_lock:function(){var e=parseInt(this.score.val(),10),s=e?a._getHint.call(this,e):this.opt.noRatedMsg;t(this).data("readonly",!0).css("cursor","").attr("title",s),this.score.attr("readonly","readonly"),this.stars.attr("title",s),this.cancel&&this.cancel.hide()},_roundStars:function(t){var a=(t-Math.floor(t)).toFixed(2);if(a>this.opt.round.down){var e="starOn";this.opt.halfShow&&a<this.opt.round.up?e="starHalf":a<this.opt.round.full&&(e="starOff"),this.stars.eq(Math.ceil(t)-1).attr("class",this.opt[e])}},_target:function(e,s){if(this.opt.target){var i=t(this.opt.target);0===i.length&&a._error.call(this,"Target selector invalid or missing!"),this.opt.targetFormat.indexOf("{score}")<0&&a._error.call(this,'Template "{score}" missing!');var r=s&&"mouseover"==s.type;void 0===e?e=this.opt.targetText:null===e?e=r?this.opt.cancelHint:this.opt.targetText:("hint"==this.opt.targetType?e=a._getHint.call(this,Math.ceil(e)):this.opt.precision&&(e=parseFloat(e).toFixed(1)),r||this.opt.targetKeep||(e=this.opt.targetText)),e&&(e=this.opt.targetFormat.toString().replace("{score}",e)),i.is(":input")?i.val(e):i.html(e)}},_unlock:function(){t(this).data("readonly",!1).css("cursor","pointer").removeAttr("title"),this.score.removeAttr("readonly","readonly");for(var e=0;e<this.opt.number;e++)this.stars.eq(e).attr("title",a._getHint.call(this,e+1));this.cancel&&this.cancel.css("display","")},cancel:function(e){return this.each(function(){t(this).data("readonly")!==!0&&(a[e?"click":"score"].call(this,null),this.score.removeAttr("value"))})},click:function(e){return t(this).each(function(){t(this).data("readonly")!==!0&&(a._apply.call(this,e),this.opt.click||a._error.call(this,'You must add the "click: function(score, evt) { }" callback.'),this.opt.click.call(this,e,t.Event("click")),a._target.call(this,e))})},destroy:function(){return t(this).each(function(){var a=t(this),e=a.data("raw");e?a.off(".raty").empty().css({cursor:e.style.cursor,width:e.style.width}).removeData("readonly"):a.data("raw",a.clone()[0])})},getScore:function(){var a,e=[];return t(this).each(function(){a=this.score.val(),e.push(a?parseFloat(a):void 0)}),e.length>1?e:e[0]},readOnly:function(e){return this.each(function(){var s=t(this);s.data("readonly")!==e&&(e?(s.off(".raty").children("i").off(".raty"),a._lock.call(this)):(a._binds.call(this),a._unlock.call(this)),s.data("readonly",e))})},reload:function(){return a.set.call(this,{})},score:function(){return arguments.length?a.setScore.apply(this,arguments):a.getScore.call(this)},set:function(a){return this.each(function(){var e=t(this),s=e.data("settings"),i=t.extend({},s,a);e.raty(i)})},setScore:function(e){return t(this).each(function(){t(this).data("readonly")!==!0&&(a._apply.call(this,e),a._target.call(this,e))})}};t.fn.raty=function(e){return a[e]?a[e].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof e&&e?void t.error("Method "+e+" does not exist!"):a.init.apply(this,arguments)},t.fn.raty.defaults={cancel:!1,cancelHint:"Cancel this rating!",cancelOff:"fa fa-fw fa-minus-square",cancelOn:"fa fa-fw fa-check-square",cancelPlace:"left",click:void 0,half:!1,halfShow:!0,hints:["bad","poor","regular","good","gorgeous"],iconRange:void 0,mouseout:void 0,mouseover:void 0,noRatedMsg:"Not rated yet!",number:5,numberMax:20,precision:!1,readOnly:!1,round:{down:.25,full:.6,up:.76},score:void 0,scoreName:"score",single:!1,size:null,space:!0,starHalf:"fa fa-fw fa-star-half-o",starOff:"fa fa-fw fa-star-o",starOn:"fa fa-fw fa-star",target:void 0,targetFormat:"{score}",targetKeep:!1,targetText:"",targetType:"hint",width:!1}}(jQuery);

/* bootstrap-tour - v0.10.1
 * http://bootstraptour.com
 * Copyright 2012-2013 Ulrich Sossou
 * Licensed under the Apache License, Version 2.0
 */
!function(t,e){var o,n;return n=e.document,o=function(){function o(o){var n;try{n=e.localStorage}catch(i){n=!1}this._options=t.extend({name:"tour",steps:[],container:"body",autoscroll:!0,keyboard:!0,storage:n,debug:!1,backdrop:!1,backdropPadding:0,redirect:!0,orphan:!1,duration:!1,delay:!1,basePath:"",template:'<div class="popover" role="tooltip"> <div class="arrow"></div> <h3 class="popover-title"></h3> <div class="popover-content"></div> <div class="popover-navigation"> <div class="btn-group"> <button class="btn btn-sm btn-default" data-role="prev">&laquo; Prev</button> <button class="btn btn-sm btn-default" data-role="next">Next &raquo;</button> <button class="btn btn-sm btn-default" data-role="pause-resume" data-pause-text="Pause" data-resume-text="Resume">Pause</button> </div> <button class="btn btn-sm btn-default" data-role="end">End tour</button> </div> </div>',afterSetState:function(){},afterGetState:function(){},afterRemoveState:function(){},onStart:function(){},onEnd:function(){},onShow:function(){},onShown:function(){},onHide:function(){},onHidden:function(){},onNext:function(){},onPrev:function(){},onPause:function(){},onResume:function(){}},o),this._force=!1,this._inited=!1,this.backdrop={overlay:null,$element:null,$background:null,backgroundShown:!1,overlayElementShown:!1}}return o.prototype.addSteps=function(t){var e,o,n;for(o=0,n=t.length;n>o;o++)e=t[o],this.addStep(e);return this},o.prototype.addStep=function(t){return this._options.steps.push(t),this},o.prototype.getStep=function(e){return null!=this._options.steps[e]?t.extend({id:"step-"+e,path:"",placement:"right",title:"",content:"<p></p>",next:e===this._options.steps.length-1?-1:e+1,prev:e-1,animation:!0,container:this._options.container,autoscroll:this._options.autoscroll,backdrop:this._options.backdrop,backdropPadding:this._options.backdropPadding,redirect:this._options.redirect,orphan:this._options.orphan,duration:this._options.duration,delay:this._options.delay,template:this._options.template,onShow:this._options.onShow,onShown:this._options.onShown,onHide:this._options.onHide,onHidden:this._options.onHidden,onNext:this._options.onNext,onPrev:this._options.onPrev,onPause:this._options.onPause,onResume:this._options.onResume},this._options.steps[e]):void 0},o.prototype.init=function(t){return this._force=t,this.ended()?(this._debug("Tour ended, init prevented."),this):(this.setCurrentStep(),this._initMouseNavigation(),this._initKeyboardNavigation(),this._onResize(function(t){return function(){return t.showStep(t._current)}}(this)),null!==this._current&&this.showStep(this._current),this._inited=!0,this)},o.prototype.start=function(t){var e;return null==t&&(t=!1),this._inited||this.init(t),null===this._current&&(e=this._makePromise(null!=this._options.onStart?this._options.onStart(this):void 0),this._callOnPromiseDone(e,this.showStep,0)),this},o.prototype.next=function(){var t;return t=this.hideStep(this._current),this._callOnPromiseDone(t,this._showNextStep)},o.prototype.prev=function(){var t;return t=this.hideStep(this._current),this._callOnPromiseDone(t,this._showPrevStep)},o.prototype.goTo=function(t){var e;return e=this.hideStep(this._current),this._callOnPromiseDone(e,this.showStep,t)},o.prototype.end=function(){var o,i;return o=function(o){return function(){return t(n).off("click.tour-"+o._options.name),t(n).off("keyup.tour-"+o._options.name),t(e).off("resize.tour-"+o._options.name),o._setState("end","yes"),o._inited=!1,o._force=!1,o._clearTimer(),null!=o._options.onEnd?o._options.onEnd(o):void 0}}(this),i=this.hideStep(this._current),this._callOnPromiseDone(i,o)},o.prototype.ended=function(){return!this._force&&!!this._getState("end")},o.prototype.restart=function(){return this._removeState("current_step"),this._removeState("end"),this.start()},o.prototype.pause=function(){var t;return t=this.getStep(this._current),t&&t.duration?(this._paused=!0,this._duration-=(new Date).getTime()-this._start,e.clearTimeout(this._timer),this._debug("Paused/Stopped step "+(this._current+1)+" timer ("+this._duration+" remaining)."),null!=t.onPause?t.onPause(this,this._duration):void 0):this},o.prototype.resume=function(){var t;return t=this.getStep(this._current),t&&t.duration?(this._paused=!1,this._start=(new Date).getTime(),this._duration=this._duration||t.duration,this._timer=e.setTimeout(function(t){return function(){return t._isLast()?t.next():t.end()}}(this),this._duration),this._debug("Started step "+(this._current+1)+" timer with duration "+this._duration),null!=t.onResume&&this._duration!==t.duration?t.onResume(this,this._duration):void 0):this},o.prototype.hideStep=function(e){var o,n,i;return(i=this.getStep(e))?(this._clearTimer(),n=this._makePromise(null!=i.onHide?i.onHide(this,e):void 0),o=function(o){return function(){var n;return n=t(i.element),n.data("bs.popover")||n.data("popover")||(n=t("body")),n.popover("destroy").removeClass("tour-"+o._options.name+"-element tour-"+o._options.name+"-"+e+"-element"),i.reflex&&n.removeClass("tour-step-element-reflex").off(""+o._reflexEvent(i.reflex)+".tour-"+o._options.name),i.backdrop&&o._hideBackdrop(),null!=i.onHidden?i.onHidden(o):void 0}}(this),this._callOnPromiseDone(n,o),n):void 0},o.prototype.showStep=function(t){var o,i,r,s;return this.ended()?(this._debug("Tour ended, showStep prevented."),this):(s=this.getStep(t))?(r=t<this._current,o=this._makePromise(null!=s.onShow?s.onShow(this,t):void 0),i=function(e){return function(){var o,i,a;if(e.setCurrentStep(t),i=function(){switch({}.toString.call(s.path)){case"[object Function]":return s.path();case"[object String]":return this._options.basePath+s.path;default:return s.path}}.call(e),o=[n.location.pathname,n.location.hash].join(""),e._isRedirect(i,o))return e._redirect(s,i),void 0;if(e._isOrphan(s)){if(!s.orphan)return e._debug("Skip the orphan step "+(e._current+1)+".\nOrphan option is false and the element does not exist or is hidden."),r?e._showPrevStep():e._showNextStep(),void 0;e._debug("Show the orphan step "+(e._current+1)+". Orphans option is true.")}return s.backdrop&&e._showBackdrop(e._isOrphan(s)?void 0:s.element),a=function(){return e.getCurrentStep()===t?(null!=s.element&&s.backdrop&&e._showOverlayElement(s),e._showPopover(s,t),null!=s.onShown&&s.onShown(e),e._debug("Step "+(e._current+1)+" of "+e._options.steps.length)):void 0},s.autoscroll?e._scrollIntoView(s.element,a):a(),s.duration?e.resume():void 0}}(this),s.delay?(this._debug("Wait "+s.delay+" milliseconds to show the step "+(this._current+1)),e.setTimeout(function(t){return function(){return t._callOnPromiseDone(o,i)}}(this),s.delay)):this._callOnPromiseDone(o,i),o):void 0},o.prototype.getCurrentStep=function(){return this._current},o.prototype.setCurrentStep=function(t){return null!=t?(this._current=t,this._setState("current_step",t)):(this._current=this._getState("current_step"),this._current=null===this._current?null:parseInt(this._current,10)),this},o.prototype._setState=function(t,e){var o,n;if(this._options.storage){n=""+this._options.name+"_"+t;try{this._options.storage.setItem(n,e)}catch(i){o=i,o.code===DOMException.QUOTA_EXCEEDED_ERR&&this._debug("LocalStorage quota exceeded. State storage failed.")}return this._options.afterSetState(n,e)}return null==this._state&&(this._state={}),this._state[t]=e},o.prototype._removeState=function(t){var e;return this._options.storage?(e=""+this._options.name+"_"+t,this._options.storage.removeItem(e),this._options.afterRemoveState(e)):null!=this._state?delete this._state[t]:void 0},o.prototype._getState=function(t){var e,o;return this._options.storage?(e=""+this._options.name+"_"+t,o=this._options.storage.getItem(e)):null!=this._state&&(o=this._state[t]),(void 0===o||"null"===o)&&(o=null),this._options.afterGetState(t,o),o},o.prototype._showNextStep=function(){var t,e,o;return o=this.getStep(this._current),e=function(t){return function(){return t.showStep(o.next)}}(this),t=this._makePromise(null!=o.onNext?o.onNext(this):void 0),this._callOnPromiseDone(t,e)},o.prototype._showPrevStep=function(){var t,e,o;return o=this.getStep(this._current),e=function(t){return function(){return t.showStep(o.prev)}}(this),t=this._makePromise(null!=o.onPrev?o.onPrev(this):void 0),this._callOnPromiseDone(t,e)},o.prototype._debug=function(t){return this._options.debug?e.console.log("Bootstrap Tour '"+this._options.name+"' | "+t):void 0},o.prototype._isRedirect=function(t,e){return null!=t&&""!==t&&("[object RegExp]"==={}.toString.call(t)&&!t.test(e)||"[object String]"==={}.toString.call(t)&&t.replace(/\?.*$/,"").replace(/\/?$/,"")!==e.replace(/\/?$/,""))},o.prototype._redirect=function(e,o){return t.isFunction(e.redirect)?e.redirect.call(this,o):e.redirect===!0?(this._debug("Redirect to "+o),n.location.href=o):void 0},o.prototype._isOrphan=function(e){return null==e.element||!t(e.element).length||t(e.element).is(":hidden")&&"http://www.w3.org/2000/svg"!==t(e.element)[0].namespaceURI},o.prototype._isLast=function(){return this._current<this._options.steps.length-1},o.prototype._showPopover=function(e,o){var n,i,r,s;return t(".tour-"+this._options.name).remove(),s=t.extend({},this._options),r=this._isOrphan(e),e.template=this._template(e,o),r&&(e.element="body",e.placement="top"),n=t(e.element),n.addClass("tour-"+this._options.name+"-element tour-"+this._options.name+"-"+o+"-element"),e.options&&t.extend(s,e.options),e.reflex&&!r&&(n.addClass("tour-step-element-reflex"),n.off(""+this._reflexEvent(e.reflex)+".tour-"+this._options.name),n.on(""+this._reflexEvent(e.reflex)+".tour-"+this._options.name,function(t){return function(){return t._isLast()?t.next():t.end()}}(this))),n.popover({placement:e.placement,trigger:"manual",title:e.title,content:e.content,html:!0,animation:e.animation,container:e.container,template:e.template,selector:e.element}).popover("show"),i=n.data("bs.popover")?n.data("bs.popover").tip():n.data("popover").tip(),i.attr("id",e.id),this._reposition(i,e),r?this._center(i):void 0},o.prototype._template=function(e,o){var n,i,r,s,a;return a=t.isFunction(e.template)?t(e.template(o,e)):t(e.template),n=a.find(".popover-navigation"),r=n.find('[data-role="prev"]'),i=n.find('[data-role="next"]'),s=n.find('[data-role="pause-resume"]'),this._isOrphan(e)&&a.addClass("orphan"),a.addClass("tour-"+this._options.name+" tour-"+this._options.name+"-"+o),e.prev<0&&r.addClass("disabled"),e.next<0&&i.addClass("disabled"),e.duration||s.remove(),a.clone().wrap("<div>").parent().html()},o.prototype._reflexEvent=function(t){return"[object Boolean]"==={}.toString.call(t)?"click":t},o.prototype._reposition=function(e,o){var i,r,s,a,p,u,h;if(a=e[0].offsetWidth,r=e[0].offsetHeight,h=e.offset(),p=h.left,u=h.top,i=t(n).outerHeight()-h.top-e.outerHeight(),0>i&&(h.top=h.top+i),s=t("html").outerWidth()-h.left-e.outerWidth(),0>s&&(h.left=h.left+s),h.top<0&&(h.top=0),h.left<0&&(h.left=0),e.offset(h),"bottom"===o.placement||"top"===o.placement){if(p!==h.left)return this._replaceArrow(e,2*(h.left-p),a,"left")}else if(u!==h.top)return this._replaceArrow(e,2*(h.top-u),r,"top")},o.prototype._center=function(o){return o.css("top",t(e).outerHeight()/2-o.outerHeight()/2)},o.prototype._replaceArrow=function(t,e,o,n){return t.find(".arrow").css(n,e?50*(1-e/o)+"%":"")},o.prototype._scrollIntoView=function(o,n){var i,r,s,a,p,u;return i=t(o),i.length?(r=t(e),a=i.offset().top,u=r.height(),p=Math.max(0,a-u/2),this._debug("Scroll into view. ScrollTop: "+p+". Element offset: "+a+". Window height: "+u+"."),s=0,t("body, html").stop(!0,!0).animate({scrollTop:Math.ceil(p)},function(t){return function(){return 2===++s?(n(),t._debug("Scroll into view.\nAnimation end element offset: "+i.offset().top+".\nWindow height: "+r.height()+".")):void 0}}(this))):n()},o.prototype._onResize=function(o,n){return t(e).on("resize.tour-"+this._options.name,function(){return clearTimeout(n),n=setTimeout(o,100)})},o.prototype._initMouseNavigation=function(){var e;return e=this,t(n).off("click.tour-"+this._options.name,".popover.tour-"+this._options.name+" *[data-role='prev']").off("click.tour-"+this._options.name,".popover.tour-"+this._options.name+" *[data-role='next']").off("click.tour-"+this._options.name,".popover.tour-"+this._options.name+" *[data-role='end']").off("click.tour-"+this._options.name,".popover.tour-"+this._options.name+" *[data-role='pause-resume']").on("click.tour-"+this._options.name,".popover.tour-"+this._options.name+" *[data-role='next']",function(t){return function(e){return e.preventDefault(),t.next()}}(this)).on("click.tour-"+this._options.name,".popover.tour-"+this._options.name+" *[data-role='prev']",function(t){return function(e){return e.preventDefault(),t.prev()}}(this)).on("click.tour-"+this._options.name,".popover.tour-"+this._options.name+" *[data-role='end']",function(t){return function(e){return e.preventDefault(),t.end()}}(this)).on("click.tour-"+this._options.name,".popover.tour-"+this._options.name+" *[data-role='pause-resume']",function(o){var n;return o.preventDefault(),n=t(this),n.text(e._paused?n.data("pause-text"):n.data("resume-text")),e._paused?e.resume():e.pause()})},o.prototype._initKeyboardNavigation=function(){return this._options.keyboard?t(n).on("keyup.tour-"+this._options.name,function(t){return function(e){if(e.which)switch(e.which){case 39:return e.preventDefault(),t._isLast()?t.next():t.end();case 37:if(e.preventDefault(),t._current>0)return t.prev();break;case 27:return e.preventDefault(),t.end()}}}(this)):void 0},o.prototype._makePromise=function(e){return e&&t.isFunction(e.then)?e:null},o.prototype._callOnPromiseDone=function(t,e,o){return t?t.then(function(t){return function(){return e.call(t,o)}}(this)):e.call(this,o)},o.prototype._showBackdrop=function(){return this.backdrop.backgroundShown?void 0:(this.backdrop=t("<div>",{"class":"tour-backdrop"}),this.backdrop.backgroundShown=!0,t("body").append(this.backdrop))},o.prototype._hideBackdrop=function(){return this._hideOverlayElement(),this._hideBackground()},o.prototype._hideBackground=function(){return this.backdrop?(this.backdrop.remove(),this.backdrop.overlay=null,this.backdrop.backgroundShown=!1):void 0},o.prototype._showOverlayElement=function(e){var o,n;return o=t(e.element),o&&0!==o.length&&!this.backdrop.overlayElementShown?(this.backdrop.overlayElementShown=!0,this.backdrop.$element=o.addClass("tour-step-backdrop"),this.backdrop.$background=t("<div>",{"class":"tour-step-background"}),n={width:o.innerWidth(),height:o.innerHeight(),offset:o.offset()},this.backdrop.$background.appendTo("body"),e.backdropPadding&&(n=this._applyBackdropPadding(e.backdropPadding,n)),this.backdrop.$background.width(n.width).height(n.height).offset(n.offset)):void 0},o.prototype._hideOverlayElement=function(){return this.backdrop.overlayElementShown?(this.backdrop.$element.removeClass("tour-step-backdrop"),this.backdrop.$background.remove(),this.backdrop.$element=null,this.backdrop.$background=null,this.backdrop.overlayElementShown=!1):void 0},o.prototype._applyBackdropPadding=function(t,e){return"object"==typeof t?(null==t.top&&(t.top=0),null==t.right&&(t.right=0),null==t.bottom&&(t.bottom=0),null==t.left&&(t.left=0),e.offset.top=e.offset.top-t.top,e.offset.left=e.offset.left-t.left,e.width=e.width+t.left+t.right,e.height=e.height+t.top+t.bottom):(e.offset.top=e.offset.top-t,e.offset.left=e.offset.left-t,e.width=e.width+2*t,e.height=e.height+2*t),e},o.prototype._clearTimer=function(){return e.clearTimeout(this._timer),this._timer=null,this._duration=null},o}(),e.Tour=o}(jQuery,window);

// Welcome tour
var tour = new Tour({
	steps: [{
		title: "Welcome to Video Caster",
		content: "Lets take a look around.",
		orphan: true,
		backdrop: true
	},{
		element: ".ui-droppable",
		title: "Build a playlist",
		content: "Drag and drop videos here to build your playlist. You can reorder your playlist by draging items up and down.",
		placement: "left"
	},{
		element: "#play-btn",
		title: "Cast your videos",
		content: "Press play to cast your videos to the television",
		placement: "bottom"
	},{
		element: "#open-button",
		title: "The Menu",
		content: "The menu contains your favourite videos and tags. You can return to the home screen from here.",
		placement: "right"
	},{
		element: "#2 button",
		title: "Video Information",
		content: "Get the video description, rate videos and add new tags through the 'more info' button.",
		placement: "below"
	}
]});
