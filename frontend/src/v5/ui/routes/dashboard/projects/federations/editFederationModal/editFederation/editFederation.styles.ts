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
import { SuccessButton as SuccessButtonBase } from '@controls/button/successButton/successButton.styles';
import { ErrorButton as ErrorButtonBase } from '@controls/button/errorButton/errorButton.styles';

export const SuccessButton = styled(SuccessButtonBase)`
	min-width: 100px;
`;
export const ErrorButton = styled(ErrorButtonBase)`
	min-width: 100px;
`;

const iconContainerStyles = css<{ hidden?: boolean }>`
	display: grid;
	place-content: center;
	width: 20px;
	min-width: 20px;
	height: 20px;
	border-radius: 5px;
	padding: 0;

	&, &:hover, &:active, &:focus {
		border-width: 2px;
	}

	${({ hidden }) => hidden && css`
		visibility: hidden;
	`}
`;

export const SuccessIconContainer = styled(SuccessButton)`
	${iconContainerStyles}
`;

export const ErrorIconContainer = styled(ErrorButton)`
	${iconContainerStyles}
`;
