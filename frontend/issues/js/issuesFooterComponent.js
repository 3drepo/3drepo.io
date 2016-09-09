/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the issuesFooter of the GNU Affero General Public License as
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
			"issuesFooter",
			{
				controller: IssuesFooterCtrl,
				templateUrl: "issuesFooter.html",
				bindings: {
				}
			}
		);

	IssuesFooterCtrl.$inject = [];

	function IssuesFooterCtrl () {
		var highlightBackground = "#FF9800",
			currentActionIndex = null;

		this.actions = [
			{icon: "home", action: "home", color: ""},
			{icon: "home", action: "home", color: ""},
			{icon: "home", action: "home", color: ""}
		];

		this.doAction = function (index) {
			console.log(this.actions[index].action);
			if (currentActionIndex === null) {
				currentActionIndex = index;
				this.actions[currentActionIndex].color = highlightBackground;
			}
			else if (currentActionIndex === index) {
				this.actions[currentActionIndex].color = "";
				currentActionIndex = null;
			}
			else {
				this.actions[currentActionIndex].color = "";
				currentActionIndex = index;
				this.actions[currentActionIndex].color = highlightBackground;
			}
		};
	}
}());