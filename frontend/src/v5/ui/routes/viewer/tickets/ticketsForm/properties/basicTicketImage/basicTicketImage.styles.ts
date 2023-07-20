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

import { InputLabel } from '@mui/material';
import styled, { css } from 'styled-components';

export const Container = styled.div<{ error?: boolean, disabled?: boolean; }>`
	padding: 13px;
	border: solid 1px;
	${({ disabled, theme: { palette } }) => (disabled ? css`
		border-color: ${palette.secondary.lightest};
		color: ${palette.base.light};
	` : css`
		border-color: ${palette.base.lightest};
		color: ${palette.secondary.main};
	`)}
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border-radius: 8px;
	display: flex;
	flex-direction: row;
	justify-content: space-between;

	${({ error, theme }) => error && css`
		border: solid 1px ${theme.palette.error.main};
		background-color: ${theme.palette.error.lightest};
	`}
`;

export const Label = styled(InputLabel)`
	${({ theme }) => theme.typography.h5}
	color: inherit;
	margin-bottom: 2px;
	max-width: 100%;
	word-wrap: break-word;
	text-overflow: ellipsis;
`;

export const ActionsSide = styled.div`
	display: flex;
	flex-direction: column;
	max-width: 40%;
`;

export const ActionsList = styled.ul`
	list-style-type: none;
	padding: 0;
	margin: 0;
`;
