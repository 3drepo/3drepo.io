/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { DragAndDrop } from '@controls/dragAndDrop';
import { DashboardListHeader } from '@components/dashboard/dashboardList/dashboardListHeader';

export const Container = styled.div`
	display: flex;
	flex-direction: row;
	height: 550px;
	width:100%;
	overflow-x: hidden;
`;

export const DropZone = styled(DragAndDrop)`
	max-height: 190px;
`;

export const Content = styled.span`
	width: 100%;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 30px;
`;

export const UploadsListHeader = styled(DashboardListHeader)`
	padding-left: 54px;
	padding: 0 20px 13px 54px;
	margin-top: 0;
`;
