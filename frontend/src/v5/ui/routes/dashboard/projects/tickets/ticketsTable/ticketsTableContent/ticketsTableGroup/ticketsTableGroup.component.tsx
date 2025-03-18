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
import { TICKETS_TABLE_COLUMNS_LABEL, SetTicketValue } from '../../ticketsTable.helper';
import { ResizableTableCell } from '@controls/resizableTableContext/resizableTableCell/resizableTableCell.component';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { ColumnsVisibilitySettings } from './columnsVisibilitySettings/columnsVisibilitySettings.component';

const SortingTableHeader = ({ name, children, disableSorting = false, ...props }) => {
	const { isDescendingOrder, onColumnClick, sortingColumn } = useContext(SortedTableContext);
	const { isHidden } = useContext(ResizableTableContext);
	const isSelected = name === sortingColumn;

	if (isHidden(name)) return (null);

	if (disableSorting) return (
		<ResizableTableCell name={name}>
			<Header {...props}>
				{children}
			</Header>
		</ResizableTableCell>
	);

	return (
		<ResizableTableCell name={name}>
			<Header {...props} onClick={() => onColumnClick(name)} $selectable>
				{isSelected && (
					<IconContainer $flip={isDescendingOrder}>
						<ArrowIcon />
					</IconContainer>
				)}
				{children}
			</Header>
		</ResizableTableCell>
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
		<Table $empty={!tickets.length}>
			<SortedTableComponent items={tickets} sortingColumn={BaseProperties.CREATED_AT}>
				<SortedTableContext.Consumer>
					{({ sortedItems }: SortedTableType<ITicket>) => (
						<>
							{!tickets.length
								? (<PlaceholderForStickyFunctionality />)
								: (
									<>
										<Headers>
											<SortingTableHeader name="id" disableSorting>
												<FormattedMessage id="ticketTable.column.header.id" defaultMessage="#id" />
											</SortingTableHeader>
											<SortingTableHeader name={BaseProperties.TITLE}>
												{TICKETS_TABLE_COLUMNS_LABEL[BaseProperties.TITLE]}
											</SortingTableHeader>
											<SortingTableHeader name="modelName">
												{TICKETS_TABLE_COLUMNS_LABEL.modelName}
											</SortingTableHeader>
											<SortingTableHeader name={`properties.${BaseProperties.CREATED_AT}`}>
												{TICKETS_TABLE_COLUMNS_LABEL[`properties.${BaseProperties.CREATED_AT}`]}
											</SortingTableHeader>
											<SortingTableHeader name={`properties.${IssueProperties.ASSIGNEES}`}> 
												{TICKETS_TABLE_COLUMNS_LABEL[`properties.${IssueProperties.ASSIGNEES}`]}
											</SortingTableHeader>
											<SortingTableHeader name={`properties.${BaseProperties.OWNER}`}>
												{TICKETS_TABLE_COLUMNS_LABEL[`properties.${BaseProperties.OWNER}`]}
											</SortingTableHeader>
											<SortingTableHeader name={`properties.${IssueProperties.DUE_DATE}`}>
												{TICKETS_TABLE_COLUMNS_LABEL[`properties.${IssueProperties.DUE_DATE}`]}
											</SortingTableHeader>
											<SortingTableHeader name={`properties.${IssueProperties.PRIORITY}`}>
												{TICKETS_TABLE_COLUMNS_LABEL[`properties.${IssueProperties.PRIORITY}`]}
											</SortingTableHeader>
											<SortingTableHeader name={`properties.${BaseProperties.STATUS}`}>
												{TICKETS_TABLE_COLUMNS_LABEL[`properties.${BaseProperties.STATUS}`]}
											</SortingTableHeader>
											<SortingTableHeader name={`modules.safetibase.${SafetibaseProperties.LEVEL_OF_RISK}`}>
												{TICKETS_TABLE_COLUMNS_LABEL[`modules.safetibase.${SafetibaseProperties.LEVEL_OF_RISK}`]}
											</SortingTableHeader>
											<SortingTableHeader name={`modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`}>
												{TICKETS_TABLE_COLUMNS_LABEL[`modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`]}
											</SortingTableHeader>
											<ColumnsVisibilitySettings />
										</Headers>
									</>
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
