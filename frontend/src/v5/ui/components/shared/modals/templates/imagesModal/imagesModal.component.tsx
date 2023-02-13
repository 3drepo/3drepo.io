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

import { useState } from 'react';
import { Container, Image, NextButton, PreviousButton } from './imagesModal.styles';
import ChevronIcon from '@assets/icons/outlined/small_chevron-outlined.svg';

type ImagesModalProps = {
	images: string[];
};
export const ImagesModal = ({ images }: ImagesModalProps) => {
	const [imageIndex, setImageIndex] = useState(0);
	const imagesLength = images.length;

	if (imagesLength === 1) return (<Image src={images[imageIndex]} />);

	const changeImageIndex = (delta) => setImageIndex((imageIndex + delta + imagesLength) % imagesLength);

	return (
		<Container>
			<PreviousButton onClick={() => changeImageIndex(-1)}>
				<ChevronIcon />
			</PreviousButton>
			<Image src={images[imageIndex]} key={images[imageIndex]}/>
			<NextButton onClick={() => changeImageIndex(+1)}>
				<ChevronIcon />
			</NextButton>
		</Container>
	);
};
