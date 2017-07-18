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

var ViewerUtil;
// var ViewerUtilListeners = {};
// var ViewerUtilMyListeners = {};

(function() {
	"use strict";

	ViewerUtil = function() {};

	// var eventElement = document;

	// ViewerUtil.prototype.cloneObject = function(obj) {
    // 	if (!obj || typeof obj !== "object") {
    //     	return obj;
    // 	}

	// 	var retObject = new obj.constructor();

	// 	for (var key in obj) {
	// 		if (obj.hasOwnProperty(key)) {
	// 			retObject[key] = this.cloneObject(obj[key]);
	// 		}
	// 	}

    // 	return retObject;
	// };

	// // Definition of global functions
	// ViewerUtil.prototype.triggerEvent = function(name, event) {
	// 	var e = new CustomEvent(name, { detail: event });
	// 	eventElement.dispatchEvent(e);
	// };


	// ViewerUtil.prototype.onEvent = function(name, callback) {
	// 	if (!ViewerUtilListeners.hasOwnProperty(name)) {
	// 		ViewerUtilListeners[name] = [];
	// 		ViewerUtilMyListeners[name] = [];
	// 	}

	// 	ViewerUtilListeners[name].push(callback);

	// 	var myListener= function(event) {
	// 		callback(event.detail);
	// 	};

	// 	ViewerUtilMyListeners[name].push(myListener);

	// 	eventElement.addEventListener(name, myListener);
	// };

	// ViewerUtil.prototype.offEvent = function(name, callback) {
	// 	var index = ViewerUtilListeners[name].indexOf(callback);
	// 	if (index === -1){
	// 		return;
	// 	}

	// 	eventElement.removeEventListener(name, ViewerUtilMyListeners[name][index]);

	// 	ViewerUtilListeners[name].splice(index, 1);
	// 	ViewerUtilMyListeners[name].splice(index, 1);

	// };

	// ViewerUtil.prototype.offEventAll = function() {
	// 	for(var eventType in ViewerUtilMyListeners) {
	// 		for(var i = 0; i < ViewerUtilMyListeners[eventType].length; i++) {
	// 			eventElement.removeEventListener(eventType, ViewerUtilMyListeners[eventType][i]);
	// 		}
	// 	}

	// 	ViewerUtilListeners   = {};
	// 	ViewerUtilMyListeners = {};
	// };

	// ViewerUtil.prototype.eventFactory = function(name) {
	// 	var self = this;
	// 	return function(event) {
	// 		self.triggerEvent(name, event); 
	// 	};
	// };

	// ViewerUtil.prototype.evDist = function(evt, posA) {
	// 	return Math.sqrt(Math.pow(posA[0] - evt.position.x, 2) +
	// 		Math.pow(posA[1] - evt.position.y, 2) +
	// 		Math.pow(posA[2] - evt.position.z, 2));
	// };

	// ViewerUtil.prototype.dist = function(posA, posB) {
	// 	return Math.sqrt(Math.pow(posA[0] - posB[0], 2) +
	// 		Math.pow(posA[1] - posB[1], 2) +
	// 		Math.pow(posA[2] - posB[2], 2));
	// };

	// // TODO: Shift these to some sort of Matrix/Vec library
	// ViewerUtil.prototype.scale = function(v, s) {
	// 	return [v[0] * s, v[1] * s, v[2] * s];
	// };

	// ViewerUtil.prototype.normalize = function(v) {
	// 	var sz = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// 	return this.scale(v, 1 / sz);
	// };

	// ViewerUtil.prototype.dotProduct = function(a, b) {
	// 	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	// };

	// ViewerUtil.prototype.crossProduct = function(a, b) {
	// 	var x = a[1] * b[2] - a[2] * b[1];
	// 	var y = a[2] * b[0] - a[0] * b[2];
	// 	var z = a[0] * b[1] - a[1] * b[0];

	// 	return [x, y, z];
	// };

	// ViewerUtil.prototype.vecAdd = function(a, b) {
	// 	return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	// };

	// ViewerUtil.prototype.vecSub = function(a, b) {
	// 	return this.vecAdd(a, this.scale(b, -1));
	// };

	ViewerUtil = new ViewerUtil();
}());
