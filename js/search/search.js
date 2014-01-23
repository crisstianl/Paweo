document.addEventListener("DOMContentLoaded", function() {
	parseURL();
	loadTableItems();
}, false);

var query;

function parseURL() {
	query = getParameter('q');
}

function loadTableItems() {
	
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

function onVideoItemClick(videoId) {
	// Create a popcorn instance by calling the Youtube player plugin
	var example = Popcorn.youtube('#videoPlayer', "http://www.youtube.com/watch?v=" + videoId);
	// play the video right away
	example.play();
}

function onBookmarkIconClick(videoId) {
	bookmarkVideo(videoId);
}