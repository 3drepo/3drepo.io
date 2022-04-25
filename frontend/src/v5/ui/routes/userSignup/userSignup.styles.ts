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

import styled, { css } from 'styled-components';
import { clientConfigService } from '@/v4/services/clientConfig';
import DefaultLogoBase from '@assets/icons/colored_logo.svg';
import { Display } from '@/v5/ui/themes/media';
import { Link } from 'react-router-dom';

export const Container = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: stretch;
	width: 100%;
	min-height: 100vh;
`;

export const Background = styled.div`
	height: 100vh;
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	${clientConfigService.getCustomBackgroundImagePath() && `
		background: url('${clientConfigService.getCustomBackgroundImagePath()}') 0% 0% / cover no-repeat;
	`};
`;

export const UserSignupMain = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: fit-content;
`;

const DefaultLogo = styled(DefaultLogoBase)`
	color: ${({ theme }) => theme.palette.primary.contrast};
	width: 100px;
`;

const CustomLogo = styled.img.attrs({
	src: clientConfigService.getCustomLogoPath(),
	alt: '3D Repo',
})`
	width: 100px;
`;

export const LoginLink = styled(Link).attrs({
	to: '/v5/login',
})`
	width: fit-content;
`;

export const Logo = clientConfigService.getCustomLogoPath() ? CustomLogo : DefaultLogo;

export const BlueLogo = styled(Logo)`
	color: ${({ theme }) => theme.palette.secondary.main};
`;

export const LogoHeightBalancer = styled(BlueLogo)`
	color: transparent;
`;

export const LogoContainer = styled(LoginLink)`
	margin-bottom: 100px;
	display: none;

	@media (max-width: ${Display.Tablet}px) {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
`;

export const Content = css`
	margin: 28px;
	width: 454px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border-radius: 6px;
	box-sizing: border-box;
	/* TODO - fix after new design will be released */
	box-shadow: ${clientConfigService.getCustomBackgroundImagePath() ? '0px 8px 15px -3px #878787' : '0 1px 1px rgb(0 0 0 / 14%)'};
`;
