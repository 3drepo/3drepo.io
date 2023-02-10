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

import TickIcon from '@assets/icons/outlined/tick-outlined.svg';
import CancelIcon from '@assets/icons/outlined/cross_sharp_edges-outlined.svg';
import { useForm } from 'react-hook-form';
import { isEqual } from 'lodash';
import { TicketCommentReplyMetadata, ITicketComment } from '@/v5/store/tickets/comments/ticketComments.types';
import { desanitiseMessage, sanitiseMessage, addReply } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { EditCommentButtons, EditCommentContainer, EditCommentInput } from './editComment.styles';
import { ErrorCommentButton, PrimaryCommentButton } from '../../commentButton/commentButton.styles';
import { CommentReply } from '../../commentReply/commentReply.component';

type EditCommentProps = Pick<ITicketComment, '_id' | 'author' | 'message' | 'images'> & {
	onClose: () => void;
	onEdit: (id, newMessage, newImages) => void;
	metadata?: TicketCommentReplyMetadata;
};
export const EditComment = ({ _id, message, images, author, metadata, onEdit, onClose }: EditCommentProps) => {
	const { control, watch } = useForm<{ editedMessage }>({
		defaultValues: { editedMessage: desanitiseMessage(message) },
	});
	const editedMessage = watch('editedMessage') || '';
	// TODO - user should be able to update images
	const newImages = images;
	const commentIsDifferent = (message !== sanitiseMessage(editedMessage) || isEqual(images, newImages));
	const commentIsNotEmpty = (editedMessage.trim().length > 0 || images?.length > 0);
	const canUpdate = commentIsDifferent && commentIsNotEmpty;

	const updateMessage = () => {
		let newMessage = sanitiseMessage(editedMessage);
		if (metadata._id) {
			newMessage = addReply(metadata, newMessage);
		}
		onEdit(_id, newMessage, newImages);
		onClose();
	};

	return (
		<>
			<EditCommentContainer data-author={author}>
				<CommentReply {...metadata} />
				<EditCommentInput
					name="editedMessage"
					control={control}
					autoFocus
				/>
			</EditCommentContainer>
			<EditCommentButtons>
				<ErrorCommentButton onClick={onClose}>
					<CancelIcon />
				</ErrorCommentButton>
				<PrimaryCommentButton onClick={updateMessage} disabled={!canUpdate}>
					<TickIcon />
				</PrimaryCommentButton>
			</EditCommentButtons>
		</>
	);
};
