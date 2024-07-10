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

import styled, { css, keyframes } from 'styled-components';

import { AuthImg } from '@components/authenticatedImage/authImg.component';
import { COLOR } from '../../../styles';

const previewStateStyles = css`
	cursor: pointer;
	transition: opacity 200ms ease-in-out;

	&:hover {
		opacity: 0.8;
	}
`;

export const Container = styled.div<{ enablePreview?: boolean }>`
	cursor: pointer;
	position: relative;
	${({ enablePreview }) => enablePreview && previewStateStyles};
	display: ${({ enablePreview }) => enablePreview ? 'block' : 'flex'};
`;

const fadeIn = keyframes`
	from {
		opacity: 0.5;
	}
`;

const imageLoadingStyles = css`
	position: absolute;
	top: 0;
`;

export const StyledImage = styled(AuthImg)<{ loading? }>`
	width: 100%;
	object-fit: cover;
	${({ loading }) => loading && imageLoadingStyles};

	.new-comment & {
		max-height: 150px;
	}
`;

export const ImagePlaceholder = styled.div`
	position: relative;
	width: 100%;
	height: 100%;
	transition: unset;

	&:before {
		content: '';
		display: block;
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 5px;
		background-color: ${COLOR.GRAY_50};
		animation: ${fadeIn} 0.75s infinite alternate;
	}
`;
