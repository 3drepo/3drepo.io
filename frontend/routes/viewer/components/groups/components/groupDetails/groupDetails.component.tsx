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
import SaveIcon from '@material-ui/icons/Save';
import AutorenewIcon from '@material-ui/icons/Autorenew';

import { ColorPicker } from '../../../../../components/colorPicker/colorPicker.component';
import { TooltipButton } from '../../../../../teamspaces/components/tooltipButton/tooltipButton.component';

import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { ViewerPanelContent, ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { Container, ColorPickerWrapper, Actions } from './groupDetails.styles';
import { GroupDetailsForm } from './groupDetailsForm.component';
import { ViewerPanelButton } from '../../../viewerPanel/viewerPanel.styles';
import { ICriteriaFieldState } from '../../../../../../modules/groups/groups.redux';
import { CriteriaField } from '../../../../../components/criteriaField/criteriaField.component';
import { GROUPS_TYPES, GROUP_PANEL_NAME } from '../../../../../../constants/groups';

interface IProps {
	activeGroup: any;
	teamspace: string;
	model: string;
	expandDetails: boolean;
	currentUser: any;
	modelSettings: any;
	totalMeshes: number;
	canUpdate: boolean;
	selectedNodes: any;
	fieldNames: any[];
	criteriaFieldState: ICriteriaFieldState;
	createGroup: (teamspace, modelId) => void;
	updateGroup: (teamspace, modelId, groupId) => void;
	setState: (componentState) => void;
	setCriteriaState: (criteriaState) => void;
	resetToSavedSelection: () => void;
}
interface IState {
	isFormValid: boolean;
}

export class GroupDetails extends React.PureComponent<IProps, IState> {
	public state = {
		isFormValid: false
	};

	public componentDidMount() {
		if (!this.isNewGroup) {
			this.props.setState({ newGroup: { ...this.groupData }});
		}
	}

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

	public handleGroupFormSubmit = () => {
		const { teamspace, model, updateGroup, createGroup } = this.props;

		if (this.isNewGroup) {
			createGroup(teamspace, model);
		} else {
			updateGroup(teamspace, model, this.groupData._id);
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
			key={`${this.groupData._id}.${this.groupData.updateDate}`}
			group={this.groupData}
			onSubmit={this.handleGroupFormSubmit}
			currentUser={this.props.currentUser}
			totalMeshes={this.props.totalMeshes}
			canUpdate={this.props.canUpdate}
			setIsFormValid={this.setIsFormValid}
			fieldNames={this.props.fieldNames}
			handleChange={this.handleFieldChange}
		/>
	)

	public handleCriterionSelect = (criterion) => {
		this.props.setCriteriaState({ criterionForm: criterion });
	}

	public renderRulesField = renderWhenTrue(() => (
		<CriteriaField
			name="rules"
			value={this.groupData.rules}
			{...this.props.criteriaFieldState}
			onChange={this.handleFieldChange}
			onCriterionSelect={this.handleCriterionSelect}
			setState={this.props.setCriteriaState}
			label="Criteria"
			placeholder="Select first criteria"
			disabled={!this.props.canUpdate}
			fieldNames={this.props.fieldNames}
		/>
	));

	public renderPreview = renderWhenTrue(() => (
		<PreviewDetails
			key={this.groupData._id}
			{...this.groupData}
			roleColor={this.groupData.color}
			createdDate={this.groupData.createdDate}
			editable={!this.groupData._id}
			onNameChange={this.handleFieldChange}
			renderCollapsable={this.renderGroupForm}
			renderNotCollapsable={() => this.renderRulesField(this.groupData.type === GROUPS_TYPES.SMART)}
			disableExpanding
			panelName={GROUP_PANEL_NAME}
		/>
	));

	public setIsFormValid = (isFormValid) => {
		this.setState({ isFormValid });
	}

	public renderFooter = () => {
		return (
			<ViewerPanelFooter alignItems="center">
				<Actions>
					<ColorPickerWrapper>
						<ColorPicker
							disableUnderline={true}
							value={this.groupData.color}
							onChange={this.handleColorChange}
						/>
					</ColorPickerWrapper>
					<TooltipButton
						label="Reset to saved selection"
						action={this.props.resetToSavedSelection}
						Icon={AutorenewIcon}
					/>
				</Actions>
				<ViewerPanelButton
					variant="fab"
					color="secondary"
					type="submit"
					onClick={this.handleGroupFormSubmit}
					mini={true}
					aria-label="Save group"
					disabled={!this.state.isFormValid || !this.hasValidRules}
				>
					<SaveIcon />
				</ViewerPanelButton>
			</ViewerPanelFooter>
		);
	}

	public render() {
		return (
			<Container>
				<ViewerPanelContent className="height-catcher">
					{this.renderPreview(this.groupData)}
				</ViewerPanelContent>
				{this.renderFooter()}
			</Container>
		);
	}
}
