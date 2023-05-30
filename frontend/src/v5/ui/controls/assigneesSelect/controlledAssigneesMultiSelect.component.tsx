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

import { useState } from 'react';
import { AssigneesMultiSelect, IAssigneesMultiSelect } from './assigneesMultiSelect.component';

type ControlledAssigneesMultiSelectProps = Omit<IAssigneesMultiSelect, 'onBlur'> & {
	onBlur: (values) => void;
};

export const ControlledAssigneesMultiSelect = ({
	value: initialValue,
	onBlur,
	...props
}: ControlledAssigneesMultiSelectProps) => {
	const [values, setValues] = useState(initialValue);
	const handleClose = () => {
		onBlur(values);
	};
	const onChange = (e) => setValues(e?.target?.value);
	return (
		<AssigneesMultiSelect value={values} onBlur={handleClose} onChange={onChange} {...props} />
	);
};
