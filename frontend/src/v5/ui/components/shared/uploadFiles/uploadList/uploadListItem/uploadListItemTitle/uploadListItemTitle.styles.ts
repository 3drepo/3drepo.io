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

import { DashboardListItemTitle as ListItemTitle } from '@components/dashboard/dashboardList/dashboardListItem/components';
import styled from 'styled-components';

export const DashboardListItemTitle = styled(ListItemTitle)`
	min-width: 90px;
	padding-right: 5px;
	box-sizing: border-box;

	.MuiButton-root {
		cursor: default;
		text-decoration-line: none;
		text-overflow: ellipsis;
		overflow: hidden;
	}
`;
export const SubTitleError = styled.i`
	color: ${({ theme }) => theme.palette.error.main};
	padding: 0 2px 0 5px;
`;
