document.addEventListener("DOMContentLoaded", function() {
	// Set playlist name
	$('.playlist_title').text(playlistName);
	// Reset playlist search views
	$('#playlistSearch-btn').text("Title");
	$('#playlistSearch-text').val("");
}, false);

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
// Keep filtered items
var itemsFound = new Array();

var sortOrder = NO_ORDER;
var sortAsceding = true;

var filterType = TITLE_FILTER;
var playlistName = "My playlist";

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
	var filterApplied = isFilterApplied();

	for (var i = 0; i < playlistItems.length; i++) {
		if (filterApplied) {
			// Filter is applied search for the id in itemsFound list
			var found = false;
			for (var j = 0; j < itemsFound.length; j++) {
				if (playlistItems[i].id.match(itemsFound) !== null) {
					found = true;
					break;
				}
			}
			if (!found) {
				continue;
			}
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
		var removeIcon = "<img class='removeIcon' src='../assets/images/delete_icon.png' alt='' onclick='javascript:removePlaylistRow({0})'>"
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

// If user has typed more than 2 letters, return true
function isFilterApplied() {
	var text = document.getElementById('playlistSearch-text').value;
	return (!isEmptyOrBlank(text) && text.length > 1);
}

function onNewBtnClick() {
	if (playlistItems.length > 0) {
		var forceSave = window.confirm("Save current list");
		if (forceSave) {
			onSaveBtnClick();
			clearPlaylist();
		} else {
			clearPlaylist();
		}
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
	// console.log(JSON.stringify(list));
	// var xmlRequest = createHttpRequest();
	// xmlRequest.open("POST",
	// 'http://localhost:8080/Paweo/php/webservices.php', true);
	// xmlRequest.onload = function(e) {
	// console.log(xmlRequest.reponseText);
	// };
	// xmlRequest.send('filename=aaa.json&content=ssrt');

	// $.post('http://localhost:8080/Paweo/php/webservices.php', {
	// filename : 'aa.json',
	// content : 'aaabb'
	// }, function(result) {
	// console.log(result);
	// });
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
	// Start search for strings larger than 2 letters
	if (isEmptyOrBlank(text) || text.length <= 2) {
		refreshData();
		return;
	}
	// Clear any previous filter
	itemsFound.length = 0;
	for (var i = 0; i < playlistItems.length; i++) {
		var found = false;

		switch (filterType) {
		case TITLE_FILTER:
			found = playlistItems[i].snippet.title.contains(text);
			break;
		case DESCRIPTION_FILTER:
			found = playlistItems[i].snippet.description.contains(text);
			break;
		case DATE_FILTER:
			found = playlistItems[i].snippet.publishedAt.contains(text);
			break;
		}

		if (found) {
			itemsFound.push(playlistItems[i].id);
		}
	}

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