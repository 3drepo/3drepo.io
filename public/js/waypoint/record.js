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

var Recorder = function(startPoint, endPoint, distance) {
	this.buffer1 = {};
	this.buffer2 = {};
	this.bufferlimit = 10;

	this.isRecording = false;
	this.distance 	 = distance;
	this.startPoint  = startPoint;
	this.endPoint    = endPoint;

	this.recording = this.buffer1;

	this.timestamp = 0;

	this.sendRecording = function()
	{
		if(this.recording == this.buffer1)
		{
			this.recording	= this.buffer2;
			var data_str	= JSON.stringify(this.buffer1);
			this.buffer1	= {};
		} else {
			this.recording	= this.buffer1;
			var data_str	= JSON.stringify(this.buffer2);
			this.buffer2	= {};
		}

		$.ajax({
			type: "POST",
			url:  server_config.apiUrl("wayfinder/record"),
			data: {"data" : data_str, "timestamp" : this.timestamp},
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
		if(this.isRecording)
		{
			var transMatrix = x3dom.canvases[0].doc._viewarea._scene.getViewpoint()._viewMatrix.inverse();
			var viewDir = transMatrix.e2().multiply(-1);
			var viewPos = transMatrix.e3();

			this.recording[this.second] = {};
			this.recording[this.second]["dir"] = [viewDir.x, viewDir.y, viewDir.z];
			this.recording[this.second]["pos"] = [viewPos.x, viewPos.y, viewPos.z];

			this.second += 1;
		}

		if(Object.keys(this.recording).length >= this.bufferLimit)
		{
			this.sendRecording();
		}
	}

	this.timeFunction = null;

	this.startRecording = function()
	{
		this.timestamp = new Date().getTime() / 1000;
		this.timeFunction	= setInterval(this.recordViewpoint, 1000);
		this.isRecording	= true;
		this.timestamp		= 0;
	}

	this.stopRecoring = function()
	{
		if(this.isRecording)
		{
			if(this.timeFunction) {
				clearInterval(this.timeFunction);
				this.timeFunction = null;
			}

			this.sendRecording();
		}
	}
}

$(document).on("onViewpointChange", function(event, objEvent) {
	if (recorder)
	{
		if (recorder.isRecording)
		{
			//objEvent.position.y += viewer.avatarHeight;

			var endDist = viewer.evDist(objEvent, recorder.endPoint);

			if (endDist < recorder.distance)
			{
				text.updateText("Finished", [1, 0, 0], 2000);
				recorder.stopRecording();
				viewer.setNavMode("NONE");
				setTimeout( function() {
					location.reload();
				}, 3000);
			}
		}

		if (!recorder.isRecording)
		{
			//objEvent.position.y += viewer.avatarHeight;


			var startDist = viewer.evDist(objEvent, recorder.startPoint);

			if (startDist < recorder.distance)
			{
				text.updateText("Started", [0,1,0], 2000);
				recorder.startRecording();
			}
		}
	}
});


