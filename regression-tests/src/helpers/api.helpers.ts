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
import { WebDriver } from 'selenium-webdriver';
import { apiDomain } from '../../config.json';

const apiUrl = (url) => new URL(`${apiDomain}/${url}`).toString();

type SeleniumResponse = Response & { json: any };


export const generateV5ApiUrl = (url: string): string => encodeURI(apiUrl(`v5/${url}`));

const browserFetch = async (url:string, credentials: boolean) => {
	let res = await fetch(url, {
		'headers': {
			'accept': 'application/json, text/plain, */*',
		},
		'body': null,
		'method': 'GET',
		'mode': 'cors',
		... { ...credentials && { 'credentials': 'include' } },
	});
	
	if (res.status === 200) {
		try {
			const json = await res.json();
			res.json = json;
		} catch (e) {
			// eslint-disable-next-line no-console
			console.log(e);
		}
	}
		
	return res;
};

const browserPost = async (url: string, credentials: boolean = false, body = null) => 
	fetch(url, {
		'headers': {
		  'accept': 'application/json, text/plain, */*',
		},
		'body': JSON.stringify(body),
		'method': 'POST',
		'mode': 'cors',
		... { ...credentials && { 'credentials': 'include' } },
	});

export const get = async (driver:WebDriver, url:string, credentials: boolean = false) => 
	driver.executeScript<SeleniumResponse>(browserFetch, url, credentials);

export const post = async (driver:WebDriver, url, credentials: boolean = false, body = null) => 
	driver.executeScript<SeleniumResponse>( browserPost, url, credentials, body);

export const getV5 = async (driver, url) => get(driver, generateV5ApiUrl(url), true);
export const postV5 = async (driver, url, body = null) => post(driver, generateV5ApiUrl(url), true, body);


export const getLogin = (driver) => getV5(driver, 'login');

export const logout = (driver) => postV5(driver, 'logout');
