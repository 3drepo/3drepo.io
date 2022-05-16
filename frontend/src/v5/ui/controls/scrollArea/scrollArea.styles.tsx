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

import Scrollbars from 'react-custom-scrollbars';
import styled from 'styled-components';

export const ScrollbarWrapper = styled(Scrollbars).attrs(
	({ variant, $hidehorizontal, theme }: { variant: string, $hidehorizontal: boolean, theme: any }) => {
		const COLOUR_MAP = {
			base: theme.palette.base.lightest,
			secondary: theme.palette.secondary.light,
		};
		return ({
			autoHideTimeout: 3000,
			autoHideDuration: 300,
			renderThumbVertical: ({ style }) => (
				<div
					style={{
						...style,
						backgroundColor: COLOUR_MAP[variant],
						right: '6px',
						bottom: '6px',
						top: '0px',
						borderRadius: '3px',
						width: '6px',
					}}
				/>
			),
			renderThumbHorizontal: ({ style }) => (
				<div
					style={{
						...style,
						backgroundColor: COLOUR_MAP[variant],
						left: '6px',
						right: '6px',
						bottom: '6px',
						borderRadius: '3px',
						height: '6px',
						display: $hidehorizontal ? 'none' : 'block',
					}}
				/>
			),
		});
	},
)<{ variant: 'base' | 'secondary' }>``;
