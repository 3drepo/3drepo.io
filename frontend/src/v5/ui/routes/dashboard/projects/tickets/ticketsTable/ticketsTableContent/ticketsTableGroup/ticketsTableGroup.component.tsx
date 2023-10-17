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
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { isCommenterRole } from '@/v5/store/store.helpers';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useFormContext } from 'react-hook-form';
import { useContext } from 'react';
import { SortedTableComponent, SortedTableContext, SortedTableType } from '@controls/sortedTableContext/sortedTableContext';
import { BaseProperties, IssueProperties, SafetibaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import ArrowIcon from '@assets/icons/outlined/arrow-outlined.svg';
import { TextOverflow } from '@controls/textOverflow';
import { Header, Headers, Group, NewTicketRow, NewTicketText, IconContainer } from './ticketsTableGroup.styles';
import { TicketsTableRow } from './ticketsTableRow/ticketsTableRow.component';
import { NewTicketMenu } from '../../newTicketMenu/newTicketMenu.component';
import { useSelectedModels } from '../../newTicketMenu/useSelectedModels';

const SortingTableHeader = ({ name = null, children, ...props }) => {
	const { isDescendingOrder, onColumnClick, sortingColumn } = useContext(SortedTableContext);
	const isSelected = name === sortingColumn;

	return (
		<Header {...props} onClick={() => onColumnClick(name)} $selected={isSelected} $selectable={!!name}>
			<IconContainer $flip={isDescendingOrder} $hidden={!name || !isSelected}>
				<ArrowIcon />
			</IconContainer>
			<TextOverflow>
				{children}
			</TextOverflow>
		</Header>
	);
};

type TicketsTableGroupProps = {
	selectedTicketId?: string;
	ticketsWithModelIdAndName: TicketWithModelIdAndName[];
	onEditTicket: (modelId: string, ticket: Partial<ITicket>) => void;
	onNewTicket: (modelId: string) => void;
};
export const TicketsTableGroup = ({ ticketsWithModelIdAndName, onEditTicket, onNewTicket, selectedTicketId }: TicketsTableGroupProps) => {
	const [modelsIds] = useSearchParam('models');
	const { getValues } = useFormContext();

	const showModelName = modelsIds.split(',').length > 1;
	const models = useSelectedModels();

	if (!ticketsWithModelIdAndName.length) return null;

	const newTicketButtonIsDisabled = !models.filter(({ role }) => isCommenterRole(role)).length;
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(getValues('template'));
	const hasProperties = template?.config?.issueProperties;
	const hasSafetibase = template?.modules?.some((module) => module.type === 'safetibase');

	return (
		<SortedTableComponent items={ticketsWithModelIdAndName} sortingColumn={BaseProperties.CREATED_AT}>
			<SortedTableContext.Consumer>
				{({ sortedItems }: SortedTableType<TicketWithModelIdAndName>) => (
					<>
						{!!ticketsWithModelIdAndName.length && (
							<Headers>
								<SortingTableHeader width={80}>
									<FormattedMessage id="ticketTable.column.header.id" defaultMessage="#id" />
								</SortingTableHeader>
								<SortingTableHeader name={BaseProperties.TITLE}>
									<FormattedMessage id="ticketTable.column.header.title" defaultMessage="title" />
								</SortingTableHeader>
								<SortingTableHeader name="modelName" width={187} hidden={!showModelName}>
									<FormattedMessage id="ticketTable.column.header.federationContainer" defaultMessage="federation / container" />
								</SortingTableHeader>
								<SortingTableHeader name={`properties.${BaseProperties.CREATED_AT}`} width={80}>
									<FormattedMessage id="ticketTable.column.header.createdAt" defaultMessage="created at" />
								</SortingTableHeader>
								<SortingTableHeader name={`properties.${IssueProperties.ASSIGNEES}`} width={96} hidden={!hasProperties}> 
									<FormattedMessage id="ticketTable.column.header.assignees" defaultMessage="assignees" />
								</SortingTableHeader>
								<SortingTableHeader name={`properties.${BaseProperties.OWNER}`} width={62}>
									<FormattedMessage id="ticketTable.column.header.owner" defaultMessage="owner" />
								</SortingTableHeader>
								<SortingTableHeader name={`properties.${IssueProperties.DUE_DATE}`} width={90} hidden={!hasProperties}>
									<FormattedMessage id="ticketTable.column.header.dueDate" defaultMessage="due date" />
								</SortingTableHeader>
								<SortingTableHeader name={`properties.${IssueProperties.PRIORITY}`} width={90} hidden={!hasProperties}>
									<FormattedMessage id="ticketTable.column.header.priority" defaultMessage="priority" />
								</SortingTableHeader>
								<SortingTableHeader name={`properties.${IssueProperties.STATUS}`} width={100} hidden={!hasProperties}>
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
							{sortedItems.map(({ modelId, modelName, ...ticket }) => (
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
				)}
			</SortedTableContext.Consumer>
		</SortedTableComponent>
	);
};
