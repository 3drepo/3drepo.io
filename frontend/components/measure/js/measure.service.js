/**
 *  Copyright (C) 2017 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.service("MeasureService", MeasureService);

	MeasureService.$inject = [];

	function MeasureService() {
		
		var service = {
			state : {
				disabled: false,
				active: false
			},
			toggleMeasure: toggleMeasure,
			activateMeasure: activateMeasure,
			deactivateMeasure: deactivateMeasure,
			setDisabled: setDisabled
		};
	
		return service;
	
		///////////////

		function activateMeasure () {
			service.state.active = true;
			UnityUtil.enableMeasuringTool();
		}

		function deactivateMeasure () {
			service.state.active = false;
			UnityUtil.disableMeasuringTool();
		}

		function setDisabled(disabled) {
			service.state.disabled = disabled;

			// If we're disabling the button we also 
			// want to deactivate the tool itself
			if (disabled) {
				console.log("measure - deactivate");
				service.state.active = false;
			}
		}

		function toggleMeasure() {
			if (!service.state.active) {
				activateMeasure();
			} else {
				deactivateMeasure();
			}
		}


	}
}());
