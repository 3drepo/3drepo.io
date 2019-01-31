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
import { isEqual } from 'lodash';

import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';
import AddIcon from '@material-ui/icons/Add';

import { renderWhenTrue } from '../../../../helpers/rendering';
import { getAngularService } from '../../../../helpers/migration';

import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ViewerPanelFooter, ViewerPanelButton } from '../viewerPanel/viewerPanel.styles';
import { ViewsCountInfo, ViewpointsList, EmptyStateInfo, SearchField, Container } from './views.styles';
import { ViewItem } from './components/viewItem/viewItem.component';

declare const Viewer: any;

interface IProps {
	isPending: boolean;
	viewpoints: any[];
	newViewpoint: any;
	activeViewpointId: number;
	searchEnabled: boolean;
	searchQuery: string;
	editMode: boolean;
	teamspace: string;
	modelId: string;
	fetchViewpoints: (teamspace, modelId) => void;
	createViewpoint: (teamspace, modelId, view) => void;
	prepareNewViewpoint: (teamspace, modelId, viewName) => void;
	updateViewpoint: (teamspace, modelId, viewId, newName) => void;
	deleteViewpoint: (teamspace, modelId, viewId) => void;
	showViewpoint: (teamspace, modelId, view) => void;
	subscribeOnViewpointChanges: (teamspace, modelId) => void;
	unsubscribeOnViewpointChanges: (teamspace, modelId) => void;
	setState: (componentState) => void;
}

export class Views extends React.PureComponent<IProps, any> {
	public state = {
		filteredViewpoints: []
	};

	public ViewerService = getAngularService('ViewerService', this) as any;

	public containerRef = React.createRef<any>();

	get footerText() {
		const { searchEnabled, viewpoints } = this.props;
		const { filteredViewpoints } = this.state;

		if (searchEnabled) {
			return `${filteredViewpoints.length} views found`;
		}
		return viewpoints.length ? `${viewpoints.length} views displayed` : 'Add new viewpoint';
	}

	public renderSearch = renderWhenTrue(() => (
		<SearchField
			placeholder="Search viewpoint..."
			onChange={this.handleSearchQueryChange}
			autoFocus
			defaultValue={this.props.searchQuery}
			fullWidth
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
			teamspace={this.props.teamspace}
			modelId={this.props.modelId}
		/>
	));

	public renderViewpoints = renderWhenTrue(() => {
		const { editMode, teamspace, modelId } = this.props;
		const { filteredViewpoints } = this.state;

		const { activeViewpointId } = this.props;
		const Viewpoints = filteredViewpoints.map((viewpoint) => (
			<ViewItem
				key={viewpoint._id}
				viewpoint={viewpoint}
				onClick={this.handleViewpointItemClick(viewpoint)}
				active={(activeViewpointId === viewpoint._id) as any}
				editMode={editMode}
				onCancelEditMode={this.handleCancelEditMode}
				onOpenEditMode={this.handleOpenEditMode}
				onDelete={this.handleDelete(viewpoint._id)}
				teamspace={teamspace}
				modelId={modelId}
				onSaveEdit={this.handleUpdate(viewpoint._id)}
			/>
		));

		return (
			<ViewpointsList>
				{Viewpoints}
				{this.renderNewViewpoint(this.props.newViewpoint)}
			</ViewpointsList>
		);
	});

	public renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No viewpoints have been created yet</EmptyStateInfo>
	));

	public componentDidMount() {
		const { viewpoints, fetchViewpoints, subscribeOnViewpointChanges, teamspace, modelId, isPending } = this.props;

		if (!viewpoints.length && !isPending) {
			fetchViewpoints(teamspace, modelId);
		} else {
			this.setFilteredViewpoints();
		}

		subscribeOnViewpointChanges(teamspace, modelId);
		this.toggleViewerEvents();
	}

	public componentDidUpdate(prevProps, prevState) {
		const { viewpoints, searchQuery, newViewpoint, setState, activeViewpointId } = this.props;
		const viewpointsChanged = !isEqual(prevProps.viewpoints, viewpoints);
		const searchQueryChanged = prevProps.searchQuery !== searchQuery;
		if (searchQueryChanged || viewpointsChanged) {
			this.setFilteredViewpoints(() => {
				if (!searchQuery && activeViewpointId) {
					const isSelectedViewpointVisible = prevState.filteredViewpoints.some(({ _id }) => {
						return _id === activeViewpointId;
					});

					if (!isSelectedViewpointVisible) {
						setState({ activeViewpointId: null, editMode: false });
					}
				}

				if (newViewpoint) {
					const containerRef = this.containerRef.current.containerRef;
					setState({ activeViewpointId: null, editMode: false });
					this.containerRef.current.containerRef.scrollTo(0, containerRef.scrollHeight + 200);
				}
			});
		}
	}

	public componentWillUnmount() {
		const { teamspace, modelId } = this.props;
		this.props.unsubscribeOnViewpointChanges(teamspace, modelId);
		this.toggleViewerEvents(false);
	}

	public handleViewpointItemClick = (viewpoint) => () => {
		if (!this.props.editMode) {
			const { teamspace, modelId } = this.props;
			this.props.showViewpoint(teamspace, modelId, viewpoint);
		}
	}

	public toggleViewerEvents = (enabled = true) => {
		const eventHandler = enabled ? 'on' : 'off';
		this.ViewerService[eventHandler](Viewer.EVENT.BACKGROUND_SELECTED, () => {
			this.props.setState({ activeViewpointId: null, editMode: false });
		});
	}

	public handleUpdate = (viewpointId) => (values) => {
		const { teamspace, modelId, updateViewpoint } = this.props;
		updateViewpoint(teamspace, modelId, viewpointId, values.newName);
	}

	public handleSave = ({ newName }) => {
		const { teamspace, modelId, createViewpoint, newViewpoint } = this.props;
		newViewpoint.name = newName;
		createViewpoint(teamspace, modelId, newViewpoint);
	}

	public handleAddViewpoint = () => {
		const { teamspace, modelId, prepareNewViewpoint, viewpoints } = this.props;
		prepareNewViewpoint(teamspace, modelId, `View ${viewpoints.length + 1}`);
	}

	public handleOpenEditMode = () => this.props.setState({ editMode: true });

	public handleCancelEditMode = () => {
		this.props.setState({
			editMode: false,
			newViewpoint: null
		});
	}

	public handleOpenSearchMode = () => this.props.setState({ searchEnabled: true });

	public handleCloseSearchMode = () =>
		this.props.setState({
			searchEnabled: false,
			searchQuery: ''
		})

	public handleDelete = (viewpointId) => (event) => {
		event.stopPropagation();
		const { teamspace, modelId } = this.props;
		this.props.deleteViewpoint(teamspace, modelId, viewpointId);
	}

	public handleSearchQueryChange = (event) => {
		const searchQuery = event.currentTarget.value.toLowerCase();
		this.props.setState({ searchQuery });
	}

	public setFilteredViewpoints = (onSave = () => {}) => {
		const { viewpoints, searchQuery, searchEnabled } = this.props;
		const filteredViewpoints = searchEnabled ? viewpoints.filter(({ name }) => {
			return name.toLowerCase().includes(searchQuery.toLowerCase());
		}) : viewpoints;

		this.setState({ filteredViewpoints }, onSave);
	}

	public getTitleIcon = () => <PhotoCameraIcon />;

	public getActions = () => [{ Button: this.getSearchButton }];

	public getSearchButton = () => {
		if (this.props.searchEnabled) {
			return <IconButton onClick={this.handleCloseSearchMode}><CancelIcon /></IconButton>;
		}
		return <IconButton onClick={this.handleOpenSearchMode}><SearchIcon /></IconButton>;
	}

	public renderFooterContent = () => (
		<ViewerPanelFooter alignItems="center">
			<ViewsCountInfo>{this.footerText}</ViewsCountInfo>
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
		const { searchEnabled, viewpoints, newViewpoint } = this.props;
		const hasViewpoints = Boolean(viewpoints.length);
		const { filteredViewpoints } = this.state;

		return (
			<ViewerPanel
				title="Views"
				Icon={this.getTitleIcon()}
				actions={this.getActions()}
				pending={this.props.isPending}
			>
				<Container className="height-catcher" innerRef={this.containerRef}>
					{this.renderEmptyState(!hasViewpoints && !searchEnabled && !newViewpoint)}
					{this.renderSearch(searchEnabled)}
					{this.renderNotFound(searchEnabled && !filteredViewpoints.length)}
					{this.renderViewpoints(hasViewpoints || this.props.newViewpoint)}
				</Container>
				{this.renderFooterContent()}
			</ViewerPanel>
		);
	}
}
