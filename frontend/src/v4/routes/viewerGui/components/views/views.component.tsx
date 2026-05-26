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
import { PureComponent, createRef, useContext } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { isEqual } from 'lodash';

import { CalibrationContext } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationContext';
import { SORT_ORDER_TYPES } from '../../../../constants/sorting';
import { VIEWER_EVENTS } from '../../../../constants/viewer';
import { VIEWER_PANELS } from '../../../../constants/viewerGui';
import { VIEWS_ACTIONS_ITEMS, VIEWS_ACTIONS_MENU } from '../../../../constants/views';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { IViewpointsComponentState } from '../../../../modules/viewpoints/viewpoints.redux';
import { Viewer } from '../../../../services/viewer/viewer';
import { EmptyStateInfo } from '../../../components/components.styles';
import {
	IconWrapper,
	MenuList, StyledItemText,
	StyledListItem
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { SortAmountDown, SortAmountUp } from '../../../components/fontAwesomeIcon';
import { PanelBarActions } from '../panelBarActions';
import { ViewerPanelButton, ViewerPanelFooter } from '../viewerPanel/viewerPanel.styles';
import { PresetViews } from './components/presetViews/presetViews.component';
import { ViewItem } from './components/viewItem/viewItem.component';
import {
	Container,
	SearchField,
	ViewerBottomActions,
	ViewpointsList,
	ViewsContainer,
	ViewsIcon
} from './views.styles';

interface IProps {
	isPending: boolean;
	isAdmin: boolean;
	viewpoints: any[];
	newViewpoint: any;
	activeViewpoint: any;
	searchEnabled: boolean;
	searchQuery: string;
	editMode: boolean;
	isCommenter: boolean;
	teamspace: string;
	model: string;
	project?: string;
	revision?: string;
	modelSettings: any;
	isCalibrating: boolean;
	calibrationStep: number;
	fetchViewpoints: (teamspace, modelId) => void;
	createViewpoint: (teamspace, modelId, view) => void;
	prepareNewViewpoint: (teamspace, modelId, viewName) => void;
	updateViewpoint: (teamspace, modelId, viewId, newName) => void;
	deleteViewpoint: (teamspace, modelId, viewId) => void;
	showViewpoint: (teamspace, modelId, view) => void;
	shareViewpointLink: (teamspace, modelId, viewId, project?, revision?) => void;
	setDefaultViewpoint: (teamspace, modelId, viewId) => void;
	clearDefaultViewpoint: (teamspace, modelId) => void;
	setActiveViewpoint: (teamspace, modelId, view) => void;
	subscribeOnViewpointChanges: (teamspace, modelId) => void;
	unsubscribeOnViewpointChanges: (teamspace, modelId) => void;
	setState: (componentState: IViewpointsComponentState) => void;
	fetchModelSettings: (teamspace: string, modelId: string) => void;
	showPreset: (preset: string) => void;
	id?: string;
	sortOrder?: string;
	toggleSortOrder: () => void;
}

class ViewsBase extends PureComponent<IProps, any> {
	public state = {
		filteredViewpoints: []
	};

	public containerRef = createRef<any>();

	get type() {
		return VIEWER_PANELS.VIEWS;
	}

	get menuActionsMap() {
		return {
			[VIEWS_ACTIONS_ITEMS.SORT_BY]: this.props.toggleSortOrder,
		};
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
			isCommenter={this.props.isCommenter}
			viewpoint={this.props.newViewpoint}
			active
			editMode
			onCancelEditMode={this.handleCancelEditMode}
			onSaveEdit={this.handleSave}
			teamspace={this.props.teamspace}
			modelId={this.props.model}
			onChangeName={this.handleNewViewpointChange}
		/>
	));

	public renderViewpoints = renderWhenTrue(() => {
		const { editMode, teamspace, model, activeViewpoint, project, revision } = this.props;
		const { filteredViewpoints } = this.state;

		const Viewpoints = filteredViewpoints.map((viewpoint) => {
			const isActive = Boolean(activeViewpoint && activeViewpoint._id === viewpoint._id);
			const viewpointData = isActive && editMode ? activeViewpoint : viewpoint;
			const { defaultView } = this.props.modelSettings;
			const isDefaultView = defaultView ? viewpoint._id === defaultView.id : false;
			return (
				<ViewItem
					key={viewpoint._id}
					viewpoint={viewpointData}
					onClick={this.handleViewpointItemClick(viewpoint)}
					isCommenter={this.props.isCommenter}
					active={isActive}
					editMode={editMode}
					onCancelEditMode={this.handleCancelEditMode}
					onOpenEditMode={this.handleOpenEditMode}
					onDelete={this.props.deleteViewpoint}
					onShare={this.props.shareViewpointLink}
					teamspace={teamspace}
					modelId={model}
					project={project}
					revision={revision}
					onSaveEdit={this.handleUpdate(viewpoint._id)}
					onChangeName={this.handleActiveViewpointChange}
					onSetDefault={this.props.setDefaultViewpoint}
					onClearDefault={this.props.clearDefaultViewpoint}
					isAdmin={this.props.isAdmin}
					defaultView={isDefaultView}
				/>
			);
		});

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
		const { viewpoints, fetchViewpoints, subscribeOnViewpointChanges, teamspace, model, isPending } = this.props;

		if (!viewpoints.length && !isPending) {
			fetchViewpoints(teamspace, model);
		} else {
			this.setFilteredViewpoints();
		}

		subscribeOnViewpointChanges(teamspace, model);
		this.toggleViewerEvents();
	}

	public componentDidUpdate(prevProps, prevState) {
		const { viewpoints, searchQuery, newViewpoint, activeViewpoint, modelSettings, model } = this.props;
		const viewpointsChanged = !isEqual(prevProps.viewpoints, viewpoints);
		const searchQueryChanged = prevProps.searchQuery !== searchQuery;

		if (modelSettings.model !== model) {
			this.props.fetchModelSettings(this.props.teamspace, model);
		}

		if (searchQueryChanged || viewpointsChanged) {
			this.setFilteredViewpoints(() => {
				if (!searchQuery && activeViewpoint) {
					const isSelectedViewpointVisible = prevState.filteredViewpoints.some(({ _id }) => {
						return _id === activeViewpoint;
					});

					if (!isSelectedViewpointVisible) {
						this.resetActiveView();
					}
				}

				if (newViewpoint) {
					const containerRef = this.containerRef.current.containerRef;
					this.resetActiveView();
					this.containerRef.current.containerRef?.scrollTo(0, containerRef.scrollHeight + 200);
				}
			});
		}
	}

	public componentWillUnmount() {
		const { teamspace, model } = this.props;
		this.props.unsubscribeOnViewpointChanges(teamspace, model);
		this.toggleViewerEvents(false);
	}

	public resetActiveView = () => {
		const { teamspace, model } = this.props;

		this.props.setState({ editMode: false });
		this.props.setActiveViewpoint(teamspace, model, null);
	}

	public handleActiveViewpointChange = (name) => {
		this.props.setState({ activeViewpoint: { ...this.props.activeViewpoint, name } });
	}

	public handleNewViewpointChange = (name) => {
		this.props.setState({ newViewpoint: { ...this.props.newViewpoint, name }});
	}

	public handleViewpointItemClick = (viewpoint) => () => {
		if (!this.props.editMode) {
			const { teamspace, model, isCalibrating, calibrationStep } = this.props;
			const vp = { ...viewpoint };
			if (isCalibrating && calibrationStep === 2) {
				delete vp.viewpoint.clippingPlanes;
				delete vp.clippingPlanes;
			}
			this.props.setActiveViewpoint(teamspace, model, vp);
		}
	}

	public toggleViewerEvents = (enabled = true) => {
		const eventHandler = enabled ? 'on' : 'off';
		Viewer[eventHandler](VIEWER_EVENTS.BACKGROUND_SELECTED, this.resetActiveView);
	}

	public handleUpdate = (viewpointId) => (values) => {
		const { teamspace, model, updateViewpoint } = this.props;
		updateViewpoint(teamspace, model, viewpointId, values.newName);
	}

	public handleSave = ({ newName }) => {
		const { teamspace, model, createViewpoint, newViewpoint } = this.props;
		newViewpoint.name = newName;
		createViewpoint(teamspace, model, newViewpoint);
	}

	public handleAddViewpoint = () => {
		const { teamspace, model, prepareNewViewpoint, viewpoints } = this.props;
		prepareNewViewpoint(teamspace, model, `View ${viewpoints.length + 1}`);
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

	public getTitleIcon = () => <ViewsIcon />;

	public renderFooterContent = () => (
		<ViewerPanelFooter container alignItems="center">
			<ViewerBottomActions>
				<PresetViews
					showPreset={this.props.showPreset}
				/>
			</ViewerBottomActions>
			<ViewerPanelButton
				aria-label="Add view"
				onClick={this.handleAddViewpoint}
				disabled={!!this.props.newViewpoint || !this.props.isCommenter}
				color="secondary"
				variant="fab"
				id={this.props.id + '-add-new-button'}
			>
				<AddIcon />
			</ViewerPanelButton>
		</ViewerPanelFooter>
	)

	public renderActionsMenu = () => (
		<MenuList>
			{VIEWS_ACTIONS_MENU.map(({ name, label, sortType }) => {
				const isAscending = this.props.sortOrder === SORT_ORDER_TYPES.ASCENDING;
				return (
					<StyledListItem key={name} onClick={this.menuActionsMap[name]}>
						<IconWrapper>
							{isAscending ? <SortAmountUp fontSize="small" /> : <SortAmountDown fontSize="small" />}
						</IconWrapper>
						<StyledItemText>
							{label}
						</StyledItemText>
					</StyledListItem>
				);
			})}
		</MenuList>
	)

	public renderActions = () => (
		<PanelBarActions
			type={this.type}
			menuLabel="Show views menu"
			menuActions={this.renderActionsMenu}
			isSearchEnabled={this.props.searchEnabled}
			onSearchOpen={this.handleOpenSearchMode}
			onSearchClose={this.handleCloseSearchMode}
		/>
	)

	public render() {
		const { searchEnabled, viewpoints, newViewpoint } = this.props;
		const hasViewpoints = Boolean(viewpoints.length);
		const { filteredViewpoints } = this.state;

		return (
			<ViewsContainer
				Icon={this.getTitleIcon()}
				renderActions={this.renderActions}
				pending={this.props.isPending}
				id={this.props.id}
			>
				<Container ref={this.containerRef}>
					{this.renderEmptyState(!hasViewpoints && !searchEnabled && !newViewpoint)}
					{this.renderSearch(searchEnabled)}
					{this.renderNotFound(searchEnabled && !filteredViewpoints.length)}
					{this.renderViewpoints(hasViewpoints || this.props.newViewpoint)}
				</Container>
				{this.renderFooterContent()}
			</ViewsContainer>
		);
	}
}

export const Views = (props: Omit<IProps, 'isCalibrating' | 'calibrationStep'>) => {
	const { isCalibrating, step } = useContext(CalibrationContext);
	return <ViewsBase {...props} isCalibrating={isCalibrating} calibrationStep={step} />
};
