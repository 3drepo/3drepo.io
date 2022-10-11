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

import { Avatar } from '@controls/avatar';
import styled, { css } from 'styled-components';
import { JobAvatar } from '@controls/jobAvatar/jobAvatar.component';
import { ExtraAssigneesCircle } from './extraAssignees/extraAssigneesCircle.component';

const OVERLAP_WIDTH = '10px';

const BaseCircle = css`
	margin: 0 -${OVERLAP_WIDTH} 0 0;
	color: ${({ theme }) => theme.palette.primary.main};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	height: 28px;
	width: 28px;
	
	pointer-events: auto;
	
	.MuiAvatar-root {
		border: 1px solid;
		height: 100%;
		width: 100%;
	}
	.MuiAvatar-root::before {
		content: "";
		margin: 0;
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		position: absolute;
		opacity: 0;
		width: 28px;
		height: 28px;
	}

	&:hover { /* avatar appears on top when hovered */
		z-index: 1000;
		.MuiAvatar-root::before {
			opacity: 0 !important;
		}
	}

`;

export const UserCircle = styled(Avatar)`
	${BaseCircle}
	.MuiAvatar-root {
		background-color: ${({ theme }) => theme.palette.secondary.main};
		color: ${({ theme }) => theme.palette.primary.contrast};
		border-color: currentColor;
	}
`;

export const JobCircle = styled(JobAvatar)`
	${BaseCircle}
	.MuiAvatar-root {
		border-color: ${({ theme }) => theme.palette.secondary.main};
		background-color: ${({ theme }) => theme.palette.primary.contrast};
	}
`;

export const ExtraAssignees = styled(ExtraAssigneesCircle)`
	${BaseCircle}
	.MuiAvatar-root {
		background-color: ${({ theme }) => theme.palette.primary.main};
		border-color: ${({ theme }) => theme.palette.primary.main};
		color: ${({ theme }) => theme.palette.primary.contrast};
	}
`;

export const AssigneesList = styled.div`
	pointer-events: none;
	position: relative;
	width: fit-content;
	user-select: none;
	font-family: ${({ theme }) => theme.typography.fontFamily};
	color: ${({ theme }) => theme.palette.base.main};

	&:hover .MuiAvatar-root::before {
		opacity: 0.3;
	}
	>:last-child {
		margin: 0;
	}
`;
