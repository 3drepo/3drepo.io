var express = require('express');
var router = express.Router({mergeParams: true});

var LatLon = require('geodesy').LatLonEllipsoidal;
var OsGridRef = require('geodesy').OsGridRef;
var generateMeshes = require('../libs/generateMeshes');
var generateglTF = require('../libs/generateglTF');
var config = require('../config.js');

// wrapper for os get apis
var OSGet = require('../libs/OSGet')(config.os);

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

	let acceptedClassCode = ['CE', 'C', 'R']; //commerial, education and residential

	//color scheme
	let materialMapping = {
		'C': 'Effect-Blue',
		'CE': 'Effect-Red',
		'R': 'Effect-Green'
	};

	var methodNames = {
		'RADIUS': 'radius',
		'BBOX': 'bbox'
	};

	var method = req.query.method;

	var lat;
	var lon;
	var radius;
	var lowerLeftLat;
	var lowerLeftLon;
	var draw;

	draw = Boolean(parseInt(req.query.draw));

	if(method === methodNames.RADIUS){

		radius = parseFloat(req.query.radius);
		lat = parseFloat(req.query.lat);
		lon = parseFloat(req.query.lon);

	} else if (method === methodNames.BBOX) {

		lat = parseFloat(req.query.upperRightLat);
		lon = parseFloat(req.query.upperRightLon);
		lowerLeftLat = parseFloat(req.query.lowerLeftLat);
		lowerLeftLon = parseFloat(req.query.lowerLeftLon);

	} else {
		return res.status(400).json({ message: 'method must be either radius or bbox'});
	}


	var latlon = new LatLon(lat, lon);
	var grid = OsGridRef.latLonToOsGrid(latlon);
	var lowerLeftGrid;

	if (method === 'bbox') {
		lowerLeftGrid = OsGridRef.latLonToOsGrid(new LatLon(lowerLeftLat, lowerLeftLon));
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

	} else if (method === methodNames.BBOX) {

		getBuildings = params => {
			return OSGet.bbox(extendObject({
				bbox: `${grid.easting},${grid.northing},${lowerLeftGrid.easting},${lowerLeftGrid.northing}`,
			}, params));
		};

	}

	getBuildings().then(json => {

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

		let found;

		buildings.sort((a, b) => {
			
			a.DPA.classCode = a.DPA.CLASSIFICATION_CODE.substring(0, 2);
			b.DPA.classCode = b.DPA.CLASSIFICATION_CODE.substring(0, 2);

			found = false;
			acceptedClassCode.forEach(code => {

				if(!found && a.DPA.classCode.startsWith(code)){
					found = true;
					a.DPA.classCode = code;
				}
			});

			if(!found){
				a.DPA.classCode = '';
			}

			found = false;
			acceptedClassCode.forEach(code => {

				if(!found && b.DPA.classCode.startsWith(code)){
					found = true;
					b.DPA.classCode = code;
				}
			});

			if(!found){
				b.DPA.classCode = '';
			}

			if (a.DPA.classCode > b.DPA.classCode){
				return 1;
			} else if (a.DPA.classCode < b.DPA.classCode){
				return -1;
			} else {
				return 0;
			}
		});

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
						dimension.classCode = building.classCode;
						return Promise.resolve(dimension);
					}));
				}

				cleanedBuildingCount++;

			}
			
		});

		console.log('Building count (cleaned)', cleanedBuildingCount);
		
		if(draw){
			console.log('draw');
			return Promise.all(promises);
		} else {
			return Promise.reject({ message: 'Please put draw=1 in query string if you wish to generate glTF'});
		}


	}).then(dimensions => {
		
		let heightlessBuildingCount = 0;

		let refPoint = [
			dimensions[0].results[0].geometry.coordinates[0][0][0],
			dimensions[0].results[0].geometry.coordinates[0][0][1]
		];

		console.log('refPoint', refPoint);

		// let meshes = [];
		let meshesByGroup = {};

		dimensions.forEach(dimension => {

			let classCode = dimension.classCode;
			//let uri = dimension.header.uri;
			dimension = dimension.results[0];
			//console.log(dimension.geometry.coordinates)
			//console.log('offset: ' + vCountOffset);

			if (!dimension.relativeHeightToMax){
				heightlessBuildingCount++;
				//dimension.relativeHeightToMax = 1;
			} else {
				if (!meshesByGroup[classCode]){
					meshesByGroup[classCode] = [];
				}

				meshesByGroup[classCode] = meshesByGroup[classCode].concat(
					generateMeshes(
						dimension.geometry.coordinates, 
						dimension.relativeHeightToMax, 
						refPoint
					)
				);
			}


		});

		//console.log(meshesArray);
		console.log('Heightless building count', heightlessBuildingCount);

		let glTF = generateglTF(meshesByGroup, 'buildings', materialMapping);

		if(format === 'bin') {
			res.status(200).send(glTF.buffer);
		} else {
			res.status(200).json(glTF.json);
		}
		

	}).catch(err => {
		console.error(err);
		if(err.message){
			res.status(500).json({ message: err.message});
		} else {
			res.status(500).send(err);
		}
		
	});

}

router.get('/buildings.gltf', function(req, res, next){
	genglX('gltf', req, res, next);
});

router.get('/buildings.bin', function(req, res, next){
	genglX('bin', req, res, next);
});

module.exports = router;