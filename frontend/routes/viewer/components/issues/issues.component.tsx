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
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import PinDrop from '@material-ui/icons/PinDrop';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { ViewerPanelContent, ViewerPanelFooter, ViewerPanelButton } from '../viewerPanel/viewerPanel.styles';
import { ListContainer, Summary } from './../risks/risks.styles';
import AddIcon from '@material-ui/icons/Add';
import { PreviewListItem } from '../../../components/previewListItem/previewListItem.component';
import { prepareIssue } from '../../../../helpers/issues';
import IssueDetails from './components/issueDetails/issueDetails.container';
import { Container } from './issues.styles';

interface IProps {
	teamspace: string;
	model: any;
	issues: any[];
	jobs: any[];
	revision?: string;
	isPending?: boolean;
	activeIssueId?: string;
	showDetails?: boolean;
	issueDetails?: any;
	fetchIssues: (teamspace, model, revision) => void;
	setState: (componentState: any) => void;
}
interface IState {
	issueDetails?: any;
}
export class Issues extends React.PureComponent<IProps, IState> {
	public state: IState = {
		issueDetails: {}
	};

	public componentDidMount() {
		const {teamspace, model, revision} = this.props;
		this.props.fetchIssues(teamspace, model, revision);
	}

	public renderTitleIcon = () => {
		return <PinDrop />;
	}

	public renderActions = () => {
		return [];
	}

	public handleIssueFocus = (issueId) => () => {
		this.props.setState({ activeIssue: issueId });
	}

	public handleIssueClick = () => () => {
		this.toggleDetails(true);
	}

	public handleAddNewIssue = () => {
		this.toggleDetails(true);
	}

	public renderIssuesList = renderWhenTrue(() => {
		const Items = this.props.issues.map((issue, index) => (
			<PreviewListItem
				{...prepareIssue(issue, this.props.jobs)}
				key={index}
				onItemClick={this.handleIssueFocus(issue._id)}
				onArrowClick={this.handleIssueClick()}
				active={this.props.activeIssueId === issue._id}
			/>
		));

		return <ListContainer>{Items}</ListContainer>;
	});

	public renderListView = renderWhenTrue(() => (
		<>
			<ViewerPanelContent className="height-catcher">
				{this.renderIssuesList(Boolean(this.props.issues.length))}
			</ViewerPanelContent>
			<ViewerPanelFooter alignItems="center" justify="space-between">
				<Summary>{this.props.issues.length} issues displayed</Summary>
				<ViewerPanelButton
					aria-label="Add issue"
					onClick={this.handleAddNewIssue}
					color="secondary"
					variant="fab"
				>
					<AddIcon />
				</ViewerPanelButton>
			</ViewerPanelFooter>
		</>
	));

	public renderDetailsView = renderWhenTrue(() => (
		<IssueDetails {...this.props.issueDetails} />
	));

	public render() {
		return (
			<ViewerPanel
				title="Issues"
				Icon={this.renderTitleIcon()}
				actions={this.renderActions()}
				pending={false}
			>
				{this.renderListView(!this.props.showDetails)}
				{this.renderDetailsView(this.props.showDetails)}
			</ViewerPanel>
		);
	}

	private toggleDetails = (showDetails) => {
		this.props.setState({ showDetails, activeIssue: null });
	}
}
