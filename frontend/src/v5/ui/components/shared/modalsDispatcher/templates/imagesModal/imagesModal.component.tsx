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

import { useEffect, useRef, useState } from 'react';
import ChevronIcon from '@assets/icons/outlined/small_chevron-outlined.svg';
import { FormattedMessage } from 'react-intl';
import UploadImageIcon from '@assets/icons/outlined/add_image-outlined.svg';
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import EditIcon from '@assets/icons/outlined/edit_comment-outlined.svg';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { Tooltip } from '@mui/material';
import { formatMessage } from '@/v5/services/intl';
import {
	Modal, CenterBar, Image, NextButton, PreviousButton, Counter,
	TopBar, Buttons, TopBarButton, TextTopBarButton, ImageThumbnail,
	BottomBar, ImageWithArrows, ImageThumbnailContainer, ImageContainer, CloseButton,
} from './imagesModal.styles';
import { ImageMarkup } from './imageMarkup/imageMarkup.component';

export type ImagesModalProps = {
	onClickClose: () => void;
	onClose?: () => void;
	open: boolean;
	images: string[];
	// to use if the image to display is not the first one
	displayImageIndex?: number;
	onAddMarkup?: (img, index) => void;
	onUpload?: () => void;
	onDelete?: (index) => void;
	disabledDeleteMessage?: string;
};
export const ImagesModal = ({
	images,
	displayImageIndex = 0,
	onClickClose,
	onClose,
	open,
	onUpload,
	onDelete,
	onAddMarkup,
	disabledDeleteMessage,
}: ImagesModalProps) => {
	const [imageIndex, setImageIndex] = useState(displayImageIndex);
	const [markupMode, setMarkupMode] = useState(false);
	const previousImagesLength = useRef(images.length);
	const imagesLength = images.length;
	const imageRef = useRef<HTMLImageElement>(null);
	const hasManyImages = imagesLength > 1;
	const currentImage = images[imageIndex];

	const changeImageIndex = (delta) => {
		const newIndex = Math.max(0, Math.min(imagesLength - 1, imageIndex + delta));
		setImageIndex(newIndex);
	};

	const handleClose = () => {
		onClickClose();
		onClose?.();
	};

	const handleKeyDown = ({ keyCode }) => {
		const ESCAPE_KEY = 27;
		const LEFT_KEY = 37;
		const RIGHT_KEY = 39;

		switch (keyCode) {
			case ESCAPE_KEY:
				handleClose();
				break;
			case LEFT_KEY:
				changeImageIndex(-1);
				break;
			case RIGHT_KEY:
				changeImageIndex(1);
				break;
			default:
			// do nothing
		}
	};

	const handleDelete = () => {
		onDelete(imageIndex);
		if (imageIndex === (imagesLength - 1)) {
			setImageIndex(imageIndex - 1);
		}
	};

	const triggerDeleteModal = () => {
		DialogsActionsDispatchers.open('delete', {
			onClickConfirm: handleDelete,
			titleLabel: formatMessage({
				id: 'imagesModal.deleteModal.title',
				defaultMessage: 'Delete image',
			}),
			message: formatMessage({
				id: 'imagesModal.deleteModal.message',
				defaultMessage: 'Are you sure you want to delete the selected image?',
			}),
		});
	};

	const centerSelectedThumbnail = () => {
		if (!imageRef.current) return;
		// @ts-ignore
		imageRef.current.scrollIntoView({ behavior: 'instant', inline: 'center' });
	};

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [changeImageIndex]);

	useEffect(() => {
		if (!imagesLength) {
			handleClose();
		}

		if (previousImagesLength.current < imagesLength) {
			setImageIndex(imagesLength - 1);
		}
		previousImagesLength.current = imagesLength;
	}, [imagesLength]);

	useEffect(() => { centerSelectedThumbnail(); }, [imagesLength, imageIndex]);

	if (markupMode) return (
		<Modal open={open}>
			<TopBar>
				<CloseButton onClick={() => setMarkupMode(false)} />
			</TopBar>
			<ImageMarkup image={currentImage} onSave={(img) => onAddMarkup(img, imageIndex)} onClose={() => setMarkupMode(false)} />
		</Modal>
	);

	return (
		<Modal open={open} onClose={handleClose}>
			<TopBar>
				<Buttons>
					{hasManyImages && (
						<Counter $counterChars={imagesLength.toString().length}>
							<FormattedMessage
								id="images.count.of"
								defaultMessage="{current} of {total}"
								values={{
									current: imageIndex + 1,
									total: imagesLength,
								}}
							/>
						</Counter>
					)}
					{onAddMarkup && (
						<TextTopBarButton onClick={() => setMarkupMode(true)}>
							<EditIcon />
							<FormattedMessage
								id="images.button.addMarkup"
								defaultMessage="Add markup"
							/>
						</TextTopBarButton>
					)}
					{onUpload && (
						<TopBarButton onClick={onUpload}>
							<UploadImageIcon />
						</TopBarButton>
					)}
					{onDelete && (
						<Tooltip title={disabledDeleteMessage}>
							<span>
								<TopBarButton onClick={triggerDeleteModal} disabled={!!disabledDeleteMessage}>
									<DeleteIcon />
								</TopBarButton>
							</span>
						</Tooltip>
					)}
				</Buttons>
				<CloseButton onClick={handleClose} />
			</TopBar>
			<CenterBar>
				{!hasManyImages && (
					<ImageContainer>
						<Image src={currentImage} />
					</ImageContainer>
				)}
				{hasManyImages && (
					<ImageWithArrows>
						<PreviousButton onClick={() => changeImageIndex(-1)} disabled={imageIndex === 0}>
							<ChevronIcon />
						</PreviousButton>
						<ImageContainer $isCarousel>
							<Image src={currentImage} key={currentImage} />
						</ImageContainer>
						<NextButton onClick={() => changeImageIndex(1)} disabled={imageIndex === (imagesLength - 1)}>
							<ChevronIcon />
						</NextButton>
					</ImageWithArrows>
				)}
			</CenterBar>
			{hasManyImages && (
				<BottomBar onLoad={centerSelectedThumbnail}>
					{images.map((img, index) => (
						<ImageThumbnailContainer
							onClick={() => setImageIndex(index)}
							selected={index === imageIndex}
							ref={index === imageIndex ? imageRef : null}
							key={img + index}
						>
							<ImageThumbnail src={img} />
						</ImageThumbnailContainer>
					))}
				</BottomBar>
			)}
		</Modal>
	);
};
