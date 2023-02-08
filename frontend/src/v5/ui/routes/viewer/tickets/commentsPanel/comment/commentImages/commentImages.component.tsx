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

import { getImgSrc } from '@/v5/store/tickets/tickets.helpers';
import { OverlappingContainer } from '@controls/overlappingContainer/overlappingContainer.styles';
import { ExtraImages, FlexContainer, Image } from './commentImages.styles';

type CommentImagesProps = {
	images: string[];
};
export const CommentImages = ({ images }: CommentImagesProps) => {
	if (images.length <= 3) {
		return (
			<FlexContainer>
				{images.map((image) => (<Image src={getImgSrc(image)} key={image} />))}
			</FlexContainer>
		);
	}
	if (images.length <= 5) {
		return (
			<>
				<FlexContainer>
					{(images.slice(0, 2)).map((image) => (<Image src={getImgSrc(image)} key={image} />))}
				</FlexContainer>
				<FlexContainer>
					{(images.slice(2, 5)).map((image) => (<Image src={getImgSrc(image)} key={image} />))}
				</FlexContainer>
			</>
		);
	}
	return (
		<>
			<FlexContainer>
				{(images.slice(0, 2)).map((image) => (<Image src={getImgSrc(image)} key={image} />))}
			</FlexContainer>
			<FlexContainer>
				<Image src={getImgSrc(images[2])} />
				<OverlappingContainer>
					<Image src={getImgSrc(images[3])}/>
					<ExtraImages>+{images.length - 3}</ExtraImages>
				</OverlappingContainer>
			</FlexContainer>
		</>
	);
};
