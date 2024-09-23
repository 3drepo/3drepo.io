/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { useContext, useEffect, useState } from 'react';
import FileIcon from '@assets/icons/outlined/file-outlined.svg';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { FormHelperText } from '@mui/material';
import { ImagesModal } from '@components/shared/modalsDispatcher/templates/imagesModal/imagesModal.component';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useSyncProps } from '@/v5/helpers/syncProps.hooks';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Actions, Content, ImagesContainer, ImagesGridContainer } from './ticketImageList.styles';
import { TicketContext } from '../../../ticket.context';
import { ViewActionMenu } from '../ticketView/viewActionMenu/viewActionMenu.component';
import { FormattedMessage } from 'react-intl';
import { EllipsisMenu } from '@controls/ellipsisMenu';
import { InputContainer, Label } from '../ticketImageContent/ticketImage/ticketImage.styles';
import { EllipsisMenuItem, EllipsisMenuItemDelete } from '../ticketImageContent/ticketImageAction/ticketImageAction.styles';
import { ImageWithExtraCount } from '@controls/imageWithExtraCount/imageWithExtraCount.component';
import EnlargeImageIcon from '@assets/icons/outlined/enlarge_image-outlined.svg';
import { OverlappingContainer } from '@controls/overlappingContainer/overlappingContainer.styles';
import { EmptyImageContainer, EnlargeContainer, IconText } from '../ticketImageContent/ticketImageDisplayer/ticketImageDisplayer.styles';
import { AuthImg } from '@components/authenticatedResource/authImg.component';
import { getImgIdFromSrc, getImgSrcMapFunction } from '@/v5/store/tickets/tickets.helpers';
import EmptyImageIcon from '@assets/icons/outlined/add_image_thin-outlined.svg';
import { uploadImages } from '@controls/fileUploader/uploadImages';

const EmptyImage = ({ disabled, onClick }) => (
	<EmptyImageContainer disabled={disabled} onClick={onClick}>
		<EmptyImageIcon />
		{!disabled && (
			<IconText>
				<FormattedMessage id="viewer.cards.ticketImageList.addImages" defaultMessage="Add images" />
			</IconText>
		)}
	</EmptyImageContainer>
);

const EnlargeImagesOverlay = ({ children, onClick }) => (
	<OverlappingContainer onClick={onClick}>
		{children}
		<EnlargeContainer>
			<EnlargeImageIcon />
			<IconText>
				<FormattedMessage id="viewer.cards.ticketImageList.enlarge" defaultMessage="Enlarge" />
			</IconText>
		</EnlargeContainer>
	</OverlappingContainer>
);

export const TicketImageList = ({ value, onChange, onBlur, disabled, label, helperText, ...props }: FormInputProps) => {
	const { isViewer } = useContext(TicketContext);
	const getImgSrc = getImgSrcMapFunction();
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const imgsSrcs = (value || []).map(getImgSrc);
	const [imgsInModal, setImgsInModal] = useState(imgsSrcs);

	const onClose = () => onChange(imgsInModal?.length ? imgsInModal.map(getImgIdFromSrc) : null);
	const onDeleteImages = () => onChange(null);
	const onDeleteImage = (index) => setImgsInModal(imgsInModal.filter((img, i) => index !== i));
	const onEditImage = (newValue, index) => {
		if (newValue) {
			imgsInModal[index] = newValue;
			setImgsInModal([...imgsInModal]);
		}
	};

	const handleUploadImages = async () => uploadImages((imagesToUpload) => setImgsInModal(imgsInModal.concat(imagesToUpload)));

	const syncProps = useSyncProps({
		images: imgsInModal,
		...(disabled ? {} : {
			onDelete: onDeleteImage,
			onAddMarkup: onEditImage,
			onUpload: handleUploadImages,
			onClose,
		}),
	});

	const openImagesModal = (displayImageIndex?) => DialogsActionsDispatchers.open(ImagesModal, { displayImageIndex }, syncProps);

	const onUploadImages = async () => {
		const displayImageIndex = imgsInModal.length;
		await handleUploadImages();
		openImagesModal(displayImageIndex);
	};

	const onTakeScreenshot = async () => {
		const displayImageIndex = imgsInModal.length;
		const screenshot = await ViewerService.getScreenshot();
		setImgsInModal(imgsInModal.concat(screenshot));
		openImagesModal(displayImageIndex);
	};

	useEffect(() => {
		setImgsInModal(imgsSrcs);
		onBlur?.();
	}, [value]);

	return (
		<InputContainer disabled={disabled} {...props}>
			<Label>{label}</Label>
			<Content>
				<ImagesContainer>
					{!imgsSrcs.length
						? <EmptyImage disabled={disabled || !isProjectAdmin} onClick={onUploadImages} />
						: (
							<EnlargeImagesOverlay onClick={() => openImagesModal()}>
								{imgsSrcs?.length === 1 && <AuthImg src={imgsSrcs[0]} />}
								{imgsSrcs?.length > 1 && (
									<ImagesGridContainer>
										{imgsSrcs.slice(0, 3).map((imgSrc) => (<AuthImg src={imgSrc} />))}
										{imgsSrcs.length > 3 && <ImageWithExtraCount src={imgsSrcs[3]} extraCount={imgsSrcs.length - 3} />}
									</ImagesGridContainer>
								)}
							</EnlargeImagesOverlay>
						)}
				</ImagesContainer>
				<Actions>
					<ViewActionMenu
						disabled={!imgsSrcs.length}
						onClick={() => openImagesModal()}
						Icon={FileIcon}
						title={<FormattedMessage id="viewer.card.ticketView.actionMenu.images" defaultMessage="Images" />}
					>
						<EllipsisMenu disabled={disabled}>
							<EllipsisMenuItem
								title={<FormattedMessage id="viewer.card.ticketImageList.action.takeScreenshot" defaultMessage="Take screenshot" />}
								onClick={onTakeScreenshot}
								disabled={!isViewer}
							/>
							<EllipsisMenuItem
								title={<FormattedMessage id="viewer.card.ticketImageList.action.uploadImages" defaultMessage="Upload images" />}
								onClick={onUploadImages}
							/>
							<EllipsisMenuItemDelete
								title={<FormattedMessage id="viewer.card.ticketImageList.action.deleteImages" defaultMessage="Delete images" />}
								onClick={onDeleteImages}
								hidden={!imgsSrcs.length}
							/>
						</EllipsisMenu>
					</ViewActionMenu>
				</Actions>
			</Content>
			<FormHelperText>{helperText}</FormHelperText>
		</InputContainer>
	);
};
