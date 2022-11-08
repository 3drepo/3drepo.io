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
import { useContext, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import EmptyImageIcon from '@assets/icons/outlined/add_image_thin-outlined.svg';
import BrokenImageIcon from '@assets/icons/outlined/broken-outlined.svg';
import EnlargeImageIcon from '@assets/icons/outlined/enlarge_image-outlined.svg';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import { formatMessage } from '@/v5/services/intl';
import { HiddenImageUploader } from '@controls/formImage/hiddenImageUploader/hiddenImageUploader.component';
import { Modal } from '@controls/modal';
import {
	BrokenImageContainer,
	EmptyImageContainer,
	EnlargeContainer,
	IconText,
	Image,
	Container,
	OverlappingContainer,
} from './ticketImageDisplayer.styles';
import { TicketImageActionContext } from '../ticketImageAction/ticketImageActionContext';

const LoadedImage = () => {
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

const EmptyImage = ({ imgIsInvalid, disabled }) => {
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

export const TicketImageDisplayer = ({ imgIsInvalid }) => {
	const { isAdmin } = ProjectsHooksSelectors.selectCurrentProjectDetails();
	const { setImgFile, imgSrc } = useContext(TicketImageActionContext);

	return (
		<Container>
			<HiddenImageUploader
				onChange={setImgFile}
				disabled={!isAdmin}
			>
				{!imgSrc && <EmptyImage imgIsInvalid={imgIsInvalid} disabled={!isAdmin} />}
			</HiddenImageUploader>
			{imgSrc && <LoadedImage />}
		</Container>
	);
};
