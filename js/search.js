// Maximum number of searched vides
const DEFAULT_ITEMS_TO_LOAD = 25;

// List of categories that does not contains videos
const IGNORED_VIDEO_CATEGORIES = [ '18', '21', '31', '33', '38', '42' ];

// EU, US, UK, DE, RO
var userRegion = 'RO';

// Parameters
var query = getParameter('q');
var categoryId = getParameter('category');

// List all available video categories
var videoCategories = new Array();

var nextPageId = null;

// onload
document.addEventListener("DOMContentLoaded", function() {
	getUserLocation();
	initPlaylist();
	if (query) {
		document.getElementById('searchBar-text').value = query;
	}	
}, false);

function getUserLocation() {
	let pRegion = getParameter('region');
	if (pRegion && pRegion.length == 2) {
		userRegion = pRegion;
		return;
	} 

	dbHelper.getUser("1", function(user) {
		if (user) {
			userRegion = user.countryCode;
		} else {
			geolocation(function(response) {
				response.id = "1";
				userRegion = response.regionCode;
				dbHelper.insertUser(response);
			});
		}
	});	
}

function onYoutubeApiLoaded() {
	// load left menu categories
	getVideoCategories(userRegion, handleVideoCategories);

	// search videos
	onMoreBtnClick(null);
}

function handleVideoCategories(results) {
	for (var i = 0; i < results.length; i++) {
		var id = results[i].id;
		if (IGNORED_VIDEO_CATEGORIES.indexOf(id) < 0) {
			videoCategories.push(results[i]);
		}
	}

	// populate left menu
	addLeftMenuItems();
}

function handleSearchResults(results, nextPage) {
	nextPageId = nextPage;

	// Push all video ids into array
	const videoIds = new Array();
	for (let i = 0; i < results.length; i++) {
		videoIds.push(results[i].id.videoId);
	}

	getVideosDetails(videoIds, function(videoResults) {
		addTableHeader();
		addRowsToTable(videoResults);
	});
}

function addLeftMenuItems() {
	let navMenu = document.getElementById('leftMenu');
	for (let i = 0; i < videoCategories.length; i++) {
		const categoryId = videoCategories[i].id;
		let li = document.createElement('LI');
		li.innerHTML = videoCategories[i].snippet.title;
		li.onclick = function(ev) {
			onCategoryItemClick(ev, categoryId);
		};
		navMenu.appendChild(li);
	}
}

function addTableHeader() {
	let str = "Video results";
	if (query) {
		str = "Search results for \"" + query + "\"";
	} else if (categoryId) {
		for (let i = 0; i < videoCategories.length; i++) {
			if (categoryId === videoCategories[i].id) {
				str = videoCategories[i].snippet.title;
				break;
			}
		}
	}
	document.getElementById('search-text').innerHTML = str;
}

function addRowsToTable(results) {
	const videoList = document.getElementById('video-list');
	// add search results
	for (let i = 0; i < results.length; i++) {
		const video = results[i];

		let row = videoList.insertRow(-1);
		row.onclick = function (ev) {
			onVideoItemClick(ev, video.id);
		};
		let cell1 = row.insertCell(0);
		let cell2 = row.insertCell(1);

		// Cell 1 content - video thumbnail
		let thumbnail = document.createElement('IMG');
		thumbnail.className = 'videoThumbnail';
		thumbnail.src = video.snippet.thumbnails.medium.url;
		cell1.appendChild(thumbnail);

		// Cell 2 content - video title, views, count and so on
		let infoContainer = document.createElement('DIV');
		infoContainer.className = 'infoContainer';
		cell2.appendChild(infoContainer);

		let title = document.createElement('P');
		title.className = 'videoTitle';
		title.innerHTML = video.snippet.title;
		infoContainer.appendChild(title);

		let infoVideo = document.createElement('P');
		infoVideo.className = 'videoInfo';
		infoContainer.appendChild(infoVideo);

		let channelEl = document.createTextNode(video.snippet.channelTitle);
		infoVideo.appendChild(channelEl);
		infoVideo.appendChild(document.createElement('BR'));

		let viewsEl = document.createTextNode(Globalize.format(parseInt(video.statistics.viewCount), 'n0') + " views ");
		infoVideo.appendChild(viewsEl);

		let likesEl = document.createTextNode(Globalize.format(parseInt(video.statistics.likeCount), 'n0') + " likes ");
		infoVideo.appendChild(likesEl);

		let dislikesEl = document.createTextNode(Globalize.format(parseInt(video.statistics.dislikeCount), 'n0') + " dislikes ");
		infoVideo.appendChild(dislikesEl);

		let commentsEl = document.createTextNode(Globalize.format(parseInt(video.statistics.commentCount), 'n0') + " comments");
		infoVideo.appendChild(commentsEl);
		infoVideo.appendChild(document.createElement('BR'));

		let publishedEt = document.createTextNode(Globalize.format(new Date(video.snippet.publishedAt), 'dd.MM.yyyy'));
		infoVideo.appendChild(publishedEt);

		let bookmarkBtn = document.createElement('SPAN');
		bookmarkBtn.className = 'bookmarkBtn';
		bookmarkBtn.onclick = function (ev) {
			onBookmarkIconClick(ev, video.id);
		};
		let bookmarkIcon = document.createElement('SPAN');
		bookmarkIcon.className = 'glyphicon glyphicon-heart';
		bookmarkBtn.appendChild(bookmarkIcon);
		cell2.appendChild(bookmarkBtn);
	}
}

function onSearchTextChanged(ev, htmlInput) {
	ev.preventDefault();
    if (ev.keyCode === 13) { // enter
		var text = htmlInput.value;
		if (text && text.length > 1) {
			window.location.href = "search.html?region="+ userRegion + "&q=" + text;
		}
    }
}

function onSearchVideoClick(ev) {
	ev.stopPropagation();
	var text = document.getElementById('searchBar-text').value;
	if (text && text.length > 1) {
		window.location.href = "search.html?region="+ userRegion + "&q=" + text;
	}
}

function onVideoItemClick(ev, videoId) {
	console.log("Opening video " + videoId);
	ev.stopPropagation();	
	playYoutubeVideo(videoId, function() {
		// nothing
	});
}

function playYoutubeVideo(videoId, onVideoFinished) {
	document.getElementById('videoPlayer').innerHTML = "";
	// Create a popcorn instance by calling the Youtube player plugin
	var player = Popcorn.youtube('#videoPlayer', "http://www.youtube.com/watch?v=" + videoId);
	
	// play the video right away
	player.play();

	player.on("ended", onVideoFinished);
}

function onBookmarkIconClick(ev, videoId) {
	console.log("Adding video " + videoId + " to playlist");
	ev.stopPropagation();
	bookmarkVideo(videoId);
}

function onCategoryItemClick(ev, categoryId) {
	console.log("Loading videos from category " + categoryId);
	ev.stopPropagation();
	window.location.href = "search.html?region="+ userRegion + "&category=" + categoryId;
}

function onMoreBtnClick(ev) {
	console.log("Loading " + DEFAULT_ITEMS_TO_LOAD + " videos");
	if (ev) {
		ev.stopPropagation();
	}

	// search videos by keyword
	if (!isEmptyOrBlank(query)) {
		searchVideosByKeyword(query, userRegion, nextPageId, DEFAULT_ITEMS_TO_LOAD, handleSearchResults);
		return;
	} 
	
	// search videos by category
	if(!isEmptyOrBlank(categoryId)) {
		searchVideosByCategory(categoryId, userRegion, nextPageId, DEFAULT_ITEMS_TO_LOAD, handleSearchResults);
	}
}