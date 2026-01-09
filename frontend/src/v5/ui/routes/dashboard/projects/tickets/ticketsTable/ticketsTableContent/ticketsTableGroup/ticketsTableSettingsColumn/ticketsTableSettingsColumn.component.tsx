import { VirtualList } from "@controls/virtualList/virtualList.component";
import { Headers, HeaderCell } from "../ticketsTableHeaders/ticketsTableHeaders.styles";
import { ColumnsVisibilitySettings } from "../columnsVisibilitySettings/columnsVisibilitySettings.component";
import { chunk } from "lodash";
import { Row } from "../ticketsTableRow/ticketsTableRow.styles";
import { CellContainer } from "../ticketsTableRow/ticketsTableCell/cell/cell.styles";
import { TICKET_TABLE_ROW_HEIGHT } from "../../../ticketsTable.helper";
import { TICKETS_CHUNK_SIZE } from "../ticketsTableGroup.component";
import { ITicket } from "@/v5/store/tickets/tickets.types";
import { SettingsColumnContainer } from "./ticketsTableSettingsColumn.styles";

export const TicketsTableSettingsColumn = ({ tickets, selectedTicketId }) => (
	<span>
		<Headers>
			<HeaderCell alwaysVisible>
				<ColumnsVisibilitySettings />
			</HeaderCell>
		</Headers>
		<SettingsColumnContainer $empty={!tickets?.length} $hideNewticketButton={true}>
			<VirtualList
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