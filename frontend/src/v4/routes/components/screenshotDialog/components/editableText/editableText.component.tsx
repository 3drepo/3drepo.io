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
import { useEffect, CSSProperties, useRef, useState } from 'react';

import { ClickAwayListener } from '@mui/material';
import { EDITABLE_TEXTAREA_NAME, EDITABLE_TEXTAREA_PLACEHOLDER } from '../../screenshotDialog.helpers';
import { TextBox } from './editableText.styles';

interface IProps {
	styles: CSSProperties;
	onAddText: (newtext: string, width: number) => void;
	onChange?: ({ width, height }) => void;
	onClick?: () => void;
}

const pxToNumber = (size: string) => +size.replaceAll('px', '');
export const EditableText = ({ styles, onAddText, onChange, onClick }: IProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	const updateSize = () => {
		const compStyles = getComputedStyle(ref.current);
		setSize({
			width: pxToNumber(compStyles.width),
			height: pxToNumber(compStyles.height),
		});
	}

	const saveText = () => onAddText(ref.current.innerText, size.width);

	const handleKeyDown = (e) => {
		if (e.keyCode === 13 && !e.shiftKey) {
			saveText();
		}
	};

	useEffect(() => {
		setTimeout(() => {
			ref.current?.focus();
			updateSize();
		});
	}, []);

	useEffect(() => {
		onChange?.(size);
	}, [size]);

	return (
		<ClickAwayListener onClickAway={saveText}>
			<TextBox
				ref={ref}
				id={EDITABLE_TEXTAREA_NAME}
				$placeholder={EDITABLE_TEXTAREA_PLACEHOLDER}
				style={styles}
				onKeyDown={handleKeyDown}
				onInput={updateSize}
				onClick={onClick}
				contentEditable
			/>
		</ClickAwayListener>
	);
};
