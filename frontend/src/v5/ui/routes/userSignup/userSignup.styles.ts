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

export const Container = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: stretch;
	max-width: 951px;
	border-radius: 20px;
	max-height: 717px;
	z-index: 2;
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	padding: 45px;

`;

export const UserSignupMain = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: fit-content;
	color: ${({ theme }) => theme.palette.base.main};
`;
