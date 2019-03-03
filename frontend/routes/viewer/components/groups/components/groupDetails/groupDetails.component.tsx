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
import { GROUPS_TYPES } from '../../../../../../constants/groups';

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
	critieriaFieldState: ICriteriaFieldState;
	createGroup: (teamspace, modelId) => void;
	updateGroup: (teamspace, modelId, groupId) => void;
	setState: (componentState) => void;
	setCriteriaState: (criteriaState) => void;
	selectGroup: () => void;
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

	public handleGroupFormSubmit = () => {
		const { teamspace, model, updateGroup, createGroup } = this.props;

		if (this.isNewGroup) {
			createGroup(teamspace, model);
		} else {
			updateGroup(teamspace, model, this.groupData._id);
		}
	}

	public handleNameChange = (event, name) => {
		const newGroup = { ...this.groupData, name };
		this.props.setState({ newGroup });
	}

	public formRef = React.createRef();

	public renderGroupForm = () => (
		<GroupDetailsForm
			group={this.groupData}
			onSubmit={this.handleGroupFormSubmit}
			currentUser={this.props.currentUser}
			totalMeshes={this.props.totalMeshes}
			setState={this.props.setState}
			canUpdate={this.props.canUpdate}
			setIsFormValid={this.setIsFormValid}
			selectedNodes={this.props.selectedNodes}
			fieldNames={this.props.fieldNames}
			critieriaFieldState={this.props.critieriaFieldState}
			setCriteriaState={this.props.setCriteriaState}
		/>
	)

	public handleRulesChange = (event) => {
		this.props.setState({
			newGroup: {
				...this.groupData,
				rules: event.target.value
			}
		});
	}

	public handleCriterionSelect = (criterion) => {
		this.props.setCriteriaState({ criterionForm: criterion });
	}

	public renderRulesField = () => renderWhenTrue(() => (
		<CriteriaField
			value={this.groupData.rules}
			{...this.props.critieriaFieldState}
			onChange={this.handleRulesChange}
			onCriterionSelect={this.handleCriterionSelect}
			setState={this.props.setCriteriaState}
			label="Criteria"
			placeholder="Select first criteria"
			disabled={!this.props.canUpdate}
			fieldNames={this.props.fieldNames}
		/>
	))(this.groupData.type === GROUPS_TYPES.SMART)

	public renderPreview = renderWhenTrue(() => (
		<PreviewDetails
			key={this.groupData._id}
			{...this.groupData}
			roleColor={this.groupData.color}
			createdDate={this.groupData.createdDate}
			editable={!this.groupData._id}
			onNameChange={this.handleNameChange}
			renderCollapsable={this.renderGroupForm}
			renderNotCollapsable={this.renderRulesField}
			disableExpanding
		/>
	));

	public handleColorChange = (color) => {
		this.props.setState({ newGroup: { ...this.groupData, color }});
	}

	public setIsFormValid = (isFormValid) => {
		debugger;
		this.setState({ isFormValid });
	}

	public renderResetButton = renderWhenTrue(() => (
		<TooltipButton
			label="Reset to saved selection"
			action={this.props.selectGroup}
			Icon={AutorenewIcon}
		/>
	));

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
					{this.renderResetButton(!this.isNewGroup)}
				</Actions>
				<ViewerPanelButton
					variant="fab"
					color="secondary"
					type="submit"
					onClick={this.handleGroupFormSubmit}
					mini={true}
					aria-label="Save group"
					disabled={!this.state.isFormValid}
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
