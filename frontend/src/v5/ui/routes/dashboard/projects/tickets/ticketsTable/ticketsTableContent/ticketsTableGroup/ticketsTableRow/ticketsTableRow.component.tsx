/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { memo, useContext, useEffect, useState } from 'react';
import { Row } from './ticketsTableRow.styles';
import { TicketContextComponent } from '@/v5/ui/routes/viewer/tickets/ticket.context';
import { isEqual } from 'lodash';
import { TicketsTableCell } from './ticketsTableCell/ticketsTableCell.component';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { usePerformanceContext } from '@/v5/helpers/performanceContext/performanceContext.hooks';
import { TicketsTableContext } from '../../../ticketsTableContext/ticketsTableContext';

type TicketsTableRowProps = {
	ticket: ITicket,
	modelId: string,
	onClick: (modelId, ticketId) => void,
};

export const TicketsTableRow = memo(({ ticket, onClick, modelId }: TicketsTableRowProps) => {
	const { _id: id, properties, type } = ticket;
	const { selectedTicket, onSelectedTicketChange } = useContext(TicketsTableContext);
	const [selected, setSelected] = useState(selectedTicket.current === id);
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(type);
	const { visibleSortedColumnsNames } = usePerformanceContext(ResizableTableContext, ['visibleSortedColumnsNames']);

	if (!properties || !template?.code) return null;

	const handleClick = (e) => {
		e.preventDefault();
		onClick(modelId, ticket._id);
	};

	useEffect(() => {
		return onSelectedTicketChange((newSelectedTicket) => setSelected(newSelectedTicket === id));
	}, [setSelected, id, onSelectedTicketChange]);

	return (
		<TicketContextComponent containerOrFederation={modelId}>
			<Row key={id} onClickCapture={handleClick} $selected={selected}>
				{visibleSortedColumnsNames.map((name) => (
					<TicketsTableCell
						name={name}
						ticket={ticket}
						modelId={modelId}
						key={name}
					/>
				))}
			</Row>
		</TicketContextComponent>
	);
}, isEqual);
