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

import { isEqual } from 'lodash';
import * as React from 'react';

import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { mergeRiskData } from '../../../../../../helpers/risks';
import { Viewer } from '../../../../../../services/viewer/viewer';
import { LogList } from '../../../../../components/logList/logList.component';
import NewCommentForm from '../../../newCommentForm/newCommentForm.container';
import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { ViewerPanelContent, ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { Container } from './riskDetails.styles';
import { RiskDetailsForm } from './riskDetailsForm.component';

interface IProps {
	jobs: any[];
	risk: any;
	newComment: any;
	teamspace: string;
	model: string;
	expandDetails: boolean;
	saveRisk: (teamspace, modelId, risk) => void;
	updateRisk: (teamspace, modelId, risk) => void;
	postComment: (teamspace, modelId, riskId, comment) => void;
	setState: (componentState) => void;
	showScreenshotDialog: (options) => void;
	showNewPin: (risk, pinData) => void;
}

interface IState {
	risk: any;
	logs: any[];
}

const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};

export class RiskDetails extends React.PureComponent<IProps, IState> {
	public state = {
		risk: {},
		logs: []
	};

	public commentRef = React.createRef<any>();

	get isNewRisk() {
		return !this.props.risk._id;
	}

	get riskData() {
		return this.props.risk;
	}

	get jobsList() {
		return [...this.props.jobs, UNASSIGNED_JOB];
	}

	public setLogs = () => {
		const logs = this.props.risk.comments;
		this.setState({ logs });
	}

	public componentDidMount() {
		if (this.props.risk.comments) {
			this.setLogs();
		}
	}

	public componentDidUpdate(prevProps) {
		const logsChanged = !isEqual(this.props.risk.comments, prevProps.risk.comments);
		if (logsChanged) {
			this.setLogs();
		}
	}

	public handleExpandChange = (event, expanded) => {
		this.props.setState({ expandDetails: expanded });
	}

	public handleNameChange = (event, name) => {
		const newRisk = { ...this.riskData, name };
		this.props.setState({ newRisk });
	}

	public handleRiskFormSubmit = (values) => {
		const { teamspace, model, updateRisk, setState } = this.props;
		const preparedRisk = mergeRiskData(this.riskData, values);

		if (this.isNewRisk) {
			setState({ newRisk: preparedRisk });
		} else {
			updateRisk(teamspace, model, preparedRisk);
		}
	}

	public handleSave = (comment) => {
		const { teamspace, model, saveRisk, postComment } = this.props;
		if (this.isNewRisk) {
			saveRisk(teamspace, model, this.riskData);
		} else {
			postComment(teamspace, model, this.riskData._id, comment);
		}
	}

	public setCommentData = (commentData = {}) => {
		this.props.setState({ newComment: {
			...this.props.newComment, ...commentData
		}});
	}

	public handleNewScreenshot = async (screenshot) => {
		const { teamspace, model } = this.props;
		const viewpoint = await Viewer.getCurrentViewpoint({ teamspace, model });

		if (this.isNewRisk) {
			this.props.setState({ newRisk: {
				...this.riskData,
				descriptionThumbnail: screenshot
			}});
		} else {
			this.setCommentData({ screenshot, viewpoint });
		}
	}

	public handleChangePin = (pinData) => {
		this.props.showNewPin(this.props.risk, pinData);
	}

	public renderPreview = renderWhenTrue(() => {
		const { expandDetails } = this.props;

		return (
			<PreviewDetails
				{...this.riskData}
				defaultExpanded={expandDetails}
				editable={!this.riskData._id}
				onNameChange={this.handleNameChange}
				onExpandChange={this.handleExpandChange}
			>
				<RiskDetailsForm
					risk={this.riskData}
					jobs={this.jobsList}
					onValueChange={this.handleRiskFormSubmit}
					onSubmit={this.handleRiskFormSubmit}
				/>
			</PreviewDetails>
		);
	});

	public renderLogs = renderWhenTrue(() => <LogList items={this.state.logs} />);

	public renderFooter = () => (
		<ViewerPanelFooter alignItems="center">
			<NewCommentForm
				comment={this.props.newComment.comment}
				screenshot={this.props.newComment.screenshot}
				viewpoint={this.props.newComment.viewpoint}
				innerRef={this.commentRef}
				hideComment={true}
				hideScreenshot={!this.isNewRisk}
				hidePin={!this.isNewRisk}
				onTakeScreenshot={this.handleNewScreenshot}
				onChangePin={this.handleChangePin}
				onSave={this.handleSave}
			/>
		</ViewerPanelFooter>
	)

	public render() {
		const { logs } = this.state;

		return (
			<Container>
				<ViewerPanelContent className="height-catcher">
					{this.renderPreview(this.props.risk)}
					{this.renderLogs(logs.length)}
				</ViewerPanelContent>
				{this.renderFooter()}
			</Container>
		);
	}
}
