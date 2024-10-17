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
import { Divider as DividerComponent } from '@mui/material';
import { Typography } from '@controls/typography';
import { DashedContainer } from '@controls/dashedContainer/dashedContainer.component';

export const ListContainer = styled.ul`
	display: flex;
	flex-direction: column;
	width: 100%;
	margin: 0;
	padding: 0;
	border-radius: 10px;
	overflow: hidden;
`;

export const DashboardListEmptyContainer = styled(DashedContainer)`
	display: flex;
	align-items: center;
	height: 83px;
	background-color: transparent;
	padding-left: 30px;
`;

export const DashboardListEmptyText = styled(Typography).attrs({
	variant: 'body1',
})`
	color: ${({ theme }) => theme.palette.base.main};
	margin-right: 17px;
`;

export const Divider = styled(DividerComponent)`
	margin-top: 16px;
	width: 100%;
`;
