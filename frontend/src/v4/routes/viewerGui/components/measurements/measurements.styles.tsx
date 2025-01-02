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
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { IconWrapper as IconWrapperBase } from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';

export const MeasureIcon = VIEWER_PANELS_ICONS[VIEWER_PANELS.MEASUREMENTS];

export const ViewsContainer = styled(ViewerPanel).attrs({
	title: VIEWER_PANELS_TITLES[VIEWER_PANELS.MEASUREMENTS]
})`
	min-height: ${VIEWER_PANELS_MIN_HEIGHTS[VIEWER_PANELS.MEASUREMENTS]}px;
`;

export const IconWrapper = styled(IconWrapperBase)`
	min-width: 24px;
`;

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	overflow: auto;
	flex: auto;
`;

export const ViewerBottomActions = styled.div`
	height: 100%;
	margin: 0;
	display: flex;
	align-items: center;
	width: 100%;
`;

export const MeasureUnit = styled.strong`
	margin-left: 2px;
	width: 22px;
`;
