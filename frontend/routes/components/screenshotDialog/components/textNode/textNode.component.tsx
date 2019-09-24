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
import { Text, Transformer } from 'react-konva';

interface IProps {
	element: any;
	isSelected: boolean;
	isVisible: boolean;
	handleSelect: (props: any) => void;
	handleChange: (props: any) => void;
	handleDoubleClick: (props: any) => void;
}

export const TextNode = ({ element, isSelected, handleSelect, handleChange, handleDoubleClick, isVisible }: IProps) => {
	const { color, ...elementProps } = element;
	const shape = React.useRef<any>();
	const transformer = React.useRef<any>();

	React.useEffect(() => {
		if (isSelected) {
			transformer.current.setNode(shape.current);
			transformer.current.getLayer().batchDraw();
		}
	}, [isSelected]);

	return (
		<>
			<Text
				onClick={handleSelect}
				ref={shape}
				{...elementProps}
				fill={color}
				draggable
				visible={isVisible}
				onDblClick={handleDoubleClick}
				onDragEnd={(e) => {
					handleChange({
						...element,
						x: e.target.x(),
						y: e.target.y()
					});
				}}
				onTransformEnd={() => {
					const node = shape.current;
					const scaleX = node.scaleX();
					const scaleY = node.scaleY();
					node.scaleX(1);
					node.scaleY(1);
					handleChange({
						...element,
						x: node.x(),
						y: node.y(),
						width: node.width() * scaleX,
						height: node.height() * scaleY
					});
				}}
			/>
			{(isVisible && isSelected) && <Transformer ref={transformer} resizeEnabled={false} />}
		</>
	);
};
