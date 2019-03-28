/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import { isEmpty, isEqual } from 'lodash';
import * as React from 'react';

import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { canUpdateRisk, mergeRiskData } from '../../../../../../helpers/risks';
import { Viewer } from '../../../../../../services/viewer/viewer';
import { LogList } from '../../../../../components/logList/logList.component';
import NewCommentForm from '../../../newCommentForm/newCommentForm.container';
import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { ViewerPanelContent, ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { Container } from './riskDetails.styles';
import { RiskDetailsForm } from './riskDetailsForm.component';
import { RISK_PANEL_NAME } from '../../../../../../constants/risks';

interface IProps {
	jobs: any[];
	risk: any;
	newComment: any;
	teamspace: string;
	model: string;
	expandDetails: boolean;
	logs: any[];
	fetchingDetailsIsPending: boolean;
	associatedActivities: any[];
	myJob: any;
	currentUser: any;
	modelSettings: any;
	failedToLoad: boolean;
	saveRisk: (teamspace, modelId, risk) => void;
	updateRisk: (teamspace, modelId, risk) => void;
	postComment: (teamspace, modelId, riskData) => void;
	removeComment: (teamspace, modelId, riskData) => void;
	subscribeOnRiskCommentsChanges: (teamspace, modelId, riskId) => void;
	unsubscribeOnRiskCommentsChanges: (teamspace, modelId, riskId) => void;
	updateNewRisk: (newRisk) => void;
	setState: (componentState) => void;
	fetchRisk: (teamspace, model, riskId) => void;
	showScreenshotDialog: (options) => void;
	showNewPin: (risk, pinData) => void;
	setCameraOnViewpoint: (teamspace, modelId, view) => void;
}

interface IState {
	logs: any[];
	canUpdateRisk: boolean;
}

const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};

export class RiskDetails extends React.PureComponent<IProps, IState> {
	public state = {
		logs: [],
		canUpdateRisk: false
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
		const logs = (this.props.risk.comments) ? this.props.risk.comments : [];
		this.setState({ logs });
	}

	public componentDidMount() {
		const {
			teamspace,
			model,
			risk,
			currentUser,
			fetchRisk,
			modelSettings,
			myJob,
			subscribeOnRiskCommentsChanges
		} = this.props;
		const permissions = modelSettings.permissions;

		if (this.props.risk.comments) {
			this.setLogs();
		}

		if (risk._id) {
			fetchRisk(teamspace, model, risk._id);
			subscribeOnRiskCommentsChanges(teamspace, model, risk._id);
		}

		if (risk && currentUser && permissions && myJob) {
			this.setState({
				canUpdateRisk: canUpdateRisk(risk, myJob, permissions, currentUser)
			});
		}
	}

	public componentWillUnmount() {
		const { teamspace, model, risk, unsubscribeOnRiskCommentsChanges } = this.props;
		unsubscribeOnRiskCommentsChanges(teamspace, model, risk._id);
	}

	public componentDidUpdate(prevProps) {
		const {
			teamspace,
			model,
			fetchRisk,
			risk,
			currentUser,
			modelSettings,
			myJob,
			subscribeOnRiskCommentsChanges
		} = this.props;
		const permissions = modelSettings.permissions;
		const changes = {} as IState;
		const permissionsChanged = !isEqual(prevProps.permissions, permissions);
		const canUpdate = canUpdateRisk(risk, myJob, permissions, currentUser);
		const logsChanged = !isEqual(this.props.risk.comments, prevProps.risk.comments);

		if (risk._id !== prevProps.risk._id) {
			fetchRisk(teamspace, model, risk._id);
			if (!prevProps.risk._id) {
				subscribeOnRiskCommentsChanges(teamspace, model, risk._id);
			}
		}

		if (logsChanged) {
			this.setLogs();
		}

		if (permissionsChanged && risk && currentUser && permissions && myJob && canUpdate !== this.state.canUpdateRisk) {
			changes.canUpdateRisk = canUpdateRisk(risk, myJob, permissions, currentUser);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
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
		const { teamspace, model, updateRisk, updateNewRisk } = this.props;
		const updatedRisk = mergeRiskData(this.riskData, values);

		if (this.isNewRisk) {
			updateNewRisk(updatedRisk);
		} else {
			updateRisk(teamspace, model, updatedRisk);
		}
	}

	public removeComment = (index, guid) => {
		const riskData = {
			_id: this.riskData._id,
			rev_id: this.riskData.rev_id,
			commentIndex: this.props.logs.length - 1 - index,
			guid
		};
		this.props.removeComment(this.props.teamspace, this.props.model, riskData);
	}

	public setCameraOnViewpoint = (viewpoint) => {
		this.props.setCameraOnViewpoint(this.props.teamspace, this.props.model, viewpoint);
	}

	public postComment = async (teamspace, model, {comment, screenshot}) => {
		const viewpoint = await Viewer.getCurrentViewpoint({ teamspace, model });

		const pinData = await Viewer.getPinData();
		let position;

		if (pinData) {
			position = pinData.pickedPos;
		}

		const riskCommentData = {
			_id: this.riskData._id,
			rev_id: this.riskData.rev_id,
			comment,
			position,
			viewpoint: {
				...viewpoint,
				screenshot
			}
		};

		this.props.postComment(teamspace, model, riskCommentData);
	}

	public handleSave = (formValues) => {
		const { teamspace, model, saveRisk } = this.props;
		if (this.isNewRisk) {
			saveRisk(teamspace, model, this.riskData);
		} else {
			this.postComment(teamspace, model, formValues);
		}
	}

	public setCommentData = (commentData = {}) => {
		const newComment = {
			...this.props.newComment, ...commentData
		};

		this.props.setState({ newComment });
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

	public renderRiskForm = () => (
		<RiskDetailsForm
			canUpdateRisk={this.state.canUpdateRisk}
			risk={this.riskData}
			jobs={this.jobsList}
			onValueChange={this.handleRiskFormSubmit}
			onSubmit={this.handleRiskFormSubmit}
			associatedActivities={this.props.associatedActivities}
			permissions={this.props.modelSettings.permissions}
			currentUser={this.props.currentUser}
			myJob={this.props.myJob}
		/>
	)

	public renderPreview = renderWhenTrue(() => {
		const { expandDetails } = this.props;
		return (
			<PreviewDetails
				key={this.riskData._id}
				{...this.riskData}
				defaultExpanded={expandDetails}
				editable={!this.riskData._id}
				onNameChange={this.handleNameChange}
				onExpandChange={this.handleExpandChange}
				renderCollapsable={() => this.renderRiskForm()}
				panelName={RISK_PANEL_NAME}
			/>
		);
	});

	public renderLogs = renderWhenTrue(() => {
		return (
			<LogList
				items={this.props.logs}
				isPending={this.props.fetchingDetailsIsPending}
				removeLog={this.removeComment}
				teamspace={this.props.teamspace}
				setCameraOnViewpoint={this.setCameraOnViewpoint}
			/>);
	});

	public renderFooter = renderWhenTrue(() => (
		<ViewerPanelFooter alignItems="center" padding="0">
			<NewCommentForm
				canComment={this.state.canUpdateRisk}
				comment={this.props.newComment.comment}
				screenshot={this.props.newComment.screenshot}
				viewpoint={this.props.newComment.viewpoint}
				innerRef={this.commentRef}
				hideComment={!this.riskData._id}
				hidePin={this.riskData._id}
				onTakeScreenshot={this.handleNewScreenshot}
				onChangePin={this.handleChangePin}
				onSave={this.handleSave}
			/>
		</ViewerPanelFooter>
	));

	public render() {
		const { failedToLoad } = this.props;
		const { logs } = this.state;

		return (
			<Container>
				<ViewerPanelContent
					className="height-catcher"
					padding="0"
					details="1"
				>
					{this.renderPreview(this.props.risk)}
					{this.renderLogs(logs.length)}
				</ViewerPanelContent>
				{this.renderFooter(!failedToLoad)}
			</Container>
		);
	}
}
