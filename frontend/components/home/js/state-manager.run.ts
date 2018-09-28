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

function StateManagerRun(
	$location,
	$rootScope,
	$state,
	$timeout,
	$mdDateLocale,
	$filter,

	StateManager,
	AuthService,
	AnalyticService
) {

	const dateFilter = $filter("date");

	$mdDateLocale.formatDate = (date, timezone) => {
		if (!date) {
			return "";
		}

		const localeTime = date.toLocaleTimeString();
		let formatDate = date;
		if (date.getHours() === 0 &&
			(localeTime.indexOf("11:") !== -1 || localeTime.indexOf("23:") !== -1)) {
			formatDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 1, 0, 0);
		}

		return dateFilter(formatDate, "d/M/yyyy", timezone);
	};

	$mdDateLocale.parseDate = (dateString) => {
		const dateArr = dateString.split("/").concat([1900, 1 , 1]);
		return new Date(dateArr[2], dateArr[1] - 1, dateArr[0]);
	};

	$rootScope.$on("$stateChangeStart", (event, toState, toParams, fromState, fromParams) => {
		console.log("!!!! initiate change");
		StateManager.state.changing = true;

		for (let i = 0; i < StateManager.functions.length; i++) {
			StateManager.setStateVar(StateManager.functions[i], false);
		}

		StateManager.clearQuery();

		const stateChangeObject = {
			toState,
			toParams,
			fromState,
			fromParams
		};

		StateManager.startStateChange(stateChangeObject);
	});

	$rootScope.$on("$stateChangeSuccess", (event, toState, toParams, fromState, fromParams) => {

		const stateChangeObject = {
			toState,
			toParams,
			fromState,
			fromParams
		};
		console.log("!!!!@stateChangeSuccess");
		StateManager.handleStateChange(stateChangeObject);
	});

	$rootScope.$on("$locationChangeSuccess", () => {

		AnalyticService.sendPageView(location);

		const queryParams = $location.search();

		if (Object.keys(queryParams).length === 0) {
			StateManager.clearQuery();
		} else {
			StateManager.setQuery(queryParams);
		}

	});

}

export const StateManagerRunModule = angular
	.module("3drepo")
	.run([
		"$location",
		"$rootScope",
		"$state",
		"$timeout",
		"$mdDateLocale",
		"$filter",

		"StateManager",
		"AuthService",
		"AnalyticService",
		StateManagerRun
	]);
