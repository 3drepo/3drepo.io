/**
 *  Copyright (C) 2021 3D Repo Ltd
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

export const ROUTES = {
	HOME: '/',
	TEAMSPACE: '/v5/:teamspace/',
	PROJECT: '/v5/:teamspace/:project/',
	FEDERATIONS: '/v5/:teamspace/:project/federations/',
	CONTAINERS: '/v5/:teamspace/:project/containers/',
	TASKS: '/v5/tasks/',
	USERS: '/v5/users/',
	SETTINGS: 't=settings',
};

export const getRouteLink = ({
	route,
	...parameters
}) => {
	let error = 0;
	const path = route.replace(/:([^ :]+)\//g, (match, p1) => {
		if (parameters[p1]) {
			return `${parameters[p1]}/`;
		}
		error++;
		return null;
	});

	return error ? '/' : path;
};
