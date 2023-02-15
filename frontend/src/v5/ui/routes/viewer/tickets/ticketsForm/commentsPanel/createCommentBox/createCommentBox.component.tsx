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
import SendIcon from '@assets/icons/outlined/send_message-outlined.svg';
import FileIcon from '@assets/icons/outlined/file-outlined.svg';
import { formatMessage } from '@/v5/services/intl';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { CurrentUserHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { DialogsActionsDispatchers, TicketCommentsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { uuid } from '@/v4/helpers/uuid';
import { convertFileToImageSrc, getSupportedImageExtensions } from '@controls/fileUploader/imageFile.helper';
import { uploadFile } from '@controls/fileUploader/uploadFile';
import { ITicketComment } from '@/v5/store/tickets/comments/ticketComments.types';
import { addReply, createMetadata, imageIsTooBig, MAX_MESSAGE_LENGTH, sanitiseMessage } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import DeleteIcon from '@assets/icons/outlined/close-outlined.svg';
import { FormattedMessage } from 'react-intl';
import { useEffect, useRef, useState } from 'react';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { ActionMenuItem } from '@controls/actionMenu';
import { MenuItem } from '@mui/material';
import { ScrollArea } from '@controls/scrollArea';
import {
	Controls,
	CharsCounter,
	SendButton,
	Container,
	MessageInput,
	DeleteButton,
	CommentReplyContainer,
	DragAndDrop,
	Images,
	Image,
	ImageContainer,
	ErroredImageMessage,
	FileIconInput,
} from './createCommentBox.styles';
import { CommentReply } from '../comment/commentReply/commentReply.component';
import { ActionMenu } from '../../../ticketsList/ticketsList.styles';

type ImageToUpload = {
	id: string,
	name?: string,
	src: string,
	error?: boolean,
};

type CreateCommentBoxProps = {
	commentReply: ITicketComment | null;
	setCommentReply: (reply) => void;
};
export const CreateCommentBox = ({ commentReply, setCommentReply }: CreateCommentBoxProps) => {
	const [imagesToUpload, setImagesToUpload] = useState<ImageToUpload[]>([]);
	const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
	const [isDraggingFile, setIsDraggingFile] = useState(false);
	const containerRef = useRef<HTMLElement>();
	const { watch, reset, control } = useForm<{ message: string, images: File[] }>({ mode: 'all' });
	const messageInput = watch('message');

	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const currentUser = CurrentUserHooksSelectors.selectCurrentUser();

	const replyMetadata = createMetadata(commentReply);
	const commentReplyLength = commentReply ? addReply(replyMetadata, '').length : 0;
	const charsCount = (messageInput?.length || 0) + commentReplyLength;
	const charsLimitIsReached = charsCount > MAX_MESSAGE_LENGTH;

	const erroredImages = imagesToUpload.filter(({ error }) => error);
	const disableSendMessage = (!messageInput?.trim()?.length && !imagesToUpload.length)
		|| charsLimitIsReached
		|| erroredImages.length > 0;

	const resetCommentBox = () => {
		reset();
		setCommentReply(null);
		setIsSubmittingMessage(false);
		setImagesToUpload([]);
	};

	const createComment = () => {
		setIsSubmittingMessage(true);
		const newComment: Partial<ITicketComment> = {
			author: currentUser.username,
			images: imagesToUpload.map(({ src }) => src),
			message: sanitiseMessage(messageInput),
		};
		if (commentReply) {
			newComment.message = addReply(createMetadata(commentReply), newComment.message);
		}
		TicketCommentsActionsDispatchers.createComment(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
			newComment,
			resetCommentBox,
			() => setIsSubmittingMessage(false),
		);
	};

	const uploadFiles = async (files: File[]) => {
		const images = await Promise.all(files.map(async (file) => ({
			name: file.name,
			src: await convertFileToImageSrc(file) as string,
			error: imageIsTooBig(file),
			id: uuid(),
		})));
		setImagesToUpload(imagesToUpload.concat(images));
	};

	const uploadImages = async () => {
		const files = await uploadFile(getSupportedImageExtensions(), true) as File[];
		await uploadFiles(files);
	};

	const uploadScreenshot = async () => {
		const image = await ViewerService.getScreenshot() as unknown as string;
		const imageToUpload: ImageToUpload = {
			src: image,
			id: uuid(),
		};
		setImagesToUpload(imagesToUpload.concat(imageToUpload));
	};

	const deleteImage = (idToDelete) => {
		setImagesToUpload(imagesToUpload.filter(({ id }) => id !== idToDelete));
	};

	const openImagesModal = (imageIndex) => {
		DialogsActionsDispatchers.open('images', {
			images: imagesToUpload.map(({ src }) => src),
			displayImageIndex: imageIndex,
		});
	};

	const handleDragLeave = ({ relatedTarget }) => {
		if (containerRef.current.contains(relatedTarget) || !relatedTarget.parentElement) return;
		setIsDraggingFile(false);
	};

	useEffect(() => { resetCommentBox(); }, [ticketId]);

	return (
		<Container
			onDragEnter={() => setIsDraggingFile(true)}
			onDragLeave={handleDragLeave}
			onDrop={() => setIsDraggingFile(false)}
			ref={containerRef}
		>
			{commentReply && (
				<CommentReplyContainer>
					<CommentReply {...replyMetadata} shortMessage />
					<DeleteButton onClick={() => setCommentReply(null)}>
						<DeleteIcon />
					</DeleteButton>
				</CommentReplyContainer>
			)}
			<MessageInput
				name="message"
				placeholder={formatMessage({
					id: 'customTicket.comments.leaveAComment',
					defaultMessage: 'Leave a comment',
				})}
				control={control}
				inputProps={{
					maxLength: Math.max(MAX_MESSAGE_LENGTH - commentReplyLength, 0),
				}}
			/>
			<DragAndDrop accept={getSupportedImageExtensions()} onDrop={uploadFiles} hidden={!isDraggingFile}>
				<FormattedMessage
					id="customTicket.comments.dropFiles"
					defaultMessage="Drop your files here"
				/>
			</DragAndDrop>
			{imagesToUpload.length > 0 && (
				<ScrollArea autoHeightMax={100} autoHeight autoHide>
					<Images>
						{imagesToUpload.map(({ src, id, error }, index) => (
							<ImageContainer key={id}>
								<Image src={src} $error={error} onClick={() => openImagesModal(index)} />
								<DeleteButton onClick={() => deleteImage(id)} error={error}>
									<DeleteIcon />
								</DeleteButton>
							</ImageContainer>
						))}
					</Images>
				</ScrollArea>
			)}
			{erroredImages.length > 0 && erroredImages.map(({ name }) => (
				<ErroredImageMessage>
					<strong>{name} </strong>
					<FormattedMessage
						id="customTicket.comments.images.error"
						defaultMessage="is too big. 1GB limit."
					/>
				</ErroredImageMessage>
			))}
			<Controls>
				<ActionMenu TriggerButton={<FileIconInput><FileIcon /></FileIconInput>}>
					<ActionMenuItem>
						<MenuItem onClick={uploadScreenshot}>
							<FormattedMessage id="customTicket.comments.action.createScreenshot" defaultMessage="Create screenshot" />
						</MenuItem>
						<MenuItem onClick={uploadImages}>
							<FormattedMessage id="customTicket.comments.action.uploadImage" defaultMessage="Upload images" />
						</MenuItem>
					</ActionMenuItem>
				</ActionMenu>
				<CharsCounter $error={charsLimitIsReached}>{charsCount}/{MAX_MESSAGE_LENGTH}</CharsCounter>
				<SendButton
					disabled={disableSendMessage}
					onClick={createComment}
					isPending={isSubmittingMessage}
				>
					<SendIcon />
				</SendButton>
			</Controls>
		</Container>
	);
};
