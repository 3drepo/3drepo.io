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

import { COLOR } from '../../../../styles';

import {
	VIEWER_PANELS,
	VIEWER_PANELS_ICONS,
	VIEWER_PANELS_MIN_HEIGHTS,
	VIEWER_PANELS_TITLES
} from '../../../../constants/viewerGui';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { Container as ItemContainer } from './components/measureItem/measureItem.styles';

export const ViewsIcon = VIEWER_PANELS_ICONS[VIEWER_PANELS.MEASURE];

export const ViewsContainer = styled(ViewerPanel).attrs({
	title: VIEWER_PANELS_TITLES[VIEWER_PANELS.MEASURE]
})`
	min-height: ${VIEWER_PANELS_MIN_HEIGHTS[VIEWER_PANELS.MEASURE]}px;
`;

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	overflow: auto;
`;

export const ViewerBottomActions = styled.div`
	height: 100%;
	margin: 0;
	display: flex;
	align-items: center;
	width: 100%;
`;

export const EmptyStateInfo = styled.p`
	padding: 14px;
	font-size: 13px;
	color: ${COLOR.BLACK_60};
	background-color: ${COLOR.BLACK_6};
	margin: 25px;
	border-radius: 6px;
	text-align: center;
`;

export const Title = styled(ItemContainer)`
`;

export const TitleWrapper = styled.h3`
	align-self: center;
	font-size: 13px;
	margin-left: 12px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-weight: normal;
`;
