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

import LoginBackground from '@assets/images/login_background.svg';
import { Typography } from '@controls/typography';
import styled, { css } from 'styled-components';

export const BackgroundOverlay = styled(LoginBackground)`
	width: 1585px;
	height: 1040px;
	max-width: 100vw;
	position: absolute;
	z-index: 0;
	margin: auto;
	left: 0;
	right: 0;
	overflow: hidden;
`;

export const Background = styled.div`
	display: flex;
	height: 100%;
	background: ${({ theme }) => theme.palette.gradient.secondary};
	align-items: center;
	justify-content: center;
	flex-direction: column;
	${({ backgroundSrc }) => backgroundSrc && css`background-image: url("${backgroundSrc}");`}
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
`;

export const Logo = styled.img`
	max-height: 100px;
	max-width: 100px;
	padding: 28px;
	z-index: 1;
`;

export const Container = styled.div`
	width: 408px;
	border-radius: 20px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	padding: 58px 64px 38px;
	z-index: 1;

	${({ theme }) => theme.typography.body1};
`;

export const Footer = styled(Typography).attrs({
	variant: 'body1',
})`
	color: ${({ theme }) => theme.palette.base.light};
	padding: 30px;
	user-select: none;
	z-index: 1;
	
	a {
		text-decoration: none;
		color: inherit;
	}
`;
