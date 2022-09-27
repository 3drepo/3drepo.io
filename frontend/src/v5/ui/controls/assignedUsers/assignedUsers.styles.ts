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
	&:hover { /* avatar appears on top when hovered */
		z-index: 1000;
	}
`;

export const UserCircle = styled(Avatar)<{ index: number }>`
	margin: 0 -${OVERLAP_WIDTH} 0 0;
	
	>.MuiAvatar-root {
		background-color: ${({ theme }) => theme.palette.secondary.main};
		z-index: ${({ index }) => 100 - index};
		${CircleStyles}
		
		&:before { /* a white layer which fades avatars on hover */
			content: "";
			${CircleStyles}
			margin: 0;
			background-color: white;
			position: absolute;
			opacity: 0;
		}
	}
	&:hover {
		>.MuiAvatar-root:before {/* prevent focused avatar from fading */
			opacity: 0 !important;
		}
	}
`;

export const AssignedUsersList = styled.div`
	pointer-events: none;
	position: relative;
	width: fit-content;

	&:hover .MuiAvatar-root:before { /* fade avatars on hover */
		opacity: 0.3;
	}
`;

export const ExtraUsersCircle = styled(AvatarIcon)`
	${CircleStyles}
	background-color: ${({ theme }) => theme.palette.primary.main};
`;
