/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { FormMultiSelect } from '@controls/inputs/formInputs.component';
import { InputControllerProps } from '@controls/inputs/inputController.component';
import { SelectProps } from '@controls/inputs/select/select.component';
import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';
import styled from 'styled-components';

const BusyIndicator = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

type BusyMultiSelectProps = InputControllerProps<SelectProps> & {
	busy?: boolean;
	busyLabel?: string;
};

export const BusyMultiSelect = ({ busy, busyLabel, ...props }: BusyMultiSelectProps) => (
	<FormMultiSelect
		{...props}
		disabled={busy || props.disabled}
		renderValue={busy ? () => (
			<BusyIndicator>
				<Spinner />
				{busyLabel}
			</BusyIndicator>
		) : props.renderValue}
	/>
);
