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

export const CardContainer = styled.div`
	display: flex;


	height: 100%;
	flex-direction: column;

	background: #FFFFFF;
	border-radius: 10px 10px 0px 0px;

	margin-bottom: 20px;

	box-shadow: ${({ theme }) => theme.palette.shadows.level_2};
`;

export const CardHeader = styled.div`
	${({ theme }) => theme.typography.h3}
	display: flex;
	align-items: center;
	height: 48px;
	padding: 0px 15px;
    border-bottom: 1px solid #E0E5F0;
`;

export const CardContent = styled.div`
	padding: 15px;
	
`;
