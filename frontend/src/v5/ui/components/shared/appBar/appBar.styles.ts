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
import { AppBar } from '@material-ui/core';

export const Container = styled(AppBar)`
	&& {
		background-color: ${({ theme }) => theme.palette.secondary.main};
		box-shadow: none;
		padding-left: 20px;
		padding-right: 20px;
		min-height: 64px;
		display: flex;
		flex-direction: row;
		align-items: center;
		position: relative;
	}
`;

export const Items = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 50%;

	&:last-child {
		justify-content: flex-end;
	}

	& > *:last-child {
		margin-right: 0;
	}
`;
