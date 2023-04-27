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
import { apiDomain } from '../../config.json';

const apiUrl = (url) => new URL(`${apiDomain}/${url}`).toString();

export const generateV5ApiUrl = (url: string): string => encodeURI(apiUrl(`v5/${url}`));

export const get = async (driver, url) => driver.executeScript(`return fetch("${generateV5ApiUrl(url)}", {
 "headers": {
    "accept": "application/json, text/plain, */*",
  },
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
})`);

export const post = async (driver, url, body = null) => driver.executeScript(`return fetch("${generateV5ApiUrl(url)}", {
	"headers": {
	  "accept": "application/json, text/plain, */*",
	},
	"body": ${JSON.stringify(body)},
	"method": "POST",
	"mode": "cors",
	"credentials": "include"
})`);

export const getLogin = (driver) => get(driver, 'login');

export const logout = (driver) => post(driver, 'logout');
