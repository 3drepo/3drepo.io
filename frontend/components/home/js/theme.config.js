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
		
	angular
		.module("3drepo")
		.config(themeConfig);

	themeConfig.$inject = ["$mdThemingProvider"];

	function themeConfig($mdThemingProvider) {

		//$mdThemingProvider.generateThemesOnDemand(true);
		var paletteName = "three_d_repo_primary";
		$mdThemingProvider.definePalette(paletteName, {
			"50": "0C2F54",
			"100": "0C2F54",
			"200": "0C2F54",
			"300": "0C2F54",
			"400": "0C2F54",
			"500": "0C2F54",
			"600": "0C2F54",
			"700": "0C2F54",
			"800": "0C2F54",
			"900": "0C2F54",
			"A100": "06563C",
			"A200": "06563C",
			"A400": "087251",
			"A700": "087251",
			"contrastDefaultColor": "light",
			"contrastDarkColors": ["50", "100", "200", "300", "400", "A100"],
			"contrastLightColors": undefined
		});

		$mdThemingProvider.theme("default")
			.primaryPalette(paletteName)
			.accentPalette(paletteName)
			.warnPalette("red");

		$mdThemingProvider.setDefaultTheme("default");
		//$mdTheming.generateTheme('altTheme');
		//mdThemingProvider.reload('default'); 


	}


})();