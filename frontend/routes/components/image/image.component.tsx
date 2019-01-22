/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import * as React from 'react';

import { StyledImage } from './image.styles';
import { render } from 'react-dom';
import { renderWhenTrue } from '../../../helpers/rendering';

interface IProps {
	src: string;
	alt?: string;
	enablePreview?: boolean;
	showScreenshotDialog: (config) => void;
}

const isDataURI = (source) => source.startsWith('data:');

export class Image extends React.PureComponent<IProps, any> {
	public renderBase64Image = renderWhenTrue(() => (
		<></>
	));

	public renderRegularImage = renderWhenTrue(() => (
		<StyledImage
			src={this.props.src}
			alt={this.props.alt}
			onClick={this.handlePreview}
			enablePreview
		/>
	));

	public handlePreview = () => {
		const { src, enablePreview, showScreenshotDialog } = this.props;
		if (enablePreview && src) {
			showScreenshotDialog({ sourceImage: src, disabled: true });
		}
	}

	public render() {
		const isRegularImage = !isDataURI(this.props.src);

		return (
			<>
				{this.renderBase64Image(!isRegularImage)}
				{this.renderRegularImage(isRegularImage)}
			</>
		);
	}
}
