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
import { BlueLogo, customBackgroundPath, Background as BackgroundBase } from '@components/authTemplate/authTemplate.styles';
import { Display } from '@/v5/ui/themes/media';

export const Container = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: stretch;
	width: 100%;
	min-height: 100vh;
`;

export const UserSignupMain = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: fit-content;
`;

export const LogoHeightBalancer = styled(BlueLogo)`
	visibility: hidden;
	display: none;
	margin-bottom: 100px;

	@media (max-width: ${Display.Tablet}px) {
		display: flex;
	}
`;

export const Background = styled(BackgroundBase)`
	${({ theme }) => !customBackgroundPath && `background: ${theme.palette.tertiary.lightest};`}
`;
