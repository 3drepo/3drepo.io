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

import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { ViewerPanelContent, ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { Container } from './groupDetails.styles';
import { GroupDetailsForm } from './groupDetailsForm.component';
import { mergeGroupData } from '../../../../../../helpers/groups';

interface IProps {
	group: any;
	teamspace: string;
	model: string;
	expandDetails: boolean;
	myJob: any;
	currentUser: any;
	modelSettings: any;
	saveGroup: (teamspace, modelId, risk) => void;
	updateGroup: (teamspace, modelId, risk) => void;
	updateNewGroup: (newRisk) => void;
	setState: (componentState) => void;
}

export class GroupDetails extends React.PureComponent<IProps, any> {
	get isNewGroup() {
		return !this.props.group._id;
	}

	get groupData() {
		return this.props.group;
	}

	public handleGroupFormSubmit = (values) => {
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
		>
			<GroupDetailsForm
				group={this.groupData}
				onValueChange={this.handleGroupFormSubmit}
				onSubmit={this.handleGroupFormSubmit}
				currentUser={this.props.currentUser}
			/>
		</PreviewDetails>
	));

	public renderFooter = renderWhenTrue(() => (
		<ViewerPanelFooter alignItems="center">
			Test
		</ViewerPanelFooter>
	));

	public render() {
		return (
			<Container>
				<ViewerPanelContent className="height-catcher">
					{this.renderPreview(this.props.group)}
				</ViewerPanelContent>
				{this.renderFooter(!this.groupData._id)}
			</Container>
		);
	}
}
