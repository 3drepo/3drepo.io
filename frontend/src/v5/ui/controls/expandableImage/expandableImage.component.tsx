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

import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { Image, ExtraImages, OverlappingContainer } from './expandableImage.styles';

type ExpandableImageProps = {
	// to use if the image to display is not the first one
	displayImageIndex?: number,
	images: string[],
	className?: string,
	showExtraImagesValue?: boolean,
};
export const ExpandableImage = ({
	displayImageIndex = 0,
	images,
	showExtraImagesValue,
	className,
}: ExpandableImageProps) => {
	const displayImage = images[displayImageIndex];

	const openImagesModal = () => {
		const end = images.slice(0, displayImageIndex);
		const start = images.slice(displayImageIndex);
		DialogsActionsDispatchers.open('images', { images: start.concat(end) })
	};

	if (!showExtraImagesValue || images.length === 1) {
		return (<Image src={displayImage} onClick={openImagesModal} className={className} />);
	}

	return (
		<OverlappingContainer onClick={openImagesModal} className={className}>
			<Image src={displayImage} />
			<ExtraImages>+{images.length - (displayImageIndex + 1)}</ExtraImages>
		</OverlappingContainer>
	);
};
