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
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import AutorenewIcon from '@material-ui/icons/Autorenew';

import { ColorPicker } from '../../../../../components/colorPicker/colorPicker.component';

import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { ViewerPanelContent, ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { Container, ColorPickerWrapper, Actions } from './groupDetails.styles';
import { GroupDetailsForm } from './groupDetailsForm.component';
import { mergeGroupData } from '../../../../../../helpers/groups';
import { ViewerPanelButton } from '../../../viewerPanel/viewerPanel.styles';
import { getGroupRGBAColor } from '../../../../../../helpers/colors';

interface IProps {
	group: any;
	teamspace: string;
	model: string;
	expandDetails: boolean;
	myJob: any;
	currentUser: any;
	modelSettings: any;
	GroupTypeIconComponent: any;
	totalMeshes: number;
	saveGroup: (teamspace, modelId, risk) => void;
	updateGroup: (teamspace, modelId, risk) => void;
	updateNewGroup: (newRisk) => void;
	setState: (componentState) => void;
}
interface IState {
	groupColor: string;
}

export class GroupDetails extends React.PureComponent<IProps, IState> {
	public state = {
		groupColor: undefined
	};

	public componentDidMount() {
		if (this.props.group.color) {
			this.setState({
				groupColor: getGroupRGBAColor(this.props.group.color)
			});
		}
	}

	get isNewGroup() {
		return !this.props.group._id;
	}

	get groupData() {
		const groupData = {
			...this.props.group,
			createdDate: this.props.group.createdAt,
			roleColor: this.state.groupColor
	};
		return groupData;
	}

	public handleGroupFormSubmit = (values) => {
		console.log('Handle group from Submit', values);

		const { teamspace, model, updateGroup, updateNewGroup } = this.props;
		const updatedGroup = mergeGroupData(this.groupData, values);

		if (this.isNewGroup) {
			updateNewGroup(updatedGroup);
		} else {
			updateGroup(teamspace, model, updatedGroup);
		}
	}

	public handleExpandChange = (event, expanded) => {
		this.props.setState({ expandDetails: expanded });
	}

	public handleSave = () => {
		const { teamspace, model, saveGroup } = this.props;
		saveGroup(teamspace, model, this.groupData);
	}

	public handleNameChange = (event, name) => {
		const newRisk = { ...this.groupData, name };
		this.props.setState({ newRisk });
	}

	public renderPreview = renderWhenTrue(() => (
		<PreviewDetails
			key={this.groupData._id}
			{...this.groupData}
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
			/>
		</PreviewDetails>
	));

	public handleColorChange = (color) => {
		this.setState({
			groupColor: color
		});
	}

	public renderFooter = renderWhenTrue(() => (
		<ViewerPanelFooter alignItems="center">
			<Actions>
				<ColorPickerWrapper>
					<ColorPicker
						disableUnderline={true}
						value={this.state.groupColor}
						onChange={this.handleColorChange}
					/>
				</ColorPickerWrapper>
				<IconButton
					aria-label="Reset to saved selection"
					aria-haspopup="true"
				>
					<AutorenewIcon />
				</IconButton>
			</Actions>
			<ViewerPanelButton
				variant="fab"
				color="secondary"
				type="submit"
				mini={true}
				aria-label="Save group"
			>
				<SaveIcon />
			</ViewerPanelButton>
		</ViewerPanelFooter>
	));

	public render() {
		return (
			<Container>
				<ViewerPanelContent className="height-catcher">
					{this.renderPreview(this.props.group)}
				</ViewerPanelContent>
				{this.renderFooter(this.groupData._id)}
			</Container>
		);
	}
}
