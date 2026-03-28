/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { useContext } from 'react';
import { HeaderCell, HeaderCellText } from './ticketsTableHeaders.styles';
import { getPropertyLabel } from '../../../ticketsTable.helper';
import { TicketsTableHeaderFilter } from './ticketsTableHeaderFilter.component';
import { SortingArrow } from '@controls/sortingArrow/sortingArrow.component';
import { SortedGroupedTableContext } from '@controls/sortedTableContext/sortedGroupedTableContext';

export const TicketsTableHeader = ({ name, ...props }) => {
	const { isDescendingOrder, onColumnClick, sortingColumn } = useContext(SortedGroupedTableContext);
	const isSelected = name === sortingColumn;

	return (
		<HeaderCell name={name} onClick={() => onColumnClick(name)}>
			<HeaderCellText {...props}>
				{getPropertyLabel(name)}
			</HeaderCellText>
			{isSelected && (<SortingArrow ascendingOrder={isDescendingOrder} />)}
			<TicketsTableHeaderFilter propertyName={name}/>
		</HeaderCell>
	);
};