/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the issuesListItem of the GNU Affero General Public License as
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
			"issuesListItem",
			{
				controller: IssuesListItemCtrl,
				templateUrl: "issuesListItem.html",
				bindings: {
					data: "<",
					select: "<",
					onSelect: "&",
					onEditIssue: "&",
					keysDown: "<"
				}
			}
		);

	IssuesListItemCtrl.$inject = ["serverConfig", "IssuesService"];

	function IssuesListItemCtrl (serverConfig, IssuesService) {
		this.selected = false;
		this.screenShot = serverConfig.apiUrl(serverConfig.GET_API, this.data.viewpoint.screenshot);
		this.data.title = IssuesService.generateTitle(this.data);
		this.statusIcon = IssuesService.getStatusIcon(this.data);

		/**
		 * Monitor changes to parameters
		 * @param {Object} changes
		 */
		this.$onChanges = function (changes) {
			if (changes.hasOwnProperty("select") &&
				angular.isDefined(changes.select.currentValue) &&
				(this.select.issue._id === this.data._id)) {
				this.selected = this.select.selected;
			}
		};

		/**
		 * Toggle selected state. Ignore key press.
		 * @param {Object} event
		 */
		this.toggleSelected = function (event) {
			if (event.type === "click") {
				this.onSelect({issueId: this.data._id});
			}
		};

		/**
		 * Set up editing of issue
		 */
		this.editIssue = function () {
			this.onEditIssue({issue: this.data});
		};
	}
}());