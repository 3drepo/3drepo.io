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

import React from 'react';

import { isEmpty, isEqual } from 'lodash';

import { VIEWER_EVENTS } from '../../../../constants/viewer';
import { VIEWER_PANELS } from '../../../../constants/viewerGui';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { Viewer } from '../../../../services/viewer/viewer';
import { PanelBarActions } from '../panelBarActions';
import { ViewerPanelButton, ViewerPanelFooter } from '../viewerPanel/viewerPanel.styles';
import { MeasuringType } from './components/measuringType';
import {
	Container,
	EmptyStateInfo,
	SearchField,
	ViewerBottomActions,
	ViewpointsList,
	ViewsContainer,
	ViewsIcon
} from './measure.styles';

interface IProps {
	viewer: any;
	teamspace: string;
	model: string;
	isMeasureActive: boolean;
	isMeasureDisabled: boolean;
	disableMeasure: (isDisabled) => void;
	deactivateMeasure: () => void;
	activateMeasure: () => void;
}

const MEASURE_TYPE = {
	LENGTH: 0,
	AREA: 1,
};

export class Measure extends React.PureComponent<IProps, any> {
	public state = {
		isViewerReady: false,
		measurements: [],
	};

	public containerRef = React.createRef<any>();

	get type() {
		return VIEWER_PANELS.MEASURE;
	}

	public componentDidMount(): void {
		(async () => {
			await Viewer.isViewerReady();
			this.setState({ isViewerReady: true });
		})();
		this.toggleMeasureListeners(true);
	}

	public toggleMeasureListeners = (enabled: boolean) => {
		const resolver = enabled ? 'on' : 'off';
		const { viewer } = this.props;
		console.warn('viewer:', viewer);
		viewer[resolver](VIEWER_EVENTS.MEASUREMENT_CREATED, this.handleMeasureCreated);
	}

	public handleMeasureCreated = ((measure) => {
		this.setState((prevState) => ({
			measurements: [...prevState.measurements, measure]
		}));
		console.info('handleMeasureCreated:', measure);
	});

	public renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No measurements have been created yet</EmptyStateInfo>
	));

	public getTitleIcon = () => <ViewsIcon />;

	public renderMeasurementDetails = renderWhenTrue(() => (
		<div>
			{this.state.measurements.map((measure) => (measure.type))}
		</div>
	));

	public renderFooterContent = () => (
		<ViewerPanelFooter alignItems="center">
			<ViewerBottomActions>
				<MeasuringType {...this.props} />
			</ViewerBottomActions>
		</ViewerPanelFooter>
	)

	public renderActions = () => (
		<PanelBarActions
			type={this.type}
			hideMenu
			hideSearch
		/>
	)

	public render() {
		const { isViewerReady, measurements } = this.state;
		return (
			<ViewsContainer
				Icon={this.getTitleIcon()}
				renderActions={this.renderActions}
				pending={!isViewerReady}
			>
				<Container ref={this.containerRef}>
					{this.renderEmptyState(isEmpty(measurements))}
					{this.renderMeasurementDetails(!isEmpty(measurements))}
				</Container>
				{this.renderFooterContent()}
			</ViewsContainer>
		);
	}
}
