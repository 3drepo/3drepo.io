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
import CloseIcon from '@assets/icons/outlined/close-outlined.svg';
import { FormattedMessage } from 'react-intl';
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import DownloadIcon from '@assets/icons/outlined/download_arrow-outlined.svg';
import EditIcon from '@assets/icons/outlined/edit_comment-outlined.svg';
import {
	Modal, Container, Image, NextButton, PreviousButton, CloseButton, Counter,
	TopBar, Buttons, TopBarButton, FlexRow, TextTopBarButton, ImageThumbnail,
	ImagesContainer, ImageWithArrows,
} from './imagesModal.styles';

type ImagesModalProps = {
	images: string[];
	// to use if the image to display is not the first one
	displayImageIndex?: number;
	onClickClose: () => void;
	open: boolean;
	onDelete?: (index) => void;
	onDownload?: (index) => void;
};
export const ImagesModal = ({ images, displayImageIndex = 0, onClickClose, open, onDelete, onDownload }: ImagesModalProps) => {
	const [imageIndex, setImageIndex] = useState(displayImageIndex);
	const imagesLength = images.length;
	const imageRef = useRef<HTMLImageElement>(null);

	const changeImageIndex = (delta) => setImageIndex((imageIndex + delta + imagesLength) % imagesLength);

	const handleKeyDown = ({ keyCode }) => {
		const ESCAPE_KEY = 27;
		const LEFT_KEY = 37;
		const RIGHT_KEY = 39;

		switch (keyCode) {
			case ESCAPE_KEY:
				onClickClose();
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

	useEffect(() => {
		if (!imageRef.current) return;
		imageRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center' });
	}, [imageIndex]);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	});

	useEffect(() => {
		if (!imagesLength) {
			onClickClose();
		}
	}, [imagesLength]);

	return (
		<Modal open={open} onClose={onClickClose}>
			<TopBar>
				<FlexRow>
					{imagesLength > 1 && (
						<Counter>
							<FormattedMessage
								id="images.count"
								defaultMessage="{imageIndex} of {imagesLength}"
								values={{ imageIndex: imageIndex + 1, imagesLength }}
							/>
						</Counter>
					)}
					<Buttons>
						<TextTopBarButton>
							<EditIcon />
							<FormattedMessage
								id="images.button.addMarkup"
								defaultMessage="Add markup"
							/>
						</TextTopBarButton>
						{onDelete && (
							<TopBarButton onClick={() => onDelete(imageIndex)}>
								<DeleteIcon />
							</TopBarButton>
						)}
						{onDownload && (
							<TopBarButton onClick={() => onDownload(imageIndex)}>
								<DownloadIcon />
							</TopBarButton>
						)}
					</Buttons>
				</FlexRow>
				<CloseButton onClick={onClickClose}>
					<CloseIcon />
				</CloseButton>
			</TopBar>
			<Container>
				{imagesLength === 1 ? (
					<Image src={images[imageIndex]} />
				) : (
					<>
						<ImageWithArrows>
							<PreviousButton onClick={() => changeImageIndex(-1)}>
								<ChevronIcon />
							</PreviousButton>
							<Image src={images[imageIndex]} key={images[imageIndex]} />
							<NextButton onClick={() => changeImageIndex(1)}>
								<ChevronIcon />
							</NextButton>
						</ImageWithArrows>
						<ImagesContainer>
							{images.map((img, index) => (
								<ImageThumbnail
									src={img}
									onClick={() => setImageIndex(index)}
									selected={index === imageIndex}
									ref={index === imageIndex ? imageRef : null}
								/>
							))}
						</ImagesContainer>
					</>
				)}
			</Container>
		</Modal>
	);
};
