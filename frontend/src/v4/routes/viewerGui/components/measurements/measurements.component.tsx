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

import { PureComponent } from 'react';

import Check from '@mui/icons-material/Check';
import { isEmpty } from 'lodash';

import { MEASURE_ACTIONS_ITEMS, MEASURE_ACTIONS_MENU } from '../../../../constants/measure';
import { VIEWER_PANELS } from '../../../../constants/viewerGui';
import { renderWhenTrue } from '../../../../helpers/rendering';
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
import { AllMeasurementsList } from './components/measurementsList/allMeasurementsList.component';
import { MeasuringType } from './components/measuringType';
import {
	Container,
	MeasureIcon,
	MeasureUnit,
	ViewerBottomActions,
	ViewsContainer,
} from './measurements.styles';

interface IProps {
	viewer: any;
	teamspace: string;
	model: string;
	measurements: IMeasure[];
	areaMeasurements: IMeasure[];
	angleMeasurements: IMeasure[];
	slopeMeasurements: IMeasure[];
	lengthMeasurements: IMeasure[];
	pointMeasurements: IMeasure[];
	removeMeasurement: (uuid) => void;
	clearMeasurements: () => void;
	setMeasureMode: (mode) => void;
	setMeasurementName: (uuid, type, name) => void;
	setMeasurementColor: (uuid, color) => void;
	resetMeasurementColors: () => void;
	measureUnits: string;
	setMeasureUnits: (units: string) => void;
	setMeasureEdgeSnapping: (edgeSnapping: boolean) => void;
	edgeSnappingEnabled: boolean;
	setMeasureXYZDisplay: (XYZDisplay: boolean) => void;
	XYZdisplay: boolean;
	resetMeasurementTool: () => void;
	modelUnit: string;
	measureMode: string;
	id?: string;
}

interface IState {
	isViewerReady: boolean;
}

export class Measurements extends PureComponent<IProps, IState> {
	public state = {
		isViewerReady: false,
	};

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

		if (this.props.modelUnit === 'ft') {
			this.props.setMeasureUnits(this.props.modelUnit);
		}
	}

	public componentWillUnmount = () => {
		this.props.setMeasureMode('');
	}

	private handleToggleEdgeSnapping = () => this.props.setMeasureEdgeSnapping(!this.props.edgeSnappingEnabled);

	private handleToggleXYZdisplay = () => this.props.setMeasureXYZDisplay(!this.props.XYZdisplay);

	private handleToggleMeasureUnits = () => this.props.setMeasureUnits(this.props.measureUnits === 'm' ? 'mm' : 'm' );

	private handleClearMeasurements = () => this.props.clearMeasurements();

	private handleResetMeasurementColors = () => this.props.resetMeasurementColors();

	private renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No measurements have been created yet</EmptyStateInfo>
	));

	private getTitleIcon = () => <MeasureIcon />;

	private renderMeasurementDetails = renderWhenTrue(() => (
		<AllMeasurementsList {...this.props} units={this.props.measureUnits} />
	));

	private renderFooterContent = () => (
		<ViewerPanelFooter container alignItems="center">
			<ViewerBottomActions id={this.props.id + '-add-new-container'}>
				<MeasuringType setMeasureMode={this.props.setMeasureMode} measureMode={this.props.measureMode} />
			</ViewerBottomActions>
		</ViewerPanelFooter>
	)

	private renderActionsMenu = () => (
		<MenuList>
			{MEASURE_ACTIONS_MENU
				// When the model is in feet there shouldnt be the options of change the units
				.filter(({name}) => name !== MEASURE_ACTIONS_ITEMS.UNITS_DISPLAYED_IN || this.props.modelUnit !== 'ft')
				.map(( {name, Icon, label }) => (
				<StyledListItem key={name} onClick={this.menuActionsMap[name]}>
					<IconWrapper><Icon /></IconWrapper>
					<StyledItemText>
						{label}
						{(name === MEASURE_ACTIONS_ITEMS.EDGE_SNAPPING && this.props.edgeSnappingEnabled) && <Check fontSize="small" />}
						{(name === MEASURE_ACTIONS_ITEMS.SHOW_XYZ && this.props.XYZdisplay) && <Check fontSize="small" />}
						{name === MEASURE_ACTIONS_ITEMS.UNITS_DISPLAYED_IN && <MeasureUnit>{this.props.measureUnits}</MeasureUnit>}
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
		const { areaMeasurements, lengthMeasurements, pointMeasurements, angleMeasurements, slopeMeasurements } = this.props;
		return (
			<ViewsContainer
				Icon={this.getTitleIcon()}
				renderActions={this.renderActions}
				pending={!isViewerReady}
				id={this.props.id}
			>
				<Container>
					{this.renderEmptyState(
						isEmpty(areaMeasurements)
						&& isEmpty(lengthMeasurements)
						&& isEmpty(pointMeasurements)
						&& isEmpty(angleMeasurements)
						&& isEmpty(slopeMeasurements)
					)}
					{this.renderMeasurementDetails(
							!isEmpty(areaMeasurements)
							|| !isEmpty(lengthMeasurements)
							|| !isEmpty(pointMeasurements)
							|| !isEmpty(angleMeasurements)
							|| !isEmpty(slopeMeasurements)
					)}
				</Container>
				{this.renderFooterContent()}
			</ViewsContainer>
		);
	}
}
