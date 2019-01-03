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
	fetchViewpoints: (teamspace, modelId) => void;
	createViewpoint: (teamspace, modelId, viewName) => void;
	updateViewpoint: (teamspace, modelId, viewId, newName) => void;
	deleteViewpoint: (teamspace, modelId, viewId) => void;
	subscribeOnViewpointChanges: (teamspace, modelId) => void;
	unsubscribeOnViewpointChanges: (teamspace, modelId) => void;
	showViewpoint: (teamspace, modelId, view) => void;
}

interface IState {
	viewpoints: any[];
	editMode: boolean;
	searchMode: boolean;
	addedNewItem: boolean;
	activeViewpointId: number;
	teamspace: string;
	modelId: string;
}

export class Views extends React.PureComponent<IProps, IState> {
	public state = {
		viewpoints: [],
		editMode: false,
		searchMode: false,
		addedNewItem: false,
		activeViewpointId: null,
		teamspace: '',
		modelId: ''
	};

	public listRef = React.createRef<any>();

	public renderSearch = renderWhenTrue(() => (
		<SearchField placeholder="Search viewpoint..." onChange={this.handleSearchChange} />
	));

	public renderNotFound = renderWhenTrue(() => (
		<EmptyStateInfo>No viewpoints matched</EmptyStateInfo>
	));

	public renderViewpoints = renderWhenTrue(() => {
		const { activeViewpointId, viewpoints } = this.state;
		return (
			<ViewpointsList innerRef={this.listRef}>
				{ viewpoints.map(
						(viewpoint) => {
							return (
								<ViewItem
									key={viewpoint._id}
									viewpoint={viewpoint}
									handleClick={this.handleViewpointItemClick(viewpoint)}
									active={Number(activeViewpointId === viewpoint._id) as any}
									editMode={this.state.editMode}
									onCancelEditMode={this.handleCancelEditMode}
									onOpenEditMode={this.handleOpenEditMode}
									updateViewpoint={this.props.updateViewpoint}
									deleteViewpoint={this.props.deleteViewpoint}
									teamspace={this.state.teamspace}
									modelId={this.state.modelId}
								/>
							);
						}
					)
				}
			</ViewpointsList>
		);
	});

	public renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No viewpoints have been created yet</EmptyStateInfo>
	));

	public componentDidMount() {
		const { teamspace, modelId } = getDataFromPathname(this.props.location.pathname);
		this.props.fetchViewpoints(teamspace, modelId);
		this.props.subscribeOnViewpointChanges(teamspace, modelId);
		this.setState({ teamspace, modelId });
	}

	public componentWillUnmount() {
		const { teamspace, modelId } = this.state;
		this.props.unsubscribeOnViewpointChanges(teamspace, modelId);
	}

	public componentDidUpdate(prevProps) {
		const { viewpoints } = this.props;
		const changes = {} as any;

		if (viewpoints.length !== prevProps.viewpoints.length || viewpoints !== prevProps.viewpoints) {
			changes.viewpoints = viewpoints;
			if (this.state.addedNewItem && viewpoints.length > prevProps.viewpoints.length) {
				changes.activeViewpointId = viewpoints[viewpoints.length - 1]._id;
				const listRef = this.listRef.current.listRef;
				this.setState({ editMode: true }, () => this.listRef.current.listRef.scrollTo(0, listRef.scrollHeight + 200));
			}
		}
		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public handleViewpointItemClick = (viewpoint) => (event) => {
		if (!this.state.editMode) {
			this.setState({
				activeViewpointId: viewpoint._id
			}, () => {
				const { teamspace, modelId } = this.state;
				this.props.showViewpoint(teamspace, modelId, viewpoint);
			});
		}
	}

	public handleSaveEdit = (viewpointId) => (values) => {
		const { teamspace, modelId } = this.state;
		this.props.updateViewpoint(teamspace, modelId, viewpointId, values.newName);
		this.handleCancelEditMode();
	}

	public handleAddViewpoint = () => {
		const { teamspace, modelId } = this.state;
		this.props.createViewpoint(teamspace, modelId, `View ${this.props.viewpoints.length + 1}`);
		this.setState({ addedNewItem: true });
	}

	public handleOpenEditMode = () => this.setState({ editMode: true });

	public handleCancelEditMode = () => this.setState({ editMode: false });

	public handleOpenSearchMode = () => this.setState({ searchMode: true });

	public handleCloseSearchMode = () => this.setState({ searchMode: false });

	public handleDelete = (event, viewpointId) => {
		event.stopPropagation();
		const { teamspace, modelId } = this.state;
		this.props.deleteViewpoint(teamspace, modelId, viewpointId);
	}

	public handleSearchChange = (event) => {
		this.setState({
			viewpoints: this.props.viewpoints.filter(
				(viewpoint) => viewpoint.name.toLowerCase().indexOf(event.currentTarget.value) !== -1
			)
		});
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
				disabled={this.state.editMode}
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
