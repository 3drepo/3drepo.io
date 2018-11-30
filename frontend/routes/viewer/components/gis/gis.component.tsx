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
import { ViewerCard } from '../viewerCard/viewerCard.component';
import { ButtonMenu } from '../../../components/buttonMenu/buttonMenu.component';

import IconButton from '@material-ui/core/IconButton';
import LayersIcon from '@material-ui/icons/Layers';
import ArrowBack from '@material-ui/icons/ArrowBack';
import MoreIcon from '@material-ui/icons/MoreVert';
import SaveIcon from '@material-ui/icons/Save';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

import {
	FooterWrapper,
	StyledSaveButton,
	StyledSelect,
	StyledSelectItem,
	MapLayer,
	MapName,
	MapNameWrapper,
	StyledMapIcon,
	VisibilityButton
} from './gis.styles';
import { SettingsForm } from './components/settingsForm/settingsForm.component';

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
		const pathnameElements = this.props.location.pathname.replace('/viewer/', '').split('/');

		return {
			teamspace: pathnameElements[0],
			modelId: pathnameElements[1],
			revision: pathnameElements[2] || null
		};
	}

	public handleSaveClick = () => {
		const settingsForm = this.formRef.current.formikRef.current;
		settingsForm.submitForm();
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
			PopoverProps={ {
				anchorOrigin: { vertical: 'center', horizontal: 'left' }
			} }
			ButtonProps={ {
				disabled: this.props.isPending || this.state.settingsModeActive
			} }
	/>)

	public getActions = () => {
		if (!this.state.settingsModeActive) {
			return [ { Button: this.getMenuButton } ];
		}
		return [];
	}

	public renderFooterContent = () => {
		if (this.state.settingsModeActive) {
			return (
				<FooterWrapper>
					<StyledSaveButton
						type="submit" aria-label="Save" onClick={this.handleSaveClick} disabled={this.props.isPending}
					>
						<SaveIcon color="secondary" />
					</StyledSaveButton>
				</FooterWrapper>
			);
		}
		return null;
	}

	public renderSettings = () => {
		let values = {} as any;
		const settings = this.props.settings;

		if (settings.surveyPoints && settings.surveyPoints.length) {
			const [ {
				position: [ axisX, axisY, axisZ ],
				latLong: [ latitude, longitude ]
			} ] = settings.surveyPoints;

			values = { axisX, axisY, axisZ, latitude, longitude };
		}

		if (settings.angleFromNorth) {
			values.angleFromNorth = settings.angleFromNorth;
		}

		return (
			<SettingsForm
				ref={this.formRef}
				initialValues={values}
				updateModelSettings={this.props.updateModelSettings}
				getDataFromPathname={this.getDataFromPathname}
			/>
		);
	}

	public handleChangeMapProvider = (event) => {
		this.setState({
			activeMapIndex: event.target.value
		}, () => {
			this.props.resetSources();
		});
	}

	public renderVisibilityButton = (layer) => {
		return(
			<VisibilityButton>
				{includes(this.state.visiblieSources, layer.source)
					? <VisibilityIcon onClick={() => this.props.removeSource(layer.source)}/>
					: <VisibilityOffIcon onClick={() => this.props.addSource(layer.source)} />
				}
			</VisibilityButton>
		);
	}

	public renderMapLayers = () => {
		const { mapsProviders } = this.props;
		const { activeMapIndex } = this.state;

		return (
			<>
				<StyledSelect
					onChange={this.handleChangeMapProvider}
					value={activeMapIndex}>
					{mapsProviders.map((mapProvider, index) => (
						<StyledSelectItem key={mapProvider.name} value={index}>
							{mapProvider.name}
						</StyledSelectItem>
					) ) }
				</StyledSelect>
				{ mapsProviders[activeMapIndex].layers.map((layer) => (
					<MapLayer key={layer.name}>
						<MapNameWrapper>
							<StyledMapIcon color="inherit" />
							<MapName>{layer.name}</MapName>
						</MapNameWrapper>

						{this.renderVisibilityButton(layer)}
					</MapLayer>
				)) }
			</>
		);
	}

	public render() {
		const { settingsModeActive } = this.state;

		return (
			<ViewerCard
				title="GIS"
				Icon={this.getTitleIcon()}
				actions={this.getActions()}
				renderFooterContent={this.renderFooterContent}
				pending={this.props.isPending}
			>
				{settingsModeActive ? this.renderSettings() : this.renderMapLayers()}
			</ViewerCard>
		);
	}
}
