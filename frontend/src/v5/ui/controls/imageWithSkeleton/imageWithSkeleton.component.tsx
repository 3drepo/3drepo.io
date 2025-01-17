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
import { Image, SkeletonImage } from './imageWithSkeleton.styles';

type ImageWithSkeletonProps = {
	src: string,
	draggable?: boolean,
	className?: string,
	onClick?: (event?) => void,
	variant?: 'primary' | 'secondary',
};
export const ImageWithSkeleton = ({ src, onClick, variant = 'primary', ...props }: ImageWithSkeletonProps) => {
	const [isLoading, setIsLoading] = useState(true);

	const handleImageLoaded = () => setIsLoading(false);

	return (
		<>
			<Image src={src} onLoad={handleImageLoaded} $isLoading={isLoading} onClick={onClick} {...props} />
			{isLoading && <SkeletonImage {...props} $variant={variant} />}
		</>
	);
};
