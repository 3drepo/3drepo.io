/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { useState } from 'react';
import { ButtonContainer } from './formInvisibleSelect.styles';
import { InvisibleContainer as SelectContainer } from '../formInvisibleSelect/formInvisibleSelect.styles';
import { FormMultiSelect, FormMultiSelectProps } from '../formMultiSelect/formMultiSelect.component';

type FormInvisibleMultiSelectProps = FormMultiSelectProps & {
	TriggerComponent: JSX.Element,
};

export const FormInvisibleMultiSelect = ({
	TriggerComponent,
	selectedOptionsTooltip = false,
	onClose,
	...props
}: FormInvisibleMultiSelectProps) => {
	const [open, setOpen] = useState(false);

	const handleClose = (e) => {
		setOpen(false);
		onClose?.(e)
	};

	return (
		<>
			<ButtonContainer onClick={() => setOpen(true)}>
				{TriggerComponent}
			</ButtonContainer>
			<SelectContainer>
				<FormMultiSelect
					selectedOptionsTooltip={selectedOptionsTooltip}
					open={open}
					onClose={handleClose}
					{...props}
				/>
			</SelectContainer>
		</>
	);
};
