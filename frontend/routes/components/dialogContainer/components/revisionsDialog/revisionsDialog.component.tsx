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

import React from 'react';

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';

import { ROUTES } from '../../../../../constants/routes';
import { renderWhenTrue, renderWhenTrueOtherwise } from '../../../../../helpers/rendering';
import { analyticsService, EVENT_ACTIONS, EVENT_CATEGORIES } from '../../../../../services/analytics';
import {
	MenuList, StyledItemText, StyledListItem
} from '../../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { MenuButton as MenuButtonComponent } from '../../../../components/menuButton/menuButton.component';
import { ButtonMenu } from '../../../buttonMenu/buttonMenu.component';
import { Loader } from '../../../loader/loader.component';
import { RevisionsListItem } from '../../../revisionsListItem/revisionsListItem.component';
import {
	ACTIVE_ACTIONS,
	MAKE_ACTIVE_NAME,
	MAKE_VOID_NAME,
	SET_LATEST_NAME,
	TYPES,
	VOID_ACTIONS
} from './revisionsDialog.constants';
import {
	Container,
	StyledDialogContent,
	StyledList
} from './revisionsDialog.styles';

const MenuButton = (props) => (
	<MenuButtonComponent ariaLabel="Show menu" {...props} />
);

interface IProps {
	currentRevisionName: string;
	currentRevisionId: string;
	currentModelName: string;
	revisions: any[];
	teamspace: string;
	modelId: string;
	type: string;
	history: any;
	isPending: boolean;
	resetModelRevisions: () => void;
	fetchModelRevisions: (teamspace, modelId) => void;
	setModelRevisionState: (teamspace, modelId, revision, isVoid) => void;
	handleSetNewRevision: (revision) => void;
	handleClose: () => void;
}

export class RevisionsDialog extends React.PureComponent<IProps, any> {
	public componentDidMount() {
		if (this.props.type === TYPES.TEAMSPACES) {
			this.props.fetchModelRevisions(this.props.teamspace, this.props.modelId);
		}
	}

	public componentWillUnmount() {
		if (this.props.type === TYPES.TEAMSPACES) {
			this.props.resetModelRevisions();
		}
	}

	private revisionClickHandler = ({ tag, _id }) => {
		const { teamspace, modelId, handleClose, history } = this.props;
		handleClose();
		history.push(`${ROUTES.VIEWER}/${teamspace}/${modelId}/${tag || _id}`);

		analyticsService.sendEvent(EVENT_CATEGORIES.MODEL, EVENT_ACTIONS.VIEW);
	}

	private renderActionsMenu = (menu, revision) =>  {
		const actions = revision.void ? VOID_ACTIONS : ACTIVE_ACTIONS;

		return(
			<MenuList>
				{actions.map(({ name, label }) => (
					<StyledListItem button key={name} onClick={(e) => {
						this.menuActionsMap[name](revision);
						menu.close(e);
					}}>
						<StyledItemText>{label}</StyledItemText>
					</StyledListItem>
				))}
			</MenuList>
		);
	}

	private toggleVoid = (event, revision) => {
		this.props.setModelRevisionState(this.props.teamspace, this.props.modelId, revision._id, !Boolean(revision.void));
	}

	private setLatest = (event, revision) => {
		this.props.revisions.forEach((rev) => {
			const isOlder = revision.timestamp < rev.timestamp;
			this.props.setModelRevisionState(this.props.teamspace, this.props.modelId, rev._id, isOlder);
		});
	}

	get menuActionsMap() {
		return {
			[MAKE_ACTIVE_NAME]: this.toggleVoid,
			[MAKE_VOID_NAME]: this.toggleVoid,
			[SET_LATEST_NAME]:  this.setLatest
		};
	}

	private onRevisionItemClick = (event, revision) => {
		const { handleSetNewRevision, currentRevisionId } = this.props;
		if (this.props.type === TYPES.VIEWER) {
			const isCurrentRevision = currentRevisionId === revision._id;
			if (!isCurrentRevision) {
				handleSetNewRevision(revision);
			}
		} else {
			this.revisionClickHandler(revision);
		}
	}

	private renderRevisionItem = (revision) => {
		debugger;
		const isCurrentRevision = this.props.currentRevisionId === revision._id;
		return (
			<RevisionsListItem
				key={revision._id}
				data={revision}
				current={isCurrentRevision}
				onClick={this.onRevisionItemClick}
				onSetLatest={this.setLatest}
				onToggleVoid={this.toggleVoid}
			/>
		);
	}

	private renderRevisionsList = renderWhenTrue(() => (
		<StyledList>
			{this.props.revisions.map(this.renderRevisionItem)}
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
		const { revisions } = this.props;
		return (
			<>
				<StyledDialogContent>
					{this.renderRevisionsList(!this.props.isPending && !!revisions.length)}
					{this.renderEmptyState(!this.props.isPending && !revisions.length)}
					{this.renderLoader(this.props.isPending)}
				</StyledDialogContent>
				<DialogActions>
					<Button
						onClick={this.props.handleClose}
						variant="raised"
						color="secondary"
					>Ok</Button>
				</DialogActions>
			</>
		);
	}
}
