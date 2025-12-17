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
import { Headers } from './ticketsTableHeaders.styles';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { ColumnsVisibilitySettings } from '../columnsVisibilitySettings/columnsVisibilitySettings.component';
import { useContextWithCondition } from '@/v5/helpers/contextWithCondition/contextWithCondition.hooks';
import { TicketsTableHeaderBulkEdit } from './ticketsTableHeaderBulkEdit/ticketsTableHeaderBulkEdit.component';
import { NON_BULK_EDITABLE_COLUMNS } from './ticketsTableHeaders.helpers';
import { TicketsTableHeader } from './ticketsTableHeader.component';

export const TicketsTableHeaders = () => {
	const { visibleSortedColumnsNames } = useContextWithCondition(ResizableTableContext, ['visibleSortedColumnsNames']);
	const selectedTicketIds = ['ticketId1', 'ticketId2'] // TODO get selectedIds from context
	
	const canBulkEditProperty = (name: string) => !NON_BULK_EDITABLE_COLUMNS.includes(name) && selectedTicketIds.length > 1;
	
	return (
		<Headers>
			{visibleSortedColumnsNames.map((name) => (
				canBulkEditProperty(name) ? <TicketsTableHeaderBulkEdit key={name} name={name} /> : <TicketsTableHeader key={name} name={name} />
			))}
			<ColumnsVisibilitySettings />
		</Headers>
	);
};