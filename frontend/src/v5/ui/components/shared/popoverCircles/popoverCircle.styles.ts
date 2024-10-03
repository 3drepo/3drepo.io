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

import { AuthAvatarMui } from '@components/authenticatedResource/authAvatarMui.component';
import { contrastColor } from 'contrast-color';
import styled, { css } from 'styled-components';

const CIRCLE_SIZE = {
	small: '24px',
	medium: '32px',
};

const isLight = (color) => contrastColor({ bgColor: color, threshold: 170 }) === '#FFFFFF';

export const Popover = styled(AuthAvatarMui)<{ $backgroundColor }>`
	margin: 0;
	color: ${({ $backgroundColor, theme }) => (isLight($backgroundColor) ? theme.palette.primary.contrast : theme.palette.secondary.main)};
	background-color: ${({ $backgroundColor, theme }) => $backgroundColor || theme.palette.primary.contrast};
	pointer-events: auto;
	font-size: 9px;
	${({ size = 'medium' }) => css`
		height: ${CIRCLE_SIZE[size]};
		width: ${CIRCLE_SIZE[size]};
	`}
	
	.MuiAvatar-root {
		box-sizing: content-box;
		height: 100%;
		width: 100%;
		font-size: 10px;
		background-color: ${({ theme }) => theme.palette.base.lightest};
		color: ${({ theme }) => theme.palette.secondary.main};
	}
`;
