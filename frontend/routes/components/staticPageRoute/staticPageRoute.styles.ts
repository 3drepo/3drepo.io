/**
 *  Copyright (C) 2017 3D Repo Ltd
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
import { COLOR, FONT_WEIGHT } from '../../../styles';

export const Container = styled.div``;

export const Header = styled.header`
	background-color: rgb(12,47,84);
	color: rgba(255,255,255,0.87);
	height: 64px;
	display: flex;
	align-items: center;
	position: relative;
	padding: 0 16px;
`;

export const Logo = styled.img`
	object-fit: contain;
	width: 150px;
	position: absolute;
	transform: translateX(-50%);
	left: 50%;
`;

export const Title = styled.h2`
	margin: 0;
	font-weight: ${FONT_WEIGHT.NORMAL};
	font-size: 20px;
`;

export const Content = styled.div`
	padding: 10px 50px;
	overflow: auto;
	@media screen {
		height: calc(100vh - 84px);
	}

	@media print {
		height: 100%;
	}

	color: ${COLOR.BLACK_80};
	background-color: rgb(250,250,250);
`;

export const MenuContainer = styled.div`
	position: absolute;
	right: 10px;
`;
