/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import FlagOutlineIcon from '@assets/icons/outlined/flag-outlined.svg';
import FlagFillIcon from '@assets/icons/filled/flag-filled.svg';
import { formatMessage } from '@/v5/services/intl';
import { omit } from 'lodash';
import { COLOR } from '@/v5/ui/themes/theme';
import { Chip } from '../chip.styles';

export enum PriorityLevels {
	NONE = 'None',
	LOW = 'Low',
	MEDIUM = 'Medium',
	HIGH = 'High',
}

const PRIORITY_LEVELS_MAP = {
	[PriorityLevels.NONE]: {
		label: formatMessage({ id: 'chip.priorityLevel.none.label', defaultMessage: 'None' }),
		title: formatMessage({ id: 'chip.priorityLevel.none.tooltip', defaultMessage: 'No priority' }),
		colour: COLOR.BASE_LIGHT,
	},
	[PriorityLevels.LOW]: {
		label: formatMessage({ id: 'chip.priorityLevel.low.label', defaultMessage: 'Low' }),
		title: formatMessage({ id: 'chip.priorityLevel.low.tooltip', defaultMessage: 'Low priority' }),
		colour: '#0288D1',
	},
	[PriorityLevels.MEDIUM]: {
		label: formatMessage({ id: 'chip.priorityLevel.medium.label', defaultMessage: 'Medium' }),
		title: formatMessage({ id: 'chip.priorityLevel.medium.tooltip', defaultMessage: 'Medium priority' }),
		colour: '#ED6C02',
	},
	[PriorityLevels.HIGH]: {
		label: formatMessage({ id: 'chip.priorityLevel.high.label', defaultMessage: 'High' }),
		title: formatMessage({ id: 'chip.priorityLevel.high.tooltip', defaultMessage: 'High priority' }),
		colour: COLOR.ERROR_MAIN,
	},
};

type IPriorityLevelChip = {
	noLabel?: boolean,
	state: PriorityLevels,
};

export const PriorityLevelChip = ({ state = PriorityLevels.NONE, noLabel = false }: IPriorityLevelChip) => {
	const props = PRIORITY_LEVELS_MAP[state];
	const refinedProps = omit(props, noLabel ? 'label' : 'title');
	const Icon = state === PriorityLevels.NONE ? FlagOutlineIcon : FlagFillIcon;
	return <Chip variant="noBorder" icon={<Icon />} {...refinedProps} />;
};
