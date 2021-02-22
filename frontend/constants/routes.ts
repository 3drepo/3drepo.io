export const ROUTES = {
	HOME: '/',
	LOGIN: '/login',
	SIGN_UP: '/sign-up',
	PASSWORD_FORGOT: '/password-forgot',
	PASSWORD_CHANGE: '/password-change',
	REGISTER_REQUEST: '/register-request',
	REGISTER_VERIFY: '/register-verify',
	VIEWER: '/viewer',
	MODEL_VIEWER: '/viewer/:teamspace/:model/:revision?',
	DASHBOARD: '/dashboard',
	TEAMSPACES: '/dashboard/teamspaces',
	TEAMSPACE_SETTINGS: '/dashboard/teamspaces/:teamspace',
	MODEL_SETTINGS: '/dashboard/teamspaces/:teamspace/models/:modelId',
	USER_MANAGEMENT_MAIN: '/dashboard/user-management',
	USER_MANAGEMENT_TEAMSPACE: '/dashboard/user-management/:teamspace',
	PROFILE: '/dashboard/profile',
	BILLING: '/dashboard/billing',
	BOARD_MAIN: '/dashboard/board',
	BOARD_SPECIFIC: '/dashboard/board/:type(\\issues|risks)/:teamspace/:project?/:modelId?'
};

export const PUBLIC_ROUTES = [
	ROUTES.LOGIN,
	ROUTES.SIGN_UP,
	ROUTES.REGISTER_REQUEST,
	ROUTES.REGISTER_VERIFY,
	ROUTES.PASSWORD_FORGOT,
	ROUTES.PASSWORD_FORGOT
] as any;
