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

import Konva from 'konva';
import { isEmpty } from 'lodash';
import React from 'react';

import { MODES } from '../../screenshotDialog.helpers';
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
	onAddNewText: (position, text?: string, updateState?: boolean) => void;
}

export const TypingHandler = ({
	selected, mode, stage, layer, boxRef, fontSize, size, color, onRefreshDrawingLayer, onAddNewText,
	}: IProps) => {
	const [value, setValue] = React.useState<string>('');
	const [visible, setVisible] = React.useState<boolean>(false);
	const [styles, setStyles] = React.useState<React.CSSProperties>({});
	const [positionLocked, setPositionLocked] = React.useState<boolean>(false);

	const handleTextEdit = ({ target }) => setValue(target.value);

	React.useEffect(() => {
		if (stage) {
			if (mode === MODES.TEXT && !visible && !positionLocked && !selected) {
				stage.on('mousemove touchmove', handleMouseMove);
				stage.on('mousedown touchstart', handleMouseDown);
			}

			return () => {
				stage.off('mousemove touchmove', handleMouseMove);
				stage.off('mousedown touchstart', handleMouseDown);
			};
		}
	}, [mode, stage, positionLocked, selected]);

	const getPosition = () => {
		if (stage && layer) {
			const position = stage.getPointerPosition();
			return {
				x: position.x - layer.x(),
				y: position.y - layer.y(),
			};
		}
		return {
			x: 0,
			y: 0
		};
	};

	const handleMouseMove = React.useCallback(() => {
		if (!positionLocked) {
			const { x, y } = getPosition();
			setStyles({ top: y, left: x });
		}
	}, [stage, layer, positionLocked]);

	React.useEffect(() => {
		if (!isEmpty(boxRef) && !isEmpty(styles) && onRefreshDrawingLayer) {
			boxRef.x(Number(styles.left) - Math.max(3, size));
			boxRef.y(Number(styles.top) - Math.max(3, size));
			onRefreshDrawingLayer();
		}
	}, [styles]);

	const handleMouseDown = React.useCallback(() => {
		setVisible(true);
		setPositionLocked(true);
	}, []);

	const addText = () => {
		onAddNewText({ x: styles.left, y: styles.top }, value);
		setValue('');
		setVisible(false);
		setPositionLocked(false);
	};

	const handleTextareaKeyDown = (e) => {
		if (e.keyCode === 13 && !e.shiftKey) {
			addText();
		}
	};

	return (
		<EditableText
			boxRef={boxRef}
			value={value}
			visible={visible}
			onTextEdit={handleTextEdit}
			onAddText={addText}
			size={size}
			styles={{
				...styles,
				color,
				fontSize: `${fontSize}px`,
				visibility: visible ? 'visible' : 'hidden',
			}}
			onRefreshDrawingLayer={onRefreshDrawingLayer}
			onTextareaKeyDown={handleTextareaKeyDown}
		/>
	);
};
