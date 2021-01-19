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

import React from 'react';

import AutorenewIcon from '@material-ui/icons/Autorenew';
import Delete from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';

import { GROUP_PANEL_NAME, GROUP_TYPES_ICONS, GROUPS_TYPES } from '../../../../../../constants/groups';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { ICriteriaFieldState } from '../../../../../../modules/groups/groups.redux';
import { ColorPicker } from '../../../../../components/colorPicker/colorPicker.component';
import { CriteriaField } from '../../../../../components/criteriaField/criteriaField.component';
import { TooltipButton } from '../../../../../teamspaces/components/tooltipButton/tooltipButton.component';
import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { ViewerPanelButton } from '../../../viewerPanel/viewerPanel.styles';
import { Actions, ColorPickerWrapper, Container, Content } from './groupDetails.styles';
import { GroupDetailsForm } from './groupDetailsForm.component';

interface IProps {
	activeGroup: any;
	teamspace: string;
	model: string;
	revision: string;
	expandDetails: boolean;
	currentUser: any;
	modelSettings: any;
	totalMeshes: number;
	canUpdate: boolean;
	selectedNodes: any;
	fieldNames: any[];
	criteriaFieldState: ICriteriaFieldState;
	createGroup: (teamspace, modelId, revision) => void;
	updateGroup: (teamspace, modelId, revision, groupId) => void;
	setState: (componentState) => void;
	setCriteriaState: (criteriaState) => void;
	resetToSavedSelection: () => void;
	isPending: boolean;
	deleteGroup: () => void;
}

interface IState {
	isFormValid: boolean;
	isFormDirty: boolean;
	scrolled: boolean;
}

export class GroupDetails extends React.PureComponent<IProps, IState> {

	get isNewGroup() {
		return !this.props.activeGroup._id;
	}

	get groupData() {
		return this.props.activeGroup;
	}

	get hasValidRules() {
		if (this.groupData.type === GROUPS_TYPES.SMART) {
			return !!this.groupData.rules.length;
		}
		return true;
	}

	get isFormValid() {
		return this.state.isFormDirty && this.state.isFormValid && this.hasValidRules;
	}

	public state = {
		isFormValid: false,
		isFormDirty: false,
		scrolled: false
	};

	public formRef = React.createRef<HTMLElement>() as any;
	public panelRef = React.createRef<any>();

	public renderRulesField = renderWhenTrue(() => (
		<CriteriaField
			name="rules"
			value={this.groupData.rules}
			{...this.props.criteriaFieldState}
			onChange={this.handleFieldChange}
			onCriterionSelect={this.handleCriterionSelect}
			setState={this.props.setCriteriaState}
			label="Filters"
			placeholder="Select first filter"
			disabled={!this.props.canUpdate}
			fieldNames={this.props.fieldNames}
		/>
	));

	public renderPreview = renderWhenTrue(() => (
		<PreviewDetails
			key={this.groupData._id}
			{...this.groupData}
			roleColor={this.groupData.color}
			created={this.groupData.createdAt}
			editable={this.props.canUpdate}
			onNameChange={this.handleFieldChange}
			renderCollapsable={this.renderGroupForm}
			renderNotCollapsable={() => this.renderRulesField(this.groupData.type === GROUPS_TYPES.SMART)}
			panelName={GROUP_PANEL_NAME}
			isSmartGroup={this.groupData.type === GROUPS_TYPES.SMART}
			StatusIconComponent={GROUP_TYPES_ICONS[this.groupData.type]}
			scrolled={this.state.scrolled}
			isNew={this.isNewGroup}
		/>
	));

	public componentDidMount() {
		if (!this.isNewGroup) {
			this.props.setState({ newGroup: { ...this.groupData }});
		} else {
			this.props.setState({ isFormValid: true });
		}
	}

	public handleGroupFormSubmit = () => {
		const { teamspace, model, revision, updateGroup, createGroup } = this.props;
		const { name, desc, type, color, rules } = this.groupData;

		this.formRef.current.formikRef.current.resetForm({name, desc, type, color, rules});
		if (this.isNewGroup) {
			createGroup(teamspace, model, revision);
		} else {
			updateGroup(teamspace, model, revision, this.groupData._id);
		}
	}

	public handleFieldChange = (event) => {
		this.props.setState({
			newGroup: {
				...this.groupData,
				[event.target.name]: event.target.value
			}
		});
	}

	public handleColorChange = (color) => {
		this.props.setState({
			newGroup: {
				...this.groupData, color
			}
		});
		this.setIsFormValid(true);
	}

	public renderGroupForm = () => (
		<GroupDetailsForm
			ref={this.formRef}
			key={`${this.groupData._id}.${this.groupData.updatedAt}`}
			group={this.groupData}
			onSubmit={this.handleGroupFormSubmit}
			currentUser={this.props.currentUser}
			totalMeshes={this.props.totalMeshes}
			canUpdate={this.props.canUpdate}
			setIsFormValid={this.setIsFormValid}
			setIsFormDirty={this.setIsFormDirty}
			fieldNames={this.props.fieldNames}
			handleChange={this.handleFieldChange}
			selectedNodes={this.props.selectedNodes}
		/>
	)

	public handleCriterionSelect = (criterion) => {
		this.props.setCriteriaState({ criterionForm: criterion });
	}

	public handlePanelScroll = (e) => {
		if (e.target.scrollHeight > e.target.offsetHeight + e.target.scrollTop) {
			if (e.target.scrollTop > 0 && !this.state.scrolled) {
				this.setState({ scrolled: true });
			}
			if (e.target.scrollTop === 0 && this.state.scrolled) {
				this.setState({ scrolled: false });
			}
		} else {
			if (this.state.scrolled) {
				this.setState({ scrolled: false });
			}
		}
	}

	public setIsFormValid = (isFormValid) => {
		this.setState({ isFormValid });
	}

	public setIsFormDirty = (isFormDirty) => {
		this.setState({ isFormDirty });
	}

	public renderFooter = () => {
		return (
			<ViewerPanelFooter container alignItems="center">
				<Actions>
					<ColorPickerWrapper>
						<ColorPicker
							value={this.groupData.color}
							onChange={this.handleColorChange}
							disabled={!this.props.canUpdate}
							opacityEnabled
						/>
					</ColorPickerWrapper>
					<TooltipButton
						label="Reset to saved selection"
						action={this.props.resetToSavedSelection}
						Icon={AutorenewIcon}
					/>
					<TooltipButton
						label="Delete"
						action={this.props.deleteGroup}
						Icon={Delete}
						disabled={!this.props.canUpdate}
					/>
				</Actions>
				<ViewerPanelButton
					variant="fab"
					color="secondary"
					type="submit"
					onClick={this.handleGroupFormSubmit}
					size="small"
					aria-label="Save group"
					disabled={!this.isFormValid || !this.props.canUpdate}
					pending={this.props.isPending}
					id="groups-card-save-button"
				>
					<SaveIcon />
				</ViewerPanelButton>
			</ViewerPanelFooter>
		);
	}

	public render() {
		return (
			<Container>
				<Content
					onScroll={this.handlePanelScroll}
					ref={this.panelRef}
				>
					{this.renderPreview(this.groupData)}
				</Content>
				{this.renderFooter()}
			</Container>
		);
	}
}
