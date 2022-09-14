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

import { IconButton, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BuildIcon from '@mui/icons-material/Build';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { includes, isEmpty } from 'lodash';

import { VIEWER_PANELS } from '../../../../constants/viewerGui';
import { renderWhenTrue } from '../../../../helpers/rendering';
import {
	IconWrapper,
	MenuList,
	StyledItemText,
	StyledListItem
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { PanelBarActions } from '../panelBarActions';
import { Settings } from './components/settings/settings.component';
import {
	GisContainer,
	GisIcon,
	MapLayer,
	MapLayers,
	MapName,
	MapNameWrapper,
	StyledMapIcon,
	StyledSelect,
	VisibilityButton
} from './gis.styles';

interface IProps {
	location: any;
	fetchModelMaps: (teamspace, modelId) => void;
	updateModelSettings: (modelData, settings) => void;
	settings: any;
	isPending: boolean;
	hasGISCoordinates: boolean;
	mapsProviders: any[];
	addVisibleLayer: (layer) => void;
	removeVisibleLayer: (layer) => void;
	resetVisibleLayers: () => void;
	visibleLayers: any[];
	id?: string;
	urlParams: any;
}

interface IState {
	settingsModeActive: boolean;
	activeMapIndex: number;
}

export class Gis extends PureComponent<IProps, IState> {

	get type() {
		return VIEWER_PANELS.GIS;
	}

	get surveySettings() {
		const { settings } = this.props;

		return {
			surveyPoints: settings.surveyPoints,
			angleFromNorth: settings.angleFromNorth || 0
		};
	}
	public state = {
		settingsModeActive: false,
		activeMapIndex: 0,
	};

	public renderMapLayers = renderWhenTrue(() => {
		const { mapsProviders } = this.props;
		const { activeMapIndex } = this.state;
		const activeMapLayers = mapsProviders.length && mapsProviders[activeMapIndex].layers;
		return (
			<MapLayers>
				<StyledSelect onChange={this.handleChangeMapProvider} value={activeMapIndex}>
					{this.renderMapProviders(mapsProviders)}
				</StyledSelect>
				{activeMapLayers ? this.renderLayers(activeMapLayers) : null}
			</MapLayers>
		);
	});

	public componentDidMount() {
		const { teamspace, model } = this.props.urlParams;
		if (this.props.settings._id) {
			this.props.fetchModelMaps(teamspace, model);
		}
	}

	public toggleSettings = () => {
		this.setState({
			settingsModeActive: !this.state.settingsModeActive
		});
	}

	public getTitleIcon = () => {
		if (this.state.settingsModeActive && this.props.hasGISCoordinates) {
			return (
                <IconButton
                    disabled={!this.props.hasGISCoordinates}
                    onClick={this.toggleSettings}
                    size="large"
				>
						<ArrowBackIcon />
				</IconButton>
            );
		}
		return <GisIcon />;
	}

	public renderActionsMenu = () => (
		<MenuList>
			<StyledListItem onClick={this.toggleSettings}>
				<IconWrapper><BuildIcon fontSize="small" /></IconWrapper>
				<StyledItemText>
					Settings
				</StyledItemText>
			</StyledListItem>
		</MenuList>
	)

	public renderActions = () => {
		let  menuOpenProp = {};

		if (this.state.settingsModeActive) {
			menuOpenProp = {menuOpen: false};
		}

		return (
			<PanelBarActions
				type={this.type}
				menuLabel="Show GIS menu"
				menuActions={this.renderActionsMenu}
				hideMenu={this.props.isPending || this.state.settingsModeActive || !this.props.hasGISCoordinates}
				hideSearch
				{...menuOpenProp}
			/>
		);
	}

	public handleChangeMapProvider = (event) => {
		this.setState({
			activeMapIndex: event.target.value
		}, () => {
			this.props.resetVisibleLayers();
		});
	}

	public renderHideLayerButton = (layer, statement) => renderWhenTrue(
		<VisibilityButton onClick={() => this.props.removeVisibleLayer(layer.source)}>
			<VisibilityIcon />
		</VisibilityButton>
	)(statement)

	public renderShowLayerButton = (layer, statement) => renderWhenTrue(
		<VisibilityButton onClick={() => this.props.addVisibleLayer(layer.source)}>
			<VisibilityOffIcon />
		</VisibilityButton>
	)(statement)

	public renderMapProviders = (mapsProviders = []) =>
		mapsProviders.map((mapProvider, index) => (
			<MenuItem key={mapProvider.name} value={index}>
				{mapProvider.name}
			</MenuItem>
		))

	public renderLayers = (mapLayers = []) =>
		mapLayers.map((layer) => (
			<MapLayer key={layer.name}>
				<MapNameWrapper>
					<StyledMapIcon color="inherit" />
					<MapName>{layer.name}</MapName>
				</MapNameWrapper>

				{this.renderShowLayerButton(layer, !includes(this.props.visibleLayers, layer.source))}
				{this.renderHideLayerButton(layer, includes(this.props.visibleLayers, layer.source))}
			</MapLayer>
		))

	public getSettingsValues = () => {
		const { settings } = this.props;
		const values = {} as any;

		if (settings) {
			values.surveyPoints = settings.surveyPoints || [];
			values.angleFromNorth = settings.angleFromNorth || 0;
		}

		return values;
	}

	public getSettingsProperties = () => {
		const { settings } = this.props;
		const properties = {} as any;

		if (settings && settings.properties) {
			properties.unit = settings.properties.unit || '';
		}

		return properties;
	}

	public render() {
		const { hasGISCoordinates } = this.props;
		const { settingsModeActive } = this.state;

		return (
			<GisContainer
				Icon={this.getTitleIcon()}
				renderActions={this.renderActions}
				pending={this.props.isPending}
				id={this.props.id}
			>
				{(settingsModeActive || !hasGISCoordinates) && (
					<Settings
							values={this.getSettingsValues()}
							properties={this.getSettingsProperties()}
							updateModelSettings={this.props.updateModelSettings}
							urlParams={this.props.urlParams}
						/>
					)
				}
				{(!settingsModeActive && hasGISCoordinates) && this.renderMapLayers(!settingsModeActive)}
			</GisContainer>
		);
	}
}
