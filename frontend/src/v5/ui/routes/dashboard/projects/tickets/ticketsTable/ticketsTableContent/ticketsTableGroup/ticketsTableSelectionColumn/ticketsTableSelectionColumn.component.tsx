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
import { Gap } from '@controls/gap';
import { uniq } from 'lodash';
import { TICKET_TABLE_ROW_HEIGHT } from '../../../ticketsTable.helper';
import { TicketsTableContext } from '../../../ticketsTableContext/ticketsTableContext';

type TicketsTableSelectionColumnProps = {
	tickets: ITicket[];
	selectedTicketId: string;
};

type SelectionRowType = {
	ticketId: string;
	selected: boolean;
	onCheck: (e: any, ticketId: string) => void;
	selectedTicketId: string;
}
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
	const allSelected = tickets.every(({ _id }) => selectedIds.includes(_id)) && tickets.length > 0;

	const onCheck = useCallback((e, ticketId) => {
		if (e.target.checked) {
			setSelectedIds([...selectedIds, ticketId]);
			return;
		}
		setSelectedIds(selectedIds.filter((id) => id !== ticketId));
	}, [selectedIds]);

	const onCheckAll = (e) => {
		if (e.target.checked) {
			setSelectedIds(uniq([...selectedIds, ...tickets.map((t) => t._id)]));
			return;
		}
		setSelectedIds(selectedIds.filter((id) => !tickets.map((t) => t._id).includes(id)));
	};

	return (
		<SelectionColumnContainer $empty={!tickets?.length} $hideNewticketButton={true}>
			<Headers>
				<CheckboxHeaderCell alwaysVisible>
					<Checkbox checked={allSelected} onClick={onCheckAll} />
				</CheckboxHeaderCell>
			</Headers>
			<VirtualList
				items={tickets}
				itemHeight={TICKET_TABLE_ROW_HEIGHT}
				itemContent={({ _id }: ITicket) => (
					<SelectionRow
						ticketId={_id}
						selected={selectedIds.includes(_id)}
						onCheck={onCheck}
						selectedTicketId={selectedTicketId}
					/>
				)}
			/>
			<Gap $height={`${TICKET_TABLE_ROW_HEIGHT}px`} />
		</SelectionColumnContainer>
	);
};
