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
import { chunk } from 'lodash';
import { VirtualList } from '@controls/virtualList/virtualList.component';
import { Headers, HeaderCell } from '../ticketsTableHeaders/ticketsTableHeaders.styles';
import { ColumnsVisibilitySettings } from '../columnsVisibilitySettings/columnsVisibilitySettings.component';
import { Row } from '../ticketsTableRow/ticketsTableRow.styles';
import { CellContainer } from '../ticketsTableRow/ticketsTableCell/cell/cell.styles';
import { TICKET_TABLE_ROW_HEIGHT } from '../../../ticketsTable.helper';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { SettingsColumnContainer } from './ticketsTableSettingsColumn.styles';
import { TICKETS_CHUNK_SIZE } from '../ticketsTableGroup.helper';

export const TicketsTableSettingsColumn = ({ tickets, selectedTicketId }) => (
	<span>
		<Headers>
			<HeaderCell alwaysVisible>
				<ColumnsVisibilitySettings />
			</HeaderCell>
		</Headers>
		<SettingsColumnContainer $empty={!tickets?.length} $hideNewticketButton={true}>
			<VirtualList
				vKey="settings-column"
				items={chunk(tickets, TICKETS_CHUNK_SIZE)}
				itemHeight={TICKET_TABLE_ROW_HEIGHT * TICKETS_CHUNK_SIZE}
				ItemComponent={(ticketsChunk: ITicket[]) => (
					<div key={ticketsChunk[0]._id}>
						{ticketsChunk.map((ticket) => (
							<Row key={ticket._id} $selected={selectedTicketId === ticket._id}>
								<CellContainer alwaysVisible />
							</Row>
						))}
					</div>
				)}
			/>
		</SettingsColumnContainer>
	</span>
);