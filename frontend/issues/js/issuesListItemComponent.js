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

	IssuesListItemCtrl.$inject = [];

	function IssuesListItemCtrl () {
		this.selected = false;
		this.thumbnail = "/public/images/ground.png";

		this.$onChanges = function (changes) {
			if (changes.hasOwnProperty("data") &&
				angular.isDefined(changes.data.currentValue)) {
				//console.log(this.data);
			}

			if (changes.hasOwnProperty("select") &&
				angular.isDefined(changes.select.currentValue) &&
				(this.select.issue._id === this.data._id)) {
				this.selected = this.select.selected;
			}
		};

		this.toggleSelected = function () {
			this.selected = !this.selected;
			if (this.selected) {
				this.onSelect({issueId: this.data._id});
			}
		};

		this.editIssue = function () {
			this.onEditIssue({issue: this.data});
		};
	}
}());