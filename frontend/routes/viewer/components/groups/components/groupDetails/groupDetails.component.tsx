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
import { getGroupRGBAColor, hexToArray } from '../../../../../../helpers/colors';

interface IProps {
	group: any;
	newGroup: any;
	teamspace: string;
	model: string;
	expandDetails: boolean;
	currentUser: any;
	modelSettings: any;
	GroupTypeIconComponent: any;
	totalMeshes: number;
	canUpdate: boolean;
	selectedNodes: any;
	fieldNames: any[];
	createGroup: (teamspace, modelId) => void;
	updateGroup: (teamspace, modelId, groupId) => void;
	setState: (componentState) => void;
	selectGroup: () => void;
}
interface IState {
	groupColor: any[];
	isFormValid: boolean;
}

export class GroupDetails extends React.PureComponent<IProps, IState> {
	public state = {
		groupColor: undefined,
		isFormValid: false
	};

	public componentDidMount() {
		if (this.props.group.color) {
			this.setState({
				groupColor: this.props.group.color
			});
		}

		if (!this.isNewGroup) {
			this.props.setState({
				newGroup: { ...this.groupData }
			});
		}
	}

	public componentDidUpdate(prevProps) {
		if (prevProps.group.color !== this.props.group.color) {
			this.setState({
				groupColor: this.props.group.color
			});
		}
	}

	get isNewGroup() {
		return !this.props.group._id;
	}

	get groupData() {
		return this.props.group;
	}

	public handleGroupFormSubmit = () => {
		const { teamspace, model, updateGroup, createGroup } = this.props;

		if (this.isNewGroup) {
			createGroup(teamspace, model);
		} else {
			updateGroup(teamspace, model, this.groupData._id);
		}
	}

	public handleExpandChange = (event, expanded) => {
		this.props.setState({ expandDetails: expanded });
	}

	public handleNameChange = (event, name) => {
		const newGroup = { ...this.groupData, name };
		this.props.setState({ newGroup });
	}

	public renderPreview = renderWhenTrue(() => (
		<PreviewDetails
			key={this.groupData._id}
			{...this.groupData}
			createdDate={this.props.group.createdAt}
			roleColor={getGroupRGBAColor(this.state.groupColor)}
			defaultExpanded={this.props.expandDetails}
			editable={!this.groupData._id}
			onNameChange={this.handleNameChange}
			onExpandChange={this.handleExpandChange}
			StatusIconComponent={this.props.GroupTypeIconComponent}
		>
			<GroupDetailsForm
				group={this.groupData}
				onValueChange={this.handleGroupFormSubmit}
				onSubmit={this.handleGroupFormSubmit}
				currentUser={this.props.currentUser}
				groupColor={this.state.groupColor}
				totalMeshes={this.props.totalMeshes}
				permissions={this.props.modelSettings.permissions}
				setState={this.props.setState}
				canUpdate={this.props.canUpdate}
				setIsFormValid={this.setIsFormValid}
				selectedNodes={this.props.selectedNodes}
				fieldNames={this.props.fieldNames}
			/>
		</PreviewDetails>
	));

	public handleColorChange = (color) => {
		const newColor = hexToArray(color);
		this.props.setState({
			newGroup: { ...this.props.newGroup, color: newColor }
		});
		this.setState({ groupColor: newColor });
	}

	public setIsFormValid = (isFormValid) => {
		this.setState({ isFormValid });
	}

	public renderFooter = () => (
		<ViewerPanelFooter alignItems="center">
			<Actions>
				<ColorPickerWrapper>
					<ColorPicker
						disableUnderline={true}
						value={getGroupRGBAColor(this.state.groupColor)}
						onChange={this.handleColorChange}
					/>
				</ColorPickerWrapper>
				<TooltipButton
					label="Reset to saved selection"
					action={this.props.selectGroup}
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
				disabled={!this.isNewGroup && !this.state.isFormValid}
			>
				<SaveIcon />
			</ViewerPanelButton>
		</ViewerPanelFooter>
	)

	public render() {
		return (
			<Container>
				<ViewerPanelContent className="height-catcher">
					{this.renderPreview(this.props.group)}
				</ViewerPanelContent>
				{this.renderFooter()}
			</Container>
		);
	}
}
