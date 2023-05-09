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

import { FormControl } from '@mui/material';
import styled, { css } from 'styled-components';

export const CustomInput = styled(FormControl)<{ selected?: boolean }>`
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border: solid 1px;
	border-radius: 8px;
	padding: 10px 15px;
	width: 100%;

	${({ disabled, theme: { palette } }) => (disabled ? css`
		border-color: ${palette.secondary.lightest};
		color: ${palette.base.light};
	` : css`
		border-color: ${palette.base.lightest};
		color: ${palette.secondary.main};
	`)}

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
