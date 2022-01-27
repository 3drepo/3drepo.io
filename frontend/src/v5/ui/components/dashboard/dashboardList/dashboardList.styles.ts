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
import { Divider as DividerComponent } from '@material-ui/core';
import { Button } from '@controls/button';
import { Typography } from '@controls/typography';

export const ListContainer = styled.ul`
	display: flex;
	flex-direction: column;
	width: 100%;
	margin: 0;
	padding: 0;
`;

export const DashboardListEmptyContainer = styled.div`
	display: flex;
	align-items: center;
	height: 80px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border: 1px dashed ${({ theme }) => theme.palette.base.light};
	border-radius: 5px;
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
`;

export const DashboardListButton = styled(Button).attrs({
	variant: 'outlined',
	color: 'primary',
})`
	${({ theme }) => theme.typography.h3}
	width: 100%;
	margin: 18px 0 0;
	height: 80px;
	border: 1px dashed ${({ theme }) => theme.palette.primary.main};

	svg {
		width: 34px;
		height: 34px;
	}
`;
