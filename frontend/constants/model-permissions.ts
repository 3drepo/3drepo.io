export const MODEL_ROLES_TYPES = {
	ADMINISTRATOR: 'admin',
	COLLABORATOR: 'collaborator',
	COMMENTER: 'commenter',
	VIEWER: 'viewer',
	UNASSIGNED: '',
	NONE: 'none'
};

export const MODEL_ROLES_DESC = {
	UNASSIGNED: 'No access',
	VIEWER: 'Can only view',
	COMMENTER: 'View and create issues',
	COLLABORATOR: 'Full access and ability to upload/download revisions',
	ADMINISTRATOR: 'Collaborator access and edit permissions'
};

export const MODEL_ROLES_LIST = [
	{
		key: MODEL_ROLES_TYPES.UNASSIGNED,
		label: 'Unassigned',
		tooltip: MODEL_ROLES_DESC.UNASSIGNED
	},
	{
		key: MODEL_ROLES_TYPES.VIEWER,
		label: 'Viewer',
		tooltip: MODEL_ROLES_DESC.VIEWER
	},
	{
		key: MODEL_ROLES_TYPES.COMMENTER,
		label: 'Commenter',
		tooltip: MODEL_ROLES_DESC.COMMENTER
	},
	{
		key: MODEL_ROLES_TYPES.COLLABORATOR,
		label: 'Collaborator',
		tooltip: MODEL_ROLES_DESC.COLLABORATOR
	},
	{
		key: MODEL_ROLES_TYPES.ADMINISTRATOR,
		label: 'Admin',
		tooltip: MODEL_ROLES_DESC.ADMINISTRATOR
	}
];
