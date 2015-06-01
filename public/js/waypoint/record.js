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

var Recorder = function(viewer, account, project) {
	var self = this;

	this.buffer1 = [];
	this.buffer2 = [];
	this.bufferlimit = 10;

	this.isRecording = false;

	this.viewer = viewer;

	this.recording = this.buffer1;

	this.timestamp = 0;
	this.second    = 0;

	this.account   = account;
	this.project   = project;

	this.sendRecording = function()
	{
		var data_str	= JSON.stringify({"waypoints" : self.recording.slice(0)});

		if(self.recording == self.buffer1)
		{
			self.recording	= self.buffer2;
			self.buffer1	= [];
		} else {
			self.recording	= self.buffer1;
			self.buffer2	= [];
		}
		$.ajax({
			type: "POST",
			url:  server_config.apiUrl(self.account + "/" + self.project + "/wayfinder/record"),
			data: {"data" : data_str, "timestamp" : self.timestamp},
			dataType: "json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				console.log("Success: " + data);
			}
		});
	}

	this.recordViewpoint = function()
	{
		if(self.isRecording)
		{
			var viewDirPos = viewer.getViewDirPos();
			var viewDir = viewDirPos["viewDir"];
			var viewPos = viewDirPos["viewPos"];

			var tmpObj = {};
			tmpObj["idx"]	= self.second;
			tmpObj["dir"]	= [viewDir.x, viewDir.y, viewDir.z];
			tmpObj["pos"]	= [viewPos.x, viewPos.y, viewPos.z];
			tmpObj["time"]	= new Date().getTime() / 1000;

			self.recording.push(tmpObj);
			self.second += 1;

			console.log('BLIP' + self.second);
		}

		if(self.recording.length > self.bufferlimit)
		{
			self.sendRecording();
		}
	}

	this.timeFunction = null;

	this.startRecording = function()
	{
		self.timestamp		= new Date().getTime() / 1000;
		self.timeFunction	= setInterval(self.recordViewpoint, 1000);
		self.isRecording	= true;
		self.second			= 0;
	}

	this.stopRecording = function(dontSend)
	{
		dontSend = typeof dontSend !== 'undefined' ? dontSend : false;

		if(self.isRecording)
		{
			if(self.timeFunction) {
				window.clearInterval(self.timeFunction);
				self.timeFunction = null;
			}

			if (!dontSend)
				self.sendRecording();

			self.isRecording = false;
		}
	}
}

