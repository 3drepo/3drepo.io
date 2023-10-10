/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import styled, { css } from 'styled-components';
import { Display } from '@/v5/ui/themes/media';
import { isString } from 'lodash';

type WidthType = number | string;

export interface ContainerProps {
	width?: WidthType;
	minWidth?: WidthType;
	maxWidth?: WidthType;
	tabletWidth?: WidthType;
	mobileWidth?: WidthType;
	hideWhenSmallerThan?: Display | number;
}

const withDefaultUnits = (width: WidthType) => (isString(width) ? width : `${width}px`);

export const Container = styled.div<ContainerProps>`
	min-width: ${({ minWidth }) => withDefaultUnits(minWidth || 0)};

	${({ maxWidth, width }) => css`max-width: ${withDefaultUnits(maxWidth ?? width)};`}

	${({ width }) => (width
		? css`
		width: ${withDefaultUnits(width)};
		display: block;
	`
		: css`
		display: flex;
		flex: 1;
	`)}

	${({ tabletWidth }) => tabletWidth && css`
		@media (max-width: ${Display.Desktop}px) {
			width: ${withDefaultUnits(tabletWidth)};
			display: block;
		}
	`}

	${({ mobileWidth }) => mobileWidth && css`
		@media (max-width: ${Display.Tablet}px) {
			width: ${withDefaultUnits(mobileWidth)};
			display: block;
		}
	`}

	${({ hideWhenSmallerThan }) => hideWhenSmallerThan && css`
		@media (max-width: ${hideWhenSmallerThan}px) {
			display: none;
		}
  `};
`;
