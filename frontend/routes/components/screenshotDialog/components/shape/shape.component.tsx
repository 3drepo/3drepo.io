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
import { Group, Rect, Transformer } from 'react-konva';
import { SHAPE_COMPONENTS, SHAPE_TYPES } from './shape.constants';

interface IProps {
	element: any;
	isSelected: boolean;
	handleChange: (props: any) => void;
}

export const Shape = ({ element, isSelected, handleChange }: IProps) => {
	const {
		color, figure, draggable, groupX, groupY, rotation, initScaleX, initScaleY, scaleX, scaleY, ...elementProps
	} = element;
	const shape = React.useRef<any>();
	const transformer = React.useRef<any>();
	const rect = React.useRef<any>(null);
	const group = React.useRef<any>(null);
	const hasLineLikeBehavior = [SHAPE_TYPES.LINE, SHAPE_TYPES.ARROW].includes(figure);

	React.useEffect(() => {
		if (isSelected && transformer.current) {
			transformer.current.attachTo(group.current);
			transformer.current.getLayer().batchDraw();
		}
	}, [transformer.current, isSelected]);

	React.useEffect(() => {
		if (shape.current) {
			const currentShape = shape.current;
			const selfRect = shape.current.getSelfRect();
			const width = shape.current.width() || selfRect.width;
			const height = shape.current.height() || selfRect.height;
			const { x, y } = shape.current.getAbsolutePosition();

			if (figure === SHAPE_TYPES.CLOUD) {
				rect.current.x(x);
				rect.current.y(y);
			} else {
				rect.current.x(x + selfRect.x);
				rect.current.y(y + selfRect.y);
			}
			rect.current.width(width * currentShape.scaleX());
			rect.current.height(height * currentShape.scaleY());
		}
	}, [shape.current]);

	const handleDragEnd = ({ currentTarget }) => {
		const { x, y } = currentTarget.getAbsolutePosition();
		handleChange({
			...element,
			groupX: x,
			groupY: y,
		});
	};

	const handleTransformEnd = ({ currentTarget }) => {
		const { x, y } = currentTarget.getAbsolutePosition();
		const { attrs } = currentTarget;
		const node = group.current;
		const nodeScaleX = node.scaleX();
		const nodeScaleY = node.scaleY();

		node.scaleX(nodeScaleX);
		node.scaleY(nodeScaleY);

		handleChange({
			...element,
			groupX: x,
			groupY: y,
			rotation: attrs.rotation,
			scaleX: attrs.scaleX,
			scaleY: attrs.scaleY,
		});
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

	const additionalGroupProps = ({
		x: groupX || 0,
		y: groupY || 0,
		rotation,
		scaleX,
		scaleY,
	});

	const additionalComponentProps = ({
		scaleX: initScaleX,
		scaleY: initScaleY,
	});

	const Component = SHAPE_COMPONENTS[figure];
	const transformerProps = hasLineLikeBehavior ? { enabledAnchors: ['top-left', 'top-right'] } : {};

	return (
		<React.Fragment>
			<Group
					ref={group}
					{...additionalGroupProps}
					name={elementProps.name}
					transformer={transformer}
					onDragEnd={handleDragEnd}
					onTransformEnd={handleTransformEnd}
					onDblClick={handleDoubleClick}
					onMouseOver={handleMouseOver}
					onMouseOut={handleMouseOut}
					draggable={draggable && isSelected}
			>
				<Rect ref={rect} />
				<Component
						ref={shape}
						{...elementProps}
						{...additionalComponentProps}
						stroke={color}
						perfectDrawEnabled={false}
				/>
			</Group>
			{ isSelected &&
			<Transformer
				ref={transformer}
				{...transformerProps}
				keepRatio
				onMouseEnter={handleTransformerMouseOver}
			/>
			}
		</React.Fragment>
	);
};
