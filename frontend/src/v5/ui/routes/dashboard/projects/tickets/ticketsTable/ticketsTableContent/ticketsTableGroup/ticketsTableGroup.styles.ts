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

import styled, { css } from 'styled-components';
import { ResizableTable } from '@controls/resizableTableContext/resizableTable/resizableTable.component';
import { Row } from './ticketsTableRow/ticketsTableRow.styles';
import { Highlighter } from '@controls/resizableTableContext/resizableTable/overlayElements/movingColumn/movingColumnHighlighter/movingColumnHighlighter.styles';
import { DropLine } from '@controls/resizableTableContext/resizableTable/overlayElements/movingColumn/movingColumnDropAreas/movingColumnDropAreas.styles';
import { Headers } from './ticketsTableHeaders/ticketsTableHeaders.styles';
import { NEW_TICKET_ROW_HEIGHT } from './newTicketRowButton/newTicketRowButton.styles';
import { SELECTION_COLUMN_WIDTH, SETTINGS_COLUMN_WIDTH } from './ticketsTableGroup.helper';

export const PlaceholderForStickyFunctionality = styled(Headers)``;

export const Group = styled.div<{ $empty: boolean, $hideNewticketButton: boolean }>`
	display: grid;
	gap: 1px;
	width: fit-content;
	background-color: transparent;
`;

export const RoundedContainer = styled.div<{ hideNewTicketButton: boolean }>`
	display: grid;
	gap: 1px;
	grid-template-columns: ${SELECTION_COLUMN_WIDTH}px auto ${SETTINGS_COLUMN_WIDTH}px;
	grid-template-areas: "selection tableData settings"
		"newTicketRow newTicketRow newTicketRow";
	margin-right: 40px;

	border-radius: 0 0 10px 10px;
	overflow: hidden;
	>*:first-child {
		${Row}:first-of-type {
			border-top-left-radius: 10px;
		}
		${({ hideNewTicketButton }) => hideNewTicketButton && css`
			${Row}:last-of-type {
				border-bottom-left-radius: 10px;
			}
		`}
	}
`;

export const Table = styled(ResizableTable)<{ $canCreateTicket?: boolean }>`
	overflow-x: unset;
	width: fit-content;

	${Highlighter} {
		border-radius: 10px;

		${({ $canCreateTicket }) => $canCreateTicket && css`
			height: calc(100% - ${NEW_TICKET_ROW_HEIGHT});
		`}
	}

	${DropLine} {
		height: calc(100% - ${NEW_TICKET_ROW_HEIGHT});
	}
`;
