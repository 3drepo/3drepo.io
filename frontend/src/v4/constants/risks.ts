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

import CheckCircle from '@mui/icons-material/CheckCircle';
import Download from '@mui/icons-material/CloudDownload';
import ErrorSolid from '@mui/icons-material/Error';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import HighlightOff from '@mui/icons-material/HighlightOff';
import NewReleases from '@mui/icons-material/NewReleases';
import Pins from '@mui/icons-material/PinDrop';
import SyncProblem from '@mui/icons-material/SyncProblem';

import { FILTER_TYPES } from '../routes/components/filterPanel/filterPanel';
import { SortAmountDown, SortAmountUp } from '../routes/components/fontAwesomeIcon';
import { COLOR, PIN_COLORS } from '../styles';

export const RISK_PANEL_NAME = 'risk';

export const LEVELS = {
	UNSET: -1,
	VERY_LOW: 0,
	LOW: 1,
	MODERATE: 2,
	HIGH: 3,
	VERY_HIGH: 4
};

export const LEVELS_RENDER_VALUE = {
	[LEVELS.UNSET]: 'Unset',
	[LEVELS.VERY_LOW]: 'Very Low',
	[LEVELS.LOW]: 'Low',
	[LEVELS.MODERATE]: 'Moderate',
	[LEVELS.HIGH]: 'High',
	[LEVELS.VERY_HIGH]: 'Very High'
};

export const LEVELS_LIST = [
	{ value: LEVELS.UNSET, name: 'Unset'},
	{ value: LEVELS.VERY_LOW, name: 'Very Low' },
	{ value: LEVELS.LOW, name: 'Low' },
	{ value: LEVELS.MODERATE, name: 'Moderate' },
	{ value: LEVELS.HIGH, name: 'High' },
	{ value: LEVELS.VERY_HIGH, name: 'Very High' }
];

export const RISK_LIKELIHOODS = [...LEVELS_LIST];

export const RISK_CONSEQUENCES = [...LEVELS_LIST];

export const LEVELS_OF_RISK = [...LEVELS_LIST];

export const MAIN_RISK_TYPE = 'risk';
export const TREATMENT_RISK_TYPE = 'treatment';
export const SEQUENCING_RISK_TYPE = 'sequencing';
export const SHAPES_RISK_TYPE = 'shapes';
export const ATTACHMENTS_RISK_TYPE = 'attachments';

export const RISK_TABS = {
	RISK: 'Risk',
	TREATMENT: 'Treatment',
	SHAPES: 'Shapes',
	ATTACHMENTS: 'Attachments',
	SEQUENCING: '4D',
};

export const RISK_LEVELS = {
	UNMITIGATED: '',
	PROPOSED: 'proposed',
	AGREED_PARTIAL: 'agreed_partial',
	AGREED_FULLY: 'agreed_fully',
	REJECTED: 'rejected',
	VOID: 'void',
};

export const RISK_DEFAULT_HIDDEN_LEVELS = [RISK_LEVELS.AGREED_FULLY, RISK_LEVELS.VOID];

export const RISK_MITIGATION_STATUSES = [
	{ value: RISK_LEVELS.UNMITIGATED, name: 'Unmitigated' },
	{ value: RISK_LEVELS.PROPOSED, name: 'Proposed'},
	{ value: RISK_LEVELS.AGREED_PARTIAL, name: 'Agreed (Partial)' },
	{ value: RISK_LEVELS.AGREED_FULLY, name: 'Agreed (Fully)' },
	{ value: RISK_LEVELS.REJECTED, name: 'Rejected' },
	{ value: RISK_LEVELS.VOID, name: 'Void' },
];

export const RISK_LEVELS_ICONS = {
	[RISK_LEVELS.UNMITIGATED]: NewReleases,
	[RISK_LEVELS.PROPOSED]: ErrorOutline,
	[RISK_LEVELS.AGREED_PARTIAL]: ErrorSolid,
	[RISK_LEVELS.AGREED_FULLY]: CheckCircle,
	[RISK_LEVELS.REJECTED]: SyncProblem,
	[RISK_LEVELS.VOID]: HighlightOff,
};

export const RISK_LEVELS_COLOURS = {
	[LEVELS.UNSET]: {
		color: COLOR.SOFT_BLUE,
		pinColor: PIN_COLORS.VIVID_NAVY
	},
	[LEVELS.VERY_LOW]: {
		color: COLOR.LIGHT_GRAYISH_GREEN,
		pinColor: PIN_COLORS.GREEN
	},
	[LEVELS.LOW]: {
		color: COLOR.SOFT_YELLOW_GREEN,
		pinColor: PIN_COLORS.LIME_GREEN
	},
	[LEVELS.MODERATE]: {
		color: COLOR.LIGHT_YELLOW,
		pinColor: PIN_COLORS.LEMON_CHIFFON
	},
	[LEVELS.HIGH]: {
		color: COLOR.LIGHT_ORANGE,
		pinColor: PIN_COLORS.VIVID_ORANGE
	},
	[LEVELS.VERY_HIGH]: {
		color: COLOR.SOFT_RED,
		pinColor: PIN_COLORS.VIVID_RED
	}
};

export const RISK_FILTER_FILTER_TYPES = {
	NORMAL: FILTER_TYPES.UNDEFINED,
	QUERY: FILTER_TYPES.QUERY
};

export const RISK_FILTER_RELATED_FIELDS = {
	MITIGATION_STATUS: 'mitigation_status',
	CREATED_BY: 'creator_role',
	RISK_OWNER: 'assigned_roles',
	CATEGORY: 'category',
	ELEMENT: 'element',
	LOCATION: 'location_desc',
	DUE_DATE: 'due_date',
	RISK_CONSEQUENCE: 'consequence',
	RISK_FACTOR: 'risk_factor',
	ASSOCIATED_ACTIVITY: 'associated_activity',
	SCOPE: 'scope',
	MITIGATION_STAGE: 'mitigation_stage',
	MITIGATION_TYPE: 'mitigation_type',
	RISK_LIKELIHOOD: 'likelihood',
	LEVEL_OF_RISK: 'level_of_risk',
	RESIDUAL_CONSEQUENCE: 'residual_consequence',
	RESIDUAL_LIKELIHOOD: 'residual_likelihood',
	RESIDUAL_LEVEL_OF_RISK: 'residual_level_of_risk',
	OVERALL_LEVEL_OF_RISK: 'overall_level_of_risk',
	START_DATETIME: 'sequence_start'
};

export const DEFAULT_RISKS_FILTERS = [
	{
		label: 'Treatment Status',
		relatedField: RISK_FILTER_RELATED_FIELDS.MITIGATION_STATUS,
		type: FILTER_TYPES.UNDEFINED,
		value: { value: RISK_LEVELS.UNMITIGATED, label: 'Unmitigated' },
	},
	{
		label: 'Treatment Status',
		relatedField: RISK_FILTER_RELATED_FIELDS.MITIGATION_STATUS,
		type: FILTER_TYPES.UNDEFINED,
		value: { value: RISK_LEVELS.PROPOSED, label: 'Proposed' },
	},
	{
		label: 'Treatment Status',
		relatedField: RISK_FILTER_RELATED_FIELDS.MITIGATION_STATUS,
		type: FILTER_TYPES.UNDEFINED,
		value: { value: RISK_LEVELS.AGREED_PARTIAL, label: 'Agreed (Partial)' },
	},
	{
		label: 'Treatment Status',
		relatedField: RISK_FILTER_RELATED_FIELDS.MITIGATION_STATUS,
		type: FILTER_TYPES.UNDEFINED,
		value: { value: RISK_LEVELS.REJECTED, label: 'Rejected' },
	},
];

export const RISK_FILTERS = [
	{
		label: 'Category',
		relatedField: RISK_FILTER_RELATED_FIELDS.CATEGORY,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Treatment Status',
		relatedField: RISK_FILTER_RELATED_FIELDS.MITIGATION_STATUS,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Created by',
		relatedField: RISK_FILTER_RELATED_FIELDS.CREATED_BY,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Risk owner',
		relatedField: RISK_FILTER_RELATED_FIELDS.RISK_OWNER,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Element type',
		relatedField: RISK_FILTER_RELATED_FIELDS.ELEMENT,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Location',
		relatedField: RISK_FILTER_RELATED_FIELDS.LOCATION,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Risk factor',
		relatedField: RISK_FILTER_RELATED_FIELDS.RISK_FACTOR,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Construction Scope',
		relatedField: RISK_FILTER_RELATED_FIELDS.SCOPE,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Associated activity',
		relatedField: RISK_FILTER_RELATED_FIELDS.ASSOCIATED_ACTIVITY,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Stage',
		relatedField: RISK_FILTER_RELATED_FIELDS.MITIGATION_STAGE,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Type',
		relatedField: RISK_FILTER_RELATED_FIELDS.MITIGATION_TYPE,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Risk likelihood',
		relatedField: RISK_FILTER_RELATED_FIELDS.RISK_LIKELIHOOD,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Risk consequence',
		relatedField: RISK_FILTER_RELATED_FIELDS.RISK_CONSEQUENCE,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Level of risk',
		relatedField: RISK_FILTER_RELATED_FIELDS.LEVEL_OF_RISK,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Residual likelihood',
		relatedField: RISK_FILTER_RELATED_FIELDS.RESIDUAL_LIKELIHOOD,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Residual consequence',
		relatedField: RISK_FILTER_RELATED_FIELDS.RESIDUAL_CONSEQUENCE,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Residual level of risk',
		relatedField: RISK_FILTER_RELATED_FIELDS.RESIDUAL_LEVEL_OF_RISK,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Overall level of risk',
		relatedField: RISK_FILTER_RELATED_FIELDS.OVERALL_LEVEL_OF_RISK,
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Starting Date',
		relatedField: RISK_FILTER_RELATED_FIELDS.START_DATETIME,
		type: FILTER_TYPES.DATE
	},
	{
		label: 'Due Date',
		relatedField: RISK_FILTER_RELATED_FIELDS.DUE_DATE,
		type: FILTER_TYPES.DATE
	},
] as any;

export const ACTIONS_TYPES = {
	SORT: 'SORT'
};

export const RISKS_ACTIONS_MENU = {
	SHOW_PINS: {
		label:  'Show Pins',
		Icon: Pins,
		enabled:  true
	},
	DOWNLOAD: {
		label: 'Download JSON',
		Icon: Download
	},
	SORT_ORDER: {
		label: 'Sort order',
		ASC: SortAmountUp,
		DESC: SortAmountDown,
	}
};
