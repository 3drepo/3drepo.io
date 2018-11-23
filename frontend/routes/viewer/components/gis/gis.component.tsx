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
import { cond } from 'lodash';
import { ViewerCard } from '../viewerCard/viewerCard.component';
import { ButtonMenu } from '../../../components/buttonMenu/buttonMenu.component';

import IconButton from '@material-ui/core/IconButton';
import LayersIcon from '@material-ui/icons/Layers';
import SearchIcon from '@material-ui/icons/Search';
import MoreIcon from '@material-ui/icons/MoreVert';
import SaveIcon from '@material-ui/icons/Save';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { Container } from './gis.styles';

interface IProps {
	location: any;
	fetchModelSettings: (teamspace, modelId) => void;
	settings: any;
	isPending: boolean;
}
interface IState {
	settingsModeActive: boolean;
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

export class Gis extends React.PureComponent<IProps, any> {
	public state = {
		settingsModeActive: false
	};

	public componentDidMount() {
		const { teamspace, modelId } = this.getDataFromPathname();
		this.props.fetchModelSettings(teamspace, modelId);
	}

	public componentDidUpdate(prevProps) {
		const { settings } = this.props;
		const pointExists = !!(settings && settings.surveyPoints && settings.surveyPoints.length);
		console.log('cdU', pointExists);
	}

	public getDataFromPathname = () => {
		const pathnameElements = this.props.location.pathname.replace('/viewer/', '').split('/');

		return {
			teamspace: pathnameElements[0],
			modelId: pathnameElements[1],
			revision: pathnameElements[2] || null
		};
	}

	public handleSearchClick = () => {};

	public handleSaveClick = () => {};

	public handleToggleSettings = () => {
		this.setState({
			settingsModeActive: !this.state.settingsModeActive
		});
	}

	public getTitleIcon = () => <LayersIcon />;

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
				anchorOrigin: {
					vertical: 'top',
					horizontal: 'right'
				}
			} }
	/>)

	public getSearchButton = () => 	(
		<IconButton aria-label="Search" onClick={this.handleSearchClick}>
			<SearchIcon color="inherit" />
		</IconButton>
	)

	public getActions = () => [
		{
			Button: this.getSearchButton
		},
		{
			Button: this.getMenuButton
		}
	]

	public renderFooterContent = (isActive) => {
		if (isActive) {
			return (
				<IconButton aria-label="Save" onClick={this.handleSaveClick}>
					<SaveIcon color="inherit" />
				</IconButton>	
			);
		}
		return null;
	}

	public renderSettings = () => {
		return (
			<>
				GIS Point - World Coordinates
				Latitude
				Longitude
				Elevation
				Angle from North (clockwise degrees)
				Project base Point - Model Coordinates
				X
				Y
				Z
			</>
		);
	}

	public renderMapLayers = () => {
		return (
			<>Map Layers</>
		);
	}

	public render() {
		const { settingsModeActive } = this.state;

		return (
			<ViewerCard
				title="GIS"
				Icon={this.getTitleIcon()}
				actions={this.getActions()}
				renderFooterContent={() => this.renderFooterContent(settingsModeActive)}
			>
				{settingsModeActive ? this.renderSettings() : this.renderMapLayers()}
			</ViewerCard>
		);
	}
}
