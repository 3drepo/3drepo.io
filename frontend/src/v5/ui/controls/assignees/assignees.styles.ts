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
import { MultiSelect } from '@controls/inputs/multiSelect/multiSelect.component';
import { ExtraAssigneesCircle } from './extraAssignees/extraAssigneesCircle.component';

export const HiddenSearchSelect = styled(MultiSelect)`
	height: 0;
	width: 0;
	overflow: hidden;
	position: absolute;
	right: 0;
`;

const BaseCircle = css`
	margin: 0 -8px 0 0;
	color: ${({ theme }) => theme.palette.primary.main};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	height: 28px;
	width: 28px;
	pointer-events: auto;
	
	.MuiAvatar-root {
		border: 2px solid ${({ theme }) => theme.palette.primary.contrast};
		box-sizing: border-box;
		height: 100%;
		width: 100%;
		font-size: 10px;
	}
`;

export const UserCircle = styled(Avatar)`
	${BaseCircle}
	.MuiAvatar-root {
		background-color: ${({ theme }) => theme.palette.base.lightest};
		color: ${({ theme }) => theme.palette.secondary.main};
	}
`;

export const JobCircle = styled(JobAvatar)`
	${BaseCircle}
`;

export const ExtraAssignees = styled(ExtraAssigneesCircle)`
	${BaseCircle}
	.MuiAvatar-root {
		background-color: ${({ theme }) => theme.palette.primary.main};
		color: ${({ theme }) => theme.palette.primary.contrast};
	}
`;

export const AssigneesList = styled.div`
	position: relative;
	width: fit-content;
	user-select: none;
	color: ${({ theme }) => theme.palette.base.main};
	font-size: 10px;

	.MuiButtonBase-root {
		z-index: 11;
		&:hover {
			z-index: 12; /* avatar appears on top when hovered */
		}

		::before {
			content: "";
			margin: 0;
			background-color: ${({ theme }) => theme.palette.primary.contrast};
			position: absolute;
			opacity: 0;
			width: 100%;
			height: 100%;
			box-sizing: border-box;
			border-radius: 50%;
			z-index: 10;
		}
	}

	&:hover .MuiButtonBase-root {
		&::before {
			opacity: 0.3;
		}
		&:hover::before {
			opacity: 0;
		}
	}

	>:last-child .MuiButtonBase-root {
		margin: 0;
	}
`;
