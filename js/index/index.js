document.addEventListener("DOMContentLoaded", function() {
	buildMenuList();
	dbHelper.initHelper(function(){
		dbHelper.clearVideos();
	});	
}, false);

var MENU_ITEM_MOST_WATCHED = 'mostPopular';
var MENU_ITEM_LATEST = 'mostRecent';

function buildMenuList() {
	var table = document.getElementById('menuList');

	var cellContainer = "<div class='menuList-cell' onclick='javascript:onMenuItemClick(\"{0}\")'>{1}</div>";
	var thumbnail = "<img src='../assets/images/icon_audacy.png' alt='' />";
	var text = "<p>{0}</p>";

	var row = table.insertRow(0);

	row.insertCell(0).innerHTML = cellContainer.format(MENU_ITEM_MOST_WATCHED, thumbnail
			+ text.format("Popular"));
	
	row.insertCell(1).innerHTML = cellContainer.format(MENU_ITEM_LATEST, thumbnail
			+ text.format("Latest"));
}

function onMenuItemClick(category) {	
	location.href = "watch.html?category=" + category;
}
