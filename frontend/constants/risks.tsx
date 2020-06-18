import IconComponent from '@material-ui/core/SvgIcon';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Download from '@material-ui/icons/CloudDownload';
import ErrorSolid from '@material-ui/icons/Error';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import HighlightOff from '@material-ui/icons/HighlightOff';
import NewReleases from '@material-ui/icons/NewReleases';
import Pins from '@material-ui/icons/PinDrop';
import Print from '@material-ui/icons/Print';
import SyncProblem from '@material-ui/icons/SyncProblem';
import React from 'react';
import styled from 'styled-components';

import { FILTER_TYPES } from '../routes/components/filterPanel/filterPanel.component';
import { SortAmountDown, SortAmountUp } from '../routes/components/fontAwesomeIcon';
import { COLOR, PIN_COLORS } from '../styles';

export const RISK_PANEL_NAME = 'risk';

const Icon = styled(IconComponent)`
	&& {
		justify-content: center;
		align-items: center;

		svg path {
			stroke: currentColor;
		}
	}
`;

// tslint:disable-next-line
export const risksIconPath = 'M50,71.41c-1.52,0-3-1.09-4.12-3.08L27.1,35.67c-1.14-2-1.35-3.8-.58-5.12S29,28.5,31.25,28.5h37.5c2.29,0,4,.73,4.73,2.05s.56,3.14-.58,5.12L54.12,68.33C53,70.32,51.52,71.41,50,71.41Zm0-14.35a3.22,3.22,0,1,0,3.3,3.22A3.26,3.26,0,0,0,50,57.06Zm0-25a4.16,4.16,0,0,0-3.35,1.67c-1.61,2-2.06,5.46-1.22,9.26C46.49,47.79,48.15,53.5,50,53.5S53.51,47.79,54.57,43c.84-3.8.39-7.26-1.22-9.27A4.19,4.19,0,0,0,50,32.06Z';

export const RisksIcon = (props) => (
		<Icon viewBox="0 0 49.86 44.91" {...props}>
			<g>
				<path
					stroke="none"
					paintOrder="fill stroke markers"
					d={risksIconPath}
					transform="translate(-25.07 -27.5)"
				/>
			</g>
		</Icon>
);

export const LEVELS = {
	UNSET: -1,
	VERY_LOW: 0,
	LOW: 1,
	MODERATE: 2,
	HIGH: 3,
	VERY_HIGH: 4
};

export const LEVELS_LIST = [
	{ value: LEVELS.UNSET, name: 'UNSET' },
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
export const ATTACHMENTS_RISK_TYPE = 'attachments';

export const RISK_TABS = {
	RISK: 'Risk',
	TREATMENT: 'Treatment',
	ATTACHMENTS: 'Attachments',
};

export const RISK_LEVELS = {
	UNMITIGATED: '',
	PROPOSED: 'proposed',
	AGREED_PARTIAL: 'agreed_partial',
	AGREED_FULLY: 'agreed_fully',
	REJECTED: 'rejected',
	VOID: 'void',
};

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
		type: RISK_FILTER_FILTER_TYPES.NORMAL
	},
	{
		label: 'Mitigation Status',
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
		isSorting: true,
		Icon: {
			ASC: SortAmountUp,
			DESC: SortAmountDown
		}
	}
};
