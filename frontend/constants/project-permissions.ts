export const PROJECT_ROLES_TYPES = {
	ADMINSTRATOR: "admin_project",
	UNASSIGNED: null
};

export const PROJECT_ROLES_LIST = [
	{
		key: PROJECT_ROLES_TYPES.UNASSIGNED,
		label: "Unassigned",
		width: "100px"
	},
	{
		key: PROJECT_ROLES_TYPES.ADMINSTRATOR,
		label: "Admin",
		width: "70px"
	}
];
