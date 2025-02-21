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
import ViewpointIcon from '@assets/icons/outlined/camera_side-outlined.svg';
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
import { addReply, imageIsTooBig, IMAGE_MAX_SIZE_MESSAGE, MAX_MESSAGE_LENGTH, sanitiseMessage, desanitiseMessage } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { getTicketResourceUrl, modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import DeleteIcon from '@assets/icons/outlined/close-outlined.svg';
import { FormattedMessage } from 'react-intl';
import { useContext, useEffect, useRef, useState } from 'react';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { ActionMenuItem } from '@controls/actionMenu';
import { MenuItem, Tooltip } from '@mui/material';
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
	FileIconInput,
	EditCommentButtons,
	FormCheckbox,
} from './commentBox.styles';
import { CommentReply } from '../comment/commentReply/commentReply.component';
import { ActionMenu } from '../../../ticketsList/ticketsList.styles';
import { TicketContext } from '../../../ticket.context';
import { useSyncProps } from '@/v5/helpers/syncProps.hooks';
import { DrawingViewerService } from '@components/viewer/drawingViewer/drawingViewer.service';
import { ViewerCanvasesContext } from '../../../../viewerCanvases.context';
import { TicketButton } from '../../../ticketButton/ticketButton.styles';

type ImageToUpload = {
	id: string,
	name?: string,
	src: string,
	error?: boolean,
};

type CommentBoxProps = Pick<ITicketComment, 'message' | 'images' | 'views'> & {
	onCancel?: () => void;
	onEditMessage?: (message) => void;
	commentId?: string;
	commentReply?: TicketCommentReplyMetadata | null;
	deleteCommentReply?: () => void; // TODO 5309 make this work for editting
	metadata?: any; // TODO 5309
	className?: string;
};
export const CommentBox = ({ message = '', images = [], views, commentReply, deleteCommentReply, onCancel, onEditMessage, commentId, className, ...other }: CommentBoxProps) => {
	const { teamspace, project } = useParams<ViewerParams>();
	const { isViewer, containerOrFederation } = useContext(TicketContext);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const isFederation = modelIsFederation(containerOrFederation);

	const imagesWithSrcs = images.map((id) => ({ id, src: getTicketResourceUrl(teamspace, project, containerOrFederation, ticketId, id, isFederation) }));
	const [imagesToUpload, setImagesToUpload] = useState<ImageToUpload[]>(imagesWithSrcs);
	const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
	const [isDraggingFile, setIsDraggingFile] = useState(false);
	const containerRef = useRef<HTMLElement>();
	const inputRef = useRef<any>();
	const isEditMode = !!commentId;
	const { watch, reset, control } = useForm<{ message: string, images: File[], saveViewpoint: boolean
	 }>({
		mode: 'all',
		defaultValues: {
			message: desanitiseMessage(message),
			images,
			saveViewpoint: isEditMode ? !!views : true,
		},
	});
	console.log('@@ existing views', views);
	console.log('@@ existing images', imagesToUpload);
	console.log('@@ existing commentReply', commentReply);
	console.log('@@ existing other', other);
	const newMessage = watch('message');
	const saveViewpoint = watch('saveViewpoint');

	const { is2DOpen } = useContext(ViewerCanvasesContext);
	
	const currentUser = CurrentUserHooksSelectors.selectCurrentUser();

	const commentReplyLength = commentReply ? addReply(commentReply, '').length : 0;
	const charsCount = (newMessage?.length || 0) + commentReplyLength;
	const charsLimitIsReached = charsCount > MAX_MESSAGE_LENGTH;

	const messageIsUnchanged = message === newMessage
		&& images === imagesToUpload.map(({ src }) => src);
		// && isEqual(views, newViewpoint); // TODO 5309 check if viewpoint is new

	const erroredImages = imagesToUpload.filter(({ error }) => error);
	const disableSendMessage = (!newMessage?.trim()?.length && !imagesToUpload.length && !views)
		|| charsLimitIsReached
		|| erroredImages.length > 0
		|| messageIsUnchanged;

	const resetCommentBox = () => {
		reset();
		deleteCommentReply?.();
		setIsSubmittingMessage(false);
		setImagesToUpload([]);
	};

	const updateMessage = async ( ) => {
		const newViewpoint = saveViewpoint ? await ViewerService.getViewpoint() : null;
		console.log('@@ Updating comment with', imagesToUpload.length, 'images and a viewpoint of', newViewpoint);
		TicketCommentsActionsDispatchers.updateComment(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
			commentId,
			{ message: sanitiseMessage(newMessage), images: imagesToUpload.map(({ src }) => src), views: newViewpoint },
		);
		onCancel();
	};
	const createComment = async () => {
		setIsSubmittingMessage(true);
		const newViewpoint = saveViewpoint ? await ViewerService.getViewpoint() : null;
		const newComment: Partial<ITicketComment> = {
			author: currentUser.username,
			images: imagesToUpload.map(({ src }) => src),
			message: newMessage,
			views: newViewpoint,
		};
		if (commentReply) {
			newComment.message = addReply(commentReply, newComment.message);
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
		setImagesToUpload(imagesToUpload);
	};

	// @ts-ignore
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
		images: imagesToUpload.map(({ src }) => src),
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
		if (commentReply?.message || commentReply?.images?.length) {
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
			{commentReply?._id && ( // TODO sort out metadata/comment reply. extractMetadata from ticketComments.helpers sets the values to '' in an obj instead of returning null
				<CommentReplyContainer>
					<CommentReply {...commentReply} shortMessage />
					<DeleteButton onClick={deleteCommentReply}>
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
					{imagesToUpload.map(({ src, id, error }, index) => (
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
			<Controls>
				<ActionMenu TriggerButton={<FileIconInput><FileIcon /></FileIconInput>}>
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
				<Tooltip title={formatMessage({ id: 'customTicket.comments.action.useViewpoint', defaultMessage: 'Include viewpoint' })} arrow>
					<div>
						<FormCheckbox
							name="saveViewpoint"
							control={control}
							label={<ViewpointIcon />}
						/>
					</div>
				</Tooltip>
				<CharsCounter $error={charsLimitIsReached}>{charsCount}/{MAX_MESSAGE_LENGTH}</CharsCounter>
				{ isEditMode ? (
					<EditCommentButtons>
						<TicketButton variant="error" onClick={onCancel}>
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
