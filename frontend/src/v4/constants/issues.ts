/**
 *  Copyright (C) 2021 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import AdjustIcon from '@mui/icons-material/Adjust';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Download from '@mui/icons-material/CloudDownload';
import Upload from '@mui/icons-material/CloudUpload';
import HighlightOff from '@mui/icons-material/HighlightOff';
import LensIcon from '@mui/icons-material/Lens';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import Pins from '@mui/icons-material/PinDrop';
import Print from '@mui/icons-material/Print';
import ViewModule from '@mui/icons-material/ViewModule';

import { SortAmountDown, SortAmountUp } from '../routes/components/fontAwesomeIcon';
import { FILTER_TYPES } from '../routes/components/filterPanel/filterPanel';
import { COLOR, PIN_COLORS } from '../styles';

export const ISSUE_PANEL_NAME = 'issue';

export const ISSUE_PROPERTIES_TAB = 'issue';
export const ATTACHMENTS_ISSUE_TAB = 'attachments';
export const ISSUE_SHAPES_TAB = 'shapes';
export const ISSUE_SEQUENCING_TAB = '4D';

export const ISSUE_TABS = {
	ISSUE: 'Properties',
	SHAPES: 'Shapes',
	ATTACHMENTS: 'Attachments',
	SEQUENCING: '4D',
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

export const DEFAULT_ISSUES_FILTERS = [
	{
		label: 'Status',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.STATUS,
		type: FILTER_TYPES.UNDEFINED,
		value: { value: STATUSES.OPEN, label: 'Open' },
	},
	{
		label: 'Status',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.STATUS,
		type: FILTER_TYPES.UNDEFINED,
		value: { value: STATUSES.IN_PROGRESS, label: 'In progress' },
	},
	{
		label: 'Status',
		relatedField: ISSUE_FILTER_RELATED_FIELDS.STATUS,
		type: FILTER_TYPES.UNDEFINED,
		value: { value: STATUSES.FOR_APPROVAL, label: 'For approval' },
	},
]

export const ACTIONS_TYPES = {
	SORT: 'SORT'
};

export const ISSUES_ACTIONS_MENU = {
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
