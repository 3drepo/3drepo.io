export const PROJECT_ROLES_TYPES = {
	ADMINSTRATOR: "admin_project",
	VIEWER: "viewer",
	COMMENTER: "commenter",
	COLLABORATOR: "collaborator",
	UNASSIGNED: null,
	NONE: "none"
};

export const PROJECT_ROLE_PERMISSIONS = {
	ADMINSTRATOR: [],
	UNASSIGNED: []
};

export const PROJECT_ROLES_LIST = [
	{
		key: PROJECT_ROLES_TYPES.UNASSIGNED,
		label: "Unassigned"
	},
	{
		key: PROJECT_ROLES_TYPES.ADMINSTRATOR,
		label: "Admin"
	}
];
