/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the issueComp of the GNU Affero General Public License as
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
		.component(
			"issueComp",
			{
				controller: IssueCompCtrl,
				templateUrl: "issueComp.html",
				bindings: {
					data: "<",
					keysDown: "<",
					exit: "&"
				}
			}
		);

	IssueCompCtrl.$inject = [];

	function IssueCompCtrl () {
		/*
		 * Init
		 */
		this.priorities = [
			{value: "none", label: "None"},
			{value: "low", label: "Low"},
			{value: "medium", label: "Medium"},
			{value: "high", label: "High"}
		];
		this.statuses = [
			{value: "open", label: "Open"},
			{value: "in_progress", label: "In progress"},
			{value: "closed", label: "Closed"}
		];
		this.types = [
			{value: "for_information", label: "For information"},
			{value: "for_approval", label: "For approval"},
			{value: "vr", label: "VR"},
		];

		/**
		 * Monitor changes to parameters
		 * @param {Object} changes
		 */
		this.$onChanges = function (changes) {
			var leftArrow = 37;
			if (changes.hasOwnProperty("keysDown") &&
				angular.isDefined(changes.keysDown.previousValue)) {
				if (changes.keysDown.previousValue[0] === leftArrow) {
					this.exit({issue: this.data});
				}
			}

			if (changes.hasOwnProperty("data")) {
				if (typeof changes.data.currentValue === "object") {
					this.issueData = this.data;
				}
				else {
					this.issueData = {
						priority: "none",
						status: "open"
					};
				}
				this.setStatusIcon();
			}
		};

		this.statusIconChange = function () {
			this.setStatusIcon();
		};

		this.setStatusIcon = function () {
			if (this.issueData.status === "closed") {
				this.statusIconIcon = "check_circle";
				this.statusIconColour = "#004594";
			}
			else {
				this.statusIconIcon = (this.issueData.status === "open") ? "panorama_fish_eye" : "lens";
				switch (this.issueData.priority) {
					case "none":
						this.statusIconColour = "#7777777";
						break;
					case "low":
						this.statusIconColour = "#4CAF50";
						break;
					case "medium":
						this.statusIconColour = "#FF9800";
						break;
					case "high":
						this.statusIconColour = "#F44336";
						break;
				}
			}
		}
	}
}());