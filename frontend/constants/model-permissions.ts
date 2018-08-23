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
		label: "Unassigned",
		width: "100px"
	},
	{
		key: MODEL_ROLES_TYPES.VIEWER,
		label: "Viewer",
		width: "70px"
	},
	{
		key: MODEL_ROLES_TYPES.COMMENTER,
		label: "Commenter",
		width: "100px"
	},
	{
		key: MODEL_ROLES_TYPES.COLLABORATOR,
		label: "Collaborator",
		width: "100px"
	},
	{
		key: MODEL_ROLES_TYPES.ADMINSTRATOR,
		label: "Admin",
		width: "70px"
	}
];
