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

var Gamepad = function() {
	var self = this;

	this.enabled = false;
	this.gamepad = null;
	this.timestamp = null;

	this.connected = function(event) {
		this.gamepad = event.gamepad;	// Only support one gamepad
		this.startPolling();
	};

	this.disconnected = function(event) {
		this.gamepad = null;
		this.stopPolling();
	};

	this.startPolling = function() {
		if(!this.enabled)
		{
			this.enabled = true;
			this.tick();
		}
	};

	this.checkStatus = function() {
		if(this.gamepad.timestamp &&
			(this.gamepad.timestamp == this.timestamp))
				return;

		this.timestamp = this.gamepad.timestamp;

		$.event.trigger("gamepadMove",
			{
				xaxis: this.gamepad.axes[0],
				yaxis: this.gamepad.axes[1],
				button: this.gamepad.buttons[0]
			}
		);
		/*
			console.log(this.gamepad.axes[0]);
			console.log(this.gamepad.axes[1]);
			console.log(this.gamepad.buttons[0]);
		*/
	};

	this.tick = function() {
		if(navigator.getGamepads()[0])
			self.gamepad = navigator.getGamepads()[0];

		if(this.gamepad)
			self.checkStatus();

		self.nextTick();
	};

	this.nextTick = function() {
		// Only schedule the next frame if we haven’t decided to stop via
		// stopPolling() before.
		if (this.enabled) {
		  if (window.requestAnimationFrame) {
			window.requestAnimationFrame(this.tick);
		  } else if (window.mozRequestAnimationFrame) {
			window.mozRequestAnimationFrame(this.tick);
		  } else if (window.webkitRequestAnimationFrame) {
			window.webkitRequestAnimationFrame(this.tick);
		  }
		  // Note lack of setTimeout since all the browsers that support
		  // Gamepad API are already supporting requestAnimationFrame().
		}
	};

	this.stopPolling = function() {
		this.enabled = false;
	};

	this.init = function() {
		var gamepadSupportAvailable = navigator.getGamepads ||
			!!navigator.webkitGetGamepads ||
			!!navigator.webkitGamepads;

		if (gamepadSupportAvailable) {
			if ('ongamepadconnected' in window) {
				window.addEventListener('gamepadconnected', this.connected, false);
				window.addEventListener('gamepaddisconnected', this.disconnected, false);
			} else {
				this.startPolling();
			}
		}

		viewer.setNavMode('NONE'); // Manually override navigation
	};
};
