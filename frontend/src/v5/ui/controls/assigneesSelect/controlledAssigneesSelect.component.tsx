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

import { useEffect, useState } from 'react';
import { AssigneesSelect, IAssigneesSelect } from './assigneesSelect.component';

type ControlledAssigneesSelectProps = Omit<IAssigneesSelect, 'onBlur'> & {
	onBlur: (values) => void;
};

export const ControlledAssigneesSelect = ({
	value: initialValues,
	onBlur,
	...props
}: ControlledAssigneesSelectProps) => {
	const [values, setValues] = useState(initialValues);
	const handleClose = () => {
		onBlur(values);
	};
	const onChange = (e) => setValues(e?.target?.value);

	useEffect(() => setValues(initialValues), [initialValues]);

	return (
		<AssigneesSelect value={values} onBlur={handleClose} onChange={onChange} {...props} />
	);
};
