/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import styled, { css } from 'styled-components';
import { COLOR } from '../../../../styles';

import {
	VIEWER_PANELS,
	VIEWER_PANELS_ICONS,
	VIEWER_PANELS_MIN_HEIGHTS,
	VIEWER_PANELS_TITLES
} from '../../../../constants/viewerGui';
import { PreviewListItem } from '../previewListItem/previewListItem.component';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';

export const GroupIcon = VIEWER_PANELS_ICONS[VIEWER_PANELS.GROUPS];

export const GroupsContainer = styled(ViewerPanel).attrs({
	title: VIEWER_PANELS_TITLES[VIEWER_PANELS.GROUPS],
})`
	min-height: ${VIEWER_PANELS_MIN_HEIGHTS[VIEWER_PANELS.GROUPS]}px;
`;

export const Container = styled.div``;

export const StyledIcon = styled.span`
	color: ${(props) => props.color ? props.color : COLOR.BLACK_60 };
	font-size: 18px;
	display: flex;
`;

const highlightedGroupStyles = css`
	background-color: ${COLOR.BLACK_6};

	&:hover {
		background-color: ${COLOR.BLACK_20};
	}
`;

export const GroupListItem = styled(PreviewListItem).attrs({
	panelType: VIEWER_PANELS.GROUPS,
})`
	&& {
		cursor: inherit;
		height: 73px;
		${(props: any) => props.highlighted && highlightedGroupStyles}
	}
`;
