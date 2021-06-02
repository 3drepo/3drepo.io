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

import SupportIcon from '@material-ui/icons/ContactSupportOutlined';
import ContactIcon from '@material-ui/icons/MailOutline';
import PricingIcon from '@material-ui/icons/MonetizationOnOutlined';
import axios from 'axios';
import { kebabCase, memoize } from 'lodash';

import { clientConfigService } from './clientConfig';

export const getStaticRoutes = memoize(() => {
	return clientConfigService.legalTemplates.map((route) => {
		const path = route.page || kebabCase((route.fileName.split('/').slice(-1)[0] || '').split('.')[0]);
		return { ...route, path: `/${path}` };
	});
});

export const STATIC_ROUTES = getStaticRoutes() as any;

export const LANDING_ROUTES = [
	{ title: 'Pricing', icon: PricingIcon, path: 'http://3drepo.org/pricing/' },
	{ title: 'Support Centre', icon: SupportIcon, path: 'http://3drepo.org/support/' },
	{ title: 'Contact Us', icon: ContactIcon, path: 'http://3drepo.org/contact/' }
];

export const STATIC_ROUTES_PATHS = STATIC_ROUTES.map(({ path }) => path) as any;

const getPage = (pageName) => STATIC_ROUTES.find((route) => route.page === pageName);

export const TERMS_PAGE = getPage('terms');

export const PRIVACY_PAGE = getPage('privacy');

export const COOKIES_PAGE = getPage('cookies');

export const isStaticRoute = (path) => STATIC_ROUTES_PATHS.includes(path);

export const getStaticFile = (filePath) => axios.get(`/templates/${filePath}`);
