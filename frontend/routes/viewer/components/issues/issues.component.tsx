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
import AddIcon from '@material-ui/icons/Add';
import PinDrop from '@material-ui/icons/PinDrop';
import ArrowBack from '@material-ui/icons/ArrowBack';

import { prepareIssue } from '../../../../helpers/issues';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { PreviewListItem } from '../../components/previewListItem/previewListItem.component';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ViewerPanelButton, ViewerPanelContent, ViewerPanelFooter } from '../viewerPanel/viewerPanel.styles';
import { ListContainer, Summary } from '../risks/risks.styles';
import IssueDetails from './components/issueDetails/issueDetails.container';
import { IconButton } from '@material-ui/core';
import { FilterPanel } from '../../../components/filterPanel/filterPanel.component';
import { searchByFilters } from '../../../../helpers/searching';

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
	fetchIssues: (teamspace, model, revision) => void;
	setState: (componentState: any) => void;
	setNewIssue: () => void;
	downloadIssues: (teamspace, model) => void;
	printIssues: (teamspace, model, risksIds) => void;
	setActiveIssue: (risk, filteredIssues, revision?) => void;
	showIssueDetails: (risk, filteredIssues, revision?) => void;
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

export class Issues extends React.PureComponent<IProps, IState> {
	public state: IState = {
		issueDetails: {},
		filteredIssues: [],
		modelLoaded: false
	};

	get filtersValuesMap() {
		return {};
	}

	get filters() {
		const filterValuesMap = this.filtersValuesMap;
		return [];
	}

	get menuActionsMap() {
		const { printIssues, downloadIssues, toggleShowPins, teamspace, model, showPins } = this.props;
		const { filteredIssues } = this.state;
		return {
			[RISKS_ACTIONS_ITEMS.PRINT]: () => {
				const risksIds = map(filteredIssues, '_id').join(',');
				printIssues(teamspace, model, risksIds);
			},
			[RISKS_ACTIONS_ITEMS.DOWNLOAD]: () => downloadIssues(teamspace, model),
			[RISKS_ACTIONS_ITEMS.SHOW_PINS]: () => toggleShowPins(!showPins, filteredIssues)
		};
	}

	get activeRiskIndex() {
		return this.state.filteredIssues.findIndex((risk) => risk._id === this.props.activeIssueId);
	}

	get filteredIssues() {
		const { issues, selectedFilters } = this.props;
		return searchByFilters(issues, selectedFilters);
	}

	public componentDidMount() {
		// this.props.subscribeOnIssueChanges(this.props.teamspace, this.props.model);
		this.setState({ filteredIssues: this.filteredIssues });
	}

	public componentDidUpdate(prevProps) {
		const { issues, selectedFilters, location, activeIssueId, showDetails } = this.props;
		const issuesChanged = !isEqual(prevProps.issues, issues);
		const filtersChanged = prevProps.selectedFilters.length !== selectedFilters.length;
		const showDetailsChanged = showDetails !== prevProps.showDetails;

		const changes = {} as IState;

		if (issuesChanged || filtersChanged) {
			changes.filteredIssues = this.filteredIssues;
		}

		if (!filtersChanged && location.search && !activeIssueId && (!showDetails && showDetailsChanged)) {
			const { riskId } = queryString.parse(location.search);
			if (riskId) {
				const foundRisk = issues.find((risk) => risk._id === riskId);

				if (foundRisk) {
					this.handleShowRiskDetails(foundRisk, changes.filteredIssues)();
				}
			}
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public componentWillUnmount() {
		// this.props.unsubscribeOnRiskChanges(this.props.teamspace, this.props.model);
	}

	public handleIssueFocus = (issueId) => () => {
		this.props.setState({ activeIssue: issueId });
	}

	public handleIssueClick = () => () => {
		this.toggleDetails(true);
	}

	public handleAddNewIssue = () => {
		this.toggleDetails(true);
	}

	public renderIssuesList = renderWhenTrue(() => {
		const Items = this.props.issues.map((issue, index) => (
			<PreviewListItem
				{...prepareIssue(issue, this.props.jobs)}
				key={index}
				onItemClick={this.handleIssueFocus(issue._id)}
				onArrowClick={this.handleIssueClick()}
				active={this.props.activeIssueId === issue._id}
			/>
		));

		return <ListContainer>{Items}</ListContainer>;
	});

	public renderListView = renderWhenTrue(() => (
		<>
			<ViewerPanelContent className="height-catcher">
				{this.renderIssuesList(Boolean(this.props.issues.length))}
			</ViewerPanelContent>
			<ViewerPanelFooter alignItems="center" justify="space-between">
				<Summary>{this.props.issues.length} issues displayed</Summary>
				<ViewerPanelButton
					aria-label="Add issue"
					onClick={this.handleAddNewIssue}
					color="secondary"
					variant="fab"
				>
					<AddIcon />
				</ViewerPanelButton>
			</ViewerPanelFooter>
		</>
	));

	public renderDetailsView = renderWhenTrue(() => (
		<IssueDetails {...this.props.issueDetails} />
	));

	public renderActions = () => {
		if (this.props.showDetails) {
			return [{ Button: this.getPrevButton }, { Button: this.getNextButton }];
		}
		return [{ Button: this.getSearchButton }, { Button: this.getMenuButton }];
	}

	public renderTitleIcon = () => {
		if (this.props.showDetails) {
			return (
				<IconButton onClick={this.props.closeDetails} >
					<ArrowBack />
				</IconButton>
			);
		}
		return <PinDrop />;
	}

	public renderFilterPanel = renderWhenTrue(() => (
		<FilterPanel
			onChange={this.handleFilterChange}
			filters={this.filters as any}
			selectedFilters={this.props.selectedFilters}
		/>
	));

	public render() {
		return (
			<ViewerPanel
				title="Issues"
				Icon={this.renderTitleIcon()}
				actions={this.renderActions()}
				pending={this.props.isPending}
			>
				{this.renderFilterPanel(this.props.searchEnabled && !this.props.showDetails)}
				{this.renderListView(!this.props.showDetails)}
				{this.renderDetailsView(this.props.showDetails)}
			</ViewerPanel>
		);
	}

	private toggleDetails = (showDetails) => {
		this.props.setState({ showDetails, activeIssue: null });
	}
}
