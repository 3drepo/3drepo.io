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

import { FlexContainer, CommentImage, MultiImagesContainer, SingleImage } from './commentImages.styles';

type CommentImagesProps = {
	images: string[];
	onImageClick: (index) => void;
};
export const CommentImages = ({ images, onImageClick, ...props }: CommentImagesProps) => {
	if (images.length === 1) {
		return (<SingleImage onClick={() => onImageClick(0)} src={images[0]} {...props} />);
	}

	if (images.length <= 3) {
		return (
			<MultiImagesContainer>
				<FlexContainer>
					{images.map((image, index) => (
						<CommentImage onClick={() => onImageClick(index)} src={image} key={image} {...props} />
					))}
				</FlexContainer>
			</MultiImagesContainer>
		);
	}

	if (images.length <= 5) {
		return (
			<MultiImagesContainer>
				<FlexContainer>
					{(images.slice(0, 2)).map((image, index) => (
						<CommentImage onClick={() => onImageClick(index)} src={image} key={image} {...props} />
					))}
				</FlexContainer>
				<FlexContainer>
					{(images.slice(2, 5)).map((image, index) => (
						<CommentImage onClick={() => onImageClick(index + 2)} src={image} key={image} {...props} />
					))}
				</FlexContainer>
			</MultiImagesContainer>
		);
	}

	return (
		<MultiImagesContainer>
			<FlexContainer>
				{(images.slice(0, 2)).map((image, index) => (
					<CommentImage onClick={() => onImageClick(index)} src={image} key={image} {...props} />
				))}
			</FlexContainer>
			<FlexContainer>
				<CommentImage onClick={() => onImageClick(2)} src={images[2]} {...props} />
				<CommentImage onClick={() => onImageClick(3)} src={images[3]} extraCount={images.length - 3} {...props} />
			</FlexContainer>
		</MultiImagesContainer>
	);
};
