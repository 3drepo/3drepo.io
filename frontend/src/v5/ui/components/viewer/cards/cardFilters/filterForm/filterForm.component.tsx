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
import { CardFilterOperator, CardFilterValue, CardFilterType, BaseFilter, CardFilter } from '../cardFilters.types';
import { getFilterFormTitle, isDateType, isRangeOperator } from '../cardFilters.helpers';
import { Container, ButtonsContainer, Button, TitleContainer } from './filterForm.styles';
import { FormProvider, useForm } from 'react-hook-form';
import { isBoolean, isEmpty } from 'lodash';
import { ActionMenuItem } from '@controls/actionMenu';
import { FilterFormValues } from './filterFormValues/filterFormValues.component';
import { mapArrayToFormArray, mapFormArrayToArray } from '@/v5/helpers/form.helper';
import { yupResolver } from '@hookform/resolvers/yup';
import { FilterSchema } from '@/v5/validation/ticketSchemes/validators';
import { FilterFormOperators } from './filterFormValues/operators/filterFormOperators.component';
import { getOptionFromValue } from '../filtersSelection/tickets/ticketFilters.helpers';
import { formatSimpleDate } from '@/v5/helpers/intl.helper';
import { formatMessage } from '@/v5/services/intl';
import { TRUE_LABEL, FALSE_LABEL } from '@controls/inputs/booleanSelect/booleanSelect.component';

const DEFAULT_OPERATOR = 'is';
const DEFAULT_VALUES = [''];
type FormType = { values: { value: CardFilterValue, displayValue?: string }[], operator: CardFilterOperator };
type FilterFormProps = {
	module: string,
	property: string,
	type: CardFilterType,
	filter?: BaseFilter,
	onSubmit: (newFilter: CardFilter) => void,
	onCancel: () => void,
};

const valueToDisplayDate = (value) => formatSimpleDate(new Date(value));
const formatDateRange = ([from, to]) => formatMessage(
	{ defaultMessage: '{from} to {to}', id: 'cardFilter.dateRange.join' },
	{ from: valueToDisplayDate(from), to: valueToDisplayDate(to) },
);

export const FilterForm = ({ module, property, type, filter, onSubmit, onCancel }: FilterFormProps) => {
	const defaultValues = {
		operator: filter?.operator || DEFAULT_OPERATOR,
		values: mapArrayToFormArray(filter?.values || DEFAULT_VALUES),
	};

	const formData = useForm<FormType>({
		defaultValues,
		mode: 'onChange',
		resolver: yupResolver(FilterSchema),
		context: { type },
		shouldUnregister: true,
	});
	const { formState: { isValid, dirtyFields }, reset } = formData;

	const isUpdatingFilter = !!filter;
	const canSubmit = isValid && !isEmpty(dirtyFields);

	const handleSubmit = formData.handleSubmit((body: FormType) => {
		const newValues = mapFormArrayToArray(body.values)
			.filter((x) => ![undefined, ''].includes(x as any));
		const isRange = isRangeOperator(body.operator);
		const displayValues = newValues.map((newVal) => {
			const option = getOptionFromValue(newVal, body.values);
			if (isDateType(type)) return (isRange ? formatDateRange(newVal) : valueToDisplayDate(newVal));
			if (type === 'boolean' && isBoolean(newValues[0])) return newValues[0] ? TRUE_LABEL : FALSE_LABEL; 
			if (isRange) {
				const [a, b] = newVal;
				return `[${a}, ${b}]`;
			}
			return option.displayValue ?? newVal;
		}).join(', ');
		onSubmit({ module, property, type, filter: { operator: body.operator, values: newValues, displayValues } });
	});

	const handleCancel = () => {
		reset();
		onCancel();
	};

	return (
		<FormProvider {...formData}>
			<Container>
				<TitleContainer>
					{getFilterFormTitle([module, property])}
				</TitleContainer>
				<FilterFormOperators type={type} />
				{property && (
					<FilterFormValues module={module} property={property} type={type} />
				)}
				<ButtonsContainer>
					<Button onClick={handleCancel} color="secondary">
						{isUpdatingFilter
							? <FormattedMessage id="viewer.card.tickets.filters.form.cancel" defaultMessage="Cancel" />
							: <FormattedMessage id="viewer.card.tickets.filters.form.back" defaultMessage="Back" />
						}
					</Button>
					<ActionMenuItem disabled={!canSubmit}>
						<Button onClick={handleSubmit} color="primary" variant="contained" disabled={!canSubmit}>
							{isUpdatingFilter
								? <FormattedMessage id="viewer.card.tickets.filters.form.update" defaultMessage="Update" />
								: <FormattedMessage id="viewer.card.tickets.filters.form.apply" defaultMessage="Apply" />
							}
						</Button>
					</ActionMenuItem>
				</ButtonsContainer>
			</Container>
		</FormProvider>
	);
};
