/**
 *  Copyright (C) 2016 3D Repo Ltd
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
		.service("UtilsService", UtilsService);

	UtilsService.$inject = ["$q", "$mdDialog", "ClientConfigService"];

	function UtilsService($q, $mdDialog, ClientConfigService) {
		
		var service = {
			capitalizeFirstLetter: capitalizeFirstLetter,
			showDialog: showDialog,
			closeDialog: closeDialog,
			getServerUrl: getServerUrl,
			getErrorMessage: getErrorMessage,
			getResponseCode: getResponseCode
		};

		return service;

		/////////////////


		/**
         * Capitalise the first letter of a string
         * Inspired by Steve Harrison's answer - http://stackoverflow.com/a/1026087/782358
         *
         * @param string
         * @returns {string}
         */
		function capitalizeFirstLetter(string) {
			return (string.toString()).charAt(0).toUpperCase() + string.slice(1);
		}

		/**
         * Show a dialog
         *
         * @param {String} dialogTemplate - required
         * @param {Object} scope - required
         * @param {Object} event
         * @param {Boolean} clickOutsideToClose
         * @param {Object} parent
         * @param {Boolean} fullscreen
         * @param {String} closeTo
         */
		function showDialog(dialogTemplate, scope, event, clickOutsideToClose, parent, fullscreen, closeTo) {
			// Allow the dialog to have cancel ability
			scope.utilsRemoveDialog = scope.utilsRemoveDialog || function () {
				$mdDialog.cancel();
			};

			// Set up and show dialog
			var data = {
				controller: function () {},
				templateUrl: "/templates/" + dialogTemplate,
				onRemoving: function () {
					$mdDialog.cancel();
				}
			};

			data.parent = angular.element(angular.isDefined(parent) ? parent : document.body);

			data.scope = (angular.isDefined(scope)) ? scope : null;
			data.preserveScope = (data.scope !== null);
			data.targetEvent = (angular.isDefined(event)) ? event : null;
			data.clickOutsideToClose = (angular.isDefined(clickOutsideToClose)) ? clickOutsideToClose : true;
			data.fullscreen = (angular.isDefined(fullscreen)) ? fullscreen : false;
			data.closeTo = (angular.isDefined(closeTo)) ? closeTo : false;
			$mdDialog.show(data);
		}

		/**
         * close a dialog
         */
		function closeDialog() {
			$mdDialog.cancel();
		}

		function getServerUrl(url) {
			return ClientConfigService.apiUrl(ClientConfigService.GET_API, url);
		}

		/**
        * Convert error code to custom error message
        */
		function getErrorMessage(resData){
            
			var messages = {
				"FILE_FORMAT_NOT_SUPPORTED": "Unsupported file format",
				"SIZE_LIMIT_PAY": "Insufficient quota for model",
				"USER_NOT_VERIFIED": "Please click on the link in the verify email sent to your account",
				"ALREADY_VERIFIED": "You have already verified your account successfully. You may now login to your account.",
				"INVALID_CAPTCHA_RES": "Please prove you're not a robot",
				"USER_EXISTS": "User already exists"
			};

			var message;

			Object.keys(ClientConfigService.responseCodes).forEach(function(key){
				if(ClientConfigService.responseCodes[key].value === resData.value){
					if(messages[key]){
						message = messages[key]; 
					} else {
						message = ClientConfigService.responseCodes[key].message;
					}
				}
			});

			return message;

		}

		function getResponseCode(errorToFind) {
			return Object.keys(ClientConfigService.responseCodes).indexOf(errorToFind);
		}

	}
}());
