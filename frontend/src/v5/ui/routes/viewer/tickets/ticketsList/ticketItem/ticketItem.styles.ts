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
import { StatusChip as StatusChipBase } from '@controls/chip/statusChip/statusChip.component';
import { DueDateWithLabel } from '@controls/dueDate/dueDateWithLabel/dueDateWithLabel.component';
import { TextOverflow } from '@controls/textOverflow';

export const FlexRow = styled.div`
	display: flex;
	gap: 6px;
	width: 100%;
`;

export const FlexColumn = styled(FlexRow)`
	min-width: 0;
	flex-flow: column;
	height: auto;
`;

export const Title = styled(TextOverflow)`
	color: ${({ theme }) => theme.palette.base.main};
	font-weight: 600;
	font-size: 12px;
	line-height: 12px;
	height: 12px;
	min-height: 12px;
	width: fit-content;
	max-width: 100%;
	flex-grow: 0;
`;

export const Description = styled(TextOverflow).attrs({
	lines: 2,
})`
	color: ${({ theme }) => theme.palette.base.main};
	${({ theme }) => theme.typography.label};
	line-height: 11px;
`;

export const TicketItemContainer = styled(FlexColumn)<{ $selected?: boolean }>`
	cursor: pointer;
	box-sizing: border-box;
	padding: 10px;
	min-height: 65px;
	background-color: ${({ theme }) =>  theme.palette.primary.contrast};
	${({ theme, $selected }) => $selected && css`
		background-color: ${theme.palette.primary.lightest};
		${Title} {
			color: ${theme.palette.primary.dark}
		}
	`}
`;

export const DueDateLabel = styled(DueDateWithLabel)`
	height: 12px;
	min-width: 131px;
	>* {
		height: 12px;
		display: flex;
	}
`;

export const BottomRow = styled(FlexRow)`
	align-items: center;
	margin-top: auto;
	height: 10px;
	margin-bottom: 5px;
`;

export const Assignees = styled(ControlledAssigneesSelect).attrs({
	maxItems: 5,
	multiple: true,
	showAddButton: true,
})`
`;

export const StatusChip = styled(StatusChipBase)`
	max-width: 125px;
	margin-left: auto;
`;

export const IssuePropertiesContainer = styled(FlexColumn)`
	margin-top: auto;
	${FlexRow} { 
		height: 12px;
		.MuiChip-root {
			margin-top: -4px;
		}
	}
`;

export const Id = styled.div`
	color: ${({ theme }) => theme.palette.secondary.main};
	${({ theme }) => theme.typography.kicker}
	font-weight: 400;
`;
