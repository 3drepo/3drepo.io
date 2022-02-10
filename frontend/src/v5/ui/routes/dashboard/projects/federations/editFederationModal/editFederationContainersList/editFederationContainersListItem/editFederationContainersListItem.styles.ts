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
import {
	DashboardListItemRow as DashboardListItemRowBase,
	DashboardListItemIcon,
} from '@components/dashboard/dashboardList/dashboardListItem/components';

export const DashboardListItemRow = styled(DashboardListItemRowBase)`
    padding-left: 20px;

    ${DashboardListItemIcon} {
        min-width: 32px;
        margin-right: 20px;
    }


	// TODO Remove
	& > div:nth-child(even) {
		height: 100%;
		background: darkred;
	}

	& > div:nth-child(4) {
		height: 100%;
		background: darkgreen;
	}
`;
