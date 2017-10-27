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

(function() {
	"use strict";

	angular.module("3drepo")
		.service("DialogService", DialogService);
		
	DialogService.$inject = [
		"$mdDialog"
	];

	function DialogService(
		$mdDialog
	) {

		var service = {
			text: text,
			html: html
		};

		return service;

		////////

		function text(title, content, escapable) {

			if (escapable === undefined) {
				escapable = true;
			}

			return $mdDialog.show( 
				$mdDialog.alert()
					.clickOutsideToClose(escapable)
					.escapeToClose(escapable)
					.title(title)
					.textContent(content)
					.ariaLabel(title)
					.ok("OK")
			);
		}

		function html(title, content, escapable) {

			if (escapable === undefined) {
				escapable = true;
			}

			return $mdDialog.show( 
				$mdDialog.alert()
					.clickOutsideToClose(escapable)
					.escapeToClose(escapable)
					.title(title)
					.htmlContent(content)
					.ariaLabel(title)
					.ok("OK")
			);
		}

	}	
			
})();




		