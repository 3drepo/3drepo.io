export const MODEL_ROLES_TYPES = {
	ADMINSTRATOR: "admin",
	COLLABORATOR: "collaborator",
	COMMENTER: "commenter",
	VIEWER: "viewer",
	UNASSIGNED: null,
	NONE: "none"
};

export const MODEL_ROLES_DESC = {
	UNASSIGNED: "No access",
	VIEWER: "Can only view",
	COMMENTER: "View and create issues",
	COLLABORATOR: "Full access and ability to upload/download revisions",
	ADMINSTRATOR: "Collaborator access and edit permissions"
};

export const MODEL_ROLES_LIST = [
	{
		key: MODEL_ROLES_TYPES.UNASSIGNED,
		label: "Unassigned",
		width: "100px",
		tooltip: MODEL_ROLES_DESC.UNASSIGNED
	},
	{
		key: MODEL_ROLES_TYPES.VIEWER,
		label: "Viewer",
		width: "70px",
		tooltip: MODEL_ROLES_DESC.VIEWER
	},
	{
		key: MODEL_ROLES_TYPES.COMMENTER,
		label: "Commenter",
		width: "100px",
		tooltip: MODEL_ROLES_DESC.COMMENTER
	},
	{
		key: MODEL_ROLES_TYPES.COLLABORATOR,
		label: "Collaborator",
		width: "100px",
		tooltip: MODEL_ROLES_DESC.COLLABORATOR
	},
	{
		key: MODEL_ROLES_TYPES.ADMINSTRATOR,
		label: "Admin",
		width: "70px",
		tooltip: MODEL_ROLES_DESC.ADMINSTRATOR
	}
];
