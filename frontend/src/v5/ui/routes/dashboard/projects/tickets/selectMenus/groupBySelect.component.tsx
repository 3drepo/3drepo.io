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
import { getPropertyLabel, INITIAL_COLUMNS } from '../ticketsTable/ticketsTable.helper';
import { MenuItem } from './selectMenus.styles';
import { Select } from '@controls/inputs/select/select.component';
import { useContext, useEffect } from 'react';
import { TicketsTableContext } from '../ticketsTable/ticketsTableContext/ticketsTableContext';
import { SearchContext } from '@controls/search/searchContext';
import { useParams } from 'react-router';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';

const NONE_OPTION = 'None';
const NONE_OPTION_MESSAGE = formatMessage({ id: 'tickets.selectOption.none', defaultMessage: 'None' });

export const GroupBySelect = () => {
	const { template } = useParams<DashboardTicketsParams>();
	const { groupByProperties, groupBy, setGroupBy, fetchColumn, getPropertyType } = useContext(TicketsTableContext);
	const { filteredItems: tickets } = useContext(SearchContext);

	useEffect(() => {
		if (groupBy && !INITIAL_COLUMNS.includes(groupBy)) {
			fetchColumn(groupBy, tickets);
		}
	}, [groupBy]);

	useEffect(() => {
		if (!getPropertyType(groupBy)) {
			setGroupBy('');
		}
	}, [template, getPropertyType]);

	return (
		<Select
			onChange={(e) => setGroupBy(e.target.value)}
			value={groupBy || NONE_OPTION}
			label={formatMessage({ id: 'ticketTable.groupBy.placeholder', defaultMessage: 'Group by:' })}
			placeholder='none'
			renderValue={(value: string) => (<b>{value === NONE_OPTION ? NONE_OPTION_MESSAGE : getPropertyLabel(value)}</b>)}
		>
			<MenuItem value={NONE_OPTION}>{NONE_OPTION_MESSAGE}</MenuItem>
			{groupByProperties.map((property) => (
				<MenuItem value={property} key={property}>
					{getPropertyLabel(property)}
				</MenuItem>
			))}
		</Select>
	);
};
