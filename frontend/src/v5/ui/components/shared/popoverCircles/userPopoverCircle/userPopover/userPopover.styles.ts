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

export const AvatarWrapper = styled.div`
	display: flex;
	align-items: flex-start;
`;

export const PopoverContainer = styled.div`
	padding: 10px;
	display: flex;
	font-family: ${({ theme }) => theme.typography.fontFamily};
	color: ${({ theme }) => theme.palette.secondary.main};
`;

export const Data = styled.div`
	padding: 0 0 0 10px;
	height: auto;
	align-self: center;
	overflow: hidden;
	color: ${({ theme }) => theme.palette.base.main};
`;

export const Heading = styled(Typography)`
	${({ theme }) => theme.typography.h5};
	color: ${({ theme }) => theme.palette.secondary.main};
	margin: auto 0;
`;

export const Username = styled(Typography)`
	${({ theme }) => theme.typography.body1};
	margin-top: 2px;
`;

export const Employment = styled(Typography)`
	${({ theme }) => theme.typography.caption};
	margin-top: 2px;
`;
