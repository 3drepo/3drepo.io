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

import { Typography } from '@controls/typography';
import styled, { css } from 'styled-components';

export const PinContainer = styled.div<{ selected: boolean, error: boolean }>`
	width: auto;
	color: ${({ theme }) => theme.palette.secondary.main};
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	border-radius: 5px;
	padding: 10px 15px;
	margin: 4px 0;

	${({ selected, theme: { palette } }) => selected && css`
		box-shadow: 0 0 4px ${palette.primary.main};
		border-color: ${palette.primary.main};
	`}

	${({ error, theme: { palette } }) => error && css`
		color: ${palette.error.main};
		background-color: ${palette.error.lightest};
		border-color: ${palette.error.main};
		box-shadow: 0 0 4px ${palette.error.main};
	`}

`;

export const PinActions = styled.div`
	display: flex;
	gap: 14px;
`;

export const PinName = styled(Typography).attrs({
	variant: 'h5',
})<{ required: boolean }>`
	user-select: none;

	${({ required }) => required && css`
		&::after {
			font-weight: 400;
			font-size: 0.75rem;
			color: ${({ theme }) => theme.palette.error.main};
			margin-left: 2px;
			content: '*';
		}
	`}
`;

export const PinAction = styled.div`
	font-size: 10px;
	font-weight: 500;
	color: ${({ theme }) => theme.palette.base.main};
	display: flex;
	align-items: center;
	gap: 3px;
	user-select: none;
	cursor: pointer;
	svg {
		height: 12px;
		width: auto;
	}
`;

export const SettingLocationText = styled(PinAction)`
	font-style: italic;
	color: inherit;
	svg {
		height: 10px;
		margin: 0 5px;
	}
`;
