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
import { ITicketComment, TicketCommentReplyMetadata } from '@/v5/store/tickets/comments/ticketComments.types';
import { addReply, imageIsTooBig, IMAGE_MAX_SIZE_MESSAGE, MAX_MESSAGE_LENGTH, desanitiseMessage, sanitiseMessage } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { getTicketResourceUrl, isResourceId, modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import DeleteIcon from '@assets/icons/outlined/close-outlined.svg';
import { FormattedMessage } from 'react-intl';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { ActionMenuItem } from '@controls/actionMenu';
import { MenuItem } from '@mui/material';
import { ImagesModal } from '@components/shared/modalsDispatcher/templates/imagesModal/imagesModal.component';
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
	ErroredImageMessages,
	ActionIcon,
	EditCommentButtons,
	MessageAndImages,
} from './commentBox.styles';
import { CommentReply } from '../comment/commentReply/commentReply.component';
import { ActionMenu } from '../../../ticketsList/ticketsList.styles';
import { TicketContext } from '../../../ticket.context';
import { useSyncProps } from '@/v5/helpers/syncProps.hooks';
import { DrawingViewerService } from '@components/viewer/drawingViewer/drawingViewer.service';
import { ViewerCanvasesContext } from '../../../../viewerCanvases.context';
import { TicketButton } from '../../../ticketButton/ticketButton.styles';
import { Viewpoint } from '@/v5/store/tickets/tickets.types';
import { ViewpointActionMenu } from './viewpointActionMenu/viewpointActionMenu.component';
import { isEqual } from 'lodash';

type AllOrNone<T> = Required<T> | Partial<Record<keyof T, undefined>>;
type ImageToUpload = {
	id: string,
	name?: string,
	src: string,
	error?: boolean,
};
interface EditCommentBoxProps {
	onCancelEdit: () => void,
	commentId: string,
}

type CommentBoxProps = Pick<ITicketComment, 'message' | 'images' | 'view'> & AllOrNone<EditCommentBoxProps> & {
	commentReply?: TicketCommentReplyMetadata | null,
	setCommentReply: (val: TicketCommentReplyMetadata) => void,
	className?: string,
};

export const CommentBox = ({ commentId, onCancelEdit, message = '', images = [], view: existingView, commentReply, setCommentReply, className }: CommentBoxProps) => {
	const { teamspace, project } = useParams<ViewerParams>();
	const { isViewer, containerOrFederation } = useContext(TicketContext);
	const { is2DOpen } = useContext(ViewerCanvasesContext);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const currentUser = CurrentUserHooksSelectors.selectCurrentUser();
	const isFederation = modelIsFederation(containerOrFederation);

	const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
	const [isDraggingFile, setIsDraggingFile] = useState(false);
	const [viewpoint, setViewpoint] = useState<Viewpoint>(existingView);
	const [imagesToUpload, setImagesToUpload] = useState<ImageToUpload[]>(images.map((id) => ({ id, src: id })));
	const imagesToDisplay = imagesToUpload.map((image) => {
		if (!isResourceId(image.src)) return image;
		return { ...image, src: getTicketResourceUrl(teamspace, project, containerOrFederation, ticketId, image.id, isFederation) };
	});
	
	const { watch, reset, control } = useForm<{ message: string, images: File[] }>({
		mode: 'all',
		defaultValues: {
			message: desanitiseMessage(message),
			images,
		},
	});
	
	const containerRef = useRef<HTMLElement>(undefined);
	const inputRef = useRef<any>(undefined);
	const isEditMode = !!commentId;
	const newMessage = watch('message');

	const initialCommentReply = useMemo(() => commentReply, [commentId]);
	const commentReplyLength = commentReply ? addReply(commentReply, '').length : 0;
	const charsCount = (newMessage?.length || 0) + commentReplyLength;
	const charsLimitIsReached = charsCount > MAX_MESSAGE_LENGTH;
	const imagesAreUnchanged = isEqual(images, imagesToUpload.map(({ src }) => src));
	const viewIsUnchanged = isEqual(existingView, viewpoint);
	const replyIsUnchanged = isEqual(initialCommentReply, commentReply);
	const messageIsUnchanged = message === newMessage && imagesAreUnchanged && viewIsUnchanged && replyIsUnchanged;
	const erroredImages = imagesToUpload.filter(({ error }) => error);
	const messageIsEmpty = !newMessage?.trim()?.length && !imagesToUpload.length && !viewpoint;
	const disableSendMessage = messageIsEmpty || charsLimitIsReached || erroredImages.length > 0 || messageIsUnchanged;

	const resetCommentBox = () => {
		reset();
		setCommentReply(null);
		setIsSubmittingMessage(false);
		setImagesToUpload([]);
		setViewpoint(null);
	};

	const updateMessage = async () => {
		const newComment: Partial<ITicketComment> = {
			message: newMessage,
			images: imagesToUpload.map(({ src }) => src),
		};
		if (commentReply) {
			newComment.message = addReply(commentReply, sanitiseMessage(newComment.message));
		}
		if (viewpoint) {
			newComment.view = viewpoint;
		}
		TicketCommentsActionsDispatchers.updateComment(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
			commentId,
			newComment,
		);
		onCancelEdit();
	};
	const createComment = async () => {
		setIsSubmittingMessage(true);
		const newComment: Partial<ITicketComment> = {
			author: currentUser.username,
			images: imagesToUpload.map(({ src }) => src),
			message: newMessage,
		};
		if (commentReply) {
			newComment.message = addReply(commentReply, newComment.message);
		}
		if (viewpoint) {
			newComment.view = viewpoint;
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

	const editImage = async (image, index) => {
		imagesToUpload[index].src = image;
		setImagesToUpload([...imagesToUpload]);
	};

	// @ts-expect-error-error
	const deleteImage = (index) => setImagesToUpload(imagesToUpload.toSpliced(index, 1));

	const uploadFiles = async (files: File[]) => {
		const newImages = await Promise.all(files.map(async (file) => ({
			name: file.name,
			src: await convertFileToImageSrc(file) as string,
			error: imageIsTooBig(file),
			id: uuid(),
		})));
		setImagesToUpload(imagesToUpload.concat(newImages));
	};

	const uploadImages = async () => {
		const files = await uploadFile(getSupportedImageExtensions(), true) as File[];
		await uploadFiles(files);
	};

	const syncProps = useSyncProps({
		images: imagesToDisplay.map(({ src }) => src),
		onUpload: uploadImages,
		onDelete: deleteImage,
		onAddMarkup: editImage,
	});
	const openImagesDialog = (index) => DialogsActionsDispatchers.open(
		ImagesModal,
		{ displayImageIndex: index },
		syncProps,
	);

	const handleDropFiles = async (files) => {
		await uploadFiles(files);
		openImagesDialog(imagesToUpload.length);
	};

	const handleUploadImages = async () => {
		await uploadImages();
		openImagesDialog(imagesToUpload.length);
	};

	const uploadScreenshot = async (image) => {
		const imageToUpload: ImageToUpload = {
			src: image,
			id: uuid(),
		};
		setImagesToUpload(imagesToUpload.concat(imageToUpload));
		openImagesDialog(imagesToUpload.length);
	};
	
	const upload3DScreenshot = async () => uploadScreenshot(await ViewerService.getScreenshot());
	const upload2DScreenshot = async () => uploadScreenshot(await DrawingViewerService.getScreenshot());

	const handleDragLeave = ({ relatedTarget }) => {
		if (containerRef.current.contains(relatedTarget) || !relatedTarget.parentElement) return;
		setIsDraggingFile(false);
	};

	useEffect(() => { 
		if (isEditMode) return;
		resetCommentBox();
	}, [ticketId, isEditMode]);

	useEffect(() => {
		if (commentReply?.message || commentReply?.images?.length || commentReply?.view) {
			setCommentReply(commentReply);
			inputRef.current.focus();
		}
	}, [commentReply?._id]);

	return (
		<Container
			onDragEnter={() => setIsDraggingFile(true)}
			onDragLeave={handleDragLeave}
			onDrop={() => setIsDraggingFile(false)}
			ref={containerRef}
			className={className}
		>
			<MessageAndImages $isEditMode={isEditMode}>
				{commentReply?._id && (
					<CommentReplyContainer>
						<CommentReply {...commentReply} shortMessage />
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
					ref={inputRef}
				/>
				<DragAndDrop accept={getSupportedImageExtensions()} onDrop={handleDropFiles} hidden={!isDraggingFile}>
					<FormattedMessage
						id="customTicket.comments.dropFiles"
						defaultMessage="Drop your files here"
					/>
				</DragAndDrop>
				{imagesToUpload.length > 0 && (
					<Images>
						{imagesToDisplay.map(({ src, id, error }, index) => (
							<ImageContainer key={id}>
								<Image src={src} $error={error} onClick={() => openImagesDialog(index)} draggable={false} />
								<DeleteButton onClick={() => deleteImage(index)} error={error}>
									<DeleteIcon />
								</DeleteButton>
							</ImageContainer>
						))}
					</Images>
				)}
				{erroredImages.length > 0 && (
					<ErroredImageMessages>
						{erroredImages.map(({ name }) => (
							<>
								<strong>{name} </strong>
								<FormattedMessage
									id="customTicket.comments.images.error"
									defaultMessage="is too big. {value} limit."
									values={{ value: IMAGE_MAX_SIZE_MESSAGE }}
								/>
							</>
						))}
					</ErroredImageMessages>
				)}
			</MessageAndImages>
			<Controls>
				<ActionMenu TriggerButton={<ActionIcon><FileIcon /></ActionIcon>}>
					<ActionMenuItem>
						{is2DOpen && (
							<MenuItem onClick={upload2DScreenshot} disabled={!isViewer}>
								<FormattedMessage id="customTicket.comments.action.create2DScreenshot" defaultMessage="Create 2D screenshot" />
							</MenuItem>
						)}
						<MenuItem onClick={upload3DScreenshot} disabled={!isViewer}>
							<FormattedMessage id="customTicket.comments.action.create3DScreenshot" defaultMessage="Create 3D screenshot" />
						</MenuItem>
						<MenuItem onClick={handleUploadImages}>
							<FormattedMessage id="customTicket.comments.action.uploadImage" defaultMessage="Upload images" />
						</MenuItem>
					</ActionMenuItem>
				</ActionMenu>
				{(isViewer || viewpoint) && ( // user can delete existing viewpoints in tabular view
					(<ViewpointActionMenu viewpoint={viewpoint} setViewpoint={setViewpoint} />)
				)}
				<CharsCounter $error={charsLimitIsReached}>{charsCount}/{MAX_MESSAGE_LENGTH}</CharsCounter>
				{ isEditMode ? (
					<EditCommentButtons>
						<TicketButton variant="error" onClick={onCancelEdit}>
							<CancelIcon />
						</TicketButton>
						<TicketButton variant="primary" onClick={updateMessage} disabled={disableSendMessage}>
							<TickIcon />
						</TicketButton>
					</EditCommentButtons>
				) : (
					<SendButton
						disabled={disableSendMessage}
						onClick={createComment}
						isPending={isSubmittingMessage}
					>
						<SendIcon />
					</SendButton>
				)}
			</Controls>
		</Container>
	);
};
