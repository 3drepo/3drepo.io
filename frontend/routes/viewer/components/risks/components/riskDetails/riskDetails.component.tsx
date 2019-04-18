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

import * as React from 'react';

import { Viewer } from '../../../../../../services/viewer/viewer';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { Container } from './riskDetails.styles';
import { ViewerPanelContent, ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { RiskDetailsForm } from './riskDetailsForm.component';
import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { mergeRiskData, canComment, getRiskPinColor } from '../../../../../../helpers/risks';
import { LogList } from '../../../../../components/logList/logList.component';
import NewCommentForm from '../../../newCommentForm/newCommentForm.container';
import { EmptyStateInfo } from '../../../views/views.styles';
import { NEW_PIN_ID } from '../../../../../../constants/viewer';

interface IProps {
	jobs: any[];
	risk: any;
	teamspace: string;
	model: string;
	revision: string;
	expandDetails: boolean;
	fetchingDetailsIsPending: boolean;
	newComment: any;
	associatedActivities: any[];
	myJob: any;
	currentUser: any;
	modelSettings: any;
	failedToLoad: boolean;
	setState: (componentState) => void;
	fetchRisk: (teamspace, model, riskId) => void;
	showNewPin: (risk, pinData) => void;
	saveRisk: (teamspace, modelId, risk, revision) => void;
	updateRisk: (teamspace, modelId, risk) => void;
	postComment: (teamspace, modelId, riskData) => void;
	removeComment: (teamspace, modelId, riskData) => void;
	subscribeOnRiskCommentsChanges: (teamspace, modelId, riskId) => void;
	unsubscribeOnRiskCommentsChanges: (teamspace, modelId, riskId) => void;
	updateNewRisk: (newRisk) => void;
	setCameraOnViewpoint: (teamspace, modelId, view) => void;
}

interface IState {
	logsLoaded: boolean;
	scrolled: boolean;
}

const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};

export class RiskDetails extends React.PureComponent<IProps, IState> {
	public state = {
		logsLoaded: false,
		scrolled: false
	};

	public commentRef = React.createRef<any>();
	public panelRef = React.createRef<any>();
	public commentsRef = React.createRef<any>();

	get isNewRisk() {
		return !this.props.risk._id;
	}

	get riskData() {
		return this.props.risk;
	}

	get jobsList() {
		return [...this.props.jobs, UNASSIGNED_JOB];
	}

	public componentDidMount() {
		const { teamspace, model, fetchRisk, risk, subscribeOnRiskCommentsChanges } = this.props;

		if (risk._id) {
			fetchRisk(teamspace, model, risk._id);
			subscribeOnRiskCommentsChanges(teamspace, model, risk._id);
		}
	}

	public componentWillUnmount() {
		const { teamspace, model, risk, unsubscribeOnRiskCommentsChanges } = this.props;
		unsubscribeOnRiskCommentsChanges(teamspace, model, risk._id);
	}

	public componentDidUpdate(prevProps) {
		const { teamspace, model, fetchRisk, risk } = this.props;

		if (risk._id !== prevProps.risk._id) {
			fetchRisk(teamspace, model, risk._id);
		}

		if (
			risk.comments && prevProps.risk.comments &&
			(risk.comments.length > prevProps.risk.comments.length && risk.comments[risk.comments.length - 1].new)
		) {
			const { top: commentsTop } = this.commentsRef.current.getBoundingClientRect();
			const panelElements = this.panelRef.current.children[0].children;
			const detailsDimensions = panelElements[1].getBoundingClientRect();
			const { height: detailsHeight } = detailsDimensions;

			if (commentsTop < 0) {
				this.panelRef.current.scrollTo({
					top: detailsHeight - 16,
					behavior: 'smooth'
				});
			}
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

	// onSavePin: (position) => void;

	public renderDetailsForm = () => {
		return (
			<RiskDetailsForm
				risk={this.riskData}
				jobs={this.jobsList}
				onValueChange={this.handleRiskFormSubmit}
				onSubmit={this.handleRiskFormSubmit}
				permissions={this.props.modelSettings.permissions}
				currentUser={this.props.currentUser}
				myJob={this.props.myJob}
				onChangePin={this.handleChangePin}
				onSavePin={this.onPositionSave}
				pinId={this.riskData._id}
				hasPin={this.riskData.position && this.riskData.position.length}
				/>
		);
	}

	public removeComment = (index, guid) => {
		const riskData = {
			_id: this.riskData._id,
			rev_id: this.riskData.rev_id,
			commentIndex: this.riskData.comments.length - 1 - index,
			guid
		};
		this.props.removeComment(this.props.teamspace, this.props.model, riskData);
	}

	public setCameraOnViewpoint = (viewpoint) => {
		this.props.setCameraOnViewpoint(this.props.teamspace, this.props.model, viewpoint);
	}

	public renderLogList = renderWhenTrue(() => {
		return (
			<LogList
				innerRef={this.commentsRef}
				items={this.riskData.comments}
				isPending={this.props.fetchingDetailsIsPending}
				removeLog={this.removeComment}
				teamspace={this.props.teamspace}
				currentUser={this.props.currentUser.username}
				setCameraOnViewpoint={this.setCameraOnViewpoint}
			/>);
	});

	public handlePanelScroll = (e) => {
		if (e.target.scrollTop > 0 && !this.state.scrolled) {
			this.setState({ scrolled: true });
		}
		if (e.target.scrollTop === 0 && this.state.scrolled) {
			this.setState({ scrolled: false });
		}
	}

	public renderPreview = renderWhenTrue(() => {
		const { expandDetails } = this.props;
		const { comments } = this.riskData;

		return (
			<PreviewDetails
				{...this.riskData}
				key={this.riskData._id}
				defaultExpanded={expandDetails}
				editable={!this.riskData._id}
				onNameChange={this.handleNameChange}
				onExpandChange={this.handleExpandChange}
				renderCollapsable={this.renderDetailsForm}
				renderNotCollapsable={() => this.renderLogList(comments && !!comments.length && !this.isNewRisk)}
				handleHeaderClick={() => this.setCameraOnViewpoint({viewpoint: this.riskData.viewpoint})}
				scrolled={this.state.scrolled}
			/>
		);
	});

	public userCanComment() {
		const { myJob, modelSettings, currentUser } = this.props;
		return canComment(this.riskData, myJob, modelSettings.permissions, currentUser.username);
	}

	public renderFooter = renderWhenTrue(() => (
		<ViewerPanelFooter alignItems="center" padding="0">
			<NewCommentForm
				comment={this.props.newComment.comment}
				screenshot={this.props.newComment.screenshot}
				viewpoint={this.props.newComment.viewpoint}
				innerRef={this.commentRef}
				onTakeScreenshot={this.handleNewScreenshot}
				onSave={this.handleSave}
				canComment={this.userCanComment()}
				hideComment={this.isNewRisk}
			/>
		</ViewerPanelFooter>
	));

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
		const { teamspace, model, saveRisk, revision } = this.props;
		if (this.isNewRisk) {
			saveRisk(teamspace, model, this.riskData, revision);
		} else {
			this.postComment(teamspace, model, formValues);
		}
	}

	public onPositionSave = (position) => {
		const { teamspace, model, risk, updateRisk } = this.props;

		if (risk._id) {
			updateRisk(teamspace, model, {...risk, position});
		} else {
			const colours = getRiskPinColor(risk.overall_level_of_risk, true);
			Viewer.changePinColor({ id: NEW_PIN_ID, colours});
		}
	}

	public renderFailedState = renderWhenTrue(() => {
		return (
			<EmptyStateInfo>Risk failed to load</EmptyStateInfo>
		);
	});

	public render() {
		const { failedToLoad, risk } = this.props;

		return (
			<Container>
				<ViewerPanelContent
					className="height-catcher"
					onScroll={this.handlePanelScroll}
					innerRef={this.panelRef}
				>
					{this.renderFailedState(failedToLoad)}
					{this.renderPreview(!failedToLoad && risk)}
				</ViewerPanelContent>
				{this.renderFooter(!failedToLoad)}
			</Container>
		);
	}
}
