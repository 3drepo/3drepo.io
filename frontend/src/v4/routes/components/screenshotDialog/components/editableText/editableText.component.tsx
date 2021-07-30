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

import Konva from 'konva';
import * as React from 'react';

import { isEmpty } from 'lodash';
import { useFocus, useOutsideClick } from '../../../../../hooks';
import { EDITABLE_TEXTAREA_NAME, EDITABLE_TEXTAREA_PLACEHOLDER } from '../../screenshotDialog.helpers';
import { AssistantElement, Textarea } from './editableText.styles';

interface IProps {
	value: string;
	visible: boolean;
	styles: React.CSSProperties;
	onTextEdit: (props: any) => void;
	onTextareaKeyDown: (props: any) => void;
	onAddText: () => void;
	onRefreshDrawingLayer?: () => void;
	boxRef?: Konva.Rect;
	size?: number;
}

export const EditableText = ({
	value, visible, styles, onTextEdit, onTextareaKeyDown, boxRef, onRefreshDrawingLayer, onAddText, size
	}: IProps) => {
	const [textareaRef, setTextareaFocus] = useFocus();
	const assistantElementRef = React.useRef<HTMLPreElement>(null);
	const [initialTextareaWidth, setInitialTextareaWidth] = React.useState<number>(0);
	const [additionalStyles, setAdditionalStyles] = React.useState<object>({});

	React.useEffect(() => {
		if (textareaRef.current && !value) {
			const currentTextarea = textareaRef.current;
			currentTextarea.setAttribute('size', currentTextarea.getAttribute('placeholder').length.toString());
			if (initialTextareaWidth && assistantElementRef.current) {
				setInitialTextareaWidth(assistantElementRef.current.offsetWidth);
			} else {
				setInitialTextareaWidth(currentTextarea.offsetWidth);
			}
		}
	}, [styles.fontSize, value]);

	React.useEffect(() => {
		setTimeout(() => {
			setTextareaFocus();
		});
	}, [visible, textareaRef.current]);

	React.useEffect(() => {
		if (textareaRef && assistantElementRef) {
			const shouldExpand = assistantElementRef.current.offsetWidth > initialTextareaWidth;
			const width = shouldExpand ? assistantElementRef.current.offsetWidth : initialTextareaWidth;
			const height = assistantElementRef.current.offsetHeight;

			if (!isEmpty(boxRef) && onRefreshDrawingLayer) {
				boxRef.width(width +  Math.max(6, size * 2));
				boxRef.height(height + Math.max(6, size * 2));
				onRefreshDrawingLayer();
			}

			setAdditionalStyles({
				...additionalStyles,
				height: `${height}px`,
				width: `${width}px`,
			});
		}
	}, [value, initialTextareaWidth, styles.fontSize, boxRef]);

	const isFocused = () => document.activeElement === textareaRef.current;

	useOutsideClick(textareaRef, () => {
		if (visible && !isFocused()) {
			(async () => onAddText())();
		}
	});

	const getPlaceholder = () => {
		if (textareaRef.current) {
			return ` ${textareaRef.current.getAttribute('placeholder')} `;
		}
		return '';
	};

	return (
		<>
			<Textarea
				ref={textareaRef}
				id={EDITABLE_TEXTAREA_NAME}
				name={EDITABLE_TEXTAREA_NAME}
				placeholder={EDITABLE_TEXTAREA_PLACEHOLDER}
				value={value}
				style={{
					...styles,
					...additionalStyles
				}}
				onChange={onTextEdit}
				onKeyDown={onTextareaKeyDown}
			/>
			<AssistantElement
				ref={assistantElementRef}
				style={{
					fontSize: styles.fontSize,
				}}
			>
				{value ? ` ${value} ` : getPlaceholder()}
			</AssistantElement>
		</>
	);
};
