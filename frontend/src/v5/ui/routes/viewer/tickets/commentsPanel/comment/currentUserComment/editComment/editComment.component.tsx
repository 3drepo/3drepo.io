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
import { formatMessage } from '@/v5/services/intl';
import { useForm } from 'react-hook-form';
import { CommentReplyMetadata, IComment } from '@/v5/store/tickets/tickets.types';
import { EditCommentButtons, EditCommentContainer, EditCommentInput } from './editComment.styles';
import { desanitiseMessage, sanitiseMessage, addReply } from '../../comment.helpers';
import { ErrorCommentButton, PrimaryCommentButton } from '../../commentButton/commentButton.styles';
import { CommentReply } from '../../commentReply/commentReply.component';

type EditCommentProps = Pick<IComment, '_id' | 'author' | 'message'> & {
	onClose: () => void;
	onEdit: (id, message) => void;
	metadata?: CommentReplyMetadata;
};
export const EditComment = ({ _id, message, author, metadata, onEdit, onClose }: EditCommentProps) => {
	const { control, watch } = useForm<{ editedMessage }>({
		defaultValues: { editedMessage: desanitiseMessage(message) },
	});
	const editedMessage = watch('editedMessage');
	const canUpdate = message !== sanitiseMessage(editedMessage) && editedMessage.trim().length > 0;

	const updateMessage = () => {
		let newMessage = sanitiseMessage(editedMessage);
		if (metadata._id) {
			newMessage = addReply(metadata, newMessage);
		}
		onEdit(_id, newMessage);
		onClose();
	};

	return (
		<>
			<EditCommentContainer data-author={author}>
				{metadata.message && (<CommentReply {...metadata} />)}
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
