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

import { Button } from '@controls/button';
import { Display } from '@/v5/ui/themes/media';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const Container = styled.div`
	margin: auto;
	min-width: 510px;
	max-width: 510px;
	box-sizing: border-box;
	padding: 0 70px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	background-color: ${({ theme }) => theme.palette.secondary.main};
	color: ${({ theme }) => theme.palette.primary.contrast};
	
	@media (max-width: ${Display.Tablet}px) {
		display: none;
	}
`;

export const MainTitle = styled.div`
	${({ theme }) => theme.typography.h2};
	font-weight: lighter;
	letter-spacing: 0.03rem;
	margin: 8px 0 22px;
`;

export const SSOButton = styled(Button).attrs({
	component: Link,
	variant: 'contained',
	color: 'primary',
})`
	width: fit-content;
	font-weight: 300;
	margin: 28px 0 0;
	padding: 10px 20px 10px 28px;
	border-radius: 0;
	background-color: #2F2F2F;

	&:hover {
		backgroundColor: #2F2F2F,
	},

	&:active{
		backgroundColor: #2F2F2F,
	}
`;
