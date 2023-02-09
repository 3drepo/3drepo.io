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

import styled from 'styled-components';

import { SubmitButton as SubmitButtonBase } from '@controls/submitButton';
import { DialogActions, DialogContent, Paper } from '@mui/material';

export const RemoveWhiteCorners = styled(Paper)`
	background-color: transparent;
`;

export const Form = styled.form`
	display: flex;
	flex-direction: column;
	min-width: 520px;

	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	border-radius: 15px; /* prevents white pixels in corners */
`;

export const FormDialogContent = styled(DialogContent)`
	padding: 27px 58px 65px;
	display: block;
	overflow: visible;
`;

export const FormDialogActions = styled(DialogActions)`
	background: ${({ theme }) => theme.palette.tertiary.lightest};
	box-shadow: ${({ theme }) => theme.palette.shadows.level_7};
`;

export const SubmitButton = styled(SubmitButtonBase)`
	margin: 8px;
`;
