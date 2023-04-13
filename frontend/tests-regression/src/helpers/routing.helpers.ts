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
import { until, By } from 'selenium-webdriver';
import { domain } from '../../config.json';

const absoluteUrl = (url) => new URL(url, domain).toString();

const v5routes = {
	login: 'login',
	dashboard: 'dashboard',
};

export const getUrl = (urlAlias) => absoluteUrl(v5routes[urlAlias] ? `v5/${v5routes[urlAlias]}` : urlAlias);

export const navigateTo = async (driver, url) => {
	await driver.get(getUrl(url));
	await driver.wait(until.elementLocated(By.css('body')), 100000);
};
