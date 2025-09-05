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
import { getPropertyLabel } from '../ticketsTable/ticketsTable.helper';
import { MenuItem } from './selectMenus.styles';
import { Select } from '@controls/inputs/select/select.component';
import { useContext } from 'react';
import { TicketsTableContext } from '../ticketsTable/ticketsTableContext/ticketsTableContext';

import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { useContextWithCondition } from '@/v5/helpers/contextWithCondition/contextWithCondition.hooks';
import { NONE_OPTION } from '@/v5/store/tickets/ticketsGroups.helpers';

export const NONE_OPTION_MESSAGE = formatMessage({ id: 'tickets.selectOption.none', defaultMessage: 'None' });

export const GroupBySelect = () => {
	const { groupByProperties, groupBy, setGroupBy } = useContext(TicketsTableContext);
	const { visibleSortedColumnsNames } = useContextWithCondition(ResizableTableContext, ['visibleSortedColumnsNames']);
	const items = groupByProperties.filter((property) => visibleSortedColumnsNames.includes(property));

	return (
		<Select
			onChange={(e) => setGroupBy(e.target.value)}
			value={groupBy}
			label={formatMessage({ id: 'ticketTable.groupBy.placeholder', defaultMessage: 'Group by:' })}
			placeholder='none'
			renderValue={(value: string) => (<b>{value === NONE_OPTION ? NONE_OPTION_MESSAGE : getPropertyLabel(value)}</b>)}
		>
			<MenuItem value={NONE_OPTION}>{NONE_OPTION_MESSAGE}</MenuItem>
			{items.map((property) => (
				<MenuItem value={property} key={property}>
					{getPropertyLabel(property)}
				</MenuItem>
			))}
		</Select>
	);
};
