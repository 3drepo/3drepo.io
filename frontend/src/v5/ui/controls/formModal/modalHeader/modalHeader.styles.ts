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

import styled from 'styled-components';
import { Typography } from '@controls/typography';
import { IconButton } from '@mui/material';
import { hexToOpacity } from '@/v5/helpers/colors.helper';

export const CloseButton = styled(IconButton)`
	&& {
		display: grid;
		place-content: center;

		position: absolute;
		top: 16px;
		right: 14px;
		padding: 0;
		margin: 0;
		height: 32px;
		width: 32px;
		border: none;
		border-radius: 8px;
		background: ${({ theme }) => theme.palette.primary.contrast};
		box-sizing: border-box;

		svg {
			width: 12px;
			height: 12px;

			path {
				stroke: ${({ theme }) => theme.palette.secondary.main};
			}
		}
	}
`;

export const Header = styled.div<{ $contrastColor?: boolean }>`
	color: ${({ theme }) => theme.palette.secondary.main};
	background-color: ${({ $contrastColor, theme }) => ($contrastColor ? theme.palette.primary.contrast : 'transparent')};
	height: fit-content;
	width: 100%;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	padding: 26px 30px 11px;
`;

export const Title = styled(Typography).attrs({
	variant: 'h2',
	component: 'div',
})`
	text-align: left;
	font-weight: 600;
`;

export const Subtitle = styled(Typography).attrs({
	variant: 'h5',
	component: 'div',
})`
	text-align: left;
	color: ${({ theme }) => hexToOpacity(theme.palette.secondary.main, 60)};
`;
