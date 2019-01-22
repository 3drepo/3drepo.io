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

import ReportProblem from '@material-ui/icons/ReportProblem';

import RiskDetails from './components/riskDetails/riskDetails.container';
import { renderWhenTrue } from '../../../../helpers/rendering';
import {
	RISK_FILTERS,
	RISK_MITIGATION_STATUSES,
	RISK_FILTER_RELATED_FIELDS,
	RISKS_ACTIONS_MENU,
	RISK_CONSEQUENCES,
	RISK_LIKELIHOODS,
	RISK_CATEGORIES,
	LEVELS_OF_RISK
} from '../../../../constants/risks';

import { ReportedItems } from '../reportedItems';
import { prepareRisk } from '../../../../helpers/risks';

interface IProps {
	history: any;
	teamspace: string;
	model: any;
	risks: any[];
	jobs: any[];
	revision?: string;
	isPending?: boolean;
	activeRiskId?: string;
	showDetails?: boolean;
	searchEnabled: boolean;
	showPins: boolean;
	selectedFilters: any[];
	modelSettings: {
		permissions: any[];
	};
	fetchRisks: (teamspace, model, revision) => void;
	setState: (componentState: any) => void;
	setNewRisk: () => void;
	downloadRisks: (teamspace, model, risksIds) => void;
	printRisks: (teamspace, model) => void;
	setActiveRisk: (risk, revision?) => void;
	showRiskDetails: (risk, revision?) => void;
	closeDetails: () => void;
	toggleShowPins: (showPins: boolean) => void;
	subscribeOnRiskChanges: (teamspace, modelId) => void;
	unsubscribeOnRiskChanges: (teamspace, modelId) => void;
	saveRisk: (teamspace, modelId, risk, filteredRisks) => void;
	onFiltersChange: (selectedFilters) => void;
}

interface IState {
	risks: any[];
}

const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};

export class Risks extends React.PureComponent<IProps, IState> {
	public state = {
		filteredRisks: [],
		risks: []
	};

	get jobsList() {
		return [...this.props.jobs, UNASSIGNED_JOB];
	}

	get filtersValuesMap() {
		return {
			[RISK_FILTER_RELATED_FIELDS.CATEGORY]: this.getFilterValues(RISK_CATEGORIES),
			[RISK_FILTER_RELATED_FIELDS.MITIGATION_STATUS]: this.getFilterValues(RISK_MITIGATION_STATUSES),
			[RISK_FILTER_RELATED_FIELDS.CREATED_BY]: this.getFilterValues(this.props.jobs),
			[RISK_FILTER_RELATED_FIELDS.RISK_OWNER]: this.getFilterValues(this.jobsList),
			[RISK_FILTER_RELATED_FIELDS.RISK_CONSEQUENCE]: this.getFilterValues(RISK_CONSEQUENCES),
			[RISK_FILTER_RELATED_FIELDS.RISK_LIKELIHOOD]: this.getFilterValues(RISK_LIKELIHOODS),
			[RISK_FILTER_RELATED_FIELDS.LEVELS_OF_RISK]: this.getFilterValues(LEVELS_OF_RISK)
		};
	}

	get filters() {
		const filterValuesMap = this.filtersValuesMap;
		return RISK_FILTERS.map((riskFilter) => {
			riskFilter.values = filterValuesMap[riskFilter.relatedField];
			return riskFilter;
		});
	}

	get headerMenuItems() {
		const { printRisks, downloadRisks, toggleShowPins, teamspace, model, showPins } = this.props;

		return [{
			...RISKS_ACTIONS_MENU.PRINT,
			onClick: () => printRisks(teamspace, model)
		}, , {
			...RISKS_ACTIONS_MENU.SHOW_PINS,
			enabled: this.props.showPins,
			onClick: () => toggleShowPins(!showPins)
		}, {
			...RISKS_ACTIONS_MENU.DOWNLOAD,
			onClick: () => downloadRisks(teamspace, model)
		}];
	}

	public componentDidMount() {
		this.props.subscribeOnRiskChanges(this.props.teamspace, this.props.model);

		if (this.props.risks.length && this.props.jobs.length) {
			this.setPreparedRisks();
		}
	}

	public componentDidUpdate(prevProps) {
		const { risks, jobs, selectedFilters, activeRiskId, showDetails, revision } = this.props;
		const risksChanged = risks.length !== prevProps.risks.length;
		const jobsChanged = jobs.length !== prevProps.jobs.length;
		const filtersChanged = prevProps.selectedFilters.length !== selectedFilters.length;

		if (risksChanged || jobsChanged) {
			this.setPreparedRisks();
		}

		if (risks.length && !filtersChanged && location.search && !activeRiskId && !prevProps.showDetails && !showDetails) {
			const { riskId } = queryString.parse(location.search);
			if (riskId) {
				const foundRisk = risks.find((risk) => risk._id === riskId);

				if (foundRisk) {
					this.props.showRiskDetails(foundRisk, revision);
				}
			}
		}
	}

	public componentWillUnmount() {
		this.props.unsubscribeOnRiskChanges(this.props.teamspace, this.props.model);
	}

	public setPreparedRisks = () => {
		const risks = this.props.risks.map((risk) => prepareRisk(risk, this.props.jobs));
		this.setState({ risks });
	}

  public handleFilterChange = (selectedFilters) => {
		this.props.onFiltersChange(selectedFilters);
  }

	public setActiveRisk = (item) => {
		this.props.setActiveRisk(item, this.props.revision);
	}

	public showRiskDetails = (item) => {
		this.props.showRiskDetails(item, this.props.revision);
	}

	public getFilterValues(property) {
		return property.map(({value, name}) => {
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

	public handleSaveRisk = (teamspace, model, risk) => {
		this.props.saveRisk(teamspace, model, risk, this.state.filteredRisks);
	}

	public renderDetailsView = renderWhenTrue(() => (
		<RiskDetails
			teamspace={this.props.teamspace}
			model={this.props.model}
			saveRisk={this.handleSaveRisk}
		/>
	));

	public render() {
		return (
			<ReportedItems
				title="SafetiBase"
				type="risk"
				Icon={ReportProblem}
				isPending={this.props.isPending}

				items={this.state.risks}
				activeItemId={this.props.activeRiskId}
				showDetails={this.props.showDetails}
				permissions={this.props.modelSettings.permissions}
				headerMenuItems={this.headerMenuItems}
				searchEnabled={this.props.searchEnabled}
				filters={this.filters}
				selectedFilters={this.props.selectedFilters}

				onToggleFilters={this.handleToggleFilters}
				onChangeFilters={this.handleFilterChange}
				onActiveItem={this.setActiveRisk}
				onNewItem={this.props.setNewRisk}
				onShowDetails={this.showRiskDetails}
				onCloseDetails={this.props.closeDetails}

				renderDetailsView={this.renderDetailsView}
			/>
		);
	}
}
