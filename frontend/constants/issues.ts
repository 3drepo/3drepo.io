import AdjustIcon from '@material-ui/icons/Adjust';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Download from '@material-ui/icons/CloudDownload';
import Upload from '@material-ui/icons/CloudUpload';
import HighlightOff from '@material-ui/icons/HighlightOff';
import LensIcon from '@material-ui/icons/Lens';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import Pins from '@material-ui/icons/PinDrop';
import Print from '@material-ui/icons/Print';
import { SortAmountDown, SortAmountUp } from '../routes/components/fontAwesomeIcon';

import ViewModule from '@material-ui/icons/ViewModule';

import { FILTER_TYPES } from '../routes/components/filterPanel/filterPanel.component';
import { COLOR, PIN_COLORS } from '../styles';

export const ISSUE_PANEL_NAME = 'issue';

export const ISSUE_PROPERTIES_TAB = 'issue';
export const ISSUE_SEQUENCING_TAB = 'sequencing';
export const ATTACHMENTS_ISSUE_TAB = 'attachments';

export const ISSUE_TABS = {
	ISSUE: 'Properties',
	SEQUENCING: 'Sequencing',
	ATTACHMENTS: 'Attachments',
};

export const STATUSES = {
	OPEN: 'open',
	IN_PROGRESS: 'in progress',
	FOR_APPROVAL: 'for approval',
	CLOSED: 'closed',
	VOID: 'void',
};

export const ISSUE_DEFAULT_HIDDEN_STATUSES = [STATUSES.CLOSED, STATUSES.VOID];

export const PRIORITIES = {
	NONE: 'none',
	LOW: 'low',
	MEDIUM: 'medium',
	HIGH: 'high'
};

export const DEFAULT_PROPERTIES = {
	STATUS: STATUSES.OPEN,
	PRIORITY: PRIORITIES.NONE,
	TOPIC_TYPE: 'For Information'
};

export const ISSUE_STATUSES = [
	{ value: STATUSES.OPEN, name: 'Open' },
	{ value: STATUSES.IN_PROGRESS, name: 'In progress'},
	{ value: STATUSES.FOR_APPROVAL, name: 'For approval' },
	{ value: STATUSES.CLOSED, name: 'Closed' },
	{ value: STATUSES.VOID, name: 'Void' },
];

export const ISSUE_PRIORITIES = [
	{ value: PRIORITIES.NONE, name: 'None' },
	{ value: PRIORITIES.LOW, name: 'Low'},
	{ value: PRIORITIES.MEDIUM, name: 'Medium' },
	{ value: PRIORITIES.HIGH, name: 'High' }
];

export const ISSUE_COLORS = {
	[PRIORITIES.NONE]: {
		color: COLOR.SOFT_BLUE,
		pinColor: PIN_COLORS.VIVID_NAVY
	},
	[PRIORITIES.LOW]: {
		color: COLOR.LIGHT_YELLOW,
		pinColor: PIN_COLORS.VIVID_YELLOW
	},
	[PRIORITIES.MEDIUM]: {
		color: COLOR.LIGHT_ORANGE,
		pinColor: PIN_COLORS.VIVID_ORANGE
	},
	[PRIORITIES.HIGH]: {
		color: COLOR.SOFT_RED,
		pinColor: PIN_COLORS.VIVID_RED
	},
	[STATUSES.CLOSED]: {
		color: COLOR.LIGHT_GRAYISH_GREEN,
		pinColor: PIN_COLORS.GREEN
	},
};

export const STATUSES_ICONS = {
	[STATUSES.OPEN]: PanoramaFishEyeIcon,
	[STATUSES.IN_PROGRESS]: LensIcon,
	[STATUSES.FOR_APPROVAL]: AdjustIcon,
	[STATUSES.CLOSED]: CheckCircleIcon,
	[STATUSES.VOID]: HighlightOff,
};

export const ISSUE_FILTER_RELATED_FIELDS = {
	PRIORITY: 'priority',
	STATUS: 'status',
	CREATED_BY: 'creator_role',
	ASSIGNED_TO: 'assigned_roles',
	TYPE: 'topic_type',
	CREATED_DATE: 'created',
	START_DATETIME: 'sequence_start'
};

export const ISSUE_FILTERS = [
	{
		label: 'Status',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.STATUS,
		type: FILTER_TYPES.UNDEFINED
	},
	{
		label: 'Priority',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.PRIORITY,
		type: FILTER_TYPES.UNDEFINED
	},
	{
		label: 'Type',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.TYPE,
		type: FILTER_TYPES.UNDEFINED
	},
	{
		label: 'Created by',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.CREATED_BY,
		type: FILTER_TYPES.UNDEFINED
	},
	{
		label: 'Assigned to',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.ASSIGNED_TO,
		type: FILTER_TYPES.UNDEFINED
	},
	{
		label: 'Date',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.CREATED_DATE,
		type: FILTER_TYPES.DATE
	},
	{
		label: 'Starting Date',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.START_DATETIME,
		type: FILTER_TYPES.DATE
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
	SORT_ORDER: {
		label: 'Sort order',
		ASC: SortAmountUp,
		DESC: SortAmountDown,
	},
	SHOW_PINS: {
		label: 'Show Pins',
		Icon: Pins,
		enabled: true
	},
	SHOW_SUBMODEL_ISSUES: {
		label: 'Show sub model issues',
		Icon: ViewModule
	},
	SHOW_CLOSED_ISSUES: {
		label: 'Show closed issues',
		Icon: ViewModule
	}
};
