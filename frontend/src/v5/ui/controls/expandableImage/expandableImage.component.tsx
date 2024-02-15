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
	index?: number,
	images: string[],
	className?: string,
	showExtraImagesValue?: boolean,
};
export const ExpandableImage = ({
	index = 0,
	images,
	showExtraImagesValue,
	className,
	...imgProps
}: ExpandableImageProps) => {
	const displayImage = images[index];

	const openImagesModal = () => DialogsActionsDispatchers.open('images', { images, index });

	if (!showExtraImagesValue || images.length === 1) {
		return (<Image src={displayImage} onClick={openImagesModal} className={className} {...imgProps} />);
	}

	return (
		<OverlappingContainer onClick={openImagesModal} className={className}>
			<Image src={displayImage} {...imgProps} />
			<ExtraImages>+{images.length - (index + 1)}</ExtraImages>
		</OverlappingContainer>
	);
};
