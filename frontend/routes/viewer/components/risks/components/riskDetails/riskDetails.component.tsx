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
import { isEqual, omit } from 'lodash';
import AddIcon from '@material-ui/icons/Add';

import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { LogList } from '../../../../../components/logList/logList.component';

import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { NewCommentForm } from '../../../newCommentForm/newCommentForm.component';
import { ViewerPanelContent, ViewerPanelFooter, ViewerPanelButton } from '../../../viewerPanel/viewerPanel.styles';

import { Container } from './riskDetails.styles';
import { RiskDetailsForm } from './riskDetailsForm.component';

interface IProps {
	jobs: any[];
	risk: any;
	newRisk: any;
	teamspace: string;
	model: string;
	expandDetails: boolean;
	saveRisk: (teamspace, modelId, risk) => void;
	updateRisk: (teamspace, modelId, risk) => void;
	setState: (componentState) => void;
}

interface IState {
	risk: any;
	logs: any[];
}

export class RiskDetails extends React.PureComponent<IProps, IState> {
	public state = {
		risk: {},
		logs: []
	};

	public setLogs = () => {
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

		this.setState({ logs });
	}

	public componentDidMount() {
		this.setLogs();
	}

	public componentDidUpdate(prevProps) {
		const logsChanged = !isEqual(this.props.risk.comments, prevProps.risk.comments);
		if (logsChanged) {
			this.setLogs();
		}
	}

	public handleExpandChange = () => {

	}

	public handleNameChange = (event, name) => {
		const newRisk = { ...this.props.newRisk, name };
		this.props.setState({ newRisk });
	}

	public handleRiskSave = (values) => {
		const { teamspace, model, risk, saveRisk, updateRisk } = this.props;
		const updatedRisk = {
			...risk,
			...omit(values, ['assigned_roles', 'description']),
			assigned_roles: [values.assigned_roles],
			desc: values.description
		};
		if (updatedRisk._id) {
			updateRisk(teamspace, model, updatedRisk);
		} else {
			saveRisk(teamspace, model, updatedRisk);
		}
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

	public renderPreview = renderWhenTrue(() => {
		const { expandDetails, newRisk, risk, jobs } = this.props;
		const riskData = risk._id ? risk : newRisk;

		return (
			<PreviewDetails
				{...riskData}
				defaultExpanded={expandDetails}
				editable={!riskData._id}
				onNameChange={this.handleNameChange}
				onExpandChange={this.handleExpandChange}
			>
				<RiskDetailsForm
					risk={riskData}
					jobs={jobs}
					onValueChange={this.handleRiskSave}
					onSubmit={this.handleRiskSave}
				/>
			</PreviewDetails>
		);
	});

	public render() {
		const { newRisk, risk } = this.props;
		const { logs } = this.state;

		return (
			<Container>
				<ViewerPanelContent className="height-catcher">
					{this.renderPreview(risk._id || newRisk)}
					{this.renderLogs(logs.length)}
				</ViewerPanelContent>
				{this.renderFooter()}
			</Container>
		);
	}
}
