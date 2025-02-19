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
import { isCommenterRole } from '@/v5/store/store.helpers';
import { useContext } from 'react';
import { SortedTableComponent, SortedTableContext, SortedTableType } from '@controls/sortedTableContext/sortedTableContext';
import { BaseProperties, IssueProperties, SafetibaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import ArrowIcon from '@assets/icons/outlined/arrow-outlined.svg';
import { Table, Header, Headers, Group, NewTicketRow, NewTicketText, IconContainer, PlaceholderForStickyFunctionality } from './ticketsTableGroup.styles';
import { TicketsTableRow } from './ticketsTableRow/ticketsTableRow.component';
import { NewTicketMenu } from '../../newTicketMenu/newTicketMenu.component';
import { useSelectedModels } from '../../newTicketMenu/useSelectedModels';
import { SetTicketValue } from '../../ticketsTable.helper';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';

const SortingTableHeader = ({ name, children, disableSorting = false, ...props }) => {
	const { isDescendingOrder, onColumnClick, sortingColumn } = useContext(SortedTableContext);
	const { isHidden } = useContext(ResizableTableContext);
	const isSelected = name === sortingColumn;

	if (isHidden(name)) return (null);

	if (disableSorting) return (
		<Header {...props} name={name}>
			{children}
		</Header>
	);

	return (
		<Header {...props} name={name} onClick={() => onColumnClick(name)} $selectable>
			{isSelected && (
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
	const { getRowWidth } = useContext(ResizableTableContext);
	const models = useSelectedModels();
	const newTicketButtonIsDisabled = !models.filter(({ role }) => isCommenterRole(role)).length;

	return (
		<Table $empty={!tickets.length} $canCreateTicket={!newTicketButtonIsDisabled}>
			<SortedTableComponent items={tickets} sortingColumn={BaseProperties.CREATED_AT}>
				<SortedTableContext.Consumer>
					{({ sortedItems }: SortedTableType<ITicket>) => (
						<>
							{!tickets.length
								? (<PlaceholderForStickyFunctionality />)
								: (
									<Headers>
										<SortingTableHeader name="id" disableSorting>
											<FormattedMessage id="ticketTable.column.header.id" defaultMessage="#id" />
										</SortingTableHeader>
										<SortingTableHeader name={BaseProperties.TITLE}>
											<FormattedMessage id="ticketTable.column.header.title" defaultMessage="title" />
										</SortingTableHeader>
										<SortingTableHeader name="modelName">
											<FormattedMessage id="ticketTable.column.header.federationContainer" defaultMessage="federation / container" />
										</SortingTableHeader>
										<SortingTableHeader name={`properties.${BaseProperties.CREATED_AT}`}>
											<FormattedMessage id="ticketTable.column.header.createdAt" defaultMessage="created at" />
										</SortingTableHeader>
										<SortingTableHeader name={`properties.${IssueProperties.ASSIGNEES}`}> 
											<FormattedMessage id="ticketTable.column.header.assignees" defaultMessage="assignees" />
										</SortingTableHeader>
										<SortingTableHeader name={`properties.${BaseProperties.OWNER}`}>
											<FormattedMessage id="ticketTable.column.header.owner" defaultMessage="owner" />
										</SortingTableHeader>
										<SortingTableHeader name={`properties.${IssueProperties.DUE_DATE}`}>
											<FormattedMessage id="ticketTable.column.header.dueDate" defaultMessage="due date" />
										</SortingTableHeader>
										<SortingTableHeader name={`properties.${IssueProperties.PRIORITY}`}>
											<FormattedMessage id="ticketTable.column.header.priority" defaultMessage="priority" />
										</SortingTableHeader>
										<SortingTableHeader name={`properties.${BaseProperties.STATUS}`}>
											<FormattedMessage id="ticketTable.column.header.status" defaultMessage="status" />
										</SortingTableHeader>
										<SortingTableHeader name={`modules.safetibase.${SafetibaseProperties.LEVEL_OF_RISK}`}>
											<FormattedMessage id="ticketTable.column.header.levelOfRisk" defaultMessage="level of risk" />
										</SortingTableHeader>
										<SortingTableHeader name={`modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`}>
											<FormattedMessage id="ticketTable.column.header.treatmentStatus" defaultMessage="treatment status" />
										</SortingTableHeader>
									</Headers>
								)}
							<Group $empty={!sortedItems?.length}>
								{sortedItems.map(({ modelId, ...ticket }) => (
									<TicketsTableRow
										key={ticket._id}
										ticket={ticket}
										modelId={modelId}
										onClick={onEditTicket}
										selected={selectedTicketId === ticket._id}
									/>
								))}
								<NewTicketMenu
									disabled={newTicketButtonIsDisabled}
									TriggerButton={(
										<NewTicketRow
											disabled={newTicketButtonIsDisabled}
											style={{ width: getRowWidth() }}
										>
											<NewTicketText>
												<AddCircleIcon />
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
		</Table>
	);
};
