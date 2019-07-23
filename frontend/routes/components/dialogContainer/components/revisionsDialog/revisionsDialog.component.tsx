import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import React from 'react';
import { ROUTES } from '../../../../../constants/routes';
import { renderWhenTrue } from '../../../../../helpers/rendering';
import { analyticsService, EVENT_ACTIONS, EVENT_CATEGORIES } from '../../../../../services/analytics';
import { DATE_TIME_FORMAT } from '../../../../../services/formatting/formatDate';
import { DateTime } from '../../../dateTime/dateTime.component';
import {
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

export const TYPES = {
	TEAMSPACES: 'teamspaces-revisions',
	VIEWER: 'viewer-revisions',
};

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
				isActive: isCurrentRevision
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
