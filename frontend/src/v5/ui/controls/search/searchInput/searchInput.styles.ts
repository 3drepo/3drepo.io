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
import styled, { css } from 'styled-components';
import {
	IconButton as IconButtonComponent,
	TextField as TextFieldComponent,
	InputAdornment as InputAdornmentComponent,
} from '@mui/material';
import { FilterChip } from '@controls/chip/filterChip/filterChip.styles';

export const IconButton = styled(IconButtonComponent)`
	padding: 6px;
	width: 22px;

	svg {
		height: 9px;
	}
`;

export const SearchChip = styled(FilterChip)`
	.MuiChip-root {
		color: ${({ theme }) => theme.palette.primary.main};
		border-color: ${({ theme }) => theme.palette.primary.main};
		background-color: ${({ theme }) => theme.palette.primary.lightest};
		padding-right: 3px;
	}
	& + & >.MuiChip-root {
		margin-left: 3px;
	}
`;

export const TextField = styled(TextFieldComponent)<{multiline: boolean }>`
	margin: 8px;
	gap: 3px;
	${({ multiline }) => multiline && css`
		.MuiInputBase-root {
			height: unset
		}
	`}

	.MuiInputBase-adornedEnd {
		padding-right: 0;
	}
	.MuiInputBase-input {
		padding: 0 7px;
		::placeholder {
			min-width: fit-content;
			opacity: 1;
			color: ${({ theme }) => theme.palette.base.main};
		}
		.MuiInputAdornment-root + & {
			padding-left: 4px;
		}
	}
`;

export const StartAdornment = styled(InputAdornmentComponent).attrs({
	position: 'start',
})`
	svg {
		margin-right: 7px;
		color: ${({ theme }) => theme.palette.base.main};
	}
`;

export const EndAdornment = styled(InputAdornmentComponent).attrs({
	position: 'end',
})<{ $isVisible?: boolean }>`
	${({ $isVisible }) => !$isVisible && css`
		visibility: hidden;
	`}
`;
