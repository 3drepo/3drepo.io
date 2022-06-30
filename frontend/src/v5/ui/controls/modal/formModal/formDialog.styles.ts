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

import { Typography } from '@controls/typography';
import { SubmitButton as SubmitButtonBase } from '@controls/submitButton';
import { DialogActions, DialogContent, IconButton, Paper } from '@mui/material';

export const RemoveWhiteCorners = styled(Paper)`
	background-color: rgba(0, 0, 0, 0);
`;

export const CloseButton = styled(IconButton)`
	&& {
		position: absolute;
		top: 8px;
		right: 10px;

		svg path {
			stroke: ${({ theme }) => theme.palette.primary.contrast}
		}
	}
`;

export const Form = styled.form`
	display: flex;
	flex-direction: column;
	min-width: 520px;

	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	border-radius: 15px; /* prevents white pixels in corners */
`;

export const Header = styled.div`
	background: ${({ theme }) => theme.palette.gradient.secondary};
	height: 74px;
	width: 100%;
	box-sizing: border-box;
	align-items: center;
	display: flex;
	padding: 0 35px;
`;

export const Title = styled(Typography).attrs({
	variant: 'h2',
	component: 'div',
})`
	text-align: left;
	color: ${({ theme }) => theme.palette.primary.contrast};
`;

export const Subtitle = styled(Typography).attrs({
	variant: 'h5',
	component: 'div',
})`
	text-align: left;
	color: ${({ theme }) => theme.palette.secondary.lightest};
`;

export const FormDialogContent = styled(DialogContent)<{ $zeromargin?: boolean }>`
	margin: ${({ $zeromargin }) => ($zeromargin ? '0' : '20px 34px 43px')};
	display: block;
	flex-flow: row wrap;
`;

export const FormDialogActions = styled(DialogActions)`
	background: ${({ theme }) => theme.palette.tertiary.lightest};
	box-shadow: ${({ theme }) => theme.palette.shadows.level_7};
`;

export const SubmitButton = styled(SubmitButtonBase)`
	margin: 8px;
`;
