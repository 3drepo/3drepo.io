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

import { map, isEqual } from 'lodash';
import PinDrop from '@material-ui/icons/PinDrop';

import IssueDetails from './components/issueDetails/issueDetails.container';

import { renderWhenTrue } from '../../../../helpers/rendering';
import { searchByFilters } from '../../../../helpers/searching';
import { ReportedItems } from '../reportedItems';
import { STATUSES } from '../../../../constants/issues';

interface IProps {
	history: any;
	location: any;
	teamspace: string;
	model: any;
	issues: any[];
	jobs: any[];
	revision?: string;
	isPending?: boolean;
	activeIssueId?: string;
	showDetails?: boolean;
	issueDetails?: any;
	searchEnabled: boolean;
	showPins: boolean;
	selectedFilters: any[];
	modelSettings: {
		permissions: any[];
	};
	activeIssueDetails: any;
	fetchIssues: (teamspace, model, revision) => void;
	setState: (componentState: any) => void;
	setNewIssue: () => void;
	downloadIssues: (teamspace, model) => void;
	printIssues: (teamspace, model, issuesIds) => void;
	setActiveIssue: (issue, filteredIssues, revision?) => void;
	showIssueDetails: (issue, filteredIssues, revision?) => void;
	closeDetails: () => void;
	toggleShowPins: (showPins: boolean, filteredIssues) => void;
	subscribeOnIssueChanges: (teamspace, modelId) => void;
	unsubscribeOnIssueChanges: (teamspace, modelId) => void;
}

interface IState {
	issueDetails?: any;
	filteredIssues: any[];
	modelLoaded: boolean;
}

const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};

export class Issues extends React.PureComponent<IProps, IState> {
	public state: IState = {
		issueDetails: {},
		filteredIssues: [],
		modelLoaded: false
	};

	get jobsList() {
		return [...this.props.jobs, UNASSIGNED_JOB];
	}

	get filters() {
		return [];
	}

	get headerMenuItems() {
		return [];
	}

	get showDefaultHiddenItems() {
		if (this.props.selectedFilters.length) {
			return this.props.selectedFilters
				.some(({ value: { value } }) => value === STATUSES.CLOSED);
		}
		return false;
	}

	public componentDidMount() {
		// this.props.subscribeOnRiskChanges(this.props.teamspace, this.props.model);
	}

	public componentDidUpdate(prevProps) {
		const { issues, selectedFilters, activeIssueId, showDetails, revision } = this.props;
		const filtersChanged = prevProps.selectedFilters.length !== selectedFilters.length;

		if (issues.length && !filtersChanged && location.search && !activeIssueId && !prevProps.showDetails && !showDetails) {
			const { issueId } = queryString.parse(location.search);
			if (issueId) {
				const foundRisk = issues.find((issue) => issue._id === issueId);

				if (foundRisk) {
					this.props.showIssueDetails(foundRisk, revision);
				}
			}
		}
	}

	public componentWillUnmount() {
		// this.props.unsubscribeOnIssueChanges(this.props.teamspace, this.props.model);
	}

	public handleFilterChange = (selectedFilters) => {
		this.props.setState({ selectedFilters });
	}

	public setActiveIssue = (item) => {
		this.props.setActiveIssue(item, this.props.revision);
	}

	public showIssueDetails = (item) => {
		this.props.showIssueDetails(item, this.props.revision);
	}

	public getFilterValues(property) {
		return property.map(({ value, name }) => {
			return {
				label: name,
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
		<IssueDetails teamspace={this.props.teamspace} model={this.props.model} />
	));

	public render() {
		return (
			<ReportedItems
				title="Issues"
				Icon={PinDrop}
				isPending={this.props.isPending}

				items={this.props.issues}
				showDefaultHiddenItems={this.showDefaultHiddenItems}
				activeItemId={this.props.activeIssueId}
				showDetails={this.props.showDetails}
				permissions={this.props.modelSettings.permissions}
				headerMenuItems={this.headerMenuItems}
				searchEnabled={this.props.searchEnabled}
				filters={this.filters}
				selectedFilters={this.props.selectedFilters}

				onToggleFilters={this.handleToggleFilters}
				onChangeFilters={this.handleFilterChange}
				onActiveItem={this.setActiveIssue}
				onNewItem={this.props.setNewIssue}
				onShowDetails={this.showIssueDetails}
				onCloseDetails={this.props.closeDetails}

				renderDetailsView={this.renderDetailsView}
			/>
		);
	}
}
