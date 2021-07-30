/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import React from 'react';

import { ScreenshotDialog } from '../screenshotDialog';
import { Container, ImagePlaceholder, StyledImage } from './image.styles';

interface IProps {
	src: string;
	className: string;
	alt?: string;
	enablePreview?: boolean;
	enablePlaceholder?: boolean;
	showScreenshotDialog: (config) => void;
	onClick?: () => void;
}

export const Image = ({ src, enablePlaceholder, enablePreview, showScreenshotDialog, onClick, ...props }: IProps) => {
	const [loaded, setLoaded] = React.useState<boolean>(false);

	const handleLoaded = () => setLoaded(true);

	const handlePreview = () => {
		if (onClick) {
			onClick();
			return;
		}

		if (enablePreview && src) {
			showScreenshotDialog({ sourceImage: src, disabled: true, template: ScreenshotDialog, notFullScreen: true, });
		}
	};

	return (
		<Container className={props.className} enablePreview={enablePreview} onLoad={handleLoaded} onClick={handlePreview}>
			{enablePlaceholder && !loaded && <ImagePlaceholder />}
			<StyledImage loading={enablePlaceholder && !loaded ? 1 : 0} src={src} alt={props.alt} />
		</Container>
	);
};
