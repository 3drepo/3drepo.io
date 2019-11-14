export const PERMISSIONS = {
	MANAGE_MODEL_PERMISSION: 'manage_model_permission',
	COMMENT_ISSUE: 'comment_issue',
	VIEW_ISSUE: 'view_issue'
};

export const hasPermissions = (requiredPerm = '', permissions = []) => {
	if (!requiredPerm) {
		return true;
	}
	return permissions.indexOf(requiredPerm) !== -1;
};

export const isAdmin = (permissions) => {
	return hasPermissions(PERMISSIONS.MANAGE_MODEL_PERMISSION, permissions);
};

export const isViewer = (permissions) => {
	return permissions && !hasPermissions(PERMISSIONS.COMMENT_ISSUE, permissions);
};
