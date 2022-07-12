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
import { isV5 } from '@/v4/helpers/isV5';
import { Actions } from '@/v4/routes/viewerGui/components/previewListItem/previewListItem.styles';
import { COLOR } from '../../../../styles';

import {
	VIEWER_PANELS,
	VIEWER_PANELS_ICONS,
	VIEWER_PANELS_MIN_HEIGHTS,
	VIEWER_PANELS_TITLES
} from '../../../../constants/viewerGui';
import { PreviewListItem } from '../previewListItem/previewListItem.component';
import { Description } from '../previewListItem/previewListItem.styles';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';

export const GroupIcon = VIEWER_PANELS_ICONS[VIEWER_PANELS.GROUPS];

export const GroupsContainer = styled(ViewerPanel).attrs({
	title: VIEWER_PANELS_TITLES[VIEWER_PANELS.GROUPS],
})`
	min-height: ${VIEWER_PANELS_MIN_HEIGHTS[VIEWER_PANELS.GROUPS]}px;
`;

export const Container = styled.div``;

export const GroupsListContainer = styled.div`
	height: 100%;
`;