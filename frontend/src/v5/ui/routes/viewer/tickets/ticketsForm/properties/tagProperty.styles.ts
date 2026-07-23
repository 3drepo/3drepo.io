/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { InputContainer } from '@controls/inputs/inputContainer/inputContainer.styles';
import { InputLabel, FormHelperText } from '@mui/material';
import styled, { css } from 'styled-components';

export const TagPropertyContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
	width: 100%;
`;

export const Label = styled(InputLabel)`
	${({ theme }) => theme.typography.h5};
	position: static;
	transform: none;
	color: inherit;
	max-width: 100%;
`;

export const ChipsInputBox = styled(InputContainer)`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
	gap: 5px;
	padding: 8px 10px 8px 12px;
	cursor: text;
`;

export const TagInput = styled.input`
	flex: 1;
	min-width: 90px;
	height: 22px;
	border: none;
	outline: none;
	background: transparent;
	${({ theme }) => theme.typography.body1};
	color: ${({ theme }) => theme.palette.secondary.main};
	padding: 0;
	font-family: inherit;

	&::placeholder {
		color: ${({ theme }) => theme.palette.base.lighter};
	}

	&:disabled {
		cursor: not-allowed;
	}
`;

export const FieldHint = styled.div<{ $visible: boolean }>`
	${({ theme }) => theme.typography.caption};
	color: ${({ theme }) => theme.palette.secondary.main};
	display: flex;
	align-items: center;
	gap: 4px;
	overflow: hidden;
	pointer-events: none;
	max-height: 0;
	opacity: 0;
	transition: max-height 160ms ease, opacity 140ms ease;

	${({ $visible }) => $visible && css`
		max-height: 22px;
		opacity: 1;
	`}
`;

export const Kbd = styled.kbd`
	display: inline-block;
	padding: 0 4px;
	height: 16px;
	line-height: 16px;
	background: ${({ theme }) => theme.palette.tertiary.lightest};
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	border-radius: 3px;
	${({ theme }) => theme.typography.caption};
	color: ${({ theme }) => theme.palette.secondary.main};
	font-family: ui-monospace, monospace;
`;

export const HelperText = styled(FormHelperText)`
	margin: 0;
`;
