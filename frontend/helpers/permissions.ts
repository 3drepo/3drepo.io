export const hasPermissions = (requiredPerm = '', permissions) => {
	if (!requiredPerm) {
		return true;
	}
	return permissions.indexOf(requiredPerm) !== -1;
};
