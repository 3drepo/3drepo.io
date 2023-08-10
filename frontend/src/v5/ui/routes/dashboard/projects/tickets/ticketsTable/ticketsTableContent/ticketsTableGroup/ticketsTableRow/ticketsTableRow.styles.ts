/**
 *  Copyright (C) 2023 3D Repo Ltd
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

export const Row = styled.div`
	display: grid;
	grid-template-columns: 80fr 493fr 96fr 62fr 90fr 90fr 100fr 137fr 134fr;
	gap: 1px;
	height: 37px;
	background: transparent;
	cursor: pointer;
`;

export const Cell = styled.div`
	background: ${({ theme }) => theme.palette.primary.contrast};
	color: ${({ theme }) => theme.palette.secondary.main};
	height: 100%;
	padding-left: 15px;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	font-weight: 500;
`;
