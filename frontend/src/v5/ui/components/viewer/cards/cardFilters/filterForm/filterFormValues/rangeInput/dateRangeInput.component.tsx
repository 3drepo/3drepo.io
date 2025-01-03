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

import { FormattedMessage } from 'react-intl';
import { RangeContainer } from './rangeInput.styles';
import { useFormContext } from 'react-hook-form';
import { formatMessage } from '@/v5/services/intl';
import { FormDateTime } from '@controls/inputs/formInputs.component';

export const DateRangeInput = ({ name, error }) => {
	const { getValues } = useFormContext();
	const fromDate = getValues(`${name}.0`);
	const toDate = getValues(`${name}.1`);

	return (
		<RangeContainer>
			<FormDateTime
				maxDate={toDate}
				name={`${name}.0`}
				formError={!!error}
				placeholder={formatMessage({
					id: 'dateRangeInputs.dateFrom',
					defaultMessage: 'Date from',
				})}
				disableOpenPicker
			/>
			<FormattedMessage id="dateRangeInputs.to" defaultMessage="to" />
			<FormDateTime
				minDate={fromDate}
				name={`${name}.1`}
				formError={!!error}
				placeholder={formatMessage({
					id: 'dateRangeInputs.dateTo',
					defaultMessage: 'Date to',
				})}
				disableOpenPicker
			/>
		</RangeContainer>
	);
};