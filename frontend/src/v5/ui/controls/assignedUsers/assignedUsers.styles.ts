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

import AvatarIcon from '@mui/material/Avatar';
import { Avatar } from '@controls/avatar';
import styled, { css } from 'styled-components';

const OVERLAP_WIDTH = '10px';

const CircleStyles = css`
	border: 2px solid ${({ theme }) => theme.palette.primary.contrast} !important;
	color: ${({ theme }) => theme.palette.primary.contrast};
	height: 28px;
	width: 28px;

	pointer-events: auto;
	display: inline-flex;
	margin: 0 -${OVERLAP_WIDTH} 0 0;
	&:hover {
		z-index: 1000;
	}
`;

export const UserCircle = styled(Avatar)<{ index: number }>`
	margin: 0 -${OVERLAP_WIDTH} 0 0;
	
	>.MuiAvatar-root {
		background-color: ${({ theme }) => theme.palette.secondary.main};
		z-index: ${({ index }) => 100 - index};
		${CircleStyles}
	}
`;

export const WhiteOverlay = styled.div`
	width: 100%;
	height: 100%;
	position: absolute;

	opacity: 0;
	transition: opacity 0.2s;
	background-color: white;
	pointer-events: none;
	z-index: 500;
`;

export const AssignedUsersList = styled.div`
	pointer-events: none;
	position: relative;
	width: fit-content;

	&:hover {
		${WhiteOverlay} {
			opacity: 0.3;
			transition: opacity 0.2s;
		}
	}
`;

export const ExtraUsersCircle = styled(AvatarIcon)`
	${CircleStyles}
	background-color: ${({ theme }) => theme.palette.primary.main};
`;
