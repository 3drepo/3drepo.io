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
import { hexToOpacity } from '@/v5/ui/themes/theme';

export const CloseButton = styled(IconButton)`
	position: absolute;
	top: 10.5px;
	right: 11px;

	svg path {
		stroke: ${({ theme }) => theme.palette.primary.contrast}
	}
`;

export const Header = styled.div`
	background: ${({ theme }) => theme.palette.gradient.secondary};
	color: ${({ theme }) => theme.palette.primary.contrast};
	height: 74px;
	width: 100%;
	box-sizing: border-box;
	align-items: center;
	display: flex;
	flex-shrink: 0;
	padding: 0 35px;
`;

export const Title = styled(Typography).attrs({
	variant: 'h2',
	component: 'div',
})``;

export const Subtitle = styled(Typography).attrs({
	variant: 'h5',
	component: 'div',
})`
	color: ${({ theme }) => hexToOpacity(theme.palette.secondary.lightest, 60)};
`;
