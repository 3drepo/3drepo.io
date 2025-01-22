/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { RangeContainer, RangeInputSeparator } from './rangeInput.styles';
import { useRangeEffect } from './useRangeEffect';
import { FormNumberField } from '@controls/inputs/formInputs.component';
import { INVALID_NUMBER_RANGE_MESSAGE } from '@/v5/validation/shared/validators';

export const NumberRangeInput = ({ name, formError }) => {
	const isInvalidRangeError = formError?.[1]?.message === INVALID_NUMBER_RANGE_MESSAGE;
	useRangeEffect({ name, formError });
	return (
		<RangeContainer $showOneError={isInvalidRangeError}>
			<FormNumberField name={`${name}.0`} formError={formError?.[0]} />
			<RangeInputSeparator />
			<FormNumberField name={`${name}.1`} formError={formError?.[1]} />
		</RangeContainer>
	);
};