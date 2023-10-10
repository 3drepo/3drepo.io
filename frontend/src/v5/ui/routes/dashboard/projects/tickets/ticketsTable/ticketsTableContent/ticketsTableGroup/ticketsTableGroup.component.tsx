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

import { ITicket, TicketWithModelIdAndName } from '@/v5/store/tickets/tickets.types';
import { FormattedMessage } from 'react-intl';
import { sortBy } from 'lodash';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { Header, Headers, Group, NewTicketRow, NewTicketText, DoubleHeader } from './ticketsTableGroup.styles';
import { TicketsTableRow } from './ticketsTableRow/ticketsTableRow.component';
import { NewTicketMenu } from '../../newTicketMenu/newTicketMenu.component';
import { getSelectedModelsNonViewerPermission } from '../../newTicketMenu/newTicketMenu.helpers';

type TicketsTableGroupProps = {
	selectedTicketId?: string;
	ticketsWithModelIdAndName: TicketWithModelIdAndName[];
	onEditTicket: (modelId: string, ticket: Partial<ITicket>) => void;
	onNewTicket: (modelId: string) => void;
};
export const TicketsTableGroup = ({ ticketsWithModelIdAndName, onEditTicket, onNewTicket, selectedTicketId }: TicketsTableGroupProps) => {
	const sortById = (tckts) => sortBy(tckts, ({ type, _id }) => type + _id);
	const [models] = useSearchParam('models');
	const showModelName = models.split(',').length > 1;

	return (
		<>
			{!!ticketsWithModelIdAndName.length && (
				<Headers>
					<Header>
						<FormattedMessage id="ticketTable.column.header.id" defaultMessage="#id" />
					</Header>
					<DoubleHeader>
						<Header>
							<FormattedMessage id="ticketTable.column.header.title" defaultMessage="title" />
						</Header>
						{showModelName && (
							<Header>
								<FormattedMessage id="ticketTable.column.header.federationContainer" defaultMessage="federation / container" />
							</Header>
						)}
					</DoubleHeader>
					<Header>
						<FormattedMessage id="ticketTable.column.header.assignees" defaultMessage="assignees" />
					</Header>
					<Header>
						<FormattedMessage id="ticketTable.column.header.owner" defaultMessage="owner" />
					</Header>
					<Header>
						<FormattedMessage id="ticketTable.column.header.dueDate" defaultMessage="due date" />
					</Header>
					<Header>
						<FormattedMessage id="ticketTable.column.header.priority" defaultMessage="priority" />
					</Header>
					<Header>
						<FormattedMessage id="ticketTable.column.header.status" defaultMessage="status" />
					</Header>
					<Header>
						<FormattedMessage id="ticketTable.column.header.levelOfRisk" defaultMessage="level of risk" />
					</Header>
					<Header>
						<FormattedMessage id="ticketTable.column.header.treatmentStatus" defaultMessage="treatment status" />
					</Header>
				</Headers>
			)}
			<Group>
				{sortById(ticketsWithModelIdAndName).map(({ modelId, modelName, ...ticket }) => (
					<TicketsTableRow
						key={ticket._id}
						ticket={ticket}
						showModelName={showModelName}
						modelName={modelName}
						onClick={() => onEditTicket(modelId, ticket)}
						selected={selectedTicketId === ticket._id}
					/>
				))}
				<NewTicketMenu
					TriggerButton={(
						<NewTicketRow disabled={getSelectedModelsNonViewerPermission().length === 0}>
							<AddCircleIcon />
							<NewTicketText>
								<FormattedMessage id="ticketTable.row.newTicket" defaultMessage="New ticket" />
							</NewTicketText>
						</NewTicketRow>
					)}
					useMousePosition
					onContainerOrFederationClick={onNewTicket}
				/>
			</Group>
		</>
	);
};
