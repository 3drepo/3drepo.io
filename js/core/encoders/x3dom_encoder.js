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
var popCache	 = require('../cache/pbf_cache.js');

var googleMaps	 = require('./helper/googleMap.js');

var responseCodes = require('../response_codes.js');

var jsonCache = {};

var mathjs		= require('mathjs');

var dbInterface  = require('../db_interface.js');

var utils       = require('../utils.js');

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
function X3D_CreateScene(xmlDoc, rootNode) {
	var scene = xmlDoc.createElement('Scene');
	scene.setAttribute('id', 'scene');
	scene.setAttribute('dopickpass', 'false');

	xmlDoc.firstChild.appendChild(scene);

	var rootGroup = xmlDoc.createElement("group");

	rootGroup.setAttribute('onload', 'onLoaded(event);');
	rootGroup.setAttribute('id', 'root');
	rootGroup.setAttribute('def', 'root');
	rootGroup.setAttribute('render', 'true');

	// TODO: Why would rootNode not exists ?
	if (rootNode)
	{
		if (rootNode['bounding_box'])
		{
			var bbox = repoNodeMesh.extractBoundingBox(rootNode);
			rootGroup.setAttribute('bboxCenter', bbox.center);
			rootGroup.setAttribute('bboxSize', bbox.size);
		}
	}

	scene.appendChild(rootGroup);

	return {scene: scene, root: rootGroup};
}

function scale(v, s)
{
	return [v[0] * s, v[1] * s, v[2] * s];
}

function length(v)
{
	return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function normalize(v)
{
	var sz = length(v);
	return scale(v, 1 / sz);
}

function dotProduct(a,b)
{
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function crossProduct(a,b)
{
	var x = a[1] * b[2] - a[2] * b[1];
	var y = a[2] * b[0] - a[0] * b[2];
	var z = a[0] * b[1] - a[1] * b[0];

	return [x,y,z];
}

function vecAdd(a,b)
{
	return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function vecSub(a,b)
{
	return vecAdd(a, scale(b,-1));
}

function quatLookAt(up, forward)
{
	forward = normalize(forward);
	up = normalize(up);

	var right = crossProduct(forward, up);

	up = crossProduct(right, forward);

	var w = Math.sqrt(1 + right[0] + up[1] + forward[2]) * 0.5;

	var recip = 1 / (4 * w);
	var x = (forward[1] - up[2]) * recip;
	var y = (right[2] - forward[1]) * recip;
	var z = (up[0] - right[1]) * recip;

	return [x,y,z,w];
}

function axisangle(mat)
{
	var tmpMat = mat.clone();
	tmpMat = tmpMat.transpose();

	var right = mathjs.subset(tmpMat, mathjs.index(0,[0,3]))._data[0];
	right = normalize(right);

	var up = mathjs.subset(tmpMat, mathjs.index(1,[0,3]))._data[0];
	up = normalize(up);

	var forward = mathjs.subset(tmpMat, mathjs.index(2,[0,3]))._data[0];
	forward = normalize(forward);

	var eps = 0.0001;

	var a = up[0] - right[1];
	var b = forward[0] - right[2];
	var c = forward[1] - up[2];
	var tr = right[0] + up[1] + forward[2];

	var x = 0;
	var y = 0;
	var z = 0;
	var angle = 1;

	if ((Math.abs(a) < eps) && (Math.abs(b) < eps) && (Math.abs(c) < eps))
	{
		var d = up[0] + right[1];
		var e = forward[0] + right[2];
		var f = forward[1] + up[2];

		if (!((Math.abs(d) < eps) && (Math.abs(e) < eps) && (Math.abs(f) < eps) && (Math.abs(tr - 3) < eps)))
		{
			angle = Math.PI;

			var xx = (right[0] + 1) / 2;
			var yy = (up[1] + 1) / 2;
			var zz = (forward[2] + 1) / 2;

			var xy = d / 4;
			var xz = e / 4;
			var yz = f / 4;

			if (((xx - yy) > eps) && ((xx - zz) > eps)) {
				if (xx < eps) {
					x = 0; y = Math.SQRT1_2; z = Math.SQRT1_2;
				} else {
					x = Math.sqrt(xx); y = xy/x; z = xz / x;
				}
			} else if ((yy - zz) > eps) {
				if (yy < eps) {
					x = Math.SQRT1_2; y = 0; z = Math.SQRT1_2;
				} else {
					y = Math.sqrt(yy); x = xy / y; z = yz / y;
				}
			} else {
				if (zz < eps) {
					x = Math.SQRT1_2; y = Math.SQRT1_2; z = 0;
				} else {
					z = Math.sqrt(zz); x = xz / z; y = yz / z;
				}
			}
		}
	} else {
		var s = Math.sqrt(a * a + b * b + c * c);

		if (s < eps) s = 1;

		x = -c / s;
		y = b / s;
		z = -a / s;

		angle = Math.acos((tr - 1) / 2);
	}

	return [x, y, z, angle]; // Right-handed system
}

/*
function det(mat) {
	return mat[0,0] * (mat[1,1] * mat[2,2] - mat[1,2] * mat[2,1])
		- mat[0,1] * (mat[1,0] * mat[2,2] - mat[1,2] * mat[2,0])
		- mat[0,2] * (mat[1,0] * mat[2,1] - mat[1,1] * mat[2,0]);
}*/


/*******************************************************************************
 * Add children of node to xmlNode in X3D document
 *
 * @param {xmlDom} xmlDoc - The XML document to add the scene to
 * @param {xmlNode} xmlNode - The node to append the children to
 * @param {JSON} node - The node loaded from repoGraphScene
 * @param {Matrix} matrix - Current transformation matrix
 * @param {dbInterface} dbInterface - Database interface object
 * @param {string} account - Name of the account containing the project
 * @param {string} project - Name of the project
 * @param {string} mode - Type of X3D being rendered
 *******************************************************************************/
function X3D_AddChildren(xmlDoc, xmlNode, node, matrix, dbInterface, account, project, mode, logger)
{
	if (!('children' in node))
		return;

	for(var ch_idx = 0; ch_idx < node['children'].length; ch_idx++)
	{
		var child = node['children'][ch_idx];
		var newNode = null;

		if (!child)
			continue;

		if (child['type'] == 'ref')
		{
			newNode = xmlDoc.createElement('Inline');

			var url_str = child['project'] + "." + mode + ".x3d";
			var childRefAccount = child.hasOwnProperty('owner') ? child.owner : account;

			if ('revision' in child) {
				var url_str = config.api_server.url + '/' + childRefAccount + '/' + child['project'] + '/revision/master/' + child['revision'] + '.x3d.' + mode;
			} else {
				var url_str = config.api_server.url + '/' + childRefAccount + '/' + child['project'] + '/revision/master/head.x3d.' + mode;
			}

			newNode.setAttribute('onload', 'onLoaded(event);');
			newNode.setAttribute('url', url_str);
			newNode.setAttribute('id', child['id']);
			newNode.setAttribute('DEF', utils.uuidToString(child["shared_id"]));
			newNode.setAttribute('nameSpaceName', account + '__' + child['project']);

			if ('bounding_box' in child)
			{
				var bbox = repoNodeMesh.extractBoundingBox(child);
				newNode.setAttribute('bboxCenter', bbox.center);
				newNode.setAttribute('bboxSize', bbox.size);
			}
			xmlNode.appendChild(newNode);

			X3D_AddChildren(xmlDoc, newNode, child, matrix, dbInterface, account, project, mode, logger);
		}
		else if (child['type'] == 'camera')
		{
			newNode = xmlDoc.createElement('viewpoint');

			newNode.setAttribute('id', child['name']);
			newNode.setAttribute('DEF',utils.uuidToString(child['shared_id']));
			newNode.setAttribute('bind', false);

			//if (child['fov'])
			newNode.setAttribute('fieldOfView', 0.25 * Math.PI);

			if (child['position'])
				newNode.setAttribute('position', child['position'].join(','));

			//if (child['near'])
			//	newNode.setAttribute('zNear', child['near']);
			//else
				newNode.setAttribute('zNear', -1);

			//if (child['far'])
			//	newNode.setAttribute('zFar', child['far']);
			//else
				newNode.setAttribute('zFar', -1);

			var position = child["position"] ? child["position"] : [0,0,0];
			var look_at = child["look_at"] ? child["look_at"] : [0,0,-1];

			if (length(look_at) == 0)
				look_at = [0,0,-1];

			if (length(look_at) == 0) look_at = [0,0,1];

			// X3DOM has right-hand coordinate
			var up = child["up"] ? child["up"] : [0,1,0];
			forward = normalize(scale(look_at,-1)); // scale(look_at,-1)); // Forward, z-axis comes out of screen
			up = normalize(up);

			// X3DOM uses a right-hand coordinate system
			// In this case it's again reversed because of the
			// reversal above.
			var right = crossProduct(up, forward);

			var viewMat = mathjs.matrix([[right[0], right[1], right[2], 0], [up[0], up[1], up[2], 0],
				[forward[0], forward[1], forward[2], 0], [position[0], position[1], position[2], 1]]);

			viewMat = viewMat.transpose(); // Input as rows, rather than columns

			var det = mathjs.det(viewMat);

			newNode.setAttribute('position', position.join(','));

			var center = vecAdd(position, look_at);
			newNode.setAttribute('centerOfRotation', center.join(','));

			var orientation = axisangle(viewMat);
			newNode.setAttribute('orientation', orientation.join(','));

			xmlNode.appendChild(newNode);
			X3D_AddChildren(xmlDoc, newNode, child, matrix, dbInterface, account, project, mode, logger);
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
			newNode.setAttribute('DEF', utils.uuidToString(child["shared_id"]));
			xmlNode.appendChild(newNode);

			var newMatrix = matrix.clone();
			var transMatrix  = mathjs.matrix(child['matrix']);
			newMatrix = mathjs.multiply(transMatrix, newMatrix);

			X3D_AddChildren(xmlDoc, newNode, child, newMatrix, dbInterface, account, project, mode, logger);
		} else if(child['type'] == 'material') {
			 var appearance = xmlDoc.createElement('Appearance');

				newNode = xmlDoc.createElement('TwoSidedMaterial');

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
				{
					newNode.setAttribute('diffuseColor', child['diffuse'].join(' '));

					if (child['two_sided'])
						newNode.setAttribute('backDiffuseColor', child['diffuse'].join(' '));
				}

				if ('emissive' in child)
				{
					newNode.setAttribute('emissiveColor', child['emissive'].join(' '));

					if (child['two_sided'])
						newNode.setAttribute('backEmissiveColor', child['emissive'].join(' '));
				}

				if ('shininess' in child)
				{
					newNode.setAttribute('shininess',  child['shininess']); // / 512);

					if (child['two_sided'])
						newNode.setAttribute('backShininess', child['shininess']);
				}

				if ('specular' in child)
				{
					newNode.setAttribute('specularColor', child['specular'].join(' '));

					if (child['two_sided'])
						newNode.setAttribute('backSpecularColor', child['specular'].join(' '));
				}

				if ('opacity' in child) {
					if (child['opacity'] != 1) {
						newNode.setAttribute('transparency', 1.0 - child['opacity']);

						if (child['two_sided'])
							newNode.setAttribute('backTransparency', 1.0 - child['opacity']);
					}
				}

				newNode.textContent = ' ';
				newNode.setAttribute("id", child['id']);
				newNode.setAttribute('DEF', utils.uuidToString(child["shared_id"]));
				appearance.appendChild(newNode);
				xmlNode.appendChild(appearance);
				X3D_AddChildren(xmlDoc, appearance, child, matrix, dbInterface, account, project, mode, logger);
		} else if (child['type'] == 'texture') {
			newNode = xmlDoc.createElement('ImageTexture');
			newNode.setAttribute('url', config.api_server.url + '/' + account + '/' + project + '/' + child['id'] + '.' + child['extension']);
			newNode.textContent = ' ';
			newNode.setAttribute("id", child['id']);
			newNode.setAttribute('DEF', utils.uuidToString(child["shared_id"]));
			newNode.setAttribute('crossOrigin', 'use-credentials');
			xmlNode.appendChild(newNode);

			var texProperties = xmlDoc.createElement('TextureProperties');
			texProperties.setAttribute('generateMipMaps', 'true');
			newNode.appendChild(texProperties);

			X3D_AddChildren(xmlDoc, newNode, child, matrix, dbInterface, account, project, mode, logger);
		} else if (child['type'] == 'map') {
			if(!child['maptype'])
				child['maptype'] = 'satellite';

			if (!child["twosided"])
				child["twosided"] = false;

			var newNode = googleMaps.addGoogleTiles(xmlDoc, child['width'], child['yrot'], child['worldTileSize'], child['lat'], child['long'], child['zoom'], child['maptype'], child["twosided"], child['trans']);

			newNode.setAttribute("id", child['id']);
			newNode.setAttribute('DEF', utils.uuidToString(child["shared_id"]));

			xmlNode.appendChild(newNode);
		} else if (child['type'] == 'mesh') {
			var subMeshKeys = [];

			if (child[C.REPO_NODE_LABEL_COMBINED_MAP])
			{
				subMeshKeys = child[C.REPO_NODE_LABEL_COMBINED_MAP].map(function (item) {
					return utils.uuidToString(item[C.REPO_NODE_LABEL_MERGE_MAP_MESH_ID]);
				});
			} else {
				subMeshKeys = [null]; // No submesh
			}

			var bbox = null;

			if ('bounding_box' in child) bbox = repoNodeMesh.extractBoundingBox(child);

			if ((mode == "mp") && (subMeshKeys.length > 1))
			{
				var mp = xmlDoc.createElement('MultiPart');
				mp.setAttribute('onload', 'onLoaded(event);');
				mp.setAttribute('id', child['id']);
				mp.setAttribute('url', config.api_server.url + '/' + account + '/' + project + '/' + child['id'] + '.x3d.mpc');
				mp.setAttribute('urlIDMap', config.api_server.url + '/' + account + '/' + project + '/' + child['id'] + '.json.mpc');
				mp.setAttribute('onclick', 'clickObject(event);');
				mp.setAttribute('solid', 'false');
				mp.setAttribute('onmouseover', 'onMouseOver(event);');
				mp.setAttribute('onmousemove', 'onMouseMove(event);');
				mp.setAttribute('nameSpaceName', child['id']);

				if (bbox)
				{
					mp.setAttribute('bboxCenter', bbox.center);
					mp.setAttribute('bboxSize', bbox.size);
				}

				xmlNode.appendChild(mp);
			} else {
				for(var i = 0; i < subMeshKeys.length; i++)
				{
					var shape = xmlDoc.createElement('Shape');
					var childUniqueID = subMeshKeys[i] ? subMeshKeys[i] : child["id"];

					shape.setAttribute('id', childUniqueID);
					shape.setAttribute('DEF', childUniqueID); //dbInterface.uuidToString(child["shared_id"]));
					shape.setAttribute('onclick', 'clickObject(event);');
					shape.setAttribute('onmouseover', 'onMouseOver(event);');
					shape.setAttribute('onmousemove', 'onMouseMove(event);');

					if (bbox)
					{
						shape.setAttribute('bboxCenter', bbox.center);
						shape.setAttribute('bboxSize', bbox.size);
					}

					X3D_AddChildren(xmlDoc, shape, child, matrix, dbInterface, account, project, mode, logger);

					X3D_AddToShape(xmlDoc, shape, dbInterface, account, project, child, subMeshKeys[i],mode, logger);

					xmlNode.appendChild(shape);
				}
			}
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
 * @param {RepoNodeMesh} mesh - Mesh to render
 * @param {integer} subMeshID - sub mesh ID to render
 * @param {string} mode - Type of X3D being rendered
 *******************************************************************************/
function X3D_AddToShape(xmlDoc, shape, dbInterface, account, project, mesh, subMeshID, mode, logger) {
	var meshId = mesh['id'];
	var mat = getChild(mesh, 'material')

	logger.logDebug('Loading mesh ' + meshId);

	var bbox = repoNodeMesh.extractBoundingBox(mesh);

	switch (mode) {
		case "x3d":
			//shape.setAttribute('bboxCenter', bbox.center.join(' '));
			//shape.setAttribute('bboxSize', bbox.size.join(' '));

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

		case "mp":
		case "src":
			//shape.setAttribute('bboxCenter', bbox.center.join(' '));
			//shape.setAttribute('bboxSize', bbox.size.join(' '));

			var externalGeometry = xmlDoc.createElement('ExternalGeometry');

			//externalGeometry.setAttribute('solid', 'true');

			var suffix = "";

			if (subMeshID) {
				suffix += "#" + subMeshID
			}

			if ('children' in mat) {
				var tex_id = mat['children'][0]['id'];
				suffix += "?tex_uuid=" + tex_id;
			}

			externalGeometry.setAttribute('url', config.api_server.url + '/' + account + '/' + project + '/' + meshId + '.src' + suffix);

			shape.appendChild(externalGeometry);
			break;
		case "bin":
		    //shape.setAttribute('bboxCenter', bbox.center.join(' '));
			//shape.setAttribute('bboxSize', bbox.size.join(' '));

			var binaryGeometry = xmlDoc.createElement('binaryGeometry');

			binaryGeometry.setAttribute('normal', config.api_server.url + '/' + account + '/' + project + '/' + meshId + '.bin?mode=normals');

			if ('children' in mat) {
				binaryGeometry.setAttribute('texCoord', config.api_server.url + '/' + account + '/' + project + '/' + meshId + '.bin?mode=texcoords');
			}

			binaryGeometry.setAttribute('index', config.api_server.url + '/' + account + '/' + project + '/' + meshId + '.bin?mode=indices');
			binaryGeometry.setAttribute('coord', config.api_server.url + '/' + account + '/' + project + '/' + meshId + '.bin?mode=coords');
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

						popGeometryLevel.setAttribute('src', config.api_server.url + '/' + account + '/' + project + '/' + meshId + '.pbf?level=' + lvl);
						popGeometryLevel.setAttribute('numIndices', cacheMesh[lvl].numIdx);
						popGeometryLevel.setAttribute('vertexDataBufferOffset', cacheMesh[lvl].numVertices);

						popGeometryLevel.textContent = ' ';
						popGeometry.appendChild(popGeometryLevel);
					}

					shape.appendChild(popGeometry);

					//shape.setAttribute('bboxCenter', bbox.center.join(' '));
					//shape.setAttribute('bboxSize', bbox.size.join(' '));
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
	pLight.setAttribute('intensity', '0.5');
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
 * @param {xmlDom} xmlDoc - The XML document to create the viewpoint
 * @param {Object} root - The root group element
 * @param {String} account - contains the account name
 * @param {String} project - contains the project name
 * @param {JSON} bbox - Bounding used to compute the position of the viewpoint
 *******************************************************************************/
function X3D_AddViewpoint(xmlDoc, root, account, project, bbox)
{
	var vpos = [0,0,0];

	vpos[0] = bbox.center[0];
	vpos[1] = bbox.center[1];
	vpos[2] = bbox.center[2];

	var max_dim = Math.max(bbox.size[0], bbox.size[1]) * 0.5;

	var fov = 40 * (Math.PI / 180); // Field of view in radians (40 degrees)

	// Move back in the z direction such that the model takes
	// up half the center of the screen.
	vpos[2] += bbox.size[2] * 0.5 + max_dim / Math.tan(0.5 * fov);

	var vpoint = xmlDoc.createElement('Viewpoint');
	vpoint.setAttribute('id', account + '_' + project + '_' + 'origin');
	vpoint.setAttribute('position', vpos.join(' '));
	vpoint.setAttribute('centerOfRotation', bbox.center.join(' '));

	vpoint.setAttribute('orientation', '0 0 -1 0');
	vpoint.setAttribute('fieldOfView', fov);
	vpoint.textContent = ' ';

	root.appendChild(vpoint);
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
function render(dbInterface, account, project, subFormat, branch, revision, callback) {
	var full = (subFormat == "x3d");

	dbInterface.getScene(account, project, branch, revision, full, function(err, doc) {
		if(err.value) return callback(err);

		var xmlDoc = X3D_Header();

		if (!doc.mRootNode)
		{
			return callback(responseCodes.ROOT_NODE_NOT_FOUND);
		}

		var sceneRoot	= X3D_CreateScene(xmlDoc, doc.mRootNode);

		// Hack for the demo, generate objects server side
		json_objs = [];

		var sceneBBoxMin = [];
		var sceneBBoxMax = [];

		var dummyRoot = { children: [doc.mRootNode] };

		var mat = mathjs.eye(4);
		X3D_AddChildren(xmlDoc, sceneRoot.root, dummyRoot, mat, dbInterface, account, project, subFormat, dbInterface.logger);

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

		var bbox = repoNodeMesh.extractBoundingBox(doc.mRootNode);

		//X3D_AddGroundPlane(xmlDoc, bbox);
		X3D_AddViewpoint(xmlDoc, sceneRoot.scene, account, project, bbox);
		//X3D_AddLights(xmlDoc, bbox);

		return callback(responseCodes.OK, new xmlSerial().serializeToString(xmlDoc));
	});
};

exports.route = function(router)
{
	router.get('x3d', '/:account/:project/revision/:rid', function(req, res, params, err_callback)
	{
        dbInterface(req[C.REQ_REPO].logger).cacheFunction(params.account, params.project, req.url, req.params[C.REPO_REST_API_FORMAT].toLowerCase(), function (callback) {
            render(dbInterface(req[C.REQ_REPO].logger), params.account, params.project, params.subformat, null, params.rid, err_callback);
        }, err_callback);
	});

	router.get('x3d', '/:account/:project/revision/:branch/head', function(req, res, params, err_callback)
	{
        //find out what's the rid of head and try to fetch that from gridFS
        var rid = dbInterface(req[C.REQ_REPO].logger).getProjectBranchHeadRid(params.account, params.project, params.branch, function (rid) {
            var gridfsURL = "/" + params.account + "/" + params.project + "/revision/" + rid;
            dbInterface(req[C.REQ_REPO].logger).cacheFunction(params.account, params.project, gridfsURL, req.params[C.REPO_REST_API_FORMAT].toLowerCase(), function (callback) {
                render(dbInterface(req[C.REQ_REPO].logger), params.account, params.project, params.subformat, params.branch, null, err_callback);
            }, err_callback);

        } , err_callback);

	});

	router.get('x3d', '/:account/:project/revision/:rid/:sid', function(req, res, params, err_callback)
	{
        var gridfsURL = req.url.slice(0, str.length - 5);
        dbInterface(req[C.REQ_REPO].logger).cacheFunction(params.account, params.project, gridfsURL, req.params[C.REPO_REST_API_FORMAT].toLowerCase(), function (callback) {
            render(dbInterface(req[C.REQ_REPO].logger), params.account, params.project, params.subformat, null, params.rid, err_callback);
        }, err_callback);
	});

	router.get('x3d', '/:account/:project/revision/:branch/head/:sid', function(req, res, params, err_callback)
	{
        //find out what's the rid of head and try to fetch that from gridFS
        var rid = dbInterface(req[C.REQ_REPO].logger).getProjectBranchHeadRid(params.account, paramx.project, params.branch, function (rid) {
            var gridfsURL = "/" + params.account + "/" + params.project + "/revision/" + rid;
            dbInterface(req[C.REQ_REPO].logger).cacheFunction(params.account, params.project, gridfsURL, req.params[C.REPO_REST_API_FORMAT].toLowerCase(), function (callback) {
                render(dbInterface(req[C.REQ_REPO].logger), params.account, params.project, params.subformat, params.branch, null, err_callback);
            }, err_callback);

        } , err_callback);
	});

	router.get('x3d', '/:account/:project/:uid', function(req, res, params, err_callback)
	{
		if (params.subformat == "mpc")
		{
			var projection = {};
			projection[C.REPO_NODE_LABEL_COMBINED_MAP] = 1;
			projection[C.REPO_NODE_LABEL_BOUNDING_BOX] = 1;

			var subMeshIDX       = 0;
			var runningVertTotal = 0;
			var runningFaceTotal = 0;

			// TODO: Only needs the shell not the whole thing
			dbInterface(req[C.REQ_REPO].logger).cacheFunction(params.account, params.project, req.url, req.params[C.REPO_REST_API_FORMAT].toLowerCase(), function(callback) {
				dbInterface(req[C.REQ_REPO].logger).getObject(params.account, params.project, params.uid, null, null, false, projection, function(err, type, uid, fromStash, objs)
				{
					if (err.value) {
						return callback(err);
					}

					var xmlDoc      = X3D_Header();
					var sceneRoot	= X3D_CreateScene(xmlDoc);

					var mesh = objs.meshes[params.uid];
					var maxSubMeshIDX = 0;

					// First sort the combined map in order of vertex ID
					mesh[C.REPO_NODE_LABEL_COMBINED_MAP].sort(repoNodeMesh.mergeMapSort);

					var subMeshBBoxes = [];
					var bbox = [[],[]];

					for(var i = 0; i < mesh[C.REPO_NODE_LABEL_COMBINED_MAP].length; i++)
					{
						var currentMesh      = mesh[C.REPO_NODE_LABEL_COMBINED_MAP][i];

						var currentMeshVFrom = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM];
						var currentMeshVTo   = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO];
						var currentMeshBBox  = currentMesh[C.REPO_NODE_LABEL_BOUNDING_BOX];

						var currentMeshNumVertices = currentMeshVTo - currentMeshVFrom;

						var numAddedMeshes = 0;

						if (currentMeshNumVertices > C.SRC_VERTEX_LIMIT) {
							// Cut the previous off short
							if (bbox[0].length) {
								maxSubMeshIDX += 1;
								subMeshBBoxes.push(bbox);
							}

							numAddedMeshes = Math.ceil(currentMeshNumVertices / C.SRC_VERTEX_LIMIT)
							runningVertTotal = 0;
							bbox = [[],[]];
						} else {
							runningVertTotal += currentMeshNumVertices;
							numAddedMeshes = 1;
						}

						for(var v_idx = 0; v_idx < 3; v_idx++)
						{
							if (v_idx >= bbox[0].length)
							{
								bbox[0][v_idx] = currentMeshBBox[0][v_idx];
								bbox[1][v_idx] = currentMeshBBox[1][v_idx];
							} else {
								if (bbox[0][v_idx] > currentMeshBBox[0][v_idx]) {
									bbox[0][v_idx] = currentMeshBBox[0][v_idx];
								}

								if (bbox[1][v_idx] < currentMeshBBox[1][v_idx]) {
									bbox[1][v_idx] = currentMeshBBox[1][v_idx];
								}
							}
						}

						if ((runningVertTotal > C.SRC_VERTEX_LIMIT) || (currentMeshNumVertices > C.SRC_VERTEX_LIMIT)) {
							runningVertTotal = currentMeshNumVertices;
							maxSubMeshIDX   += numAddedMeshes;

							for(var j = 0; j < numAddedMeshes; j++)
							{
								subMeshBBoxes.push(bbox);
							}

							bbox = [[], []];
						}
					}

					// Cut the previous off short
					if (bbox[0].length) {
						maxSubMeshIDX += 1;
						subMeshBBoxes.push(bbox);
					}

					// Loop through all IDs up to and including the maxSubMeshIDX
					for(var subMeshIDX = 0; subMeshIDX <= maxSubMeshIDX; subMeshIDX++)
					{
						var subMeshName = mesh["id"] + "_" + subMeshIDX;

						var shape = xmlDoc.createElement('Shape');
						shape.setAttribute('DEF', subMeshName);

						var fakeMesh = {};
						fakeMesh[C.REPO_NODE_LABEL_BOUNDING_BOX] = subMeshBBoxes[subMeshIDX];
						var bbox = repoNodeMesh.extractBoundingBox(fakeMesh);

						shape.setAttribute('bboxCenter', bbox.center);
						shape.setAttribute('bboxSize', bbox.size);

						var app = xmlDoc.createElement('Appearance');
						var mat = xmlDoc.createElement('Material');
						mat.textContent = ' ';
						app.appendChild(mat);
						shape.appendChild(app);

						var eg  = xmlDoc.createElement('ExternalGeometry');
						eg.setAttribute('url', config.api_server.url + '/' + params.account + '/' + params.project + '/' + params.uid + '.src.mpc#' + subMeshName);
						eg.textContent = ' ';
						shape.appendChild(eg);

						sceneRoot.root.appendChild(shape);
					}

					return callback(responseCodes.OK, new xmlSerial().serializeToString(xmlDoc));
				});
			}, err_callback);
		} else {
			return err_callback(responseCodes.FORMAT_NOT_SUPPORTED);
		}
	});
}

