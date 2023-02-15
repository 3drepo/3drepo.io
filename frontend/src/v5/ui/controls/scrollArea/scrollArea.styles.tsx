/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import Scrollbars, { ScrollbarProps } from 'react-custom-scrollbars';
import styled from 'styled-components';
import { COLOR } from '@/v5/ui/themes/theme';

type ScrollbarVariant = 'base' | 'secondary';

const COLOUR_MAP = {
	base: COLOR.BASE_LIGHTEST,
	secondary: COLOR.SECONDARY_LIGHT,
};

const getBackgroundColor = (variant: ScrollbarVariant) => COLOUR_MAP[variant];

const ThumbVertical = styled.div<{ variant: ScrollbarVariant }>`
	right: 6px;
	bottom: 6px;
	top: 0px;
	border-radius: 3px;
	width: 6px;
	background-color: ${({ variant }) => getBackgroundColor(variant)};
`;

const ThumbHorizontal = styled.div<{ variant: ScrollbarVariant }>`
	left: 6px;
	right: 6px;
	bottom: 6px;
	border-radius: 3px;
	height: 6px;
	background-color: ${({ variant }) => getBackgroundColor(variant)};
	overflow-x: hidden;
`;
export type ScrollAreaProps = ScrollbarProps & {
	variant?: ScrollbarVariant;
	as?: React.ElementType;
	hideHorizontal?: boolean;
};
export const ScrollArea = styled(Scrollbars).attrs(
	({ variant = 'base', hideHorizontal = true }: ScrollAreaProps) => ({
		autoHideTimeout: 1000,
		autoHideDuration: 300,
		renderThumbVertical: ({ style }) => <ThumbVertical style={style} variant={variant} />,
		renderThumbHorizontal: ({ style }) => (
			hideHorizontal ? (
				<ThumbHorizontal style={style} variant={variant} />
			) : (<span />)
		),
	}),
)<ScrollAreaProps>``;
