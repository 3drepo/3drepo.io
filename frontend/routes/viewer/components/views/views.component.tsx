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
import { isEmpty } from 'lodash';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { getDataFromPathname } from './../../viewer.helpers';

import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';
import AddIcon from '@material-ui/icons/Add';

import { ViewsCountInfo, ViewpointsList, EmptyStateInfo, SearchField, Container } from './views.styles';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { ViewerPanelFooter, ViewerPanelButton } from '../viewerPanel/viewerPanel.styles';

import { ViewItem } from './components/viewItem/viewItem.component';

interface IProps {
	isPending: boolean;
	location: any;
	viewpoints: any[];
	newViewpoint: any;
	fetchViewpoints: (teamspace, modelId) => void;
	createViewpoint: (teamspace, modelId, view) => void;
	prepareNewViewpoint: (teamspace, modelId, viewName) => void;
	updateViewpoint: (teamspace, modelId, viewId, newName) => void;
	deleteViewpoint: (teamspace, modelId, viewId) => void;
	subscribeOnViewpointChanges: (teamspace, modelId) => void;
	unsubscribeOnViewpointChanges: (teamspace, modelId) => void;
	showViewpoint: (teamspace, modelId, view) => void;
	setNewViewpoint: (view) => void;
}

interface IState {
	viewpoints: any[];
	editMode: boolean;
	searchMode: boolean;
	activeViewpointId: number;
	teamspace: string;
	modelId: string;
	searchQuery: string;
}

export class Views extends React.PureComponent<IProps, IState> {
	public state = {
		viewpoints: [],
		editMode: false,
		searchMode: false,
		activeViewpointId: null,
		teamspace: '',
		modelId: '',
		searchQuery: ''
	};

	public listRef = React.createRef<any>();

	public renderSearch = renderWhenTrue(() => (
		<SearchField
			placeholder="Search viewpoint..."
			onChange={this.handleSearchChange}
			autoFocus
			inputProps={{
				style: {
					padding: 12
				}
			}}
		/>
	));

	public renderNotFound = renderWhenTrue(() => (
		<EmptyStateInfo>No viewpoints matched</EmptyStateInfo>
	));

	public renderNewViewpoint = renderWhenTrue(() => (
		<ViewItem
			viewpoint={this.props.newViewpoint}
			active={true}
			editMode={true}
			onCancelEditMode={this.handleCancelEditMode}
			onSaveEdit={this.handleSave}
			teamspace={this.state.teamspace}
			modelId={this.state.modelId}
		/>
	));

	public renderViewpoints = renderWhenTrue(() => {
		const { activeViewpointId, viewpoints } = this.state;
		return (
			<ViewpointsList innerRef={this.listRef}>
				{ viewpoints.map((viewpoint) =>  (
						<ViewItem
							key={viewpoint._id}
							viewpoint={viewpoint}
							handleClick={this.handleViewpointItemClick(viewpoint)}
							active={(activeViewpointId === viewpoint._id) as any}
							editMode={this.state.editMode}
							onCancelEditMode={this.handleCancelEditMode}
							onOpenEditMode={this.handleOpenEditMode}
							onDelete={this.handleDelete(viewpoint._id)}
							teamspace={this.state.teamspace}
							modelId={this.state.modelId}
							onSaveEdit={this.handleUpdate(viewpoint._id)}
						/>
					))
				}
				{this.renderNewViewpoint(this.props.newViewpoint)}
			</ViewpointsList>
		);
	});

	public renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No viewpoints have been created yet</EmptyStateInfo>
	));

	public componentDidMount() {
		const { location, viewpoints, fetchViewpoints, subscribeOnViewpointChanges } = this.props;
		const { teamspace, modelId } = getDataFromPathname(location.pathname);
		const loadedViewpoints = Boolean(viewpoints.length);

		if (loadedViewpoints) {
			this.setState({ viewpoints });
		} else {
			fetchViewpoints(teamspace, modelId);
		}

		subscribeOnViewpointChanges(teamspace, modelId);
		this.setState({ teamspace, modelId });
	}

	public componentWillUnmount() {
		const { teamspace, modelId } = this.state;
		this.props.unsubscribeOnViewpointChanges(teamspace, modelId);
	}

	public componentDidUpdate(prevProps, prevState) {
		const { viewpoints } = this.props;
		const { searchQuery } = this.state;
		const changes = {} as any;
		const searchQueryChanged = prevState.searchQuery !== searchQuery;
		const viewpointsChanged = viewpoints.length !== prevProps.viewpoints.length || viewpoints !== prevProps.viewpoints;

		if (viewpointsChanged || searchQueryChanged) {
			changes.viewpoints = viewpoints.filter(
				(viewpoint) => viewpoint.name.toLowerCase().indexOf(searchQuery) !== -1
			);
		}
		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public handleViewpointItemClick = (viewpoint) => () => {
		if (!this.state.editMode) {
			this.setState({
				activeViewpointId: viewpoint._id
			}, () => {
				const { teamspace, modelId } = this.state;
				this.props.showViewpoint(teamspace, modelId, viewpoint);
			});
		}
	}

	public handleUpdate = (viewpointId) => (values) => {
		const { teamspace, modelId } = this.state;
		this.props.updateViewpoint(teamspace, modelId, viewpointId, values.newName);
		this.setState({ editMode: false });
	}

	public handleSave = () => {
		const { teamspace, modelId } = this.state;
		this.props.createViewpoint(teamspace, modelId, this.props.newViewpoint);
	}

	public handleAddViewpoint = () => {
		const { teamspace, modelId } = this.state;
		this.props.prepareNewViewpoint(teamspace, modelId, `View ${this.props.viewpoints.length + 1}`);
	}

	public handleOpenEditMode = () => this.setState({ editMode: true });

	public handleCancelEditMode = () => {
		if (this.props.newViewpoint) {
			this.props.setNewViewpoint(null);
		} else {
			this.setState({ editMode: false });
		}
	}

	public handleOpenSearchMode = () => this.setState({ searchMode: true });

	public handleCloseSearchMode = () =>
		this.setState({
			searchMode: false,
			viewpoints: this.props.viewpoints
		})

	public handleDelete = (viewpointId) => (event) => {
		event.stopPropagation();
		const { teamspace, modelId } = this.state;
		this.props.deleteViewpoint(teamspace, modelId, viewpointId);
	}

	public handleSearchChange = (event) => {
		const searchQuery = event.currentTarget.value.toLowerCase();
		this.setState({ searchQuery });
	}

	public getTitleIcon = () => <PhotoCameraIcon />;

	public getActions = () => [ { Button: this.getSearchButton } ];

	public getSearchButton = () => {
		if (this.state.searchMode) {
			return (
				<IconButton onClick={this.handleCloseSearchMode}><CancelIcon /></IconButton>
			);
		} else {
			return (
				<IconButton onClick={this.handleOpenSearchMode}><SearchIcon /></IconButton>
			);
		}
	}

	public renderFooterContent = () => (
		<ViewerPanelFooter alignItems="center">
			<ViewsCountInfo>
				{this.state.viewpoints.length ? `${this.state.viewpoints.length} views displayed` : 'Add new viewpoint'}
			</ViewsCountInfo>
			<ViewerPanelButton
				aria-label="Add view"
				onClick={this.handleAddViewpoint}
				disabled={!!this.props.newViewpoint}
				color="secondary"
				variant="fab"
			>
				<AddIcon />
			</ViewerPanelButton>
		</ViewerPanelFooter>
	)

	public render() {
		const { searchMode, viewpoints } = this.state;
		const hasViewpoints = Boolean(viewpoints.length);

		return (
			<ViewerPanel
				title="Views"
				Icon={this.getTitleIcon()}
				actions={this.getActions()}
				pending={this.props.isPending}
			>
				<Container className="height-catcher">
					{this.renderEmptyState(!hasViewpoints && !searchMode)}
					{this.renderSearch(searchMode)}
					{this.renderNotFound(searchMode && !viewpoints.length)}
					{this.renderViewpoints(hasViewpoints)}
					{this.renderFooterContent()}
				</Container>
			</ViewerPanel>
		);
	}
}
