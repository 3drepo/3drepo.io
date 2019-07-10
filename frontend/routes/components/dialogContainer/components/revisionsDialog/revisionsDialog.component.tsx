import * as React from 'react';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { DATE_TIME_FORMAT } from '../../../../../services/formatting/formatDate';
import { DateTime } from '../../../dateTime/dateTime.component';
import {
	Item,
	Row,
	Tag,
	Column,
	Description,
	StyledList,
	Property,
	PropertyWrapper,
	StyledDialogContent
} from './revisionsDialog.styles';
import { renderWhenTrue } from '../../../../../helpers/rendering';

interface IProps {
	currentRevisionName: string;
	currentRevisionId: string;
	currentModelName: string;
	revisions: any[];
	handleSetNewRevision: (revision) => void;
	handleClose: () => void;
}

const setNewRevision = (handler, revision, isTheSameRevision) => {
	if (isTheSameRevision) {
		return;
	}
	handler(revision);
};

const renderRevisionItem = (revision, currentRevisionId, handleSetNewRevision) => {
	const isCurrentRevision = currentRevisionId === revision._id;
	const props = {
		key: revision._id,
		onClick: () => setNewRevision(handleSetNewRevision, revision, isCurrentRevision),
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
	)
};

const renderRevisions = ({ revisions, currentRevisionId, handleSetNewRevision }) => renderWhenTrue(
	() => revisions.map((revision) => renderRevisionItem(revision, currentRevisionId, handleSetNewRevision))
)(Boolean(revisions.length));

export const RevisionsDialog = (props: IProps) => (
	<>
		<StyledDialogContent>
			<StyledList>
				{renderRevisions(props)}
			</StyledList>
		</StyledDialogContent>
		<DialogActions>
			<Button onClick={props.handleClose} variant="raised" color="secondary">Cancel</Button>;
		</DialogActions>
	</>
);
