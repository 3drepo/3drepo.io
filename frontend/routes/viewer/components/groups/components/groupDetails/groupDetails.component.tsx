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
import { ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { ViewerPanelButton } from '../../../viewerPanel/viewerPanel.styles';
import { ICriteriaFieldState } from '../../../../../../modules/groups/groups.redux';
import { CriteriaField } from '../../../../../components/criteriaField/criteriaField.component';
import { GROUPS_TYPES, GROUP_PANEL_NAME, GROUP_TYPES_ICONS } from '../../../../../../constants/groups';
import { Container, Content, ColorPickerWrapper, Actions } from './groupDetails.styles';
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
}
interface IState {
	isFormValid: boolean;
	isFormDirty: boolean;
}

export class GroupDetails extends React.PureComponent<IProps, IState> {
	public state = {
		isFormValid: false,
		isFormDirty: false
	};

	public formRef = React.createRef<HTMLElement>() as any;

	public componentDidMount() {
		if (!this.isNewGroup) {
			this.props.setState({ newGroup: { ...this.groupData }});
		} else {
			this.props.setState({ isFormValid: true });
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

	get isFormValid() {
		if (this.isNewGroup) {
			return this.state.isFormValid;
		}

		return this.state.isFormDirty && this.state.isFormValid && this.hasValidRules;
	}

	public handleGroupFormSubmit = () => {
		const { teamspace, model, revision, updateGroup, createGroup } = this.props;
		const { name, description, type, color, rules } = this.groupData;

		this.formRef.current.formikRef.current.resetForm({name, description, type, color, rules});
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
			key={`${this.groupData._id}.${this.groupData.updateDate}`}
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
			createdDate={this.groupData.createdDate}
			editable={this.props.canUpdate}
			onNameChange={this.handleFieldChange}
			renderCollapsable={this.renderGroupForm}
			renderNotCollapsable={() => this.renderRulesField(this.groupData.type === GROUPS_TYPES.SMART)}
			disableExpanding
			panelName={GROUP_PANEL_NAME}
			StatusIconComponent={GROUP_TYPES_ICONS[this.groupData.type]}
		/>
	));

	public setIsFormValid = (isFormValid) => {
		this.setState({ isFormValid });
	}

	public setIsFormDirty = (isFormDirty) => {
		this.setState({ isFormDirty });
	}

	public renderFooter = () => {
		return (
			<ViewerPanelFooter alignItems="center">
				<Actions>
					<ColorPickerWrapper>
						<ColorPicker
							value={this.groupData.color}
							onChange={this.handleColorChange}
							disabled={!this.props.canUpdate}
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
					disabled={!this.isFormValid || !this.props.canUpdate}
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
					className="height-catcher"
					padding="0"
				>
					{this.renderPreview(this.groupData)}
				</Content>
				{this.renderFooter()}
			</Container>
		);
	}
}
