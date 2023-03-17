/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { TicketListAssignees } from '@controls/assignees/ticketListAssignees/ticketListAssignees.component';
import styled from 'styled-components';

export const Id = styled.div`
	color: ${({ theme }) => theme.palette.base.main};
	font-weight: 500;
	font-size: 10px;
	line-height: 14px;
`;

export const Title = styled.div`
	color: ${({ theme }) => theme.palette.secondary.main};
	font-weight: 500;
	font-size: 12px;
	line-height: 16px;
	padding-top: 5px;
	width: fit-content;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	&:hover {
		text-decoration: underline;
	}
`;

// TODO - fix after new palette is released
export const Ticket = styled.div<{ $selected?: boolean }>`
	position: relative;
	cursor: pointer;
	padding: 12px 14px 16px;
	background-color: ${({ theme, $selected }) => ($selected ? '#edf0f8' : theme.palette.primary.contrast)};
`;

export const ChipList = styled.div`
	display: inline-flex;
	gap: 7px;
	margin: 8px 0 0;
`;

export const Assignees = styled(TicketListAssignees)`
	margin-left: auto;
	.MuiButtonBase-root {
		cursor: pointer;
	}
`;

export const IssuePropertiesRow = styled.div`
	margin: 7px 0 0;
	display: inline-flex;
	width: 100%;
	align-items: center;
`;
