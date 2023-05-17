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

export const PostSubmitSuccessfulMessage = styled.div`
	color: ${({ theme }) => theme.palette.primary.main};
	background-color: ${({ theme }) => theme.palette.primary.lightest};
	min-height: 45px;
	box-sizing: border-box;
	border: solid 1px currentColor;
	padding: 10px 15px;
	margin-top: 19px;
	border-radius: 8px;
	display: grid;
	align-items: center;
	grid-template-columns: 33px 1fr;
	grid-template-rows: minmax(25px, 1fr) auto;

	h5 {
		font-size: 16px;
	}
`;

export const IconContainer = styled.div`
	display: flex;
	align-self: start;

	svg {
		border: solid 1px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		padding: 4px;
		margin-top: 1px;
	}
`;
