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
import { Formik, Form, Field } from 'formik';
import { ViewerCard } from '../viewerCard/viewerCard.component';
import { getDataFromPathname } from './../../viewer.helpers';

import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import {
	FooterWrapper,
	ViewsCountInfo,
	ViewpointsList,
	ViewpointItem,
	Thumbnail,
	ThumbnailPlaceholder,
	Name,
	EmptyStateInfo,
	NewItemWrapper,
	NewViewpointName,
	StyledSaveIcon,
	StyledCancelIcon,
	SearchField
} from './views.styles';

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
	addMode: boolean;
	editMode: boolean;
	searchMode: boolean;
	activeViewpointId: number;
}

export class Views extends React.PureComponent<IProps, IState> {
	public state = {
		viewpoints: [],
		addMode: false,
		editMode: false,
		searchMode: false,
		activeViewpointId: null
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
		const { viewpoints } = this.props;

		const changes = {} as any;

		if (viewpoints.length !== prevProps.viewpoints.length || viewpoints !== prevProps.viewpoints) {
			changes.viewpoints = viewpoints;
		}

		this.setState(changes);
	}

	public getTitleIcon = () => <PhotoCameraIcon />;

	public handleOpenSearchMode = () => {
		this.setState({
			searchMode: true
		});
	}

	public handleCloseSearchMode = () => {
		this.setState({
			searchMode: false
		});
	}

	public getSearchButton = () => {
		if (this.state.searchMode) {
			return (
				<IconButton onClick={this.handleCloseSearchMode}>
					<CancelIcon />
				</IconButton>
			);
		} else {
			return (
				<IconButton onClick={this.handleOpenSearchMode}>
					<SearchIcon />
				</IconButton>
			);
		}
	}

	public getActions = () =>
	[
		{ Button: this.getSearchButton }
	]

	public renderFooterContent = () => {
		return (
			<FooterWrapper>
				{
					<>
						<ViewsCountInfo>
							{this.state.viewpoints.length ? `${this.state.viewpoints.length} views displayed` : 'Add new viewpoint'}
						</ViewsCountInfo>

						<IconButton aria-label="Add view"
							onClick={this.handleAddMode} disabled={this.state.addMode || this.state.editMode}>
							<AddCircleIcon color="secondary" />
						</IconButton>
					</>
				}

			</FooterWrapper>
		);
	}

	public handleViewpointItemClick = (viewpoint) => {
		if (this.state.addMode || this.state.editMode) {
			return;
		}
		this.setState({
			activeViewpointId: viewpoint._id
		}, () => {
			const { teamspace, modelId } = getDataFromPathname(this.props.location.pathname);

			this.props.showViewpoint(teamspace, modelId, viewpoint);
		});
	}

	public handleAddMode = () => {
		this.setState({
			addMode: true,
			editMode: false
		});
	}

	public handleSaveAdd = (values) => {
		const { teamspace, modelId } = getDataFromPathname(this.props.location.pathname);
		this.props.createViewpoint(teamspace, modelId, values.name);
		this.handleCancelAddMode();
	}

	public handleSaveEdit = (values, viewpointId) => {
		const { teamspace, modelId } = getDataFromPathname(this.props.location.pathname);
		this.props.updateViewpoint(teamspace, modelId, viewpointId, values.newName);
		this.handleCancelEditMode();
	}

	public handleCancelAddMode = () => {
		this.setState({
			addMode: false
		});
	}

	public handleCancelEditMode = () => {
		this.setState({
			editMode: false
		});
	}

	public handleEditMode = () => {
		this.setState({
			editMode: true,
			addMode: false
		});
	}

	public handleDelete = (event, viewpointId) => {
		event.stopPropagation();
		const { teamspace, modelId } = getDataFromPathname(this.props.location.pathname);
		this.props.deleteViewpoint(teamspace, modelId, viewpointId);
	}

	public handleSearchChange = (event) => {
		this.setState({
			viewpoints: this.props.viewpoints.filter(
				(viewpoint) => viewpoint.name.toLowerCase().indexOf(event.currentTarget.value) !== -1
			)
		});
	}

	public renderViewpoints = () => {
		return (
			<>
				{this.state.searchMode && <SearchField placeholder="Search viewpoint..." onChange={this.handleSearchChange} />}
				{this.state.searchMode && !this.state.viewpoints.length && <EmptyStateInfo>No viewpoints matched</EmptyStateInfo>}
				<ViewpointsList>
					{ this.state.viewpoints.map(
							(viewpoint) => {
								return (
									<ViewpointItem
										key={viewpoint._id}
										onClick={() => this.handleViewpointItemClick(viewpoint)}
										active={this.state.activeViewpointId === viewpoint._id ? 1 : 0}>
										{ viewpoint.screenshot.thumbnailUrl
											? <Thumbnail src={viewpoint.screenshot.thumbnailUrl} alt={viewpoint.name} />
											: <ThumbnailPlaceholder />
										}
										{
											this.state.activeViewpointId === viewpoint._id
											? this.state.editMode
												?
													<Formik
														initialValues={{newName: viewpoint.name}}
														onSubmit={(values) => this.handleSaveEdit(values, viewpoint._id)}>
														<Form>
															<Field name="newName" render={ ({ field, form }) => (
																<NewViewpointName
																	{...field}
																	error={Boolean(form.errors.name)}
																	helperText={form.errors.name}
																	label="New name"
																/>
															)} />
															<StyledCancelIcon color="secondary" onClick={this.handleCancelEditMode} />
															<IconButton type="submit" disableRipple>
																<StyledSaveIcon color="secondary"/>
															</IconButton>
														</Form>
													</Formik>
												: <>
														<Name>{viewpoint.name}</Name>
														{
															!this.state.addMode &&
															<>
																<EditIcon color="secondary" onClick={this.handleEditMode} />
																<DeleteIcon color="secondary" onClick={(event) => this.handleDelete(event, viewpoint._id)} />
															</>
														}

													</>
											:	<Name>{viewpoint.name}</Name>
										}
									</ViewpointItem>
								);
							}
						)
					}
				</ViewpointsList>
			</>
		);
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
				{!this.state.viewpoints.length && !this.state.searchMode
					? <EmptyStateInfo>No viewpoints have been created yet</EmptyStateInfo>
					: this.renderViewpoints()}

				{this.state.addMode &&
				<>
					<ViewpointItem button={false}>
						<ThumbnailPlaceholder />
						<NewItemWrapper>
							<Formik initialValues={{name: ''}} onSubmit={this.handleSaveAdd}>
								<Form>
									<Field name="name" render={ ({ field, form }) => (
										<NewViewpointName
											{...field}
											error={Boolean(form.errors.name)}
											helperText={form.errors.name}
											label="Name"
										/>
									)} />
									<StyledCancelIcon color="secondary" onClick={this.handleCancelAddMode} />
									<IconButton type="submit">
										<StyledSaveIcon color="secondary"/>
									</IconButton>
								</Form>
							</Formik>
						</NewItemWrapper>
					</ViewpointItem>
				</>
				}
			</ViewerCard>
		);
	}
}
