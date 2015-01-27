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
var config		 = require('app-config').config;
var logIface	 = require('../logger.js');
var logger		 = logIface.logger;
var sem			 = require('semaphore')(10);
var popCache	 = require('../cache/pbf_cache.js');

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

	var head = xmlDoc.createElement('navigationInfo');

	head.setAttribute('DEF', 'head');
	head.setAttribute('headlight', 'true');
	head.setAttribute('type', 'walk');

	head.textContent = ' ';

	scene.appendChild(head);
	xmlDoc.firstChild.appendChild(scene);

	// Background color (ie skybox)
	var bground = xmlDoc.createElement('background');
	bground.setAttribute('skyangle', '0.9 1.5 1.57');
	bground.setAttribute('skycolor', '0.21 0.18 0.66 0.2 0.44 0.85 0.51 0.81 0.95 0.83 0.93 1');
	bground.setAttribute('groundangle', '0.9 1.5 1.57');
	bground.setAttribute('groundcolor', '0.65 0.65 0.65 0.73 0.73 0.73 0.81 0.81 0.81 0.91 0.91 0.91');
	bground.textContent = ' ';
	scene.appendChild(bground);

/*
	var fog = xmlDoc.createElement('fog');
	fog.setAttribute('visibilityRange', '300');
	fog.setAttribute('color', '1,1,1');
	fog.setAttribute('fogType', 'LINEAR');
	fog.textContent = ' ';
	scene.appendChild(fog);
  */

	// Environmental variables
	var environ = xmlDoc.createElement('environment');
	environ.setAttribute('frustumCulling', 'true');
	environ.setAttribute('smallFeatureCulling', 'true');
	environ.setAttribute('smallFeatureThreshold', 5);
	environ.setAttribute('occlusionCulling', 'true');
	environ.textContent = ' ';

	scene.appendChild(environ);

	return scene;
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
				var url_str = '//' + config.server.apiHost + '/' + account + '/' + child['project'] + '/revision/master/' + child['revision'] + '.x3d.' + mode;
			else
				var url_str = '//' + config.server.apiHost + '/' + account + '/' + child['project'] + '/revision/master/head.x3d.' + mode;

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

			newNode.setAttribute("id", child['id']);
			newNode.setAttribute('DEF', dbInterface.uuidToString(child["shared_id"]));
			xmlNode.appendChild(newNode);
			X3D_AddChildren(xmlDoc, newNode, child, dbInterface, account, project, mode);
		} else if(child['type'] == 'material') {
			 var appearance = xmlDoc.createElement('Appearance');


				if (!child['two_sided']) {
					newNode = xmlDoc.createElement('Material');
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
			newNode.setAttribute('url', '//' + config.server.apiHost + '/' + account + '/' + project + '/' + child['id'] + '.' + child['extension']);
			newNode.textContent = ' ';
			newNode.setAttribute("id", child['id']);
			newNode.setAttribute('DEF', dbInterface.uuidToString(child["shared_id"]));
			xmlNode.appendChild(newNode);
			X3D_AddChildren(xmlDoc, newNode, child, dbInterface, account, project, mode);
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

			for (var faceIdx = 0; faceIdx < mesh.mFaces.length; faceIdx++) {
				for (var vertIdx = 0; vertIdx < mesh.mFaces[faceIdx].length; vertIdx++) {
					face_arr += mesh.mFaces[faceIdx][vertIdx] + ' ';
				}
				face_arr += '-1 ';

			}
			indexedfaces.setAttribute('coordIndex', face_arr);
			shape.appendChild(indexedfaces);

			var coordinate = xmlDoc.createElement('Coordinate');
			var coord_arr = '';

			for (var vertIdx = 0; vertIdx < mesh.mVertices.length; vertIdx++) {
				for (var comp_idx = 0; comp_idx < 3; comp_idx++) {
					coord_arr += mesh.mVertices[comp_idx] + ' ';
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
				externalGeometry.setAttribute('url', '//' + config.server.apiHost + '/' + account + '/' + project + '/' + meshId + '.src?tex_uuid=' + tex_id);
			} else {
				externalGeometry.setAttribute('url', '//' + config.server.apiHost + '/' + account + '/' + project + '/' + meshId + '.src');
			}

			shape.appendChild(externalGeometry);
			break;

		case "bin":
			shape.setAttribute('bboxCenter', bbox.center.join(' '));
			shape.setAttribute('bboxSize', bbox.size.join(' '));

			var binaryGeometry = xmlDoc.createElement('binaryGeometry');

			binaryGeometry.setAttribute('normal', '//' + config.server.apiHost + '/' + account + '/' + project + '/' + meshId + '.bin?mode=normals');

			if ('children' in mat) {
				binaryGeometry.setAttribute('texCoord', '//' + config.server.apiHost + '/' + account + '/' + project + '/' + meshId + '.bin?mode=texcoords');
			}

			binaryGeometry.setAttribute('index', '//' + config.server.apiHost + '/' + account + '/' + project + '/' + meshId + '.bin?mode=indices');
			binaryGeometry.setAttribute('coord', '//' + config.server.apiHost + '/' + account + '/' + project + '/' + meshId + '.bin?mode=coords');
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

						popGeometryLevel.setAttribute('src', '//' + config.server.apiHost + '/' + account + '/' + project + '/' + meshId + '.pbf?level=' + lvl);
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
	pLight.setAttribute('ambientIntensity', '0.8');
	pLight.setAttribute('location', bbox.max.join(' '));
	pLight.setAttribute('shadowIntensity', 0.7);
	pLight.textContent = ' ';

	scene.appendChild(pLight);
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
	//vpoint.setAttribute('position', vpos.join(' '));

	vpoint.setAttribute('position', '-26.06 1.43 15.28');
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
function render(dbInterface, account, project, subFormat, revision, res, callback) {
	dbInterface.getScene(account, project, revision, function(err, doc) {
		if(err) return callback(err);

		var xmlDoc = X3D_Header();
		var scene  = X3D_CreateScene(xmlDoc);

		// Hack for the demo, generate objects server side
		json_objs = [];

		var sceneBBoxMin = [];
		var sceneBBoxMax = [];

		var dummyRoot = { children: [doc.mRootNode] };

		X3D_AddChildren(xmlDoc, scene, dummyRoot, dbInterface, account, project, subFormat);

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

		//X3D_AddGroundPlane(xmlDoc, bbox);
		X3D_AddViewpoint(xmlDoc, bbox);
		//X3D_AddLights(xmlDoc, bbox);

		var xmlStr = new xmlSerial().serializeToString(xmlDoc);
		res.write(xmlStr);

		console.log("Rendering ....");
		res.end();
	});
};

exports.route = function(router)
{
	router.get('x3d', '/:account/:project/revision/:rid', function(res, params)
	{
		render(router.dbInterface, params.account, params.project,	params.subformat, params.rid, res,
			function(err) {
				throw err;
			});
	});

	router.get('x3d', '/:account/:project/revision/:branch/head', function(res, params)
	{
		render(router.dbInterface, params.account, params.project, params.subformat, null, res,
			function(err) {
				throw err;
			});
	});

	router.get('x3d', '/:account/:project/revision/:rid/:sid', function(res, params)
	{
		render(router.dbInterface, params.account, params.project, params.subformat, params.rid, res,
			function(err) {
				throw err;
		});
	});

	router.get('x3d', '/:account/:project/revision/:branch/head/:sid', function(res, params)
	{
		render(router.dbInterface, params.account, params.project, params.subformat, null, res,
			function(err) {
				throw err;
		});
	});
}

