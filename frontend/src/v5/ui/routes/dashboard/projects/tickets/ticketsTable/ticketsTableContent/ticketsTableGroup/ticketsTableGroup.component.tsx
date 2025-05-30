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
import { BaseProperties, IssueProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { Table, Header, Headers, Group, NewTicketRow, NewTicketText, PlaceholderForStickyFunctionality, NewTicketTextContainer } from './ticketsTableGroup.styles';
import { TicketsTableRow } from './ticketsTableRow/ticketsTableRow.component';
import { NewTicketMenu } from '../../newTicketMenu/newTicketMenu.component';
import { useSelectedModels } from '../../newTicketMenu/useSelectedModels';
import { getPropertyLabel, getAssignees, SetTicketValue, sortAssignees } from '../../ticketsTable.helper';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { ColumnsVisibilitySettings } from './columnsVisibilitySettings/columnsVisibilitySettings.component';
import { orderBy } from 'lodash';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { SortingArrow } from '@controls/sortingArrow/sortingArrow.component';
import { useParams } from 'react-router';
import { ResizableTableHeader } from '@controls/resizableTableContext/resizableTableHeader/resizableTableHeader.component';

const SortingTableHeader = ({ name, children, disableSorting = false, ...props }) => {
	const { isDescendingOrder, onColumnClick, sortingColumn } = useContext(SortedTableContext);
	const isSelected = name === sortingColumn;

	if (disableSorting) return (
		<ResizableTableHeader name={name}>
			<Header {...props}>
				{children}
			</Header>
		</ResizableTableHeader>
	);

	return (
		<ResizableTableHeader name={name} onClick={() => onColumnClick(name)}>
			<Header {...props} $selectable>
				{isSelected && (<SortingArrow ascendingOrder={isDescendingOrder} />)}
				{children}
			</Header>
		</ResizableTableHeader>
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
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);
	const { getRowWidth, visibleSortedColumnsNames } = useContext(ResizableTableContext);
	const models = useSelectedModels();
	const newTicketButtonIsDisabled = !models.filter(({ role }) => isCommenterRole(role)).length;
	const hideNewticketButton = template.deprecated;

	const assigneesSort = (items: ITicket[], order) => orderBy(
		items.map(sortAssignees),
		[
			(item) => getAssignees(item).length,
			(item) => getAssignees(item).join(),
		],
		[order, order],
	);

	const customSortingFunctions = {
		[`properties.${IssueProperties.ASSIGNEES}`]: assigneesSort,
	};

	return (
		<Table $empty={!tickets.length} $canCreateTicket={!newTicketButtonIsDisabled}>
			<SortedTableComponent items={tickets} sortingColumn={BaseProperties.CREATED_AT} customSortingFunctions={customSortingFunctions}>
				<SortedTableContext.Consumer>
					{({ sortedItems }: SortedTableType<ITicket>) => (
						<>
							{!tickets.length
								? (<PlaceholderForStickyFunctionality />)
								: (
									<>
										<Headers>
											{visibleSortedColumnsNames.map((name) => (
												<SortingTableHeader key={name} name={name} disableSorting={name === 'id'}>
													{getPropertyLabel(name)}
												</SortingTableHeader>
											))}
											<ColumnsVisibilitySettings />
										</Headers>
									</>
								)}
							<Group $empty={!sortedItems?.length} $hideNewticketButton={hideNewticketButton}>
								{sortedItems.map(({ modelId, ...ticket }) => (
									<TicketsTableRow
										key={ticket._id}
										ticket={ticket}
										modelId={modelId}
										onClick={onEditTicket}
										selected={selectedTicketId === ticket._id}
									/>
								))}
								{!hideNewticketButton &&
									<NewTicketMenu
										disabled={newTicketButtonIsDisabled}
										TriggerButton={(
											<NewTicketRow
												disabled={newTicketButtonIsDisabled}
												style={{ width: getRowWidth() }}
											>
												<NewTicketTextContainer>
													<AddCircleIcon />
													<NewTicketText>
														<FormattedMessage id="ticketTable.row.newTicket" defaultMessage="New ticket" />
													</NewTicketText>
												</NewTicketTextContainer>
											</NewTicketRow>
										)}
										useMousePosition
										onContainerOrFederationClick={onNewTicket}
									/>
								}
							</Group>
						</>
					)}
				</SortedTableContext.Consumer>
			</SortedTableComponent>
		</Table>
	);
};
