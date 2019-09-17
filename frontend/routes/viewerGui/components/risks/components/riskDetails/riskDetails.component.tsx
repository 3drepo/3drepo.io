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

import React from 'react';

import { diffData, mergeData } from '../../../../../../helpers/forms';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { canComment } from '../../../../../../helpers/risks';
import { LogList } from '../../../../../components/logList/logList.component';
import NewCommentForm from '../../../newCommentForm/newCommentForm.container';
import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { ViewerPanelContent, ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { EmptyStateInfo } from '../../../views/views.styles';
import { Container } from './riskDetails.styles';
import { RiskDetailsForm } from './riskDetailsForm.component';

interface IProps {
	viewer: any;
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
	saveRisk: (teamspace, modelId, risk, revision, finishSubmitting) => void;
	updateRisk: (teamspace, modelId, risk) => void;
	postComment: (teamspace, modelId, riskData, finishSubmitting) => void;
	removeComment: (teamspace, modelId, riskData) => void;
	subscribeOnRiskCommentsChanges: (teamspace, modelId, riskId) => void;
	unsubscribeOnRiskCommentsChanges: (teamspace, modelId, riskId) => void;
	updateNewRisk: (newRisk) => void;
	setCameraOnViewpoint: (teamspace, modelId, view) => void;
	updateSelectedRiskPin: (position) => void;
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

	public formRef = React.createRef<any>();
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

	public commentRef = React.createRef<any>();

	public renderLogList = renderWhenTrue(() => (
		<LogList
			commentsRef={this.commentsRef}
			items={this.riskData.comments}
			isPending={this.props.fetchingDetailsIsPending}
			removeLog={this.removeComment}
			teamspace={this.props.teamspace}
			currentUser={this.props.currentUser.username}
			setCameraOnViewpoint={this.setCameraOnViewpoint}
		/>
	));

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
				handleHeaderClick={() => {
					if (!this.isNewRisk) { // if its a new issue it shouldnt go to the viewpoint
						this.setCameraOnViewpoint({viewpoint: this.riskData.viewpoint});
					}
				}}
				scrolled={this.state.scrolled}
				isNew={this.isNewRisk}
			/>
		);
	});

	public renderFooter = renderWhenTrue(() => (
		<ViewerPanelFooter alignItems="center" padding="0">
			<NewCommentForm
				comment={this.props.newComment.comment}
				screenshot={this.props.newComment.screenshot}
				viewpoint={this.props.newComment.viewpoint}
				formRef={this.formRef}
				onTakeScreenshot={this.handleNewScreenshot}
				onSave={this.handleSave}
				canComment={this.userCanComment()}
				hideComment={this.isNewRisk}
			/>
		</ViewerPanelFooter>
	));

	public renderFailedState = renderWhenTrue(() => {
		return (
			<EmptyStateInfo>Risk failed to load</EmptyStateInfo>
		);
	});

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

		if (this.isNewRisk) {
			updateNewRisk(mergeData(this.riskData, values));
		} else {
			updateRisk(teamspace, model, diffData(values, this.riskData));
		}
	}

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
				onChangePin={this.props.updateSelectedRiskPin}
				onSavePin={this.onPositionSave}
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

	public handlePanelScroll = (e) => {
		if (e.target.scrollTop > 0 && !this.state.scrolled) {
			this.setState({ scrolled: true });
		}
		if (e.target.scrollTop === 0 && this.state.scrolled) {
			this.setState({ scrolled: false });
		}
	}

	public userCanComment() {
		const { myJob, modelSettings, currentUser } = this.props;
		return canComment(this.riskData, myJob, modelSettings.permissions, currentUser.username);
	}

	public setCommentData = (commentData = {}) => {
		const newComment = {
			...this.props.newComment, ...commentData
		};

		this.props.setState({ newComment });
	}

	public handleNewScreenshot = async (screenshot) => {
		const { teamspace, model, viewer } = this.props;
		const viewpoint = await viewer.getCurrentViewpoint({ teamspace, model });

		if (this.isNewRisk) {
			this.props.setState({ newRisk: {
				...this.riskData,
				descriptionThumbnail: screenshot
			}});
		} else {
			this.setCommentData({ screenshot, viewpoint });
		}
	}

	public postComment = async (teamspace, model, { comment, screenshot }, finishSubmitting) => {
		const viewpoint = await this.props.viewer.getCurrentViewpoint({ teamspace, model });

		const pinData = await this.props.viewer.getPinData();
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

		this.props.postComment(teamspace, model, riskCommentData, finishSubmitting);
	}

	public handleSave = (formValues, finishSubmitting) => {
		const { teamspace, model, saveRisk, revision } = this.props;
		if (this.isNewRisk) {
			saveRisk(teamspace, model, this.riskData, revision, finishSubmitting);
		} else {
			this.postComment(teamspace, model, formValues, finishSubmitting);
		}
	}

	public onPositionSave = () => {
		const { teamspace, model, risk, updateRisk } = this.props;

		if (risk._id) {
			updateRisk(teamspace, model, { position: risk.position });
		}
	}
	public render() {
		const { failedToLoad, risk } = this.props;

		return (
			<Container>
				<ViewerPanelContent
					onScroll={this.handlePanelScroll}
					ref={this.panelRef}
				>
					{this.renderFailedState(failedToLoad)}
					{this.renderPreview(!failedToLoad && risk)}
				</ViewerPanelContent>
				{this.renderFooter(!failedToLoad)}
			</Container>
		);
	}
}
