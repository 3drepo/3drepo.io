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
import { Card as CardBase, CardContent } from '@mui/material';
import styled, { css } from 'styled-components';
import { CoverImage } from '@controls/coverImage/coverImage.component';

export const CardListItem = styled.li`
	list-style-type: none;
	float: left;
	margin: 10px;
	.MuiCard-root {
		transition: margin 0.1s;
	}
	&:hover .MuiCard-root {
		margin-top: -5px;
		margin-bottom: 5px;
		box-shadow: ${({ theme }) => theme.palette.shadows.level_5};
	}
`;

export const Link = styled(DecoratedLink)`
	display: block;
	text-decoration: none;
`;

export const Details = styled(CardContent)`
	&, &:last-child {
		padding: 15px 0 0;
	}
`;

export const Heading = styled(Typography).attrs({
	variant: 'h5',
})`
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
`;

export const Subheading = styled(Typography).attrs({
	variant: 'body1',
})`
	color: ${({ theme }) => theme.palette.base.main};
`;

export const Card = styled(CardBase)<{ $variant: string; }>`
	${({ $variant, theme }) => {
		if ($variant === 'primary') {
			return css`
				background-color: ${theme.palette.primary.contrast};
				${Heading} {
					color: ${theme.palette.secondary.main};
				}
			`;
		}
		if ($variant === 'secondary') {
			return css`
				background-color: ${theme.palette.tertiary.lighter};
			`;
		}
		return '';
	}};
	width: 246px;
`;

export const CardImage = styled(CoverImage)`
	width: 100%;
	height: 132px;
	object-fit: cover;
	margin-bottom: -5px;
	border-radius: 5px;
	user-select: none;
`;
