document.addEventListener("DOMContentLoaded", function() {
	parseURL();

	$('.searchQuery').text("Search results for \"" + query + "\"");	
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
		// Push all video ids into array
		var videos = new Array();
		for (var i = 0; i < results.length - 1; i++) {
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
		var bookmarkIcon = "<img class='videoBookmark' src='../assets/images/icon_bookmark.png' alt='' onclick='javascript:onBookmarkIconClick(\"{0}\")'>"
				.format(results[i].id);

		var cell1Container = "<div class='videoList-cell1'>{0}</div>".format(videoImg
				+ bookmarkIcon);
		cell1.innerHTML = cell1Container;

		// Cell 2 content - video title, views, count and so on
		var title = "<p class='videoTitle'>{0}</p>".format(results[i].snippet.title);
		var info = "<p class='videoSubtitle'>Uploaded at {0}</br>{1} views </br>{2} likes </br>{3} dislikes"
				.format(Globalize.format(new Date(results[i].snippet.publishedAt), 'dd-MM-yyyy'),
						Globalize.format(results[i].statistics.viewCount, "n0"),
						results[i].statistics.likeCount, results[i].statistics.dislikeCount);

		var cell2Container = "<div class='videoList-cell2'>{0}</div>".format(title + info);
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
	document.getElementById('videoPlayer').innerHTML = "";
	// Create a popcorn instance by calling the Youtube player plugin
	var player = Popcorn.youtube('#videoPlayer', "http://www.youtube.com/watch?v=" + videoId);
	// play the video right away
	player.play();

	player.on("ended", function() {
	});
}

function onBookmarkIconClick(videoId) {
	bookmarkVideo(videoId);
}