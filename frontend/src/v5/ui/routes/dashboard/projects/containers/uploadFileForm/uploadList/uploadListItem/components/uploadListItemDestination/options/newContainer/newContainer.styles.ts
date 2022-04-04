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
	height: 55px;
	color: ${({ theme }) => theme.palette.primary.dark};
	display: inline-flex;
	width: 100%;
	${({ theme }) => theme.typography.h5};
	flex-flow: row;
	
	svg {
		height: 18px;
		width: 18px;
		box-sizing: border-box;
		margin: 6px;
		flex-shrink: 0;
	}

	&:hover,&:focus {
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	}
`;

export const Message = styled.div`
	width: calc(100% - 30px);
`;
