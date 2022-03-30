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
import { clientConfigService } from '@/v4/services/clientConfig';
import DefaultLogoBase from '@assets/icons/colored_logo.svg';

export const Container = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: stretch;
	width: 100%;
	min-height: 100vh;
`;

export const Background = styled.div`
	height: 100%;
	width: 100%;
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	${clientConfigService.getCustomBackgroundImagePath() && `
		background: url('${clientConfigService.getCustomBackgroundImagePath()}') 0% 0% / cover no-repeat;
	`};
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

export const Logo = clientConfigService.getCustomLogoPath() ? CustomLogo : DefaultLogo;
