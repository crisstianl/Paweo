document.addEventListener("DOMContentLoaded", function() {
	parseURL();

}, false);

var query;

function onYoutubeApiLoaded() {
	loadTableItems();
}

function parseURL() {
	query = getParameter('q');
}

function loadTableItems() {
	searchVideo(query, 'id', function(results) {
		//Push all video ids into array
		var videos = new Array();
		for (var i = 0; i < results.length; i++) {
			videos.push(results[i].id.videoId);
		}
		getVideosById(videos, function(results) {
			buildHTMLTable(results);
		});
	});
}

function buildHTMLTable(results) {
	var videoList = document.getElementById('video-list');
	for (var i = 0; i < results.length; i++) {
		var row = videoList.insertRow(i);
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);

		// Cell 1 content - video thumbnail
		var videoImg = "<img class='videoThumbnail' src='{0}' alt='' onclick='javascript:onVideoItemClick(\"{1}\")'>"
				.format(results[i].snippet.thumbnails.medium.url, results[i].id);

		var cell1Container = "<div class='videoList-cell1'>{0}</div>".format(videoImg);
		cell1.innerHTML = cell1Container;

		// Cell 2 content - video title, views, count and so on
		var removeIcon = "<img class='removeIcon' src='../assets/images/delete_icon.png' alt='' onclick='javascript:removePlaylistRow({0})'>"
				.format(i);
		var title = "<p class='videoTitle'>{0}</p>".format(results[i].snippet.title);
		var info = "<p class='videoSubtitle'>{0} views </br>{1}".format(Globalize.format(
				results[i].statistics.viewCount, 'n0'), Globalize.format(new Date(
						results[i].snippet.publishedAt), 'dd-MM-yyyy'));

		var cell2Container = "<div class='videoList-cell2'>{0}</div>".format(title + info
				+ removeIcon);
		cell2.innerHTML = cell2Container;
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

function onVideoItemClick(videoId) {
	// Create a popcorn instance by calling the Youtube player plugin
	var example = Popcorn.youtube('#videoPlayer', "http://www.youtube.com/watch?v=" + videoId);
	// play the video right away
	example.play();
}

function onBookmarkIconClick(videoId) {
	bookmarkVideo(videoId);
}