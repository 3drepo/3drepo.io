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

import styled from 'styled-components';
import { Typography } from '@controls/typography';
import { FONT_WEIGHT } from '@/v5/ui/themes/theme';
import { Link as LinkBase } from '@components/shared/sso/microsoftText.styles';
import { Button as ButtonBase } from '@controls/button';

export const Container = styled.div`
	border-radius: 20px;
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	padding: 60px;
	z-index: 1;
	width: 490px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 41px;
`;

export const Heading = styled(Typography).attrs({
	variant: 'h1',
})`
	color: ${({ theme }) => theme.palette.secondary.main};
	user-select: none;
	font-weight: ${FONT_WEIGHT.BOLDER};
`;

export const Button = styled(ButtonBase).attrs({
	color: 'primary',
	variant: 'contained',
})`
	width: 300px;
`;

export const Footer = styled(Typography).attrs({
	variant: 'caption',
})`
	color: ${({ theme }) => theme.palette.base.main};
	text-align: center;
`;

export const Link = styled(LinkBase)`
	&& {
		text-decoration: underline;
		color: currentColor;
	}
`;
