export const MODEL_ROLES_TYPES = {
	ADMINSTRATOR: "admin",
	COLLABORATOR: "collaborator",
	COMMENTER: "commenter",
	VIEWER: "viewer",
	UNASSIGNED: null,
	NONE: "none"
};

export const MODEL_ROLES_LIST = [
	{
		key: MODEL_ROLES_TYPES.UNASSIGNED,
		label: "Unassigned"
	},
	{
		key: MODEL_ROLES_TYPES.VIEWER,
		label: "Viewer"
	},
	{
		key: MODEL_ROLES_TYPES.COMMENTER,
		label: "Commenter"
	},
	{
		key: MODEL_ROLES_TYPES.COLLABORATOR,
		label: "Collaborator"
	},
	{
		key: MODEL_ROLES_TYPES.ADMINSTRATOR,
		label: "Admin"
	}
];
