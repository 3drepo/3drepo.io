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

export const Wrapper = styled.div`
	width: 100%;
	height: 114px;
	padding: 0 30px;
	box-sizing: border-box;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	border-left-style: none;
	border-right-style: none;
`;

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	width: 100%;
	max-width: 1289px;
	margin: 28px auto 0;
`;
