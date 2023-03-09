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

import styled from 'styled-components';
import { ManyOfProperty } from '@/v5/ui/routes/viewer/tickets/ticketsForm/properties/manyOfProperty.component';
import { CircleButton } from '@controls/circleButton';
import { FONT_WEIGHT } from '@/v5/ui/themes/theme';
import { AssigneesList as AssigneesListBase } from '../assigneesList/assigneesList.component';

export const HiddenManyOfProperty = styled(ManyOfProperty)`
	height: 0;
	width: 0;
	overflow: hidden;
	position: absolute;
	right: 0;
	top: 0;
`;

export const AssigneesList = styled(AssigneesListBase)`
	.MuiButtonBase-root {
		height: unset;
		width: unset;
		cursor: default;
		.MuiAvatar-root {
			height: 28px;
			width: 28px;
		}
	}
`;

export const AddUserButton = styled(CircleButton)`
	height: 24px;
	width: 24px;
	min-width: unset;
	border: 1px dashed ${({ theme }) => theme.palette.base.light};
	padding: 5px;
	color: ${({ theme }) => theme.palette.base.main};
	margin: 2px 0 0 10px;
`;

export const InlineAssignees = styled.div`
	display: inline-flex;
	align-items: center;
	user-select: none;
	position: relative;

	${({ theme }) => theme.typography.kicker};
	letter-spacing: 0.3px;
	font-weight: ${FONT_WEIGHT.MEDIUM};
`;
