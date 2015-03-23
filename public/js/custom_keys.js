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
function onKeyPress(charCode) {
	var thisDoc = x3dom.canvases[0].doc;
	var thisViewArea = thisDoc._viewarea;
	var thisElem = thisDoc._x3dElem;

	switch(charCode) {
		case 114:
			thisViewArea.resetView();
			break;
        case  102: /* d, switch on/off buffer view for dbg */
            if (thisViewArea._visDbgBuf === undefined) {
                thisViewArea._visDbgBuf = (thisElem.getAttribute("showLog") === 'true');
            }
            thisViewArea._visDbgBuf = !thisViewArea._visDbgBuf;
            x3dom.debug.logContainer.style.display = (thisViewArea._visDbgBuf == true) ? "block" : "none";
            break;
		case 109:
			thisViewArea._points = ++ thisViewArea._points % 3;
			break;
	}
};

function onKeyDown(keyCode)
{
	var thisDoc = x3dom.canvases[0].doc;
	var thisViewArea = thisDoc._viewarea;
	var navi = thisViewArea._scene.getNavigationInfo();

	var dist = thisViewArea._deltaT * navi._vf.speed;

	var yRotRad = (thisViewArea._yaw / 180 * Math.PI);
	var dx = Math.cos(yRotRad) * dist;
	var dz = Math.sin(yRotRad) * dist;

	if (thisViewArea._disableMove)
		return;

    switch (keyCode) {
        case 65: /* left */
			thisViewArea._eyePos.x += dx;
			thisViewArea._eyePos.z += dz;
			break;
        case 87: /* up */
			thisViewArea._eyePos.x -= dz;
			thisViewArea._eyePos.z += dx;
            break;
        case 68: /* right */
			thisViewArea._eyePos.x -= dx;
			thisViewArea._eyePos.z -= dz;
			break;
        case 83: /* down */
			thisViewArea._eyePos.x += dz;
			thisViewArea._eyePos.z -= dx;
            break;
        default:
    }
};

function lockChangeAlert() {
	var currentCanvas = x3dom.canvases[0].canvas;
	var currentViewArea = currentCanvas.parent.doc._viewarea;

	if(document.pointerLockElement === currentCanvas ||
		document.mozPointerLockElement === currentCanvas ||
		document.webkitPointerLockElement === currentCanvas) {

		// Pointer lock enabled
		currentCanvas.locked = true;
	} else {
		currentCanvas.locked = false;
	}
}

$(document).on("onLoaded", function(event, objEvent) {
	var currentCanvas = x3dom.canvases[0].canvas;
	var currentViewArea = currentCanvas.parent.doc._viewarea;

	currentViewArea._disableMove = false;
});


$(document).on("runtimeReady", function() {
	var currentCanvas = x3dom.canvases[0].canvas;

	document.addEventListener('pointerlockchange', lockChangeAlert, false);
	document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
	document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

	currentCanvas.addEventListener('keypress', function(evt) {
		onKeyPress(evt.charCode);
	}, true);

	currentCanvas.addEventListener('keydown', function (evt) {
			onKeyDown(evt.keyCode);
	}, true);

	var currentViewArea = currentCanvas.parent.doc._viewarea;

	currentCanvas.requestPointerLock = currentCanvas.requestPointerLock ||
			currentCanvas.mozRequestPointerLock ||
			currentCanvas.webkitRequestPointerLock;

	/*
	currentCanvas.addEventListener('click', function (evt) {
		currentCanvas.requestPointerLock();
		currentCanvas.cumulX = evt.clientX;
		currentCanvas.cumulY = evt.clientY;
	}, true);
	*/
});


