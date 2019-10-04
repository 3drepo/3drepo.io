import { values } from 'lodash';

import CheckCircle from '@material-ui/icons/CheckCircle';
import Download from '@material-ui/icons/CloudDownload';
import ErrorSolid from '@material-ui/icons/Error';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import NewReleases from '@material-ui/icons/NewReleases';
import Pins from '@material-ui/icons/PinDrop';
import Print from '@material-ui/icons/Print';
import SyncProblem from '@material-ui/icons/SyncProblem';
import { SortAmountDown, SortAmountUp } from '../routes/components/fontAwesomeIcon';

import { DATA_TYPES } from '../routes/components/filterPanel/filterPanel.component';
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

const LEVELS_LIST = [
	{ value: LEVELS.UNSET, name: 'UNSET' },
	{ value: LEVELS.VERY_LOW, name: 'Very Low' },
	{ value: LEVELS.LOW, name: 'Low' },
	{ value: LEVELS.MODERATE, name: 'Moderate' },
	{ value: LEVELS.HIGH, name: 'High' },
	{ value: LEVELS.VERY_HIGH, name: 'Very High' }
];

export const RISK_CATEGORIES = [
	{ value: 'commercial', name: 'Commercial Issue' },
	{ value: 'environmental', name: 'Environmental Issue' },
	{ value: 'health_material_effect', name: 'Health - Material effect' },
	{ value: 'health_mechanical_effect', name: 'Health - Mechanical effect' },
	{ value: 'safety_fall', name: 'Safety Issue - Fall' },
	{ value: 'safety_trapped', name: 'Safety Issue - Trapped' },
	{ value: 'safety_event', name: 'Safety Issue - Event' },
	{ value: 'safety_handling', name: 'Safety Issue - Handling' },
	{ value: 'safety_struck', name: 'Safety Issue - Struck' },
	{ value: 'safety_public', name: 'Safety Issue - Public' },
	{ value: 'social', name: 'Social Issue' },
	{ value: 'other', name: 'Other Issue' },
	{ value: 'unknown', name: 'UNKNOWN' },
	{ value: '', name: 'UNSET' }
];

export const RISK_LIKELIHOODS = [...LEVELS_LIST];

export const RISK_CONSEQUENCES = [...LEVELS_LIST];

export const LEVELS_OF_RISK = [...LEVELS_LIST];

export const RISK_LEVELS = {
	UNMITIGATED: '',
	PROPOSED: 'proposed',
	AGREED_PARTIAL: 'agreed_partial',
	AGREED_FULLY: 'agreed_fully',
	REJECTED: 'rejected'
};

export const RISK_MITIGATION_STATUSES = [
	{ value: RISK_LEVELS.UNMITIGATED, name: 'Unmitigated' },
	{ value: RISK_LEVELS.PROPOSED, name: 'Proposed'},
	{ value: RISK_LEVELS.AGREED_PARTIAL, name: 'Agreed (Partial)' },
	{ value: RISK_LEVELS.AGREED_FULLY, name: 'Agreed (Fully)' },
	{ value: RISK_LEVELS.REJECTED, name: 'Rejected' }
];

export const RISK_LEVELS_ICONS = {
	[RISK_LEVELS.UNMITIGATED]: NewReleases,
	[RISK_LEVELS.PROPOSED]: ErrorOutline,
	[RISK_LEVELS.AGREED_PARTIAL]: ErrorSolid,
	[RISK_LEVELS.AGREED_FULLY]: CheckCircle,
	[RISK_LEVELS.REJECTED]: SyncProblem
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

export const RISK_FILTER_DATA_TYPES = {
	NORMAL: DATA_TYPES.UNDEFINED,
	QUERY: DATA_TYPES.QUERY
};

export const RISK_FILTER_RELATED_FIELDS = {
	MITIGATION_STATUS: 'mitigation_status',
	CREATED_BY: 'creator_role',
	RISK_OWNER: 'assigned_roles',
	CATEGORY: 'category',
	RISK_CONSEQUENCE: 'consequence',
	RISK_LIKELIHOOD: 'likelihood',
	LEVEL_OF_RISK: 'level_of_risk',
	RESIDUAL_CONSEQUENCE: 'residual_consequence',
	RESIDUAL_LIKELIHOOD: 'residual_likelihood',
	RESIDUAL_LEVEL_OF_RISK: 'residual_level_of_risk',
	OVERALL_LEVEL_OF_RISK: 'overall_level_of_risk'
};

export const RISK_FILTERS = [
	{
		label: 'Category',
		relatedField: RISK_FILTER_RELATED_FIELDS.CATEGORY,
		type: RISK_FILTER_DATA_TYPES.NORMAL
	},
	{
		label: 'Mitigation Status',
		relatedField: RISK_FILTER_RELATED_FIELDS.MITIGATION_STATUS,
		type: RISK_FILTER_DATA_TYPES.NORMAL
	},
	{
		label: 'Created by',
		relatedField: RISK_FILTER_RELATED_FIELDS.CREATED_BY,
		type: RISK_FILTER_DATA_TYPES.NORMAL
	},
	{
		label: 'Risk owner',
		relatedField: RISK_FILTER_RELATED_FIELDS.RISK_OWNER,
		type: RISK_FILTER_DATA_TYPES.NORMAL
	},
	{
		label: 'Risk likelihood',
		relatedField: RISK_FILTER_RELATED_FIELDS.RISK_LIKELIHOOD,
		type: RISK_FILTER_DATA_TYPES.NORMAL
	},
	{
		label: 'Risk consequence',
		relatedField: RISK_FILTER_RELATED_FIELDS.RISK_CONSEQUENCE,
		type: RISK_FILTER_DATA_TYPES.NORMAL
	},
	{
		label: 'Level of risk',
		relatedField: RISK_FILTER_RELATED_FIELDS.LEVEL_OF_RISK,
		type: RISK_FILTER_DATA_TYPES.NORMAL
	},
	{
		label: 'Residual likelihood',
		relatedField: RISK_FILTER_RELATED_FIELDS.RESIDUAL_LIKELIHOOD,
		type: RISK_FILTER_DATA_TYPES.NORMAL
	},
	{
		label: 'Residual consequence',
		relatedField: RISK_FILTER_RELATED_FIELDS.RESIDUAL_CONSEQUENCE,
		type: RISK_FILTER_DATA_TYPES.NORMAL
	},
	{
		label: 'Residual level of risk',
		relatedField: RISK_FILTER_RELATED_FIELDS.RESIDUAL_LEVEL_OF_RISK,
		type: RISK_FILTER_DATA_TYPES.NORMAL
	},
	{
		label: 'Overall level of risk',
		relatedField: RISK_FILTER_RELATED_FIELDS.OVERALL_LEVEL_OF_RISK,
		type: RISK_FILTER_DATA_TYPES.NORMAL
	}
] as any;

export const ACTIONS_TYPES = {
	SORT: 'SORT'
};

export const RISKS_ACTIONS_MENU = {
	PRINT: {
		label: 'Create Report',
		Icon: Print
	},
	SHOW_PINS: {
		label:  'Show Pins',
		Icon: Pins,
		enabled:  true
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
	}
};
