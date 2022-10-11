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

import { FormSingleSelect, FormSingleSelectProps } from '@controls/formSearchSelect/formSingleSelect/formSingleSelect.component';
import { useState } from 'react';
import { InvisibleContainer, ButtonContainer } from './formInvisibleSelect.styles';

type FormInvisibleSelectProps = FormSingleSelectProps & {
	TriggerComponent: JSX.Element,
};

export const FormInvisibleSelect = ({ TriggerComponent, ...props }: FormInvisibleSelectProps) => {
	const [open, setOpen] = useState(false);

	return (
		<InvisibleContainer>
			<ButtonContainer onClick={() => setOpen(true)}>{TriggerComponent}</ButtonContainer>
			<FormSingleSelect {...props} open={open} onClose={() => setOpen(false)} />
		</InvisibleContainer>
	);
};
