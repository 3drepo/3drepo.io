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

import EyeIcon from '@assets/icons/outlined/eye-outlined.svg';
import EyeDisabledIcon from '@assets/icons/outlined/eye_disabled-outlined.svg';
import { CheckboxProps } from '@mui/material';
import { Checkbox } from './groupToggle.styles';

type GroupToggleProps = CheckboxProps & { colored: boolean };
export const GroupToggle = ({ colored, ...props }: GroupToggleProps) => {
	if (colored) return (<Checkbox {...props} />);
	return (<Checkbox icon={<EyeDisabledIcon />} checkedIcon={<EyeIcon />} {...props} />)
};
