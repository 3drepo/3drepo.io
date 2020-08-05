/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import React, { Fragment } from 'react';

import { diffData, mergeData } from '../../../../../../helpers/forms';
import { canComment } from '../../../../../../helpers/issues';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { CommentForm } from '../../../commentForm';
import { Container } from '../../../risks/components/riskDetails/riskDetails.styles';
import { ViewerPanelContent, ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { EmptyStateInfo } from '../../../views/views.styles';
import { HorizontalView, MessagesList, MessageContainer, PreviewDetails } from './issueDetails.styles';
import { IssueDetailsForm } from './issueDetailsForm.component';

interface IProps {
	viewer: any;
	jobs: any[];
	topicTypes: any[];
	issue: any;
	comments: any[];
	teamspace: string;
	model: string;
	revision: string;
	expandDetails: boolean;
	fetchingDetailsIsPending: boolean;
	newComment: any;
	myJob: any;
	currentUser: any;
	permissions: any[];
	failedToLoad: boolean;
	disableViewer?: boolean;
	horizontal?: boolean;
	setState: (componentState) => void;
	fetchIssue: (teamspace, model, issueId) => void;
	updateSelectedIssuePin: (position) => void;
	saveIssue: (teamspace, modelId, issue, revision, finishSubmitting, disableViewer) => void;
	updateIssue: (teamspace, modelId, issue) => void;
	postComment: (teamspace, modelId, issueData, finishSubmitting) => void;
	removeComment: (teamspace, modelId, issueData) => void;
	subscribeOnIssueCommentsChanges: (teamspace, modelId, issueId) => void;
	unsubscribeOnIssueCommentsChanges: (teamspace, modelId, issueId) => void;
	updateNewIssue: (newIssue) => void;
	setCameraOnViewpoint: (teamspace, modelId, view) => void;
	onRemoveResource: (resource) => void;
	attachFileResources: (files) => void;
	attachLinkResources: (links) => void;
	showDialog: (config: any) => void;
	showScreenshotDialog: (config: any) => void;
	postCommentIsPending?: boolean;
}

interface IState {
	logsLoaded: boolean;
	scrolled: boolean;
}

const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};

export class IssueDetails extends React.PureComponent<IProps, IState> {
	public state = {
		logsLoaded: false,
		scrolled: false,
	};

	public formRef = React.createRef<any>();
	public panelRef = React.createRef<any>();
	public containerRef = React.createRef<any>();
	public messageContainerRef = React.createRef<any>();

	get isNewIssue() {
		return !this.props.issue._id;
	}

	get issueData() {
		return this.props.issue;
	}

	get jobsList() {
		return [...this.props.jobs, UNASSIGNED_JOB];
	}

	public renderMessagesList = renderWhenTrue(() => {
		return (
			<MessagesList
				formRef={this.formRef}
				messages={this.props.comments}
				isPending={this.props.fetchingDetailsIsPending}
				removeMessage={this.removeMessage}
				teamspace={this.props.teamspace}
				currentUser={this.props.currentUser}
				setCameraOnViewpoint={this.setCameraOnViewpoint}
			/>
		);
	});

	public renderPreview = renderWhenTrue(() => {
		const { expandDetails, horizontal, failedToLoad, disableViewer } = this.props;
		const { comments } = this.issueData;
		const isIssueWithComments = Boolean(!this.isNewIssue);
		const PreviewWrapper = horizontal && isIssueWithComments ? HorizontalView : Fragment;
		const renderNotCollapsable = () => this.renderMessagesList(!horizontal && isIssueWithComments);

		return (
			<PreviewWrapper>
				<PreviewDetails
					{...this.issueData}
					id={this.issueData._id}
					type="issue"
					key={this.issueData._id}
					defaultExpanded={horizontal || expandDetails}
					editable={!this.issueData._id}
					onNameChange={this.handleNameChange}
					onExpandChange={this.handleExpandChange}
					renderCollapsable={this.renderDetailsForm}
					renderNotCollapsable={!horizontal ? renderNotCollapsable : null}
					handleHeaderClick={this.handleHeaderClick}
					scrolled={this.state.scrolled && !horizontal}
					isNew={this.isNewIssue}
					showModelButton={disableViewer && !this.isNewIssue}
				/>
				<MessageContainer ref={this.messageContainerRef}>
					{this.renderMessagesList(horizontal && isIssueWithComments)}
					{this.renderFooter(horizontal && !failedToLoad)}
				</MessageContainer>
			</PreviewWrapper>
		);
	});

	public renderFooter = renderWhenTrue(() => (
		<ViewerPanelFooter alignItems="center" padding="0">
			<CommentForm
				disableViewer={this.props.disableViewer}
				comment={this.props.newComment.comment}
				screenshot={this.props.newComment.screenshot}
				viewpoint={this.props.newComment.viewpoint}
				formRef={this.formRef}
				onTakeScreenshot={this.handleNewScreenshot}
				onSave={this.handleSave}
				canComment={this.userCanComment()}
				hideComment={this.isNewIssue}
				hideScreenshot={this.props.disableViewer}
				hideUploadButton={!this.props.disableViewer}
				messagesContainerRef={this.messageContainerRef}
				previewWrapperRef={this.containerRef}
				horizontal={this.props.horizontal}
				fetchingDetailsIsPending={this.props.fetchingDetailsIsPending}
				postCommentIsPending={this.props.postCommentIsPending}
			/>
		</ViewerPanelFooter>
	));

	public renderFailedState = renderWhenTrue(() => (
		<EmptyStateInfo>Issue failed to load</EmptyStateInfo>
	));

	public componentDidMount() {
		const { teamspace, model, fetchIssue, issue, subscribeOnIssueCommentsChanges } = this.props;

		if (issue._id) {
			fetchIssue(teamspace, model, issue._id);
			subscribeOnIssueCommentsChanges(teamspace, model, issue._id);
		}
	}

	public componentWillUnmount() {
		const { teamspace, model, issue, unsubscribeOnIssueCommentsChanges } = this.props;
		unsubscribeOnIssueCommentsChanges(teamspace, model, issue._id);
	}

	public componentDidUpdate(prevProps) {
		const {
			issue, teamspace, model, fetchIssue, subscribeOnIssueCommentsChanges, unsubscribeOnIssueCommentsChanges,
		} = this.props;

		if (prevProps.issue._id !== issue._id) {
			unsubscribeOnIssueCommentsChanges(prevProps.teamspace, prevProps.model, prevProps.issue._id);
			fetchIssue(teamspace, model, issue._id);
			subscribeOnIssueCommentsChanges(teamspace, model, issue._id);
		}
	}

	public handleHeaderClick = () => {
		if (!this.isNewIssue) { // if its a new issue it shouldnt go to the viewpoint
			this.setCameraOnViewpoint({ viewpoint: this.issueData.viewpoint });
		}
	}

	public handleExpandChange = (event, expanded) => {
		this.props.setState({ expandDetails: expanded });
	}

	public handleNameChange = (event, name) => {
		const newIssue = { ...this.issueData, name };
		this.props.setState({ newIssue });
	}

	public handleIssueFormSubmit = (values) => {
		const { teamspace, model, updateIssue, updateNewIssue } = this.props;
		if (this.isNewIssue) {
			updateNewIssue(mergeData(this.issueData, values));
		} else {
			updateIssue(teamspace, model, diffData(values, this.issueData));
		}
	}

	public renderDetailsForm = () => {
		const { issue, onRemoveResource, showDialog, topicTypes, disableViewer, showScreenshotDialog, permissions,
			currentUser, myJob, attachFileResources, attachLinkResources, updateSelectedIssuePin } = this.props;

		return (
			<IssueDetailsForm
				issue={this.issueData}
				jobs={this.jobsList}
				onValueChange={this.handleIssueFormSubmit}
				onSubmit={this.handleIssueFormSubmit}
				permissions={permissions}
				topicTypes={topicTypes}
				currentUser={currentUser}
				myJob={myJob}
				onChangePin={updateSelectedIssuePin}
				onSavePin={this.onPositionSave}
				hasPin={!disableViewer && issue.position && issue.position.length}
				hidePin={disableViewer}
				onRemoveResource={onRemoveResource}
				attachFileResources={attachFileResources}
				attachLinkResources={attachLinkResources}
				showDialog={showDialog}
				showScreenshotDialog={showScreenshotDialog}
				canComment={this.userCanComment}
				onThumbnailUpdate={this.handleNewScreenshot}
				formRef={this.formRef}
			/>
		);
	}

	public removeMessage = (index, guid) => {
		const issueData = {
			_id: this.issueData._id,
			rev_id: this.issueData.rev_id,
			issueNumber: this.issueData.number,
			commentIndex: this.issueData.comments.length - 1 - index,
			guid
		};
		this.props.removeComment(this.props.teamspace, this.props.model, issueData);
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
		const { myJob, permissions, currentUser } = this.props;
		return canComment(this.issueData, myJob, permissions, currentUser);
	}

	public setCommentData = (commentData = {}) => {
		const newComment = {
			...this.props.newComment, ...commentData
		};

		this.props.setState({ newComment });
	}

	public handleNewScreenshot = (screenshot) => {
		const { teamspace, model, viewer } = this.props;

		if (this.isNewIssue) {
			this.props.setState({
				newIssue: {
					...this.issueData,
					descriptionThumbnail: screenshot
				}
			});
		} else {
			this.setCommentData({ screenshot });
		}
	}

	public postComment = (teamspace, model, { comment, screenshot }, finishSubmitting) => {
		const issueCommentData = {
			_id: this.issueData._id,
			comment,
			viewpoint: {
				screenshot
			}
		};

		this.props.postComment(teamspace, model, issueCommentData, finishSubmitting);
	}

	public handleSave = (formValues, finishSubmitting) => {
		const { teamspace, model, saveIssue, revision, disableViewer} = this.props;
		if (this.isNewIssue) {
			saveIssue(teamspace, model, this.issueData, revision, finishSubmitting, disableViewer);
		} else {
			this.postComment(teamspace, model, formValues, finishSubmitting);
		}
	}

	public onPositionSave = () => {
		const { teamspace, model, issue, updateIssue } = this.props;

		if (!this.isNewIssue) {
			updateIssue(teamspace, model, {position: issue.position || []});
		}
	}

	public render() {
		const { failedToLoad, issue, horizontal } = this.props;
		return (
			<Container ref={this.containerRef}>
				<ViewerPanelContent
					onScroll={this.handlePanelScroll}
					ref={this.panelRef}
				>
					{this.renderFailedState(failedToLoad)}
					{this.renderPreview(!failedToLoad && issue)}
				</ViewerPanelContent>
				{this.renderFooter(!failedToLoad && !horizontal)}
			</Container>
		);
	}
}
