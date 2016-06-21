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
		.directive("bottomButtons", bottomButtons);

	function bottomButtons () {
		return {
			restrict: 'E',
			templateUrl: 'bottomButtons.html',
			scope: {},
			controller: BottomButtonsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	BottomButtonsCtrl.$inject = ["EventService"];

	function BottomButtonsCtrl (EventService) {
		var vm = this,
			measureMode = false;


		vm.showButtons = true;
		vm.fullScreen = false;
		vm.showViewingOptionButtons = false;

		vm.toggleElements = function () {
			EventService.send(EventService.EVENT.TOGGLE_ELEMENTS);
			vm.showButtons = !vm.showButtons;
		};

		var setViewingOption = function (index) {
			if (angular.isDefined(index)) {
				// Set the viewing mode

				EventService.send(EventService.EVENT.VIEWER.SET_NAV_MODE,
					{mode: vm.viewingOptions[index].mode});

				// Set up the new current selected option button
				vm.selectedViewingOptionIndex = index;
				vm.rightButtons[0] = vm.viewingOptions[index];

				vm.showViewingOptionButtons = false;
			}
			else {
				vm.showViewingOptionButtons = !vm.showViewingOptionButtons;
			}
		};

		var home = function () {
			EventService.send(EventService.EVENT.VIEWER.GO_HOME);
		};

		var toggleHelp = function () {
			EventService.send(EventService.EVENT.TOGGLE_HELP);
		};

		var enterFullScreen = function () {
			EventService.send(EventService.VIEWER.SWITCH_FULLSCREEN);
			vm.fullScreen = true;
		};

		var exitFullScreen = function() {
			if (!document.webkitIsFullScreen && !document.msFullscreenElement && !document.mozFullScreen && vm.fullScreen) {
				vm.fullScreen = false;
			}
		};
		document.addEventListener('webkitfullscreenchange', exitFullScreen, false);
		document.addEventListener('mozfullscreenchange', exitFullScreen, false);
		document.addEventListener('fullscreenchange', exitFullScreen, false);
		document.addEventListener('MSFullscreenChange', exitFullScreen, false);

		var enterOculusDisplay = function () {
			EventService.send(EventService.EVENT.VIEWER.ENTER_VR);
		};

		/**
		 * Enter pinakin mode
		 */
		var setMeasureMode = function () {
			measureMode = !measureMode;
			EventService.send(EventService.EVENT.MEASURE_MODE, measureMode);
		};

		vm.viewingOptions = [
			{
				mode: VIEWER_NAV_MODES.WALK,
				label: "Walk",
				icon: "fa fa-child",
				click: setViewingOption,
				iconClass: "bottomButtonIconWalk"
			},
			{
				mode: VIEWER_NAV_MODES.HELICOPTER,
				label: "Helicopter",
				icon: "icon icon_helicopter",
				click: setViewingOption,
				iconClass: "bottomButtonIconHelicopter"
			},
			{
				mode: VIEWER_NAV_MODES.TURNTABLE,
				label: "Turntable",
				icon: "icon icon_turntable",
				click: setViewingOption
			}
		];
		vm.selectedViewingOptionIndex = 2;

		vm.leftButtons = [];
		vm.leftButtons.push({
			label: "Home",
			icon: "fa fa-home",
			click: home
		});

		vm.rightButtons = [];
		vm.rightButtons.push(vm.viewingOptions[vm.selectedViewingOptionIndex]);
		/*
		vm.rightButtons.push({
			label: "Help",
			icon: "fa fa-question",
			click: toggleHelp
		});
		vm.rightButtons.push({
			label: "VR",
			icon: "icon icon_cardboard",
			click: enterOculusDisplay,
			iconClass: "bottomButtonIconCardboard"
		});
		 */
	}
}());
