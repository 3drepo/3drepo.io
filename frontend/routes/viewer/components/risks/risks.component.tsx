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
	LEVELS_OF_RISK,
	RISK_LEVELS
} from '../../../../constants/risks';

import { ReportedItems } from '../reportedItems';
import { IRisksComponentState } from '../../../../modules/risks/risks.redux';

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
	setState: (componentState: IRisksComponentState) => void;
	setNewRisk: () => void;
	downloadRisks: (teamspace, model) => void;
	printRisks: (teamspace, model) => void;
	setActiveRisk: (risk, revision?) => void;
	showRiskDetails: (teamspace, model, revision, risk) => void;
	closeDetails: () => void;
	toggleShowPins: (showPins: boolean) => void;
	subscribeOnRiskChanges: (teamspace, modelId) => void;
	unsubscribeOnRiskChanges: (teamspace, modelId) => void;
	saveRisk: (teamspace, modelId, risk) => void;
	setFilters: (filters) => void;
}

const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};

export class Risks extends React.PureComponent<IProps, any> {
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

	get showDefaultHiddenItems() {
		if (this.props.selectedFilters.length) {
			return this.props.selectedFilters
				.some(({ value: { value } }) => value === RISK_LEVELS.AGREED_FULLY);
		}
		return false;
	}

	public componentDidMount() {
		this.props.subscribeOnRiskChanges(this.props.teamspace, this.props.model);
	}

	public componentDidUpdate(prevProps) {
		const { risks, selectedFilters, activeRiskId, showDetails, teamspace, model, revision } = this.props;
		const filtersChanged = prevProps.selectedFilters.length !== selectedFilters.length;

		if (risks.length && !filtersChanged && location.search && !activeRiskId && !prevProps.showDetails && !showDetails) {
			const { riskId } = queryString.parse(location.search);
			if (riskId) {
				const foundRisk = risks.find((risk) => risk._id === riskId);

				if (foundRisk) {
					this.props.showRiskDetails(teamspace, model, revision, foundRisk);
				}
			}
		}
	}

	public componentWillUnmount() {
		this.props.unsubscribeOnRiskChanges(this.props.teamspace, this.props.model);
	}

	public setActiveRisk = (item) => {
		this.props.setActiveRisk(item, this.props.revision);
	}

	public showRiskDetails = (item) => {
		const { teamspace, model, revision } = this.props;
		this.props.showRiskDetails(teamspace, model, revision, item);
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

	public renderDetailsView = renderWhenTrue(() => (
		<RiskDetails
			teamspace={this.props.teamspace}
			model={this.props.model}
			saveRisk={this.props.saveRisk}
		/>
	));

	public render() {
		return (
			<ReportedItems
				title="SafetiBase"
				type="risk"
				Icon={ReportProblem}
				isPending={this.props.isPending}

				items={this.props.risks}
				showDefaultHiddenItems={this.showDefaultHiddenItems}
				activeItemId={this.props.activeRiskId}
				showDetails={this.props.showDetails}
				permissions={this.props.modelSettings.permissions}
				headerMenuItems={this.headerMenuItems}
				searchEnabled={this.props.searchEnabled}
				filters={this.filters}
				selectedFilters={this.props.selectedFilters}

				onToggleFilters={this.handleToggleFilters}
				onChangeFilters={this.props.setFilters}
				onActiveItem={this.setActiveRisk}
				onNewItem={this.props.setNewRisk}
				onShowDetails={this.showRiskDetails}
				onCloseDetails={this.props.closeDetails}

				renderDetailsView={this.renderDetailsView}
			/>
		);
	}
}
