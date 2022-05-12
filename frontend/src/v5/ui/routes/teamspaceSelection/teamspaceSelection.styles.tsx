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

import { TeamspaceList } from '@components/teamspace/teamspaceList';
import { ScrollArea } from '@controls/scrollArea';
import { Typography } from '@controls/typography';
import styled from 'styled-components';

export const ScrollBar = styled(ScrollArea).attrs({
	variant: 'secondary',
})`
	background: ${({ theme }) => theme.palette.gradient.secondary};
	border-top: 1px solid rgb(255 255 255 / 10%);
`;

export const HomeContent = styled.div`
	padding: 60px;
	height: 100%;
	box-sizing: border-box;
	display: flex;
	flex-flow: column;
	align-items: center;
`;

export const WelcomeMessage = styled(Typography).attrs({
	variant: 'h1',
})`
	color: ${({ theme }) => theme.palette.primary.contrast};
	text-align: center;
	margin-bottom: 40px;
	margin-top: auto;
`;

export const TeamspaceCards = styled(TeamspaceList)`
	width: clamp(40px, 85vw, 798px);
	margin-bottom: auto;
`;
