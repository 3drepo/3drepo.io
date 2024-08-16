/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { AuthAvatarMui } from '@components/authenticatedResource/authAvatarMui.component';
import { COLOR } from '../../../../../../../styles';

const jobBorderStyles = (color) => css`
	height: 30px;
	width: 30px;
	border-style: solid;
	border-color: ${color};
	border-width: 2px;
`;

const noneJobBorderStyles = css`
	height: 34px;
	width: 34px;
`;

export const Avatar = styled(AuthAvatarMui)<{ src?: string, color?: string}>`
	&& {
		background-color: ${({ src }) => !src ? COLOR.BLACK_20 : `transparent`};
		color: ${COLOR.WHITE};
		font-size: 14px;
		${({ color }) => color ? jobBorderStyles(color) : noneJobBorderStyles};
	}
`;
