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

import { CurrentUserHooksSelectors, TicketsCardHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { getTicketResourceUrl, modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { TicketCommentReplyMetadata } from '@/v5/store/tickets/comments/ticketComments.types';
import { useParams } from 'react-router-dom';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { formatMessage } from '@/v5/services/intl';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { CommentMarkDown, CommentImage, OriginalMessage, CameraIcon } from './commentReply.styles';
import { CommentAuthor } from '../commentNonMessageContent/commentNonMessageContent.styles';
import { QuotedMessage } from '../quotedMessage/quotedMessage.styles';
import { ExternalLabel } from '../otherUserComment/importedUserPopover/importedUserPopover.styles';
import { useContext } from 'react';
import { TicketContext } from '../../../../ticket.context';

type CommentReplyProps = TicketCommentReplyMetadata & {
	variant?: 'primary' | 'secondary',
	shortMessage?: boolean,
	images?: string[],
	originalAuthor?: string,
};
export const CommentReply = ({
	message,
	author,
	variant = 'primary',
	images = [],
	originalAuthor,
	...props
}: CommentReplyProps) => {
	const { teamspace, project } = useParams<ViewerParams>();
	const { containerOrFederation } = useContext(TicketContext);


	const isFederation = modelIsFederation(containerOrFederation);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const currentUser = CurrentUserHooksSelectors.selectUsername();
	const user = UsersHooksSelectors.selectUser(teamspace, author);

	let authorDisplayName = originalAuthor;
	if (!originalAuthor) {
		authorDisplayName = (author === currentUser)
			? formatMessage({ id: 'comment.currentUser.author', defaultMessage: 'You' })
			: `${user.firstName} ${user.lastName}`;
	}
	const imagesSrcs = images.map((image) => getTicketResourceUrl(
		teamspace,
		project,
		containerOrFederation,
		ticketId,
		image,
		isFederation,
	));

	const openImagesModal = () => DialogsActionsDispatchers.open('images', { images: imagesSrcs });

	if (!message && images.length === 0) return (<></>);

	return (
		<QuotedMessage variant={variant} {...props}>
			<div>
				{authorDisplayName && (
					<CommentAuthor>
						{authorDisplayName} {originalAuthor && <ExternalLabel />}
					</CommentAuthor>
				)}
				<OriginalMessage>
					{images.length > 0 && (<CameraIcon />)}
					<CommentMarkDown>
						{message}
					</CommentMarkDown>
				</OriginalMessage>
			</div>
			{images.length > 0 && (<CommentImage src={imagesSrcs[0]} extraCount={images.length} onClick={openImagesModal} />)}
		</QuotedMessage>
	);
};
