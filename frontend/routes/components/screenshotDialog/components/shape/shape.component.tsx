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
import { drawCloud } from './shape.helpers';
import { SHAPE_COMPONENTS, SHAPE_TYPES } from './shape.constants';

interface IProps {
	object: any;
	isSelected: boolean;
	handleSelect: (props: any) => void;
	handleChange: (props: any) => void;
}

export const Shape = ({ object, isSelected, handleSelect, handleChange }: IProps) => {
	const { color, figure, ...objectProps } = object;
	const shape = React.useRef<any>();
	const transformer = React.useRef<any>();

	React.useEffect(() => {
		if (isSelected) {
			transformer.current.setNode(shape.current);
			transformer.current.getLayer().batchDraw();
		}
	}, [isSelected]);

	const isLine = figure === SHAPE_TYPES.LINE;

	const handleDragEnd = (e) => {
		handleChange({
			...object,
			x: e.target.x(),
			y: e.target.y()
		});
	};

	const handleTransformEnd = () => {
		const node = shape.current;
		const scaleX = node.scaleX();
		const scaleY = node.scaleY();

		if (isLine) {
			node.scaleX(1);
			node.scaleY(1);
		} else {
			node.scaleX(scaleX);
			node.scaleY(scaleY);
		}

		if (figure === SHAPE_TYPES.CLOUD) {
			handleChange({
				...object,
				sceneFunc: drawCloud
			});
		} else {
			handleChange({
				...object,
				x: node.x(),
				y: node.y(),
				width: isLine ? node.width() * scaleX : node.width(),
				height: isLine ? node.height() * scaleY : node.height()
			});
		}
	};

	const Component = SHAPE_COMPONENTS[figure];
	const transformerProps = isLine ? { enabledAnchors: ['top-left', 'top-right'] } : {};

	return (
		<React.Fragment>
			<Component
				onClick={handleSelect}
				ref={shape}
				{...objectProps}
				stroke={color}
				strokeWidth={5}
				draggable
				onDragEnd={handleDragEnd}
				onTransformEnd={handleTransformEnd}
				transformer={transformer}
			/>
			{isSelected && <Transformer ref={transformer} {...transformerProps} keepRatio centeredScaling />}
		</React.Fragment>
	);
};
