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

import { Typography } from '@controls/typography';
import { Link as DecoratedLink } from 'react-router-dom';
import { Card, CardContent } from '@mui/material';
import styled, { css } from 'styled-components';

export const ListItem = styled.li`
	list-style-type: none;
	float: left;
	margin: 10px;
	.MuiCard-root { transition: margin 0.1s; }
	:hover {
		.MuiCard-root {
			margin-top: -5px;
			transition: margin 0.1s;
			box-shadow: ${({ theme }) => theme.palette.shadows.level_5};
		}
	}
`;

export const Link = styled(DecoratedLink)`
	display: block;
	text-decoration: none;
`;

export const Container = styled(Card)<{ $variant: string; }>`
	${({ $variant, theme }) => {
		if ($variant === 'primary') {
			return css`
				background-color: ${theme.palette.tertiary.lightest};
				h5 { color: ${theme.palette.secondary.main};}
			`;
		}
		if ($variant === 'secondary') {
			return css`
				background-color: rgb(255 255 255 / 5%);
				h5 { color: ${theme.palette.primary.contrast};}
			`;
		}
		return '';
	}};
	width: 246px;
	height: 253px;
`;

export const TeamspaceImage = styled.div<{ imageURL?: string;}>`
	position: relative;
	height: 175px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	background-image: ${({ imageURL }) => (imageURL ? `url(${imageURL})` : 'none')};
	background-repeat: no-repeat;
	background-position: center;
	background-size: cover;
`;

export const TeamspaceLogo = styled.img`
	max-height: 100px;
	max-width: 100px;

	margin: auto;
	display: block;
	display: ;
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
`;

export const Content = styled(CardContent)`
	padding: 15px 0;
`;

export const CardHeading = styled(Typography).attrs({
	variant: 'h5',
})`
`;

export const CardSubheading = styled(Typography).attrs({
	variant: 'body1',
})`
	color: ${({ theme }) => theme.palette.base.main};
`;
