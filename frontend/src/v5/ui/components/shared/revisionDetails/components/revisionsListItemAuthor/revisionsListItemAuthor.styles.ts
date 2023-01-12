/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { Typography } from '@mui/material';
import { FixedOrGrowContainer as FixedOrGrowContainerBase } from '@controls/fixedOrGrowContainer';

export const Text = styled(Typography)<{ $active: boolean }>`
	${({ theme }) => theme.typography.kicker};
	color: ${({ theme, $active }) => ($active ? theme.palette.primary.contrast : theme.palette.base.light)};
	display: inline;
	cursor: pointer;
`;

export const Name = styled.span`
	white-space: nowrap;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	padding-right: 10px;
	box-sizing: border-box;
	display: inline-block;
`;

export const FixedOrGrowContainer = styled(FixedOrGrowContainerBase)<{ $active }>`
	color: ${({ theme, $active }) => ($active ? theme.palette.primary.contrast : theme.palette.base.light)};
`;
