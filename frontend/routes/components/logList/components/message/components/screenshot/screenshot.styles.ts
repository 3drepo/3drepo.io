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

import { Image as ImageComponent } from '../../../../../image';

export const Wrapper = styled.div`
	width: 100%;
	padding-top: 42%;
	overflow: hidden;
	position: relative;
	margin: 8px 0 0;
	border-radius: ${(props: any) => props.withMessage ? '2px 2px 0 0' : '2px'};
` as any;

export const Image = styled(ImageComponent)`
	img {
		display: block;
		max-width: 100%;
		width: 100%;
		height: auto;
		margin: auto;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}
` as any;
