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
import { DialogActions, DialogContent, IconButton } from '@material-ui/core';

export const CloseButton = styled(IconButton)`
	&& {
		position: absolute;
		top: 11px;
		right: 11px;

		/* Turn SVG white */
		filter: invert(100%) sepia(100%) saturate(7%) hue-rotate(159deg) brightness(104%) contrast(102%);
	}
`;

export const Form = styled.form`
	display: flex;
	flex-direction: column;
	min-width: 520px;
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
`;

export const Title = styled(Typography).attrs({
	variant: 'h2',
})`
	color: ${({ theme }) => theme.palette.primary.contrast};
	position: relative;
	padding: 27px;
	height: 74px;
	user-select: none;
	box-sizing: border-box;
`;

export const FormDialogContent = styled(DialogContent)`
	margin: 20px 34px 43px;
`;

export const FormDialogActions = styled(DialogActions)`
	background: ${({ theme }) => theme.palette.tertiary.lightest};
	box-shadow: 0 6px 10px rgba(0, 0, 0, 0.14), 0 1px 18px rgba(0, 0, 0, 0.12), 0 3px 5px rgba(0, 0, 0, 0.2);
`;

export const Header = styled.div`
	background: linear-gradient(89.98deg,
	${({ theme }) => theme.palette.secondary.main} 0.01%,
	${({ theme }) => theme.palette.secondary.mid} 99.99%);
`;
