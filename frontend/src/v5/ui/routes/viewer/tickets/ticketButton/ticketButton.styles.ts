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

import styled, { css } from 'styled-components';

const TicketButtonStyling = styled.button<{ disabled?: boolean }>`
	height: 24px;
	width: 24px;
	margin: 2px;
	border-radius: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	border: none;

	& > svg {
		max-width: 14px;
		max-height: 17px;
	}

	${({ theme, disabled }) => disabled && css`
		&&, &&:hover {
			color: ${theme.palette.primary.contrast};
			background-color: ${theme.palette.base.lightest};
			cursor: initial;
		}
	`}
`;

export const PrimaryTicketButton = styled(TicketButtonStyling)`
	color: ${({ theme }) => theme.palette.primary.main};
	background-color: ${({ theme }) => theme.palette.primary.lightest};

	&:hover {
		color: ${({ theme }) => theme.palette.primary.contrast};
		background-color: ${({ theme }) => theme.palette.primary.main};
	}

	&:active {
		background-color: ${({ theme }) => theme.palette.primary.dark};
	}
`;

export const ErrorTicketButton = styled(TicketButtonStyling)`
	color: ${({ theme }) => theme.palette.error.main};
	background-color: ${({ theme }) => theme.palette.error.lightest};

	&:hover {
		color: ${({ theme }) => theme.palette.primary.contrast};
		background-color: ${({ theme }) => theme.palette.error.main};
	}

	&:active {
		background-color: ${({ theme }) => theme.palette.error.dark};
	}
`;
