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
import { Header, Headers } from './ticketsTableHeaders.styles';
import { getPropertyLabel } from '../../../ticketsTable.helper';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { ColumnsVisibilitySettings } from '../columnsVisibilitySettings/columnsVisibilitySettings.component';
import { SortingArrow } from '@controls/sortingArrow/sortingArrow.component';
import { ResizableTableHeader } from '@controls/resizableTableContext/resizableTableHeader/resizableTableHeader.component';
import { useContextWithCondition } from '@/v5/helpers/contextWithCondition/contextWithCondition.hooks';
import { TicketsTableHeaderFilter } from './ticketsTableHeaderFilter.component';

const TableHeader = ({ name, ...props }) => {
	const { isDescendingOrder, onColumnClick, sortingColumn } = useContext(SortedTableContext);
	const isSelected = name === sortingColumn;

	return (
		<ResizableTableHeader name={name} onClick={() => onColumnClick(name)}>
			<Header {...props} $selectable tooltipText='hello there'>
				{isSelected && (<SortingArrow ascendingOrder={isDescendingOrder} />)}
				{getPropertyLabel(name)}
			</Header>
			<TicketsTableHeaderFilter propertyName={name}/>
		</ResizableTableHeader>
	);
};

export const TicketsTableHeaders = () => {
	const { visibleSortedColumnsNames } = useContextWithCondition(ResizableTableContext, ['visibleSortedColumnsNames']);

	return (
		<Headers>
			{visibleSortedColumnsNames.map((name) => (
				<TableHeader key={name} name={name} />
			))}
			<ColumnsVisibilitySettings />
		</Headers>
	);
};