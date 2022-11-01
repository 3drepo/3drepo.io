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
import { HiddenImageUploader } from '@controls/hiddenImageUploader/hiddenImageUploader.component';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import {
	ActionsList,
	ActionsSide,
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

type BasicTicketImageProps = {
	imgSrc?: string,
	viewPoint?: any,
	onChange?: (e) => void,
	title: string,
	className?: string,
	children: any,
};
export const BasicTicketImage = ({
	children,
	imgSrc:
	inputImgSrc,
	viewPoint:
	inputViewPoint,
	onChange,
	title,
	className,
}: BasicTicketImageProps) => {
	const [imgSrc, setImgSrc] = useState(inputImgSrc);
	const [viewPoint, setViewPoint] = useState(inputViewPoint);
	const { isAdmin } = ProjectsHooksSelectors.selectCurrentProjectDetails();

	const contextValue = {
		imgSrc,
		setImgSrc,
		viewPoint,
		setViewPoint,
	};

	return (
		<Container className={className}>
			<ActionsSide>
				<PropertyName>{title}</PropertyName>
				<TicketImageActionContext.Provider value={contextValue}>
					<ActionsList>
						{children}
					</ActionsList>
				</TicketImageActionContext.Provider>
			</ActionsSide>
			<ImageSide>
				{!imgSrc ? (
					<HiddenImageUploader onUpload={setImgSrc} disabled={!isAdmin}>
						<EmptyImageContainer disabled={!isAdmin}>
							<EmptyImageIcon />
							<IconText>
								<FormattedMessage id="viewer.cards.ticketImage.addImage" defaultMessage="Add Image" />
							</IconText>
						</EmptyImageContainer>
					</HiddenImageUploader>
				) : (
					<OverlappingContainer>
						<Image src={imgSrc} alt={title} onChange={onChange} />
						<EnlargeContainer>
							<EnlargeImageIcon />
							<IconText>
								<FormattedMessage id="viewer.cards.ticketImage.enlarge" defaultMessage="Enlarge" />
							</IconText>
						</EnlargeContainer>
					</OverlappingContainer>
				)}
			</ImageSide>
		</Container>
	);
};
