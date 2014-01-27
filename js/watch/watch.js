document.addEventListener("DOMContentLoaded", function() {
}, false);

// Items to be loaded on "+" click
var DEFAULT_ITEMS_TO_LOAD = 4;

// Received category type from the url(e.g."mostPopular", "mostRecent",
// "genre/pop", ...)
var category;
// Current number of categories displayed
var loadedItems = 0;
// List all available video categories
var videoCategories = new Array();

function onYoutubeApiLoaded() {
	parseURL();
	loadTableItems();
}

function parseURL() {
	category = getParameter('category');
}

function loadTableItems() {
	getVideoCategories(null, function(results) {
		// List of categories that does not contains videos
		var badCategories = [ '18', '21', '31', '33', '38', '42' ];
		for (var i = 0; i < results.items.length; i++) {
			var id = results.items[i].id;
			if (badCategories.indexOf(id) < 0) {
				videoCategories.push(results.items[i]);
			}
		}
		// We need to add the rows to table synchronously ,and we will populate
		// it asynchronously
		onMoreBtnClick();
	});
}

function addRowsToTable() {
	var videoList = document.getElementById('video-list');
	var itemsToLoad = Math.min(loadedItems + DEFAULT_ITEMS_TO_LOAD, videoCategories.length);
	// We have to double the rows ,one for category description and one for
	// category videos
	for (var i = videoList.rows.length; i < (itemsToLoad * 2); i++) {
		var row = videoList.insertRow(i);
		// Even rows contains the video category description
		if (i % 2 == 0) {
			row.insertCell(0);
		}
		// Uneven rows contains list of videos in on category
		else {
			for (var j = 0; j < DEFAULT_ITEMS_TO_LOAD; j++) {
				row.insertCell(j);
			}
		}
	}
}

function populateVideoCategories() {
	var videoList = document.getElementById('video-list');
	var itemsToLoad = Math.min(loadedItems + DEFAULT_ITEMS_TO_LOAD, videoCategories.length);
	for (var i = loadedItems; i < itemsToLoad; i++) {
		var id = videoCategories[i].id;
		var title = videoCategories[i].snippet.title;

		var bookmarkIcon = "<img class='video_bookmark' src='../assets/images/icon_bookmark.png' alt='' onclick='javascript:onBookmarkAllIconClick({0})'>"
				.format(i * 2);
		var categoryName = "<p id='{0}' class='video_category'>{1}</p>".format(id, title);
		var container = "<div id='videoList-cell1'>{0}</div>".format(categoryName + bookmarkIcon);

		var cell = videoList.rows[i * 2].cells[0];
		cell.colSpan = 4;
		cell.innerHTML = container;
	}
}

function populateVideoList() {
	var itemsToLoad = Math.min(loadedItems + DEFAULT_ITEMS_TO_LOAD, videoCategories.length);

	switch (category) {
	case 'mostPopular':
		// Query for the videos of this category
		for (var i = loadedItems; i < itemsToLoad; i++) {
			getMostPopularVideos(videoCategories[i].id, i * 2 + 1, handleVideoResults);
		}
		break;
	case 'mostRecent':
		// Query for the videos of this category
		for (var i = loadedItems; i < itemsToLoad; i++) {
			getMostRecentVideos(videoCategories[i].id, i * 2 + 1, handleVideoResults);
		}
		break;
	case 'genre/pop':
		break;
	case 'genre/house':
		break;
	case 'genre/rock':
		break;
	}
}

function handleVideoResults(results, rowNr) {
	var videoList = document.getElementById('video-list');
	var videosToLoad = Math.min(videoList.rows[rowNr].cells.length, results.items.length);

	for (var j = 0; j < videosToLoad; j++) {
		var container = "<div id='videoList-cell2' style='margin-right:{0}px'> {1} </div>";

		var thumbnail = "<img class='video_image' src='{0}' alt='' onclick='javascript:onVideoItemClick(\"{1}\")'>"
				.format(results.items[j].snippet.thumbnails.medium.url, results.items[j].id.videoId);

		var title = "<p id='{0}' class='video_title'>{1}</p>".format(results.items[j].id.videoId,
				results.items[j].snippet.title);

		var bookmarkIcon = "<img class='video_bookmark' src='../assets/images/icon_bookmark.png' alt='' onclick='javascript:onBookmarkIconClick(\"{0}\")'>"
				.format(results.items[j].id.videoId);

		var cell = videoList.rows[rowNr].cells[j];
		// add a space between cells ,to the right ,less for the last cell
		cell.innerHTML = container.format((j < videosToLoad - 1) ? '12' : '0',
				(thumbnail + title + bookmarkIcon));
	}
}

function updateLoadedItems() {
	var limit = Math.min(loadedItems + DEFAULT_ITEMS_TO_LOAD, videoCategories.length);
	if (loadedItems < limit) {
		loadedItems = limit;
	}
}

function onHeaderMenuItemClick(category) {
	window.location.href = "watch.html?category=" + category;
}

function onMenuItemOver(itemName, show) {
	if (show === true) {
		$(itemName).show();
	} else {
		$(itemName).hide();
	}
}

function onSearchVideoClick() {
	var text = document.getElementById('searchBar-text').value;
	if (!isEmptyOrBlank(text)) {
		window.location.href = "search.html?q=" + text;
	}
}

function onMoreBtnClick() {
	addRowsToTable();
	populateVideoCategories();
	populateVideoList();
	updateLoadedItems();
}

function onVideoItemClick(videoId) {
	document.getElementById('videoPlayer').innerHTML = "";	
	// Create a popcorn instance by calling the Youtube player plugin
	var player = Popcorn.youtube('#videoPlayer', "http://www.youtube.com/watch?v=" + videoId);
	// play the video right away
	player.play();
	
	player.on("ended", function(){		
	});
}

function onBookmarkIconClick(videoId) {
	bookmarkVideo(videoId);
}

// rowId is the index of the ocurred click action
function onBookmarkAllIconClick(rowId) {
	var videoList = document.getElementById('video-list');
	var row = videoList.rows[rowId + 1];
	var videoP = row.getElementsByTagName("p");
	var videoIds = new Array();

	for (var i = 0; i < videoP.length; i++) {
		videoIds.push(videoP[i].id);
	}
	bookmarkVideos(videoIds);
}