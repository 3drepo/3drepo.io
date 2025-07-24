/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { useState, useEffect, CSSProperties, useRef } from 'react';
import Konva from 'konva';
import { isEmpty, isEqual } from 'lodash';
import { EditableText, TextBoxRef, TextBoxSizes } from '../editableText/editableText.component';

interface IProps {
	stage: Konva.Stage;
	layer: Konva.Layer;
	boxRef?: any;
	fontSize: number;
	size?: number;
	color: string;
	onRefreshDrawingLayer?: () => void;
	onAddNewText: (position, text: string, width: number, updateState?: boolean) => void;
}

export const TypingCalloutHandler = ({
	stage, layer, boxRef, fontSize, size, color, onRefreshDrawingLayer, onAddNewText
}: IProps) => {
	const [isPositionLocked, setIsPositionLocked] = useState(false);
	const [offset, setOffset] = useState<CSSProperties>({});
	const [maxSizes, setMaxSizes] = useState({ maxWidth: 0, maxHeight: 0 });
	const textBoxRef = useRef<TextBoxRef>(undefined);
	const previousBoxSizes = useRef<TextBoxSizes>(null);

	const setTextPosition = () => {
		let left = 0, top = 0;
		if (stage && layer) {
			const position = stage.getPointerPosition();
			left = position.x - layer.x();
			top = position.y - layer.y();
		}
		setOffset({ top, left });
		const { width, height } = stage.attrs;
		setMaxSizes({
			maxWidth: width - left,
			maxHeight: height - top,
		});
	};

	const onTextChange = (newText: string, width: number) => {
		onAddNewText({ x: offset.left, y: offset.top }, newText, width);
		setIsPositionLocked(false);
	};

	const redrawCalloutBox = ({ width, height }) => {
		if (!isEmpty(boxRef) && onRefreshDrawingLayer) {
			boxRef.width(width + Math.max(6, size * 2));
			boxRef.height(height + Math.max(6, size * 2));
			onRefreshDrawingLayer();
		}
	}

	useEffect(() => {
		if (isPositionLocked) return;

		const handleMouseMove = () => setTextPosition();
		const handleClick = () => setTimeout(() => setIsPositionLocked(true));

		stage.on('mousemove touchmove', handleMouseMove);
		stage.on('click touchstart', handleClick);

		return () => {
			stage.off('mousemove touchmove', handleMouseMove);
			stage.off('click touchstart', handleClick);
		}
	}, [isPositionLocked]);

	useEffect(() => {
		if (!isEmpty(boxRef) && !isEmpty(offset)) {
			boxRef.x(Number(offset.left) - Math.max(3, size));
			boxRef.y(Number(offset.top) - Math.max(3, size));
			const currentBoxSizes = textBoxRef.current.getCurrentSizes();
			if (!isEqual(previousBoxSizes.current, currentBoxSizes)) {
				redrawCalloutBox(currentBoxSizes);
				previousBoxSizes.current = currentBoxSizes;
			};
		}
	}, [offset]);

	const styles = {
		...offset,
		...maxSizes,
		color,
		fontSize: `${fontSize}px`,
	};

	if (!isPositionLocked) return (
		<EditableText
			styles={styles}
			onResize={redrawCalloutBox}
			disabled
			ref={textBoxRef}
		/>
	);

	return (
		<EditableText
			styles={styles}
			onResize={redrawCalloutBox}
			ref={textBoxRef}
			onAddText={onTextChange}
		/>
	);
};
