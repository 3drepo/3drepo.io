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

import { PopoverCircle } from '@components/shared/popoverCircles/popoverCircle.component';
import { Tooltip as TooltipBase } from '@mui/material';
import styled from 'styled-components';

export const Tooltip = styled(TooltipBase)``;

export const AssigneesListContainer = styled.div`
	display: inline-flex;
	position: relative;
	align-items: center;
	user-select: none;
	color: ${({ theme }) => theme.palette.base.main};
	font-size: 10px;
	line-height: 100%;
	width: fit-content;
	>* {
		cursor: pointer;
	}
	span + ${Tooltip} {
		margin-left: 13px;
	}

	.MuiAvatar-root {
		z-index: 2;
		margin-right: -8px;
		outline: 2px solid ${({ theme }) => theme.palette.primary.contrast};
		&:hover {
			z-index: 3; /* avatar appears on top when hovered */
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
	span:last-child .MuiAvatar-root {
		margin: 0;
	}

	&:hover .MuiAvatar-root {
		&::before {
			opacity: 0.3;
		}
		&:hover::before {
			opacity: 0;
		}
	}
`;

export const AddUserButton = styled(PopoverCircle).attrs({
	size: 'small',
})`
	padding: 5px;
	box-sizing: border-box;
	color: ${({ theme }) => theme.palette.base.main};
	&& {
		border: 1px dashed ${({ theme }) => theme.palette.base.light};
		outline: none;
		margin: 0;
		&::before {
			background-color: transparent;
		}
	}
`;
