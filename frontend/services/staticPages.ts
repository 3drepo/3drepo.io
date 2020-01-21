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
