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
import { isEqual } from 'lodash';
import AddIcon from '@material-ui/icons/Add';

import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { LogList } from '../../../../../components/logList/logList.component';

import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { prepareRisk } from '../../../../../../helpers/risks';
import { NewCommentForm } from '../../../newCommentForm/newCommentForm.component';
import { ViewerPanelContent, ViewerPanelFooter, ViewerPanelButton } from '../../../viewerPanel/viewerPanel.styles';

import { Container } from './riskDetails.styles';
import { RiskDetailsForm } from './riskDetailsForm.component';

interface IProps {
	jobs: any[];
	risk: any;
}

interface IState {
	risk: any;
	logs: any[];
}

export class RiskDetails extends React.PureComponent<IProps, IState> {
	public state = {
		risk: {} as any,
		logs: []
	};

	public setPreparedRisk = () => {
		const risk = prepareRisk(this.props.risk, this.props.jobs);
		const logs = this.props.risk.comments || [{
			comment: 'Sample comment',
			viewpoint: [],
			created: Date.now(),
			owner: 'charence',
			action: null,
			companyName: 'charence',
			userName: 'charence',
			teamspace: 'charence'
		}];

		this.setState({ risk, logs });
	}

	public componentDidMount() {
		this.setPreparedRisk();
	}

	public componentDidUpdate(prevProps) {
		const riskDataChanged = !isEqual(this.props.risk, prevProps.risk);
		if (riskDataChanged) {
			this.setPreparedRisk();
		}
	}

	public handleRiskSave = () => {

	}

	public handleNewScreenshot = () => {

	}

	public renderLogs = renderWhenTrue(() => <LogList items={this.state.logs} />);

	public renderFooter = () => (
		<ViewerPanelFooter alignItems="center" justify="space-between">
			<div>
				<ViewerPanelButton
					aria-label="Take screenshot"
					onClick={this.handleNewScreenshot}
				>Screen</ViewerPanelButton>
				<ViewerPanelButton
					aria-label="Add pin"
					onClick={this.handleNewScreenshot}
				>Pin</ViewerPanelButton>
			</div>
			<ViewerPanelButton
				type="submit"
				aria-label="Add risk"
				onClick={this.handleRiskSave}
				color="secondary"
				variant="fab"
			>
				<AddIcon />
			</ViewerPanelButton>
		</ViewerPanelFooter>
	)

	public render() {
		const { risk, logs } = this.state;

		return (
			<Container>
				<ViewerPanelContent className="height-catcher">
					<PreviewDetails {...risk}>
						<RiskDetailsForm
							risk={this.state.risk}
							jobs={this.props.jobs}
							onSubmit={this.handleRiskSave}
						/>
					</PreviewDetails>
					{this.renderLogs(logs.length)}
				</ViewerPanelContent>
				{this.renderFooter()}
			</Container>
		);
	}
}
