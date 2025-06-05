/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { ITicketComment, TicketCommentReplyMetadata } from '@/v5/store/tickets/comments/ticketComments.types';
import { editedCommentMessage } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { CommentMarkDown } from '../commentMarkDown/commentMarkDown.component';
import { CommentContainer, CommentAge, EditedCommentLabel, ViewpointIcon, CommentAgeContent } from './basicComment.styles';
import { CommentNonMessageContent } from '../commentNonMessageContent/commentNonMessageContent.component';
import { Tooltip } from '@mui/material';
import { formatMessage, formatDate } from '@/v5/services/intl';
import { TicketContext } from '../../../../ticket.context';
import { useContext, useState, useEffect } from 'react';
import { getRelativeTime } from '@/v5/helpers/intl.helper';
import { TicketCommentsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useParams } from 'react-router';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';

export type BasicCommentProps = Partial<Omit<ITicketComment, 'history' | '_id'>> & {
	children?: any;
	className?: string;
	metadata?: TicketCommentReplyMetadata;
	isCurrentUserComment?: boolean;
	commentId?: string;
	onDeleteImage?: (index) => void;
	onUploadImages?: () => void;
	onEditImage?: (img, index) => void;
};

export const BasicComment = ({
	commentId,
	message,
	createdAt,
	updatedAt,
	className,
	originalAuthor,
	view,
	...props
}: BasicCommentProps) => {
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const [ ticketId ] = useSearchParam('ticketId');
	const { isViewer } = useContext(TicketContext);
	const isEdited = updatedAt && (createdAt !== updatedAt);
	const [commentAge, setCommentAge] = useState('');

	const updateMessageAge = () => setCommentAge(getRelativeTime(updatedAt || createdAt));
	const onClickViewpoint = () => TicketCommentsActionsDispatchers.goToCommentViewpoint(teamspace, project, containerOrFederation, ticketId, commentId);

	useEffect(() => {
		updateMessageAge();
		const intervalId = window.setInterval(updateMessageAge, 10000);
		return () => clearInterval(intervalId);
	}, [updatedAt]);

	return (
		<CommentContainer className={className}>
			<CommentNonMessageContent {...props} originalAuthor={originalAuthor} hasMessage={!!message} />
			{isEdited && !originalAuthor && <EditedCommentLabel>{editedCommentMessage}</EditedCommentLabel>}
			{message && (<CommentMarkDown>{message}</CommentMarkDown>)}
			<CommentAge>
				<Tooltip title={formatDate(updatedAt || createdAt)}>
					<CommentAgeContent>{commentAge}</CommentAgeContent>
				</Tooltip>
				{!!view && (
					<Tooltip title={isViewer && formatMessage({ id: 'basicComment.viewpoint', defaultMessage: 'Go to viewpoint' })} placement="top" arrow>
						<span>
							<ViewpointIcon disabled={!isViewer} onClick={onClickViewpoint} />
						</span>
					</Tooltip>
				)}
			</CommentAge>
		</CommentContainer>
	);
};
