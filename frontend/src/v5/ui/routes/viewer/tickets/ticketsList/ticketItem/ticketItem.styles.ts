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

import { ControlledAssigneesSelect } from '@controls/assigneesSelect/controlledAssigneesSelect.component';
import styled, { css } from 'styled-components';
import { Title } from './ticketItemBaseInfo/ticketItemBaseInfo.styles';
import { StatusChip } from '@controls/chip/statusChip/statusChip.component';
import { DueDateWithLabel } from '@controls/dueDate/dueDateWithLabel/dueDateWithLabel.component';

export const TicketItemContainer = styled.div<{ $selected?: boolean }>`
	position: relative;
	display: flex;
	flex-flow: column;
	cursor: pointer;
	padding: 10px;
	gap: 10px;
	background-color: ${({ theme, $selected }) => ($selected ? theme.palette.primary.lightest : theme.palette.primary.contrast)};
	${({ theme, $selected }) => $selected && css`
		background-color: ${theme.palette.primary.lightest};
		${Title} {
			color: ${theme.palette.primary.dark}
		}
	`}
`;

export const DueDateLabel = styled(DueDateWithLabel)`
	min-width: 131px;
`;

export const FlexRow = styled.div`
	display: inline-flex;
	gap: 7px;
	width: 100%;
`;

export const IssuePropertiesRow = styled(FlexRow)`
	align-items: center;
	gap: 0;
`;

export const Assignees = styled(ControlledAssigneesSelect).attrs({
	maxItems: 5,
	showEmptyText: true,
	multiple: true,
})`
	margin-left: auto;
	height: 28px;
`;

export const FloatingStatus = styled(StatusChip)`
	position: absolute;
	right: 10px;
	bottom: 10px;
	max-width: 125px;
`;
