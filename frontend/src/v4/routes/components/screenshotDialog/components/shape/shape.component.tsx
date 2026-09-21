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
import { useEffect, useRef, Fragment, useState, forwardRef } from 'react';
import { Group, Rect, Transformer } from 'react-konva';
import { pick } from 'lodash';
import { useHandleBubbling, cursorStylesEvents } from '../drawnObjects.hooks';
import { SHAPE_COMPONENTS, SHAPE_TYPES } from './shape.constants';

interface IProps {
	element: any;
	isSelected: boolean;
	handleChange: (props: any) => void;
}

const NonDraggableGroup = forwardRef<any, any>(({ children, ...props }, ref) => (
	<Group ref={ref} {...props}>
		{children}
	</Group>
));

const DraggableShape = forwardRef<any, any>(({
	children,
	onDragEnd,
	onTransformEnd,
	...props
}, ref) => (
	<Group
		ref={ref}
		{...props}
		draggable
		onDragEnd={onDragEnd}
		onTransformEnd={onTransformEnd}
	>
		{children}
	</Group>
));

export const Shape = ({ element, isSelected, handleChange }: IProps) => {
	const {
		color, figure, group: groupProps, ...elementProps
	} = element;
	const shape = useRef<any>(null);
	const transformer = useRef<any>(null);
	const group = useRef<any>(null);
	const hasLineLikeBehavior = [SHAPE_TYPES.LINE, SHAPE_TYPES.ARROW].includes(figure);
	const [rectProps, setRectProps] = useState({ width: 0, height: 0 , x: 0, y: 0});

	useEffect(() => {
		if (isSelected && transformer.current) {
			transformer.current.nodes([group.current]);
			transformer.current.getLayer().batchDraw();
		}
	}, [transformer.current, group.current, isSelected]);

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

	useEffect(() => {
		if (isSelected && transformer.current) {
			transformer.current.nodes([group.current]);
			transformer.current.getLayer().batchDraw();
		}
	}, [transformer.current, group.current, isSelected]);

	const handleTransformEnd = ({ currentTarget }) => {
		const { attrs } = currentTarget;
		handleChange({ ...element, group: pick(attrs, ['x', 'y', 'scaleX', 'scaleY', 'rotation'])});
	};

	const additionalGroupProps = groupProps || {x: 0, y: 0};

	const Component = SHAPE_COMPONENTS[figure];
	const transformerProps = hasLineLikeBehavior ? { enabledAnchors: ['top-left', 'top-right'] } : {};

	const handleBubbling = useHandleBubbling(isSelected);
	// Changed draggable to use a conditional group component based because changing from draggable:true to draggable: false 
	// seems to stop working and the group kept being draggable even when it shouldn't.
	const ShapeGroup = isSelected ? DraggableShape : NonDraggableGroup;

	useEffect(() => {
		setRectProps(shape.current?.getClientRect() || {});
	}, [shape.current]);

	return (
		<Fragment>
			<ShapeGroup
					ref={group}
					{...additionalGroupProps}
					name={elementProps.name}
					transformer={transformer}
					onDblClick={handleDoubleClick}
					onDragEnd={handleTransformEnd}
					onTransformEnd={handleTransformEnd}
					{...handleBubbling}
			>
				<Component
						ref={shape}
						{...elementProps}
						draggable={false}
						stroke={color}
						perfectDrawEnabled={false}
				/>
				{ isSelected && <Rect  {...rectProps} fill="transparent" visible={isSelected} 	{...cursorStylesEvents()} />}
			</ShapeGroup>
			{ isSelected &&
			<Transformer
				ref={transformer}
				{...transformerProps}
				keepRatio
				{...handleBubbling}
			/>
			}
		</Fragment>
	);
};
