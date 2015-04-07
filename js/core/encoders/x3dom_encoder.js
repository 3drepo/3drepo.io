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

var C			 = require("../constants.js");
var fs			 = require('fs');
var repoNodeMesh = require('../repoNodeMesh.js');
var xmlDom		 = require('xmldom');
var domImp		 = xmlDom.DOMImplementation;
var xmlSerial	 = xmlDom.XMLSerializer;

var config		 = require('../config.js');
var logIface	 = require('../logger.js');
var logger		 = logIface.logger;
var sem			 = require('semaphore')(10);
var popCache	 = require('../cache/pbf_cache.js');

var googleMaps	 = require('./helper/googleMap.js');

var responseCodes = require('../response_codes.js');

var jsonCache = {};

function getChild(parent, type, n) {
	if ((parent == null) || !('children' in parent))
		return null;

	var typeIdx = 0;

	n = typeof n !== 'undefined' ? n : 0;

	for (var childIdx = 0; childIdx < parent.children.length; childIdx++) {
		if (parent.children[childIdx]['type'] == type) {
			if (typeIdx == n) {
				return parent.children[childIdx];
			}

			typeIdx++;
		}
	}

	return null;
}

function X3D_Header() {
	var xmlDoc = new domImp().createDocument('http://www.web3d.org/specification/x3d-namespace', 'X3D');

	xmlDoc.firstChild.setAttribute('onload', 'onLoaded(event);');
	xmlDoc.firstChild.setAttribute('xmlns', 'http://www.web3d.org/specification/x3d-namespace');

	return xmlDoc;
}

/*******************************************************************************
 * Create scene in X3D document
 *
 * @param {xmlDom} xmlDoc - The XML document to add the scene to
 *******************************************************************************/
function X3D_CreateScene(xmlDoc) {
	var scene = xmlDoc.createElement('Scene');
	scene.setAttribute('id', 'scene');

	xmlDoc.firstChild.appendChild(scene);

	var rootGroup = xmlDoc.createElement("group");
	rootGroup.setAttribute('id', 'root');
	rootGroup.setAttribute('def', 'root');
	rootGroup.setAttribute('render', 'true');
	scene.appendChild(rootGroup);

	return {scene: scene, root: rootGroup};
}

/*******************************************************************************
 * Create scene in X3D document
 *
 * @param {xmlDom} xmlDoc - The XML document to add the scene to
 *******************************************************************************/
function X3D_CreateOculus(xmlDoc) {
	var sceneRoot = X3D_CreateScene(xmlDoc);

	var scene	= sceneRoot.scene;
	var group	= sceneRoot.root;
	//xmlDoc.firstChild.appendChild(scene);

	var vp = xmlDoc.createElement("viewpoint");
	vp.setAttribute('id', 'vpp');
	vp.setAttribute('def', 'vp');
	vp.setAttribute('zNear', 0.01);
	vp.setAttribute('zFar', 10000);
	vp.setAttribute('position', '0 0 0');
	vp.textContent = ' ';
	scene.appendChild(vp);

	var alt = xmlDoc.createElement("viewpoint");
	alt.setAttribute('def', 'AOPT_CAM');
	alt.setAttribute('position', '0 0 0');
	alt.textContent = ' ';
	//scene.appendChild(alt);

    //<viewpoint def='AOPT_CAM' centerofrotation='3.4625 1.73998 -5.55' </viewpoint>

	// Add oculus eyes
	var eyeGroup = xmlDoc.createElement('group');
	eyeGroup.setAttribute('render', 'true');
	scene.appendChild(eyeGroup);

	var leftEye = xmlDoc.createElement('group');
	leftEye.setAttribute('def', 'left');
	eyeGroup.appendChild(leftEye);

	var leftShape = xmlDoc.createElement('shape');
	leftEye.appendChild(leftShape);

	var leftApp = xmlDoc.createElement('appearance');
	leftShape.appendChild(leftApp);

	var leftTex = xmlDoc.createElement('renderedtexture');
	leftTex.setAttribute('id', 'rtLeft');
	leftTex.setAttribute('stereoMode', 'LEFT_EYE');
	leftTex.setAttribute('update', 'ALWAYS');
	leftTex.setAttribute('oculusRiftVersion', '2');
	leftTex.setAttribute('dimensions', '980 1080 3');
	leftTex.setAttribute('repeatS', 'false');
	leftTex.setAttribute('repeatT', 'false');
	leftTex.setAttribute('interpupillaryDistance', 0.0668);
	leftApp.appendChild(leftTex);

	var leftVP = xmlDoc.createElement('viewpoint');
	leftVP.setAttribute('use', 'vp');
	leftVP.setAttribute('containerfield', 'viewpoint');
	leftVP.textContent = ' ';
	leftTex.appendChild(leftVP);

	var leftBground = xmlDoc.createElement('background');
	leftBground.setAttribute('use', 'bground');
	leftBground.setAttribute('containerfield', 'background');
	leftBground.textContent = ' ';
	leftTex.appendChild(leftBground);

	var leftScene = xmlDoc.createElement('group');
	leftScene.setAttribute('use', 'root');
	leftScene.setAttribute('containerfield', 'scene');
	leftTex.appendChild(leftScene);


	var leftShader = xmlDoc.createElement('composedshader');
	leftApp.appendChild(leftShader);

	var leftTexField = xmlDoc.createElement('field');
	leftTexField.setAttribute('name', 'tex');
	leftTexField.setAttribute('type', 'SFInt32');
	leftTexField.setAttribute('value', '0');
	leftShader.appendChild(leftTexField);

	/*
	var leftEyeField = xmlDoc.createElement('field');
	leftEyeField.setAttribute('name', 'leftEye');
	leftEyeField.setAttribute('type', 'SFFloat');
	leftEyeField.setAttribute('value', '1');
	leftShader.appendChild(leftEyeField);
	*/

	var leftVertexShader = xmlDoc.createElement('shaderpart');
	leftVertexShader.setAttribute('type', 'VERTEX');
	leftVertexShader.textContent = "\n\
		attribute vec3 position;\n\
		attribute vec2 texcoord;\n\
		\n\
		uniform mat4 modelViewProjectionMatrix;\n\
		varying vec2 fragTexCoord;\n\
		\n\
		void main()\n\
		{\n\
			vec2 pos = sign(position.xy);\n\
			fragTexCoord = texcoord;\n\
			gl_Position = vec4((pos.x - 1.0) / 2.0, pos.y, 0.0, 1.0);\n\
		}\n\
		";

	leftShader.appendChild(leftVertexShader);

	var leftFragShader = xmlDoc.createElement('shaderpart');
	leftFragShader.setAttribute('def', 'frag');
	leftFragShader.setAttribute('type', 'FRAGMENT');
	leftFragShader.textContent = "\n\
		#ifdef GL_ES\n\
			precision highp float;\n\
		#endif\n\
		\n\
		uniform sampler2D tex;\n\
		varying vec2 fragTexCoord;\n\
		\n\
		void main()\n\
		{\n\
			vec3 col = texture2D(tex, fragTexCoord).rgb;\n\
			//col.r = 1.0;\n\
			gl_FragColor = vec4(col, 1.0);\n\
		}\n";

	leftShader.appendChild(leftFragShader);

	var leftPlane = xmlDoc.createElement('plane');
	leftPlane.setAttribute('solid', 'false');
	leftPlane.setAttribute('invisible', 'true');
	leftShape.appendChild(leftPlane);

	// Right eye
	var rightEye = xmlDoc.createElement('group');
	rightEye.setAttribute('def', 'right');
	eyeGroup.appendChild(rightEye);

	var rightShape = xmlDoc.createElement('shape');
	rightEye.appendChild(rightShape);

	var rightApp = xmlDoc.createElement('appearance');
	rightShape.appendChild(rightApp);

	var rightTex = xmlDoc.createElement('renderedtexture');
	rightTex.setAttribute('id', 'rtRight');
	rightTex.setAttribute('stereoMode', 'RIGHT_EYE');
	rightTex.setAttribute('update', 'ALWAYS');
	rightTex.setAttribute('oculusRiftVersion', '2');
	rightTex.setAttribute('dimensions', '980 1080 3');
	rightTex.setAttribute('repeatS', 'false');
	rightTex.setAttribute('repeatT', 'false');
	rightTex.setAttribute('interpupillaryDistance', 0.0668);
	rightApp.appendChild(rightTex);

	var rightVP = xmlDoc.createElement('viewpoint');
	rightVP.setAttribute('use', 'vp');
	rightVP.setAttribute('containerfield', 'viewpoint');
	rightVP.textContent = ' ';
	rightTex.appendChild(rightVP);

	var rightBground = xmlDoc.createElement('background');
	rightBground.setAttribute('use', 'bground');
	rightBground.setAttribute('containerfield', 'background');
	rightBground.textContent = ' ';
	rightTex.appendChild(rightBground);

	var rightScene = xmlDoc.createElement('group');
	rightScene.setAttribute('use', 'root');
	rightScene.setAttribute('containerfield', 'scene');
	rightScene.textContent = ' ';
	rightTex.appendChild(rightScene);

	var rightShader = xmlDoc.createElement('composedshader');
	rightApp.appendChild(rightShader);

	var rightTexField = xmlDoc.createElement('field');
	rightTexField.setAttribute('name', 'tex');
	rightTexField.setAttribute('type', 'SFInt32');
	rightTexField.setAttribute('value', '0');
	rightShader.appendChild(rightTexField);

/*
	var rightEyeField = xmlDoc.createElement('field');
	rightEyeField.setAttribute('name', 'rightEye');
	rightEyeField.setAttribute('type', 'SFFloat');
	rightEyeField.setAttribute('value', '1');
	rightShader.appendChild(rightEyeField);
*/

	var rightVertexShader = xmlDoc.createElement('shaderpart');
	rightVertexShader.setAttribute('type', 'VERTEX');
	rightVertexShader.textContent = "\n\
		attribute vec3 position;\n\
		attribute vec2 texcoord;\n\
		\n\
		uniform mat4 modelViewProjectionMatrix;\n\
		varying vec2 fragTexCoord;\n\
		\n\
		void main()\n\
		{\n\
			vec2 pos = sign(position.xy);\n\
			fragTexCoord = texcoord;\n\
			gl_Position = vec4((pos.x + 1.0) / 2.0, pos.y, 0.0, 1.0);\n\
		}";

	rightShader.appendChild(rightVertexShader);

	var rightFragShader = xmlDoc.createElement('shaderpart');
	rightFragShader.setAttribute('type', 'FRAGMENT');
	//rightFragShader.setAttribute('use', 'frag');
	rightFragShader.textContent = "\n\
		#ifdef GL_ES\n\
			precision highp float;\n\
		#endif\n\
		\n\
		uniform sampler2D tex;\n\
		varying vec2 fragTexCoord;\n\
		\n\
		void main()\n\
		{\n\
			vec3 col = texture2D(tex, fragTexCoord).rgb;\n\
			gl_FragColor = vec4(col, 1.0);\n\
		}\n";

	rightShader.appendChild(rightFragShader);

	var rightPlane = xmlDoc.createElement('plane');
	rightPlane.setAttribute('solid', 'false');
	rightPlane.setAttribute('invisible', 'true');
	rightShape.appendChild(rightPlane);

	return {scene: scene, root: group};
}

/*******************************************************************************
 * Add children of node to xmlNode in X3D document
 *
 * @param {xmlDom} xmlDoc - The XML document to add the scene to
 * @param {xmlNode} xmlNode - The node to append the children to
 * @param {JSON} node - The node loaded from repoGraphScene
 * @param {dbInterface} dbInterface - Database interface object
 * @param {string} account - Name of the account containing the project
 * @param {string} project - Name of the project
 * @param {string} mode - Type of X3D being rendered
 *******************************************************************************/
function X3D_AddChildren(xmlDoc, xmlNode, node, dbInterface, account, project, mode)
{
	if (!('children' in node))
		return;

	for(var ch_idx = 0; ch_idx < node['children'].length; ch_idx++)
	{
		var child = node['children'][ch_idx];
		var newNode = null;

		if (child['type'] == 'ref')
		{
			newNode = xmlDoc.createElement('Inline');

			var url_str = child['project'] + "." + mode + ".x3d";

			if ('revision' in child)
				var url_str = config.apiServer.url + '/' + account + '/' + child['project'] + '/revision/master/' + child['revision'] + '.x3d.' + mode;
			else
				var url_str = config.apiServer.url + '/' + account + '/' + child['project'] + '/revision/master/head.x3d.' + mode;

			newNode.setAttribute('onload', 'onLoaded(event);');
			newNode.setAttribute('url', url_str);
			newNode.setAttribute('id', child['id']);
			newNode.setAttribute('DEF', dbInterface.uuidToString(child["shared_id"]));
			newNode.setAttribute('nameSpaceName', child['project']);

			if ('bounding_box' in child)
			{
				var bbox = repoNodeMesh.extractBoundingBox(child);
				newNode.setAttribute('bboxCenter', bbox.center);
				newNode.setAttribute('bboxSize', bbox.size);
			}
			xmlNode.appendChild(newNode);

			X3D_AddChildren(xmlDoc, newNode, child, dbInterface, account, project, mode);
		}
		else if (child['type'] == 'transformation')
		{
			var mat_str = "";
			for(var mat_col = 0; mat_col < 4; mat_col++)
			{
				for(var mat_row = 0; mat_row < 4; mat_row++)
				{
					mat_str += child['matrix'][mat_row][mat_col];

					if (!((mat_row == 3) && (mat_col == 3)))
						mat_str += ',';
				}
			}

			if (mat_str == "1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1")
			{
				newNode = xmlDoc.createElement('Group');
			} else {
				newNode = xmlDoc.createElement('MatrixTransform');
				newNode.setAttribute('matrix', mat_str);
			}

			if ('bounding_box' in child)
			{
				var bbox = repoNodeMesh.extractBoundingBox(child);
				newNode.setAttribute('bboxCenter', bbox.center);
				newNode.setAttribute('bboxSize', bbox.size);
			}

			newNode.setAttribute("id", child['id']);
			newNode.setAttribute('DEF', dbInterface.uuidToString(child["shared_id"]));
			xmlNode.appendChild(newNode);
			X3D_AddChildren(xmlDoc, newNode, child, dbInterface, account, project, mode);
		} else if(child['type'] == 'material') {
			 var appearance = xmlDoc.createElement('Appearance');


				if (!child['two_sided']) {
					newNode = xmlDoc.createElement('TwoSidedMaterial');
				} else {
					newNode = xmlDoc.createElement('TwoSidedMaterial');
				}

				var ambient_intensity = 1;

				if (('ambient' in child) && ('diffuse' in child)) {
					for (var i = 0; i < 3; i++) {
						if (child['diffuse'][i] != 0) {
							ambient_intensity = child['ambient'][i] / child['diffuse'][i];
							break;
						}
					}
				}

				if ('diffuse' in child)
					newNode.setAttribute('diffuseColor', child['diffuse'].join(' '));

				if ('shininess' in child)
					newNode.setAttribute('shininess',  child['shininess'] / 512);

				if ('specular' in child)
					newNode.setAttribute('specularColor', child['specular'].join(' '));

				if ('opacity' in child) {
					if (child['opacity'] != 1) {
						newNode.setAttribute('transparency', 1.0 - child['opacity']);
					}
				}

				newNode.textContent = ' ';
				newNode.setAttribute("id", child['id']);
				newNode.setAttribute('DEF', dbInterface.uuidToString(child["shared_id"]));
				appearance.appendChild(newNode);
				xmlNode.appendChild(appearance);
				X3D_AddChildren(xmlDoc, appearance, child, dbInterface, account, project, mode);
		} else if (child['type'] == 'texture') {
			newNode = xmlDoc.createElement('ImageTexture');
			newNode.setAttribute('url', config.apiServer.url + '/' + account + '/' + project + '/' + child['id'] + '.' + child['extension']);
			newNode.textContent = ' ';
			newNode.setAttribute("id", child['id']);
			newNode.setAttribute('DEF', dbInterface.uuidToString(child["shared_id"]));
			xmlNode.appendChild(newNode);

			var texProperties = xmlDoc.createElement('TextureProperties');
			texProperties.setAttribute('generateMipMaps', 'true');
			newNode.appendChild(texProperties);

			X3D_AddChildren(xmlDoc, newNode, child, dbInterface, account, project, mode);
		} else if (child['type'] == 'map') {
			var newNode = googleMaps.addGoogleTiles(xmlDoc, child['width'], child['yrot'], child['worldTileSize'], child['lat'], child['long'], child['zoom'], child['trans']);

			newNode.setAttribute("id", child['id']);
			newNode.setAttribute('DEF', dbInterface.uuidToString(child["shared_id"]));

			xmlNode.appendChild(newNode);
		} else if (child['type'] == 'mesh') {
			var shape = xmlDoc.createElement('Shape');
			shape.setAttribute('id', child['id']);
			shape.setAttribute('DEF', dbInterface.uuidToString(child["shared_id"]));
			shape.setAttribute('onclick', 'clickObject(event);');
			shape.setAttribute('onmouseover', 'onMouseOver(event);');
			shape.setAttribute('onmousemove', 'onMouseMove(event);');

			X3D_AddChildren(xmlDoc, shape, child, dbInterface, account, project, mode);

			X3D_AddToShape(xmlDoc, shape, dbInterface, account, project, child, mode);
			xmlNode.appendChild(shape);
		}
	}
}

/*******************************************************************************
 * Add children to a shape node
 *
 * @param {xmlDom} xmlDoc - The XML document to add the scene to
 * @param {xmlNode} shape - The shape node to append the children to
 * @param {JSON} node - The node loaded from repoGraphScene
 * @param {dbInterface} dbInterface - Database interface object
 * @param {string} account - Name of the account containing the project
 * @param {string} project - Name of the project
 * @param {string} mode - Type of X3D being rendered
 *******************************************************************************/
function X3D_AddToShape(xmlDoc, shape, dbInterface, account, project, mesh, mode) {
	var meshId = mesh['id'];
	var mat = getChild(mesh, 'material')

	logger.log('debug', 'Loading mesh ' + meshId);

	var bbox = repoNodeMesh.extractBoundingBox(mesh);

	switch (mode) {
		case "x3d":
			shape.setAttribute('bboxCenter', bbox.center.join(' '));
			shape.setAttribute('bboxSize', bbox.size.join(' '));

			var indexedfaces = xmlDoc.createElement('IndexedFaceSet');

			indexedfaces.setAttribute('ccw', 'false');
			indexedfaces.setAttribute('solid', 'false');
			indexedfaces.setAttribute('creaseAngle', '3.14');

			var face_arr = '';
			var idx = 0;
			var nVerts = 0;

			for (var faceIdx = 0; faceIdx < mesh.faces_count; faceIdx++)
			{
				nVerts = mesh['faces'].buffer.readInt32LE(idx);
				idx += 4;

				for(var vertIdx = 0; vertIdx < nVerts; vertIdx++) {
					face_arr += mesh['faces'].buffer.readInt32LE(idx) + ' ';
					idx += 4;
				}

				face_arr += '-1 ';
			}

			indexedfaces.setAttribute('coordIndex', face_arr);
			shape.appendChild(indexedfaces);

			var coordinate = xmlDoc.createElement('Coordinate');
			var coord_arr = '';

			idx = 0;
			for (var vertIdx = 0; vertIdx < mesh.vertices_count; vertIdx++)
			{
				for (var comp_idx = 0; comp_idx < 3; comp_idx++) {
					coord_arr += mesh['vertices'].buffer.readFloatLE(idx) + ' ';
					idx += 4;
				}
			}

			coordinate.setAttribute('point', coord_arr);
			indexedfaces.appendChild(coordinate);

			break;

		case "src":
			shape.setAttribute('bboxCenter', bbox.center.join(' '));
			shape.setAttribute('bboxSize', bbox.size.join(' '));

			var externalGeometry = xmlDoc.createElement('ExternalGeometry');

			//externalGeometry.setAttribute('solid', 'true');

			if ('children' in mat) {
				var tex_id = mat['children'][0]['id'];
				externalGeometry.setAttribute('url', config.apiServer.url + '/' + account + '/' + project + '/' + meshId + '.src?tex_uuid=' + tex_id);
			} else {
				externalGeometry.setAttribute('url', config.apiServer.url + '/' + account + '/' + project + '/' + meshId + '.src');
			}

			shape.appendChild(externalGeometry);
			break;

		case "bin":
			shape.setAttribute('bboxCenter', bbox.center.join(' '));
			shape.setAttribute('bboxSize', bbox.size.join(' '));

			var binaryGeometry = xmlDoc.createElement('binaryGeometry');

			binaryGeometry.setAttribute('normal', config.apiServer.url + '/' + account + '/' + project + '/' + meshId + '.bin?mode=normals');

			if ('children' in mat) {
				binaryGeometry.setAttribute('texCoord', config.apiServer.url + '/' + account + '/' + project + '/' + meshId + '.bin?mode=texcoords');
			}

			binaryGeometry.setAttribute('index', config.apiServer.url + '/' + account + '/' + project + '/' + meshId + '.bin?mode=indices');
			binaryGeometry.setAttribute('coord', config.apiServer.url + '/' + account + '/' + project + '/' + meshId + '.bin?mode=coords');
			//binaryGeometry.setAttribute('vertexCount', mesh.vertices_count);
			binaryGeometry.textContent = ' ';

			shape.appendChild(binaryGeometry);
			break;


		case "pbf":
			var popGeometry = xmlDoc.createElement('PopGeometry');

			popCache.getPopCache(dbInterface, project, false, null, mesh['id'], function(err, cacheObj) {
				if (mesh['id'] in GLOBAL.pbfCache) {
					var cacheMesh = GLOBAL.pbfCache[mesh['id']];

					popGeometry.setAttribute('id', 'tst');
					popGeometry.setAttribute('vertexCount', mesh.faces_count * 3);
					popGeometry.setAttribute('vertexBufferSize', mesh.vertices_count);
					popGeometry.setAttribute('primType', "TRIANGLES");
					popGeometry.setAttribute('attributeStride', cacheMesh.stride);
					popGeometry.setAttribute('normalOffset', 8);
					popGeometry.setAttribute('bbMin', bbox.min.join(' '));

					if (cacheMesh.has_tex) {
						popGeometry.setAttribute('texcoordOffset', 12);
					}

					popGeometry.setAttribute('size', bbox.size.join(' '));
					popGeometry.setAttribute('tightSize', bbox.size.join(' '));
					popGeometry.setAttribute('maxBBSize', bbox.size.join(' '));

					if ('min_texcoordu' in cacheMesh) {
						popGeometry.setAttribute('texcoordMinU', cacheMesh.minTexcoordU);
						popGeometry.setAttribute('texcoordScaleU', (cacheMesh.maxTexcoordu - cacheMesh.minTexcoordU));
						popGeometry.setAttribute('texcoordMinV', cacheMesh.minTexcoordV);
						popGeometry.setAttribute('texcoordScaleV', (cacheMesh.maxTexcoordV - cacheMesh.minTexcoordV));
					}

					for (var lvl = 0; lvl < cacheMesh.num_levels; lvl++) {
						var popGeometryLevel = xmlDoc.createElement('PopGeometryLevel');

						popGeometryLevel.setAttribute('src', config.apiServer.url + '/' + account + '/' + project + '/' + meshId + '.pbf?level=' + lvl);
						popGeometryLevel.setAttribute('numIndices', cacheMesh[lvl].numIdx);
						popGeometryLevel.setAttribute('vertexDataBufferOffset', cacheMesh[lvl].numVertices);

						popGeometryLevel.textContent = ' ';
						popGeometry.appendChild(popGeometryLevel);
					}

					shape.appendChild(popGeometry);

					shape.setAttribute('bboxCenter', bbox.center.join(' '));
					shape.setAttribute('bboxSize', bbox.size.join(' '));
				}
			});

		break;
	}
};

/*******************************************************************************
 * Add light to scene
 *
 * @param {xmlDom} xmlDoc - The XML document to add the scene to
 * @param {JSON} bbox - Bounding used to compute the position of the light
 *******************************************************************************/
function X3D_AddLights(xmlDoc, bbox)
{
	var scene = xmlDoc.getElementsByTagName('Scene')[0];

	var pLight = xmlDoc.createElement('PointLight');
	pLight.setAttribute('ambientIntensity', '1.0');
	pLight.setAttribute('intensity', '1.0');
	//pLight.setAttribute('location', bbox.max.join(' '));
	//pLight.setAttribute('shadowIntensity', 0.7);
	pLight.textContent = ' ';

	//scene.appendChild(pLight);
};

/*******************************************************************************
 * Add measurement tool to the scene
 *
 * @param {xmlDom} xmlDoc - The XML document to add the scene to
 *******************************************************************************/
function X3D_AddMeasurer(xmlDoc) {
	var scene = xmlDoc.getElementsByTagName('Scene')[0];

	var trans = xmlDoc.createElement('Transform');
	trans.setAttribute('id', 'lineTrans');
	trans.setAttribute('ng-controller', "MeasurerCtrl");
	trans.setAttribute('render', '{{render()}}');

	var shape = xmlDoc.createElement('Shape');
	shape.setAttribute('isPickable', 'false');

	var app   = xmlDoc.createElement('Appearance');
	var mat   = xmlDoc.createElement('Material');
	mat.setAttribute('emissiveColor', '1 0 0');

	var dm	  = xmlDoc.createElement('DepthMode');
	dm.setAttribute('enableDepthTest', 'false');

	var lp	  = xmlDoc.createElement('LineProperties');
	lp.setAttribute('linewidthScaleFactor', 10);

	app.appendChild(mat);
	app.appendChild(dm);
	app.appendChild(lp);

	var ils = xmlDoc.createElement('IndexedLineSet');
	ils.setAttribute('coordIndex', '0 1 0 -1');

	var coord = xmlDoc.createElement('Coordinate');
	coord.setAttribute('id', 'line');
	coord.setAttribute('point', '{{pointString()}}');

	ils.appendChild(coord);

	shape.appendChild(app);
	shape.appendChild(ils);

	trans.appendChild(shape);

	scene.appendChild(trans);
};

/*******************************************************************************
 * Add viewpoint to scene
 *
 * @param {xmlDom} xmlDoc - The XML document to add the scene to
 * @param {JSON} bbox - Bounding used to compute the position of the viewpoint
 *******************************************************************************/
function X3D_AddViewpoint(xmlDoc, bbox)
{
	var scene = xmlDoc.getElementsByTagName('Scene')[0];
	var vpos = [0,0,0];

	vpos[0] = bbox.center[0];
	vpos[1] = bbox.center[1];
	vpos[2] = bbox.center[2];

	var max_dim = Math.max(bbox.size[0], bbox.size[1]) * 0.5;

	var fov = 40 * (Math.PI / 180); // Field of view in radians

	vpos[2] += bbox.size[2] * 0.5 + max_dim / Math.tan(0.5 * fov);

	logger.log('debug', 'VPOS: ' + vpos.join(' '));
	logger.log('debug', 'MAXDIM: ' + max_dim);

	var vpoint = xmlDoc.createElement('Viewpoint');
	vpoint.setAttribute('id', 'sceneVP');
	vpoint.setAttribute('position', vpos.join(' '));
	//vpoint.setAttribute('position', '-26.06 1.43 15.28');
	//vpoint.setAttribute('position', '100 100 100');

	vpoint.setAttribute('orientation', '0 0 -1 0');
	vpoint.setAttribute('zNear', 0.01);

	vpoint.setAttribute('zFar', 10000);
	vpoint.setAttribute('fieldOfView', fov);

	vpoint.setAttribute('onload', 'startNavigation()');
	vpoint.textContent = ' ';

	scene.appendChild(vpoint);
}

/*******************************************************************************
 * Add ground plane to scene
 *
 * @param {xmlDom} xmlDoc - The XML document to add the scene to
 * @param {JSON} bbox - Bounding used to compute the position and size of
 *						ground plane
 *******************************************************************************/
function X3D_AddGroundPlane(xmlDoc, bbox)
{
	var scene = xmlDoc.getElementsByTagName('Scene')[0];

	var flipMat = xmlDoc.createElement('Transform');

	flipMat.setAttribute("rotation", "1,0,0,4.7124");
	flipMat.setAttribute("center", bbox.center.join(','));

	var planeShape = xmlDoc.createElement('Shape');
	planeShape.setAttribute("id", "dontBother");
	var groundPlane = xmlDoc.createElement('Plane');

	groundPlane.setAttribute('center', bbox.center.join(','));
	groundPlane.setAttribute("lit", "false");
	var bboxsz = [0,0];
	bboxsz[0] = bbox.size[0] * 5;
	bboxsz[1] = bbox.size[1] * 5;

	groundPlane.setAttribute('size', bboxsz.join(','));

	var mat = xmlDoc.createElement('Material');

	mat.setAttribute('emissiveColor', '0.3333 0.7373 0.3137');
	mat.textContent = ' ';

	var appearance = xmlDoc.createElement('Appearance');
	appearance.appendChild(mat);

	groundPlane.textContent = " ";

	planeShape.appendChild(appearance);
	planeShape.appendChild(groundPlane);
	flipMat.appendChild(planeShape);
	scene.appendChild(flipMat);
}

/*******************************************************************************
 * Add ground plane to scene
 *
 * @param {xmlDom} xmlDoc - The XML document to add the scene to
 * @param {JSON} bbox - Bounding used to compute the position and size of
 *						ground plane
 *******************************************************************************/
function render(dbInterface, account, project, subFormat, branch, revision, oculusMode, callback) {
	var full = (subFormat == "x3d");

	dbInterface.getScene(account, project, branch, revision, full, function(err, doc) {
		if(err.value) return callback(err);

		var xmlDoc = X3D_Header();

		if (!oculusMode)
		{
			var sceneRoot	= X3D_CreateScene(xmlDoc);
		} else {
			var sceneRoot	= X3D_CreateOculus(xmlDoc);
		}

		// Hack for the demo, generate objects server side
		json_objs = [];

		var sceneBBoxMin = [];
		var sceneBBoxMax = [];

		var dummyRoot = { children: [doc.mRootNode] };

		X3D_AddChildren(xmlDoc, sceneRoot.root, dummyRoot, dbInterface, account, project, subFormat);

		/*
		// Compute the scene bounding box.
		// Should be a better way of doing this.
		for (var meshId in doc['meshes']) {
			var mesh = doc['meshes'][meshId];
			var bbox = repoNodeMesh.extractBoundingBox(mesh);

			if (sceneBBoxMin.length)
			{
				for(var idx = 0; idx < 3; idx++)
				{
					sceneBBoxMin[idx] = Math.min(sceneBBoxMin[idx], bbox.min[idx]);
					sceneBBoxMax[idx] = Math.max(sceneBBoxMax[idx], bbox.max[idx]);
				}
			} else {
				sceneBBoxMin = bbox.min.slice(0);
				sceneBBoxMax = bbox.max.slice(0);
			}
		}

		var bbox	= {};
		bbox.min	= sceneBBoxMin;
		bbox.max	= sceneBBoxMax;
		bbox.center = [0.5 * (bbox.min[0] + bbox.max[0]), 0.5 * (bbox.min[1] + bbox.max[1]), 0.5 * (bbox.min[2] + bbox.max[2])];
		bbox.size	= [(bbox.max[0] - bbox.min[0]), (bbox.max[1] - bbox.min[1]), (bbox.max[2] - bbox.min[2])];
		*/

		//X3D_AddGroundPlane(xmlDoc, bbox);
		//X3D_AddViewpoint(xmlDoc, bbox);
		//X3D_AddLights(xmlDoc, bbox);

		return callback(responseCodes.OK, new xmlSerial().serializeToString(xmlDoc));
	});
};

exports.route = function(router)
{
	router.get('x3d', '/:account/:project/revision/:rid', function(res, params, err_callback)
	{
		render(router.dbInterface, params.account, params.project,	params.subformat, null, params.rid, false, err_callback);
	});

	router.get('x3d', '/:account/:project/revision/:branch/head', function(res, params, err_callback)
	{
		render(router.dbInterface, params.account, params.project, params.subformat, params.branch, null, false, err_callback);
	});

	router.get('x3d', '/:account/:project/revision/:rid/:sid', function(res, params, err_callback)
	{
		render(router.dbInterface, params.account, params.project, params.subformat, null, params.rid, false, err_callback);
	});

	router.get('x3d', '/:account/:project/revision/:branch/head/:sid', function(res, params, err_callback)
	{
		render(router.dbInterface, params.account, params.project, params.subformat, params.branch, null, false, err_callback);
	});

	router.get('occ', '/:account/:project/revision/:rid', function(res, params, err_callback)
	{
		render(router.dbInterface, params.account, params.project,	params.subformat, null, params.rid, true, err_callback);
	});

	router.get('occ', '/:account/:project/revision/:branch/head', function(res, params, err_callback)
	{
		render(router.dbInterface, params.account, params.project, params.subformat, params.branch, null, true, err_callback);
	});

	router.get('occ', '/:account/:project/revision/:rid/:sid', function(res, params, err_callback)
	{
		render(router.dbInterface, params.account, params.project, params.subformat, null, params.rid, true, err_callback);
	});

	router.get('occ', '/:account/:project/revision/:branch/head/:sid', function(res, params, err_callback)
	{
		render(router.dbInterface, params.account, params.project, params.subformat, params.branch, null, true, err_callback);
	});

}

