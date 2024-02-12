/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { domain } from '../../config.json';
import { getUserForRole } from './users.helpers';
import * as path from 'node:path';

const absoluteUrl = (url) => new URL(url, domain).toString();

const v5routes = {
	// in the test the first part of the string will become the username to be replaced
	// so 'viewer teamspace settings' will be 'dashboard/viewerUsername/t/settings' (whith viewerUsername be the username defined for a viewer)
	'teamspace settings': 'dashboard/{username}/t/settings',
};

const replaceParams = (url:string, params: object | null) => {
	if (!params) return url;

	let parsedUrl = url;
	Object.keys(params).forEach((paramKey) => { parsedUrl = parsedUrl.replace(`{${paramKey}}`, params[paramKey]); });

	return parsedUrl;
};

export const getUrl = (page: string) => {
	const pageChunks = page.split(' ');
	let params = null;
	if (pageChunks.length > 1) {
		params = getUserForRole(pageChunks.shift());
	}
	const urlAlias = pageChunks.join(' ');

	return absoluteUrl(path.join('v5/', (v5routes[urlAlias] ? replaceParams(`${v5routes[urlAlias]}`, params) : urlAlias)));
};
