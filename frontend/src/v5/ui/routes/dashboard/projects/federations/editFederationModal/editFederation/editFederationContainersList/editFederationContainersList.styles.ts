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

import { DashboardListEmptyContainer } from '@components/dashboard/dashboardList';
import { DashboardListHeaderContainer } from '@components/dashboard/dashboardList/dashboardListHeader/dashboardListHeader.styles';
import styled from 'styled-components';

export const Container = styled.div`
	margin: 16px 0;
	width: 100%;

	${DashboardListEmptyContainer} {
		background-color: transparent;
	}

	${DashboardListHeaderContainer} {
		margin-left: 46px;
		padding-right: 10px;
	}
`;

export const IconButtonContainer = styled.div`
	padding: 0 8px;
	cursor: pointer;
`;
