/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { forwardRef, createContext, useContext } from 'react';
import { Highlight } from '@controls/highlight';
import { Tooltip } from '@mui/material';
import { InnerElementType, OverflowContainer } from './listboxComponent.styles';

const LISTBOX_PADDING = 8; // px

const Row = ({ data, index, style }: ListChildComponentProps) => {
	const [liProps, optionValue, searchQuery] = data[index];
	const inlineStyle = {
		...style,
		top: (style.top as number) + LISTBOX_PADDING,
	};

	return (
		<Tooltip title={optionValue}>
			<li {...liProps} style={inlineStyle}>
				<OverflowContainer>
					<Highlight search={searchQuery}>
						{optionValue}
					</Highlight>
				</OverflowContainer>
			</li>
		</Tooltip>
	);
};

const OuterElementContext = createContext({});
const OuterElementType = forwardRef<HTMLDivElement>((props, ref) => {
	const outerProps = useContext(OuterElementContext);
	return (<div ref={ref} {...props} {...outerProps} />);
});

// Adapter for react-window
export const ListboxComponent = forwardRef<HTMLDivElement, any>(({ children, ...other }, ref) => {
	const MAX_HEIGHT = document.documentElement.clientHeight * 0.4; // 40vh
	const itemData = children.flatMap((item) => [item, ...(item.children || [])]);
	const itemCount = itemData.length;

	const getChildSize = () => 30;

	const getHeight = () => Math.min((itemCount * getChildSize())  +  (LISTBOX_PADDING * 2), MAX_HEIGHT);

	return (
		<div ref={ref}>
			<OuterElementContext.Provider value={other}>
				<VariableSizeList
					itemData={itemData}
					height={getHeight()}
					width="100%"
					outerElementType={OuterElementType}
					innerElementType={InnerElementType}
					itemSize={getChildSize}
					overscanCount={5}
					itemCount={itemCount}
				>
					{Row}
				</VariableSizeList>
			</OuterElementContext.Provider>
		</div>
	);
});
