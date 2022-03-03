
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

import { ReactNode, CSSProperties } from 'react';

import { StyledComponentProps } from 'styled-components';
import { Display } from '@/v5/ui/themes/media';
import { Container } from './fixedOrGrowContainer.styles';

export interface IFixedOrGrowContainer extends StyledComponentProps {
	width?: number;
	tabletWidth?: number;
	mobileWidth?: number;
	hideWhenSmallerThan?: Display;
	minWidth?: number;
	children?: JSX.Element | ReactNode | ReactNode[] ;
	className?: string;
	style?: CSSProperties;
}

export const FixedOrGrowContainer = ({
	width,
	tabletWidth,
	mobileWidth,
	children,
	hideWhenSmallerThan,
	...props
}: IFixedOrGrowContainer): JSX.Element => (
	<Container
		width={width}
		tabletWidth={tabletWidth}
		mobileWidth={mobileWidth}
		hideWhenSmallerThan={hideWhenSmallerThan}
		{...props}
	>
		{children}
	</Container>
);
