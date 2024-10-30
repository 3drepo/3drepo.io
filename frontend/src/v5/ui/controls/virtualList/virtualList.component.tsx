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

import { useRef, useState, useEffect } from 'react';

interface Props {
	items: any[];
	itemHeight: number;
	itemContent:  (value: any, index: number, array: any[]) => JSX.Element;
}

export const VirtualList = ({ items, itemHeight, itemContent }:Props) => { 
	const elem = useRef<Element>();
	const itemsContainer = useRef<Element>();
	const prevRect = useRef<DOMRect>();
	const itemsHeight = useRef<Record<number, number>>({});


	const [elemRect, setElemRect] = useState<DOMRect>({ x:0, y:0, width:0, height:0 } as DOMRect);

	let { innerHeight } = window;

	const contentCount = Math.ceil((1.5 * innerHeight) / itemHeight);
	// const contentCountPadding = Math.floor(contentCount / 2);
	const getFirstItemIndex = (y) => {
		let spacerHeight = 0;
		let firstItemindex = 0; 
		for (let i = 0; i < items.length; i++) {
			const currentItemHeight = i ? itemsHeight.current[firstItemindex] || itemHeight : 0 ;
			if (spacerHeight + currentItemHeight < y) {
				spacerHeight += currentItemHeight;
				firstItemindex = i;
			}
		}

		return { firstItemindex, spacerHeight };
	};


	const { firstItemindex, spacerHeight } =  getFirstItemIndex(Math.max(0, -elemRect.y));

	const itemsSlice = items.slice(firstItemindex, Math.min(contentCount + firstItemindex, items.length));
	const listHeight = items.reduce((partialSum, _, index) => (itemsHeight.current[index] || itemHeight) + partialSum, 0);

	let onScroll;
	onScroll = () => {
		if (!elem.current) return;
		const rect = elem.current.getBoundingClientRect();
		let shouldUpdate = rect.y !== prevRect.current?.y;

		const { firstItemindex: first } =  getFirstItemIndex(Math.max(0, -prevRect.current?.y));
		let i = 0;

		for (let child of itemsContainer.current.children as any as Iterable<Element>) {
			const height = child.getBoundingClientRect().height;
		
			if (!!height && itemsHeight.current[i + first] !== height) {
				itemsHeight.current[i + first] = height;
				shouldUpdate = true;
			}
		
			i++;
		}

		if (shouldUpdate) {
			prevRect.current = rect; 
			setElemRect(rect);
		}

		window.requestAnimationFrame(onScroll);
	};
	
	useEffect(() => {
		window.requestAnimationFrame(onScroll);
	}, []);
	

	return (<div style={{ height: listHeight }} ref={elem as any} >
		<div style={{ height: spacerHeight } }/>
		<div ref={itemsContainer as any}>
			{itemsSlice.map(itemContent)}
		</div>
	</div>);
};
