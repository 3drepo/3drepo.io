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
import { renderWhenTrue } from '../../../../../helpers/rendering';
import { analyticsService, EVENT_ACTIONS, EVENT_CATEGORIES } from '../../../../../services/analytics';
import { DATE_TIME_FORMAT } from '../../../../../services/formatting/formatDate';
import {
	MenuList, StyledItemText, StyledListItem
} from '../../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { MenuButton as MenuButtonComponent } from '../../../../components/menuButton/menuButton.component';
import { ButtonMenu } from '../../../buttonMenu/buttonMenu.component';
import { DateTime } from '../../../dateTime/dateTime.component';
import { MAKE_ACTIVE_NAME, MAKE_VOID_NAME, SET_LATEST_NAME, TYPES, VOID_ACTIONS, ACTIVE_ACTIONS } from './revisionsDialog.constants';
import {
	ActionsMenuWrapper,
	Column,
	Description,
	Item,
	Property,
	PropertyWrapper,
	Row,
	StyledDialogContent,
	StyledList,
	Tag
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

	public setNewRevision = (handler, revision, isTheSameRevision) => {
		if (isTheSameRevision) {
			return;
		}
		handler(revision);
	}

	public revisionClickHandler = ({ tag, _id }) => {
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
					<StyledListItem key={name} button onClick={(e) => {
						this.menuActionsMap[name](revision);
						menu.close(e);
					}}>
						<StyledItemText>{label}</StyledItemText>
					</StyledListItem>
				))}
			</MenuList>
		);
	}

	public toggleVoid = (revision) => {
		this.props.setModelRevisionState(this.props.teamspace, this.props.modelId, revision._id, !Boolean(revision.void));
	}

	public setLatest = (revision) => {
		this.props.revisions.forEach((rev) => {
			if (revision.timestamp !== rev.timestamp) {
				const isOlder = revision.timestamp > rev.timestamp;
				this.props.setModelRevisionState(this.props.teamspace, this.props.modelId, rev._id, isOlder);
			} else {

			}
		});
	}

	get menuActionsMap() {
		return {
			[MAKE_ACTIVE_NAME]: this.toggleVoid,
			[MAKE_VOID_NAME]: this.toggleVoid,
			[SET_LATEST_NAME]:  this.setLatest
		};
	}

	public renderRevisionItem = (revision, currentRevisionId, handleSetNewRevision) => {
		const isCurrentRevision = currentRevisionId === revision._id;
		const props = {
			key: revision._id,
			onClick: () => {
				if (this.props.type === TYPES.VIEWER) {
					this.setNewRevision(handleSetNewRevision, revision, isCurrentRevision);
				} else {
					this.revisionClickHandler(revision);
				}
			},
			theme: {
				isCurrent: isCurrentRevision,
				isVoid: revision.void
			}
		};

		return (
			<Item {...props} button divider>
				<Row>
					<PropertyWrapper>
						<Tag>
							{revision.tag || '(no tag)'}
						</Tag>
						<Property>
							{isCurrentRevision && '(current revision)'}
						</Property>
					</PropertyWrapper>
					<Property>
						<DateTime value={revision.timestamp} format={DATE_TIME_FORMAT} />
					</Property>

					{this.props.type === TYPES.TEAMSPACES &&
						<ActionsMenuWrapper>
							<ButtonMenu
								renderButton={MenuButton}
								renderContent={(menu) => this.renderActionsMenu(menu, revision)}
								PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
								PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
								ButtonProps={{ disabled: false }}
							/>
						</ActionsMenuWrapper>
					}
				</Row>
				<Column>
					<Property>
						{revision.author}
					</Property>
					<Description>{revision.desc || '(no description)'}</Description>
				</Column>
			</Item>
		);
	}

	public renderRevisions = ({ revisions, currentRevisionId, handleSetNewRevision }) => renderWhenTrue(
		() => revisions.map((revision) => this.renderRevisionItem(revision, currentRevisionId, handleSetNewRevision))
	)(Boolean(revisions.length))

	public render() {
		return (
			<>
				<StyledDialogContent>
					<StyledList>
						{this.renderRevisions(this.props)}
					</StyledList>
				</StyledDialogContent>
				<DialogActions>
					<Button onClick={this.props.handleClose} variant="raised" color="secondary">Cancel</Button>;
				</DialogActions>
			</>
		);
	}
}
