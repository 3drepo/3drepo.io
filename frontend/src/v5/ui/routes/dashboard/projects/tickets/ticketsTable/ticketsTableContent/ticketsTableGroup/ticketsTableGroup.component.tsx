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
import { isCommenterRole } from '@/v5/store/store.helpers';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useFormContext } from 'react-hook-form';
import { Header, Headers, Group, NewTicketRow, NewTicketText } from './ticketsTableGroup.styles';
import { TicketsTableRow } from './ticketsTableRow/ticketsTableRow.component';
import { NewTicketMenu } from '../../newTicketMenu/newTicketMenu.component';
import { useSelectedModels } from '../../newTicketMenu/useSelectedModels';

type TicketsTableGroupProps = {
	selectedTicketId?: string;
	ticketsWithModelIdAndName: TicketWithModelIdAndName[];
	onEditTicket: (modelId: string, ticket: Partial<ITicket>) => void;
	onNewTicket: (modelId: string) => void;
};
export const TicketsTableGroup = ({ ticketsWithModelIdAndName, onEditTicket, onNewTicket, selectedTicketId }: TicketsTableGroupProps) => {
	const [modelsIds] = useSearchParam('models');
	const { getValues } = useFormContext();
	
	const sortById = (tckts) => sortBy(tckts, ({ type, _id }) => type + _id);
	const showModelName = modelsIds.split(',').length > 1;
	const models = useSelectedModels();

	if (!ticketsWithModelIdAndName.length) return null;

	const newTicketButtonIsDisabled = !models.filter(({ role }) => isCommenterRole(role)).length;
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(getValues('template'));
	const hasProperties = template?.config?.issueProperties;
	const hasSafetibase = template?.modules?.some((module) => module.type === 'safetibase');

	return (
		<>
			{!!ticketsWithModelIdAndName.length && (
				<Headers>
					<Header width={80}>
						<FormattedMessage id="ticketTable.column.header.id" defaultMessage="#id" />
					</Header>
					<Header>
						<FormattedMessage id="ticketTable.column.header.title" defaultMessage="title" />
					</Header>
					<Header width={187} hidden={!showModelName}>
						<FormattedMessage id="ticketTable.column.header.federationContainer" defaultMessage="federation / container" />
					</Header>
					<Header width={96} hidden={!hasProperties}> 
						<FormattedMessage id="ticketTable.column.header.assignees" defaultMessage="assignees" />
					</Header>
					<Header width={62}>
						<FormattedMessage id="ticketTable.column.header.owner" defaultMessage="owner" />
					</Header>
					<Header width={90} hidden={!hasProperties}>
						<FormattedMessage id="ticketTable.column.header.dueDate" defaultMessage="due date" />
					</Header>
					<Header width={90} hidden={!hasProperties}>
						<FormattedMessage id="ticketTable.column.header.priority" defaultMessage="priority" />
					</Header>
					<Header width={100} hidden={!hasProperties}>
						<FormattedMessage id="ticketTable.column.header.status" defaultMessage="status" />
					</Header>
					<Header width={137} hidden={!hasSafetibase}>
						<FormattedMessage id="ticketTable.column.header.levelOfRisk" defaultMessage="level of risk" />
					</Header>
					<Header width={134} hidden={!hasSafetibase}>
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
					disabled={newTicketButtonIsDisabled}
					TriggerButton={(
						<NewTicketRow disabled={newTicketButtonIsDisabled}>
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
