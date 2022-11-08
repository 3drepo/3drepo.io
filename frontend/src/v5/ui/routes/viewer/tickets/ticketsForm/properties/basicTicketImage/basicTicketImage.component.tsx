/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { FormattedMessage } from 'react-intl';
import EmptyImageIcon from '@assets/icons/outlined/add_image_thin-outlined.svg';
import BrokenImageIcon from '@assets/icons/outlined/broken-outlined.svg';
import EnlargeImageIcon from '@assets/icons/outlined/enlarge_image-outlined.svg';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import { formatMessage } from '@/v5/services/intl';
import { validateImgSrc } from '@controls/formImage/image.helper';
import { HiddenImageUploader } from '@controls/formImage/hiddenImageUploader/hiddenImageUploader.component';
import { Modal } from '@controls/modal';
import {
	ActionsList,
	ActionsSide,
	BrokenImageContainer,
	Container,
	EmptyImageContainer,
	EnlargeContainer,
	IconText,
	Image,
	ImageSide,
	OverlappingContainer,
	PropertyName,
	Asterisk,
} from './basicTicketImage.styles';
import { TicketImageActionContext } from './ticketImageAction/ticketImageActionContext';

const TicketLoadedImage = () => {
	const [showLargePicture, setShowLargePicture] = useState(false);
	const { imgSrc, setImgSrc } = useContext(TicketImageActionContext);
	return (
		<>
			<OverlappingContainer onClick={() => setShowLargePicture(true)}>
				<Image
					src={imgSrc}
					alt={formatMessage({ id: 'viewer.cards.ticketImage.image', defaultMessage: 'image' })}
					onChange={setImgSrc}
				/>
				<EnlargeContainer>
					<EnlargeImageIcon />
					<IconText>
						<FormattedMessage id="viewer.cards.ticketImage.enlarge" defaultMessage="Enlarge" />
					</IconText>
				</EnlargeContainer>
			</OverlappingContainer>
			<Modal open={showLargePicture} onClickClose={() => setShowLargePicture(false)}>
				<Image
					src={imgSrc}
					alt={formatMessage({ id: 'viewer.cards.ticketImage.largeImage', defaultMessage: 'enlarged image' })}
				/>
			</Modal>
		</>
	);
};

const TicketEmptyImage = ({ imgIsInvalid, disabled }) => {
	if (!imgIsInvalid) {
		return (
			<EmptyImageContainer disabled={disabled}>
				<EmptyImageIcon />
				<IconText>
					<FormattedMessage id="viewer.cards.ticketImage.addImage" defaultMessage="Add image" />
				</IconText>
			</EmptyImageContainer>
		);
	}
	return (
		<BrokenImageContainer disabled={disabled}>
			<BrokenImageIcon />
			<IconText>
				<FormattedMessage id="viewer.cards.ticketImage.unsupportedImage" defaultMessage="Unsupported image" />
			</IconText>
		</BrokenImageContainer>
	);
};

type BasicTicketImageProps = {
	defaultValue?: string,
	viewpoint?: any,
	title: string,
	className?: string,
	onChange?: ({ imgSrc, viewpoint }) => void,
	children: any,
	required?: boolean,
};
export const BasicTicketImage = ({
	children,
	defaultValue,
	viewpoint:
	inputViewpoint,
	title,
	className,
	onChange,
	required,
}: BasicTicketImageProps) => {
	const [viewpoint, setViewpoint] = useState(inputViewpoint);
	const [imgSrc, setImgSrc] = useState(defaultValue);
	const [imgIsInvalid, setImgIsInvalid] = useState(false);
	const { isAdmin } = ProjectsHooksSelectors.selectCurrentProjectDetails();

	const deleteImg = () => setImgSrc(null);

	const uploadImgSrc = (newImgSrc) => {
		setImgSrc(newImgSrc);
		setImgIsInvalid(false);
	};

	const handleInvalidUploadImgSrc = () => {
		deleteImg();
		setImgIsInvalid(true);
	};

	const uploadImgFile = (imgFile) => {
		if (!imgFile) {
			deleteImg();
		} else {
			const reader = new FileReader();
			reader.onloadend = () => validateImgSrc(reader.result, uploadImgSrc, handleInvalidUploadImgSrc);
			reader.readAsDataURL(imgFile);
		}
	};

	const contextValue = {
		imgSrc,
		setImgSrc: uploadImgSrc,
		setImgFile: uploadImgFile,
		viewpoint,
		setViewpoint,
	};

	useEffect(() => { onChange?.({ imgSrc, viewpoint }); }, [imgSrc, viewpoint]);
	useEffect(() => { setImgSrc(defaultValue); }, [defaultValue]);

	return (
		<Container className={className}>
			<TicketImageActionContext.Provider value={contextValue}>
				<ActionsSide>
					<PropertyName>
						{title}{required && <Asterisk />}
					</PropertyName>
					<ActionsList>
						{children}
					</ActionsList>
				</ActionsSide>
				<ImageSide>
					<HiddenImageUploader
						onChange={uploadImgFile}
						disabled={!isAdmin}
					>
						{!imgSrc && <TicketEmptyImage imgIsInvalid={imgIsInvalid} disabled={!isAdmin} />}
					</HiddenImageUploader>
					{imgSrc && <TicketLoadedImage />}
				</ImageSide>
			</TicketImageActionContext.Provider>
		</Container>
	);
};
