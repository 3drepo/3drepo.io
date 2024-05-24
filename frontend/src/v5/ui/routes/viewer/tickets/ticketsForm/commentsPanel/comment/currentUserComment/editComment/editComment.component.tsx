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
import { TicketCommentReplyMetadata, ITicketComment } from '@/v5/store/tickets/comments/ticketComments.types';
import { desanitiseMessage, sanitiseMessage, addReply } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { EditCommentButtons, EditCommentContainer, EditCommentInput } from './editComment.styles';
import { TicketButton } from '../../../../../ticketButton/ticketButton.styles';
import { CommentNonMessageContent } from '../../commentNonMessageContent/commentNonMessageContent.component';

type EditCommentProps = Pick<ITicketComment, 'author' | 'message' | 'images'> & {
	onClose: () => void;
	metadata?: TicketCommentReplyMetadata;
	onEditMessage: (newMessage) => void;
	onDeleteImage: (index) => void;
	onUploadImages: () => void;
	onEditImage?: (img, index) => void;
};
export const EditComment = ({ message, images, author, metadata, onClose, onEditMessage, onDeleteImage, onUploadImages, onEditImage }: EditCommentProps) => {
	const { control, watch } = useForm<{ editedMessage }>({
		defaultValues: { editedMessage: desanitiseMessage(message) },
	});
	const editedMessage = watch('editedMessage') || '';
	const commentIsDifferent = message !== sanitiseMessage(editedMessage);
	const commentIsNotEmpty = (editedMessage.trim().length > 0 || images?.length > 0);
	const canUpdate = commentIsDifferent && commentIsNotEmpty;

	const updateMessage = () => {
		let newMessage = sanitiseMessage(editedMessage);
		if (metadata._id) {
			newMessage = addReply(metadata, newMessage);
		}
		onEditMessage(newMessage);
		onClose();
	};

	return (
		<>
			<EditCommentContainer data-author={author}>
				<CommentNonMessageContent
					images={images}
					metadata={metadata}
					isCurrentUserComment={false}
					onUploadImages={onUploadImages}
					onDeleteImage={onDeleteImage}
					onEditImage={onEditImage}
					hasMessage={!!message}
				/>
				<EditCommentInput
					name="editedMessage"
					control={control}
					autoFocus
				/>
			</EditCommentContainer>
			<EditCommentButtons>
				<TicketButton variant="error" onClick={onClose}>
					<CancelIcon />
				</TicketButton>
				<TicketButton variant="primary" onClick={updateMessage} disabled={!canUpdate}>
					<TickIcon />
				</TicketButton>
			</EditCommentButtons>
		</>
	);
};
