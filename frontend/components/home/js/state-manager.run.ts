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

import { history } from "../../../helpers/migration";
import { get } from 'lodash';

function StateManagerRun(
	$location,
	$rootScope,
	$state,
	$timeout,
	$mdDateLocale,
	$filter,

	StateManager,
	AuthService,
	AnalyticService,
	$urlRouter
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

	$rootScope.$on('$locationChangeSuccess', (e, newUrl, oldUrl) => {
		e.preventDefault();

		if ($state.current.name !== 'app.dashboard.pages') {
			$urlRouter.sync();
		} else if (newUrl !== oldUrl) {
			$timeout(() => {
				history.push(`${location.pathname}${location.search}`);
			});
		}

		AnalyticService.sendPageView(location);

		const queryParams = $location.search();
		if (Object.keys(queryParams).length) {
			StateManager.clearQuery();
		} else {
			StateManager.setQuery(queryParams);
		}
	});

	$rootScope.$on('$stateChangeStart', (event, toState, toParams) => {
		const isLoginRequired = Boolean(get(toState.data, 'isLoginRequired'));
		const isAuthenticated = AuthService.isLoggedIn();
		const originURL = `${location.pathname}${location.search}`;

		if (toState.name === 'app.homepage') {
			event.preventDefault();

			if (isAuthenticated) {
				AuthService.loginSuccess({
					data: {
						username: AuthService.username
					}
				});
				$state.go('app.dashboard.pages', { page: 'teamspaces'});
			} else {
				$state.go('app.login', { referrer: originURL });
			}
		}

		if (isLoginRequired && !isAuthenticated) {
			event.preventDefault();
			StateManager.state.authInitialized = false;
			AuthService.init().then(() => {
				StateManager.state.authInitialized = true;
				$timeout(() => {
					if (toState.name.includes('app.dashboard')) {
						history.push(originURL);
						$urlRouter.update();
					} else {
						$state.go(toState, toParams);
					}
				});
			})
			.catch((error) => {
				$state.go('app.login', { referrer: originURL });
				console.error('Error initialising auth from state manager: ', error);
			});
		}

		StateManager.setState(toParams);
	});

	$urlRouter.listen();
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
		"$urlRouter",
		StateManagerRun
	]);
