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

$(document).on("onViewpointChange", function(event, objEvent) {
	if (Recorder.isRecording)
	{
		objEvent.position.y -= viewer.avatarHeight;

		var endDist = viewer.evDist(objEvent, endPoint);

		if (endDist < window.blobRadius)
		{
			Text.updateText("Finished", [1, 0, 0], 2000);
			Recorder.stopRecording();
			viewer.setNavMode("NONE");
			setTimeout( function() { location.reload(); }, 3000);
		}
	}

	if (Recorder.isNotRecording)
	{
		var startDist = viewer.evDist(objEvent, startPoint);

		if ((startDist < window.blobRadius) && !window.startRecording)
		{
			updateText("Started", [0,1,0], 2000);
			window.startRecording = true;
		}
	}
});

function addViewpoint(posDir)
{

	var lookDir = new x3dom.fields.SFVec3f(posDir.dir[0], posDir.dir[1], posDir.dir[2]);
	var posVec =  new x3dom.fields.SFVec3f(posDir.pos[0], posDir.pos[1], posDir.pos[2]);
	var tmpUp =   new x3dom.fields.SFVec3f(0, 1, 0);

	var tmpLeft = tmpUp.cross(lookDir);
	tmpUp = lookDir.cross(tmpLeft);

	var tmpMat = x3dom.fields.SFMatrix4f.lookAt(posVec, lookDir, tmpUp);
	tmpMat = tmpMat.inverse();

	var t = document.createElement('viewpoint');

	var posStr = posDir.pos.join(' ');
	var dirStr = posDir.dir.join(' ') + " 1";

	t.setAttribute('position', posStr);
	t.setAttribute('orientation', '0,0,0,1');

	//t.setAttribute('orientation', dirStr);

	$('X3D')[0].appendChild(t);
	$('#sceneVP').parent()[0].appendChild(t);
}

function runFlyThru(dataJson)
{
	var numRoutes = dataJson.length;
	var numWait = 0;

	$('#nav')[0].setAttribute('type', 'none');

	for(var routeIdx = 0; routeIdx < numRoutes; routeIdx++)
	{
		var numberOfPoints = Object.keys(dataJson[routeIdx]).length - 4;

		for(var i = 0; i < numberOfPoints; i++)
		{
			var newPos = dataJson[routeIdx][i].pos;

			addViewpoint(dataJson[routeIdx][i]);
			var x3druntime = $('#sceneVP').parent().parent()[0].runtime;
			setTimeout(x3druntime.nextView(), numWait * 1000);
			numWait += 1;
		}
	}
}

function rotQuat(from, to)
{
	var vecFrom = new x3dom.fields.SFVec3f(from[0], from[1], from[2]);
	var vecTo   = new x3dom.fields.SFVec3f(to[0], to[1], to[2]);

	var dot = vecFrom.dot(vecTo);

	var crossVec = vecFrom.cross(vecTo);
	var qt = new x3dom.fields.Quaternion(crossVec.x, crossVec.y, crossVec.z, 1);

	qt.w = vecFrom.length() * vecTo.length() + dot;

	return qt.normalize(qt);
}

function rotToRotation(from, to)
{
	var vecFrom = new x3dom.fields.SFVec3f(from[0], from[1], from[2]);
	var vecTo   = new x3dom.fields.SFVec3f(to[0], to[1], to[2]);

	var dot = vecFrom.dot(vecTo);

	var crossVec = vecFrom.cross(vecTo);

	return crossVec.x + " " + crossVec.y + " " + crossVec.z + " " + Math.acos(dot);
}

$(document).on("runtimeReady", function(event) {
	addText('Text holder', [0,1,0], 1);

	if (window.visMode)
		$('#nav')[0].type = 'FLY';
	else
		$('#nav')[0].type = 'WALK';
});

function walkInitialize(visMode)
{

	addSphere(window.startPoint, window.blobRadius, window.scaleY, [0, 1, 0], window.trans);
	addSphere(window.endPoint, window.blobRadius, window.scaleY, [1, 0, 0], window.trans);
	addArrow(window.endPoint, [1, 0, 0], 0.3);

	var thisDoc = x3dom.canvases[0].doc;
	var thisViewArea = thisDoc._viewarea;

	thisViewArea._mouseSensitivity = 360.0;

	if(!visMode)
		updateText('Step on pad to begin', [0,1,0], 2000);
};


