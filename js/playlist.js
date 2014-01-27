document.addEventListener("DOMContentLoaded", function() {
	// Set playlist name
	$('.playlist_title').text(playlistName);
	// Reset playlist search views
	$('#playlistSearch-btn').text("Title");
	$('#playlistSearch-text').val("");

	$('#playlistSearch-text').keyup(function() {
		onSearchTextChanged(this.value);
	});

}, false);

var URL_DOWNLOADER = 'http://fenrir.info.uaic.ro/~adrian.lucaci/Paweo/php/downloader.php';

// List sort types
var NO_ORDER = -1;
var TITLE_ORDER = 0;
var DATE_ORDER = 1;
var VIEWS_ORDER = 2;
var LIKES_ORDER = 3;

// List filter types
var TITLE_FILTER = 0;
var DESCRIPTION_FILTER = 1;
var DATE_FILTER = 2;

var MAX_ITEMS_IN_PLAYLIST = 50;
// Keep all items from playlist
var playlistItems = new Array();

var sortOrder = NO_ORDER;
var sortAsceding = true;

var filterType = TITLE_FILTER;
var playlistName = "My playlist";
var filterText = "";

function bookmarkVideo(videoId) {
	// Check for a duplicate in list
	if (!checkInList(videoId)) {
		getVideoById(videoId, function(result) {
			playlistItems.push(result);
			refreshData();
		});
	}
}

function bookmarkVideos(videoIds) {
	// Remove duplicate videos
	var pendingVideos = checkPlaylistItems(videoIds);
	if (pendingVideos.length > 0) {
		getVideosById(pendingVideos, function(results) {
			for (var i = 0; i < results.length; i++) {
				playlistItems.push(results[i]);
			}
			refreshData();
		});
	}
}

function populatePlaylistTable() {
	var playlist = document.getElementById('video-playlist');

	for (var i = 0; i < playlistItems.length; i++) {
		var valid = checkFilter(playlistItems[i]);
		if (!valid) {
			continue;
		}

		var row = playlist.insertRow(playlist.rows.length);
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);

		// Cell 1 content - video thumbnail
		var videoImg = "<img class='videoThumbnail' src='{0}' alt='' onclick='javascript:onVideoItemClick(\"{1}\")'>"
				.format(playlistItems[i].snippet.thumbnails.medium.url, playlistItems[i].id);

		var cell1Container = "<div class='videoPlaylist-cell1'>{0}</div>".format(videoImg);
		cell1.innerHTML = cell1Container;

		// Cell 2 content - video title, views, count and so on
		var removeIcon = "<figure class='removeIcon'><img src='../assets/images/icon_delete.png' alt='' onclick='javascript:removePlaylistRow({0})'></figure>"
				.format(i);
		var title = "<p class='videoTitle'>{0}</p>".format(playlistItems[i].snippet.title);
		var info = "<p class='videoSubtitle'>{0} views </br>{1}".format(Globalize.format(
				playlistItems[i].statistics.viewCount, 'n0'), Globalize.format(new Date(
				playlistItems[i].snippet.publishedAt), 'dd-MM-yyyy'));

		var cell2Container = "<div class='videoPlaylist-cell2'>{0}</div>".format(title + info
				+ removeIcon);
		cell2.innerHTML = cell2Container;
	}
}

function clearPlaylist() {
	// Clear array
	playlistItems.length = 0;
	// Clear table
	$('#video-playlist').empty();
}

function removePlaylistRow(row) {
	playlistItems.splice(row, 1);
	refreshData();
}

function refreshData() {
	// Clear table
	$('#video-playlist').empty();
	// Reorder list
	if (sortOrder != NO_ORDER) {
		playlistItems.sort(sortComparator);
	}
	populatePlaylistTable();
}

sortComparator = function getSortComparator(a, b) {
	var retValue = 0;

	switch (sortOrder) {
	case TITLE_ORDER:
		retValue = a.snippet.title < b.snippet.title ? -1 : 1;
		break;
	case DATE_ORDER:
		var d1 = new Date(a.snippet.publishedAt);
		var d2 = new Date(b.snippet.publishedAt);
		retValue = d1 < d2 ? -1 : 1;
		break;
	case VIEWS_ORDER:
		retValue = a.statistics.viewCount < b.statistics.viewCount ? -1 : 1;
		break;
	case LIKES_ORDER:
		retValue = a.statistics.likeCount < b.statistics.likeCount ? -1 : 1;
		break;
	}

	// For descending order just inverse the sign;
	if (!sortAsceding) {
		retValue *= -1;
	}
	return retValue;
};

function checkInList(videoId) {
	for (var i = 0; i < playlistItems.length; i++) {
		if (playlistItems[i].id === videoId) {
			return true;
		}
	}
	return false;
}

function checkPlaylistItems(videoIds) {
	var retList = new Array();
	for (var i = 0; i < videoIds.length; i++) {
		if (!checkInList(videoIds[i])) {
			retList.push(videoIds[i]);
		}
	}

	return retList;
}

function checkFilter(row) {
	if (filterText.length <= 2) {
		return true;
	}

	switch (filterType) {
	case TITLE_FILTER:
		if (row.snippet.title.contains(filterText)) {
			return true;
		}
		break;
	case DESCRIPTION_FILTER:
		if (row.snippet.description.contains(filterText)) {
			return true;
		}
		break;
	case DATE_FILTER:
		if (row.snippet.publishedAt.contains(filterText)) {
			return true;
		}
		break;
	}

	return false;
}

function onNewBtnClick() {
	if (playlistItems.length > 0) {
		var forceSave = window.confirm("Save current list");
		if (forceSave) {
			onSaveBtnClick();
		}
		clearPlaylist();
	}
}

function onLoadBtnClick() {
	var loadHandler = function() {
		var errorMsg = null;
		if (this.files.length === 0) {
			errorMsg = "No file selected";
		} else if (getFileExtension(this.files[0].name) !== "json") {
			errorMsg = "Invalid file extension, only JSON accepted";
		}
		if (errorMsg != null) {
			alert(errorMsg);
		} else {
			var reader = new FileReader();
			reader.onload = function(e) {
				var videoList = JSON.parse(e.target.result);
				var videoIds = new Array();
				for (var i = 0; i < videoList.length; i++) {
					videoIds.push(videoList[i].videoId);
				}

				bookmarkVideos(videoIds);
			};
			reader.readAsText(this.files[0]);

		}
	};

	var input = document.createElement('input');
	input.type = 'file';
	input.accept = '.JSON';
	input.addEventListener("change", loadHandler, false);
	input.click();
}

function onSaveBtnClick() {
	var list = new Array();

	for (var i = 0; i < playlistItems.length; i++) {
		var obj = {
			videoId : playlistItems[i].id,
			videoTitle : playlistItems[i].snippet.title
		};
		list.push(obj);
	}

	var params = {
		'filename' : playlistName + ".json",
		'content' : JSON.stringify(list)
	};

	var form = document.createElement("form");
	form.setAttribute("method", "post");
	form.setAttribute("action", URL_DOWNLOADER);

	for ( var key in params) {
		if (params.hasOwnProperty(key)) {
			var hiddenField = document.createElement("input");
			hiddenField.setAttribute("type", "hidden");
			hiddenField.setAttribute("name", key);
			hiddenField.setAttribute("value", params[key]);

			form.appendChild(hiddenField);
		}
	}

	form.submit();
}

function onSortOrderChanged(newSortOrder) {
	if (sortOrder === newSortOrder) {
		sortAsceding = false;
	} else {
		sortOrder = newSortOrder;
		sortAsceding = true;
	}
	setDropdownSortTypes();
	refreshData();
}

function onSearchTextChanged(text) {
	filterText = text;
	refreshData();
}

function onSearchPlaylistClick(btn) {
	// Loop through posible filters
	filterType++;
	switch (filterType) {
	case DESCRIPTION_FILTER:
		btn.innerHTML = "Desc";
		break;
	case DATE_FILTER:
		btn.innerHTML = "Date";
		break;
	default:
		filterType = TITLE_FILTER;
		btn.innerHTML = "Title";
	}
	// Apply new filter on list
	onSearchTextChanged(document.getElementById('playlistSearch-text').value);
}

function changePlaylistName() {
	var input = window.prompt("Name playlist", playlistName);
	if (!isEmptyOrBlank(input)) {
		playlistName = input;
		$('.playlist_title').text(playlistName);
	}
}

function setDropdownSortTypes() {
	switch (sortOrder) {
	case TITLE_ORDER:
		$('.dropdown-toggle').text("Title");
		break;
	case DATE_ORDER:
		$('.dropdown-toggle').text("Date");
		break;
	case VIEWS_ORDER:
		$('.dropdown-toggle').text("Views");
		break;
	case LIKES_ORDER:
		$('.dropdown-toggle').text("Likes");
		break;
	}
	$('.dropdown-toggle').append(" <span class='caret'></span>");
}