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
import { ViewerCard } from '../viewerCard/viewerCard.component';
import { getDataFromPathname } from './../../viewer.helpers';

import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import SaveIcon from '@material-ui/icons/Save';

import {
	FooterWrapper,
	ViewsCountInfo,
	ViewpointsList,
	ViewpointItem,
	Thumbnail,
	ThumbnailPlaceholder,
	Name,
	EmptyStateInfo
} from './views.styles';

interface IProps {
	isPending: boolean;
	location: any;
	viewpoints: any[];
	fetchViewpoints: (teamspace, modelId) => void;
	createViewpoint: (teamspace, modelId, viewName) => void;
	deleteViewpoint: () => void;
	subscribeOnViewpointChanges: (teamspace, modelId) => void;
	unsubscribeOnViewpointChanges: (teamspace, modelId) => void;
}

interface IState {
	viewpoints: any[];
	addMode: boolean;
}

export class Views extends React.PureComponent<IProps, IState> {
	public state = {
		viewpoints: [],
		addMode: false
	};

	public componentDidMount() {
		const { teamspace, modelId } = getDataFromPathname(this.props.location.pathname);
		this.props.fetchViewpoints(teamspace, modelId);
		this.props.subscribeOnViewpointChanges(teamspace, modelId);
	}

	public componentWillUnmount() {
		const { teamspace, modelId } = getDataFromPathname(this.props.location.pathname);
		this.props.unsubscribeOnViewpointChanges(teamspace, modelId);
	}

	public componentDidUpdate(prevProps, prevState) {
		console.log('Did update', prevProps.viewpoints, this.props.viewpoints);
		const { viewpoints } = this.props;

		const changes = {} as any;

		if (viewpoints.length !== prevProps.viewpoints.length || viewpoints !== prevProps.viewpoints) {
			changes.viewpoints = viewpoints;
		}

		this.setState(changes);
	}

	public getTitleIcon = () => <PhotoCameraIcon />;

	public handleSearchViewpoint = () => {
		console.log('Search');
	}

	public handleSave = () => {
		const { teamspace, modelId } = getDataFromPathname(this.props.location.pathname);
		console.log('Save');
		this.props.createViewpoint(teamspace, modelId, 'Test');
	}

	public handleAddViewpoint = () => {
		console.log('Add');
		this.setState({
			addMode: true
		});
	}

	public getSearchButton = () => 	(
		<IconButton onClick={this.handleSearchViewpoint}>
			<SearchIcon />
		</IconButton>)

	public getActions = () =>
	[
		{ Button: this.getSearchButton }
	]

	public renderFooterContent = () => {
		return (
			<FooterWrapper>
				{
					this.state.addMode ?
					<>
						<TextField
							label="Add new viewport"
							margin="normal"
						/>
						<IconButton aria-label="Add view" onClick={this.handleSave}>
							<SaveIcon color="secondary" />
						</IconButton>
					</> :
					<>
						<ViewsCountInfo>
							{this.state.viewpoints.length ? `${this.state.viewpoints.length} views displayed` : 'Add new viewpoint'}
						</ViewsCountInfo>
						<IconButton aria-label="Add view" onClick={this.handleAddViewpoint}>
							<AddCircleIcon color="secondary" />
						</IconButton>
					</>
				}

			</FooterWrapper>
		);
	}

	public renderViewpoints = () => {
		return (
			<ViewpointsList>
				{ this.state.viewpoints.map(
						(viewpoint, index) => {
							console.log('Render viewpoints', viewpoint);
							return (
								<ViewpointItem key={index}>
									{ viewpoint.screenshot.thumbnailUrl
										? <Thumbnail src={viewpoint.screenshot.thumbnailUrl} alt={viewpoint.name} />
										: <ThumbnailPlaceholder />}
									<Name>{viewpoint.name}</Name>
								</ViewpointItem>
							);
						}
					)
				}
			</ViewpointsList>);
	}

	public render() {
		return (
			<ViewerCard
				title="Views"
				Icon={this.getTitleIcon()}
				actions={this.getActions()}
				renderFooterContent={this.renderFooterContent}
				isPadding={false}
				pending={this.props.isPending}
			>
				{!this.state.viewpoints.length
					? <EmptyStateInfo>No viewpoints have been created yet</EmptyStateInfo>
					: this.renderViewpoints()}
			</ViewerCard>
		);
	}
}
