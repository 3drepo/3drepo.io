/**
 *	Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.component("accountModelsetting", {
			restrict: 'EA',
			templateUrl: 'account-model-setting.html',
			bindings: {
				account: "=",
				model: "=",
				showPage: "&",
				subscriptions: "=",
				data: "="
			},
			controller: AccountModelsettingCtrl,
			controllerAs: 'vm',
		});

	AccountModelsettingCtrl.$inject = ["$scope", "$location", "UtilsService", "StateManager"];

	function AccountModelsettingCtrl($scope, $location, UtilsService, StateManager) {
		
		var vm = this;

		/**
		 * Init
		 */
		vm.$onInit = function() {
			vm.units = server_config.units
			vm.mapTile = {};

			// TODO: We should use statemanager eventually
			vm.urlData = $location.search();
			vm.modelId = vm.urlData["modelId"];
			vm.modelName = vm.urlData["modelName"];
			vm.targetAcct = vm.urlData["targetAcct"];


			UtilsService.doGet(vm.account + "/" + vm.modelId + ".json")
			.then(function (response) {

				if (response.status === 200 && response.data && response.data.properties) {

					var props = response.data.properties;

					if(props.mapTile) {
						props.mapTile.lat && (vm.mapTile.lat = props.mapTile.lat);
						props.mapTile.lon && (vm.mapTile.lon = props.mapTile.lon);
						props.mapTile.y && (vm.mapTile.y = props.mapTile.y);
					}
					if (response.data.type) {
						vm.modelType = response.data.type;
					}
					if (props.topicTypes) {
						vm.topicTypes = convertTopicTypesToString(props.topicTypes)
					}
					if (props.code) {
						vm.code = props.code
					} 
					if (props.unit) {
						vm.unit = props.unit
						vm.oldUnit = vm.unit;	
					}
					
		
				} else {
					vm.message = response.data.message;
				}


			});

		}

	
		/**
		 * Go back to the teamspaces page
		 */

		vm.goBack = function () {
		
			$location.search("modelId", null);
			$location.search("modelName", null);
			$location.search("targetAcct", null);

			vm.showPage({page: "teamspaces", data: vm.data});
		};


		function convertTopicTypesToString(topicTypes){

			var result = [];

			topicTypes.forEach(function(type){
				result.push(type.label);
			});

			return result.join('\n');
		}

		vm.save = function(){

			var data = {
				mapTile: vm.mapTile,
				unit: vm.unit,
				code: vm.code,
				topicTypes: vm.topicTypes.replace(/\r/g, '').split('\n')
			};

			UtilsService.doPut(data, vm.targetAcct + "/" + vm.modelId +  "/settings")
			.then(function(response){
				if(response.status === 200){
					vm.message = 'Saved';
					if (response.data && response.data.properties && response.data.properties.topicTypes) {
						vm.topicTypes = convertTopicTypesToString(response.data.properties.topicTypes);
					}
					vm.oldUnit = vm.unit;
				} else {
					vm.message = response.data.message;
				}
			})
		}
	}
}());
