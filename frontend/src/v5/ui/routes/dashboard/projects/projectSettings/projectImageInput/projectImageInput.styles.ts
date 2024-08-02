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

import { Typography } from '@controls/typography';
import styled from 'styled-components';
import { FlatButton } from '@controls/button/flatButton.component'; 
import { ErrorMessage as ErrorMessageBase } from '@controls/errorMessage/errorMessage.component';
import { AuthImg } from '@components/authenticatedResource/authImg.component';

export const GrayBodyText = styled(Typography).attrs({
	variant: 'body1',
})`
	color: ${({ theme }) => theme.palette.base.main};
`;

export const ErrorMessage = styled(ErrorMessageBase)`
	margin-top: 0;
`;

export const ImageContainer = styled.div`
	width: 229px;
	padding: 12px;
	border-radius: 9px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	display: flex;
	flex-direction: column;
	gap: 9px;
`;

export const Image = styled(AuthImg)`
	width: 100%;
	height: 132px;
	object-fit: cover;
	border-radius: 5px;
`;

export const ButtonsContainer = styled.div`
	width: 100%;
	display: flex;
	flex-direction: row;
	gap: 10px;

	& > * {
		flex: 1;
	}
`;

export const ImageButton = styled(FlatButton).attrs({
	as: 'span',
})`
	height: 28px;
	width: 100%;

	svg {
		height: 14px;
		width: 13px;
		margin-right: 2.5px;
	}
`;
