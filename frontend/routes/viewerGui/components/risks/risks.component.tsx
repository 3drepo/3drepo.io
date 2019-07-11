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

import * as queryString from 'query-string';
import * as React from 'react';

import {
	LEVELS_OF_RISK,
	RISK_CATEGORIES,
	RISK_CONSEQUENCES,
	RISK_FILTER_RELATED_FIELDS,
	RISK_FILTERS,
	RISK_LEVELS,
	RISK_LIKELIHOODS,
	RISK_MITIGATION_STATUSES,
	RISKS_ACTIONS_MENU
} from '../../../../constants/risks';
import { renderWhenTrue } from '../../../../helpers/rendering';
import RiskDetails from './components/riskDetails/riskDetails.container';
import { RisksContainer } from './risks.styles';

interface IProps {
	history: any;
	location: any;
	teamspace: string;
	model: any;
	risks: any[];
	jobs: any[];
	revision?: string;
	isPending?: boolean;
	fetchingDetailsIsPending?: boolean;
	activeRiskId?: string;
	showDetails?: boolean;
	riskDetails?: any;
	searchEnabled: boolean;
	showPins: boolean;
	selectedFilters: any[];
	modelSettings: {
		permissions: any[];
	};
	activeRiskDetails: any;
	sortOrder: string;
	fetchRisks: (teamspace, model, revision) => void;
	setState: (componentState: any) => void;
	setNewRisk: () => void;
	downloadRisks: (teamspace, model) => void;
	printRisks: (teamspace, model) => void;
	setActiveRisk: (risk, revision?) => void;
	showRiskDetails: (teamspace, model, revision, risk) => void;
	closeDetails: (teamspace, model, revision) => void;
	toggleShowPins: (showPins: boolean) => void;
	subscribeOnRiskChanges: (teamspace, modelId) => void;
	unsubscribeOnRiskChanges: (teamspace, modelId) => void;
	saveRisk: (teamspace, modelId, risk) => void;
	toggleSortOrder: () => void;
	setFilters: (filters) => void;
	renderPins: () => void;
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
			[RISK_FILTER_RELATED_FIELDS.RESIDUAL_CONSEQUENCE]: this.getFilterValues(RISK_CONSEQUENCES),
			[RISK_FILTER_RELATED_FIELDS.RESIDUAL_LIKELIHOOD]: this.getFilterValues(RISK_LIKELIHOODS),
			[RISK_FILTER_RELATED_FIELDS.LEVEL_OF_RISK]: this.getFilterValues(LEVELS_OF_RISK),
			[RISK_FILTER_RELATED_FIELDS.RESIDUAL_LEVEL_OF_RISK]: this.getFilterValues(LEVELS_OF_RISK),
			[RISK_FILTER_RELATED_FIELDS.OVERALL_LEVEL_OF_RISK]: this.getFilterValues(LEVELS_OF_RISK)
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
		}, {
			...RISKS_ACTIONS_MENU.SORT_BY_DATE,
			onClick: () => {
				this.props.toggleSortOrder();
			}
		}];
	}

	get showDefaultHiddenItems() {
		if (this.props.selectedFilters.length) {
			return this.props.selectedFilters
				.some(({ value: { value } }) => value === RISK_LEVELS.AGREED_FULLY);
		}
		return false;
	}

	public renderDetailsView = renderWhenTrue(() => (
		<RiskDetails
			teamspace={this.props.teamspace}
			model={this.props.model}
			saveRisk={this.props.saveRisk}
		/>
	));

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

	public closeRiskDetails = () => {
		const { teamspace, model, revision } = this.props;
		this.props.closeDetails(teamspace, model, revision);
		this.props.renderPins();
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

	public render() {
		return (
			<RisksContainer
				type="risk"
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
				sortOrder={this.props.sortOrder}

				onToggleFilters={this.handleToggleFilters}
				onChangeFilters={this.props.setFilters}
				onActiveItem={this.setActiveRisk}
				onNewItem={this.props.setNewRisk}
				onShowDetails={this.showRiskDetails}
				onCloseDetails={this.closeRiskDetails}

				renderDetailsView={this.renderDetailsView}
			/>
		);
	}
}
