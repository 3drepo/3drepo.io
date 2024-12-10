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

import { PopoverCircle } from '@components/shared/popoverCircles/popoverCircle.component';
import styled from 'styled-components';

export const ExtraAssigneesList = styled.ul`
	padding: 8px 10px;
	margin: 0;
`;

export const ExtraAssigneesListItem = styled.li`
	${({ theme }) => theme.typography.body1};
	color: ${({ theme }) => theme.palette.secondary.main};
	list-style-type: none;
`;

export const ExtraAssigneesCircle = styled(PopoverCircle).attrs(({ theme }) => ({
	size: 'small',
	backgroundColor: theme.palette.primary.main,
}))``;
