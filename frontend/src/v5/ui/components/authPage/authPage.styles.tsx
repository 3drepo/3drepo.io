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
import styled from 'styled-components';

export const Background = styled.div`
	display: flex;
	height: 100%;
	background: ${({ theme }) => theme.palette.gradient.secondary};
	align-items: center;
	justify-content: center;
	flex-direction: column;
`;

export const Logo = styled.img`
	max-height: 100px;
	max-width: 100px;
	padding: 28px;
	user-drag: none;
`;

export const Container = styled.div`
	width: 408px;
	border-radius: 20px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	padding: 58px 64px 38px;
`;

export const Footer = styled(Typography).attrs({
	variant: 'body1',
})`
	color: ${({ theme }) => theme.palette.base.light};
	padding: 30px;
	user-select: none;
	
	a {
		text-decoration: none;
		color: inherit;
	}
`;
