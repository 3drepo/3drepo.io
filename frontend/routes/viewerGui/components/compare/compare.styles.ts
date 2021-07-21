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

import { List, Tabs as TabsComponent } from '@material-ui/core';
import SliderComponent from '@material-ui/core/Slider';
import styled from 'styled-components';

import { COLOR } from '../../../../styles';

import {
	VIEWER_PANELS,
	VIEWER_PANELS_ICONS,
	VIEWER_PANELS_MIN_HEIGHTS,
	VIEWER_PANELS_TITLES
} from '../../../../constants/viewerGui';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ViewerPanelFooter as ViewerPanelFooterComponent } from '../viewerPanel/viewerPanel.styles';

export const CompareIcon = VIEWER_PANELS_ICONS[VIEWER_PANELS.COMPARE];

export const CompareContainer = styled(ViewerPanel).attrs({
	title: VIEWER_PANELS_TITLES[VIEWER_PANELS.COMPARE]
})`
	min-height: ${((props) => props.empty ? 0 : VIEWER_PANELS_MIN_HEIGHTS[VIEWER_PANELS.COMPARE])}px;
`;

interface ISliderLabel {
	disabled?: boolean;
}

export const MenuList = styled(List)`
	background-color: ${COLOR.WHITE};
	width: 100%;
	min-width: 140px;
	max-width: 300px;
	box-shadow: 0 1px 3px 0 ${COLOR.BLACK_20};
	border-radius: 2px;
`;

export const Tabs = styled(TabsComponent)`
	border-bottom: 1px solid ${COLOR.BLACK_20};
	flex-shrink: 0;
`;

export const TabContent = styled.div`
	background-color: ${COLOR.WHITE};
	flex: 1;
	position: relative;
	overflow: hidden;
	display: flex;
	height: inherit;
`;

export const ViewerPanelFooter = styled(ViewerPanelFooterComponent)`
	overflow: hidden;
`;

export const SliderContainer = styled.div`
	display: flex;
	padding: 10px 40px 0 0;
	height: 64px;
	flex: 1;
	flex-direction: column;
	justify-content: center;
	box-sizing: border-box;
`;

export const SliderWrapper = styled.div`
	padding-left: 15px;
	position: absolute;
	bottom: 21px;
	width: 255px;
`;

export const Slider = styled(SliderComponent).attrs({
	classes: {
		track: 'slider__track'
	}
})`
	.slider__track {
		background: ${COLOR.BLACK_60};
		opacity: 1;

		&:after {
			content: '';
			position: absolute;
			left: 0;
			top: -3px;
			height: 3px;
			width: 100%;
		}
	}
`;

export const SliderLabels = styled.div`
	display: flex;
	justify-content: space-between;
	padding-left: 13px;
`;

export const SliderLabel = styled.div<ISliderLabel>`
	color: ${((props) => props.disabled ? COLOR.BLACK_40 : COLOR.BLACK_60)};
	cursor: pointer;
	padding-top: 8px;

	&:first-child, &:last-child {
		width: 40px;
	}
`;

export const ComparisonLoader = styled.div`
	background: ${COLOR.WHITE_87};
	position: absolute;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2;
`;
