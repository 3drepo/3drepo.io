/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var PinShader = null;

(function() {
	"use strict";
	
	PinShader = function(element) {
		var pinheadshader = document.createElement("ComposedShader");
		pinheadshader.setAttribute("ID", "pinHeadShader");

		var pinvert = document.createElement("ShaderPart");
		pinvert.setAttribute("type", "VERTEX");
		pinvert.setAttribute("DEF", "multiVert");
		pinvert.textContent = "attribute vec3 position;" +
			"\nattribute vec3 normal;" +
			"\n" +
			"\nuniform mat4 modelViewMatrix;" +
			"\nuniform mat4 modelViewMatrixInverse;" +
			"\nuniform mat4 modelViewProjectionMatrix;" +
			"\nuniform float radius;" +
			"\n" +
			"\nvarying float fragColourSelect;" +
			"\nvarying vec3 fragNormal;" +
			"\nvarying vec3 fragEyeVector;" +
			"\nvarying vec4 fragPosition;" +
			"\nvarying vec3 pinPosition;" +
			"\nvoid main()" +
			"\n{" +
			"\n\tfragEyeVector = vec3(0.2, 0.2, 0.2);" +
			"\n\tfragNormal = normal;" +
			"\n\tfragColourSelect = 1.0 - ((position.y / radius) + 1.0) / 2.0;" +
			"\n\t" +
			"\n\tpinPosition = position;" +
			"\n\tfragPosition = (modelViewMatrix * vec4(position, 1.0));" +
			"\n\tgl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
			"\n}";
		pinheadshader.appendChild(pinvert);

		var pinfrag = document.createElement("ShaderPart");
		pinfrag.setAttribute("type", "FRAGMENT");
		pinfrag.setAttribute("DEF", "multiFrag");
		var fragSource = "#ifdef GL_FRAGMENT_PRECISION_HIGH" +
			"\n\tprecision highp float;" +
			"\n#else" +
			"\n\tprecision mediump float;" +
			"\n#endif" +
			"\n";

		fragSource += "\nuniform float numColours;" +
			"\nuniform float ambientIntensity;" +
			"\nuniform float transparency;" +
			"\nvarying float fragColourSelect;" +
			"\nvarying vec3 fragNormal;" +
			"\nvarying vec3 fragEyeVector;" +
			"\nvarying vec4 fragPosition;" +
			"\nvarying vec3 pinPosition;" +
			"\nuniform vec3 multicolours[20];" +
			"\nuniform mat4 viewMatrixInverse;" +
			"\nuniform bool highlightPin;" +
			"\nuniform vec3 highlightColor;" +
			"\nuniform bool useClipPlane;" +
			"\n";

		fragSource += x3dom.shader.light(1);
		fragSource += x3dom.shader.clipPlanes(1);

		fragSource += "\nvoid main()" +
			"\n{" +
			"\n\tint colourSelected = int(floor(fragColourSelect * numColours));" +
			"\n\tvec3 eye = -pinPosition.xyz;" +
			"\n\tvec3 normal = normalize(fragNormal);" +
			"\n\tvec3 ads = lighting(light0_Type, light0_Location, light0_Direction, light0_Color, light0_Attenuation, light0_Radius, light0_Intensity, light0_AmbientIntensity, light0_BeamWidth, light0_CutOffAngle, normalize(fragNormal), eye, 0.0, ambientIntensity);" +
			"\n\tvec3 ambient = light0_Color * ads.r;" +
			"\n\tvec3 diffuse = light0_Color * ads.g;" +
			"\n\tambient = max(ambient, 0.0);" +
			"\n\tdiffuse = max(diffuse, 0.0);" +
			"\n\tvec3 pinColor = vec3(0.0,0.0,0.0);" +
			"\n\tif(useClipPlane) {" +
			"\n\t\tcalculateClipPlanes();" +
			"\n\t}" +
			"\n\tfor(int colidx = 0; colidx < 20; colidx++) {" +
			"\n\t\tif(colidx == colourSelected) {" +
			"\n\t\t\tpinColor = multicolours[colidx];" + // * max(ambient + diffuse, 0.0);" +
			"\n\t\t\tpinColor = clamp(pinColor, 0.0, 1.0);" +
			"\n\t\t\tif (highlightPin) {" +
			"\n\t\t\t\tpinColor = highlightColor;" +
			"\n\t\t\t}" +
			//"\n\t\t\tpinColor = gammaEncode(pinColor);" +
			"\n\t\t\tgl_FragColor = vec4(pinColor, transparency);" +
			"\n\t\t}" +
			"\n\t}" +
			"\n}\n\n";

		//fragSource += x3dom.shader.gammaCorrectionDecl({});

		pinfrag.textContent = fragSource;
		pinheadshader.appendChild(pinfrag);

		var coneshader = document.createElement("ComposedShader");
		coneshader.setAttribute("id", "coneShader");

		var conevert = document.createElement("ShaderPart");
		conevert.setAttribute("type", "VERTEX");
		conevert.setAttribute("DEF", "noShadeVert");

		var conevertSource = "attribute vec3 position;" +
			"\nattribute vec3 normal;" +
			"\n" +
			"\nuniform mat4 modelViewMatrixInverse;" +
			"\nuniform mat4 modelViewProjectionMatrix;" +
			"\nuniform mat4 modelViewMatrix;" +
			"\n" +
			"\nvarying vec4 fragPosition;" +
			"\nvoid main()" +
			"\n{" +
			"\n\tfragPosition = (modelViewMatrix * vec4(position, 1.0));" +
			"\n\tgl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
			"\n}";

		conevert.textContent = conevertSource;
		coneshader.appendChild(conevert);

		var conefrag = document.createElement("ShaderPart");
		conefrag.setAttribute("type", "FRAGMENT");
		conefrag.setAttribute("DEF", "noShadeFrag");

		var coneFragSource = "#ifdef GL_FRAGMENT_PRECISION_HIGH" +
			"\n\tprecision highp float;" +
			"\n#else" +
			"\n\tprecision mediump float;" +
			"\n#endif" +
			"\n" +
			"\nuniform vec3 diffuseColor;" +
			"\nuniform float transparency;" +
			"\nuniform bool highlightPin;" +
			"\nuniform vec3 highlightColor;" +
			"\nuniform mat4 viewMatrixInverse;" +
			"\nuniform bool useClipPlane;" +
			"\nvarying vec4 fragPosition;" +
			"\n";

		coneFragSource += x3dom.shader.clipPlanes(1);

		coneFragSource += "\nvoid main()" +
			"\n{" +
			"\n\tvec3 diffuseColor = clamp(diffuseColor, 0.0, 1.0);" +
			"\n\tif(useClipPlane) {" +
			"\n\t\tcalculateClipPlanes();" +
			"\n\t}" +
			"\n\tif (highlightPin) {" +
			"\n\t\tdiffuseColor = highlightColor;" +
			"\n\t}" +
			"\n\tgl_FragColor = vec4(diffuseColor, transparency);" +
			"\n}";

		conefrag.textContent = coneFragSource;

		coneshader.appendChild(conefrag);

		element.appendChild(pinheadshader);
		element.appendChild(coneshader);
	};
}());