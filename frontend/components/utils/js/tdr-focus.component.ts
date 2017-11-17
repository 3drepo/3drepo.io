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

// Inspired by Mark Rajcok'a answer - http://stackoverflow.com/a/14837021/782358

function tdrFocus($timeout) {
	return {
		scope: { trigger: "@tdrFocus" },
		link: function(scope, element) {
			scope.$watch("trigger", function(value) {
				if (value.toString() === "true") {
					$timeout(function() {
						element[0].focus();
					});
				}
			});
		}
	};
}

export const TdrFocusModule = angular
	.module('3drepo')
	.directive("tdrFocus", ["$timeout", tdrFocus]);
