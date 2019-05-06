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
import { Tabs as TabsComponent, List } from '@material-ui/core';
import SliderComponent from '@material-ui/lab/Slider';

import { ViewerPanelFooter as ViewerPanelFooterComponent } from '../viewerPanel/viewerPanel.styles';

import { COLOR } from '../../../../styles';

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
`;

export const Slider = styled(SliderComponent).attrs({
	classes: {
		track: 'slider__track'
	}
})`
	.slider__track {
		background: ${COLOR.BLACK_20};
    opacity: 1;
	}
`;

export const SliderLabels = styled.div`
	display: flex;
	justify-content: space-between;
	margin-top: 8px;
	padding-left: 13px;
`;

export const SliderLabel = styled.div`
	color: ${COLOR.BLACK_40};
	cursor: pointer;
`;
