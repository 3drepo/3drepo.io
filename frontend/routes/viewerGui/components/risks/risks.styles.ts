/**
 *  Copyright (C) 2020 3D Repo Ltd
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
	VIEWER_PANELS,
	VIEWER_PANELS_ICONS,
	VIEWER_PANELS_MIN_HEIGHTS,
	VIEWER_PANELS_TITLES
} from '../../../../constants/viewerGui';
import { COLOR } from '../../../../styles';
import { ReportedItems } from '../reportedItems';

export const RisksContainer = styled(ReportedItems).attrs({
	title: VIEWER_PANELS_TITLES[VIEWER_PANELS.RISKS],
	Icon: () => VIEWER_PANELS_ICONS[VIEWER_PANELS.RISKS] as any
})`
	min-height: ${VIEWER_PANELS_MIN_HEIGHTS[VIEWER_PANELS.RISKS]}px;
` as any;

export const ListContainer = styled.ul`
	height: auto;
	padding: 0;
	margin: 0;
	cursor: pointer;
`;

export const Summary = styled.div`
	color: ${COLOR.BLACK_40};
`;
