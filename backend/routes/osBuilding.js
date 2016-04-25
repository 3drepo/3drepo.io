var express = require('express');
var router = express.Router({mergeParams: true});

var LatLon = require('geodesy').LatLonEllipsoidal;
var OsGridRef = require('geodesy').OsGridRef;
var generateMeshes = require('../libs/generateMeshes');
var generateglTF = require('../libs/generateglTF');
var config = require('../config.js');
var stash = require('../models/helper/stash');
var C = require('../constants');
var middlewares = require("./middlewares");

// wrapper for os get apis
var OSGet = require('../libs/OSGet')(config.os);

router.get('/buildings.gltf', function(req, res, next){
	genglX('gltf', req, res, next);
});

router.get('/buildings.bin', function(req, res, next){
	genglX('bin', req, res, next);
});

router.get('/map-images/:style/:z/:x/:y.png', getMapTiles);

router.get('/building-meta/:uprn', getUPRN);

//TO-DO: dirty quick fix to be deleted later
router.get('/:shader.glsl', function(req, res){ 
	//console.log(__dirname);
	res.sendFile(require('path').resolve(__dirname + '../../../public/shader/gltfStockShaders/' + req.params.shader + '.glsl'));
});

function extendObject(a, b){
	
	if (b) {
		Object.keys(b).forEach(key => {
			a[key] = b[key];
		});
	}

	return a;
}


function genglX(format, req, res){
	'use strict';
	//return res.status(404).send('tmp no avail');
	//console.log(req);

	let acceptedClassCodes = ['CE', 'C', 'R']; //commerial, education and residential
	let convertClassCode = function(classCode){
		
		for(let i=0; i<acceptedClassCodes.length; i++){
			if(classCode.startsWith(acceptedClassCodes[i])){
				return acceptedClassCodes[i];
			}
		}

		return classCode;
	};

	//color scheme
	let materialMapping = {
		'C': 'Effect-Blue',
		'CE': 'Effect-Red',
		'R': 'Effect-Green'
	};

	var methodNames = {
		'RADIUS': 'radius',
		'BBOX': 'bbox',
		'OSGRID': 'osgrid'
	};

	//TO-DO: hard coded account for stashing 3d building grids
	let dbCol =  {account: 'ordnancesurvey', project: 'properties_dimensions', logger: req[C.REQ_REPO].logger};

	var method = req.query.method;

	let gltfUrl;
	let binUrl;
	
	if(format === 'gltf'){
		gltfUrl = `/${dbCol.account}/${dbCol.project}${req.url}`;
		binUrl  = gltfUrl.replace('gltf', 'bin');

	} else {
		binUrl = `/${dbCol.account}/${dbCol.project}${req.url}`;
		gltfUrl  = binUrl.replace('bin', 'gltf');
	}

	var lat;
	var lon;
	var radius;
	var lowerLeftLat;
	var lowerLeftLon;
	var draw;
	var grid;
	var lowerLeftGrid;

	draw = Boolean(parseInt(req.query.draw));

	if(method === methodNames.RADIUS){

		radius = parseFloat(req.query.radius);
		lat = parseFloat(req.query.lat);
		lon = parseFloat(req.query.lon);
		grid = OsGridRef.latLonToOsGrid(new LatLon(lat, lon));

	} else if (method === methodNames.BBOX) {

		lat = parseFloat(req.query.upperRightLat);
		lon = parseFloat(req.query.upperRightLon);
		lowerLeftLat = parseFloat(req.query.lowerLeftLat);
		lowerLeftLon = parseFloat(req.query.lowerLeftLon);
		grid = OsGridRef.latLonToOsGrid(new LatLon(lat, lon));
		lowerLeftGrid = OsGridRef.latLonToOsGrid(new LatLon(lowerLeftLat, lowerLeftLon));
		//console.log(lowerLeftGrid, grid);

	} else if (method === methodNames.OSGRID) {

		let osgridref = req.query.osgridref;
		let osgrid = OsGridRef.parse(osgridref);

		let refLenToGridScale =  {
			10:{ 'length': 10, size: 9 },
			8: { 'length': 8, size: 99 },
			6: { 'length': 6, size: 999 },
		};

		let size = refLenToGridScale[osgridref.length].size;

		grid = { easting: osgrid.easting + size, northing: osgrid.northing + size };
		lowerLeftGrid = { easting: osgrid.easting , northing: osgrid.northing};

		//console.log(lowerLeftGrid, grid);
	} else {
		return res.status(400).json({ message: 'method must be either radius, bbox or osgrid'});
	}


	let buildings;
	// Get list of buildings
	let getBuildings;

	if(method === methodNames.RADIUS){

		getBuildings = params => {
			return OSGet.radius(extendObject({
				point: `${grid.easting},${grid.northing}`,
				radius: radius
			}, params));
		};

	} else if (method === methodNames.BBOX || method === methodNames.OSGRID) {

		getBuildings = params => {
			return OSGet.bbox(extendObject({
				bbox: `${lowerLeftGrid.easting},${lowerLeftGrid.northing},${grid.easting},${grid.northing}`,
			}, params));
		};

	}

	function getBuildingsAndGenerate(){
		return getBuildings().then(json => {

			// get total numbers of building and do subsequent API calls. 
			// max items returned from API are 100 each
			let total = json.header.totalresults;
			console.log('total buildings (dup)', total);

			let maxresults = json.header.maxresults; // default value returned should be 100 unless specified in params

			buildings = json.results;
			let callCount = Math.floor(total / maxresults);
			let callPromises = [];

			console.log('offset call count', callCount);

			for (let i=1; i <= callCount; i++){
				
				if (total !== i * maxresults){
					//let offset = maxresults * callCount;

					callPromises.push(getBuildings({
					 	offset: i * maxresults
					}));
				}
			}
			return Promise.all(callPromises);

		}).then(results => {
			
			let lastCoors;
			
			results.forEach(result => {
				buildings = buildings.concat(result.results);
			});

			buildings = buildings || [];

			console.log('total buildings (dup, xchecking)', buildings.length);

			let promises = [];
			let cleanedBuildingCount = 0;

			//let found;

			buildings.forEach(building => {

				building = building.DPA;

				if(lastCoors && 
					Math.abs(lastCoors.x - building.X_COORDINATE) < Number.EPSILON &&
					Math.abs(lastCoors.y - building.Y_COORDINATE) < Number.EPSILON){
					// skip generate geometry for duplicated building
					//console.log('same building');

				} else {

					//console.log(building.UPRN);
					lastCoors = { x: building.X_COORDINATE, y: building.Y_COORDINATE };
					// get building dimension
					if(draw){
						promises.push(OSGet.dimensions({ uprn: building.UPRN }).then(dimension => {

							console.log('classCode', building.CLASSIFICATION_CODE);
							dimension.classCode = convertClassCode(building.CLASSIFICATION_CODE);
							dimension.uprn = building.UPRN;

							return Promise.resolve(dimension);

						}).catch(err => {
							console.log(err);
							return Promise.resolve({ results: [{}]});
						}));
					}

					cleanedBuildingCount++;

				}
				
			});

			console.log('Building count (cleaned)', cleanedBuildingCount);
			
			if(draw){
				//console.log('draw');
				return Promise.all(promises);
			} else {
				return Promise.reject({ message: 'Please put draw=1 in query string if you wish to generate glTF'});
			}


		}).then(dimensions => {
			
			let heightlessBuildingCount = 0;
			let refPoint;

			
			if (method === methodNames.RADIUS){
				// use center point as ref point
				refPoint = [grid.easting, grid.northing];
			} else {
				// use south east point as ref point (lower left)
				refPoint = [lowerLeftGrid.easting, lowerLeftGrid.northing];
			}

			console.log('refPoint', refPoint);

			// let meshes = [];
			//let meshesByGroup = {};
			let meshesByBuilding = {};

			dimensions.forEach(dimension => {

				let classCode = dimension.classCode;
				let uprn = dimension.uprn;

				dimension = dimension.results[0];

				if (!dimension.relativeHeightToMax){
					heightlessBuildingCount++;

				} else {

					meshesByBuilding[uprn] = {
						meshes: generateMeshes(
							dimension.geometry.coordinates, 
							dimension.relativeHeightToMax, 
							refPoint
						),
						classCode: classCode
					};
				}


			});

			//console.log(meshesArray);
			console.log('Heightless building count', heightlessBuildingCount);


			let glTF = generateglTF(meshesByBuilding, `${req.url.replace('.gltf', '.bin').substr(1)}`, materialMapping);

			stash.saveStashByFilename(dbCol, 'gltf', gltfUrl, new Buffer(JSON.stringify(glTF.json)));
			//bin file should also in .stash.gltf but with .bin as filename extension
			stash.saveStashByFilename(dbCol, 'gltf', binUrl, glTF.buffer);
			

			return Promise.resolve(glTF);

		});
	}

	Promise.all([
		stash.findStashByFilename(dbCol, 'gltf', gltfUrl),
		stash.findStashByFilename(dbCol, 'gltf', binUrl)
	]).then(buffers => {

		let json = buffers[0];
		let bin = buffers[1];

		if(json && bin){
			console.log('stash found');
			return Promise.resolve({ json: json, buffer: bin});
		} else {
			console.log('stash not found');

			if(true){
				return Promise.reject({ message: 'No stash and we are not going to bother os api server today so no data for you, sorry.'});
			} else {
				return getBuildingsAndGenerate();
			}
		}

	}).then(glTF => {

		if(format === 'bin') {
			res.status(200).send(glTF.buffer);
		} else {
			//json from stash is a Buffer
			if (glTF.json instanceof Buffer) {
				glTF.json = JSON.parse(glTF.json.toString());
			}
			res.status(200).json(glTF.json);
		}

	}).catch(err => {
		console.log(err.stack);
		if(err.message){
			res.status(500).json({ message: err.message});
		} else {
			res.status(500).send(err.toString());
		}
	});

}

function getMapTiles(req, res){
	'use strict';

	let x, y, z;
	x = req.params.x;
	y = req.params.y;
	z = req.params.z;

	//TO-DO: hard coded account for stashing map images
	let dbCol =  {account: 'ordnancesurvey', project: 'map_images', logger: req[C.REQ_REPO].logger};
	
	let filename = `${req.params.style}/${z}/${x}/${y}.png`;


	stash.findStashByFilename(dbCol, 'png', filename).then( image => {
		
		if(image) {

			req[C.REQ_REPO].logger.logDebug('Map tile images found from stash');
			return Promise.resolve(image);

		} else {

			req[C.REQ_REPO].logger.logDebug('Map tile images NOT found from stash, getting from ordnance survey');
			return OSGet.map({
				tileMatrixSet: 'EPSG:3857', 
				layer: `${req.params.style} 3857`, 
				z, x, y
			}).then(image => {
				stash.saveStashByFilename(dbCol, 'png', filename, image);
				return Promise.resolve(image);
			});
		}

	}).then(image => {


		res.writeHead(200, {'Content-Type': 'image/png' });
		res.write(image);
		res.end();

	}).catch(err => {

		console.error(err.stack);
		if(err.message){
			res.status(500).json({ message: err.message});
		} else {
			res.status(500).send(err);
		}
		
	});
}

function getUPRN(req, res){
	'use strict';

	OSGet.uprn({ uprn: req.params.uprn}).then(r => {
		if(r.header.totalresults <= 0){
			res.status(404).json({ message: `Building with uprn ${req.params.uprn} not found`});
		} else {
			res.status(200).json(r.results[0].DPA);
		}

	}).catch( err => {
		if(err.message){
			res.status(500).json({ message: err.message});
		} else {
			res.status(500).send(err);
		}
	});
}

module.exports = router;