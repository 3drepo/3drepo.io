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
import { useEffect, useRef } from 'react';
import { Group, Line, Rect, Transformer } from 'react-konva';

interface IProps {
	element: any;
	isSelected: boolean;
	handleChange: (props: any) => void;
}

export const DrawnLine = ({ element, isSelected, handleChange }: IProps) => {
	const {
		color, isEraser, draggable, groupX, groupY, rotation, initScaleX, initScaleY, scaleX, scaleY, ...elementProps
	} = element;
	const line = useRef<any>(undefined);
	const transformer = useRef<any>(undefined);
	const rect = useRef<any>(null);
	const group = useRef<any>(null);

	useEffect(() => {
		if (isSelected && transformer.current) {
			transformer.current.setNode(group.current);
			transformer.current.getLayer().batchDraw();
		}
	}, [transformer.current, isSelected]);

	useEffect(() => {
		if (line.current) {
			const selfRect = line.current.getSelfRect();
			const width = line.current.width() || selfRect.width;
			const height = line.current.height() || selfRect.height;
			const { x, y } = line.current.getAbsolutePosition();

			rect.current.x(x + selfRect.x);
			rect.current.y(y + selfRect.y);
			rect.current.width(width * line.current.scaleX());
			rect.current.height(height * line.current.scaleY());
		}
	}, [line.current]);

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

		handleChange({
			...element,
			groupX: x,
			groupY: y,
			rotation: attrs.rotation,
			scaleX: attrs.scaleX,
			scaleY: attrs.scaleY,
		});
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

	return (
		<>
			<Group
					ref={group}
					{...additionalGroupProps}
					name={elementProps.name}
					transformer={transformer}
					onDragEnd={handleDragEnd}
					onTransformEnd={handleTransformEnd}
					draggable={isSelected}
			>
				<Rect ref={rect} />
				<Line
					ref={line}
					stroke={color}
					{...elementProps}
					{...additionalComponentProps}
				/>
			</Group>
			{(isSelected && !isEraser) && <Transformer ref={transformer} />}
		</>
	);
};
