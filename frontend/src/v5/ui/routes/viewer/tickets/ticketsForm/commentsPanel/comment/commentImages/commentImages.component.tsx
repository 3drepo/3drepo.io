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
import { FlexContainer, CommentImage, MultiImagesContainer, SingleImage } from './commentImages.styles';

type CommentImagesProps = {
	images: string[];
	onUpload?: (images: string[]) => void;
	onDelete?: (index) => void;
	onImageClick: (index) => void;
};
export const CommentImages = ({ images, onImageClick, ...props }: CommentImagesProps) => {
	const imagesSrcs = images.map(getImgSrc);

	if (imagesSrcs.length === 1) {
		return (<SingleImage onClick={() => onImageClick(0)} src={imagesSrcs[0]} {...props} />);
	}

	if (imagesSrcs.length <= 3) {
		return (
			<MultiImagesContainer>
				<FlexContainer>
					{imagesSrcs.map((image, index) => (
						<CommentImage onClick={() => onImageClick(index)} src={image} key={image} {...props} />
					))}
				</FlexContainer>
			</MultiImagesContainer>
		);
	}

	if (imagesSrcs.length <= 5) {
		return (
			<MultiImagesContainer>
				<FlexContainer>
					{(imagesSrcs.slice(0, 2)).map((image, index) => (
						<CommentImage onClick={() => onImageClick(index)} src={image} key={image} {...props} />
					))}
				</FlexContainer>
				<FlexContainer>
					{(imagesSrcs.slice(2, 5)).map((image, index) => (
						<CommentImage onClick={() => onImageClick(index)} src={image} key={image} {...props} />
					))}
				</FlexContainer>
			</MultiImagesContainer>
		);
	}

	const preloadImage = (src) => { new Image().src = src; };
	const preloadImages = () => imagesSrcs.slice(4).forEach(preloadImage);

	return (
		<MultiImagesContainer onClick={preloadImages}>
			<FlexContainer>
				{(imagesSrcs.slice(0, 2)).map((image, index) => (
					<CommentImage onClick={() => onImageClick(index)} src={image} key={image} {...props} />
				))}
			</FlexContainer>
			<FlexContainer>
				<CommentImage onClick={() => onImageClick(2)} src={imagesSrcs[2]} {...props} />
				<CommentImage onClick={() => onImageClick(3)} src={imagesSrcs[3]} extraCount={imagesSrcs.length - 3} {...props} />
			</FlexContainer>
		</MultiImagesContainer>
	);
};
