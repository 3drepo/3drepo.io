/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

// Exposed methods through the X3DOM nodes.

function bgroundClick(event){
	$.event.trigger("bgroundClicked", event);
};

function clickObject(event) {
	$.event.trigger("clickObject", event);
};

function onMouseOver(event){
	$.event.trigger("onMouseOver", event);
}

function onMouseMove(event){
	$.event.trigger("onMouseMove", event);
}

function onMouseOver(event){
	$.event.trigger("onMouseOver", event);
}

function onViewpointChange(event){
	$.event.trigger("onViewpointChange", event);
}

function onLoaded(event){
	$.event.trigger("onLoaded", event);
}

function runtimeReady() {
	$.event.trigger("runtimeReady");
}

x3dom.runtime.ready = runtimeReady;

(function() {
	window.scale = 1;
	window.avatarHeight = 1.83 * window.scale;
	window.collDistance = 0.1 * window.scale;
	window.stepHeight = 0.4 * window.scale;

	window.speed = 2.0 * window.scale;

	//$('#viewer')[0].setAttribute('keysEnabled', 'false');
	//$('#viewer')[0].setAttribute('disableDoubleClick', 'true');
})();

/*
document.onload = function () {
//	viewerLoaded();
	var thisViewArea = thisDoc._viewarea;
	thisViewArea._disableMove = false;
};
*/


