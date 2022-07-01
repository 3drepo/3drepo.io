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
import { Typography } from '@mui/material';
import { Avatar } from '@controls/avatar';
import { hexToOpacity } from '@/v5/ui/themes/theme';

export const Container = styled.div`
	height: 100%;
	display: flex;
	flex-direction: column;
`;

export const Content = styled.section`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	overflow-y: auto;
	flex-grow: 1;
	box-shadow: inset 0 6px 16px -16px;
`;

export const TopBar = styled.div`
	background: ${({ theme }) => theme.palette.gradient.secondary};
	padding: 30px 75px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	border-top: 1px solid ${({ theme }) => hexToOpacity(theme.palette.primary.main, 10)};
`;

export const TeamspaceInfo = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: center;
	color: ${({ theme }) => theme.palette.primary.contrast};
	margin-left: 29px;
`;

export const TeamspaceName = styled(Typography).attrs({
	variant: 'h1',
})``;

export const TeamspaceAvatar = styled(Avatar)`
	.MuiAvatar-root {
		border-radius: 10px;
		height: 142px;
		width: 142px;
		margin: 0;
		font-size: 40px;
		color: ${({ theme }) => theme.palette.tertiary.dark};
		background-color: ${({ theme }) => theme.palette.primary.contrast};
	}
`;
