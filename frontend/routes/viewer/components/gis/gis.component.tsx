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

import * as React from 'react';
import { isEmpty, includes } from 'lodash';

import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ViewerPanelContent } from '../viewerPanel/viewerPanel.styles';
import { ButtonMenu } from '../../../components/buttonMenu/buttonMenu.component';
import { Settings } from './components/settings/settings.component';

import IconButton from '@material-ui/core/IconButton';
import LayersIcon from '@material-ui/icons/Layers';
import ArrowBack from '@material-ui/icons/ArrowBack';
import MoreIcon from '@material-ui/icons/MoreVert';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

import {
	StyledSelect,
	MapLayer,
	MapName,
	MapNameWrapper,
	StyledMapIcon,
	VisibilityButton,
	StyledMenuItem
} from './gis.styles';

interface IProps {
	location: any;
	fetchModelSettings: (teamspace, modelId) => void;
	fetchModelMaps: (teamspace, modelId) => void;
	updateModelSettings: (modelData, settings) => void;
	settings: any;
	isPending: boolean;
	mapsProviders: any[];
	initializeMap: (params) => void;
	addSource: (source) => void;
	removeSource: (source) => void;
	resetSources: () => void;
	isInitializedMap: boolean;
	visiblieSources: any[];
}
interface IState {
	settingsModeActive: boolean;
	activeMapIndex: number;
	visiblieSources: any[];
	pointsExists: boolean;
}

const MenuButton = ({ IconProps, Icon, ...props }) => (
	<IconButton
		{...props}
		aria-label="Show GIS menu"
		aria-haspopup="true"
	>
		<MoreIcon {...IconProps} />
	</IconButton>
);

export class Gis extends React.PureComponent<IProps, IState> {
	public state = {
		settingsModeActive: true,
		activeMapIndex: 0,
		visiblieSources: [],
		pointsExists: false
	};

	public formRef = React.createRef<any>();

	public componentDidMount() {
		const { teamspace, modelId } = this.getDataFromPathname();
		this.props.fetchModelSettings(teamspace, modelId);
		this.props.fetchModelMaps(teamspace, modelId);
		this.props.resetSources();
	}

	public componentWillUnmount() {
		this.props.resetSources();
	}

	public componentDidUpdate(prevProps, prevState) {
		const { settings, visiblieSources, initializeMap, resetSources } = this.props;
		const changes = {} as any;

		const pointsExists = !!(settings && settings.surveyPoints && settings.surveyPoints.length);
		changes.pointsExists = pointsExists;

		if (isEmpty(prevProps.settings) && !isEmpty(settings) || settings !== prevProps.settings) {
			const surveySettings = {
				surveyPoints: settings.surveyPoints,
				angleFromNorth: settings.angleFromNorth || 0
			};

			changes.settingsModeActive = !pointsExists;

			if (pointsExists) {
				resetSources();
				initializeMap(surveySettings);
			}
		}

		if (prevState.pointsExists !== this.state.pointsExists) {
			changes.settingsModeActive = !this.state.pointsExists;
		}

		if (visiblieSources.length !== prevProps.visiblieSources.length) {
			changes.visiblieSources = visiblieSources;
		}

		this.setState(changes);
	}

	public getDataFromPathname = () => {
		const [teamspace, modelId, revision] = this.props.location.pathname.replace('/viewer/', '').split('/');
		return { teamspace, modelId, revision };
	}

	public handleToggleSettings = () => {
		this.setState({
			settingsModeActive: !this.state.settingsModeActive
		});
	}

	public getTitleIcon = () => {
		if (this.state.settingsModeActive) {
			return (
				<IconButton
					disabled={!this.state.pointsExists}
					disableRipple={true}
					onClick={this.handleToggleSettings}>
						<ArrowBack />
				</IconButton>
			);
		}
		return <LayersIcon />;
	}

	public renderMenuContent = () => (
		<List>
			<ListItem onClick={this.handleToggleSettings} button>Settings</ListItem>
		</List>
	)

	public getMenuButton = () => 	(
		<ButtonMenu
			renderButton={MenuButton}
			renderContent={this.renderMenuContent}
			PopoverProps={{
				anchorOrigin: { vertical: 'center', horizontal: 'left' }
			}}
			ButtonProps={{
				disabled: this.props.isPending || this.state.settingsModeActive
			}}
	/>)

	public getActions = () => {
		if (!this.state.settingsModeActive) {
			return [ { Button: this.getMenuButton } ];
		}
		return [];
	}

	public handleChangeMapProvider = (event) => {
		this.setState({
			activeMapIndex: event.target.value
		}, () => {
			this.props.resetSources();
		});
	}

	public renderVisibilityButton = (layer) => {
		return (
			<VisibilityButton>
				{includes(this.state.visiblieSources, layer.source)
					? <VisibilityIcon onClick={() => this.props.removeSource(layer.source)}/>
					: <VisibilityOffIcon onClick={() => this.props.addSource(layer.source)} />
				}
			</VisibilityButton>
		);
	}

	public renderMapProviders = (mapsProviders = []) =>
		mapsProviders.map((mapProvider, index) => (
			<StyledMenuItem key={mapProvider.name} value={index}>
				{mapProvider.name}
			</StyledMenuItem>
		))

	public renderLayers = (mapLayers = []) =>
		mapLayers.map((layer) => (
			<MapLayer key={layer.name}>
				<MapNameWrapper>
					<StyledMapIcon color="inherit" />
					<MapName>{layer.name}</MapName>
				</MapNameWrapper>

				{this.renderVisibilityButton(layer)}
			</MapLayer>
		))

	public renderMapLayers = () => {
		const { mapsProviders } = this.props;
		const { activeMapIndex } = this.state;

		return (
			<ViewerPanelContent>
				<StyledSelect
					onChange={this.handleChangeMapProvider}
					value={activeMapIndex}
				>
					{this.renderMapProviders(mapsProviders)}
				</StyledSelect>
				{this.renderLayers(mapsProviders[activeMapIndex].layers)}
			</ViewerPanelContent>
		);
	}

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
		const { settingsModeActive } = this.state;
		console.log('this.props.settings',this.props.settings, this.props.settings.surveyPoints, this.props.settings.angleFromNorth)

		return (
			<ViewerPanel
				title="GIS"
				Icon={this.getTitleIcon()}
				actions={this.getActions()}
				pending={this.props.isPending}
			>
				{settingsModeActive
					? <Settings
							values={this.getSettingsValues()}
							properties={this.getSettingsProperties()}
							updateModelSettings={this.props.updateModelSettings}
							getDataFromPathname={this.getDataFromPathname}
						/>
					: this.renderMapLayers()
				}
			</ViewerPanel>
	);
	}
}
