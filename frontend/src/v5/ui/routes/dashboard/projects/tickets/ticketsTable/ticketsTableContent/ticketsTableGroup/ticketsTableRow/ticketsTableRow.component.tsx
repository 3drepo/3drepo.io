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
import { memo, useContext, useEffect } from 'react';
import { LoadingRow, Row } from './ticketsTableRow.styles';
import { TicketContextComponent } from '@/v5/ui/routes/viewer/tickets/ticket.context';
import { isEqual, sum } from 'lodash';
import { TicketsTableCell } from './ticketsTableCell/ticketsTableCell.component';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { BaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useParams } from 'react-router';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { Loader } from '@/v4/routes/components/loader/loader.component';

type TicketsTableRowProps = {
	ticket: ITicket,
	modelId: string,
	selected: boolean,
	onClick: (modelId, ticketId) => void,
};

export const TicketsTableRow = memo(({ ticket, onClick, modelId, selected }: TicketsTableRowProps) => {
	const { teamspace, project } = useParams<DashboardParams>();
	const { _id: id, properties, type } = ticket;
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(type);
	const { visibleSortedColumnsNames, getWidth, columnGap } = useContext(ResizableTableContext);
	const columnsWidths = visibleSortedColumnsNames.map(getWidth);
	const isFed = modelIsFederation(modelId);
	const ticketIsFetched = !!ticket.properties[BaseProperties.UPDATED_AT];

	if (!properties || !template?.code) return null;

	const handleClick = (e) => {
		e.preventDefault();
		onClick(modelId, ticket._id);
	};

	useEffect(() => {
		if (!ticketIsFetched) {
			TicketsActionsDispatchers.fetchTicket(teamspace, project, modelId, ticket._id, isFed);
		}
	}, [ticket]);

	return (
		<TicketContextComponent containerOrFederation={modelId}>
			{!ticketIsFetched ? (
				<LoadingRow $width={sum(columnsWidths) + ((columnsWidths.length - 1) * columnGap)}>
					<Loader size={19} />
				</LoadingRow>
			) : (
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
			)}
		</TicketContextComponent>
	);
}, isEqual);
