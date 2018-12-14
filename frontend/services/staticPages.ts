import { clientConfigService } from './clientConfig';
import { memoize } from 'lodash';
import axios from 'axios';

export const getStaticRoutes = memoize(() => {
	return clientConfigService.legalTemplates.map((route) => {
		const path = route.page || (route.fileName.split('/').slice(-1)[0] || '').split('.')[0];
		return { ...route, path: `/${path}` };
	});
});

export const STATIC_ROUTES = getStaticRoutes() as any;

export const STATIC_ROUTES_PATHS = STATIC_ROUTES.map(({ path }) => path) as any;

export const isStaticRoute = (path) => STATIC_ROUTES_PATHS.includes(path);

export const getStaticFile = (filePath) => axios.get(`/templates/${filePath}`);
