export const PROJECT_ROLES_TYPES = {
	ADMINSTRATOR: "admin_project",
	UNASSIGNED: null
};

export const PROJECT_ROLES_DESC = {
	UNASSIGNED: "No access",
	ADMINSTRATOR: "Collaborator access and edit permissions"
};

export const PROJECT_ROLES_LIST = [
	{
		key: PROJECT_ROLES_TYPES.UNASSIGNED,
		label: "Unassigned",
		width: "100px",
		tooltip: PROJECT_ROLES_DESC.UNASSIGNED
	},
	{
		key: PROJECT_ROLES_TYPES.ADMINSTRATOR,
		label: "Admin",
		width: "70px",
		tooltip: PROJECT_ROLES_DESC.ADMINSTRATOR
	}
];
