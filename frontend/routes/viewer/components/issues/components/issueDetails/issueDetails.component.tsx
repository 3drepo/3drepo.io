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
import { LogList } from '../../../../../components/logList/logList.component';

interface IProps {
	jobs: any[];
	issue: any;
	teamspace: string;
	model: string;
	expandDetails: boolean;
	logs: any[];
	fetchingDetailsIsPending: boolean;
	setState: (componentState) => void;
	fetchIssue: (teamspace, model, issueId) => void;
}

interface IState {
	logsLoaded: boolean;
}

const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};

export class IssueDetails extends React.PureComponent<IProps, IState> {
	public state = {
		logsLoaded: false
	};

	get issueData() {
		return prepareIssue(this.props.issue);
	}

	get jobsList() {
		return [...this.props.jobs, UNASSIGNED_JOB];
	}

	public componentDidMount() {
		const { teamspace, model, fetchIssue, issue } = this.props;
		fetchIssue(teamspace, model, issue._id);
	}

	public handleExpandChange = (event, expanded) => {
		this.props.setState({ expandDetails: expanded });
	}

	public handleNameChange = (event, name) => {
		const newIssue = { ...this.issueData, name };
		this.props.setState({ newIssue });
	}

	public renderDetailsForm = () => {
		return (
			<IssueDetailsForm
				issue={this.issueData}
				jobs={this.jobsList}
			/>
		);
	}

	public renderLogList = () => {
		return (
			<LogList items={this.props.logs} isPending={this.props.fetchingDetailsIsPending} />
		);
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
				renderCollapsable={this.renderDetailsForm}
				renderNotCollapsable={() => this.renderLogList()}
			/>
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
