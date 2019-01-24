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
import { Container } from '../../../risks/components/riskDetails/riskDetails.styles';
import { ViewerPanelContent, ViewerPanelFooter, ViewerPanelButton } from '../../../viewerPanel/viewerPanel.styles';
import { IssueDetailsForm } from './issueDetailsForm.component';
import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { prepareIssue } from '../../../../../../helpers/issues';

interface IProps {
	jobs: any[];
	issue: any;
	teamspace: string;
	model: string;
	expandDetails: boolean;
	setState: (componentState) => void;
	fetchIssue: (teamspace, model, issueId) => void;
}

const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};

export class IssueDetails extends React.PureComponent<IProps, any> {
	get issueData() {
		return prepareIssue(this.props.issue);
	}

	get jobsList() {
		return [...this.props.jobs, UNASSIGNED_JOB];
	}

	public componentDidUpdate(prevProps) {
		const { teamspace, model, fetchIssue, issue } = this.props;

		if (!prevProps.issue._id && issue._id) {
			fetchIssue(teamspace, model, issue._id);
		}
	}

	public handleExpandChange = (event, expanded) => {
		this.props.setState({ expandDetails: expanded });
	}

	public handleNameChange = (event, name) => {
		const newIssue = { ...this.issueData, name };
		this.props.setState({ newIssue });
	}

	public renderPreview = renderWhenTrue(() => {
		return (
			<PreviewDetails
				key={this.issueData._id}
				{...this.issueData}
				defaultExpanded={this.props.expandDetails}
				editable={!this.issueData._id}
				onNameChange={this.handleNameChange}
				onExpandChange={this.handleExpandChange}
			>
				<IssueDetailsForm
					issue={this.issueData}
					jobs={this.jobsList}
				/>
			</PreviewDetails>
		);
	});

	public render() {
		return (
			<Container>
				<ViewerPanelContent className="height-catcher">
					{this.renderPreview(this.props.issue)}
				</ViewerPanelContent>
			</Container>
		);
	}
}
