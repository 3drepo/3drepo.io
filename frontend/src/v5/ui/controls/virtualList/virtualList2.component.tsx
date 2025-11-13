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

type ItemComponentProps = {
	value?: any, index?: number
};

interface Props {
	items: any[];
	itemHeight: number;
	ItemComponent: (value: any, index: number, array: any[]) => JSX.Element;
	itemBorder?: number;
}

const emptyRect = { x:0, y:0, width:0, top:0, bottom: 0, height:0 } as DOMRect;
const HeightTolerance = 2; // this is how much the height of the html item can differ from itemHeight to be considered equals

const equalsHeight = (a, b) =>  Math.abs(a - b) < HeightTolerance;

const lineInRange = (line, top, bottom) => top <= line && line <= bottom;

type VerticalRange  = { top: number, bottom: number };

const intersects = (a:VerticalRange, b: VerticalRange) => {
	return lineInRange(a.top, b.top, b.bottom) || lineInRange(a.bottom, b.top, b.bottom) || 
		lineInRange(b.top, a.top, a.bottom) || lineInRange(b.bottom, a.top, a.bottom);
};

const getFirstItem = (items: any[], heights: Record<any, number>, defaultHeight: number,  containerSize?: VerticalRange, windowHeight?: number): 
{ first: number, size: VerticalRange } => {
	if (!containerSize) return undefined;

	let first = 0;
	let top = containerSize.top;
	let bottom = (heights[first] || defaultHeight) + top;

	if (top > windowHeight ) return undefined;
	if (top <= 0 && bottom > windowHeight) return { first: first, size: { top, bottom } };

	const windowRange:VerticalRange = { top:0, bottom:windowHeight };

	while (!intersects(windowRange, { top, bottom })  && first < items.length) {
		first++;
		top = bottom;
		bottom = (heights[first] || defaultHeight) + top;
	}

	if (first === items.length) {
		return undefined;
	}

	return { first, size: { top, bottom } };
};

const getlastItem = (items: any[], 
	first: number, 
	firstSize: VerticalRange,
	heights: Record<any, number>, 
	defaultHeight: number, 
	windowHeight: number,
) => {
	if (first == undefined) return undefined;
	let index = first + 1;
	let { bottom: Firstbottom } = firstSize;
	let top = Firstbottom;
	let bottom = (heights[index] || defaultHeight) + top;
	const windowRange:VerticalRange = { top:0, bottom:windowHeight };

	while (intersects(windowRange, { top, bottom }) && index < items.length) {
		index++;
		top = bottom;
		bottom = (heights[index] || defaultHeight) + top;
	}

	return index + 1;
};

const getContainerHeight = (items: any[], heights: Record<any, number>, defaultHeight: number) => {
	let totalHeight = 0;
	items.forEach((_, index) => totalHeight += heights[index] || defaultHeight);
	return totalHeight;
};

// Tests:
// Add an item
// Remove an item
// Change the size of an Item
// Scroll
// Resize window
// Test with overscan? (x less, y more)
 
export const VirtualList2 = ({ items, itemHeight, ItemComponent }:Props) => { 
	const containerRef = useRef<Element>();
	const itemsContainer = useRef<Element>();
	const [, setRedraw] = useState(false);
	const sliceIndexes = useRef({ first:-1, last:-1 });
	const itemsRef = useRef(items);
	const initialized = useRef(true);

	const renderInnerHeight = useRef(0);
	renderInnerHeight.current = window.innerHeight;

	const itemsHeight = useRef<Record<any, number>>({}); // get rid of the elements that get deleted
	const renderContainerRect = useRef(emptyRect);
	
	renderContainerRect.current = containerRef.current?.getBoundingClientRect();


	const res = getFirstItem(items, itemsHeight.current, itemHeight, renderContainerRect.current, renderInnerHeight.current);
	let spacerStart = 0;
	let itemsSlice = [];
	let containerHeight = getContainerHeight(items, itemsHeight.current, itemHeight);
	sliceIndexes.current.first = res?.first;

	if (res) {
		const { first, size } = res;
		const last = getlastItem(items, first, size, itemsHeight.current, itemHeight, renderInnerHeight.current);
		spacerStart = size.top - renderContainerRect.current.top;
		sliceIndexes.current.last = last;

		itemsSlice = items.slice(first, last);
	} 

	initialized.current = !!containerRef.current;

	const onFrame = () => {
		// console.log('onframe');
		if (!containerRef.current) return;
		const { first, last }  = sliceIndexes.current;
		
		let itemsHeightChanged = false;
		const { innerHeight } = window;
		const windowHeightChanged = innerHeight !== renderInnerHeight.current;
		let indexChanged = false;
		const containerRect = containerRef.current?.getBoundingClientRect();
		let scrolled = false;

		if (initialized.current && first >= 0 && last >= 0) { //TODO: rethink this strategy
			let scrolldDiff = Math.abs(containerRect.y - renderContainerRect.current.y);
			let firstHeight = itemsHeight.current[first] || itemHeight;
			let lasttHeight = itemsHeight.current[last] || itemHeight;
			scrolled = scrolldDiff > Math.min(firstHeight, lasttHeight);
		}

		const wasScrolledOut = !intersects({top:0, bottom: renderInnerHeight.current},  renderContainerRect.current);
		const scrolledIn =  intersects({top:0, bottom: innerHeight},  containerRect) && wasScrolledOut;

		const children = itemsContainer.current.children;
		
		for (let i = 0; i < children.length ; i++ ) {
			const elementHeight = children[i].getBoundingClientRect().height;
			const itemIndex = i + first;
			if (equalsHeight(elementHeight, itemHeight) && !itemsHeight.current[itemIndex]) continue;
			if (equalsHeight(elementHeight, itemsHeight.current[itemIndex])) continue;
			itemsHeight.current[itemIndex] = elementHeight;
			itemsHeightChanged = true;
		}

		if (windowHeightChanged && !itemsHeightChanged) { // dont check if its going to get rerender already
			const nextFirst = getFirstItem(items, itemsHeight.current, itemHeight, containerRect, innerHeight);
			let nextLast = nextFirst?.first;
			
			if (nextFirst) {
				nextLast = getlastItem(items, nextFirst.first, nextFirst.size, itemsHeight.current, itemHeight, innerHeight);
				indexChanged = nextFirst.first !== first || nextLast !== last;
			} else {
				indexChanged = first !== undefined;
			}
		}

		// Redraw when:
		// - Havent been initialized
		// - The size of an item changes => needs ref for items height
		// - Scroll and first/last changes => needs ref for prevScroll
		// - The size of the windows changes => needs ref for windows
		// - When it scrolls into view in the window after being scrolled out
		if (itemsHeightChanged || !initialized.current || indexChanged || scrolled || scrolledIn) {
			setRedraw((v) => !v);
		}

		window.requestAnimationFrame(onFrame);
	};
    
	useEffect(() => {
		window.requestAnimationFrame(onFrame);
	}, []);

	useEffect(() => {
		itemsRef.current = items;
		itemsHeight.current = {};
	}, [items]);

	const recalc = () => {
		setRedraw((v) => !v);
	};

	return (
		<div style={{
			height: containerHeight, 
			border: 0, 
			boxSizing:'border-box',  
			display:'block', 
			background: 'linear-gradient(352deg,rgba(207, 48, 48, 1) 0%, rgba(10, 48, 173, 1) 100%)' }}
			ref={containerRef as any} 
		>
			<div style={{ height: spacerStart } } id='startSpacer'/>
			<div ref={itemsContainer as any}   >
				{itemsSlice.map(ItemComponent)}
			</div>
			<button style={{
				position: 'relative',
				top: 0,
				left: '12px',
				backgroundColor: 'aquamarine',
			}} onClick={recalc}>click me</button>
		</div>
	);
};
