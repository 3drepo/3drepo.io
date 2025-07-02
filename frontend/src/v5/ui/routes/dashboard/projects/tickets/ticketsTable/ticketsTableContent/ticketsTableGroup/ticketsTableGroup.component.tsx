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
import { isCommenterRole } from '@/v5/store/store.helpers';
import { SortedTableComponent, SortedTableContext, SortedTableType } from '@controls/sortedTableContext/sortedTableContext';
import { BaseProperties, IssueProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { Table, Group, PlaceholderForStickyFunctionality } from './ticketsTableGroup.styles';
import { TicketsTableRow } from './ticketsTableRow/ticketsTableRow.component';
import { useSelectedModels } from '../../newTicketMenu/useSelectedModels';
import { getAssignees, SetTicketValue, sortAssignees } from '../../ticketsTable.helper';
import { orderBy } from 'lodash';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router';
import { TicketsTableHeaders } from './ticketsTableHeaders/ticketsTableHeaders.component';
import { NewTicketRowButton } from './newTicketRowButton/newTicketRowButton.component';
import { VirtualList } from '@controls/virtualList/virtualList.component';
import { getState } from '@/v5/helpers/redux.helpers';
import { selectTicketPropertyByName } from '@/v5/store/tickets/tickets.selectors';
import { useWatchPropertyChange } from '../../useWatchPropertyChange';

type TicketsTableGroupContentProps = {
	tickets: ITicket[];
	sortedItems: ITicket[];
	sortingColumn: string;
	refreshSorting: () => void;
	selectedTicketId?: string;
	onEditTicket: SetTicketValue;
	onNewTicket: (modelId: string) => void;
	newTicketButtonIsDisabled: boolean;
	hideNewticketButton: boolean;
};

const TicketsTableGroupContent = ({ 
	tickets, 
	sortedItems,
	refreshSorting,
	sortingColumn,
	selectedTicketId, 
	onEditTicket, 
	onNewTicket, 
	newTicketButtonIsDisabled, 
	hideNewticketButton,
}: TicketsTableGroupContentProps) => {
	// useWatchPropertyChange(sortingColumn, refreshSorting);

	return (
		<>
			{!tickets.length ? <PlaceholderForStickyFunctionality /> : <TicketsTableHeaders />}
			<Group $empty={!sortedItems?.length} $hideNewticketButton={hideNewticketButton}>
				<VirtualList
					items={sortedItems}
					itemHeight={37}
					itemContent={(ticket: ITicket) => (
						<TicketsTableRow
							key={ticket._id}
							ticket={ticket}
							modelId={ticket.modelId}
							onClick={onEditTicket}
							selected={selectedTicketId === ticket._id}
						/>
					)}
				/>
				{!hideNewticketButton &&
				<NewTicketRowButton
					onNewTicket={onNewTicket}
					disabled={newTicketButtonIsDisabled}
				/>
				}
			</Group>
		</>
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

	const sortTicketsByProperty = (items: ITicket[], order, column: string) => {
		return orderBy(
			items,
			(item) => {
				const sortingElement = selectTicketPropertyByName(getState(), item._id, column);
		
				return sortingElement?.toLowerCase?.() ?? sortingElement;
			},
			order,
		);
	};

	const customSortingFunctions = (column: string) => {
		if (column === `properties.${IssueProperties.ASSIGNEES}` ) return assigneesSort;

		return sortTicketsByProperty;
	};

	return (
		<Table $empty={!tickets.length} $canCreateTicket={!newTicketButtonIsDisabled}>
			<SortedTableComponent items={tickets} sortingColumn={BaseProperties.CREATED_AT} customSortingFunctions={customSortingFunctions}>
				<SortedTableContext.Consumer>
					{({ refreshSorting, sortedItems, sortingColumn }: SortedTableType<ITicket>) => (
						<TicketsTableGroupContent
							tickets={tickets}
							selectedTicketId={selectedTicketId}
							onEditTicket={onEditTicket}
							onNewTicket={onNewTicket}
							newTicketButtonIsDisabled={newTicketButtonIsDisabled}
							hideNewticketButton={hideNewticketButton}
							sortedItems={sortedItems}
							sortingColumn={sortingColumn}
							refreshSorting={refreshSorting}
						/>
					)}
				</SortedTableContext.Consumer>
			</SortedTableComponent>
		</Table>
	);
};
