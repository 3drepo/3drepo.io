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
import { IconButton } from '@material-ui/core';

import { Typography } from '@controls/typography';

export const Form = styled.form`
	display: flex;
	flex-direction: column;
	min-width: 520px;
`;

export const Header = styled.header`
	background: ${({ theme }) => `linear-gradient(89.98deg, ${theme.palette.secondary.main} 0.01%, ${theme.palette.secondary.mid} 99.99%)`};
	height: 74px;
	width: 100%;
	padding: 15px 30px;
	box-sizing: border-box;
`;

export const Title = styled(Typography).attrs({
	variant: 'h2',
})`
	text-align: left;
	color: ${({ theme }) => theme.palette.primary.contrast};
`;

export const Subtitle = styled(Typography).attrs({
	variant: 'h5',
	component: 'span',
})`
	text-align: left;
	color: ${({ theme }) => theme.palette.secondary.lightest};
`;

export const CloseButton = styled(IconButton)`
	&& {
		position: absolute;
		top: 19px;
		right: 11px;
		
		path {
			stroke: ${({ theme }) => theme.palette.primary.contrast};
		}
	}
`;
