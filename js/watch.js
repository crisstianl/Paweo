// Video categories to be loaded on "+" click
const DEFAULT_VIDEO_CATEGORIES = 6;

// Maximum number of vides per category to be loaded
const DEFAULT_VIDEOS_X_CATEGORY = 4;

// List of categories that does not contains videos
const IGNORED_VIDEO_CATEGORIES = [ '18', '21', '31', '33', '38', '42' ];

// EU, US, UK, DE, RO
var userRegion = 'RO';

// Current number of categories displayed
var countCategories = 0;

// Current number of videos displayed
var countVideos = 0;

// List all available video categories
var videoCategories = new Array();

// onload
document.addEventListener("DOMContentLoaded", function() {
	getUserLocation();	
	initPlaylist();
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
	getVideoCategories(userRegion, handleVideoCategories);
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

	// We need to add the rows to table synchronously ,and we will populate it asynchronously
	onMoreBtnClick(null);
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

function loadMoreVideos() {
	const itemsToLoad = Math.min(countCategories + DEFAULT_VIDEO_CATEGORIES, videoCategories.length);
	console.log("Loading " + (itemsToLoad * DEFAULT_VIDEOS_X_CATEGORY) + " videos");

	while (countCategories < itemsToLoad) {
		const category = videoCategories[countCategories];
		getVideosDetailsByCategory(category.id, userRegion, DEFAULT_VIDEOS_X_CATEGORY, handleVideoResults);
		countCategories++;
	}
}

function handleVideoResults(categoryId, results) {
	if (results && results.length > 0) {
		var videoTable = document.getElementById('video-list');
		addVideoCategoryInTable(categoryId, videoTable);
		addVideosInTable(results, videoTable);
	}
}

function addVideoCategoryInTable(categoryId, videoTable) {
	let category = null;
	for (let i = 0; i < videoCategories.length; i++) {
		if (categoryId === videoCategories[i].id) {
			category = videoCategories[i];
			break;
		}
	}

	var row = videoTable.insertRow(-1); // last position
	var cell = row.insertCell(0);
	cell.colSpan = DEFAULT_VIDEOS_X_CATEGORY;

	let container = document.createElement('DIV');
	container.className = 'videoList-cell1';
	cell.appendChild(container);

	let categoryName = document.createElement('H4');
	categoryName.innerHTML = category.snippet.title;
	categoryName.onclick = function (ev) {
		onCategoryItemClick(ev, category.id);
	};
	container.appendChild(categoryName);
}

function addVideosInTable(videos, videoTable) {
	var row = videoTable.insertRow(-1); // last position

	for (let i = 0; i < videos.length; i++) {
		const video = videos[i];
		let cell = row.insertCell(i);
		cell.colSpan = 1;

		let container = document.createElement('DIV');
		container.className = 'videoList-cell2';
		container.onclick = function(ev) {
			onVideoItemClick(ev, video.id);
		};
		cell.appendChild(container);

		let thumbnail = document.createElement('IMG');
		thumbnail.className = 'video_image';
		thumbnail.src = video.snippet.thumbnails.medium.url;		
		container.appendChild(thumbnail);

		let title = document.createElement('P');
		title.className = 'video_title';
		title.innerHTML = video.snippet.title;
		container.appendChild(title);

		let overlay = document.createElement('DIV');
		overlay.className = 'video_overlay';
		container.appendChild(overlay);

		let bookmarkIcon = document.createElement('SPAN');
		bookmarkIcon.className = 'glyphicon glyphicon-heart';
		bookmarkIcon.onclick = function(ev) {
			onBookmarkIconClick(ev, video.id);
		};
		overlay.appendChild(bookmarkIcon);
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

function onMoreBtnClick(ev) {
	if (ev) {
		ev.stopPropagation();
	}
	loadMoreVideos();
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

function onCategoryItemClick(ev, categoryId) {
	console.log("Loading videos from category " + categoryId);
	ev.stopPropagation();
	window.location.href = "search.html?region="+ userRegion + "&category=" + categoryId;
}

function onBookmarkIconClick(ev, videoId) {
	console.log("Adding video " + videoId + " to playlist");
	ev.stopPropagation();
	bookmarkVideo(videoId);
}

// rowId is the index of the ocurred click action
function onBookmarkAllIconClick(ev, rowId) {
	ev.stopPropagation();
	var videoList = document.getElementById('video-list');
	var row = videoList.rows[rowId + 1];
	var videoP = row.getElementsByTagName("p");
	var videoIds = new Array();

	for (var i = 0; i < videoP.length; i++) {
		videoIds.push(videoP[i].id);
	}
	bookmarkVideos(videoIds);
}