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

interface IProps {
	teamspace: string;
	model: any;
	risks: any[];
	jobs: any[];
	revision?: string;
	isPending?: boolean;
	fetchRisks: (teamspace, model, revision) => void;
}

interface IState {
	activeRisk?: number;
	openedRisk?: boolean;
}

export class Risks extends React.PureComponent<IProps, IState> {
	public state: IState = {};

	public renderRisksList = renderWhenTrue(() => {
		const Items = this.props.risks.map((risk, index) => (
			<PreviewListItem key={index} {...risk} />
		));

		return <>{Items}</>;
	});

	public componentDidMount() {
		const {teamspace, model, revision} = this.props;
		this.props.fetchRisks(teamspace, model, revision);
	}

	public toggleSettings = () => {

	}

	public renderTitleIcon = () => {
		if (this.state.openedRisk) {
			return (
				<IconButton onClick={this.toggleSettings} >
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
