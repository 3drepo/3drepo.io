/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { getDrawingImageSrc } from '@/v5/store/drawings/drawings.helpers';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { forwardRef, useEffect, useState } from 'react';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { CentredContainer } from '@controls/centredContainer';

type DrawingViewerImageProps = { onLoad: (...args) => void };
export const DrawingViewerImage = forwardRef(({ onLoad }: DrawingViewerImageProps, ref: any) => {
	const [drawingId] = useSearchParam('drawingId');
	const [isLoading, setIsLoading] = useState(true);
	const src = getDrawingImageSrc(drawingId);

	useEffect(() => {
		setIsLoading(true);
		fetch(src).then(() => setIsLoading(false));
	}, [drawingId]);

	if (isLoading) return (
		<CentredContainer>
			<Loader />
		</CentredContainer>
	);

	return <img src={src} ref={ref} onLoad={onLoad} />;
});