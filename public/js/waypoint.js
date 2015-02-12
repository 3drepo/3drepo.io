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

(function() {
	window.startRecording = false;
	window.second = 0;

	window.buffer1 = {};
	window.buffer2 = {};

	window.recording = window.buffer1;

	window.bufferLimit = 10;

	window.startPoint = [-26.06, -0.21, 15.28];
	//window.endPoint   = [-4.06, 1.43, 15.28];
	window.endPoint   = [-26.06, -0.21, -7.28];
	window.scaleY     = 0.05;
	window.trans	  = 0.3;
	window.blobRadius = 1.5;

	window.timestamp = 0;

	setInterval(recordViewpoint, 1000);
})();

function sendRecording()
{
	if(window.recording == window.buffer1)
	{
		window.recording   = window.buffer2;
		var data_str = JSON.stringify(window.buffer1);
		window.buffer1 = {};
	} else {
		window.recording   = window.buffer1;
		var data_str = JSON.stringify(window.buffer2);
		window.buffer2 = {};
	}

	$.ajax({
		type: "POST",
		url:  server_config.apiUrl("wayfinder/record"),
		data: {"data" : data_str, "timestamp" : window.timestamp},
		dataType: "json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			console.log("Success: " + data);
		}
	});
}

function recordViewpoint()
{
	if(window.startRecording)
	{
		var transMatrix = x3dom.canvases[0].doc._viewarea._scene.getViewpoint()._viewMatrix.inverse();

		var viewDir = transMatrix.e2().multiply(-1);
		var viewPos = transMatrix.e3();

		window.recording[window.second] = {};
		window.recording[window.second]["dir"] = [viewDir.x, viewDir.y, viewDir.z];
		window.recording[window.second]["pos"] = [viewPos.x, viewPos.y, viewPos.z];

		window.second += 1;
	}

		if(Object.keys(window.recording).length >= window.bufferLimit)
	{
		sendRecording();
	}
}

$(document).on("onViewpointChange", function(event, objEvent) {
	if (!window.location.search)
	{
		objEvent.position.y -= window.avatarHeight;

		var endDist = evDist(objEvent, endPoint);

		if ((endDist < window.blobRadius) && window.startRecording)
		{
			updateText("Finished", [1, 0, 0], 2000);
			window.startRecording = false;
			sendRecording();

			$('#nav')[0].type = "NONE";

			setTimeout( function() { location.reload(); }, 3000);
		}

		var startDist = evDist(objEvent, startPoint);

		if ((startDist < window.blobRadius) && !window.startRecording)
		{
			updateText("Started", [0,1,0], 2000);
			window.startRecording = true;
		}
	}
});

function evDist(evt, posA)
{
	return Math.sqrt(Math.pow(posA[0] - evt.position.x, 2) +
			Math.pow(posA[1] - evt.position.y, 2) +
			Math.pow(posA[2] - evt.position.z, 2));
}

function dist(posA, posB)
{
	return Math.sqrt(Math.pow(posA[0] - posB[0], 2) +
			Math.pow(posA[1] - posB[1], 2) +
			Math.pow(posA[2] - posB[2], 2));
}

var rgbColors = [
[1,0,0],
[0,1,0],
[0,0,1],
[1,0,1],
[1,1,0],
[0,1,1],
[1,1,1]
];

var threshold = 0.5;

function getSpeedRGB(origRGB, val)
{
	var mapFunc = Math.exp(-1 * (val / 10));

	return [origRGB[0] * mapFunc, origRGB[1] * mapFunc, origRGB[2] * mapFunc];
}

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

function plotSpheres(dataJson)
{
	var numRoutes = dataJson.length;
	var oldPos = window.startPoint.slice(0);
	var numWait = 0;

	for(var routeIdx = 0; routeIdx < numRoutes; routeIdx++)
	{
		var numberOfPoints = Object.keys(dataJson[routeIdx]).length - 4;
		var baseRGB = rgbColors[routeIdx % (rgbColors.length)];

		for(var i = 0; i < numberOfPoints; i++)
		{
			var newPos = dataJson[routeIdx][i].pos;
			var newDir = dataJson[routeIdx][i].dir;
			var lastDist = dist(newPos, oldPos);

			if (lastDist < threshold)
			{
				numWait += 1;
			} else {
				var newRGB = getSpeedRGB(baseRGB, numWait);
				numWait = 0;
				//addSphere(newPos, 0.2, 1.0, newRGB, 0.3);
				addViewDir(newPos, newDir, 0.2, newRGB);
			}

			oldPos = newPos.slice(0);
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

function addViewDir(position, dir, radius, rgb)
{
	//position[1] += 0.5 * radius;

	position[0] += dir[0] * radius;
	position[1] += dir[1] * radius;
	position[2] += dir[2] * radius;

	var posStr = position.join(" ");
	var rgbStr = rgb.join(" ");

	//var rotQt = rotQuat([0, 1, 0], dir);
	//var rotStr = rotQt.x + " " + rotQt.y + " " + rotQt.z + " " + rotQt.w;

	var rotStr = rotToRotation([0,1,0], dir);

	var transform = document.createElement('transform');
	transform.setAttribute('translation', posStr);
	transform.setAttribute('center', posStr);
	$('scene')[0].appendChild(transform);

	var rotation = document.createElement('transform');
	rotation.setAttribute('rotation', rotStr);
	transform.appendChild(rotation);

	var shape = document.createElement('shape');
	shape.setAttribute('isPickable', false);
	rotation.appendChild(shape);

	var appearance = document.createElement('appearance');
	shape.appendChild(appearance);

	var material = document.createElement('material');
	material.setAttribute('diffuseColor', rgbStr);
	material.setAttribute('transparency', trans);
	appearance.appendChild(material);

	var cone = document.createElement('cone');
	cone.setAttribute('bottomRadius', radius * 0.8);
	cone.setAttribute('height', radius * 5.0);

	shape.appendChild(cone);
}

function addSphere(position, radius, scaleY, rgb, trans)
{
	//position[1] += -0.5 * radius * scaleY;

	var posStr = position.join(" ");
	var rgbStr = rgb.join(" ");
	var scaleStr = "1 " + scaleY + " 1";

	var transform = document.createElement('transform');
	transform.setAttribute('scale', scaleStr);
	transform.setAttribute('translation', posStr);
	$('scene')[0].appendChild(transform);

	var shape = document.createElement('shape');
	shape.setAttribute('isPickable', false);
	transform.appendChild(shape);

	var appearance = document.createElement('appearance');
	shape.appendChild(appearance);

	var material = document.createElement('material');
	material.setAttribute('diffuseColor', rgbStr);
	material.setAttribute('transparency', trans);
	appearance.appendChild(material);

	var sphere = document.createElement('sphere');
	sphere.setAttribute('radius', radius);
	sphere.setAttribute('solid', false);
	shape.appendChild(sphere);

	console.log("Adding sphere @ " + posStr);
}

function updateText(str, rgb, aliveFor)
{
	$('#textInfo').find('text')[0].setAttribute('string', str);
	$('#textInfo').find('material')[0].setAttribute('diffuseColor', rgb.join(' '));

	var transMatrix = x3dom.canvases[0].doc._viewarea._scene.getViewpoint()._viewMatrix.inverse();
	var viewDir = transMatrix.e2();
	var viewPos = transMatrix.e3();
	var rgbStr = rgb.join(' ');

	viewPos = viewPos.subtract(viewDir.multiply(5));

	var posStr = viewPos.x + " " + viewPos.y + " " + viewPos.z;

	$('#textInfo')[0].setAttribute('translation', posStr);
	$('#textInfo')[0].setAttribute('render', 'true');

	if (aliveFor)
	{
		setTimeout( function () { $('#textInfo')[0].setAttribute('render', 'false'); } , aliveFor);
	}

}

function addText(str, rgb, aliveFor)
{
	var transMatrix = x3dom.canvases[0].doc._viewarea._scene.getViewpoint()._viewMatrix.inverse();
	var viewDir = transMatrix.e2();
	var viewPos = transMatrix.e3();
	var rgbStr = rgb.join(' ');

	viewPos = viewPos.subtract(viewDir.multiply(5));

	var posStr = viewPos.x + " " + viewPos.y + " " + viewPos.z;

	console.log("POS: " + posStr);

	$('#textInfo').remove();

	var t = document.createElement('transform');
	t.setAttribute('id', 'textInfo');
	t.setAttribute('translation', posStr);

	var s = document.createElement('Shape');
	s.setAttribute('isPickable', 'false');

	t.appendChild(s);

	var a = document.createElement('Appearance');
	var m = document.createElement('Material');

	m.setAttribute('diffuseColor', rgbStr);

	a.appendChild(m);
	s.appendChild(a);

	var txt = document.createElement('text');
	txt.setAttribute('string', str);
	txt.setAttribute('solid', 'true');

	s.appendChild(txt);

	var fs = document.createElement('fontstyle');
	fs.setAttribute('family', 'Times');
	fs.setAttribute('size', '0.8');

	t.appendChild(fs);

	$('scene')[0].appendChild(t);

	if (aliveFor)
	{
		setTimeout( function () { $('#textInfo')[0].setAttribute('render', 'false'); } , aliveFor);
	}
}

function addArrow(position, rgb, trans)
{
	var newnode = "<inline namespacename=\"arrow\" url=\"\\public\\arrow.x3d\"></inline>";
	$('scene').append(newnode);
	x3dom.reload();

	setTimeout(function() {
		var pos = position.slice(0);
		var minBox = $("#arrow__ArrowRot")[0]._x3domNode.getVolume().min;

		pos[0] -= minBox.z;
		pos[1] -= minBox.y;
		//pos[2] -= minBox.x;

		var peakPos = pos.slice(0);
		peakPos[1] += 3;

		var posStr = pos.join(" ");
		var peakStr = peakPos.join(" ");
		var rgbStr = rgb.join(" ");

		var movement = " <timeSensor DEF=\"time\" cycleInterval=\"2\" loop=\"true\"></timeSensor>\
        <PositionInterpolator DEF=\"move\" key=\"0 0.5 1\" keyValue=\"" + posStr + " " + peakStr + " " + posStr + "\"></PositionInterpolator>\
        <Route fromNode=\"time\" fromField=\"fraction_changed\" toNode=\"move\" toField=\"set_fraction\"></Route>\
        <Route fromNode=\"move\" fromField=\"value_changed\" toNode=\"ArrowTrans\" toField=\"translation\"></Route>\
		";
		$('#arrow__ArrowScene').append(movement);

		var color = "<appearance><material diffuseColor='" + rgbStr + "' transparency='" + trans + "'></material></appearance>";
		$('#arrow__Arrow').append(color);

	}, 1000);
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
	window.timestamp = new Date().getTime() / 1000;

	$('#nav')[0].avatarSize = window.collDistance + "," + window.avatarHeight + "," + window.stepHeight;
	$('#nav')[0].speed = window.speed;

	window.visMode = visMode;

	var avrStart = startPoint.slice(0);
	avrStart[1] += window.avatarHeight;
	avrStart[2] += 9.0;

	$("#sceneVP")[0].position = avrStart.join(" ");

	addSphere(window.startPoint, window.blobRadius, window.scaleY, [0, 1, 0], window.trans);
	addSphere(window.endPoint, window.blobRadius, window.scaleY, [1, 0, 0], window.trans);
	addArrow(window.endPoint, [1, 0, 0], 0.3);

	$('#sceneVP')[0].addEventListener('viewpointChanged', onViewpointChange);

	var thisDoc = x3dom.canvases[0].doc;
	var thisViewArea = thisDoc._viewarea;

	thisViewArea._mouseSensitivity = 360.0;

	if(!visMode)
		updateText('Step on pad to begin', [0,1,0], 2000);
};


