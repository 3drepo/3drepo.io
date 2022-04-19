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
import TickIconBase from '@assets/icons/fat_tick.svg';

export const PostSubmitSuccessfulMessage = styled.div`
	${({ theme }) => theme.typography.body1};
	color: ${({ theme }) => theme.palette.primary.main};
	background-color: ${({ theme }) => theme.palette.primary.lightest}; // TODO - fix after new palette is created
	height: 45px;
	box-sizing: border-box;
	border: solid 1px currentColor;
	padding: 15px;
	margin-top: 19px;
	border-radius: 5px;
	display: flex;
	flex-direction: row;
	align-items: center;
`;

export const TickIcon = styled(TickIconBase)`
	margin-right: 10px;
`;
