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
import { Line, Transformer } from 'react-konva';

interface IProps {
	element: any;
	isSelected: boolean;
	handleChange: (props: any) => void;
}

export const DrawnLine = ({ element, isSelected, handleSelect, handleChange }: IProps) => {
	const { color, isEraser, ...elementProps } = element;
	const line = React.useRef<any>();
	const transformer = React.useRef<any>();

	React.useEffect(() => {
		if (isSelected) {
			transformer.current.setNode(line.current);
			transformer.current.getLayer().batchDraw();
		}
	}, [isSelected]);

	const handleDragEnd = (e) => {
		const {x, y, scaleX, scaleY, points, rotation} = e.target.attrs;
		handleChange({ ...element, points, scaleX, scaleY, rotation, x, y });
	};

	const handleTransformEnd = (e) => {
		const {scaleX, scaleY, rotation, points, x, y} = e.target.attrs;
		handleChange({ ...element, scaleX, scaleY, points, rotation, x, y });
	};

	return (
		<>
			<Line
				ref={line}
				{...elementProps}
				onDragEnd={handleDragEnd}
				onTransformEnd={handleTransformEnd}
				draggable={isSelected && !isEraser}
			/>
			{(isSelected && !isEraser) && <Transformer ref={transformer} />}
		</>
	);
};
