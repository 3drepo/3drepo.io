/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import { useState, useEffect, useCallback, CSSProperties, useRef } from 'react';
import Konva from 'konva';
import { isEmpty } from 'lodash';

import { MODES } from '../../markupStage/markupStage.helpers';
import { EditableText } from '../editableText/editableText.component';

interface IProps {
	selected: string;
	mode: string;
	stage: Konva.Stage;
	layer: Konva.Layer;
	boxRef?: any;
	fontSize: number;
	size?: number;
	color: string;
	onRefreshDrawingLayer?: () => void;
	onAddNewText: (position, text: string, width: number, updateState?: boolean) => void;
}

export const TypingHandler = ({
	selected, mode, stage, layer, boxRef, fontSize, size, color, onRefreshDrawingLayer, onAddNewText
}: IProps) => {
	const [visible, setVisible] = useState<boolean>(false);
	const [styles, setStyles] = useState<CSSProperties>({});
	const [positionLocked, setPositionLocked] = useState<boolean>(false);
	const [maxSizes, setMaxSizes] = useState({ maxWidth: 0, maxHeight: 0 });

	useEffect(() => {
		if (stage) {
			if (mode === MODES.TEXT && !visible && !positionLocked && !selected) {
				stage.on('mousemove touchmove', handleMouseMove);
				stage.on('click touchstart', handleClick);
			}

			return () => {
				stage.off('mousemove touchmove', handleMouseMove);
				stage.off('click touchstart', handleClick);
			};
		}
	}, [mode, stage, positionLocked, selected]);

	const setTextPosition = () => {
		let left = 0, top = 0;
		if (stage && layer) {
			const position = stage.getPointerPosition();
			left = position.x - layer.x();
			top = position.y - layer.y();
		}
		setStyles({ top, left });
		const { width, height } = stage.attrs;
		setMaxSizes({
			maxWidth: width - left,
			maxHeight: height - top,
		});
	};

	const recomputeTextBoxSizeAndRefresh = ({ width, height }) => {
		if (!isEmpty(boxRef) && onRefreshDrawingLayer) {
			boxRef.width(width + Math.max(6, size * 2));
			boxRef.height(height + Math.max(6, size * 2));
			onRefreshDrawingLayer();
		}
	}

	const handleMouseMove = () => {
		if (!positionLocked) {
			setTextPosition();
		}
	};

	useEffect(() => {
		if (!isEmpty(boxRef) && !isEmpty(styles) && onRefreshDrawingLayer) {
			boxRef.x(Number(styles.left) - Math.max(3, size));
			boxRef.y(Number(styles.top) - Math.max(3, size));
			onRefreshDrawingLayer();
		}
	}, [styles]);

	const handleClick = useCallback(() => {
		setTextPosition();
		setVisible(true);
		setPositionLocked(true);
	}, []);

	const onTextChange = (newText: string, width: number) => {
		onAddNewText({ x: styles.left, y: styles.top }, newText, width);
		setVisible(false);
		setPositionLocked(false);
	};

	if (!visible) {
		return null;
	}

	return (
		<EditableText
			onChange={recomputeTextBoxSizeAndRefresh}
			onAddText={onTextChange}
			onClick={handleClick}
			styles={{
				...styles,
				color,
				fontSize: `${fontSize}px`,
				visibility: visible ? 'visible' : 'hidden',
				...maxSizes,
			}}
		/>
	);
};
