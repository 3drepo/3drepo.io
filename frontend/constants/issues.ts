import LensIcon from '@material-ui/icons/Lens';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import AdjustIcon from '@material-ui/icons/Adjust';
import Print from '@material-ui/icons/Print';
import Download from '@material-ui/icons/CloudDownload';
import Upload from '@material-ui/icons/CloudUpload';
import { SortAmountUp, SortAmountDown } from '../routes/components/fontAwesomeIcon';

import ViewModule from '@material-ui/icons/ViewModule';

import { DATA_TYPES } from '../routes/components/filterPanel/filterPanel.component';

export const ISSUE_PANEL_NAME = 'issue';

export const STATUSES = {
	OPEN: 'open',
	IN_PROGRESS: 'in progress',
	FOR_APPROVAL: 'for approval',
  CLOSED: 'closed'
};

export const PRIORITIES = {
	NONE: 'none',
	LOW: 'low',
	MEDIUM: 'medium',
	HIGH: 'high'
};

const TOPIC_TYPES = {
	FOR_INFORMATION: 'for_information'
};

export const DEFAULT_PROPORTIES = {
	STATUS: STATUSES.OPEN,
	PRIORITY: PRIORITIES.NONE,
	TOPIC_TYPE: TOPIC_TYPES.FOR_INFORMATION
};

export const ISSUE_TOPIC_TYPES = [
	{ value: 'clash', name: 'Clash' },
	{ value: 'diff', name: 'Diff' },
	{ value: 'rfi', name: 'RFI' },
	{ value: 'risk', name: 'Risk' },
	{ value: 'hs', name: 'H&S' },
	{ value: 'design', name: 'Design' },
	{ value: 'constructibility', name: 'Constructibility' },
	{ value: 'gis', name: 'GIS' },
	{ value: 'for_information', name: 'For information' },
	{ value: 'vr', name: 'VR' }
];

export const ISSUE_STATUSES = [
	{ value: STATUSES.OPEN, name: 'Open' },
	{ value: STATUSES.IN_PROGRESS, name: 'In progress'},
	{ value: STATUSES.FOR_APPROVAL, name: 'For approval' },
	{ value: STATUSES.CLOSED, name: 'Closed' }
];

export const ISSUE_PRIORITIES = [
	{ value: PRIORITIES.NONE, name: 'None' },
	{ value: PRIORITIES.LOW, name: 'Low'},
	{ value: PRIORITIES.MEDIUM, name: 'Medium' },
	{ value: PRIORITIES.HIGH, name: 'High' }
];

export const STATUSES_COLOURS = {
	[PRIORITIES.NONE]: '#777777',
	[PRIORITIES.LOW]: '#4CAF50',
	[PRIORITIES.MEDIUM]: '#FF9800',
	[PRIORITIES.HIGH]: '#F44336',
	[STATUSES.CLOSED]: '#0C2F54'
};

export const STATUSES_ICONS = {
  [STATUSES.OPEN]: PanoramaFishEyeIcon,
  [STATUSES.IN_PROGRESS]: LensIcon,
  [STATUSES.FOR_APPROVAL]: AdjustIcon,
  [STATUSES.CLOSED]: CheckCircleIcon
};

export const ISSUE_FILTER_RELATED_FIELDS = {
	PRIORITY: 'priority',
	STATUS: 'status',
	CREATED_BY: 'creator_role',
	ASSIGNED_TO: 'assigned_roles',
	TYPE: 'topic_type',
	DUE_DATE: 'due_date'
};

export const ISSUE_FILTERS = [
	{
		label: 'Status',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.STATUS,
		type: DATA_TYPES.UNDEFINED
	},
	{
		label: 'Priority',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.PRIORITY,
		type: DATA_TYPES.UNDEFINED
	},
	{
		label: 'Type',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.TYPE,
		type: DATA_TYPES.UNDEFINED
	},
	{
		label: 'Created by',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.CREATED_BY,
		type: DATA_TYPES.UNDEFINED
	},
	{
		label: 'Assigned to',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.ASSIGNED_TO,
		type: DATA_TYPES.UNDEFINED
	},
	{
		label: 'Date',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.DUE_DATE,
		type: DATA_TYPES.DATE
	}
] as any;

export const ACTIONS_TYPES = {
	SORT: 'SORT'
};

export const ISSUES_ACTIONS_MENU = {
	PRINT: {
		label: 'Create Report',
		Icon: Print
	},
	IMPORT_BCF: {
		label: 'Import BCF',
		Icon: Upload
	},
	EXPORT_BCF: {
		label: 'Export BCF',
		Icon: Download
	},
	DOWNLOAD: {
		label: 'Download JSON',
		Icon: Download
	},
	SORT_BY_DATE: {
		label: 'Sort by date',
		type: ACTIONS_TYPES.SORT,
		Icon: {
			ASC: SortAmountUp,
			DESC: SortAmountDown
		}
	},
	SHOW_SUBMODEL_ISSUES: {
		label: 'Show sub model issues',
		Icon: ViewModule
	}
};
