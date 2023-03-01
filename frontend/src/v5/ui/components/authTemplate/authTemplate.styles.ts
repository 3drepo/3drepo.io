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
import LoginBackground from '@assets/images/login_background.svg';
import DefaultLogoBase from '@assets/icons/filled/logo_text-filled.svg';
import { Typography } from '@controls/typography';
import { clientConfigService } from '@/v4/services/clientConfig';
import { Link } from 'react-router-dom';
import { LOGIN_PATH } from '@/v5/ui/routes/routes.constants';
import { Display } from '@/v5/ui/themes/media';
import { Divider as DividerBase } from '@mui/material';
import { Button } from '@controls/button';
import MicrosoftIcon from '@assets/icons/thirdParty/microsoft.svg';
import { createElement } from 'react';

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
	padding: 30px;
	user-select: none;
	z-index: 1;
	
	a {
		text-decoration: none;
		color: inherit;
	}
`;

export const Divider = styled(DividerBase)`
	color: ${({ theme }) => theme.palette.base.main};

	&::before, &::after {
		border-color: ${({ theme }) => theme.palette.base.lightest};
	}

	margin: 19px 0;
`;

export const BackgroundOverlay = styled(LoginBackground)`
	width: 1585px;
	height: 1040px;
	margin: auto;
	max-width: 100vw;
	max-height: 100vh;
	align-items: center;
	position: absolute;
	z-index: 0;
	left: 0;
	right: 0;
	overflow: hidden;
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

const CustomLogo = styled.img.attrs({
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
	width: fit-content;
	margin-bottom: 28px;
	position: absolute;
	top: 40px;
	left: 50px;
`;

export const LogoContainer = styled(LoginLink)`
	margin-bottom: 72px;
	display: none;

	@media (max-width: ${Display.Tablet}px) {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
`;

export const AuthSubHeader = styled.div`
	${({ theme }) => theme.typography.h3};
	color: ${({ theme }) => theme.palette.secondary.main};
	user-select: none;
	margin: 19px 0;
`;

export const MicrosoftButton = styled(Button).attrs({
	component: Link,
	variant: 'contained',
	color: 'primary',
	startIcon: createElement(MicrosoftIcon),
})`
	display: flex;
	width: fit-content;
	font-weight: 500;
	font-size: 12px;
	border-radius: 0;
	background-color: #2F2F2F; // The colour is hardcoded as this are microsoft specs and not part of the theme

	&:hover, &:active {
		background-color: #2F2F2FF0; 

	}

	margin: 0;
	padding:20px;
`;

export const NewSticker = styled.div`
	color: ${({ theme }) => theme.palette.primary.main};
	border: solid 1.5px ${({ theme }) => theme.palette.primary.main}; 
	border-radius: 5px;
	padding: 4px 6px;
	display: inline;
	font-size: 10px;
	font-weight: 700;
	top: -4px;
	position: relative;
	left: 8px;
`;
