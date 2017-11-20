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

(function () {
	"use strict";

	angular.module("3drepo")
		.component("panelCard", {
			restrict: "E",
			templateUrl: "templates/panel-card.html",
			bindings: {
				account: "=",
				model: "=",
				branch: "=",
				revision: "=",
				position: "=",
				modelSettings: "=",
				contentData: "=",
				onHeightRequest: "&",
				onShowFilter: "&",
				keysDown: "=",
				selectedObjects: "=",
				setInitialSelectedObjects: "&"
			},
			controller: PanelCardCtrl,
			controllerAs: "vm"
		});

	PanelCardCtrl.$inject = ["$scope", "$element", "$compile", "EventService", "PanelService"];

	function PanelCardCtrl($scope, $element, $compile, EventService, PanelService) {

		var vm = this;

		/*
		 * Init
		 */
		vm.$onInit = function() {

			vm.showHelp = false;
			vm.showFilter = false;
			vm.visibleStatus = false;
			vm.showClearFilterButton = false;
			vm.showAdd = false;
			vm.hideMenuButton = false;
			vm.currentHighlightedOptionIndex = -1;

			angular.element(function(){
				vm.options = angular.element($element[0].querySelector("#options"));
			});
			
		};

		vm.isDefined = function(variable){
			return variable !== undefined && variable !== null;
		};

		/*
		 * Watch type on contentData to create content and tool bar options
		 */
		$scope.$watch("vm.contentData.type", function (newValue) {
			if (newValue) {
				angular.element(function(){
					vm.createToolbarOptions();
					vm.statusIcon = vm.contentData.icon;
				});
			}
		});

		/*
		 * Watch show on contentData to toggle elements off
		 */
		$scope.$watch("vm.contentData.show", function (newValue) {
			if ((vm.isDefined(newValue) && !newValue)) {
				vm.hideItem();
			}
		});

		/*
		 * Change toolbar options when toggling add functionality
		 */
		$scope.$watch("vm.showAdd", function (newValue) {
			if (vm.isDefined(newValue)) {
				vm.toggleAdd(newValue);
			}
		});

		/*
		 * Watch for card in edit mode
		 */
		$scope.$watch("vm.showEdit", function (newValue) {
			if (vm.isDefined(newValue)) {
				PanelService.handlePanelEvent(
					vm.contentData.type, 
					EventService.EVENT.PANEL_CARD_EDIT_MODE, 
					{on: true}
				);	
				vm.hideItem();
			}
		});

		/*
		 * Watch for content item to hide itself
		 */
		$scope.$watch("vm.hideSelectedItem", function (newValue) {
			if (vm.isDefined(newValue) && newValue) {
				vm.statusIcon = vm.contentData.icon;
			}
		});

		vm.hasFilter = function() {
			var filter = vm.contentData.options.find(function(item){
				return item.type === "filter";
			});
			return filter !== undefined;
		};

		/**
		 * A content item is requesting a height change
		 * @param height
		 */
		vm.onContentHeightRequest = function (height) {
			vm.contentHeight = height;
			vm.onHeightRequest({contentItem: vm.contentData, height: vm.contentHeight});
		};

		/**
		 * Content wants to show an individual item
		 */
		vm.showItem = function () {
			vm.statusIcon = "arrow_back";
			vm.hideMenuButton = true;
			vm.hideSelectedItem = false; // So that a change to this value is propagated
		};

		/**
		 * Content wants to show it's main content
		 */
		vm.hideItem = function () {

			vm.statusIcon = vm.contentData.icon;
			vm.hideMenuButton = false;
			vm.hideSelectedItem = true;
		};

		/**
		 * Create the tool bar options
		 */
		vm.createToolbarOptions = function() {

			// TODO: We shouldn't use string concat and angular.element
			// definite antipattern
						
			var option, optionElement;
			var optionData = vm.contentData.options;

			if (vm.contentData.hasOwnProperty("options")) {

				optionData.forEach(function(op, i) {
					var optionType = op.type;
					optionElement = vm.getOptionElement(optionType, i);
					option = angular.element(optionElement);

					// Create the element
					if (option !== null) {
						vm.options.prepend(option);
						$compile(option)($scope);
					}
				});

			}

		};

		vm.getOptionElement = function(optionType, i) {

			var optionElement = "<panel-card-option-" + optionType;
			optionElement += " id='panal_card_option_" + optionType + "'";
			
			var isMenuOrFilter = optionType === "menu" || optionType === "filter";

			if(isMenuOrFilter){
				optionElement += " ng-if='!vm.hideMenuButton'";
			} else {
				optionElement += " ng-if='vm.contentData.options[" + i + "].visible'";
			}

			vm.contentData.options[i].color = "";

			optionElement += " style='color:{{vm.contentData.options[" + i + "].color}}'";
			optionElement += vm.getOptionSpecificData(optionType);
			optionElement += "><panel-card-option-" + optionType + ">";

			return optionElement;
		};

		vm.getOptionSpecificData = function(optionType) {

			switch (optionType) {
			case "filter":
				return " show-filter='vm.showFilter'";

			case "visible":
				return " visible='vm.visible'";

			case "menu":
				return "menu='vm.contentData.menu' selected-menu-option='vm.selectedMenuOption'";

			case "close":
				return "show='vm.contentData.show'";
			}

		};

		vm.showToolbarOptions = function(addOptions, show) {
			for (var i = 0; i < vm.contentData.options.length; i += 1) {
				if (addOptions.indexOf(vm.contentData.options[i].type) !== -1) {
					vm.contentData.options[i].visible = show;
				}
			}
		};

		vm.toggleAdd = function(on) {
			if (on) {
				if (vm.contentData.type === "issues") {
					vm.showToolbarOptions(["filter", "menu"], false);
				}
				vm.hideItem();
				PanelService.handlePanelEvent(
					vm.contentData.type, 
					EventService.EVENT.PANEL_CARD_ADD_MODE, 
					{on: true}
				);	
			} else {
				if (vm.contentData.type === "issues") {
					vm.showToolbarOptions(["filter", "menu"], true);
				}
				vm.hideItem();
				PanelService.handlePanelEvent(
					vm.contentData.type, 
					EventService.EVENT.PANEL_CARD_ADD_MODE, 
					{on: false}
				);
			}
		};

	}
}());
