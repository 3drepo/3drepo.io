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

// TODO check if needed
export const Container = styled.div`
	height: 100%;
	display: flex;
	flex-direction: column;
`;

export const Content = styled.section`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	overflow-y: auto;
	flex-grow: 1;
	/* using inset box-shadow because ScrollArea gives an absolute position to the component */
	box-shadow: inset 0 6px 16px -16px;
`;

export const TopBar = styled.div`
	background: ${({ theme }) => theme.palette.gradient.secondary};
	padding: 30px 75px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	// TODO: fix after new palette is released
	border-top: 1px solid ${({ theme }) => theme.palette.secondary.mid};
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
