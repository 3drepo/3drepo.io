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

import { Viewer } from '../../../../../../services/viewer/viewer';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { Container } from '../../../risks/components/riskDetails/riskDetails.styles';
import { ViewerPanelContent, ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { IssueDetailsForm } from './issueDetailsForm.component';
import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { mergeIssueData, canComment } from '../../../../../../helpers/issues';
import { LogList } from '../../../../../components/logList/logList.component';
import NewCommentForm from '../../../newCommentForm/newCommentForm.container';
import { EmptyStateInfo } from '../../../views/views.styles';
import { timingSafeEqual } from 'crypto';

interface IProps {
	jobs: any[];
	issue: any;
	teamspace: string;
	model: string;
	revision: string;
	expandDetails: boolean;
	fetchingDetailsIsPending: boolean;
	newComment: any;
	myJob: any;
	currentUser: any;
	settings: any;
	failedToLoad: boolean;
	setState: (componentState) => void;
	fetchIssue: (teamspace, model, issueId) => void;
	showNewPin: (issue, pinData) => void;
	saveIssue: (teamspace, modelId, issue, revision) => void;
	updateIssue: (teamspace, modelId, issue) => void;
	postComment: (teamspace, modelId, issueData) => void;
	removeComment: (teamspace, modelId, issueData) => void;
	subscribeOnIssueCommentsChanges: (teamspace, modelId, issueId) => void;
	unsubscribeOnIssueCommentsChanges: (teamspace, modelId, issueId) => void;
	updateNewIssue: (newIssue) => void;
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

export class IssueDetails extends React.PureComponent<IProps, IState> {
	public state = {
		logsLoaded: false,
		scrolled: false
	};

	public commentRef = React.createRef<any>();
	public panelRef = React.createRef<any>();
	public commentsRef = React.createRef<any>();

	get isNewIssue() {
		return !this.props.issue._id;
	}

	get issueData() {
		return this.props.issue;
	}

	get jobsList() {
		return [...this.props.jobs, UNASSIGNED_JOB];
	}

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
		const { teamspace, model, fetchIssue, issue } = this.props;

		if (issue._id !== prevProps.issue._id) {
			fetchIssue(teamspace, model, issue._id);
		}

		if (
			issue.comments && prevProps.issue.comments &&
			(issue.comments.length > prevProps.issue.comments.length && issue.comments[issue.comments.length - 1].new)
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
		const newIssue = { ...this.issueData, name };
		this.props.setState({ newIssue });
	}

	public handleIssueFormSubmit = (values) => {
		const { teamspace, model, updateIssue, updateNewIssue } = this.props;
		const updatedIssue = mergeIssueData(this.issueData, values);

		if (this.isNewIssue) {
			updateNewIssue(updatedIssue);
		} else {
			updateIssue(teamspace, model, updatedIssue);
		}
	}

	public renderDetailsForm = () => {
		const {issue} = this.props;

		return (
			<IssueDetailsForm
				issue={this.issueData}
				jobs={this.jobsList}
				onValueChange={this.handleIssueFormSubmit}
				onSubmit={this.handleIssueFormSubmit}
				permissions={this.props.settings.permissions}
				currentUser={this.props.currentUser}
				myJob={this.props.myJob}
				onChangePin={this.handleChangePin}
				onSavePin={this.onPositionSave}
				pinId={issue._id}
				hasPin={issue.position && issue.position.length}
			/>
		);
	}

	public removeComment = (index, guid) => {
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

	public renderLogList = renderWhenTrue(() => {
		return (
			<LogList
				innerRef={this.commentsRef}
				items={this.issueData.comments}
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
		const { comments } = this.issueData;

		return (
			<PreviewDetails
				{...this.issueData}
				key={this.issueData._id}
				defaultExpanded={expandDetails}
				editable={!this.issueData._id}
				onNameChange={this.handleNameChange}
				onExpandChange={this.handleExpandChange}
				renderCollapsable={this.renderDetailsForm}
				renderNotCollapsable={() => this.renderLogList(comments && !!comments.length && !this.isNewIssue)}
				handleHeaderClick={() => this.setCameraOnViewpoint({viewpoint: this.issueData.viewpoint})}
				scrolled={this.state.scrolled}
			/>
		);
	});

	public userCanComment() {
		const { myJob, settings, currentUser } = this.props;
		return canComment(this.issueData, myJob, settings.permissions, currentUser.username);
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
				hideComment={this.isNewIssue}
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

		if (this.isNewIssue) {
			this.props.setState({ newIssue: {
				...this.issueData,
				descriptionThumbnail: screenshot
			}});
		} else {
			this.setCommentData({ screenshot, viewpoint });
		}
	}

	public handleChangePin = (pinData) => {
		this.props.showNewPin(this.props.issue, pinData);
	}

	public postComment = async (teamspace, model, {comment, screenshot}) => {
		const viewpoint = await Viewer.getCurrentViewpoint({ teamspace, model });
		const issueCommentData = {
			_id: this.issueData._id,
			rev_id: this.issueData.rev_id,
			comment,
			viewpoint: {
				...viewpoint,
				screenshot
			}
		};

		this.props.postComment(teamspace, model, issueCommentData);
	}

	public handleSave = (formValues) => {
		const { teamspace, model, saveIssue, revision } = this.props;
		if (this.isNewIssue) {
			saveIssue(teamspace, model, this.issueData, revision);
		} else {
			this.postComment(teamspace, model, formValues);
		}
	}

	public onPositionSave = (position) => {
		if (this.props.issue._id) {
			const { teamspace, model, issue } = this.props;
			this.props.updateIssue(teamspace, model, {...issue, position});
		}
	}

	public renderFailedState = renderWhenTrue(() => {
		return (
			<EmptyStateInfo>Issue failed to load</EmptyStateInfo>
		);
	});

	public render() {
		const { failedToLoad, issue } = this.props;

		return (
			<Container>
				<ViewerPanelContent
					className="height-catcher"
					onScroll={this.handlePanelScroll}
					innerRef={this.panelRef}
				>
					{this.renderFailedState(failedToLoad)}
					{this.renderPreview(!failedToLoad && issue)}
				</ViewerPanelContent>
				{this.renderFooter(!failedToLoad)}
			</Container>
		);
	}
}
