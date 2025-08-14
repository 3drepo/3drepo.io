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
	const containerRef = useRef<Element>();
	const itemsContainer = useRef<Element>();
	const prevRect = useRef<DOMRect>();
	const prevInnerHeight = useRef(0);

	const listHeight = items.length * itemHeight;

	const [containerRect, setContainerRect] = useState<DOMRect>({ x:0, y:0, width:0, top:0, bottom: 0 , height:0 } as DOMRect);

	let { innerHeight } = window;
	const top = Math.min(Math.max(0, containerRect.top), innerHeight);
	const bottom = Math.min(Math.max(0, containerRect.bottom), innerHeight);
	const contentCount = Math.ceil(((bottom-top)) / itemHeight); 

	const getFirstItemIndex = (y) => {
		let firstItemindex = Math.ceil(y/itemHeight); 
		let spacerHeight = firstItemindex * itemHeight;
		return { firstItemindex, spacerHeight };
	};


	const { firstItemindex, spacerHeight } =  getFirstItemIndex(Math.max(0, -containerRect.y));

	const itemsSlice = items.slice(firstItemindex, Math.min(contentCount + firstItemindex, items.length));
	

	let onScroll;
	onScroll = () => {
		if (!containerRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();
		let shouldUpdate = rect.y !== prevRect.current?.y || prevInnerHeight.current !== window.innerHeight;

		if (shouldUpdate) {
			prevRect.current = rect; 
			prevInnerHeight.current = window.innerHeight;
			setContainerRect(rect);
		}

		window.requestAnimationFrame(onScroll);
	};
	
	useEffect(() => {
		window.requestAnimationFrame(onScroll);
	}, []);

	return (<div style={{ height: listHeight }} ref={containerRef as any} >
		<div style={{ height: spacerHeight } }/>
		<div ref={itemsContainer as any}>
			{itemsSlice.map(itemContent)}
		</div>
	</div>);
};
