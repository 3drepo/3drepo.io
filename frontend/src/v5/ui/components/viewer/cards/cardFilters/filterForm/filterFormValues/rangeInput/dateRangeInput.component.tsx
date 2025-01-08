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
import { useFormContext } from 'react-hook-form';
import { formatMessage } from '@/v5/services/intl';
import { FormDateTime } from '@controls/inputs/formInputs.component';
import { useRangeEffect } from './useRangeEffect';
import { INVALID_DATE_RANGE_MESSAGE } from '@/v5/validation/shared/validators';

export const DateRangeInput = ({ name, formError }) => {
	const { getValues } = useFormContext();
	const fromDate = getValues(`${name}.0`);
	const toDate = getValues(`${name}.1`);
	const isInvalidRangeError = formError?.[1]?.message === INVALID_DATE_RANGE_MESSAGE;

	useRangeEffect({ formError, name });

	return (
		<RangeContainer $showOneError={isInvalidRangeError}>
			<FormDateTime
				maxDate={toDate}
				name={`${name}.0`}
				formError={formError?.[0]}
				placeholder={formatMessage({
					id: 'dateRangeInputs.dateFrom',
					defaultMessage: 'Date from',
				})}
				disableOpenPicker
			/>
			<RangeInputSeparator />
			<FormDateTime
				minDate={fromDate}
				name={`${name}.1`}
				formError={formError?.[1]}
				placeholder={formatMessage({
					id: 'dateRangeInputs.dateTo',
					defaultMessage: 'Date to',
				})}
				disableOpenPicker
			/>
		</RangeContainer>
	);
};