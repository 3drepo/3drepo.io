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
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import EmptyImageIcon from '@assets/icons/outlined/add_image_thin-outlined.svg';
import EnlargeImageIcon from '@assets/icons/outlined/enlarge_image-outlined.svg';
import { formatMessage } from '@/v5/services/intl';
import { Modal } from '@controls/modal';
import {
	EmptyImageContainer,
	EnlargeContainer,
	IconText,
	Image,
	Container,
	OverlappingContainer,
} from './ticketImageDisplayer.styles';

const LoadedImage = ({ imgSrc }) => {
	const [showLargePicture, setShowLargePicture] = useState(false);
	return (
		<>
			<OverlappingContainer onClick={() => setShowLargePicture(true)}>
				<Image
					src={imgSrc}
					alt={formatMessage({ id: 'viewer.cards.ticketImage.image', defaultMessage: 'image' })}
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

const EmptyImage = (props) => (
	<EmptyImageContainer {...props}>
		<EmptyImageIcon />
		<IconText>
			<FormattedMessage id="viewer.cards.ticketImage.addImage" defaultMessage="Add image" />
		</IconText>
	</EmptyImageContainer>
);

export const TicketImageDisplayer = ({ onEmptyImageClick, imgSrc, disabled }) => (
	<Container>
		{!imgSrc && <EmptyImage disabled={disabled} onClick={onEmptyImageClick} />}
		{imgSrc && <LoadedImage imgSrc={imgSrc} />}
	</Container>
);
