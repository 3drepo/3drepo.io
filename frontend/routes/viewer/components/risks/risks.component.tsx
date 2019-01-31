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
import { map, isEqual, isEmpty } from 'lodash';

import ReportProblem from '@material-ui/icons/ReportProblem';
import ArrowBack from '@material-ui/icons/ArrowBack';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import CancelIcon from '@material-ui/icons/Cancel';
import MoreIcon from '@material-ui/icons/MoreVert';
import Check from '@material-ui/icons/Check';

import { hasPermissions } from '../../../../helpers/permissions';
import { ButtonMenu } from '../../../components/buttonMenu/buttonMenu.component';
import RiskDetails from './components/riskDetails/riskDetails.container';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { PreviewListItem } from '../previewListItem/previewListItem.component';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ListContainer, Summary } from './risks.styles';
import { ViewerPanelContent, ViewerPanelFooter, ViewerPanelButton } from '../viewerPanel/viewerPanel.styles';
import {
	RISK_FILTERS,
	RISK_MITIGATION_STATUSES,
	RISK_FILTER_RELATED_FIELDS,
	RISKS_ACTIONS_MENU,
	RISKS_ACTIONS_ITEMS,
	RISK_CONSEQUENCES,
	RISK_LIKELIHOODS,
	RISK_CATEGORIES,
	LEVELS_OF_RISK,
	RISK_LEVELS
} from '../../../../constants/risks';
import {
	MenuList,
	StyledListItem,
	StyledItemText,
	IconWrapper
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { FilterPanel } from '../../../components/filterPanel/filterPanel.component';
import { CREATE_ISSUE, VIEW_ISSUE } from '../../../../constants/issue-permissions';
import { searchByFilters } from '../../../../helpers/searching';
import { Viewer } from '../../../../services/viewer/viewer';
import { VIEWER_EVENTS } from '../../../../constants/viewer';
import { EmptyStateInfo } from '../views/views.styles';

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
	riskDetails?: any;
	searchEnabled: boolean;
	showPins: boolean;
	selectedFilters: any[];
	modelSettings: {
		permissions: any[];
	};
	fetchRisks: (teamspace, model, revision) => void;
	setState: (componentState: any) => void;
	setNewRisk: () => void;
	downloadRisks: (teamspace, model) => void;
	printRisks: (teamspace, model, risksIds) => void;
	setActiveRisk: (risk, filteredRisks, revision?) => void;
	showRiskDetails: (risk, filteredRisks, revision?) => void;
	closeDetails: () => void;
	toggleShowPins: (showPins: boolean, filteredRisks) => void;
	subscribeOnRiskChanges: (teamspace, modelId) => void;
	unsubscribeOnRiskChanges: (teamspace, modelId) => void;
	saveRisk: (teamspace, modelId, risk, filteredRisks) => void;
}

interface IState {
	riskDetails?: any;
	filteredRisks: any[];
	modelLoaded: boolean;
}

const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};

const MenuButton = ({ IconProps, Icon, ...props }) => (
  <IconButton
    {...props}
    aria-label="Show filters menu"
    aria-haspopup="true"
  >
    <MoreIcon {...IconProps} />
  </IconButton>
);

export class Risks extends React.PureComponent<IProps, IState> {
	public state = {
		riskDetails: {},
		filteredRisks: [],
		modelLoaded: false
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
		return RISK_FILTERS.map((riskFilter) => {
			riskFilter.values = this.filtersValuesMap[riskFilter.relatedField];
			return riskFilter;
		});
	}

	get menuActionsMap() {
		const { printRisks, downloadRisks, toggleShowPins, teamspace, model, showPins } = this.props;
		const { filteredRisks } = this.state;
		return {
			[RISKS_ACTIONS_ITEMS.PRINT]: () => {
				const risksIds = map(filteredRisks, '_id').join(',');
				printRisks(teamspace, model, risksIds);
			},
			[RISKS_ACTIONS_ITEMS.DOWNLOAD]: () => downloadRisks(teamspace, model),
			[RISKS_ACTIONS_ITEMS.SHOW_PINS]: () => toggleShowPins(!showPins, filteredRisks)
		};
	}

	get activeRiskIndex() {
		return this.state.filteredRisks.findIndex((risk) => risk._id === this.props.activeRiskId);
	}

	get filteredRisks() {
		const { risks, selectedFilters } = this.props;

		let returnHiddenRisk = false;
		if (selectedFilters.length) {
			returnHiddenRisk = selectedFilters
				.some(({ value: { value }}) => value === RISK_LEVELS.AGREED_FULLY);
		}

		return searchByFilters(risks, selectedFilters, returnHiddenRisk);
	}

	public componentDidMount() {
		this.props.subscribeOnRiskChanges(this.props.teamspace, this.props.model);
		this.toggleRiskPinEvent(true);
		this.setState({ filteredRisks: this.filteredRisks });

		if (Viewer.viewer.model && !this.state.modelLoaded) {
			this.setState({ modelLoaded: true });
		}

		Viewer.on(VIEWER_EVENTS.MODEL_LOADED, () => {
			this.setState({ modelLoaded: true });
		});
	}

	public componentDidUpdate(prevProps) {
		const { risks, selectedFilters, activeRiskId, showDetails } = this.props;
		const risksChanged = !isEqual(prevProps.risks, risks);
		const filtersChanged = prevProps.selectedFilters.length !== selectedFilters.length;
		const showDetailsChanged = showDetails !== prevProps.showDetails;

		const changes = {} as IState;

		if (risksChanged || filtersChanged) {
			changes.filteredRisks = this.filteredRisks;
		}

		if (!filtersChanged && location.search && !activeRiskId && (!showDetails && !showDetailsChanged)) {
			const { riskId } = queryString.parse(location.search);
			if (riskId) {
				const foundRisk = risks.find((risk) => risk._id === riskId);

				if (foundRisk) {
					this.handleShowRiskDetails(foundRisk, changes.filteredRisks)();
				}
			}
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public componentWillUnmount() {
		this.toggleRiskPinEvent(false);
		this.props.unsubscribeOnRiskChanges(this.props.teamspace, this.props.model);
		Viewer.off(VIEWER_EVENTS.MODEL_LOADED);
	}

	public toggleRiskPinEvent = (enabled: boolean) => {
		const resolver = enabled ? 'on' : 'off';
		Viewer[resolver](VIEWER_EVENTS.CLICK_PIN, this.handlePinClick);
	}

	public handlePinClick = ({ id }) => {
		const relatedRisk = this.state.filteredRisks.find((risk) => risk._id === id);

		if (relatedRisk) {
			this.handleShowRiskDetails(relatedRisk)();
		}
	}

	public hasPermission = (permission) => {
		const { modelSettings } = this.props;
		if (Boolean(modelSettings) && Boolean(modelSettings.permissions)) {
			return hasPermissions(permission, modelSettings.permissions);
		}
		return false;
	}

  public handleFilterChange = (selectedFilters) => {
	  this.props.setState({ selectedFilters });
  }

	public getFilterValues(property) {
		return property.map(({value, name}) => {
			return {
				label: name,
				value
			};
		});
	}

	public handleRiskFocus = (risk, filteredRisks?) => () => {
		this.props.setActiveRisk(risk, filteredRisks || this.state.filteredRisks, this.props.revision);
	}

	public handleShowRiskDetails = (risk, filteredRisks?) => () => {
		this.props.showRiskDetails(risk, filteredRisks || this.state.filteredRisks, this.props.revision);
	}

	public handleAddNewRisk = () => {
		this.props.setNewRisk();
	}

	public handleCloseSearchMode = () => {
		this.props.setState({ searchEnabled: false, selectedFilters: [] });
		this.setState({
			filteredRisks: this.props.risks
		});
	}

	public handleOpenSearchMode = () => this.props.setState({ searchEnabled: true });

	public handlePrevItem = () => {
		const index = this.activeRiskIndex;

		const prevIndex = index === 0 ? this.state.filteredRisks.length - 1 : index - 1;
		this.props.showRiskDetails(
			this.state.filteredRisks[prevIndex],
			this.state.filteredRisks
		);
	}

	public handleNextItem = () => {
		const index = this.activeRiskIndex;
		const lastIndex = this.state.filteredRisks.length - 1;
		const nextIndex = index === lastIndex ? 0 : index + 1;

		this.props.showRiskDetails(
			this.state.filteredRisks[nextIndex],
			this.state.filteredRisks
		);
	}

	public getMenuButton = () => (
		<ButtonMenu
			renderButton={MenuButton}
			renderContent={this.renderActionsMenu}
			PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
			PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
			ButtonProps={{ disabled: false }}
		/>
	)

	public getSearchButton = () => {
		if (this.props.searchEnabled) {
			return <IconButton onClick={this.handleCloseSearchMode}><CancelIcon /></IconButton>;
		}
		return <IconButton onClick={this.handleOpenSearchMode}><SearchIcon /></IconButton>;
	}

	public getPrevButton = () => {
		return <IconButton onClick={this.handlePrevItem}><SkipPreviousIcon /></IconButton>;
	}

	public getNextButton = () => {
		return <IconButton onClick={this.handleNextItem}><SkipNextIcon /></IconButton>;
	}

	public renderRisksList = renderWhenTrue(() => {
		const Items = this.state.filteredRisks.map((risk, index) => (
			<PreviewListItem
				{...risk}
				key={index}
				onItemClick={this.handleRiskFocus(risk)}
				onArrowClick={this.handleShowRiskDetails(risk)}
				active={this.props.activeRiskId === risk._id}
				hasViewPermission={this.hasPermission(VIEW_ISSUE)}
				modelLoaded={this.state.modelLoaded}
			/>
		));

		return <ListContainer>{Items}</ListContainer>;
	});

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

	public renderListView = renderWhenTrue(() => (
		<>
			<ViewerPanelContent className="height-catcher">
				{this.renderEmptyState(!this.props.searchEnabled && !this.state.filteredRisks.length)}
				{this.renderNotFound(this.props.searchEnabled && !this.state.filteredRisks.length)}
				{this.renderRisksList(this.state.filteredRisks.length)}
			</ViewerPanelContent>
			<ViewerPanelFooter alignItems="center" justify="space-between">
				<Summary>
					{this.state.modelLoaded
						? `${this.state.filteredRisks.length} risks displayed` : `You can add an risk after model load`}
				</Summary>
				<ViewerPanelButton
					aria-label="Add risk"
					onClick={this.handleAddNewRisk}
					color="secondary"
					variant="fab"
					disabled={!this.hasPermission(CREATE_ISSUE) || !this.state.modelLoaded}
				>
					<AddIcon />
				</ViewerPanelButton>
			</ViewerPanelFooter>
		</>
	)
	);

	public renderTitleIcon = () => {
		if (this.props.showDetails) {
			return (
				<IconButton onClick={this.props.closeDetails} >
					<ArrowBack />
				</IconButton>
			);
		}
		return <ReportProblem />;
	}

	public renderFilterPanel = renderWhenTrue(() => (
		<FilterPanel
			onChange={this.handleFilterChange}
			filters={this.filters as any}
			selectedFilters={this.props.selectedFilters}
		/>
	));

	public renderActionsMenu = () => (
		<MenuList>
			{RISKS_ACTIONS_MENU.map(({ name, Icon, label }) => {
				return (
					<StyledListItem key={name} button onClick={this.menuActionsMap[name]}>
						<IconWrapper><Icon fontSize="small" /></IconWrapper>
						<StyledItemText>
							{label}
							{(name === RISKS_ACTIONS_ITEMS.SHOW_PINS && this.props.showPins) && <Check fontSize="small" />}
						</StyledItemText>
					</StyledListItem>
				);
			})}
		</MenuList>
	)

	public renderActions = () => {
		if (this.props.showDetails) {
			if (!this.props.activeRiskId || this.state.filteredRisks.length < 2) {
				return [];
			}
			return [{ Button: this.getPrevButton }, { Button: this.getNextButton }];
		}
		return [{ Button: this.getSearchButton }, { Button: this.getMenuButton }];
	}

	public renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No risks have been created yet</EmptyStateInfo>
	));

	public renderNotFound = renderWhenTrue(() => (
		<EmptyStateInfo>No risks matched</EmptyStateInfo>
	));

	public render() {
		return (
			<ViewerPanel
				title="SafetiBase"
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
}
