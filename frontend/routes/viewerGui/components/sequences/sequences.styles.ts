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

import styled, { css } from 'styled-components';

import { Grid, IconButton, Input, ListItem } from '@material-ui/core';
import Slider from '@material-ui/core/Slider';
import DotIcon from '@material-ui/icons/FiberManualRecord';

import {
	VIEWER_PANELS,
	VIEWER_PANELS_ICONS,
	VIEWER_PANELS_MIN_HEIGHTS,
	VIEWER_PANELS_TITLES
} from '../../../../constants/viewerGui';
import { COLOR, FONT_WEIGHT } from '../../../../styles';
import { DateField } from '../../../components/dateField/dateField.component';
import { Loader } from '../../../components/loader/loader.component';
import { Content as ContentComponent } from '../../../components/loader/loader.styles';
import { MenuItemContainer } from '../previewListItem/previewListItem.styles';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ViewerPanelContent } from '../viewerPanel/viewerPanel.styles';

export const SequencesIcon = VIEWER_PANELS_ICONS[VIEWER_PANELS.SEQUENCES];

export const SequencesContainer = styled(ViewerPanel).attrs({
	title: VIEWER_PANELS_TITLES[VIEWER_PANELS.SEQUENCES]
})`
	min-height: ${VIEWER_PANELS_MIN_HEIGHTS[VIEWER_PANELS.SEQUENCES]}px;
`;

export const SequenceItemIcon =  styled(SequencesIcon)`
	&& {
		font-size: 67px;
		margin-right: 13px;
	}
`;

export const SequenceSlider = styled(Slider)`
	&& {
		width: 305px;
	}
`;

export const SequencePlayerContainer = styled.div`
	display: block;
	height: 165px
`;

export const SequenceTasksListContainer = styled(ViewerPanelContent)`
	background-color: ${COLOR.BLACK_6};
	font-size: 13px;
	color: ${COLOR.BLACK_60};
	padding: 15px;

	& > * {
		margin-bottom: 15px;
	}
`;

export const TaskListLabel = styled.div`
	font-weight: 500;
`;

export const SequenceTasksListItem = styled.div`
	&& {
		background-color:  ${COLOR.WHITE};
		padding: 5px;
	}
`;

export const SubTasksItemContainer = styled.div`
	display: block;
	padding-left: 24px;
`;

export const TaskButton = styled(IconButton)`
	&& {
		padding: 0;
		margin-right: 5px;
	}
`;

export const SequencePlayerColumn = styled(Grid).attrs({
	container: true,
	direction: 'column',
	justify: 'flex-start',
	alignItems: 'center'
})`
	&& {
		overflow: hidden;
		position: relative;
	}
`;

export const TaskSmallDot = styled(DotIcon)`
	&& {
		font-size: 10px;
		margin-right: 14px;
		height: 24px;
		margin-left: 6px;
	}
`;

export const Task = styled.div`
	align-items: flex-start;
	display: flex;
` as any;

export const TaskItemLabel = styled.div`
	margin-top: 3px;
	line-height: 1.3;
	margin-bottom: 2px;
	${(props: any) => props.clickable && css`
		&:hover {
			cursor: pointer;
		}
	`}
`;

export const SequenceRow = styled(Grid).attrs({
	container: true,
	direction: 'row',
	justify: 'flex-start',
	alignItems: 'center',
	item: true
})`
	&& {
		width: auto;
	}
`;

export const SliderRow = styled(SequenceRow)`
	&& {
		margin-left: -24px;
	}
`;

export const IntervalRow = styled(SequenceRow)`
	&& {
		font-size: 14px;
		margin-top: -10px;
		margin-right: -15px;
	}
`;

export const DatePicker = styled(DateField)`
	&& {
		width: 160px;
		margin: 0 9px 12px;
	}

	input {
		font-size: 20px;
	}
`;

export const StepInput = styled(Input).attrs({
	inputProps: {
		type: 'number',
		min: 1,
		max: 100
	}
})`
	&& {
		font-weight: ${FONT_WEIGHT.NORMAL};
		width: 40px;
	}

	input {
		width: 40px;
		height: 20px;
		font-size: 14px;
		margin-left: 2px;
		outline: none;
		color: ${COLOR.BLACK_60};
		padding-bottom: 4px;
		text-align: right;
	}
`;

export const SequenceItemContainer = styled(MenuItemContainer)`
	&& {
		padding-left: 15px;
	}
`;

export const SequenceName = styled(Grid).attrs({
	item: true,
})`
	&& {
		font-size: 18px;
		font-weight: 500;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		max-width: 250px;
	}
`;

export const SequenceDatesContainer = styled(Grid).attrs({
	item: true,
	container: true,
	direction: 'row'
})`
	&& > * {
		margin-right: 15px;
	}
`;

export const LoaderContainer = styled.div`
	padding-top: 30px;
`;

export const StyledLoader = styled(Loader)`
	flex-direction: row;
	position: absolute;
	bottom: 36px;
	pointer-events: none;

	${ContentComponent} {
		margin-left: 10px;
		margin-right: 0;
		font-size: 13px;
	}
`;
