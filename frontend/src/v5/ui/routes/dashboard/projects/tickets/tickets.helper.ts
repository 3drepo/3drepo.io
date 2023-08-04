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

import { BaseProperties, IssueProperties, SafetibaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { formatMessage } from '@/v5/services/intl';
import _ from 'lodash';
import { PriorityLevels, RiskLevels, TicketStatuses, TreatmentStatuses } from '@controls/chip/chip.types';

export const NONE_OPTION = 'none';
export const NoneOptionMessage = formatMessage({ id: 'tickets.selectOption.none', defaultMessage: 'None' });
export const UNSET = formatMessage({ id: 'tickets.selectOption.property.unset', defaultMessage: 'Unset' });

export const GROUP_BY_OPTIONS = {
	[BaseProperties.OWNER]: formatMessage({ id: 'groupBy.owner', defaultMessage: 'Owner'}),
	[IssueProperties.DUE_DATE]: formatMessage({ id: 'groupBy.dueDate', defaultMessage: 'Due Date'}),
	[IssueProperties.PRIORITY]: formatMessage({ id: 'groupBy.priority', defaultMessage: 'Priority'}),
	[IssueProperties.STATUS]: formatMessage({ id: 'groupBy.status', defaultMessage: 'Status'}),
	[SafetibaseProperties.LEVEL_OF_RISK]: formatMessage({ id: 'groupBy.levelOfRisk', defaultMessage: 'Level Of Risk'}),
	[SafetibaseProperties.TREATMENT_STATUS]: formatMessage({ id: 'groupBy.treatmentStatus', defaultMessage: 'Treatment Status'}),
};

const GROUP_NAMES_BY_TYPE_NON_STANDARDISED = {
	[IssueProperties.PRIORITY]: PriorityLevels,
	[IssueProperties.STATUS]: TicketStatuses,
	[SafetibaseProperties.LEVEL_OF_RISK]: RiskLevels,
	[SafetibaseProperties.TREATMENT_STATUS]: TreatmentStatuses,
};

export const standardiseGroupName = _.snakeCase;
export const GROUP_NAMES_BY_TYPE = _.transform(GROUP_NAMES_BY_TYPE_NON_STANDARDISED, (result, val, key) => {
	result[standardiseGroupName(key)] = _.values(val).map(standardiseGroupName);
}, {});
// export const GROUP_NAMES_BY_TYPE = _.mapValues(GROUP_NAMES_BY_TYPE_NON_STANDARDISED, _.values);
