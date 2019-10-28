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

import * as React from 'react';
import { Transformer } from 'react-konva';
import { SHAPE_COMPONENTS, SHAPE_TYPES } from './shape.constants';

interface IProps {
	element: any;
	isSelected: boolean;
	isDrawingMode: boolean;
	handleChange: (props: any) => void;
}

export const Shape = ({ element, isSelected, handleChange, isDrawingMode }: IProps) => {
	const { color, figure, ...elementProps } = element;
	const shape = React.useRef<any>();
	const transformer = React.useRef<any>();
	const hasLineLikeBehavior = [SHAPE_TYPES.LINE, SHAPE_TYPES.ARROW].includes(figure);

	React.useEffect(() => {
		if (isSelected && !isDrawingMode) {
			transformer.current.setNode(shape.current);
			transformer.current.getLayer().batchDraw();
		}
	}, [isSelected]);

	const handleDragEnd = (e) => {
		handleChange({
			...element,
			x: e.target.x(),
			y: e.target.y()
		});
	};

	const handleTransformEnd = () => {
		const node = shape.current;
		const scaleX = node.scaleX();
		const scaleY = node.scaleY();

		node.scaleX(scaleX);
		node.scaleY(scaleY);
	};

	const handleDoubleClick = () => {
		if (!isSelected) {
			return;
		}
		const { fill } = element;
		handleChange({
			...element,
			fill: fill === 'transparent' ? element.color : 'transparent'
		});
	};

	const handleMouseOver = () => {
		if (isSelected) {
			document.body.style.cursor = 'move';
		}
	};

	const handleMouseOut = () => {
		document.body.style.cursor = 'default';
	};

	const handleTransformerMouseOver = (e) => {
		if (e.target.attrs.name === 'rotater _anchor') {
			const konvaContent = document.querySelector('.konvajs-content') as any;
			konvaContent.style.cursor = 'url("/images/rotate-cursor.png"), auto';
		}
	};

	const Component = SHAPE_COMPONENTS[figure];
	const transformerProps = hasLineLikeBehavior ? { enabledAnchors: ['top-left', 'top-right'] } : {};

	return (
		<React.Fragment>
			<Component
				ref={shape}
				{...elementProps}
				stroke={color}
				transformer={transformer}
				onDragEnd={handleDragEnd}
				onTransformEnd={handleTransformEnd}
				onDblClick={handleDoubleClick}
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}
				draggable={isSelected && !isDrawingMode}
				perfectDrawEnabled={false}
			/>
			{(isSelected && !isDrawingMode) &&
				<Transformer ref={transformer} {...transformerProps} keepRatio onMouseEnter={handleTransformerMouseOver} />
			}
		</React.Fragment>
	);
};
