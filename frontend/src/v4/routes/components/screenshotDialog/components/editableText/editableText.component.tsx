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
import { useEffect, CSSProperties, useRef, useState, forwardRef, MutableRefObject } from 'react';

import { ClickAwayListener } from '@mui/material';
import { EDITABLE_TEXTAREA_NAME, EDITABLE_TEXTAREA_PLACEHOLDER } from '../../screenshotDialog.helpers';
import { TextBox } from './editableText.styles';

const EMPTY_BOX_SIZES = { width: 0, height: 0 };
export type TextBoxSizes = { height: number, width: number };
export type TextBoxRef = {
	getCurrentSizes: () => TextBoxSizes,
};
interface IProps {
	styles: CSSProperties;
	disabled?: boolean;
	onAddText?: (newtext: string, width: number) => void;
	onResize?: (sizes: TextBoxSizes) => void;
	onClick?: () => void;
}
const pxToNumber = (size: string) => +size.replaceAll('px', '');
export const EditableText = forwardRef((
	{ styles, disabled, onAddText, onClick, onResize }: IProps,
	parentRef: MutableRefObject<TextBoxRef>,
) => {
	const [sizes, setSizes] = useState(EMPTY_BOX_SIZES);
	const ref = useRef<HTMLDivElement>(null);

	const getCurrentSizes = () => {
		if (!ref.current) return EMPTY_BOX_SIZES;
		const compStyles = getComputedStyle(ref.current);
		return {
			width: pxToNumber(compStyles.width),
			height: pxToNumber(compStyles.height),
		};
	};

	const updateSizes = () => {
		const newSize = getCurrentSizes();
		onResize?.(newSize);
		if (ref.current) {
			setSizes(newSize);
		}
	};

	const observer = new ResizeObserver(updateSizes);

	const saveText = () => onAddText?.(ref.current.innerText, sizes.width);

	const keepTopScrolling = () => requestAnimationFrame(() => {
		if (ref.current) {
			ref.current.scrollTop = 0;
		}
	});

	const handleChange = (e) => {
		if (e.keyCode === 13 && !e.shiftKey) {
			saveText();
		}
		keepTopScrolling();
	};

	useEffect(() => {
		setTimeout(() => {
			if (!ref.current) return;
			observer.observe(ref.current);
			if (!disabled) {
				ref.current?.focus();
			}
		});
	}, [disabled]);

	useEffect(() => {
		if (!parentRef) return;
		parentRef.current = { getCurrentSizes };
	}, []);

	return (
		<ClickAwayListener mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={saveText}>
			<TextBox
				ref={ref}
				id={EDITABLE_TEXTAREA_NAME}
				$placeholder={EDITABLE_TEXTAREA_PLACEHOLDER}
				style={styles}
				onInput={handleChange}
				onKeyDown={keepTopScrolling}
				onClick={onClick}
				contentEditable={!disabled}
				disabled={disabled}
			/>
		</ClickAwayListener>
	);
});
