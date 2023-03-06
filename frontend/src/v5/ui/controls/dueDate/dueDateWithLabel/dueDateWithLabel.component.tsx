/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { BaseDueDate } from '../baseDueDate.component';
import { DueDateEmptyLabel } from './dueDateLabel/dueDateEmptyLabel.component';
import { DueDateFilledLabel } from './dueDateLabel/dueDateFilledLabel.component';

type IDueDateWithLabel = {
	value: number;
	disabled?: boolean;
	onBlur?: (newValue) => void;
};

export const DueDateWithLabel = ({ value, disabled, onBlur }: IDueDateWithLabel) => (
	<BaseDueDate
		value={value}
		disabled={disabled}
		onBlur={onBlur}
		renderInput={({ inputRef }) => (
			<div ref={inputRef}>
				{value ? (
					<DueDateFilledLabel value={value} disabled={disabled} />
				) : (
					<DueDateEmptyLabel disabled={disabled} />
				)}
			</div>
		)}
	/>
);
