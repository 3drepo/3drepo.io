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
import { SvgViewer } from '../svgViewer.component';
import { Loader } from '@/v4/routes/components/loader/loader.component';

type DrawingViewerImageProps = { onLoad: (...args) => void };
export const DrawingViewerImage = forwardRef(({ onLoad }: DrawingViewerImageProps, ref) => {
	const [drawingId] = useSearchParam('drawingId');
	const [status, setStatus] = useState<'loading' | 'svg' | 'png'>('loading');
	const [svgContent, setSvgContent] = useState(null);
	const src = getDrawingImageSrc(drawingId);

	const updateStatus = async () => {
		setStatus('loading');
		const response = await fetch(src);
		const contentType = response.headers.get('content-type');
		const isPng = contentType.startsWith('image/png');

		if (isPng) {
			setStatus('png');
			setSvgContent(null);
		} else {
			setSvgContent(await response.text());
			setStatus('svg');
		}
	};

	useEffect(() => {
		if (!drawingId) return;
		updateStatus();
	}, [drawingId]);

	if (status === 'loading') return <Loader />;
	if (status === 'png') return <img src={src} ref={ref as any} onLoad={onLoad} />;
	return <SvgViewer svgContent={svgContent} ref={ref} onLoad={onLoad}/>;
});