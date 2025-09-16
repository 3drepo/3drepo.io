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
import { ControlsContainer as GroupCollapseHeader } from '@components/dashboard/dashboardList/dashboardListCollapse/dashboardListCollapse.styles';

export const Container = styled.div`
	overflow: auto;
	position: relative;
	width: 100vw;
	margin-left: -75px;
	padding: 0 64px 30px 75px;
	flex: 1;

	${GroupCollapseHeader} {
		position: sticky;
		left: 0;
		overflow: unset;
		width: calc(100vw - 161px);
		margin-right: 0;
	}
`;