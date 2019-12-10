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

import { useFocus } from '../../../../../hooks';
import { EDITABLE_TEXTAREA_NAME, EDITABLE_TEXTAREA_PLACEHOLDER } from '../../screenshotDialog.helpers';
import { AssistantElement, Textarea } from './editableText.styles';

interface IProps {
	value: string;
	styles: any;
	handleTextEdit: (props: any) => void;
	handleTextareaKeyDown: (props: any) => void;
}

export const EditableText = ({ value, styles, handleTextEdit, handleTextareaKeyDown }: IProps) => {
	// const textareaRef = React.useRef<HTMLTextAreaElement>(null);
	const [textareaRef, setTextareaFocus] = useFocus();
	const assistantElementRef = React.useRef<HTMLPreElement>(null);
	const [initialTextareaWidth, setInitialTextareaWidth] = React.useState<number>(0);
	const [additionalStyles, setAdditionalStyles] = React.useState<object>({});

	React.useEffect(() => {
		setTextareaFocus();
		if (textareaRef.current) {
			const currentTextarea = textareaRef.current;
			currentTextarea.setAttribute('size', currentTextarea.getAttribute('placeholder').length.toString());
			setInitialTextareaWidth(currentTextarea.offsetWidth);
		}
	}, []);

	React.useEffect(() => {
		if (textareaRef && assistantElementRef) {
			if (assistantElementRef.current.offsetWidth > initialTextareaWidth) {
				setAdditionalStyles({
					...additionalStyles,
					height: `${textareaRef.current.scrollHeight}px`,
					width: `${assistantElementRef.current.offsetWidth}px`,
				});
			} else {
				setAdditionalStyles({
					...additionalStyles,
					height: `${textareaRef.current.scrollHeight}px`,
				});
			}
		}
	}, [value]);

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
				onChange={handleTextEdit}
				onKeyDown={handleTextareaKeyDown}
				autoFocus
			/>
			<AssistantElement
				ref={assistantElementRef}
				style={{
					fontFamily: styles.fontFamily,
					fontSize: styles.fontSize,
				}}
			>
				{value && `_${value}_`}
			</AssistantElement>
		</>
	);
};
