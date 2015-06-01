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

angular.module('3drepo')
.service('WayfinderData', ['Wayfinder', 'PointData', '$window', 'serverConfig',
		function (Wayfinder, PointData, $window, serverConfig) {
			this.Wayfinder			= Wayfinder;
			this.PointData			= PointData;

			this.initialized = false;

			var self = this;

			this.init = function() {
				if(!self.initialized)
				{
					/*
					self.avatarHeight = 1.83;
					self.collDistance = 0.1;
					self.stepHeight	= 0.4;
					self.speed		= 2.0;
					self.startPoint	= [-26.06, -0.21, 15.28];
					self.endPoint   = [-26.06, -0.21, -7.28];
					self.scaleY     = 0.05;
					self.trans	  = 0.3;
					self.blobRadius = 1.5;

					// External Javascript stuff
					$window.viewer		= new Viewer();
					$window.text		= new Text();
					$window.arrow		= new Arrow();
					$window.recorder	= new Recorder(self.startPoint, self.endPoint, self.blobRadius);
					$window.spheres		= new Spheres();

					// Initialize viewer
					self.viewer = $window.viewer;
					*/

					/*
					var avrStart = self.startPoint.slice(0);
					avrStart[1] += self.avatarHeight;
					avrStart[2] += 9.0;

					viewer.setStartingPoint(avrStart[0], avrStart[1], avrStart[2]);
					viewer.loadURL(serverConfig.apiUrl(serverConfig.democompany + '/' + serverConfig.demoproject + '/revision/master/head.x3d.src'));

					viewer.changeCollisionDistance(self.collDistance);
					viewer.changeAvatarHeight(self.avatarHeight);
					viewer.changeStepHeight(self.stepHeight);
					viewer.setSpeed(self.speed);
					viewer.setNavMode("NONE");

					// Initialize text
					var startRGB = [1.0, 0.0, 0.0];
					$window.text.init(startRGB);

					self.initialized = true;
					*/
				}
			};
		}
]);

