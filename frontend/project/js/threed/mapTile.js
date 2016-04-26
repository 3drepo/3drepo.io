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

var MapTile = {};

(function() {
	"use strict";

	MapTile = function(viewer, eventCallback, options){
		this.viewer = viewer;
		this.options = options;
		this.eventCallback = eventCallback;
	}

	MapTile.prototype.initCallback = function(viewer){
		var self = this;
		viewer.onMouseUp(function(){
			self.appendMapTileByViewPoint();
		});
	};

	MapTile.prototype.updateSettings = function(settings){
		
		var self = this;

		if(settings && settings.hasOwnProperty("mapTile")){
			// set origin BNG
			this.settings = settings;
			this.originBNG = OsGridRef.latLonToOsGrid(new LatLon(this.settings.mapTile.lat, this.settings.mapTile.lon));
			this.meterPerPixel = 1;
			this.mapSizes = [];
		}

		var options = this.options;

		if(options && options.lat && options.lon && options.y){
			setTimeout(function(){
				self.translateTo(options);
			}, 3000);
		}

	}

	MapTile.prototype.translateTo = function(options){

		if(!this.originBNG){
			return console.log('Translation aborted due to no origin lat,lon defined');
		}

		var lat = options.lat;
		var lon = options.lon;
		var height = options.y;
		var view = options.view || [0.00028736474304142756,-0.9987502603949663,-0.0499783431347178];
		var up = options.up || [0.005742504650018704,0.04997916927067853,-0.9987337514469797]; 

		if (!height || height < 0){
			height = 500;
		}


		this.viewer.setCamera([0, height, 0], view, up);
		// lat,lon to mapImage XY system
		var mapImagePosInfo = this._getMapImagePosInfo();


		//get the xy number of the map tile image contains the target
		var mapXY = this._getSlippyTileLayerPoints(lat, lon, mapImagePosInfo.zoomLevel);


		var nx = mapXY.x - mapImagePosInfo.slippyPoints.x
		var ny = mapXY.y - mapImagePosInfo.slippyPoints.y

		//cal offset of the target point to the nearest map tile image
		var osTargetPoint = OsGridRef.latLonToOsGrid(new LatLon(lat, lon));
		var mapImageCentreLatLon = new LatLon(this._tile2lat(mapXY.y, mapImagePosInfo.zoomLevel) , this._tile2long(mapXY.x, mapImagePosInfo.zoomLevel) );
		var osImagePoint =  OsGridRef.latLonToOsGrid(mapImageCentreLatLon);

		var mapSize = this.getMapSize(ny);

		var dx = osTargetPoint.easting * this.meterPerPixel - (osImagePoint.easting  * this.meterPerPixel + mapSize / 2);
		var dy = (osImagePoint.northing * this.meterPerPixel - mapSize / 2) - osTargetPoint.northing * this.meterPerPixel;

		this.viewer.setCamera(
			[
				this.getSumSizeForXRow(nx, ny) + mapImagePosInfo.offsetX + dx, height ,
				this.getSumSize(ny) + mapImagePosInfo.offsetY + dy
			],
			view,
			up
		);
		
		this.appendMapTileByViewPoint();

	};


	MapTile.prototype.getMapSizeByYCoor = function(yCoor){
		return this.getMapSize(this.findMapTileNoByPos(yCoor));
	}

	MapTile.prototype.getMapSize = function(n){
		var nextN = n < 0 ? n - 1 : n + 1;
		return Math.abs(this.getSumSize(nextN) - this.getSumSize(n)); 
	}

	var scaleMapImages = false;

	if(scaleMapImages){

		MapTile.prototype.getSumSizeForXRow = function(n, y){
			var mapImagePosInfo = this._getMapImagePosInfo();
			var mapPerPxZoomLevel = mapImagePosInfo.mPerPxTable[mapImagePosInfo.zoomLevel];
			var lat = this._tile2lat(mapImagePosInfo.slippyPoints.y + y, mapImagePosInfo.zoomLevel);
			return mapPerPxZoomLevel * Math.cos(this._degToRad(lat)) * 256 * n * this.meterPerPixel;
		}

		MapTile.prototype.getSumSize = function(n){

			var mapImagePosInfo = this._getMapImagePosInfo();
		 	var mapPerPxZoomLevel = mapImagePosInfo.mPerPxTable[mapImagePosInfo.zoomLevel];
			if(n === 0){

				return 0;

			} else if (n === 1 || n === -1) {

				var lat = this._tile2lat(mapImagePosInfo.slippyPoints.y, mapImagePosInfo.zoomLevel);
				this.mapSizes[0] = this.mapSizes[0] || mapPerPxZoomLevel * Math.cos(this._degToRad(lat)) * 256 * this.meterPerPixel;
				return this.mapSizes[0] * n;

			} else {

				var nextN;
				n >= 0 ? nextN = n - 1 : nextN = n + 1;

				if(!this.mapSizes[nextN]){

					var lat = this._tile2lat(mapImagePosInfo.slippyPoints.y + nextN, mapImagePosInfo.zoomLevel);
					this.mapSizes[nextN] = mapPerPxZoomLevel * Math.cos(this._degToRad(lat)) * 256  * this.meterPerPixel;
				}

				return (n >= 0 ? 1 : -1) * this.mapSizes[nextN] + this.getSumSize(nextN);

			}

		}

		MapTile.prototype.findMapTileNoByPos = function(pos){

			var n;

			var mapSize_0 = this.getSumSize(1) - this.getSumSize(0);
			var mapSize_1 = this.getSumSize(2) - this.getSumSize(1);

			if(mapSize_1 > mapSize_0 && pos > 0){
				//+ve direction
				var n = 0;
				while(true){
					if(this.getSumSize(n) <= pos && pos < this.getSumSize(n+1)){
						break;
					} 
					n++;
				}
			} else {
				var n = 0;
				while(true){
					if(this.getSumSize(n) <= pos && pos < this.getSumSize(n+1)){
						break;
					} 
					n--;
				}
			}

			return n;
		}

	} else {

		MapTile.prototype.getSumSize= function(n){
			var mapImagePosInfo = this._getMapImagePosInfo();
			var mapPerPxZoomLevel = mapImagePosInfo.mPerPxTable[mapImagePosInfo.zoomLevel];
			var lat = this._tile2lat(mapImagePosInfo.slippyPoints.y, mapImagePosInfo.zoomLevel);
			return mapPerPxZoomLevel * Math.cos(this._degToRad(lat)) * 256 * n * this.meterPerPixel;
		}



		MapTile.prototype.findMapTileNoByPos = function(pos){
			return Math.floor(pos / this.getSumSize(1));
		}


		MapTile.prototype.getSumSizeForXRow  = MapTile.prototype.getSumSize;
	}



		MapTile.prototype._clearMapImagePosInfo = function(){
			this.mapPosInfo = null;
		}

		MapTile.prototype._getMapImagePosInfo = function(){

			// http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
			// set the size of a 256 map image tile. 1px = 1m
			
			if (!this.mapPosInfo){

				var height = this.getLenFromCamToCentre(
					this.getViewAreaOnZPlane(),
					this.viewer.getCurrentViewpointInfo().position
				);

				var zoomLevel = this.getZoomLevel(height);

				var mPerPxTable = {
					0:	156543.03,
					1:	78271.52,
					2:	39135.76,
					3:	19567.88,
					4:	9783.94	,
					5:	4891.97	,
					6:	2445.98,
					7:	1222.99	,
					8:	611.50	,
					9:	305.75	,
					10:	152.87,
					11:	76.437,
					12:	38.219,
					13:	19.109,
					14:	9.5546,
					15:	4.7773,
					16:	2.3887,
					17:	1.1943,
					18:	0.5972		
				};

				var slippyPoints = this._getSlippyTileLayerPoints(this.settings.mapTile.lat, this.settings.mapTile.lon, zoomLevel);

				var x = slippyPoints.x;
				var y = slippyPoints.y;

				var mapImgsize = mPerPxTable[zoomLevel] * Math.cos(this._degToRad(this._tile2lat(y, zoomLevel))) * 256 * this.meterPerPixel;
				var osGridRef = OsGridRef.latLonToOsGrid(new LatLon(this._tile2lat(y, zoomLevel), this._tile2long(x ,zoomLevel)));

				//console.log('map images osgridref', osGridRef);
				var offsetX = (osGridRef.easting - this.originBNG.easting) * this.meterPerPixel + mapImgsize / 2;
				var offsetY = (this.originBNG.northing - osGridRef.northing) * this.meterPerPixel + mapImgsize / 2;

				this.mapPosInfo = {
					x: x,
					y: y,
					offsetX: offsetX,
					offsetY: offsetY,
					zoomLevel: zoomLevel,
					slippyPoints: slippyPoints,
					mPerPxTable: mPerPxTable
				};
			}

			
			return this.mapPosInfo;

		}

	//secret little functions to help in-browser alignment

	MapTile.prototype._startMoveImages = function(){
		
		this._moveStep = 10;
		var self = this;

		this._moveImagesListener = function(e){
			if(e.code === 'ArrowUp'){
				self._moveMapImages(0, -self._moveStep);
			} else if(e.code === 'ArrowLeft'){
				self._moveMapImages(-self._moveStep, 0);
			} else if(e.code === 'ArrowDown'){
				self._moveMapImages(0, self._moveStep);
			} else if(e.code === 'ArrowRight'){
				self._moveMapImages(self._moveStep, 0);
			}
		};

		document.addEventListener('keyup', this._moveImagesListener);
	};

	MapTile.prototype._stopMoveImages = function(){
		document.removeEventListener('keyup', this._moveImagesListener);
	};


	MapTile.prototype._moveMapImages = function(dx, dy){

		this.sumD = this.sumD || [0, 0];
		this.imagesDoms.forEach(function(dom){
			
			var t = dom.getAttribute('translation').split(' ');
			
			t.forEach(function(number, i){
				t[i] = parseFloat(number);
			});

			t[0] += dx;
			t[2] += dy;

			dom.setAttribute('translation', t.join(' '));
		});

		this.sumD[0] += dx;
		this.sumD[1] += dy;
	};

	MapTile.prototype._newOrigin = function(){

		var sumD = this.sumD;

		return OsGridRef.osGridToLatLon(
			OsGridRef(
				this.originBNG.easting - sumD[0]
				,this.originBNG.northing + sumD[1]
			)
		);
	};

	MapTile.prototype._setNewOrigin = function(){

		var sumD = this.sumD;
		this.viewer.originBNG = OsGridRef(
			this.originBNG.easting - sumD[0]
			,this.originBNG.northing + sumD[1]
		);
		this.mapPosInfo = null;
		this.sumD = [0,0];
	}

	MapTile.prototype._moveMapImagesY = function (y){

		this.viewer.imagesDoms.forEach(function(dom){
			
			var t = dom.getAttribute('translation').split(' ');
			
			t.forEach(function(number, i){
				t[i] = parseFloat(number);
			});

			t[1] = y;

			dom.setAttribute('translation', t.join(' '));
		});
	}

	MapTile.prototype._clearAllPlanes = function(){

		var self = this;
		if(this._planes){
			this._planes.forEach(function(p){
				self.viewer.getScene().removeChild(p);
			});
		}

		this._planes = [];
	}

	MapTile.prototype._appendPlane = function(p){
		this._planes = this.planes || [];
		this._planes.push(p);
		this.viewer.getScene().appendChild(p);
	}

	MapTile.prototype._drawPlaneOnZ = function(coords, color){

		var coordIndex = '';

		var center = [0, 0, 0];
		center[0] = (coords[0][0] + coords[1][0], + coords[2][0] + coords[3][0]) / 4;
		center[2] = (coords[0][2] + coords[1][2], + coords[2][2] + coords[3][2]) / 4;

		function less(a, b){
		    if (a[0] - center[0] >= 0 && b[0] - center[0] < 0)
		        return true;
		    if (a[0] - center[0] < 0 && b[0] - center[0] >= 0)
		        return false;
		    if (a[0] - center[0] == 0 && b[0] - center[0] == 0) {
		        if (a[2] - center[2] >= 0 || b[2] - center[2] >= 0)
		            return a[2] > b[2];
		        return b[2] > a[2];
		    }

		    // compute the cross product of vectors (center -> a) x (center -> b)
		    var det = (a[0] - center[0]) * (b[2] - center[2]) - (b[0] - center[0]) * (a[2] - center[2]);
		    if (det < 0)
		        return true;
		    if (det > 0)
		        return false;

		    // points a and b are on the same line from the center
		    // check which point is closer to the center
		    var d1 = (a[0] - center[0]) * (a[0] - center[0]) + (a[2] - center[2]) * (a[2] - center[2]);
		    var d2 = (b[0] - center[0]) * (b[0] - center[0]) + (b[2] - center[2]) * (b[2] - center[2]);
		    return d1 > d2;
		}

		coords.sort(less);

		for(var i=0; i < coords.length; i++){
			coordIndex += ' ' + i;
		}

		coordIndex += ' -1';

		var coordsFlatten = [];

		coords.forEach(function(coord){
			coordsFlatten = coordsFlatten.concat(coord);
		});

		var containerNode = document.createElement('div');
		containerNode.innerHTML = "" +
		"	<shape>" +
		"		<appearance>" +
		"			<material diffuseColor='" + color.join(' ') + "' transparency='0.7'></material>" +
		"		</appearance>" +
		"		<IndexedFaceSet ccw='true' colorPerVertex='false' solid='false' coordIndex='" + coordIndex + "'>" +
		"			<coordinate point='" +  coordsFlatten.join(' ') + "'></coordinate>" +
		"		</IndexedFaceSet>" +
		"	</shape>";

		return containerNode.children[0];
	};

	MapTile.prototype.appendMapImage = function(ox, oy){

		var posInfo = this._getMapImagePosInfo();

		var x = posInfo.x;
		var y = posInfo.y;
		var offsetX = posInfo.offsetX;
		var offsetY = posInfo.offsetY;

		var mapHeight = this.settings.mapTile.y ? this.settings.mapTile.y : 0;

		var size = this.getMapSize(oy);

		if (!this.addedMapImages) {
			this.addedMapImages = {};
		}

		if(!this.imagesDoms){
			this.imagesDoms = [];
		}

		if(!this.addedMapImages[ox + ',' + oy]){
			
			// console.log('ox, oy', ox, oy);
			// console.log('size', size);
			// console.log('getSumSizeForXRow', self.getSumSizeForXRow(ox, oy))
			// console.log('size form sum size', self.getSumSizeForXRow(ox, oy) / ox);

			var dom = this.createMapImageTile(size, x + ox, y + oy, [
				offsetX + this.getSumSizeForXRow(ox, oy), 
				mapHeight, 
				offsetY + this.getSumSize(oy)
			]);

			this.imagesDoms.push(dom);
			this.viewer.getScene().appendChild(dom);
			this.addedMapImages[ox + ',' + oy] = 1;

			return true;
		} else {
			return false;
		}


	};

	MapTile.prototype.removeMapImages = function(){

		var self = this;
		if(this.imagesDoms){
			this.imagesDoms.forEach(function(dom){
				self.viewer.getScene().removeChild(dom);
			});
		}
		this.imagesDoms = [];
		this.addedMapImages = {};
		this.mapSizes = [];
	}


	MapTile.prototype.getLenFromCamToCentre = function(viewAreaCoors, camera){

		var centre = this.centreOfVecs(viewAreaCoors);

		var lenToCentreVec = [
			camera[0] - centre[0],
			camera[1] - centre[1],
			camera[2] - centre[2]
		];

		var len = this._vec3Len(lenToCentreVec);

		return len;
	};

	MapTile.prototype.getZoomLevel = function(height){

		var self = this;

		var yToZoomLevel = [
			{y: 500000, zoomLevel: 7},
			{y: 300000, zoomLevel: 8},
			{y: 109000, zoomLevel: 9},
			{y: 58800, zoomLevel: 10},
			{y: 30709, zoomLevel: 11},
			{y: 16800, zoomLevel: 12},
			{y: 8000, zoomLevel: 13},
			{y: 4500, zoomLevel: 14},
			{y: 2000, zoomLevel: 15},
			{y: 1000, zoomLevel: 16},
			{y: 500, zoomLevel: 17},
			{y: 250, zoomLevel: 18},
			{y: 0, zoomLevel: 18},

		];

		yToZoomLevel.forEach(function(map){
			map.y *= self.meterPerPixel
		});

		var zoomLevel;


		for(var i=0; i < yToZoomLevel.length; i++){
			
			if(height >= yToZoomLevel[i].y){
				zoomLevel = yToZoomLevel[i].zoomLevel;
				break;
			}
		}

		return zoomLevel;

	};

	MapTile.prototype.getViewAreaOnZPlane = function(){

		var vpInfo = this.viewer.getCurrentViewpointInfo();
		var fov = vpInfo.fov;
		var camera = vpInfo.position;
		var view_dir = vpInfo.view_dir;
		var ratio = vpInfo.aspect_ratio; //(w/h)
		var up = vpInfo.up;
		var right = vpInfo.right;

		var tanHalfFOV = Math.tan(fov / 2);
		var planeOffsetX = [1, -1, 1, -1];
		var planeOffsetY = [1, 1, -1, -1];
		var viewAreaCoors = [];

		for(var i = 0; i < planeOffsetX.length; i++)
		{
			var X = planeOffsetX[i];
			var Y = planeOffsetY[i];

			var rayDirection = [];

			for (var c = 0; c < 3; c++)
			{
				rayDirection[c] = view_dir[c] + X * tanHalfFOV * right[c] + Y * (ratio / tanHalfFOV) * up[c];
			}

			var gamma = camera[1] / -rayDirection[1];

			//console.log("G: ", gamma);

			viewAreaCoors[i] = [];

			for (var c = 0; c < 3; c++)
			{
				viewAreaCoors[i][c] = camera[c] + gamma * rayDirection[c];
			}
		}

		return viewAreaCoors;
	}

	MapTile.prototype.centreOfVecs = function(vectors){
		
		var centre = [];

		vectors[0].forEach(function(value, i){
			centre[i] = 0;
		});

		vectors.forEach(function(vector){
			vector.forEach(function(value, i){
				centre[i] += value;
			});
		});

		centre.forEach(function(value, i){
			centre[i] = value / vectors.length;
		});

		return centre;
	}

	MapTile.prototype.isLookingToInf = function(viewAreaCoors){

		var farVec = [viewAreaCoors[1][0] - viewAreaCoors[0][0], viewAreaCoors[1][2] - viewAreaCoors[0][2]];
		var nearVec = [viewAreaCoors[3][0] - viewAreaCoors[2][0], viewAreaCoors[3][2] - viewAreaCoors[2][2]];

		return !(this._hasSameSign(farVec[0], nearVec[0]) && this._hasSameSign(farVec[1], nearVec[1]));

	};

	//transform centre of the view area to lat,lon
	MapTile.prototype.getLatLonOfViewArea = function(viewAreaCoors){

		//var centrePoint = this.centreOfVecs(viewAreaCoors);
		// cam pos is ok
		var centrePoint = this.viewer.getCurrentViewpointInfo().position;

		// var p = self._drawPlaneOnZ([
			
		// 	[centrePoint[0] + 10, 10, centrePoint[2] + 10],
		// 	[centrePoint[0] - 10, 10, centrePoint[2] + 10],
		// 	[centrePoint[0] - 10, 10, centrePoint[2] - 10],
		// 	[centrePoint[0] + 10, 10, centrePoint[2] - 10],
			
		// ], [1, 0, 0]);

		// self.getScene().appendChild(p);

		var mapImgPosInfo = this._getMapImagePosInfo();

		//convert centre point back to lat, long
		var mapXY = [
			this.findMapTileNoByPos(centrePoint[0]), 
			this.findMapTileNoByPos(centrePoint[2])
		];

		var imageSceneCoor = [mapImgPosInfo.offsetX + this.getSumSizeForXRow(mapXY[0], mapXY[1]), 0, mapImgPosInfo.offsetY + this.getSumSize(mapXY[1])];


		var dx = centrePoint[0] - this.getSumSizeForXRow(mapXY[0], mapXY[1]) - mapImgPosInfo.offsetX;
		var dy = centrePoint[2] - this.getSumSize(mapXY[1]) - mapImgPosInfo.offsetY;


		var mapSize = this.getMapSize(mapXY[1]);
		var osImagePoint = OsGridRef.latLonToOsGrid(new LatLon(
			this._tile2lat(mapXY[1] + mapImgPosInfo.slippyPoints.y, this.zoomLevel),
			this._tile2long(mapXY[0] + mapImgPosInfo.slippyPoints.x, this.zoomLevel)
		));

		var k = this.meterPerPixel;
		var latlon = OsGridRef.osGridToLatLon(OsGridRef(
			(dx + osImagePoint.easting * k  + mapSize / 2) / k,
			(osImagePoint.northing * k - mapSize / 2 - dy) / k
		));

		return latlon;
	}


	MapTile.prototype.osCoorToSceneCoor = function(osCoor){
		return [
			osCoor.easting - this.originBNG.easting,
			this.originBNG.northing - osCoor.northing
		];
	}
	// trigger update URL event
	MapTile.prototype.triggerUpdateURLEvent = function(lat, lon, height, view, up){

		this.eventCallback(this.viewer.EVENT.UPDATE_URL ,{
			'at': [lat, lon, height].join(','),
			'view': view,
			'up': up
		});
	};

	MapTile.prototype.rotatePloygon = function(viewAreaCoors, centre, deg){

		//clone
		viewAreaCoors = JSON.parse(JSON.stringify(viewAreaCoors));

		viewAreaCoors.forEach(function(coor){

			// move centre to origin
			coor.forEach(function(value, i){
				coor[i] = coor[i] - centre[i];
			});

			coor[0] = coor[0] * Math.cos(Math.PI) - coor[2] * Math.sin(deg);
			coor[2] = coor[0] * Math.sin(Math.PI) + coor[2] * Math.cos(deg);

			//move back
			coor.forEach(function(value, i){
				coor[i] = coor[i] + centre[i];
			});
		});

		return viewAreaCoors;

	};

	// Append building models and map tile images
	MapTile.prototype.appendMapTileByViewPoint = function(noDraw){

		console.log('appendMapTileByViewPoint', this.originBNG);

		if(!this.originBNG){
			console.log('originBNG not found');
			return;
		}

		var self = this;
		var vpInfo = this.viewer.getCurrentViewpointInfo();
		var camera = vpInfo.position;

		//console.log('camera', camera);

		var mapImgPosInfo = this._getMapImagePosInfo();

		var viewAreaCoors = this.getViewAreaOnZPlane();
		var lookingToInf = this.isLookingToInf(viewAreaCoors);

		var len = this.getLenFromCamToCentre(viewAreaCoors, camera);
		var zoomLevel = this.getZoomLevel(len);

		if(this.zoomLevel !== zoomLevel){
			this.removeMapImages();
			this._clearMapImagePosInfo();
			this.zoomLevel= zoomLevel;
		}

		// update url with current lat,lon at centre of the view area
		var viewAreaLatLon = this.getLatLonOfViewArea(viewAreaCoors);

		var view_dir = this.viewer.getCurrentViewpointInfo().view_dir;
		var up = this.viewer.getCurrentViewpointInfo().up;


		this.triggerUpdateURLEvent(
			viewAreaLatLon.lat, 
			viewAreaLatLon.lon, 
			camera[1], 
			view_dir.join(','),
			up.join(',')
		);

		// variables named according to this polygon and coordinate variables
		// c------d  <-- far
		// \      /
		//  a----b  <-- near

		var a, b, c, d;

		//self._clearAllPlanes();
		a = viewAreaCoors[3];
		b = viewAreaCoors[2];
		c = viewAreaCoors[1];
		d = viewAreaCoors[0];

		if(lookingToInf){
			//rotate 180 deg around top center of the polygon
			var rotatedViewAreaCoors = this.rotatePloygon(
				viewAreaCoors, 
				this.centreOfVecs([a,b]), 
				Math.PI
			);

			// when looking to inf ray shooting backwards, c,d position is flipped
			a = rotatedViewAreaCoors[3];
			b = rotatedViewAreaCoors[2];
			c = rotatedViewAreaCoors[0];
			d = rotatedViewAreaCoors[1];
		}


		function LenVec2D(vecA, vecB){
			return Math.sqrt(
				Math.pow(vecA[0] - vecB[0], 2) + 
				Math.pow(vecA[1] - vecB[1], 2)
			);
		}

		// get coordinate on a->c vector
		function getCoorOnAC(k){
			return [
				a[0] + k * (c[0] - a[0]),
				a[2] + k * (c[2] - a[2])
			];
		}

		// get coordinate on b->d vector
		function getCoorOnBD(k){
			return [
				b[0] + k * (d[0] - b[0]),
				b[2] + k * (d[2] - b[2])
			];
		}

		// get vecrtical coordinate, direction parallels to a->b , if ky = 0, it is euqal to get coordinate on a->b vector
		function getCoorVertical(kx, ky){

			var start, end;
			start = getCoorOnAC(ky);
			end = getCoorOnBD(ky);

			return [
				start[0] + kx *(end[0] - start[0]),
				start[1] + kx *(end[1] - start[1])
			];
		}

		//iterate every point(x,y) in view area
		function viewAreaIterate(options){

			var genStepX = options.genStepX;
			var genStepY = options.genStepY;
			var yCond = options.yCond;
			var xCond = options.xCond;
			var callback = options.callback;

			var horVecLen = LenVec2D([a[0], a[2]], [c[0], c[2]]);
			var stepY = genStepY(a, horVecLen);

			for(var ky = -stepY; ky <= 1 + stepY && yCond(); ky += stepY){

				var startCoor = getCoorVertical(0, ky);
				var endCoor = getCoorVertical(1, ky);
				var vertVecLen = LenVec2D(endCoor, startCoor);

				var stepX = genStepX(startCoor, vertVecLen);
				
				for(var kx = -stepX; kx <= 1 + stepX && xCond(); kx += stepX){
					
					var coor = getCoorVertical(kx, ky);
					callback(coor);
					stepX = genStepX(coor, vertVecLen);
				}

				stepY = genStepY(startCoor, horVecLen);
			}
		}

		var mapImagesCount = 0;
		var maxImageCount = 200;

		
		var getStep = function (coor, vecLen){
			var yCoor = coor[1];
			var imageSize = self.getMapSizeByYCoor(yCoor);
			return imageSize / vecLen / 2;
		};

		var cond = function(){
			return mapImagesCount < maxImageCount;
		};

		// append map images
		viewAreaIterate({
			genStepY: getStep,
			genStepX: getStep,
			yCond: cond,
			xCond: cond,
			callback: function(coor){
				var imageSize = self.getMapSizeByYCoor(coor[1]);

				var mapImgX = Math.floor( coor[0] / imageSize );
				var mapImgZ = Math.floor( coor[1] / imageSize );

				var appended = self.appendMapImage(mapImgX, mapImgZ);

				if(appended){
					mapImagesCount++;
				}
			}
			
		});

		//console.log(mapImagesCount);



		var tileCount = 0;
		var maxTileCount = 100;

		var genStep = function(coor, vecLen){
			var tileSize = 100 * self.meterPerPixel
			return tileSize / vecLen / 2;
		};

		cond = function(){

			return tileCount < maxTileCount;
		};
		// append 3d models
		if(!noDraw && this.shouldDraw3DBuildings(this.zoomLevel)){
			
			viewAreaIterate({
				genStepY: genStep,
				genStepX: genStep,
				yCond: cond,
				xCond: cond,
				callback: function(coor){

					var osRef = new OsGridRef(
						self.originBNG.easting + (coor[0] / self.meterPerPixel), 
						self.originBNG.northing - (coor[1] / self.meterPerPixel)
					);
					var osrefno = self._OSRefNo(osRef, 3);
					
					var appended = self.appendMapTile(osrefno);

					if(appended){
						tileCount++;
					}
				}
			});

			//console.log(tileCount);
		}

	};


	MapTile.prototype.shouldDraw3DBuildings = function(zoomLevel){
		return zoomLevel >= 17;
	};

	MapTile.prototype._hasSameSign = function(a, b){
		return a <= 0 && b <= 0 || a >=0 && b >= 0
	};

	MapTile.prototype._roundUpToTen = function(n){
		var roundUpPlace = 10;
		return Math.ceil(n / roundUpPlace) * roundUpPlace;
	}

	// TO-DO: Move helper functions to somewhere else?
	//length 1 = 1m, 2 = 10m, 3 = 100m, 4 = 1km, 5 = 10km
	MapTile.prototype._OSRefNo = function(osRef, length){

		if (length < 1 || length > 5){
			return console.log('length must be in range [1 - 5]');
		}

		var osrefno = osRef.toString().split(' ');
		osrefno[1] = osrefno[1].substring(0, length);
		osrefno[2] = osrefno[2].substring(0, length);
		osrefno = osrefno.join('');

		return osrefno;
	};

	MapTile.prototype._tile2long = function (x, z) {
		return (x/Math.pow(2,z)*360-180);
	}

	MapTile.prototype._tile2lat = function (y, z) {
		var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
		return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
	}

	MapTile.prototype._degToRad = function(degrees) {
		return degrees * Math.PI / 180;
	};

	//http://stackoverflow.com/questions/22032270/how-to-retrieve-layerpoint-x-y-from-latitude-and-longitude-coordinates-using
	MapTile.prototype._getSlippyTileLayerPoints = function (lat_deg, lng_deg, zoom) {
		var x = (Math.floor((lng_deg + 180) / 360 * Math.pow(2, zoom)));
		var y = (Math.floor((1 - Math.log(Math.tan(lat_deg * Math.PI / 180) + 1 / Math.cos(lat_deg * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));

		var layerPoint = {
			x: x,
			y: y
		};

		return layerPoint;
	};

	MapTile.prototype.appendMapTile = function(osGridRef){

		if(!this.originBNG){
			//return console.log('No origin BNG coors set, no map tiles can be added.');
		}

		this.addedTileRefs =  this.addedTileRefs || [];

		if(this.addedTileRefs.indexOf(osGridRef) !== -1) {
			//console.log(osGridRef + ' has already been added');
			return false;
		}

		this.addedTileRefs.push(osGridRef);

		var gltf = document.createElement('gltf');
		gltf.setAttribute('onclick', 'clickObject(event)');
		gltf.setAttribute('url', server_config.apiUrl('os/buildings.gltf?method=osgrid&osgridref=' + osGridRef + '&draw=1'));

		var translate = [0, 0, 0];
		var osCoor = OsGridRef.parse(osGridRef);

		//translate[0] = osCoor.easting - this.originBNG.easting;
		//translate[2] = this.originBNG.northing - osCoor.northing;

		var mapImagePosInfo = this._getMapImagePosInfo();

		var tileLatLon = OsGridRef.osGridToLatLon(osCoor);
		var correspondingMapTile = this._getSlippyTileLayerPoints(tileLatLon.lat, tileLatLon.lon, mapImagePosInfo.zoomLevel)

		var y = correspondingMapTile.y - mapImagePosInfo.slippyPoints.y;
		// var nextY = correspondingMapTile.y >= 0 ? y + 1 : y - 1;
		// var mapSize = this.getSumSize(nextY) - this.getSumSize(y);

		var mapSize = this.getMapSize(y);

		var corMapTileBNG = OsGridRef.latLonToOsGrid(new LatLon(
			this._tile2lat(correspondingMapTile.y, mapImagePosInfo.zoomLevel), 
			this._tile2long(correspondingMapTile.x, mapImagePosInfo.zoomLevel)
		));

		//dx,dy of 3dmap tiles to map image tiles
		var dx = osCoor.easting * this.meterPerPixel - (corMapTileBNG.easting  * this.meterPerPixel + mapSize / 2);
		var dy = (corMapTileBNG.northing * this.meterPerPixel - mapSize / 2) - osCoor.northing * this.meterPerPixel;

		translate[0] = (correspondingMapTile.x - mapImagePosInfo.slippyPoints.x) * mapSize + dx + mapImagePosInfo.offsetX 
		translate[2] = (correspondingMapTile.y - mapImagePosInfo.slippyPoints.y) * mapSize + dy + mapImagePosInfo.offsetY 


		// this._appendPlane(this._drawPlaneOnZ([
			
		// 	[translate[0] + 100, 10, translate[2] + 100],
		// 	[translate[0] - 100, 10, translate[2] + 100],
		// 	[translate[0] - 100, 10, translate[2] - 100],
		// 	[translate[0] + 100, 10, translate[2] - 100],
			
		// ], [1, 0, 0]));

		// if(!this.gltfDoms){
		// 	this.gltfDoms = [];
		// }

		var scale = document.createElement('Transform');
		var mPerPx = this.meterPerPixel;
		scale.setAttribute('scale', [mPerPx, mPerPx, mPerPx].join(','));
		scale.appendChild(gltf);

		var transform = document.createElement('transform');
		transform.setAttribute('translation', translate.join(' '));


		transform.appendChild(scale);
		//this.gltfDoms.push(transform);
		this.viewer.getScene().appendChild(transform);

		return transform;
	};


	MapTile.prototype.createMapImageTile = function(size, x, y, t){

		var shape = document.createElement("Shape");

		var app = document.createElement('Appearance');

		var it = document.createElement('ImageTexture');

		var mapImagePosInfo = this._getMapImagePosInfo();


		var material = document.createElement('material');

		// var color = [51 / 255, 165  / 255, 255  / 255];
		// material.setAttribute('emissiveColor', color.join(' '));
		// material.setAttribute('transparency', 0.7)
		// app.appendChild(material);


		//it.setAttribute("url", server_config.apiUrl('os/map-images/Outdoor/' + mapImagePosInfo.zoomLevel + '/' + x + '/' + y + '.png'));
		it.setAttribute("url", server_config.getUrl(server_config.subdomains.mapImg, 'os/map-images/Outdoor/' + mapImagePosInfo.zoomLevel + '/' + x + '/' + y + '.png'));
		it.setAttribute("crossOrigin", "use-credentials");
		
		app.appendChild(it);
		
		shape.appendChild(app);

		var plane = document.createElement('Plane');
		plane.setAttribute('center', '0, 0');
		plane.setAttribute('size', [size, size].join(','));
		plane.setAttribute('solid', false);
		plane.setAttribute('lit', false);

		shape.appendChild(plane);

		var rotate = document.createElement('Transform');
		// rotate 270Deg around x
		rotate.setAttribute('rotation', '1,0,0,4.7124');
		rotate.appendChild(shape);

		var translate = document.createElement('Transform');
		translate.setAttribute('translation', t.join(' '));
		translate.appendChild(rotate);

		return translate;
	};

	MapTile.prototype._vec3Len = function(vec){
		return Math.sqrt(
			Math.pow(vec[0], 2)
			+ Math.pow(vec[1], 2)
			+ Math.pow(vec[2], 2)
		);
	}


}());