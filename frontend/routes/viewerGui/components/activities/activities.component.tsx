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

import React from 'react';

import ActivitiesIcon from '@material-ui/icons/Movie';
import { isEqual } from 'lodash';

import { renderWhenTrue } from '../../../../helpers/rendering';
import { IViewpointsComponentState } from '../../../../modules/viewpoints/viewpoints.redux';
import { EmptyStateInfo } from '../../../components/components.styles';
import { PanelBarActions } from '../panelBarActions';
import { TaskItem } from '../sequences/components/tasksList/sequenceTaskItem.component';
import { SequenceTasksListItem } from '../sequences/sequences.styles';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { SearchField } from '../views/views.styles';
import { Container } from './activities.styles';

interface IProps {
	viewer: any;
	isPending: boolean;
	searchEnabled: boolean;
	searchQuery: string;
	fetchActivities: () => void;
	activities: any[];
	setComponentState: (componentState: IViewpointsComponentState) => void;
	showDetails: boolean;
	fetchDetails: (id: string) => void;
}

interface IState {
	filteredActivities: any[];
}

export class Activities extends React.PureComponent<IProps, IState> {

	public state = {
		filteredActivities: []
	};

	public componentDidMount() {
		const { activities, fetchActivities } = this.props;

		if (!activities.length) {
			fetchActivities();
		} else {
			this.setFilteredViewpoints();
		}
	}

	public componentDidUpdate(prevProps, prevState) {
		const { activities, searchQuery } = this.props;
		const viewpointsChanged = !isEqual(prevProps.activities, activities);
		const searchQueryChanged = prevProps.searchQuery !== searchQuery;

		if (searchQueryChanged || viewpointsChanged) {
			this.setFilteredViewpoints();
		}
	}

	private getTitleIcon = () => <ActivitiesIcon />;

	private handleCloseSearchMode = () => this.props.setComponentState({ searchEnabled: false, searchQuery: '' });

	private handleOpenSearchMode = () => this.props.setComponentState({ searchEnabled: true });

	private renderActions = () => (
		<PanelBarActions
			hideLock
			hideMenu
			isSearchEnabled={this.props.searchEnabled}
			onSearchOpen={this.handleOpenSearchMode}
			onSearchClose={this.handleCloseSearchMode}
		/>
	)

	public handleSearchQueryChange = (event) => {
		const searchQuery = event.currentTarget.value.toLowerCase();
		this.props.setComponentState({ searchQuery });
	}

	public setFilteredViewpoints = (onSave = () => {}) => {
		const { activities, searchQuery, searchEnabled } = this.props;
		const filteredActivities = searchEnabled ? activities.filter(({ name }) => {
			return name.toLowerCase().includes(searchQuery.toLowerCase());
		}) : activities;

		this.setState({ filteredActivities }, onSave);
	}

	public renderSearch = renderWhenTrue(() => (
		<SearchField
			placeholder="Search activities..."
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
		<EmptyStateInfo>No activities matched</EmptyStateInfo>
	));

	public renderListView = renderWhenTrue(() => (
		<Container>
			{this.state.filteredActivities.map((t) => (
				<SequenceTasksListItem key={t._id}>
					<TaskItem task={t} defaultCollapsed />
				</SequenceTasksListItem>
			))}
		</Container>
	));

	public render() {
		const { isPending, showDetails, searchEnabled } = this.props;

		return (
			<ViewerPanel
				title="Activities"
				Icon={this.getTitleIcon()}
				renderActions={this.renderActions}
				pending={isPending}
			>
				{this.renderSearch(searchEnabled && !showDetails)}
				{this.renderNotFound(searchEnabled && !showDetails && !this.state.filteredActivities.length)}
				{this.renderListView(!showDetails)}
			</ViewerPanel>
		);
	}
}
