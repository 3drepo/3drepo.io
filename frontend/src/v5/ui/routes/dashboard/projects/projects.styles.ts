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
import { Display } from '@/v5/ui/themes/media';
import { ScrollArea } from '@controls/scrollArea/scrollArea.styles';

export const DashboardScroll = styled(ScrollArea)`
	>div {
		display: flex;
		flex-direction: column;
	}
`;

export const Content = styled.div`
	max-width: 1289px;
	margin: 18px auto;
	height: auto;
	width: 90vw;

	@media (max-width: ${Display.Desktop}px) {
		margin-top: 30px;
	}
`;
