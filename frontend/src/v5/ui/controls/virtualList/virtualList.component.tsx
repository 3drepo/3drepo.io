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

const emptyRect = { x:0, y:0, width:0, top:0, bottom: 0, height:0 } as DOMRect;
const HeightTolerance = 2; // this is how much the height of the html item can differ from itemHeight to be considered equals

const equalsHeight = (a, b) =>  Math.abs(a - b) < HeightTolerance;

const lineInRange = (line, top, bottom) => top <= line && line <= bottom;

export const VirtualList = ({ items, itemHeight, itemContent }:Props) => { 
	const containerRef = useRef<Element>();
	const itemsContainer = useRef<Element>();
	const prevRect = useRef<DOMRect>();
	const prevInnerHeight = useRef(0);
	const expandedItem = useRef({ index:0, height: itemHeight });
	const [containerRect, setContainerRect] = useState<DOMRect>(emptyRect);
	const firstElementIndex = useRef(0);

	let { innerHeight } = window;
	const top = Math.min(Math.max(0, containerRect.top), innerHeight);
	const bottom = Math.min(Math.max(0, containerRect.bottom), innerHeight);
	
	const getFirstItemIndex = (y) => {
		let firstItemindex =  Math.ceil(y / itemHeight);
		let spacerStart = firstItemindex * itemHeight;
		
		const y2 = -containerRect.y;
		const topExp = (expandedItem.current.index * itemHeight) - y2 ;
		const bottomExp = topExp + expandedItem.current.height ;

		if (lineInRange(0, topExp, bottomExp) || 
			lineInRange(bottom, topExp, bottomExp) || 
			lineInRange(topExp, 0, bottom) || 
			lineInRange(bottomExp, 0, bottom) ) {

 			// If the expanded item is visible and the top line is before the viewport start
			// that means is the first item 
			//
			if ( topExp <= 0 ) {
				firstItemindex = expandedItem.current.index;
				spacerStart = firstItemindex * itemHeight;
			}
		} else {

			// If its not visible and the first item is passed the expanded item
			// then the first item might be further down the list because expanded item
			// might take up space for many items
			if (firstItemindex > expandedItem.current.index) {
				firstItemindex = Math.ceil(-bottomExp / itemHeight) + expandedItem.current.index;
				spacerStart = (firstItemindex - 1) * itemHeight + expandedItem.current.height;
			}
		}

		return { firstItemindex, spacerStart };
	};

	const contentCount = Math.ceil(((bottom - top)) / itemHeight) + ((bottom - top) > 0 ? 1 : 0); 
	const { firstItemindex, spacerStart } =  getFirstItemIndex(Math.max(0, -containerRect.y));
	firstElementIndex.current = firstItemindex;
	const lastIndex =  Math.min(contentCount + firstItemindex, items.length);
	const itemsSlice = items.slice(firstItemindex, lastIndex);
	const containerHeight = (items.length - 1) * itemHeight + expandedItem.current.height;
	
	useEffect(()=> {
		prevInnerHeight.current = 0;
	}, [items]);

	let onScroll;
	onScroll = () => {
		if (!containerRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();
		let shouldUpdate = rect.y !== prevRect.current?.y || prevInnerHeight.current !== window.innerHeight;

		const children = itemsContainer.current.children;
		const { height: expHeight, index: expIndex } =  expandedItem.current;

		for (let i = 0; i < children.length ; i++ ) {
			const elementHeight = children[i].clientHeight;
			const itemIndex = i + firstElementIndex.current;
			if (!equalsHeight(elementHeight, itemHeight) || (itemIndex === expIndex &&  !equalsHeight(elementHeight, expHeight))) {
				if (expIndex !== itemIndex || expHeight !== elementHeight) {
					expandedItem.current = {
						index: itemIndex,
						height: elementHeight,
					};

					shouldUpdate = true;
				}

				break;
			}
		}

		if (shouldUpdate) { // TODO: dont update while an animation is playing
			prevRect.current = rect; 
			prevInnerHeight.current = window.innerHeight;
			setContainerRect(rect);
		}

		window.requestAnimationFrame(onScroll);
	};
	
	useEffect(() => {
		window.requestAnimationFrame(onScroll);
	}, []);

	return (
		<div style={{ height: containerHeight,  display:'block' }} ref={containerRef as any} >
			<div style={{ height: spacerStart } } id='startSpacer'/>
			<div  ref={itemsContainer as any}   >
				{itemsSlice.map(itemContent)}
			</div>
		</div>
	);
};
