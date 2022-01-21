/**
 *  Copyright (C) 2021 3D Repo Ltd
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

export const Container = styled.li`
	height: 51px;
	width: 100%;
	border: 1px solid #D0D9EB;
	border-bottom-style: none;
	background: #fff;
	box-sizing: border-box;
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	&:first-child {
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;
	}
	&:last-child {
		border-bottom-left-radius: 5px;
		border-bottom-right-radius: 5px;
		border-bottom-style: solid;
	}
`;
