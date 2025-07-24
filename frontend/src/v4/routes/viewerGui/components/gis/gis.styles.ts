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

import styled from 'styled-components';

import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MapIcon from '@mui/icons-material/Map';

import { COLOR } from '../../../../styles';

import {
	VIEWER_PANELS,
	VIEWER_PANELS_ICONS,
	VIEWER_PANELS_MIN_HEIGHTS,
	VIEWER_PANELS_TITLES
} from '../../../../constants/viewerGui';

import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ViewerPanelContent } from '../viewerPanel/viewerPanel.styles';

export const GisIcon = VIEWER_PANELS_ICONS[VIEWER_PANELS.GIS];

export const GisContainer = styled(ViewerPanel).attrs({
	title: VIEWER_PANELS_TITLES[VIEWER_PANELS.GIS]
})`
	min-height: ${VIEWER_PANELS_MIN_HEIGHTS[VIEWER_PANELS.GIS]}px;
`;

export const StyledSelect = styled(Select)`
	margin-bottom: 12px;

	&& {
		width: 100%;

		[role="button"] {
			padding: 16px 0;
			color: ${COLOR.BLACK};
		}
	}
`;

export const StyledMapIcon = styled(MapIcon)`
	&& {
		color: ${COLOR.BLACK_60};
	}
`;

export const VisibilityButton = styled(IconButton)`
	&& {
		color: '${COLOR.BLACK_60}';
		position: absolute;
		right: -12px;
		z-index: 1;
	}
`;

export const MapLayer = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	padding: 12px 0;
	justify-content: space-between;
	position: relative;

	&:last-child {
		padding-bottom: 0;
	}
`;

export const MapNameWrapper = styled.div`
	display: flex;
	align-items: center;
	font-size: 14px;
	color: ${COLOR.BLACK_60};
`;

export const MapName = styled.div`
	margin-left: 24px;
`;

export const MapLayers = styled(ViewerPanelContent)`
	padding: 24px;
`;
