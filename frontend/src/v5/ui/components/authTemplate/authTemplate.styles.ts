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
import LoginBackground from '@assets/images/default_background.png';
import DefaultLogoBase from '@assets/icons/filled/logo_text-filled.svg';
import { Typography } from '@controls/typography';
import { clientConfigService } from '@/v4/services/clientConfig';
import { Link } from 'react-router-dom';
import { LOGIN_PATH } from '@/v5/ui/routes/routes.constants';
import { Divider as DividerBase } from '@mui/material';
import { AuthImg } from '@components/authenticatedResource/authImg.component';

const customLogoPath = clientConfigService.getCustomLogoPath();
export const customBackgroundPath = clientConfigService.getCustomBackgroundImagePath();

export const AuthForm = styled.form`
	min-width: 408px;
	border-radius: 20px;
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	padding: 56px 64px 38px;
	z-index: 1;

	${({ theme }) => theme.typography.body1};
`;

export const Footer = styled(Typography).attrs({
	variant: 'body1',
})`
	color: ${({ theme }) => theme.palette.base.light};
	height: 0;
	user-select: none;
	z-index: 1;
	
	a {
		text-decoration: none;
		color: inherit;
		position: relative;
		top: 30px;
	}
`;

export const Divider = styled(DividerBase)`
	color: ${({ theme }) => theme.palette.base.main};

	&::before, &::after {
		border-color: ${({ theme }) => theme.palette.base.lightest};
	}

	margin: 19px 0;
`;

export const BackgroundOverlay = styled.img.attrs({ src: LoginBackground })`
	width: 100%;
	height: 100%;
	margin: auto;
	max-width: 100vw;
	max-height: 100vh;
	align-items: center;
	position: absolute;
	z-index: 0;
	left: 0;
	right: 0;
	overflow: hidden;
	object-fit: cover;
	object-position: 0 0;
`;

export const Background = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
	background-image: ${({ theme }) => (customBackgroundPath ? `url('${customBackgroundPath}')` : theme.palette.gradient.secondary)};
`;

const DefaultLogo = styled(DefaultLogoBase)`
	color: ${({ theme }) => theme.palette.primary.contrast};
	width: 100px;
`;

const CustomLogo = styled(AuthImg).attrs({
	src: customLogoPath,
	alt: '3D Repo',
})`
	width: 100px;
`;

export const Logo = styled(customLogoPath ? CustomLogo : DefaultLogo)``;
export const BlueLogo = styled(Logo)`
	color: ${({ theme }) => theme.palette.secondary.main};
`;

export const LoginLink = styled(Link).attrs({
	to: LOGIN_PATH,
})`
`;

export const LogoContainer = styled(LoginLink)`
	width: fit-content;
	margin-bottom: 28px;
	position: absolute;
	top: 29px;
	left: 50px;
`;

export const AuthSubHeader = styled.div`
	${({ theme }) => theme.typography.h3};
	color: ${({ theme }) => theme.palette.secondary.main};
	user-select: none;
	margin: 19px 0;
`;
