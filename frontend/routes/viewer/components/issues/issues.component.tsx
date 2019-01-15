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

import { Container } from './issues.styles';

interface IProps {
	teamspace: string;
	model: any;
	issues: any[];
	jobs: any[];
	revision?: string;
	isPending?: boolean;
	activeIssue?: string;
	showDetails?: boolean;
	fetchIssues: (teamspace, model, revision) => void;
	setActiveIssue: (issueId: string) => void;
	toggleDetails: (showDetails: boolean) => void;
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

	public renderRisksList = renderWhenTrue(() => {
		const Items = this.props.issues.map((issue, index) => (
			<PreviewListItem
				{...prepareIssue(issue, this.props.jobs)}
				key={index}
				onItemClick={this.handleRiskFocus(issue._id)}
				onArrowClick={this.handleRiskClick()}
				active={this.props.activeIssue === issue._id}
			/>
		));

		return <ListContainer>{Items}</ListContainer>;
	});

	public handleRiskFocus = (issueId) => () => {
		this.props.setActiveIssue(issueId);
	}

	public handleRiskClick = () => () => {
		this.props.toggleDetails(true);
	}

	public handleAddNewRisk = () => {
		this.props.toggleDetails(true);
	}

	public renderListView = renderWhenTrue(() => (
		<>
			<ViewerPanelContent className="height-catcher">
				{this.renderRisksList(Boolean(this.props.issues.length))}
			</ViewerPanelContent>
			<ViewerPanelFooter alignItems="center" justify="space-between">
				<Summary>{this.props.issues.length} risks displayed</Summary>
				<ViewerPanelButton
					aria-label="Add risk"
					onClick={this.handleAddNewRisk}
					color="secondary"
					variant="fab"
				>
					<AddIcon />
				</ViewerPanelButton>
			</ViewerPanelFooter>
		</>
	));

	public render() {
		console.log('props', this.props);
		return (
			<ViewerPanel
				title="Issues"
				Icon={this.renderTitleIcon()}
				actions={this.renderActions()}
				pending={false}
			>
				{this.renderListView(!this.props.showDetails)}
			</ViewerPanel>
		);
	}
}
