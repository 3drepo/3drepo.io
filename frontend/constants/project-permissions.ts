export const PROJECT_ROLES_TYPES = {
	ADMINISTRATOR: 'admin_project',
	UNASSIGNED: ''
};

export const PROJECT_ROLES_DESC = {
	UNASSIGNED: 'No access',
	ADMINISTRATOR: 'Collaborator access and edit permissions'
};

export const PROJECT_ROLES_LIST = [
	{
		key: PROJECT_ROLES_TYPES.UNASSIGNED,
		label: 'Unassigned',
		width: '100px',
		tooltip: PROJECT_ROLES_DESC.UNASSIGNED
	},
	{
		key: PROJECT_ROLES_TYPES.ADMINISTRATOR,
		label: 'Admin',
		width: '100px',
		tooltip: PROJECT_ROLES_DESC.ADMINISTRATOR
	}
];
