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
import * as queryString from 'query-string';
// @ts-ignore
import * as fileDialog from 'file-dialog';

import { renderWhenTrue } from '../../../../helpers/rendering';
import {
	STATUSES,
	ISSUE_FILTERS,
	ISSUE_FILTER_RELATED_FIELDS,
	ISSUE_STATUSES,
	ISSUE_PRIORITIES,
	ISSUES_ACTIONS_MENU
} from '../../../../constants/issues';
import IssueDetails from './components/issueDetails/issueDetails.container';
import { IssuesContainer } from './issues.styles';

interface IProps {
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
	issueDetails?: any;
	isImportingBCF?: boolean;
	searchEnabled: boolean;
	showSubmodelIssues?: boolean;
	selectedFilters: any[];
	modelSettings: {
		permissions: any[];
		properties: {
			topicTypes: any[];
		}
	};
	activeIssueDetails: any;
	sortOrder: string;
	fetchIssues: (teamspace, model, revision) => void;
	setState: (componentState: any) => void;
	setNewIssue: () => void;
	downloadIssues: (teamspace, model) => void;
	printIssues: (teamspace, model) => void;
	setActiveIssue: (issue, revision?) => void;
	showIssueDetails: (teamspace, model, revision, issue) => void;
	closeDetails: (teamspace, model, revision) => void;
	toggleSubmodelsIssues: (showSubmodelIssues: boolean) => void;
	subscribeOnIssueChanges: (teamspace, modelId) => void;
	unsubscribeOnIssueChanges: (teamspace, modelId) => void;
	importBCF: (teamspace, modelId, file, revision) => void;
	exportBCF: (teamspace, modelId) => void;
	toggleSortOrder: () => void;
	setFilters: (filters) => void;
	renderPins: () => void;
}

const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};

export class Issues extends React.PureComponent<IProps, any> {
	get jobsList() {
		return [...this.props.jobs, UNASSIGNED_JOB];
	}

	get filtersValuesMap() {
		return {
			[ISSUE_FILTER_RELATED_FIELDS.STATUS]: this.getFilterValues(ISSUE_STATUSES),
			[ISSUE_FILTER_RELATED_FIELDS.CREATED_BY]: this.getFilterValues(this.props.jobs),
			[ISSUE_FILTER_RELATED_FIELDS.ASSIGNED_TO]: this.getFilterValues(this.jobsList),
			[ISSUE_FILTER_RELATED_FIELDS.PRIORITY]: this.getFilterValues(ISSUE_PRIORITIES),
			[ISSUE_FILTER_RELATED_FIELDS.TYPE]: this.getFilterValues(this.props.topicTypes),
			[ISSUE_FILTER_RELATED_FIELDS.CREATED_DATE]: [{
				label: 'From',
				value: {
					label: 'From',
					value: 'from',
					date: null
				}
			}, {
				label: 'To',
				value: {
					label: 'To',
					value: 'to',
					date: null
				}
			}]
		};
	}

	get filters() {
		const filterValuesMap = this.filtersValuesMap;
		return ISSUE_FILTERS.map((issueFilter) => {
			issueFilter.values = filterValuesMap[issueFilter.relatedField];
			return issueFilter;
		});
	}

	get headerMenuItems() {
		const {
			printIssues,
			downloadIssues,
			importBCF,
			exportBCF,
			teamspace,
			model,
			revision,
			showSubmodelIssues,
			toggleSubmodelsIssues
		} = this.props;

		return [{
			...ISSUES_ACTIONS_MENU.PRINT,
			onClick: () => printIssues(teamspace, model)
		}, , {
			...ISSUES_ACTIONS_MENU.IMPORT_BCF,
			onClick: () => {
				fileDialog({ accept: '.zip,.bcfzip,.bcf' }, (files) => {
					importBCF(teamspace, model, files[0], revision);
				});
			}
		}, {
			...ISSUES_ACTIONS_MENU.EXPORT_BCF,
			onClick: () => exportBCF(teamspace, model)
		}, {
			...ISSUES_ACTIONS_MENU.DOWNLOAD,
			onClick: () => downloadIssues(teamspace, model)
		}, {
			...ISSUES_ACTIONS_MENU.SORT_BY_DATE,
			onClick: () => {
				this.props.toggleSortOrder();
			}
		}, {
			...ISSUES_ACTIONS_MENU.SHOW_SUBMODEL_ISSUES,
			enabled: showSubmodelIssues,
			onClick: () => toggleSubmodelsIssues(!showSubmodelIssues)
		}];
	}

	get showDefaultHiddenItems() {
		if (this.props.selectedFilters.length) {
			return this.props.selectedFilters
				.some(({ value: { value } }) => value === STATUSES.CLOSED);
		}
		return false;
	}

	public componentDidMount() {
		this.props.subscribeOnIssueChanges(this.props.teamspace, this.props.model);
	}

	public componentDidUpdate(prevProps) {
		const { issues, selectedFilters, activeIssueId, showDetails, revision, teamspace, model } = this.props;
		const filtersChanged = prevProps.selectedFilters.length !== selectedFilters.length;

		if (issues.length && !filtersChanged && location.search && !activeIssueId && !prevProps.showDetails && !showDetails) {
			const { issueId } = queryString.parse(location.search);
			if (issueId) {
				const foundIssue = issues.find((issue) => issue._id === issueId);

				if (foundIssue) {
					this.props.showIssueDetails(teamspace, model, revision, foundIssue);
				}
			}
		}
	}

	public componentWillUnmount() {
		this.props.unsubscribeOnIssueChanges(this.props.teamspace, this.props.model);
	}

	public setActiveIssue = (item) => {
		this.props.setActiveIssue(item, this.props.revision);
	}

	public showIssueDetails = (item) => {
		const { teamspace, model, revision } = this.props;
		this.props.showIssueDetails(teamspace, model, revision, item);
	}

	public closeIssueDetails = () => {
		const { teamspace, model, revision } = this.props;
		this.props.closeDetails(teamspace, model, revision);
		this.props.renderPins();
	}

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

	public renderDetailsView = renderWhenTrue(() => (
		<IssueDetails
			teamspace={this.props.teamspace}
			model={this.props.model}
			revision={this.props.revision}
		/>
	));

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
				onNewItem={this.props.setNewIssue}
				onShowDetails={this.showIssueDetails}
				onCloseDetails={this.closeIssueDetails}

				renderDetailsView={this.renderDetailsView}
			/>
		);
	}
}
