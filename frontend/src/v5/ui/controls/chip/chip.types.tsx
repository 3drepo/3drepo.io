/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { formatMessage } from '@/v5/services/intl';

import FlagOutlineIcon from '@assets/icons/outlined/flag-outlined.svg';
import FlagFillIcon from '@assets/icons/filled/flag-filled.svg';
import StarIcon from '@assets/icons/outlined/star-outlined.svg';
import ClockIcon from '@assets/icons/outlined/clock-outlined.svg';
import BellIcon from '@assets/icons/outlined/bell-outlined.svg';
import TickIcon from '@assets/icons/outlined/tick-outlined.svg';

import { ChipProps } from '@mui/material';
import { ReactElement } from 'react';
import { COLOR } from '../../themes/theme';
import { PaddedCrossIcon } from './chip.styles';

export type IChip = Omit<ChipProps, 'color' | 'variant'> & {
	color?: string;
	variant?: 'text' | 'outlined' | 'filled';
	tooltip?: string;
};

export type IChipMapItem = {
	label: string;
	icon?: ReactElement;
	color?: string;
	tooltip?: string;
};
export type IChipMap = {[key: string]: IChipMapItem};

export enum PriorityLevels {
	NONE = 'None',
	LOW = 'Low',
	MEDIUM = 'Medium',
	HIGH = 'High',
}
export enum RiskLevels {
	UNSET = 'Unset',
	VERY_LOW = 'Very Low',
	LOW = 'Low',
	MODERATE = 'Moderate',
	HIGH = 'High',
	VERY_HIGH = 'Very High',
}
export enum TicketStatuses {
	OPEN = 'Open',
	IN_PROGRESS = 'In Progress',
	FOR_APPROVAL = 'For Approval',
	CLOSED = 'Closed',
	VOID = 'Void',
}
export enum TreatmentStatuses {
	UNTREATED = 'Untreated',
	PROPOSED = 'Proposed',
	AGREED_PARTIAL = 'Agreed (Partial)',
	AGREED_FULLY = 'Agreed (Fully)',
	REJECTED = 'Rejected',
	VOID = 'Void',
}

export const PRIORITY_LEVELS_MAP = {
	[PriorityLevels.NONE]: {
		label: formatMessage({ id: 'chip.priorityLevel.none.label', defaultMessage: 'None' }),
		tooltip: formatMessage({ id: 'chip.priorityLevel.none.tooltip', defaultMessage: 'No priority' }),
		color: COLOR.BASE_MAIN,
		icon: <FlagOutlineIcon />,
	},
	[PriorityLevels.LOW]: {
		label: formatMessage({ id: 'chip.priorityLevel.low.label', defaultMessage: 'Low' }),
		tooltip: formatMessage({ id: 'chip.priorityLevel.low.tooltip', defaultMessage: 'Low priority' }),
		color: '#0288D1',
		icon: <FlagFillIcon />,
	},
	[PriorityLevels.MEDIUM]: {
		label: formatMessage({ id: 'chip.priorityLevel.medium.label', defaultMessage: 'Medium' }),
		tooltip: formatMessage({ id: 'chip.priorityLevel.medium.tooltip', defaultMessage: 'Medium priority' }),
		color: '#ED6C02',
		icon: <FlagFillIcon />,
	},
	[PriorityLevels.HIGH]: {
		label: formatMessage({ id: 'chip.priorityLevel.high.label', defaultMessage: 'High' }),
		tooltip: formatMessage({ id: 'chip.priorityLevel.high.tooltip', defaultMessage: 'High priority' }),
		color: COLOR.ERROR_MAIN,
		icon: <FlagFillIcon />,
	},
};

export const RISK_LEVELS_MAP = {
	[RiskLevels.UNSET]: {
		label: formatMessage({ id: 'chip.riskLevel.unset', defaultMessage: 'Unset Risk' }),
		color: COLOR.BASE_LIGHT,
	},
	[RiskLevels.VERY_LOW]: {
		label: formatMessage({ id: 'chip.riskLevel.veryLow', defaultMessage: 'Very Low Risk' }),
		color: COLOR.FAVOURITE_MAIN,
	},
	[RiskLevels.LOW]: {
		label: formatMessage({ id: 'chip.riskLevel.low', defaultMessage: 'Low Risk' }),
		color: '#FF9800',
	},
	[RiskLevels.MODERATE]: {
		label: formatMessage({ id: 'chip.riskLevel.moderate', defaultMessage: 'Moderate Risk' }),
		color: '#ED6C02',
	},
	[RiskLevels.HIGH]: {
		label: formatMessage({ id: 'chip.riskLevel.high', defaultMessage: 'High Risk' }),
		color: COLOR.ERROR_MAIN,
	},
	[RiskLevels.VERY_HIGH]: {
		label: formatMessage({ id: 'chip.riskLevel.veryHigh', defaultMessage: 'Very High Risk' }),
		color: '#000000',
	},
};

export const STATUS_MAP = {
	[TicketStatuses.OPEN]: {
		label: formatMessage({ id: 'chip.ticketStatus.open', defaultMessage: 'Open' }),
		color: COLOR.BASE_MAIN,
		icon: <StarIcon />,
	},
	[TicketStatuses.IN_PROGRESS]: {
		label: formatMessage({ id: 'chip.ticketStatus.inProgress', defaultMessage: 'In Progress' }),
		color: '#7156FF',
		icon: <ClockIcon />,
	},
	[TicketStatuses.FOR_APPROVAL]: {
		label: formatMessage({ id: 'chip.ticketStatus.forApproval', defaultMessage: 'For Approval' }),
		color: '#0288D1',
		icon: <BellIcon />,
	},
	[TicketStatuses.CLOSED]: {
		label: formatMessage({ id: 'chip.ticketStatus.closed', defaultMessage: 'Closed' }),
		color: '#2E7D32',
		icon: <TickIcon />,
	},
	[TicketStatuses.VOID]: {
		label: formatMessage({ id: 'chip.ticketStatus.void', defaultMessage: 'Void' }),
		color: '#000',
		icon: <PaddedCrossIcon />,
	},
};

export const TREATMENT_LEVELS_MAP = {
	[TreatmentStatuses.UNTREATED]: {
		label: formatMessage({ id: 'chip.treatmentLevel.untreated', defaultMessage: 'Untreated' }),
		color: COLOR.BASE_LIGHT,
	},
	[TreatmentStatuses.PROPOSED]: {
		label: formatMessage({ id: 'chip.treatmentLevel.proposed', defaultMessage: 'Proposed' }),
		color: '#0288D1',
	},
	[TreatmentStatuses.AGREED_PARTIAL]: {
		label: formatMessage({ id: 'chip.treatmentLevel.agreedPartial', defaultMessage: 'Agreed (Partial)' }),
		color: '#4CAF50',
	},
	[TreatmentStatuses.AGREED_FULLY]: {
		label: formatMessage({ id: 'chip.treatmentLevel.agreedFully', defaultMessage: 'Agreed (Fully)' }),
		color: '#2E7D32',
	},
	[TreatmentStatuses.REJECTED]: {
		label: formatMessage({ id: 'chip.treatmentLevel.rejected', defaultMessage: 'Rejected' }),
		color: COLOR.ERROR_MAIN,
	},
	[TreatmentStatuses.VOID]: {
		label: formatMessage({ id: 'chip.treatmentLevel.void', defaultMessage: 'Void' }),
		color: '#000000',
	},
};
