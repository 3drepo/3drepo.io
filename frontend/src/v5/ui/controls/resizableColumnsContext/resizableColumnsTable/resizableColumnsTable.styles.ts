/**
 *  Copyright (C) 2025 3D Repo Ltd
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

export const Resizer = styled.div<{ $offset }>`
	position: absolute;
	width: 0;
	height: 100vh;
	border: solid 1px ${({ theme }) => theme.palette.primary.main};
	left: ${({ $offset }) => $offset - 1}px;
`; 

export const Container = styled.div`
	overflow-x: scroll;
	overflow-y: hidden;
	z-index: 3;
	position: relative;
	height: 100%;
`;