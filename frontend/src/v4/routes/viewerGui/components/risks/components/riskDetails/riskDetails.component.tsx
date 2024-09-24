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

import { createRef, PureComponent, Fragment } from 'react';

import { size } from 'lodash';

import { diffData, mergeData } from '../../../../../../helpers/forms';
import { isViewer } from '../../../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { canChangeBasicProperty, canComment } from '../../../../../../helpers/risks';
import { EmptyStateInfo } from '../../../../../components/components.styles';
import { Copy } from '../../../../../components/fontAwesomeIcon';
import { ScreenshotDialog } from '../../../../../components/screenshotDialog';
import { CommentForm } from '../../../commentForm';
import { ContainedButton } from '../../../containedButton/containedButton.component';
import { ViewerPanelContent, ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { Container, HorizontalView, MessagesList, MessageContainer, PreviewDetails } from './riskDetails.styles';
import { RiskDetailsForm } from './riskDetailsForm.component';

interface IProps {
	viewer: any;
	jobs: any[];
	filteredRisks: any[];
	risks: any[];
	risk: any;
	comments: any[];
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
	disableViewer?: boolean;
	horizontal?: boolean;
	setState: (componentState) => void;
	fetchRisk: (teamspace, model, riskId) => void;
	saveRisk: (teamspace, modelId, risk, revision, finishSubmitting, disableViewer) => void;
	updateRisk: (risk) => void;
	cloneRisk: (dialogId?: string) => void;
	postComment: (teamspace, modelId, riskData, ignoreViewer, finishSubmitting) => void;
	removeComment: (teamspace, modelId, riskData) => void;
	subscribeOnRiskCommentsChanges: (teamspace, modelId, riskId) => void;
	unsubscribeOnRiskCommentsChanges: (teamspace, modelId, riskId) => void;
	updateNewRisk: (newRisk) => void;
	setCameraOnViewpoint: (teamspace, modelId, view) => void;
	updateSelectedRiskPin: (position) => void;
	onRemoveResource: (resource) => void;
	attachFileResources: (files) => void;
	attachLinkResources: (links) => void;
	showDialog: (config: any) => void;
	fetchMitigationCriteria: (teamspace: string) => void;
	criteria: any;
	showMitigationSuggestions: (conditions: any, setFieldValue) => void;
	showScreenshotDialog: (config: any) => void;
	showConfirmDialog: (config: any) => void;
	dialogId?: string;
	postCommentIsPending?: boolean;
	updateViewpoint: (screenshot?: string) => void;
	showSequenceDate: (date) => void;
	setMeasureMode: (measureMode) => void;
	removeMeasurement: (uuid) => void;
	setMeasurementColor: (uuid, color) => void;
	setMeasurementName: (uuid, type, name) => void;
	setActiveRisk: (risk, revision, ignoreViewer) => void;
	minSequenceDate: Date;
	maxSequenceDate: Date;
	selectedDate: Date;
	sequences: any[];
	units: string;
	measureMode: string;
}

interface IState {
	logsLoaded: boolean;
	scrolled: boolean;
	listIndex: number;
}

const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};

export class RiskDetails extends PureComponent<IProps, IState> {
	public state = {
		logsLoaded: false,
		scrolled: false,
		listIndex: (this.props.filteredRisks || []).findIndex(({ _id }) => _id === this.props.risk._id),
	};

	public formRef = createRef<any>();
	public commentRef = createRef<any>();
	public panelRef = createRef<any>();
	public containerRef = createRef<any>();
	public messageContainerRef = createRef<any>();

	get isNewRisk() {
		return !this.props.risk._id;
	}

	get riskData() {
		return this.props.risk;
	}

	get criteria() {
		return this.props.criteria;
	}

	get jobsList() {
		return [...this.props.jobs, UNASSIGNED_JOB];
	}

	get canEditBasicProperty() {
		const { risk, myJob, currentUser } = this.props;
		return this.isNewRisk || canChangeBasicProperty(risk, myJob, this.props.modelSettings.permissions, currentUser);
	}

	get actionButton() {
		const hasViewerPermissions = isViewer(this.props.modelSettings.permissions);

		return renderWhenTrue(() => (
			<ContainedButton
				icon={Copy}
				onClick={() => this.props.cloneRisk(this.props.dialogId)}
			>
				Clone
			</ContainedButton>
		))(!this.isNewRisk && !hasViewerPermissions);
	}

	public renderMessagesList = renderWhenTrue(() => (
		<MessagesList
			formRef={this.formRef}
			commentRef={this.commentRef}
			messages={this.props.comments}
			isPending={this.props.fetchingDetailsIsPending}
			removeMessage={this.removeMessage}
			teamspace={this.props.teamspace}
			currentUser={this.props.currentUser.username}
			setCameraOnViewpoint={this.setCameraOnViewpoint}
		/>
	));

	public renderPreview = renderWhenTrue(() => {
		const { expandDetails, horizontal, failedToLoad, disableViewer } = this.props;
		const isRiskWithComments = Boolean(!this.isNewRisk);
		const PreviewWrapper = horizontal && isRiskWithComments ? HorizontalView : Fragment;
		const renderNotCollapsable = () => this.renderMessagesList(!horizontal && isRiskWithComments);

		return (
			<PreviewWrapper>
				<PreviewDetails
					{...this.riskData}
					id={this.riskData._id}
					type="risk"
					key={`${this.riskData._id}${size(this.criteria)}`}
					defaultExpanded={horizontal || expandDetails}
					editable={this.canEditBasicProperty}
					onNameChange={this.handleNameChange}
					onExpandChange={this.handleExpandChange}
					renderCollapsable={this.renderDetailsForm}
					renderNotCollapsable={!horizontal ? renderNotCollapsable : null}
					handleHeaderClick={this.handleHeaderClick}
					scrolled={this.state.scrolled && !horizontal}
					isNew={this.isNewRisk}
					showModelButton={disableViewer && !this.isNewRisk}
					actionButton={this.actionButton}
				/>
				<MessageContainer ref={this.messageContainerRef}>
					{this.renderMessagesList(horizontal && isRiskWithComments)}
					{this.renderFooter(horizontal && !failedToLoad)}
				</MessageContainer>
			</PreviewWrapper>
		);
	});

	public renderFooter = renderWhenTrue(() => (
		<ViewerPanelFooter container alignItems="center" padding="0">
			<CommentForm
				disableViewer={this.props.disableViewer}
				comment={this.props.newComment.comment}
				screenshot={this.props.newComment.screenshot}
				viewpoint={this.props.newComment.viewpoint}
				formRef={this.formRef}
				commentRef={this.commentRef}
				onTakeScreenshot={this.handleNewScreenshot}
				onSave={this.handleSave}
				canComment={this.userCanComment()}
				hasNoPermission={!this.canEditBasicProperty}
				hideComment={this.isNewRisk}
				hideScreenshot={this.props.disableViewer || this.isNewRisk}
				hideUploadButton={this.isNewRisk}
				messagesContainerRef={this.messageContainerRef}
				previewWrapperRef={this.containerRef}
				horizontal={this.props.horizontal}
				fetchingDetailsIsPending={this.props.fetchingDetailsIsPending}
				tickets={this.props.risks}
				postCommentIsPending={this.props.postCommentIsPending}
				parentId={'risks-card'}
			/>
		</ViewerPanelFooter>
	));

	public renderFailedState = renderWhenTrue(() => {
		return (
			<EmptyStateInfo>Risk failed to load</EmptyStateInfo>
		);
	});

	public componentDidMount() {
		const { teamspace, model, fetchRisk, risk, subscribeOnRiskCommentsChanges, fetchMitigationCriteria } = this.props;

		if (risk._id) {
			fetchRisk(teamspace, model, risk._id);
			subscribeOnRiskCommentsChanges(teamspace, model, risk._id);
		}
	}

	public componentWillUnmount() {
		const { teamspace, model, risk, filteredRisks, revision, setActiveRisk, unsubscribeOnRiskCommentsChanges } = this.props;
		unsubscribeOnRiskCommentsChanges(teamspace, model, risk._id);

		if (filteredRisks.find(({ _id }) => _id === risk._id)) {
			// item is part of the filtered items list, no action required
			return;
		}

		const { listIndex } = this.state;
		if (filteredRisks.length && listIndex < filteredRisks.length) {
			// set next item in the list as active
			setActiveRisk(filteredRisks[listIndex % filteredRisks.length], revision, false);
			return;
		}

		// the item was not in the filtered list
		setActiveRisk({}, null, true);
	}

	public componentDidUpdate(prevProps) {
		const {
			teamspace, model, fetchRisk, risk, unsubscribeOnRiskCommentsChanges, subscribeOnRiskCommentsChanges,
		} = this.props;

		if (risk._id !== prevProps.risk._id && risk._id) {
			unsubscribeOnRiskCommentsChanges(prevProps.teamspace, prevProps.model, prevProps.risk._id);
			fetchRisk(teamspace, model, risk._id);
			subscribeOnRiskCommentsChanges(teamspace, model, risk._id);
		}

		const newListIndex = (this.props.filteredRisks || []).findIndex(({ _id }) => _id === this.props.risk._id);
		if (newListIndex !== -1) {
			this.setState({ ...this.state, listIndex: newListIndex });
		}
	}

	public handleHeaderClick = () => {
		if (!this.isNewRisk) { // if its a new issue it shouldnt go to the viewpoint
			this.setCameraOnViewpoint({ viewpoint: this.riskData.viewpoint });
		}
	}

	public handleExpandChange = (event, expanded) => {
		this.props.setState({ expandDetails: expanded });
	}

	public handleNameChange = (event, name) => {
		const newRisk = { ...this.riskData, name };
		this.props.setState({ newRisk });

		if (!this.isNewRisk) {
			this.props.updateRisk({name});
		}
	}

	public handleRiskFormSubmit = (values) => {
		const { updateRisk, updateNewRisk } = this.props;

		if (this.isNewRisk) {
			updateNewRisk(mergeData(this.riskData, values));
		} else {
			updateRisk(diffData(values, this.riskData));
		}
	}

	public renderDetailsForm = () => {
		const {
			onRemoveResource, showDialog, currentUser, myJob, attachFileResources, attachLinkResources, updateSelectedRiskPin,
		} = this.props;

		return (
			<RiskDetailsForm
				risk={this.riskData}
				jobs={this.jobsList}
				criteria={this.criteria}
				onValueChange={this.handleRiskFormSubmit}
				onSubmit={this.handleRiskFormSubmit}
				permissions={this.props.modelSettings.permissions}
				currentUser={currentUser}
				myJob={myJob}
				onUploadScreenshot={this.handleUpdateScreenshot}
				onTakeScreenshot={this.handleTakeScreenshot}
				showScreenshotDialog={this.props.showScreenshotDialog}
				onUpdateViewpoint={this.onUpdateRiskViewpoint}
				onChangePin={updateSelectedRiskPin}
				onSavePin={this.onPositionSave}
				hasPin={!this.props.disableViewer && this.riskData.position && this.riskData.position.length}
				disableViewer={this.props.disableViewer}
				onRemoveResource={onRemoveResource}
				attachFileResources={attachFileResources}
				attachLinkResources={attachLinkResources}
				showDialog={showDialog}
				canComment={this.userCanComment()}
				canEditBasicProperty={this.canEditBasicProperty}
				showMitigationSuggestions={this.props.showMitigationSuggestions}
				formRef={this.formRef}
				{...this.props}
			/>
		);
	}

	public removeMessage = (index, guid) => {
		const riskData = {
			_id: this.riskData._id,
			rev_id: this.riskData.rev_id,
			riskNumber: this.riskData.number,
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
			this.setState({ scrolled: true, listIndex: this.state.listIndex });
		}
		if (e.target.scrollTop === 0 && this.state.scrolled) {
			this.setState({ scrolled: false, listIndex: this.state.listIndex });
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

	public handleNewScreenshot = (screenshot) => {
		if (this.isNewRisk) {
			this.props.setState({ newRisk: {
				...this.riskData,
				descriptionThumbnail: screenshot
			}});
		} else {
			this.setCommentData({ screenshot });
		}
	}

	public postComment = (teamspace, model, { comment, screenshot }, finishSubmitting) => {
		const { disableViewer } = this.props;

		const riskCommentData = {
			_id: this.riskData._id,
			rev_id: this.riskData.rev_id,
			comment,
			viewpoint: { screenshot }
		};

		this.props.postComment(teamspace, model, riskCommentData, disableViewer, finishSubmitting);
	}

	public handleSave = (formValues, finishSubmitting) => {
		const { teamspace, model, saveRisk, revision, disableViewer } = this.props;
		if (this.isNewRisk) {
			saveRisk(teamspace, model, this.riskData, revision, finishSubmitting, disableViewer);
		} else {
			this.postComment(teamspace, model, formValues, finishSubmitting);
		}
	}

	public onPositionSave = () => {
		const {risk, updateRisk } = this.props;

		if (risk._id) {
			updateRisk({ position: risk.position });
		}
	}

	public handleUpdateScreenshot =
		(screenshot, disableViewpointSuggestion = false, forceViewpointUpdate = false) => {
		const { updateRisk, disableViewer, risk } = this.props;

		if (this.isNewRisk) {
			this.props.setState({ newRisk: {
					...this.riskData,
					descriptionThumbnail: screenshot
				}});
		} else {
			if (screenshot) {
				const viewpoint = { ...risk.viewpoint, screenshot };

				if (!disableViewpointSuggestion && !disableViewer) {
					this.handleViewpointUpdateSuggest(viewpoint);
				} else {

					if (forceViewpointUpdate) {
						this.handleViewpointUpdate(viewpoint);
					} else {
						updateRisk({ viewpoint });
					}
				}
			}
		}
	}

	public handleTakeScreenshot = (disableViewpointSuggestion: boolean, forceViewpointUpdate) => {
		const { showScreenshotDialog, viewer } = this.props;

		showScreenshotDialog({
			sourceImage: viewer.getScreenshot(),
			onSave: (screenshot) => this.handleUpdateScreenshot(screenshot, disableViewpointSuggestion, forceViewpointUpdate),
			template: ScreenshotDialog,
			notFullScreen: true,
		});
	}

	public handleViewpointUpdateSuggest = (viewpoint) => {
		const { showConfirmDialog, updateRisk } = this.props;
		showConfirmDialog({
			title: 'Save Viewpoint?',
			content: `
				Would you like to update the viewpoint to your current position?
			`,
			onConfirm: () => this.handleViewpointUpdate(viewpoint),
			onCancel: () => updateRisk({ viewpoint })
		});
	}

	public handleViewpointUpdate = (viewpoint?) => {
		const { updateViewpoint } = this.props;
		return updateViewpoint(viewpoint?.screenshot || this.riskData.descriptionThumbnail);
	}

	public onUpdateRiskViewpoint = () => {
		this.props.showConfirmDialog({
			title: 'Save Screenshot?',
			content: `
				Would you like to create a new screenshot?
			`,
			onConfirm: () => {
				this.handleTakeScreenshot(true, true);
			},
			onCancel: () => this.handleViewpointUpdate()
		});
	}

	public render() {
		const { failedToLoad, risk, horizontal } = this.props;
		return (
			<Container ref={this.containerRef} $fill={Boolean(this.isNewRisk)}>
				<ViewerPanelContent
					onScroll={this.handlePanelScroll}
					ref={this.panelRef}
				>
					{this.renderFailedState(failedToLoad)}
					{this.renderPreview(!failedToLoad && risk)}
				</ViewerPanelContent>
				{this.renderFooter(!failedToLoad && !horizontal)}
			</Container>
		);
	}
}
