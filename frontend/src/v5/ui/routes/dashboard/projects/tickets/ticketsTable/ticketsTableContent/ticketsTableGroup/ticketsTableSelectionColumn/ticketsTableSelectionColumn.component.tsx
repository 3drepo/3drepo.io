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
import { Tooltip } from '@controls/errorTooltip/errorTooltip.styles';
import { formatMessage } from '@/v5/services/intl';
import { TICKETS_CHUNK_SIZE } from '../ticketsTableGroup.helper';

type TicketsTableSelectionColumnProps = {
	tickets: ITicket[];
	selectedTicketId: string;
	disabledModelIds: string[];
};

type SelectionRowType = {
	ticketId: string;
	selected: boolean;
	onCheck: (e: any, ticketId: string) => void;
	selectedTicketId: string;
};
const SelectionRow = memo(({ ticketId, selected, onCheck, selectedTicketId, disabled }: SelectionRowType & { disabled: boolean }) => {
	const tooltipTitle = disabled ? formatMessage({ id: 'ticketsTable.selection.disabledTooltip', defaultMessage: 'You do not have permission to edit this ticket' }) : '';
	return (
		<Row key={ticketId} $selected={selectedTicketId === ticketId}>
			<CellContainer alwaysVisible>
				<Tooltip title={tooltipTitle}>
					<div>
						<Checkbox checked={selected} onClick={(e) => onCheck(e, ticketId)} disabled={disabled} />
					</div>
				</Tooltip>
			</CellContainer>
		</Row>
	);
});

export const TicketsTableSelectionColumn = ({ 
	tickets,
	selectedTicketId,
	disabledModelIds,
}: TicketsTableSelectionColumnProps) => {
	const { selectedIds, setSelectedIds } = useContext(TicketsTableContext);

	// Convert selectedIds to a Set for fast lookup
	const selectedIdsSet = selectedIds instanceof Set ? selectedIds : new Set(selectedIds);
	const allSelected = tickets.every(({ _id, modelId }) => selectedIdsSet.has(_id) || disabledModelIds.includes(modelId)) && tickets.length > 0;

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
				if (disabledModelIds.includes(t.modelId)) return;
				if (e.target.checked) next.add(t._id);
				else next.delete(t._id);
				return;
			});
			return next;
		});
	}, [tickets, disabledModelIds]);

	return (
		<div>
			<Headers>
				<CheckboxHeaderCell alwaysVisible>
					<Checkbox checked={allSelected} onClick={onCheckAll} />
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
									disabled={disabledModelIds.includes(ticket.modelId)}
								/>
							))}
						</div>
					)}
				/>
			</SelectionColumnContainer>
		</div>
	);
};
