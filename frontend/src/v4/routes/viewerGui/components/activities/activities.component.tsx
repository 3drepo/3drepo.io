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
import { PureComponent, ChangeEvent } from 'react';
import { debounce } from 'lodash';

import IconButton from '@mui/material/IconButton';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ActivitiesIcon from '@assets/icons/outlined/sequence_calendar-outlined.svg';
import { isEqual } from 'lodash';

import { renderWhenTrue, renderWhenTrueOtherwise } from '../../../../helpers/rendering';
import { IActivitiesComponentState } from '../../../../modules/activities/activities.redux';
import { EmptyStateInfo } from '../../../components/components.styles';
import { PanelBarActions } from '../panelBarActions';
import { TaskItem } from '../sequences/components/tasksList/sequenceTaskItem.component';
import { SequenceTasksListItem } from '../sequences/sequences.styles';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { SearchField } from '../views/views.styles';
import { Container } from './activities.styles';
import { ActivityDetails } from './components/activityDetails/';

interface IProps {
	viewer: any;
	isPending: boolean;
	searchEnabled: boolean;
	searchQuery: string;
	fetchActivities: () => void;
	activities: any[];
	tasks: any[];
	setComponentState: (componentState: IActivitiesComponentState) => void;
	showDetails: boolean;
	fetchDetails: (id: string) => void;
}

interface IState {
	listCollapsed: boolean;
}

export class Activities extends PureComponent<IProps, IState> {

	public state = {
		listCollapsed: true,
	};

	public componentDidUpdate(prevProps, prevState) {
		const { activities, searchQuery } = this.props;
		const { listCollapsed } = this.state;
		const activitiesChanged = !isEqual(prevProps.activities, activities);
		const searchQueryChanged = prevProps.searchQuery !== searchQuery;

		if (searchQueryChanged || activitiesChanged) {
			if (listCollapsed) {
				this.setState({
					listCollapsed: false,
				});
			}
		}

		if (!searchQuery && !listCollapsed) {
			this.setState({
				listCollapsed: true,
			});
		}
	}

	public componentWillUnmount() {
		this.props.setComponentState({
			showDetails: false,
			searchEnabled: false,
			searchQuery: '',
		});
	}

	private handleBackArrowClick = () => this.props.setComponentState({ showDetails: false });

	public renderTitleIcon = () => {
		if (this.props.showDetails) {
			return (
                <IconButton onClick={this.handleBackArrowClick} size="large">
					<ArrowBack />
				</IconButton>
            );
		}

		return <ActivitiesIcon />;
	}

	private handleCloseSearchMode = () => this.props.setComponentState({ searchEnabled: false, searchQuery: '' });

	private handleOpenSearchMode = () => this.props.setComponentState({ searchEnabled: true });

	private handleItemClick = (task) => this.props.fetchDetails(task.id);

	private renderActions = () => renderWhenTrue(() => (
		<PanelBarActions
			hideLock
			hideMenu
			isSearchEnabled={this.props.searchEnabled}
			onSearchOpen={this.handleOpenSearchMode}
			onSearchClose={this.handleCloseSearchMode}
		/>
	))(!this.props.showDetails);

	private debounceSearchQueryChange = debounce((searchQuery) => {
		this.props.setComponentState({ searchQuery });
	}, 200);

	public handleSearchQueryChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
		const searchQuery = currentTarget.value.toLowerCase();
		this.debounceSearchQueryChange(searchQuery);
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

	public renderNotFound = renderWhenTrue(() => <EmptyStateInfo>No activities matched</EmptyStateInfo>);

	public renderDetailsView = renderWhenTrue(() => <ActivityDetails />);

	public renderListView = renderWhenTrue(() => (
		<Container>
			{this.props.activities.map((t) => (
				<SequenceTasksListItem key={t.id}>
					<TaskItem task={t} defaultCollapsed={this.state.listCollapsed} onItemClick={this.handleItemClick} />
				</SequenceTasksListItem>
			))}
		</Container>
	));

	public render() {
		const { isPending, showDetails, searchEnabled } = this.props;

		return (
			<ViewerPanel
				title="Activities"
				Icon={this.renderTitleIcon()}
				renderActions={() => this.renderActions()}
				pending={isPending && !showDetails}
			>
				{this.renderSearch(searchEnabled && !showDetails)}
				{this.renderNotFound(searchEnabled && !showDetails && !this.props.activities.length)}
				{this.renderListView(!showDetails)}
				{this.renderDetailsView(showDetails)}
			</ViewerPanel>
		);
	}
}
