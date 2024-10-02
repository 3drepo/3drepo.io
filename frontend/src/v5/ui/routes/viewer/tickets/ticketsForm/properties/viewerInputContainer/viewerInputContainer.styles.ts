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

import { hexToOpacity } from '@/v5/helpers/colors.helper';
import { Link as LinkBase } from 'react-router-dom';
import styled from 'styled-components';

export const Overlay = styled.div`
	background-color: ${({ theme }) => hexToOpacity(theme.palette.primary.contrast, 80)};
	font-weight: 600;
	color: ${({ theme }) => theme.palette.base.dark};
	height: calc(100% - 2px);
	width: calc(100% - 2px);
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: row;
	z-index: 1;
	margin: 1px;
	border-radius: 8px;
`;

export const Link = styled(LinkBase)`
	color: ${({ theme }) => theme.palette.primary.main};
`;
