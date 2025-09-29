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
import { SortedTableContext } from '@controls/sortedTableContext/sortedTableContext';
import { HeaderCell, HeaderCellText, Headers } from './ticketsTableHeaders.styles';
import { getPropertyLabel } from '../../../ticketsTable.helper';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { ColumnsVisibilitySettings } from '../columnsVisibilitySettings/columnsVisibilitySettings.component';
import { SortingArrow } from '@controls/sortingArrow/sortingArrow.component';
import { useContextWithCondition } from '@/v5/helpers/contextWithCondition/contextWithCondition.hooks';
import { TicketsTableHeaderFilter } from './ticketsTableHeaderFilter.component';

const TicketHeaderCell = ({ name, last, ...props }) => {
	const { isDescendingOrder, onColumnClick, sortingColumn } = useContext(SortedTableContext);
	const isSelected = name === sortingColumn;
	let iconsCount = 1;
	if (isSelected) iconsCount ++;
	if (last) iconsCount++;

	return (
		<HeaderCell name={name} onClick={() => onColumnClick(name)} $iconsCount={iconsCount}>
			<HeaderCellText {...props}>
				{getPropertyLabel(name)}
			</HeaderCellText>
			{isSelected && (<SortingArrow ascendingOrder={isDescendingOrder} />)}
			<TicketsTableHeaderFilter propertyName={name}/>
			{last && <ColumnsVisibilitySettings />}
		</HeaderCell>
	);
};

export const TicketsTableHeaders = () => {
	const { visibleSortedColumnsNames } = useContextWithCondition(ResizableTableContext, ['visibleSortedColumnsNames']);

	return (
		<Headers>
			{visibleSortedColumnsNames.map((name, i) => (
				<TicketHeaderCell key={name} name={name} last={(i === visibleSortedColumnsNames.length - 1 )}/>
			))}
		</Headers>
	);
};