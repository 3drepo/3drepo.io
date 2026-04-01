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
import { Table, Group, PlaceholderForStickyFunctionality, RoundedContainer } from './ticketsTableGroup.styles';
import { TicketsTableRow } from './ticketsTableRow/ticketsTableRow.component';
import { useSelectedModels } from '../../newTicketMenu/useSelectedModels';
import { SetTicketValue, TICKET_TABLE_ROW_HEIGHT } from '../../ticketsTable.helper';
import { chunk } from 'lodash';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router';
import { TicketsTableHeaders } from './ticketsTableHeaders/ticketsTableHeaders.component';
import { NewTicketRowButton } from './newTicketRowButton/newTicketRowButton.component';
import { useWatchPropertyChange } from '../../useWatchPropertyChange';
import { TicketsTableSelectionColumn } from './ticketsTableSelectionColumn/ticketsTableSelectionColumn.component';
import { VirtualList } from '@controls/virtualList/virtualList.component';
import { TicketsTableSettingsColumn } from './ticketsTableSettingsColumn/ticketsTableSettingsColumn.component';
import { TICKETS_CHUNK_SIZE } from './ticketsTableGroup.helper';
import { useContext } from 'react';
import { SortedGroupedTableContext } from '@controls/sortedTableContext/sortedGroupedTableContext';

type TicketsTableGroupContentProps = {
	tickets: ITicket[];
	selectedTicketId?: string;
	onEditTicket: SetTicketValue;
	hideNewticketButton: boolean;
};

const TicketsTableGroupContent = ({ 
	tickets,
	selectedTicketId, 
	onEditTicket,
	hideNewticketButton,
}: TicketsTableGroupContentProps) => {
	const { refreshSorting, sortingColumn } = useContext(SortedGroupedTableContext);
	useWatchPropertyChange(sortingColumn, refreshSorting);

	const ticketsIds = tickets.map(({ _id }) => _id);

	return (
		<>
			{!tickets.length ? <PlaceholderForStickyFunctionality /> : <TicketsTableHeaders ticketsIds={ticketsIds}/>}
			<Group $empty={!tickets?.length} $hideNewticketButton={hideNewticketButton}>
				<VirtualList
					items={chunk(tickets, TICKETS_CHUNK_SIZE)}
					itemHeight={TICKET_TABLE_ROW_HEIGHT}
					ItemComponent={(ticketsChunk: ITicket[]) => (
						<div key={ticketsChunk[0]._id}>
							{ticketsChunk.map((ticket) => (
								<TicketsTableRow
									key={ticket._id}
									ticket={ticket}
									modelId={ticket.modelId}
									onClick={onEditTicket}
									selected={selectedTicketId === ticket._id}
								/>))}
						</div>
					)}
				/>
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
	const disabledModelIds: string[] = models.filter(({ role }) => !isCommenterRole(role)).map(({ _id }) => _id);
	const hideSelectionColumn = models.every(({ role }) => !isCommenterRole(role));

	return (
		<RoundedContainer $hideSelectionColumn={hideSelectionColumn} $hideNewTicketButton={hideNewticketButton}>
			{!hideSelectionColumn && <TicketsTableSelectionColumn tickets={tickets} selectedTicketId={selectedTicketId} disabledModelIds={disabledModelIds} />}
			<Table $canCreateTicket={!newTicketButtonIsDisabled}>
				<TicketsTableGroupContent
					tickets={tickets}
					selectedTicketId={selectedTicketId}
					onEditTicket={onEditTicket}
					hideNewticketButton={hideNewticketButton}
				/>
			</Table>
			<TicketsTableSettingsColumn tickets={tickets} selectedTicketId={selectedTicketId} />
			{!hideNewticketButton &&
				<NewTicketRowButton
					onNewTicket={onNewTicket}
					disabled={newTicketButtonIsDisabled}
				/>
			}
		</RoundedContainer>
	);
};
