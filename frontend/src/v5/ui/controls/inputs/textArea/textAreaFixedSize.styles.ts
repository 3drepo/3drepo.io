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

import styled, { css } from 'styled-components';
import InputBase from '@mui/material/Input';

export const Input = styled(InputBase)<{ $height }>`
	min-height: ${({ $height }) => $height}px;
`;

export const Container = styled.div<{ $error?: boolean, $height: number }>`
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border: solid 1px;
	border-color: ${({ theme }) => theme.palette.base.lightest};
	border-radius: 5px;
	overflow-x: hidden;
	min-height: ${({ $height }) => $height}px;

	& > div > :last-child {
		margin-right: -3px;
	}

	${({ theme, $error }) => ($error ? css`
		&& {
			background-color: ${theme.palette.error.lightest};
			border-color: ${theme.palette.error.main};
			&:focus, &:focus-within {
				box-shadow: 0 0 2px ${theme.palette.error.main};
			}
		}
	` : css`
		&:focus, &:focus-within {
			border-color: ${theme.palette.primary.main};
			box-shadow: 0 0 2px ${theme.palette.primary.main};
		}
	`)}

	.MuiInputBase-multiline {
		padding: 5px 15px 5px 10px;
	}

	textarea {
		color: ${({ theme, $error }) => ($error ? theme.palette.error.main : theme.palette.secondary.main)};
	}
`;
