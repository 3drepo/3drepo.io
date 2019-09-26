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
import { EDITABLE_TEXTAREA_NAME, EDITABLE_TEXTAREA_PLACEHOLDER } from '../../screenshotDialog.helpers';
import { Textarea, TextPlaceholder } from '../../screenshotDialog.styles';

interface IProps {
	value: string;
	styles: any;
	handleTextEdit: (props: any) => void;
	handleTextareaKeyDown: (props: any) => void;
}

export const EditableText = ({ value, styles, handleTextEdit, handleTextareaKeyDown }: IProps) => {
	const { color, ...placeholderStyles } = styles;
	return (
		<>
			{
				<Textarea
					id={EDITABLE_TEXTAREA_NAME}
					name={EDITABLE_TEXTAREA_NAME}
					value={value === EDITABLE_TEXTAREA_PLACEHOLDER ? '' : value}
					style={styles}
					onChange={handleTextEdit}
					onKeyDown={handleTextareaKeyDown}
					autoFocus
				/>
			}
			{
				(value && value === EDITABLE_TEXTAREA_PLACEHOLDER)
				&& <TextPlaceholder style={placeholderStyles}>{value}</TextPlaceholder>
			}
		</>
	);
};
