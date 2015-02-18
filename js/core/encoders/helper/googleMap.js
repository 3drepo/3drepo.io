/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Inspired by http://stackoverflow.com/questions/19266002/get-latitude-and-longitude-from-static-google-map
var config		 = require('../../config.js');

module.exports.addGoogleTiles = function(xmlDoc, width, yrot, worldTileSize, centLat, centLong, zoom, trans)
{
	var yRotTrans = xmlDoc.createElement("Transform");
	yRotTrans.setAttribute('rotation', '0,1,0,' + yrot);

	var halfWidth = (width + 1) / 2;

	var googleTileSize = 640;
	var nTiles = 1 << zoom;

	var s = Math.min(Math.max(Math.sin(centLat * (Math.PI / 180)), -0.9999), 0.9999);
	var centX = 128 + centLong * (256 / 360);
	var centY = 128 + 0.5 * Math.log((1 + s) / (1 - s)) * (-256 / (2 * Math.PI));

	for(var x = -halfWidth; x < halfWidth; x++)
	{
		for(var y = -halfWidth; y < halfWidth; y++)
		{
			var shapeTrans = xmlDoc.createElement("Transform");
			shapeTrans.setAttribute('rotation', '1,0,0,4.7124');

			var topLevelTrans = xmlDoc.createElement("Transform");
			topLevelTrans.setAttribute("translation", trans.join(","));
			shapeTrans.appendChild(topLevelTrans);

			var shape = xmlDoc.createElement("Shape");
			topLevelTrans.appendChild(shape);

			var xPos = (x + 0.5) * googleTileSize;
			var yPos = -(y + 0.5) * googleTileSize;

			var tileCentX = centX * nTiles + xPos;
			var tileCentY = centY * nTiles + yPos;

			var tileLat = (2 * Math.atan(Math.exp(((tileCentY / nTiles) - 128) / -(256 / (2 * Math.PI)))) - Math.PI / 2) / (Math.PI / 180);
			var tileLong = ((tileCentX / nTiles) - 128) / (256 / 360);

			var googleMapsURL = "https://maps.googleapis.com/maps/api/staticmap?center=" + tileLat + "," + tileLong + "&size=" + googleTileSize + "x" + googleTileSize + "&maptype=satellite&zoom=" + zoom + "&key=" + config.googleApiKey;

			var app = xmlDoc.createElement('Appearance');
			var it = xmlDoc.createElement('ImageTexture');
			it.setAttribute("url", googleMapsURL);
			app.appendChild(it);
			shape.appendChild(app);

			var plane = xmlDoc.createElement('Plane');
			plane.setAttribute('center', x * worldTileSize + "," + y * worldTileSize);
			plane.setAttribute('size', worldTileSize + "," + worldTileSize);
			plane.setAttribute('lit', false);

			shape.appendChild(plane);

			yRotTrans.appendChild(shapeTrans);
		}
	}

	return yRotTrans;
};

