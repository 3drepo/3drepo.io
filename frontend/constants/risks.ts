import NewReleases from '@material-ui/icons/NewReleases';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import ErrorSolid from '@material-ui/icons/Error';
import CheckCircle from '@material-ui/icons/CheckCircle';
import SyncProblem from '@material-ui/icons/SyncProblem';

import { values } from 'lodash';

const LEVELS = {
	VERY_LOW: { value: 0, label: 'Very Low' },
	LOW: { value: 1, label: 'Low' },
	MODERATE: { value: 2, label: 'Moderate' },
	HIGH: { value: 3, label: 'High' },
	VERY_HIGHT: { value: 4, label: 'Very High' }
};

const LEVELS_LIST = values(LEVELS);

export const RISK_CATEGORIES = [
	{ value: 'health_material_effect', label: 'Health - Material effect' },
	{ value: 'health_mechanical_effect', label: 'Health - Mechanical effect' },
	{ value: 'safety_fall', label: 'Safety Issue - Fall' },
	{ value: 'safety_trapped', label: 'Safety Issue - Trapped' },
	{ value: 'safety_event', label: 'Safety Issue - Event' },
	{ value: 'safety_handling', label: 'Safety Issue - Handling' },
	{ value: 'safety_struck', label: 'Safety Issue - Struck' },
	{ value: 'safety_public', label: 'Safety Issue - Public' },
	{ value: 'environmental', label: 'Environmental Issue' },
	{ value: 'commercial', label: 'Commercial Issue' },
	{ value: 'social', label: 'Social Issue' },
	{ value: 'other', label: 'Other Issue' },
	{ value: 'unknown', label: 'UNKNOWN' },
	{ value: '', label: 'UNSET' }
];

export const RISK_LIKELIHOODS = [...LEVELS_LIST];

export const RISK_CONSEQUENCES = [...LEVELS_LIST];

export const RISK_LEVELS = {
	UNMITIGATED: '',
	PROPOSED: 'proposed',
	AGREED_PARTIAL: 'agreed_partial',
	AGREED_FULLY: 'agreed_fully',
	REJECTED: 'rejected'
};

export const RISK_LEVELS_LIST = [
	{ value: RISK_LEVELS.UNMITIGATED, label: 'Unmitigated' },
	{ value: RISK_LEVELS.PROPOSED, label: 'Proposed'},
	{ value: RISK_LEVELS.AGREED_PARTIAL, label: 'Agreed (Partial)' },
	{ value: RISK_LEVELS.AGREED_FULLY, label: 'Agreed (Fully)' },
	{ value: RISK_LEVELS.REJECTED, label: 'Rejected' }
];

export const RISK_LEVELS_ICONS = {
	[RISK_LEVELS.UNMITIGATED]: NewReleases,
	[RISK_LEVELS.PROPOSED]: ErrorOutline,
	[RISK_LEVELS.AGREED_PARTIAL]: ErrorSolid,
	[RISK_LEVELS.AGREED_FULLY]: CheckCircle,
	[RISK_LEVELS.REJECTED]: SyncProblem
};

export const RISK_LEVELS_COLORS = ['#008000', '#32cd32', '#fffacd', '#ff8c00', '#800000'];
