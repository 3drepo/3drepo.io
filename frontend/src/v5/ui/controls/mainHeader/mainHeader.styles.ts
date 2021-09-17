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

export const Container = styled.div`
	height: 75px;
`;

export const Bar = styled.div`
	position: fixed;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	height: 75px;
	padding: 0 20px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	border-left-style: none;
	border-right-style: none;
	z-index: ${({ theme }) => theme.zIndex.appBar};
`;
