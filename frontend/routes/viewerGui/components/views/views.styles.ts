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

import { MenuItem, MenuList, TextField } from '@material-ui/core';
import styled from 'styled-components';

import { COLOR } from '../../../../styles';

import {
	VIEWER_PANELS,
	VIEWER_PANELS_ICONS,
	VIEWER_PANELS_MIN_HEIGHTS,
	VIEWER_PANELS_TITLES
} from '../../../../constants/viewerGui';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';

export const ViewsIcon = VIEWER_PANELS_ICONS[VIEWER_PANELS.VIEWS];

export const ViewsContainer = styled(ViewerPanel).attrs({
	title: VIEWER_PANELS_TITLES[VIEWER_PANELS.VIEWS]
})`
	min-height: ${VIEWER_PANELS_MIN_HEIGHTS[VIEWER_PANELS.VIEWS]}px;
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

export const ViewpointsList = styled(MenuList)`
	&& {
		padding: 0;
		height: auto;
		max-height: 70vh;
	}
`;

export const ViewpointItem = styled(MenuItem)`
	&& {
		height: 80px;
		padding: 8px;
		background-color: ${(props: any) => props.active ? `${COLOR.BLACK_6}` : 'initial'};
	}

	&&:not(:first-child) {
		border-top: 1px solid ${COLOR.BLACK_20};
	}
` as any;

export const NewItemWrapper = styled.div`
	display: flex;
	flex: 1;
`;

export const SearchField = styled(TextField)`
	&& {
		flex: none;
	}
`;

export const Link = styled.a`
	color: ${COLOR.PRIMARY_MAIN};
`;
