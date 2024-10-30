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
import { generatePath } from 'react-router-dom';

const appendSlashIfNeeded = (uri) => (uri.at(-1) !== '/' ? `${uri}/` : uri);

export const discardSlash = (uri) => (uri.at(-1) === '/' ? uri.slice(0, -1) : uri);

export const discardTab = (uri) => discardSlash(uri).split('/').slice(0, -1).join('/');

export const discardUrlComponent = (uri, component) => discardSlash(uri.replace(component, ''));

export const uriCombine = (uri, path) => {
	let pathname = appendSlashIfNeeded(uri);
	const otherPath = appendSlashIfNeeded(path);

	const url = new URL(pathname, 'http://domain.com');
	pathname = (new URL(otherPath, url)).pathname;

	const val = pathname.slice(0, -1); // takes out the '/' at the end
	return val;
};

export const addParams = (url: string, searchParams: string = '') => {
	const urlObject = new URL(url, window.location.origin);
	new URLSearchParams(searchParams).forEach((value, key) => urlObject.searchParams.set(key, value));
	return urlObject.toString();
};

export const pathName = (url) => {
	const urlObject = new URL(url, window.location.origin);
	return urlObject.toString().replace(urlObject.origin, '');
};

export const prefixBaseDomain = (uri: string) => `${window.location.protocol}//${window.location.hostname}${uri}`;

export const getCurrentUrl = (searchParams = '') => addParams(window.location.href, searchParams);

export const getParams = () => new URL(window.location.href).searchParams;

export const generateFullPath = (pattern: string, params: object, newSearchParams: Record<string, any> = {}, keepOldSearchParams: boolean = true) => {
	const path = generatePath(pattern, params);
	const searchParamsObj = keepOldSearchParams ? getParams() : new URLSearchParams();
	
	Object.entries(newSearchParams).forEach(([key, val]) => {
		if (val) {
			searchParamsObj.set(key, val);
		} else {
			searchParamsObj.delete(key);
		}
	});
	// @ts-ignore
	if (!searchParamsObj.size) return path;
	return `${path}?${searchParamsObj}`;
};
