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
import { useEffect, useRef, Fragment } from 'react';
import { Group, Transformer } from 'react-konva';
import { pick } from 'lodash';
import { useHandleBubbling } from '../drawnObjects.hooks';
import { SHAPE_COMPONENTS, SHAPE_TYPES } from './shape.constants';

interface IProps {
	element: any;
	isSelected: boolean;
	handleChange: (props: any) => void;
}

export const Shape = ({ element, isSelected, handleChange }: IProps) => {
	const {
		color, figure, draggable, group: groupProps, ...elementProps
	} = element;
	const shape = useRef<any>(null);
	const transformer = useRef<any>(null);
	const group = useRef<any>(null);
	const hasLineLikeBehavior = [SHAPE_TYPES.LINE, SHAPE_TYPES.ARROW].includes(figure);

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

	const handleMouseOver = () => {
		if (isSelected) {
			document.body.style.cursor = 'move';
		}
	};

	const handleMouseOut = () => {
		document.body.style.cursor = 'default';
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

	return (
		<Fragment>
			<Group
					ref={group}
					{...additionalGroupProps}
					name={elementProps.name}
					transformer={transformer}
					onDragEnd={handleTransformEnd}
					onTransformEnd={handleTransformEnd}
					onDblClick={handleDoubleClick}
					onMouseOver={handleMouseOver}
					onMouseOut={handleMouseOut}
					draggable={draggable && isSelected}
					{...handleBubbling}
			>
				<Component
						ref={shape}
						{...elementProps}
						stroke={color}
						perfectDrawEnabled={false}
				/>
			</Group>
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
