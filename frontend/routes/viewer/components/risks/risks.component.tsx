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

import RiskDetails from './components/riskDetails/riskDetails.container';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { PreviewListItem } from '../previewListItem/previewListItem.component';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ListContainer, Summary } from './risks.styles';
import { prepareRisk } from '../../../../helpers/risks';
import { ViewerPanelContent, ViewerPanelFooter, ViewerPanelButton } from '../viewerPanel/viewerPanel.styles';
import { RISK_LEVELS_ICONS, RISK_LEVELS } from '../../../../constants/risks';

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
	fetchRisks: (teamspace, model, revision) => void;
	setState: (componentState: any) => void;
}

interface IState {
	riskDetails?: any;
}

export class Risks extends React.PureComponent<IProps, IState> {
	public renderRisksList = renderWhenTrue(() => {
		const Items = this.props.risks.map((risk, index) => (
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
				{this.renderRisksList(this.props.risks.length)}
			</ViewerPanelContent>
			<ViewerPanelFooter alignItems="center" justify="space-between">
				<Summary>{this.props.risks.length} risks displayed</Summary>
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
			{...this.props.riskDetails}
		/>
	));

	public componentDidMount() {
		const {teamspace, model, revision} = this.props;
		this.props.fetchRisks(teamspace, model, revision);
	}

	public handleRiskFocus = (riskId) => () => {
		this.props.setState({ activeRisk: riskId });
	}

	public handleRiskClick = () => () => {
		this.toggleDetails(true);
	}

	public handleAddNewRisk = () => {
		this.props.setState({
			showDetails: true,
			activeRisk: null,
			newRisk: {
				name: 'Untitled risk',
				StatusIconComponent: RISK_LEVELS_ICONS[RISK_LEVELS.UNMITIGATED],
				author: 'test'
			}
		});
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

	public renderActions = () => {
		return [];
	}

	public render() {
		return (
			<ViewerPanel
				title="SafetiBase"
				Icon={this.renderTitleIcon()}
				actions={this.renderActions()}
				pending={this.props.isPending}
			>
				{this.renderListView(!this.props.showDetails)}
				{this.renderDetailsView(this.props.showDetails)}
			</ViewerPanel>
		);
	}

	private toggleDetails = (showDetails) => {
		this.props.setState({ showDetails, activeRisk: null });
	}
}
