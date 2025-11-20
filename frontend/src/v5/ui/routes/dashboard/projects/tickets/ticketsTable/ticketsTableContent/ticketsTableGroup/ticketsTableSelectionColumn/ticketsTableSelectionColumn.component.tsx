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
import { useState } from 'react';
import { Gap } from '@controls/gap';

type TicketsTableSelectionColumnProps = {
    tickets: ITicket[];
};

export const TicketsTableSelectionColumn = ({ 
    tickets,
}: TicketsTableSelectionColumnProps) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const onCheck = (e, ticket) => {
        if (e.target.checked) {
            setSelectedIds((prev) => [...prev, ticket._id])
            return;
        }
        setSelectedIds((prev) => prev.filter((id) => id !== ticket._id));
    }
    const onCheckAll = (e) => setSelectedIds(e.target.checked ? tickets.map((t) => t._id) : []);

    const allSelected = tickets?.length && selectedIds.length === tickets.length;
    return (
        <SelectionColumnContainer $empty={!tickets?.length} $hideNewticketButton={true}>
            <Headers>
                <CheckboxHeaderCell name="select">
                    <Checkbox checked={allSelected} onClick={onCheckAll} />
                </CheckboxHeaderCell>
            </Headers>
            <VirtualList
                items={tickets}
                itemHeight={37}
                itemContent={(ticket: ITicket) => (
                    <Row key={ticket._id}>
                        <CellContainer name="select">
                            <Checkbox checked={selectedIds.includes(ticket._id)} onClick={(e) => onCheck(e, ticket)} />
                        </CellContainer>
                    </Row>
                )}
            />
            <Gap $height="37px" />
        </SelectionColumnContainer>
    );
};
