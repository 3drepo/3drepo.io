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
import ReportProblem from '@material-ui/icons/ReportProblem';
import ArrowBack from '@material-ui/icons/ArrowBack';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';
import RiskDetails from './components/riskDetails/riskDetails.container';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { PreviewListItem } from '../previewListItem/previewListItem.component';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ListContainer, Summary } from './risks.styles';
import { prepareRisk } from '../../../../helpers/risks';
import { ViewerPanelContent, ViewerPanelFooter, ViewerPanelButton } from '../viewerPanel/viewerPanel.styles';
import {
	RISK_FILTERS,
	RISK_MITIGATION_STATUSES,
	RISK_FILTER_RELATED_FIELDS
} from '../../../../constants/risks';
import { FilterPanel, DATA_TYPES } from '../../../components/filterPanel/filterPanel.component';

interface IProps {
	teamspace: string;
	model: any;
	risks: any[];
	jobs: any[];
	revision?: string;
	isPending?: boolean;
	activeRiskId?: string;
	showDetails?: boolean;
	riskDetails?: any;
	searchEnabled: boolean;
	selectedFilters: any[];
	fetchRisks: (teamspace, model, revision) => void;
	setState: (componentState: any) => void;
	setNewRisk: () => void;
}

interface IState {
	riskDetails?: any;
	filteredRisks: any[];
}

const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};

export class Risks extends React.PureComponent<IProps, IState> {
	public state = {
		filteredRisks: []
	};

	public renderRisksList = renderWhenTrue(() => {
		const Items = this.state.filteredRisks.map((risk, index) => (
			<PreviewListItem
				{...prepareRisk(risk, this.props.jobs)}
				key={index}
				onItemClick={this.handleRiskFocus(risk._id)}
				onArrowClick={this.handleRiskClick()}
				active={this.props.activeRiskId === risk._id}
			/>
		));

		return <ListContainer>{Items}</ListContainer>;
	});

	public renderListView = renderWhenTrue(() => (
		<>
			<ViewerPanelContent className="height-catcher">
				{this.renderRisksList(this.state.filteredRisks.length)}
			</ViewerPanelContent>
			<ViewerPanelFooter alignItems="center" justify="space-between">
				<Summary>{this.state.filteredRisks.length} risks displayed</Summary>
				<ViewerPanelButton
					aria-label="Add risk"
					onClick={this.handleAddNewRisk}
					color="secondary"
					variant="fab"
				>
					<AddIcon />
				</ViewerPanelButton>
			</ViewerPanelFooter>
		</>
	));

	public renderDetailsView = renderWhenTrue(() => (
		<RiskDetails
			teamspace={this.props.teamspace}
			model={this.props.model}
		/>
	));

	public componentDidMount() {
		const {teamspace, model, revision} = this.props;
		this.props.fetchRisks(teamspace, model, revision);
		this.setState({filteredRisks: this.filteredRisks});
	}

	public get filteredRisks() {
		const filteredRisks = this.props.risks.filter((risk) => {
			return this.props.selectedFilters.some((filter) => {
				if (filter.type === DATA_TYPES.UNDEFINED) {
					return risk[filter.relatedField] && risk[filter.relatedField].includes(filter.value.value) ||
						risk[filter.relatedField] === filter.value.value;
				} else if (filter.type === DATA_TYPES.QUERY) {
					return risk.name.toLowerCase().includes(filter.value.value.toLowerCase()) ||
						risk.desc.toLowerCase().includes(filter.value.value.toLowerCase());
				}
				return false;
			});
		});

		return this.props.selectedFilters.length ? filteredRisks : this.props.risks;
  }

	public componentDidUpdate(prevProps) {
		const { risks, selectedFilters } = this.props;
		const risksChanged = prevProps.risks.length !== risks.length;
		const filtersChanged = prevProps.selectedFilters.length !== selectedFilters.length;

		if (risksChanged || filtersChanged) {
			this.setState({filteredRisks: this.filteredRisks});
		}
	}

  public handleFilterChange = (selectedFilters) => {
	  this.props.setState({
      selectedFilters
    });
  }

	public renderFilterPanel = renderWhenTrue(() => (
		<FilterPanel
			onChange={this.handleFilterChange}
  		filters={this.filters as any}
			selectedFilters={this.props.selectedFilters}
		/>
	));

	get jobsList() {
		return [...this.props.jobs, UNASSIGNED_JOB];
	}

	public getFilterValues(property) {
		return property.map(({value, name}) => {
			return {
				label: name,
				value
			};
		});
	}

	public get filtersValuesMap() {
		return {
			[RISK_FILTER_RELATED_FIELDS.MITIGATION_STATUS]: this.getFilterValues(RISK_MITIGATION_STATUSES),
			[RISK_FILTER_RELATED_FIELDS.CREATED_BY]: this.getFilterValues(this.props.jobs),
			[RISK_FILTER_RELATED_FIELDS.ASSIGNED_ROLES]: this.getFilterValues(this.jobsList)
		};
	}

	public get filters() {
		return RISK_FILTERS.map((riskFilter) => {
			riskFilter.values = this.filtersValuesMap[riskFilter.relatedField];
			return riskFilter;
		});
	}

	public handleRiskFocus = (riskId) => () => {
		this.props.setState({ activeRisk: riskId, expandDetails: true });
	}

	public handleRiskClick = () => () => {
		this.toggleDetails(true);
	}

	public handleAddNewRisk = () => {
		this.props.setNewRisk();
	}

	public closeDetails = () => {
		this.toggleDetails(false);
	}

	public renderTitleIcon = () => {
		if (this.props.showDetails) {
			return (
				<IconButton onClick={this.closeDetails} >
					<ArrowBack />
				</IconButton>
			);
		}
		return <ReportProblem />;
	}

	public handleCloseSearchMode = () =>
		this.props.setState({
			searchEnabled: false
		})

	public handleOpenSearchMode = () =>
		this.props.setState({
			searchEnabled: true
		})

	public getSearchButton = () => {
		if (this.props.searchEnabled) {
			return <IconButton onClick={this.handleCloseSearchMode}><CancelIcon /></IconButton>;
		}
		return <IconButton onClick={this.handleOpenSearchMode}><SearchIcon /></IconButton>;
	}

	public renderActions = () => {
		return [{ Button: this.getSearchButton }];
	}

	public render() {
		return (
			<ViewerPanel
				title="SafetiBase"
				Icon={this.renderTitleIcon()}
				actions={this.renderActions()}
				pending={this.props.isPending}
			>
				{this.renderFilterPanel(this.props.searchEnabled)}
				{this.renderListView(!this.props.showDetails)}
				{this.renderDetailsView(this.props.showDetails)}
			</ViewerPanel>
		);
	}

	private toggleDetails = (showDetails) => {
		this.props.setState({ showDetails, activeRisk: null });
	}
}
