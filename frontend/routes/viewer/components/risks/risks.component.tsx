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

import IconButton from '@material-ui/core/IconButton';

import { renderWhenTrue } from '../../../../helpers/rendering';
import { PreviewListItem } from '../../../components/previewListItem/previewListItem.component';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { Container } from './risks.styles';
import { prepareRisk } from '../../../../helpers/risks';

interface IProps {
	teamspace: string;
	model: any;
	risks: any[];
	jobs: any[];
	revision?: string;
	isPending?: boolean;
	activeRisk?: string;
	showDetails?: boolean;
	fetchRisks: (teamspace, model, revision) => void;
	setActiveRisk: (riskId: string) => void;
	toggleDetails: (showDetails: boolean) => void;
}

interface IState {
	activeRisk?: number;
	showDetails?: boolean;
}

export class Risks extends React.PureComponent<IProps, IState> {
	public componentDidMount() {
		const {teamspace, model, revision} = this.props;
		this.props.fetchRisks(teamspace, model, revision);
	}

	public handleRiskFocus = (riskId) => () => {
		this.props.setActiveRisk(riskId);
	}

	public handleRiskClick = () => () => {
		this.props.toggleDetails(true);
	}

	public renderRisksList = renderWhenTrue(() => {
		const Items = this.props.risks.map((risk, index) => (
			<PreviewListItem
				{...prepareRisk(risk, this.props.jobs)}
				key={index}
				onItemClick={this.handleRiskFocus(risk._id)}
				onArrowClick={this.handleRiskClick()}
				active={this.props.activeRisk === risk._id}
			/>
		));

		return <>{Items}</>;
	});

	public closeDetails = () => {
		this.props.toggleDetails(false);
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
				{this.renderRisksList(true)}
			</ViewerPanel>
		);
	}
}
