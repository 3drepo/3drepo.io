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

module.exports.addGoogleTiles = function(xmlDoc, width, yrot, worldTileSize, centLat, centLong, zoom, maptype, twosided, trans)
{
	var topGroup = xmlDoc.createElement("group");
	//topGroup.setAttribute("invisible", "true");

	var topLevelTrans = xmlDoc.createElement("Transform");
	topLevelTrans.setAttribute("id", "mapPosition");
	topLevelTrans.setAttribute("translation", trans.join(","));
	topLevelTrans.setAttribute("scale", "1,1,1");
	topGroup.appendChild(topLevelTrans);

	var yRotTrans = xmlDoc.createElement("Transform");
	yRotTrans.setAttribute("id", "mapRotation");
	yRotTrans.setAttribute('rotation', '0,1,0,' + yrot);
	topLevelTrans.appendChild(yRotTrans);

	var shapeTrans = xmlDoc.createElement("Transform");
	shapeTrans.setAttribute('rotation', '1,0,0,4.7124');
	yRotTrans.appendChild(shapeTrans);

	var halfWidth = (width + 1) / 2;

	var googleTileSize = 640;
	var nTiles = 1 << zoom;

	var s = Math.min(Math.max(Math.sin(centLat * (Math.PI / 180)), -0.9999), 0.9999);
	var centX = 128 + centLong * (256 / 360);
	var centY = 128 + 0.5 * Math.log((1 + s) / (1 - s)) * (-256 / (2 * Math.PI));

	var tileGroup = xmlDoc.createElement("group");
	tileGroup.setAttribute('id', 'tileGroup');
	tileGroup.setAttribute('invisible', 'true');
	shapeTrans.appendChild(tileGroup);

	for(var x = -halfWidth; x < halfWidth; x++)
	{
		for(var y = -halfWidth; y < halfWidth; y++)
		{
			var shape = xmlDoc.createElement("Shape");
			tileGroup.appendChild(shape);

			var xPos = (x + 0.5) * googleTileSize;
			var yPos = -(y + 0.5) * googleTileSize;

			var tileCentX = centX * nTiles + xPos;
			var tileCentY = centY * nTiles + yPos;

			var tileLat = (2 * Math.atan(Math.exp(((tileCentY / nTiles) - 128) / -(256 / (2 * Math.PI)))) - Math.PI / 2) / (Math.PI / 180);
			var tileLong = ((tileCentX / nTiles) - 128) / (256 / 360);

			var googleMapsURL = "https://maps.googleapis.com/maps/api/staticmap?center=" + tileLat + "," + tileLong + "&size=" + googleTileSize + "x" + googleTileSize + "&zoom=" + zoom + "&key=" + config.googleApiKey + "&maptype=" + maptype;
			var app = xmlDoc.createElement('Appearance');

			if (twosided)
			{
				/*
				var mat = xmlDoc.createElement('Material');
				mat.setAttribute('transparency', 0.9);
				app.appendChild(mat);
				*/

				var shader = xmlDoc.createElement('ComposedShader');
				shader.setAttribute("USE", "TwoSidedShader");
				var composedshader = xmlDoc.createElement("ComposedShader");
				composedshader.setAttribute("DEF", "TwoSidedShader");

				var alphaValue = xmlDoc.createElement("field");
				alphaValue.setAttribute("name", "alpha");
				alphaValue.setAttribute("type", "SFFloat");
				alphaValue.setAttribute("value", twosided);

				var textureID = xmlDoc.createElement("field");
				textureID.setAttribute("name", "map");
				textureID.setAttribute("type", "SFInt32");
				textureID.setAttribute("values", 0);

				composedshader.appendChild(alphaValue);
				composedshader.appendChild(textureID);

				var vertshader = xmlDoc.createElement("ShaderPart");
				vertshader.setAttribute("type", "VERTEX");
				vertshader.textContent = "\n\
					attribute vec3 position;\n\
					attribute vec2 texcoord;\n\
					varying vec2 fragTexCoord;\n\
					uniform mat4 modelViewProjectionMatrix;\n\
					\n\
					void main()\n\
					{\n\
						fragTexCoord = vec2(texcoord.x, 1.0 - texcoord.y);\n\
						gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);\n\
					}\n\
				";

				var fragshader = xmlDoc.createElement("ShaderPart");
				fragshader.setAttribute("type", "FRAGMENT");
				fragshader.textContent = " \
					#ifdef GL_ES\n\
						precision highp float;\n\
					#endif\n\
					\n\
					varying vec2 fragTexCoord;\n\
					\n\
					uniform float alpha;\n\
					uniform sampler2D map;\n\
					\n\
					void main()\n\
					{\n\
						vec4 mapCol = texture2D(map, fragTexCoord);\n\
						gl_FragColor.rgba = vec4(mapCol.rgb, alpha);\n\
					}\n\
					";

				composedshader.appendChild(vertshader);
				composedshader.appendChild(fragshader);

				app.appendChild(composedshader);
			}

			var it = xmlDoc.createElement('ImageTexture');
			it.setAttribute("url", googleMapsURL);

			app.appendChild(it);
			shape.appendChild(app);

			var plane = xmlDoc.createElement('Plane');
			plane.setAttribute('center', x * worldTileSize + "," + y * worldTileSize);
			plane.setAttribute('size', worldTileSize + "," + worldTileSize);
			plane.setAttribute('solid', 'false');
			plane.setAttribute('lit', false);

			shape.appendChild(plane);

			yRotTrans.appendChild(shapeTrans);
		}
	}

	return topGroup;
};

