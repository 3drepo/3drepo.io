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

import CheckBase from '@assets/icons/check.svg';
import LatopIconBase from '@assets/icons/outlined/laptop-outlined.svg';
import { Button } from '@controls/button';
import { Display } from '@/v5/ui/themes/media';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const Container = styled.div`
	margin: auto;
	min-height: 100vh;
	width: 400px;
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
	margin: 36px 0 22px 0;
`;

export const BulletPoint = styled.div`
	display: flex;
	flex-direction: row;
	align-items: flex-start;
`;

export const BulletPointIcon = styled.div`
	display: flex;
    align-items: center;
    justify-content: center;
	border: solid 1px ${({ theme }) => theme.palette.primary.main};
	border-radius: 50%;
	min-width: 21px;
	min-height: 21px;
	margin-right: 10px;
`;

export const Check = styled(CheckBase)`
	width: 13px;
	height: 13px;
	color: ${({ theme }) => theme.palette.primary.main};
`;

export const BulletPointMessage = styled.div`
	display: flex;
	flex-direction: column;
	${({ theme }) => theme.typography.body1};
`;

export const BulletPointTitle = styled.div`
	${({ theme }) => theme.typography.h3};
	font-size: 1rem;
	font-weight: 600;
`;

export const BulletPointBody = styled.div`
	color: ${({ theme }) => theme.palette.base.main};
    margin-bottom: 10px;
    line-height: 1.4rem;
`;

export const BookADemoButton = styled(Button).attrs({
	component: Link,
	target: '_blank',
	variant: 'contained',
	color: 'primary',
})`
	width: fit-content;
	font-weight: 300;
	margin: 28px 0 0 0;
    padding: 10px 20px 10px 28px;
`;

export const LaptopIcon = styled(LatopIconBase)`
	width: 16px;
	height: 16px;
`;
