import Print from '@material-ui/icons/Print';
import Download from '@material-ui/icons/CloudDownload';
import Delete from '@material-ui/icons/Delete';

export const GROUPS_TYPES = {
	NORMAL: 'normal',
	SMART: 'smart'
};

export const GROUPS_ACTIONS_ITEMS = {
	OVERRIDE_ALL: 'overrideAll',
	DOWNLOAD: 'download',
	DELETE_ALL: 'deleteAll'
};

export const GROUPS_ACTIONS_MENU = [
	{
		name: GROUPS_ACTIONS_ITEMS.OVERRIDE_ALL,
		label: 'Override All',
		Icon: Print
	},
	{
		name: GROUPS_ACTIONS_ITEMS.DELETE_ALL,
		label: 'Delete All',
		Icon: Delete
	},
	{
		name: GROUPS_ACTIONS_ITEMS.DOWNLOAD,
		label: 'Download JSON',
		Icon: Download
	}
];

export const DEFAULT_OVERRIDE_COLOR = 'rgba(0, 0, 0, 0.54)';
