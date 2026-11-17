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

import { memo, useCallback, useContext, useEffect, useRef } from 'react';
import { BulkEditCheckbox } from '@/v5/ui/components/shared/ticketsBulkEdit/bulkEditCheckbox.component';

import { ITicket } from '@/v5/store/tickets/tickets.types';
import { VirtualList } from '@controls/virtualList/virtualList.component';
import { Row } from '../ticketsTableRow/ticketsTableRow.styles';
import { CheckboxHeaderCell, SelectionColumnContainer } from './ticketsTableSelectionColumn.styles';
import { CellContainer } from '../ticketsTableRow/ticketsTableCell/cell/cell.styles';
import { Headers } from '../ticketsTableHeaders/ticketsTableHeaders.styles';
import { chunk } from 'lodash';
import { TICKET_TABLE_ROW_HEIGHT } from '../../../ticketsTable.helper';
import { TabularViewContext } from '../../../tabularViewContext/tabularViewContext';
import { TICKETS_CHUNK_SIZE } from '../ticketsTable.constants';
import { TemplatesPermissionsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Checkbox } from '@components/shared/ticketsBulkEdit/bulkEditCheckbox.styles';

type TicketsTableSelectionColumnProps = {
	tickets: ITicket[];
	selectedTicketId: string;
};

type SelectionRowType = {
	ticketId: string;
	selected: boolean;
	onCheck: (e: any, ticketId: string) => void;
	selectedTicketId: string;
};
const SelectionRow = memo(({ ticketId, selected, onCheck, selectedTicketId, disabled }: SelectionRowType & { disabled: boolean }) => (
	<Row key={ticketId} $selected={selectedTicketId === ticketId}>
		<CellContainer alwaysVisible>
			<BulkEditCheckbox checked={selected} onClick={(e) => onCheck(e, ticketId)} disabled={disabled} />
		</CellContainer>
	</Row>
));

export const TicketsTableSelectionColumn = ({ 
	tickets,
	selectedTicketId,
}: TicketsTableSelectionColumnProps) => {
	const { selectedIds, setSelectedIds } = useContext(TabularViewContext);
	const ticketIds = tickets.map((t) => t._id);
	const oldTicketsIds = useRef<string[]>(ticketIds);

	const editableTicketIdsSet = TemplatesPermissionsHooksSelectors.selectEditableTicketIds(tickets);
	// Convert selectedIds to a Set for fast lookup
	const selectedIdsSet = selectedIds instanceof Set ? selectedIds : new Set(selectedIds);
	const allSelected = tickets.every(({ _id }) => selectedIdsSet.has(_id) || !editableTicketIdsSet.has(_id)) && editableTicketIdsSet.size > 0;
	const someSelected = !allSelected && ticketIds.some((id) => selectedIdsSet.has(id));

	const onCheck = useCallback((e, ticketId) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (e.target.checked) {
				next.add(ticketId);
			} else {
				next.delete(ticketId);
			}
			return next;
		});
	}, []);

	const onCheckAll = useCallback((e) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			tickets.forEach((t) => {
				if (!editableTicketIdsSet.has(t._id)) return;
				if (e.target.checked) next.add(t._id);
				else next.delete(t._id);
				return;
			});
			return next;
		});
	}, [tickets, editableTicketIdsSet]);

	useEffect(() => {
		const removedTicketIds = oldTicketsIds.current.filter((id) => !ticketIds.includes(id));
		// if a change causes a selected ticket to be removed from the table
		// it should be also removed from the selection
		if (removedTicketIds.length) {
			setSelectedIds((prev) => {
				const next = new Set(prev);
				removedTicketIds.forEach((id) => next.delete(id));
				return next;
			});
		}
		oldTicketsIds.current = ticketIds;
	}, [ticketIds.sort().join(','), setSelectedIds]);

	return (
		<div>
			<Headers>
				<CheckboxHeaderCell name="_ticketsSelection" alwaysVisible>
					<Checkbox indeterminate={someSelected} checked={allSelected} onClick={onCheckAll} />
				</CheckboxHeaderCell>
			</Headers>
			<SelectionColumnContainer $empty={!tickets?.length} $hideNewticketButton={true}>
				<VirtualList
					vKey="selection-column"
					items={chunk(tickets, TICKETS_CHUNK_SIZE)}
					itemHeight={TICKET_TABLE_ROW_HEIGHT}
					ItemComponent={(ticketsChunk: ITicket[]) => (
						<div key={ticketsChunk[0]._id}>
							{ticketsChunk.map((ticket) => (
								<SelectionRow
									key={ticket._id}
									ticketId={ticket._id}
									selected={selectedIdsSet.has(ticket._id)}
									onCheck={onCheck}
									selectedTicketId={selectedTicketId}
									disabled={!editableTicketIdsSet.has(ticket._id)}
								/>
							))}
						</div>
					)}
				/>
			</SelectionColumnContainer>
		</div>
	);
};
