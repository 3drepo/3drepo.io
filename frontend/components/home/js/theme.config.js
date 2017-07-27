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
		.config(["$injector",  function($injector) {
			if ($injector.has("$mdThemingProvider")) {
				var mdThemingProvider = $injector.get("$mdThemingProvider");

				var paletteName = "three_d_repo_primary";
				mdThemingProvider.definePalette(paletteName, {
					"50": "004594",
					"100": "004594",
					"200": "004594",
					"300": "004594",
					"400": "004594",
					"500": "004594",
					"600": "004594",
					"700": "004594",
					"800": "004594",
					"900": "004594",
					"A100": "004594",
					"A200": "004594",
					"A400": "004594",
					"A700": "004594",
					"contrastDefaultColor": "light",
					"contrastDarkColors": ["50", "100", "200", "300", "400", "A100"],
					"contrastLightColors": undefined
				});

				mdThemingProvider.theme("default")
					.primaryPalette(paletteName, {
						"default": "500",
						"hue-1": "400",
						"hue-2": "200",
						"hue-3": "50"
					})
					.accentPalette("green", {
						"default": "600"
					})
					.warnPalette("red");
			}
		}]);


})();