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
import { HiddenImageUploader } from '@controls/hiddenImageUploader/hiddenImageUploader.component';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import { formatMessage } from '@/v5/services/intl';
import { validateImg } from '@controls/hiddenImageUploader/Image.helper';
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
} from './basicTicketImage.styles';
import { TicketImageActionContext } from './actions/ticketImageActionContext';

const TicketImage = ({ imgIsInvalid }) => {
	const { isAdmin } = ProjectsHooksSelectors.selectCurrentProjectDetails();

	const { imgSrc, setImgSrc } = useContext(TicketImageActionContext);

	if (!imgSrc && !imgIsInvalid) {
		return (
			<HiddenImageUploader
				onChange={setImgSrc}
				disabled={!isAdmin}
			>
				<EmptyImageContainer disabled={!isAdmin}>
					<EmptyImageIcon />
					<IconText>
						<FormattedMessage id="viewer.cards.ticketImage.addImage" defaultMessage="Add Image" />
					</IconText>
				</EmptyImageContainer>
			</HiddenImageUploader>
		);
	}

	if (!imgSrc && imgIsInvalid) {
		return (
			<HiddenImageUploader
				onChange={setImgSrc}
				disabled={!isAdmin}
			>
				<BrokenImageContainer disabled={!isAdmin}>
					<BrokenImageIcon />
					<IconText>
						<FormattedMessage id="viewer.cards.ticketImage.unsupportedImage" defaultMessage="Unsupported Image" />
					</IconText>
				</BrokenImageContainer>
			</HiddenImageUploader>
		);
	}

	return (
		<OverlappingContainer>
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
	);
};

type BasicTicketImageProps = {
	imgSrc?: string,
	viewpoint?: any,
	title: string,
	className?: string,
	onChange?: ({ imgSrc, viewpoint }) => void;
	children: any,
};
export const BasicTicketImage = ({
	children,
	imgSrc: inputImgSrc,
	viewpoint:
	inputViewpoint,
	title,
	className,
	onChange,
}: BasicTicketImageProps) => {
	const [viewpoint, setViewpoint] = useState(inputViewpoint);
	const [imgSrc, setImgSrcUnsafe] = useState(inputImgSrc);
	const [imgIsInvalid, setImgIsInvalid] = useState(false);

	const onImgUploadSuccess = (newImgSrc) => {
		setImgSrcUnsafe(newImgSrc);
		setImgIsInvalid(false);
	};

	const onImgUploadFail = () => {
		setImgSrcUnsafe(null);
		setImgIsInvalid(true);
	};

	const setImgSrc = (newImgSrc) => {
		if (!newImgSrc) {
			setImgSrcUnsafe(null);
		} else {
			validateImg(newImgSrc, onImgUploadSuccess, onImgUploadFail);
		}
	};

	const contextValue = {
		imgSrc,
		setImgSrc,
		viewpoint,
		setViewpoint,
	};

	useEffect(() => { onChange?.({ imgSrc, viewpoint }); }, [imgSrc, viewpoint]);

	return (
		<Container className={className}>
			<TicketImageActionContext.Provider value={contextValue}>
				<ActionsSide>
					<PropertyName>{title}</PropertyName>
					<ActionsList>
						{children}
					</ActionsList>
				</ActionsSide>
				<ImageSide>
					<TicketImage imgIsInvalid={imgIsInvalid} />
				</ImageSide>
			</TicketImageActionContext.Provider>
		</Container>
	);
};
