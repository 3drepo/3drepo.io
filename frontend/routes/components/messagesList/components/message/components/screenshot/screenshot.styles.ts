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

import styled from 'styled-components';

import { Image as ImageComponent } from '../../../../../image/';
import { ImagePlaceholder, StyledImage } from '../../../../../image/image.styles';

export const Image = styled(ImageComponent)`
	margin-top: 6px;
	margin-bottom: 8px;

	${StyledImage} {
		display: block;
		max-height: 100px;
	}

	${ImagePlaceholder} {
		height: 100px;
	}
` as any;
