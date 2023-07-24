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

import { ActionMenuItem } from '@controls/actionMenu';
import styled from 'styled-components';

export const Container = styled.div`
	padding: 20px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border-radius: 5px;
	box-shadow: ${({ theme }) => theme.palette.shadows.level_3};
`;

export const Header = styled.span`
	padding-bottom: 16px;
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	color: ${({ theme }) => theme.palette.secondary.main};
	${({ theme }) => theme.typography.h5};
	font-weight: 600;
`;

export const CloseButton = styled(ActionMenuItem)`
	height: 15px;
	cursor: pointer;

	svg {
		height: 12px;
		width: 12px;
	}
`;
