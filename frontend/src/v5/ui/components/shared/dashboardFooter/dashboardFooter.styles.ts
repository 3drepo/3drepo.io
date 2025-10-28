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
import { BottomNavigation } from '@mui/material';
import Logo from '@assets/icons/filled/logo_text-filled.svg';
import { COLOR } from '@/v5/ui/themes/theme';

export const FOOTER_HEIGHT = 42;
const COLOR_MAP = {
	light: COLOR.BASE_LIGHT,
	dark: COLOR.BASE_MAIN,
};

export const FooterContainer = styled(BottomNavigation)<{ variant: string }>`
	justify-content: left;
	height: ${FOOTER_HEIGHT}px;
	background-color: transparent;
	color: ${({ variant }) => COLOR_MAP[variant]};
	align-items: center;
	padding: 0 20px;
	margin: auto auto 0 0;
`;

export const FooterLogo = styled(Logo)`
	height: 28px;
	width: auto;
	padding: 0 12px;
`;

export const FooterItems = styled.span`
	margin: 0 20px;
`;

export const FooterItem = styled.span`
	line-height: ${FOOTER_HEIGHT}px;
	* {
		${({ theme }) => theme.typography.body1}
	}

	&:not(:last-child)&:after {
		content: '\\2022';
		padding: 0 10px;
	}
`;
