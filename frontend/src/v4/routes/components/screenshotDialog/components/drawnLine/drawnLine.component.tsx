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
import { pick } from 'lodash';
import { useEffect, useRef } from 'react';
import { Group, Line, Transformer } from 'react-konva';
import { cursorStylesEvents, useHandleBubbling } from '../drawnObjects.hooks';

interface IProps {
	element: any;
	isSelected: boolean;
	handleChange: (props: any) => void;
}

export const DrawnLine = ({ element, isSelected, handleChange }: IProps) => {
	const {
		color, isEraser, draggable, group: groupProps, ...elementProps
	} = element;
	const line = useRef<any>(null);
	const transformer = useRef<any>(null);
	const group = useRef<any>(null);
	const handleBubbling = useHandleBubbling(isSelected);

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

	return (
		<>
			<Group
					ref={group}
					{...additionalGroupProps}
					name={elementProps.name}
					transformer={transformer}
					onDragEnd={handleTransformEnd}
					onTransformEnd={handleTransformEnd}
					draggable={isSelected}
					{...handleBubbling}
			>
				<Line
					{...cursorStylesEvents(isSelected)}
					ref={line}
					stroke={color}
					{...elementProps}
				/>
			</Group>
			{(isSelected && !isEraser) && <Transformer ref={transformer} {...handleBubbling} />}
		</>
	);
};
