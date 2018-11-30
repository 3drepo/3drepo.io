export const getDataFromPathname = (pathname) => {
	const pathnameElements = pathname.replace('/viewer/', '').split('/');

	return {
		teamspace: pathnameElements[0],
		modelId: pathnameElements[1],
		revision: pathnameElements[2] || null
	};
};
