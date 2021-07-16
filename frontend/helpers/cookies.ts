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

export const setCookie = (key, value, numberOfDays = 30) => {
	const now = new Date();

	now.setTime(now.getTime() + numberOfDays * 60 * 60 * 24 * 1000);
	document.cookie = `${key}=${value}; expires=${now.toUTCString()}; path=/`;
};

export const getCookie = (key) => document.cookie.split('; ').reduce((total, currentCookie) => {
	const item = currentCookie.split('=');
	const storedKey = item[0];
	const storedValue = item[1];

	return key === storedKey ? decodeURIComponent(storedValue) : total;
}, '');
