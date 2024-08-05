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
import { PureComponent } from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';

import { RouteComponentProps } from 'react-router';
import { ROUTES } from '../../../../../constants/routes';
import { renderWhenTrue } from '../../../../../helpers/rendering';
import { Loader } from '../../../loader/loader.component';
import { RevisionsListItem } from '../../../revisionsListItem/revisionsListItem.component';
import { TYPES } from './revisionsDialog.constants';
import {
	Container,
	StyledDialogContent,
	StyledList
} from './revisionsDialog.styles';

type IProps = RouteComponentProps<{
	currentRevisionId: string;
	currentModelName: string;
	revisions: any[];
	teamspace: string;
	modelId: string;
	type: string;
	isPending: boolean;
	pendingRevision: string;
	resetModelRevisions: () => void;
	fetchModelRevisions: (teamspace, modelId, showVoid) => void;
	setModelRevisionState: (teamspace, modelId, revision, isVoid) => void;
	handleSetNewRevision: (revision) => void;
	handleClose: () => void;
}>

export class RevisionsDialog extends PureComponent<IProps, any> {
	public componentWillUnmount() {
		if (this.props.type === TYPES.TEAMSPACES) {
			this.props.resetModelRevisions();
		}
	}

	get revisions() {
		return this.props.revisions || [];
	}

	get currentRevisionId() {
		return this.props.currentRevisionId;
	}

	private revisionClickHandler = ({ tag, _id }) => {
		const { teamspace, modelId, handleClose, history } = this.props;

		handleClose();
		history.push(`${ROUTES.VIEWER}/${teamspace}/${modelId}/${tag || _id}`);
	}

	private toggleVoid = (event, revision) => {
		event.stopPropagation();
		this.props.setModelRevisionState(this.props.teamspace, this.props.modelId, revision._id, !Boolean(revision.void));
	}

	private setLatest = (event, revision) => {
		event.stopPropagation();
		this.props.revisions.forEach((rev) => {
			const isOlder = revision.timestamp < rev.timestamp;
			this.props.setModelRevisionState(this.props.teamspace, this.props.modelId, rev._id, isOlder);
		});
	}

	private onRevisionItemClick = (event, revision) => {
		const { handleSetNewRevision } = this.props;

		if (this.props.type === TYPES.VIEWER) {
			const isCurrentRevision = this.currentRevisionId === revision._id;
			if (!isCurrentRevision) {
				handleSetNewRevision(revision);
			}
		} else {
			this.revisionClickHandler(revision);
		}
	}

	private renderRevisionItem = (revision) => {
		const isCurrentRevision = this.currentRevisionId === revision._id;
		const isPendingRevision = this.props.pendingRevision === revision._id;

		return (
			<RevisionsListItem
				key={revision._id}
				data={revision}
				current={isCurrentRevision}
				editable={this.props.type === TYPES.TEAMSPACES}
				onClick={this.onRevisionItemClick}
				onSetLatest={this.setLatest}
				onToggleVoid={this.toggleVoid}
				isPending={isPendingRevision}
			/>
		);
	}

	private renderRevisionsList = renderWhenTrue(() => (
		<StyledList>
			{this.revisions.map(this.renderRevisionItem)}
		</StyledList>
	));

	private renderEmptyState = renderWhenTrue(() => (
		<Container>No revisions present</Container>
	));

	private renderLoader = renderWhenTrue(
		<Container>
			<Loader content="Loading revisions..." />
		</Container>
	);

	public render() {
		const { revisions } = this;

		return (
			<>
				<StyledDialogContent>
					{this.renderRevisionsList(!this.props.isPending && !!revisions.length)}
					{this.renderEmptyState(!this.props.isPending && !revisions.length)}
					{this.renderLoader(this.props.isPending && !revisions.length)}
				</StyledDialogContent>
				<DialogActions>
					<Button
						onClick={this.props.handleClose}
						variant="contained"
						color="secondary"
					>Ok</Button>
				</DialogActions>
			</>
		);
	}
}
