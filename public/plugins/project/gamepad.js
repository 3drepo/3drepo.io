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

var Gamepad = function(viewer) {

	var self = this;

	this.enabled = false;
	this.gamepad = null;
	this.timestamp = null;

	this.browser = null;
	this.platform = null;

	this.viewer = viewer;

	this.connected = function(event) {
		self.gamepad = event.gamepad;	// Only support one gamepad
		self.startPolling();
	};

	this.disconnected = function(event) {
		self.gamepad = null;
		self.stopPolling();
	};

	this.startPolling = function() {
		if(!self.enabled)
		{
			self.enabled = true;
			self.tick();
		}
	};

	this.oldButton = false;

	this.checkStatus = function() {
		if(!self.gamepad)
			return;

		if(self.gamepad.timestamp &&
			(self.gamepad.timestamp == self.timestamp))
				return;

		self.timestamp = self.gamepad.timestamp;
	};

	this.connected = function(event) {
		self.gamepad = event.gamepad;	// Only support one gamepad
		self.startPolling();
	};

	this.disconnected = function(event) {
		self.gamepad = null;
		self.stopPolling();
	};

	this.startPolling = function() {
		if(!self.enabled)
		{
			self.enabled = true;
			self.tick();
		}
	};

	this.oldButton = false;

	this.checkStatus = function() {
		if(!self.gamepad)
			return;

		if(self.gamepad.timestamp &&
			(self.gamepad.timestamp == self.timestamp))
				return;

		self.timestamp = self.gamepad.timestamp;

		var button_idx = 0;

		/* Chrome Linux */
		if ((self.platform === 'Linux') && (self.browser === 'Chrome'))
		{
			$.event.trigger("gamepadMove",
				{
					xaxis: self.gamepad.axes[0],
					yaxis: self.gamepad.axes[1],
					button: self.gamepad.buttons[button_idx]
				}
			);
		}

		/* Chrome Canary Windows */
		else if ((self.platform === 'win32') && (self.browser === 'Chrome'))
		{
			button_idx = 3;
			$.event.trigger("gamepadMove",
				{
					xaxis: self.gamepad.buttons[15].value - self.gamepad.buttons[14].value,
					yaxis: self.gamepad.buttons[13].value - self.gamepad.buttons[12].value,
					button: self.gamepad.buttons[button_idx]
				}
			);
		}

		/* Firefox Windows */
		else if ((self.platform === 'win32') && (self.browser === 'Firefox'))
		{
			$.event.trigger("gamepadMove",
				{
					xaxis: self.gamepad.axes[4],
					yaxis: self.gamepad.axes[5],
					button: self.gamepad.buttons[button_idx]
				}
			);
		}

		if (self.gamepad.buttons[button_idx].pressed)
			if (!self.oldButton) {
				viewer.reset();
				viewer.setNavMode('NONE');
				viewer.disableClicking();
			}

		self.oldButton = self.gamepad.buttons[button_idx].pressed;
	};

	this.tick = function() {
		if(navigator.getGamepads()[0])
			self.gamepad = navigator.getGamepads()[0];

		if(!self.gamepad)
			self.viewer.setNavMode('TURNTABLE'); // Manually override navigation
		else
			self.checkStatus();

		self.nextTick();
	};

	this.nextTick = function() {
		// Only schedule the next frame if we haven’t decided to stop via
		// stopPolling() before.
		if (this.enabled) {
		  if (window.requestAnimationFrame) {
			window.requestAnimationFrame(self.tick);
		  } else if (window.mozRequestAnimationFrame) {
			window.mozRequestAnimationFrame(self.tick);
		  } else if (window.webkitRequestAnimationFrame) {
			window.webkitRequestAnimationFrame(self.tick);
		  }
		  // Note lack of setTimeout since all the browsers that support
		  // Gamepad API are already supporting requestAnimationFrame().
		}
	};

	this.stopPolling = function() {
		self.enabled = false;
	};

	this.init = function() {
		var gamepadSupportAvailable = navigator.getGamepads ||
			!!navigator.webkitGetGamepads ||
			!!navigator.webkitGamepads;

		if (gamepadSupportAvailable) {
			if (window.navigator.platform.indexOf('Linux') != -1)
				self.platform = 'Linux';
			else if (window.navigator.platform.indexOf('win32') != -1)
				self.platform = 'win32';
			else
				console.error('Platform ' + window.navigator.platform + ' is not supported.');

			if (window.navigator.appVersion.indexOf('Chrome') != -1)
				self.browser = 'Chrome';
			else if (window.navigator.appVersion.indexOf('Firefox') != -1)
				self.browser = 'Firefox';
			else
				console.error('Browser version ' + window.navigator.appVersion + ' is not supported.');

			if (self.browser && self.platform)
			{
				if ('ongamepadconnected' in window) {
					window.addEventListener('gamepadconnected', self.connected, false);
					window.addEventListener('gamepaddisconnected', self.disconnected, false);
				} else {
					self.startPolling();
				}
			}
		}
	};
};
