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
import HighlightIcon from '@assets/icons/outlined/highlight-outlined.svg';
import { CheckboxProps } from '@mui/material';
import { OverrideType } from '@/v5/store/tickets/tickets.types';
import { useContext } from 'react';
import { Checkbox, EyeCheckbox, IndeterminateEye, SelectedButton } from './groupToggle.styles';
import { TicketGroupsContext } from '../ticketGroupsContext';

export const GroupToggle = (props: CheckboxProps) => {
	const { groupType } = useContext(TicketGroupsContext);

	if (groupType === OverrideType.COLORED) return (<Checkbox {...props} />);
	if (groupType === OverrideType.SELECTED) {
		return (
			<SelectedButton onClick={props.onClick} disabled={props.disabled}>
				<HighlightIcon />
			</SelectedButton>
		);
	}
	return (<EyeCheckbox icon={<EyeIcon />} checkedIcon={<EyeDisabledIcon />} indeterminateIcon={<IndeterminateEye />} {...props} />);
};
