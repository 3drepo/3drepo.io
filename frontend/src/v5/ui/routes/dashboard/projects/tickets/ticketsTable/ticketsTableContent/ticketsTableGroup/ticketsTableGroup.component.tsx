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
import { FormattedMessage } from 'react-intl';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import { Transformers, useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { isCommenterRole } from '@/v5/store/store.helpers';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useContext } from 'react';
import { SortedTableComponent, SortedTableContext, SortedTableType } from '@controls/sortedTableContext/sortedTableContext';
import { BaseProperties, IssueProperties, SafetibaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import ArrowIcon from '@assets/icons/outlined/arrow-outlined.svg';
import { Header, Headers, Group, NewTicketRow, NewTicketText, IconContainer } from './ticketsTableGroup.styles';
import { TicketsTableRow } from './ticketsTableRow/ticketsTableRow.component';
import { NewTicketMenu } from '../../newTicketMenu/newTicketMenu.component';
import { useSelectedModels } from '../../newTicketMenu/useSelectedModels';
import { SetTicketValue } from '../../ticketsTable.helper';
import { useParams } from 'react-router-dom';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';

const SortingTableHeader = ({ name = null, children, hidden = false, ...props }) => {
	const { isDescendingOrder, onColumnClick, sortingColumn } = useContext(SortedTableContext);
	const isSelected = name === sortingColumn;

	if (hidden) return (null);

	return (
		<Header {...props} onClick={() => onColumnClick(name)} $selectable={!!name}>
			{name && isSelected && (
				<IconContainer $flip={isDescendingOrder}>
					<ArrowIcon />
				</IconContainer>
			)}
			{children}
		</Header>
	);
};

type TicketsTableGroupProps = {
	selectedTicketId?: string;
	tickets: ITicket[];
	onEditTicket: SetTicketValue;
	onNewTicket: (modelId: string) => void;
};
export const TicketsTableGroup = ({ tickets, onEditTicket, onNewTicket, selectedTicketId }: TicketsTableGroupProps) => {
	const { template: templateId } = useParams<DashboardTicketsParams>();
	const [modelsIds] = useSearchParam('models', Transformers.STRING_ARRAY);

	const showModelName = modelsIds.length > 1;
	const models = useSelectedModels();

	const newTicketButtonIsDisabled = !models.filter(({ role }) => isCommenterRole(role)).length;
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);
	const hasProperties = template?.config?.issueProperties;
	const hasSafetibase = template?.modules?.some((module) => module.type === 'safetibase');

	return (
		<SortedTableComponent items={tickets} sortingColumn={BaseProperties.CREATED_AT}>
			<SortedTableContext.Consumer>
				{({ sortedItems }: SortedTableType<ITicket>) => (
					<>
						{!!tickets.length && (
							<Headers>
								<SortingTableHeader width={80}>
									<FormattedMessage id="ticketTable.column.header.id" defaultMessage="#id" />
								</SortingTableHeader>
								<SortingTableHeader name={BaseProperties.TITLE}>
									<FormattedMessage id="ticketTable.column.header.title" defaultMessage="title" />
								</SortingTableHeader>
								<SortingTableHeader name="modelName" width={145} hidden={!showModelName}>
									<FormattedMessage id="ticketTable.column.header.federationContainer" defaultMessage="federation / container" />
								</SortingTableHeader>
								<SortingTableHeader name={`properties.${BaseProperties.CREATED_AT}`} width={127}>
									<FormattedMessage id="ticketTable.column.header.createdAt" defaultMessage="created at" />
								</SortingTableHeader>
								<SortingTableHeader name={`properties.${IssueProperties.ASSIGNEES}`} width={96} hidden={!hasProperties}> 
									<FormattedMessage id="ticketTable.column.header.assignees" defaultMessage="assignees" />
								</SortingTableHeader>
								<SortingTableHeader name={`properties.${BaseProperties.OWNER}`} width={52}>
									<FormattedMessage id="ticketTable.column.header.owner" defaultMessage="owner" />
								</SortingTableHeader>
								<SortingTableHeader name={`properties.${IssueProperties.DUE_DATE}`} width={147} hidden={!hasProperties}>
									<FormattedMessage id="ticketTable.column.header.dueDate" defaultMessage="due date" />
								</SortingTableHeader>
								<SortingTableHeader name={`properties.${IssueProperties.PRIORITY}`} width={90} hidden={!hasProperties}>
									<FormattedMessage id="ticketTable.column.header.priority" defaultMessage="priority" />
								</SortingTableHeader>
								<SortingTableHeader name={`properties.${BaseProperties.STATUS}`} width={150}>
									<FormattedMessage id="ticketTable.column.header.status" defaultMessage="status" />
								</SortingTableHeader>
								<SortingTableHeader name={`modules.safetibase.${SafetibaseProperties.LEVEL_OF_RISK}`} width={137} hidden={!hasSafetibase}>
									<FormattedMessage id="ticketTable.column.header.levelOfRisk" defaultMessage="level of risk" />
								</SortingTableHeader>
								<SortingTableHeader name={`modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`} width={134} hidden={!hasSafetibase}>
									<FormattedMessage id="ticketTable.column.header.treatmentStatus" defaultMessage="treatment status" />
								</SortingTableHeader>
							</Headers>
						)}
						<Group>
							{sortedItems.map(({ modelId, ...ticket }) => (
								<TicketsTableRow
									key={ticket._id}
									ticket={ticket}
									modelId={modelId}
									showModelName={showModelName}
									onClick={() => onEditTicket(modelId, ticket._id)}
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
				)}
			</SortedTableContext.Consumer>
		</SortedTableComponent>
	);
};
