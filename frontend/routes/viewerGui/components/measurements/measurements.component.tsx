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

import Check from '@material-ui/icons/Check';
import { isEmpty } from 'lodash';

import { MEASURE_ACTIONS_ITEMS, MEASURE_ACTIONS_MENU } from '../../../../constants/measure';
import { VIEWER_EVENTS } from '../../../../constants/viewer';
import { VIEWER_PANELS } from '../../../../constants/viewerGui';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { MEASURE_TYPE } from '../../../../modules/measurements/measurements.constants';
import { Viewer } from '../../../../services/viewer/viewer';
import { EmptyStateInfo } from '../../../components/components.styles';
import {
	IconWrapper,
	MenuList, StyledItemText,
	StyledListItem
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { PanelBarActions } from '../panelBarActions';
import { ViewerPanelFooter } from '../viewerPanel/viewerPanel.styles';
import { IMeasure } from './components/measureItem/measureItem.component';
import { MeasurementsList } from './components/measurementsList/measurementsList.component';
import { MeasuringType } from './components/measuringType';
import {
	Container,
	MeasureIcon,
	ViewerBottomActions,
	ViewsContainer,
} from './measurements.styles';

interface IProps {
	viewer: any;
	teamspace: string;
	model: string;
	isMeasureActive: boolean;
	disableMeasure: (isDisabled) => void;
	deactivateMeasure: () => void;
	activateMeasure: () => void;
	measurements: IMeasure[];
	areaMeasurements: IMeasure[];
	lengthMeasurements: IMeasure[];
	pointMeasurements: IMeasure[];
	addMeasurement: (measure: IMeasure) => void;
	removeMeasurement: (uuid) => void;
	clearMeasurements: () => void;
	setMeasureMode: (mode) => void;
	measureMode: string;
	setMeasurementName: (uuid, type, name) => void;
	setMeasurementColor: (uuid, color) => void;
	resetMeasurementColors: () => void;
	measureUnits: string;
	setMeasureUnits: (units: string) => void;
	setMeasureEdgeSnapping: (edgeSnapping: boolean) => void;
	edgeSnappingEnabled: boolean;
	setMeasureXYZDisplay: (XYZDisplay: boolean) => void;
	XYZdisplay: boolean;
	setMeasurementCheck: (uuid, type) => void;
	setMeasurementCheckAll: (type) => void;
	resetMeasurementTool: () => void;
	modelUnit: string;
	id?: string;
}

interface IState {
	isViewerReady: boolean;
}

export class Measurements extends React.PureComponent<IProps, IState> {
	public state = {
		isViewerReady: false,
	};

	public containerRef = React.createRef<any>();

	get type() {
		return VIEWER_PANELS.MEASUREMENTS;
	}

	get menuActionsMap() {
		return {
			[MEASURE_ACTIONS_ITEMS.EDGE_SNAPPING]: this.handleToggleEdgeSnapping,
			[MEASURE_ACTIONS_ITEMS.SHOW_XYZ]: this.handleToggleXYZdisplay,
			[MEASURE_ACTIONS_ITEMS.UNITS_DISPLAYED_IN]: this.handleToggleMeasureUnits,
			[MEASURE_ACTIONS_ITEMS.RESET_COLOURS]: this.handleResetMeasurementColors,
			[MEASURE_ACTIONS_ITEMS.DELETE_ALL]: this.handleClearMeasurements,
		};
	}

	public componentDidMount(): void {
		(async () => {
			await Viewer.isViewerReady();
			this.setState({ isViewerReady: true });
		})();
		this.toggleMeasureListeners(true);

		if (this.props.modelUnit === 'ft') {
			this.props.setMeasureUnits(this.props.modelUnit);
		}
	}

	public componentWillUnmount = () => {
		this.toggleMeasureListeners(false);
	}

	private toggleMeasureListeners = (enabled: boolean) => {
		const resolver = enabled ? 'on' : 'off';
		const { viewer } = this.props;

		viewer[resolver](VIEWER_EVENTS.MEASUREMENT_CREATED, this.handleMeasureCreated);
	}

	private handleToggleEdgeSnapping = () => this.props.setMeasureEdgeSnapping(!this.props.edgeSnappingEnabled);

	private handleToggleXYZdisplay = () => this.props.setMeasureXYZDisplay(!this.props.XYZdisplay);

	private handleToggleMeasureUnits = () => this.props.setMeasureUnits(this.props.measureUnits === 'm' ? 'mm' : 'm' );

	private handleMeasureCreated = (measure) => this.props.addMeasurement(measure);

	private handleClearMeasurements = () => this.props.clearMeasurements();

	private handleResetMeasurementColors = () => this.props.resetMeasurementColors();

	private renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No measurements have been created yet</EmptyStateInfo>
	));

	private getTitleIcon = () => <MeasureIcon />;

	private renderAreasMeasurements = renderWhenTrue(() => (
		<MeasurementsList
			measurements={this.props.areaMeasurements}
			units={this.props.measureUnits}
			measureType={MEASURE_TYPE.AREA}
			setMeasurementCheck={this.props.setMeasurementCheck}
			setMeasurementCheckAll={this.props.setMeasurementCheckAll}
			removeMeasurement={this.props.removeMeasurement}
			setMeasurementColor={this.props.setMeasurementColor}
			setMeasurementName={this.props.setMeasurementName}
			modelUnit={this.props.modelUnit}
		/>
	));

	private renderLengthsMeasurements = renderWhenTrue(() => (
		<MeasurementsList
			measurements={this.props.lengthMeasurements}
			units={this.props.measureUnits}
			measureType={MEASURE_TYPE.LENGTH}
			setMeasurementCheck={this.props.setMeasurementCheck}
			setMeasurementCheckAll={this.props.setMeasurementCheckAll}
			removeMeasurement={this.props.removeMeasurement}
			setMeasurementColor={this.props.setMeasurementColor}
			setMeasurementName={this.props.setMeasurementName}
			modelUnit={this.props.modelUnit}
		/>
	));

	private renderPointMeasurements = renderWhenTrue(() => (
		<MeasurementsList
			measurements={this.props.pointMeasurements}
			units={this.props.measureUnits}
			measureType={MEASURE_TYPE.POINT}
			setMeasurementCheck={this.props.setMeasurementCheck}
			setMeasurementCheckAll={this.props.setMeasurementCheckAll}
			removeMeasurement={this.props.removeMeasurement}
			setMeasurementColor={this.props.setMeasurementColor}
			setMeasurementName={this.props.setMeasurementName}
			modelUnit={this.props.modelUnit}
		/>
	));

	private renderMeasurementDetails = renderWhenTrue(() => (
		<div>
			{this.renderPointMeasurements(!isEmpty(this.props.pointMeasurements))}
			{this.renderLengthsMeasurements(!isEmpty(this.props.lengthMeasurements))}
			{this.renderAreasMeasurements(!isEmpty(this.props.areaMeasurements))}
		</div>
	));

	private renderFooterContent = () => (
		<ViewerPanelFooter container alignItems="center">
			<ViewerBottomActions id={this.props.id + '-add-new-container'}>
				<MeasuringType {...this.props} />
			</ViewerBottomActions>
		</ViewerPanelFooter>
	)

	private renderActionsMenu = () => (
		<MenuList>
			{MEASURE_ACTIONS_MENU
				// When the model is in feet there shouldnt be the options of change the units
				.filter(({name}) => name !== MEASURE_ACTIONS_ITEMS.UNITS_DISPLAYED_IN || this.props.modelUnit !== 'ft')
				.map(( {name, Icon, label }) => (
				<StyledListItem key={name} button onClick={this.menuActionsMap[name]}>
					<IconWrapper><Icon fontSize="small" /></IconWrapper>
					<StyledItemText>
						{label}
						{(name === MEASURE_ACTIONS_ITEMS.EDGE_SNAPPING && this.props.edgeSnappingEnabled) && <Check fontSize="small" />}
						{(name === MEASURE_ACTIONS_ITEMS.SHOW_XYZ && this.props.XYZdisplay) && <Check fontSize="small" />}
						{name === MEASURE_ACTIONS_ITEMS.UNITS_DISPLAYED_IN && <strong>{this.props.measureUnits}</strong>}
					</StyledItemText>
				</StyledListItem>
			))}
		</MenuList>
	)

	private renderActions = () => (
		<PanelBarActions
			type={this.type}
			menuLabel="Show measurement menu"
			menuActions={this.renderActionsMenu}
			hideSearch
		/>
	)

	public render() {
		const { isViewerReady } = this.state;
		const { areaMeasurements, lengthMeasurements, pointMeasurements } = this.props;
		return (
			<ViewsContainer
				Icon={this.getTitleIcon()}
				renderActions={this.renderActions}
				pending={!isViewerReady}
				id={this.props.id}
			>
				<Container ref={this.containerRef}>
					{this.renderEmptyState(isEmpty(areaMeasurements) && isEmpty(lengthMeasurements) && isEmpty(pointMeasurements))}
					{this.renderMeasurementDetails(
							!isEmpty(areaMeasurements) || !isEmpty(lengthMeasurements) || !isEmpty(pointMeasurements)
					)}
				</Container>
				{this.renderFooterContent()}
			</ViewsContainer>
		);
	}
}
