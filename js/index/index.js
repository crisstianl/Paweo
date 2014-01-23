var WATCH_HTML = "watch.html";

function onHeaderMenuItemClick(category) {
	location.href = WATCH_HTML + "?category=" + category;
}

function onMenuItemOver(itemName, show) {
	if (show === true) {
		$(itemName).show();
	} else {
		$(itemName).hide();
	}
}