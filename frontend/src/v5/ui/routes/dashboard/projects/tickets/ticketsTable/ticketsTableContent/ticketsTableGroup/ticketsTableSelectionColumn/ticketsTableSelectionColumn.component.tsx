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

import { ITicket } from '@/v5/store/tickets/tickets.types';
import { VirtualList } from '@controls/virtualList/virtualList.component';
import { Row } from '../ticketsTableRow/ticketsTableRow.styles';
import { CheckboxHeaderCell, Checkbox, SelectionColumnContainer } from './ticketsTableSelectionColumn.styles';
import { CellContainer } from '../ticketsTableRow/ticketsTableCell/cell/cell.styles';
import { Headers } from '../ticketsTableHeaders/ticketsTableHeaders.styles';
import { Gap } from '@controls/gap';
import { useTicketFiltersContext } from '@components/viewer/cards/cardFilters/ticketsFilters.context';
import { uniq } from 'lodash';
import { TICKET_TABLE_ROW_HEIGHT } from '../../../ticketsTable.helper';

type TicketsTableSelectionColumnProps = {
    tickets: ITicket[];
};

export const TicketsTableSelectionColumn = ({ 
    tickets,
}: TicketsTableSelectionColumnProps) => {
    const { selectedIds, setSelectedIds } = useTicketFiltersContext();
    const onCheck = (e, ticket) => {
        if (e.target.checked) {
            setSelectedIds([...selectedIds, ticket._id])
            return;
        }
        setSelectedIds(selectedIds.filter((id) => id !== ticket._id));
    }
    const onCheckAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(uniq([...selectedIds, ...tickets.map((t) => t._id)]))
            return;
        }
        setSelectedIds(selectedIds.filter((id) => !tickets.map((t) => t._id).includes(id)));
    }

    const allSelected = tickets.every(({ _id }) => selectedIds.includes(_id)) && tickets.length > 0;
    return (
        <SelectionColumnContainer $empty={!tickets?.length} $hideNewticketButton={true}>
            <Headers>
                <CheckboxHeaderCell name="select">
                    <Checkbox checked={allSelected} onClick={onCheckAll} />
                </CheckboxHeaderCell>
            </Headers>
            <VirtualList
                items={tickets}
                itemHeight={TICKET_TABLE_ROW_HEIGHT}
                itemContent={(ticket: ITicket) => (
                    <Row key={ticket._id}>
                        <CellContainer name="select">
                            <Checkbox checked={selectedIds.includes(ticket._id)} onClick={(e) => onCheck(e, ticket)} />
                        </CellContainer>
                    </Row>
                )}
            />
            <Gap $height={`${TICKET_TABLE_ROW_HEIGHT}px`} />
        </SelectionColumnContainer>
    );
};
