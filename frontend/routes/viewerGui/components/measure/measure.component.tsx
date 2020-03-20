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

import Check from '@material-ui/icons/Check';
import React from 'react';

import { isEmpty } from 'lodash';
import { MEASURE_ACTIONS_ITEMS, MEASURE_ACTIONS_MENU } from '../../../../constants/measure';
import { VIEWER_EVENTS } from '../../../../constants/viewer';
import { VIEWER_PANELS } from '../../../../constants/viewerGui';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { Viewer } from '../../../../services/viewer/viewer';
import {
	IconWrapper,
	MenuList, StyledItemText,
	StyledListItem
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { PanelBarActions } from '../panelBarActions';
import { ViewerPanelFooter } from '../viewerPanel/viewerPanel.styles';
import { IMeasure, MeasureItem } from './components/measureItem/measureItem.component';
import { MeasuringType } from './components/measuringType';
import {
	Container,
	EmptyStateInfo,
	Title,
	TitleWrapper,
	ViewerBottomActions,
	ViewsContainer,
	ViewsIcon,
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
	measurements: IMeasure[];
	areaMeasurements: IMeasure[];
	lengthMeasurements: IMeasure[];
	pointMeasurements: IMeasure[];
	addMeasurement: (IMeasure) => void;
	removeMeasurement: (uuid) => void;
	clearMeasurements: () => void;
	setMeasureMode: (mode) => void;
	measureMode: string;
	setMeasurementColor: (uuid, color) => void;
	resetMeasurementColors: () => void;
	measureUnits: string;
	setMeasureUnits: (units: string) => void;
	setMeasureEdgeSnapping: (edgeSnapping: boolean) => void;
	edgeSnappingEnabled: boolean;
}

interface IState {
	isViewerReady: boolean;
}

export class Measure extends React.PureComponent<IProps, IState> {
	public state = {
		isViewerReady: false,
	};

	public containerRef = React.createRef<any>();

	get type() {
		return VIEWER_PANELS.MEASURE;
	}

	private handleToggleEdgeSnapping = () => this.props.setMeasureEdgeSnapping(!this.props.edgeSnappingEnabled);

	private handleToggleMeasureUnits = () => this.props.setMeasureUnits(this.props.measureUnits === 'm' ? 'mm' : 'm' );

	get menuActionsMap() {
		return {
			[MEASURE_ACTIONS_ITEMS.EDGE_SNAPPING]: this.handleToggleEdgeSnapping,
			[MEASURE_ACTIONS_ITEMS.SHOW_XYZ]: this.handleToggleEdgeSnapping,
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
	}

	public componentWillUnmount = () => {
		this.toggleMeasureListeners(false);
	}

	public toggleMeasureListeners = (enabled: boolean) => {
		const resolver = enabled ? 'on' : 'off';
		const { viewer } = this.props;

		viewer[resolver](VIEWER_EVENTS.MEASUREMENT_CREATED, this.handleMeasureCreated);
		viewer[resolver](VIEWER_EVENTS.MEASUREMENT_REMOVED, this.handleMeasureRemoved);
	}

	public handleMeasureCreated = (measure) => this.props.addMeasurement(measure);

	public handleMeasureRemoved = (measurementId) => this.props.removeMeasurement(measurementId);

	public handleClearMeasurements = () => this.props.clearMeasurements();

	public handleResetMeasurementColors = () => this.props.resetMeasurementColors();

	public renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No measurements have been created yet</EmptyStateInfo>
	));

	public getTitleIcon = () => <ViewsIcon />;

	public renderAreasMeasurements = renderWhenTrue(() => (
			<div>
				<Title>
					<TitleWrapper>Area</TitleWrapper>
				</Title>
				{this.props.areaMeasurements.map((props, index) => (
					<MeasureItem
						key={props.uuid}
						index={index + 1}
						typeName="Area"
						units={this.props.measureUnits}
						removeMeasurement={this.props.removeMeasurement}
						setMeasurementColor={this.props.setMeasurementColor}
						{...props}
					/>
				))}
			</div>
	));

	public renderLengthsMeasurements = renderWhenTrue(() => (
			<div>
				<Title>
					<TitleWrapper>Length</TitleWrapper>
				</Title>
				{this.props.lengthMeasurements.map((props, index) => (
					<MeasureItem
						key={props.uuid}
						index={index + 1}
						typeName="Length"
						units={this.props.measureUnits}
						removeMeasurement={this.props.removeMeasurement}
						setMeasurementColor={this.props.setMeasurementColor}
						{...props}
					/>
				))}
			</div>
	));

	public renderPointMeasurements = renderWhenTrue(() => (
			<div>
				<Title>
					<TitleWrapper>Point</TitleWrapper>
				</Title>
				{this.props.pointMeasurements.map((props, index) => (
					<MeasureItem
						key={props.uuid}
						index={index + 1}
						typeName="Point"
						units={this.props.measureUnits}
						removeMeasurement={this.props.removeMeasurement}
						setMeasurementColor={this.props.setMeasurementColor}
						{...props}
					/>
				))}
			</div>
	));

	public renderMeasurementDetails = renderWhenTrue(() => (
		<div>
			{this.renderPointMeasurements(!isEmpty(this.props.pointMeasurements))}
			{this.renderAreasMeasurements(!isEmpty(this.props.areaMeasurements))}
			{this.renderLengthsMeasurements(!isEmpty(this.props.lengthMeasurements))}
		</div>
	));

	public renderFooterContent = () => (
		<ViewerPanelFooter alignItems="center">
			<ViewerBottomActions>
				<MeasuringType {...this.props} />
			</ViewerBottomActions>
		</ViewerPanelFooter>
	)

	private renderActionsMenu = () => (
			<MenuList>
				{MEASURE_ACTIONS_MENU.map(( {name, Icon, label }) => (
						<StyledListItem key={name} button onClick={this.menuActionsMap[name]}>
							<IconWrapper><Icon fontSize="small" /></IconWrapper>
							<StyledItemText>
								{label}
								{(name === MEASURE_ACTIONS_ITEMS.EDGE_SNAPPING && this.props.edgeSnappingEnabled) && <Check fontSize="small" />}
								{(name === MEASURE_ACTIONS_ITEMS.SHOW_XYZ && this.props.edgeSnappingEnabled) && <Check fontSize="small" />}
								{name === MEASURE_ACTIONS_ITEMS.UNITS_DISPLAYED_IN && <strong>{this.props.measureUnits}</strong>}
							</StyledItemText>
						</StyledListItem>
				))}
			</MenuList>
	)

	public renderActions = () => (
		<PanelBarActions
			type={this.type}
			menuLabel="Show measure menu"
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
