import { sortBy } from 'lodash';
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

import {
	ISSUE_DEFAULT_HIDDEN_STATUSES,
	ISSUE_FILTERS,
	ISSUES_ACTIONS_MENU,
} from '../../../../constants/issues';
import { VIEWER_PANELS } from '../../../../constants/viewerGui';
import { filtersValuesMap, getHeaderMenuItems } from '../../../../helpers/issues';
import { renderWhenTrue } from '../../../../helpers/rendering';
import IssueDetails from './components/issueDetails/issueDetails.container';
import { IssuesContainer } from './issues.styles';

interface IProps {
	selectedIssue: any;
	history: any;
	location: any;
	topicTypes: any[];
	teamspace: string;
	model: any;
	issues: any[];
	jobs: any[];
	revision?: string;
	isPending?: boolean;
	fetchingDetailsIsPending?: boolean;
	activeIssueId?: string;
	showDetails?: boolean;
	showPins: boolean;
	sortByField: string;
	issueDetails?: any;
	isImportingBCF?: boolean;
	searchEnabled: boolean;
	showSubmodelIssues?: boolean;
	selectedFilters: any[];
	modelSettings: {
		permissions: any[];
		properties: {
			topicTypes: any[];
		},
		federate: boolean;
	};
	activeIssueDetails: any;
	sortOrder: string;
	fetchSettings: (teamspace) => void;
	fetchIssues: (teamspace, model, revision) => void;
	setState: (componentState: any) => void;
	setNewIssue: () => void;
	downloadItems: (teamspace, model) => void;
	printItems: (teamspace, model) => void;
	setActiveIssue: (issue, revision?) => void;
	showIssueDetails: (revision, issueId ) => void;
	goToIssue: (issue) => void;
	closeDetails: () => void;
	toggleShowPins: (showPins: boolean) => void;
	toggleSubmodelsIssues: (showSubmodelIssues: boolean) => void;
	importBCF: (teamspace, modelId, file, revision) => void;
	exportBCF: (teamspace, modelId) => void;
	toggleSortOrder: () => void;
	setFilters: (filters) => void;
	setSortBy: (field) => void;
	id?: string;
}

export class Issues extends React.PureComponent<IProps, any> {
	get filters() {
		const filterValuesMap = filtersValuesMap(this.props.jobs, this.props.topicTypes);
		return ISSUE_FILTERS.map((issueFilter) => {
			issueFilter.values = filterValuesMap[issueFilter.relatedField];
			return issueFilter;
		});
	}

	get toggleSubmodelsMenuItem() {
		const {
			showSubmodelIssues,
			toggleSubmodelsIssues
		} = this.props;

		return {
			...ISSUES_ACTIONS_MENU.SHOW_SUBMODEL_ISSUES,
			enabled: showSubmodelIssues,
			onClick: () => toggleSubmodelsIssues(!showSubmodelIssues)
		};
	}

	get headerMenuItems() {
		return getHeaderMenuItems(this.props);
		/* NOTE: We no longer supper submodel issues in federation.
		 * return !this.props.modelSettings.federate ?
			this.commonHeaderMenuItems :
			[...this.commonHeaderMenuItems, this.toggleSubmodelsMenuItem];*/
	}

	get showDefaultHiddenItems() {
		if (this.props.selectedFilters.length) {
			return this.props.selectedFilters
				.some(({ value: { value } }) => ISSUE_DEFAULT_HIDDEN_STATUSES.includes(value));
		}
		return false;
	}

	public renderDetailsView = renderWhenTrue(() => (
		<IssueDetails
			teamspace={this.props.teamspace}
			model={this.props.model}
			revision={this.props.revision}
		/>
	));

	public componentDidMount() {
		this.props.fetchSettings(this.props.teamspace); // This is to fetch topic_types
		this.handleSelectedIssue();
	}

	public componentDidUpdate(prevProps: IProps) {
		const { selectedIssue } = this.props;
		const issueId = (selectedIssue || {})._id;
		const prevIssueId = (prevProps.selectedIssue || {})._id;

		if (issueId !== prevIssueId) {
			this.handleSelectedIssue();
		}

	}

	public componentWillUnmount() {
	}

	public setActiveIssue = (item) => {
		this.props.setActiveIssue(item, this.props.revision);
	}

	public deactivateIssue = () => this.setActiveIssue(null);

	public getFilterValues(property) {
		return property.map(({ value, name, label }) => {
			return {
				label: name || label,
				value
			};
		});
	}

	public handleToggleFilters = (searchEnabled) => {
		const changes: any = { searchEnabled };

		if (!searchEnabled) {
			changes.selectedFilters = [];
		}
		this.props.setState(changes);
	}

	public closeDetails = () => {
		if (this.props.selectedIssue) {
			this.props.goToIssue(null);
		} else {
			this.props.closeDetails();
		}
	}

	public handleSelectedIssue() {
		const { selectedIssue, revision } = this.props;
		if (selectedIssue) {
			this.props.showIssueDetails(revision, selectedIssue._id);
		} else {
			this.props.closeDetails();
		}
	}

	public render() {
		return (
			<IssuesContainer
				isPending={this.props.isPending}
				fetchingDetailsIsPending={this.props.fetchingDetailsIsPending}
				items={this.props.issues}
				showDefaultHiddenItems={this.showDefaultHiddenItems}
				activeItemId={this.props.activeIssueId}
				showDetails={this.props.showDetails}
				permissions={this.props.modelSettings.permissions}
				headerMenuItems={this.headerMenuItems}
				searchEnabled={this.props.searchEnabled}
				filters={this.filters}
				selectedFilters={this.props.selectedFilters}
				isImportingBCF={this.props.isImportingBCF}
				sortOrder={this.props.sortOrder}
				onToggleFilters={this.handleToggleFilters}
				onChangeFilters={this.props.setFilters}
				onActiveItem={this.setActiveIssue}
				onDeactivateItem={this.deactivateIssue}
				onNewItem={this.props.setNewIssue}
				onShowDetails={this.props.goToIssue}
				onCloseDetails={this.closeDetails}
				renderDetailsView={this.renderDetailsView}
				type={VIEWER_PANELS.ISSUES}
				sortByField={this.props.sortByField}
				id={this.props.id}
			/>
		);
	}
}
