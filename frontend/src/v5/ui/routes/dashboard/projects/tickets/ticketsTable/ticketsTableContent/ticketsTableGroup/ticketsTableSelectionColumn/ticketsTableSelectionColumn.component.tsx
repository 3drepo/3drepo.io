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

import { memo, useCallback, useContext } from 'react';

import { ITicket } from '@/v5/store/tickets/tickets.types';
import { VirtualList } from '@controls/virtualList/virtualList.component';
import { Row } from '../ticketsTableRow/ticketsTableRow.styles';
import { CheckboxHeaderCell, Checkbox, SelectionColumnContainer } from './ticketsTableSelectionColumn.styles';
import { CellContainer } from '../ticketsTableRow/ticketsTableCell/cell/cell.styles';
import { Headers } from '../ticketsTableHeaders/ticketsTableHeaders.styles';
import { chunk } from 'lodash';
import { TICKET_TABLE_ROW_HEIGHT } from '../../../ticketsTable.helper';
import { TicketsTableContext } from '../../../ticketsTableContext/ticketsTableContext';
import { TICKETS_CHUNK_SIZE } from '../ticketsTableGroup.component';

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
const SelectionRow = memo(({ ticketId, selected, onCheck, selectedTicketId }: SelectionRowType) => (
	<Row key={ticketId} $selected={selectedTicketId === ticketId}>
		<CellContainer alwaysVisible>
			<Checkbox checked={selected} onClick={(e) => onCheck(e, ticketId)} />
		</CellContainer>
	</Row>
));

export const TicketsTableSelectionColumn = ({ 
	tickets,
	selectedTicketId,
}: TicketsTableSelectionColumnProps) => {
	const { selectedIds, setSelectedIds } = useContext(TicketsTableContext);

	// Convert selectedIds to a Set for fast lookup
	const selectedIdsSet = selectedIds instanceof Set ? selectedIds : new Set(selectedIds);

	const allSelected = tickets.every(({ _id }) => selectedIdsSet.has(_id)) && tickets.length > 0;

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
			if (e.target.checked) {
				tickets.forEach((t) => next.add(t._id));
			} else {
				tickets.forEach((t) => next.delete(t._id));
			}
			return next;
		});
	}, [tickets]);

	return (
		<div>
			<Headers>
				<CheckboxHeaderCell alwaysVisible>
					<Checkbox checked={allSelected} onClick={onCheckAll} />
				</CheckboxHeaderCell>
			</Headers>
			<SelectionColumnContainer $empty={!tickets?.length} $hideNewticketButton={true}>
				<VirtualList
					items={chunk(tickets, TICKETS_CHUNK_SIZE)}
					itemHeight={TICKET_TABLE_ROW_HEIGHT * TICKETS_CHUNK_SIZE}
					ItemComponent={(ticketsChunk: ITicket[]) => (
						<div key={ticketsChunk[0]._id}>
							{ticketsChunk.map((ticket) => (
									<SelectionRow
										ticketId={ticket._id}
										selected={selectedIdsSet.has(ticket._id)}
										onCheck={onCheck}
										selectedTicketId={selectedTicketId}
									/>
							))}
						</div>
					)}
				/>
			</SelectionColumnContainer>
		</div>
	);
};
