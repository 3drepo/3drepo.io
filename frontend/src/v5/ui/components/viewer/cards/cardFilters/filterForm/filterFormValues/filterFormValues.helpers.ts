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

import { getState } from '@/v5/helpers/redux.helpers';
import { mapArrayToFormArray, mapFormArrayToArray, SelectOption } from '@/v5/helpers/form.helper';
import { selectRiskCategories } from '@/v5/store/tickets/tickets.selectors';
import { FormDateTime, FormNumberField, FormTextField } from '@controls/inputs/formInputs.component';
import { isBoolean, uniqBy } from 'lodash';
import { BaseFilter, TicketFilter, TicketFilterOperator, TicketFilterType, TicketFilterValue } from '../../cardFilters.types';
import {
	amendDateUpperBounds,
	floorToMinute,
	getDefaultOperator,
	getTemplateProperty,
	getUsersAndJobs,
	isDateType,
	isRangeOperator,
} from '../../cardFilters.helpers';
import {
	arrToDisplayValue,
	formatDateRange,
	getFiltersFromJobsAndUsers,
	getOptionFromValue,
	valueToDisplayDate,
} from '../../filtersSelection/tickets/ticketFilters.helpers';
import { useTicketFiltersContext } from '../../ticketsFilters.context';
import { TRUE_LABEL, FALSE_LABEL } from '@controls/inputs/booleanSelect/booleanSelect.component';
import { getOperatorMaxFieldsAllowed } from '../filterForm.helpers';

const DEFAULT_VALUES: TicketFilterValue[] = [''];
const DEFAULT_RANGE_VALUES: TicketFilterValue[] = [['', '']];

type Option = {
	value: string,
	displayValue?: string,
	type?: string,
};

export type FilterFormValuesForm = {
	selectOptions?: Option[],
	values: { value: TicketFilterValue, displayValue?: string }[],
};

export type FilterFormValuesProps = {
	module: string,
	property: string,
	type: TicketFilterType,
	filter?: BaseFilter,
	operator: TicketFilterOperator,
	isBackButton?: boolean,
	onSubmit: (newFilter: TicketFilter) => void,
	onClickCancelOrBack?: () => void,
};

export type FilterFormValuesComponentProps = FilterFormValuesProps;

export const FIELD_ARRAY_NAME = 'values';

export const getDefaultValues = (filter: BaseFilter | undefined, isRangeForm: boolean): FilterFormValuesForm => {
	const useFilterValues = !!filter && isRangeOperator(filter.operator) === isRangeForm;
	return {
		values: mapArrayToFormArray(useFilterValues ? filter.values : (isRangeForm ? DEFAULT_RANGE_VALUES : DEFAULT_VALUES)),
	};
};

export const isOperatorDirty = (filter: BaseFilter | undefined, type: TicketFilterType, operator: TicketFilterOperator) => {
	return operator !== (filter?.operator || getDefaultOperator(type));
};

export const mapFilterFormValuesToFilter = (
	filledForm: FilterFormValuesForm,
	module: string,
	property: string,
	type: TicketFilterType,
	operator: TicketFilterOperator,
): TicketFilter => {
	let newValues:any = getOperatorMaxFieldsAllowed(operator) === 0
		? []
		: mapFormArrayToArray(filledForm.values as any)
			.filter((x) => ![undefined, ''].includes(x as any));

	// We need to adjust the upper bounds of date values since some dates (e.g. Created At) include milliseconds whereas the datePicker
	// only goes down to minutes. So we need to extend the upper bound values to the maximum millisecond possible to include all of that minute
	if (isDateType(type)) {
		switch (operator) {
			case 'rng':
			case 'nrng':
				newValues = newValues.map(amendDateUpperBounds);
				break;
			case 'lte':
				newValues = amendDateUpperBounds(newValues);
				break;
			case 'gte': // This is required for when a chip is edited from lte to gte so that it is no longer at the very last millisecond
				newValues = newValues.map(floorToMinute);
				break;
			default:
				break;
		}
	}

	const isRange = isRangeOperator(operator);
	const displayValues = arrToDisplayValue(newValues.map((newVal: any) => {
		const option = getOptionFromValue(newVal, filledForm.selectOptions || []);
		if (isDateType(type)) return (isRange ? formatDateRange(newVal) : valueToDisplayDate(newVal));
		if (type === 'boolean' && isBoolean(newValues[0])) return newValues[0] ? TRUE_LABEL : FALSE_LABEL;
		if (isRange) {
			const [a, b] = newVal;
			return `[${a}, ${b}]`;
		}
		return option?.displayValue ?? newVal;
	}));

	return { module, property, type, filter: { operator, values: newValues, displayValues } };
};

export const getInputField = (type: TicketFilterType) => {
	if (type === 'number') return FormNumberField;
	if (isDateType(type)) return FormDateTime;
	return FormTextField;
};

const allValuesAre = (templates, module, property, predefinedValues) => {
	const properties = templates.map((template) => getTemplateProperty(template, module, property)).filter(Boolean);
	return properties.length && properties.every(({ values }) => values === predefinedValues);
};

export const getIsJobsAndUsersProperty = (templates, module, property, type) => {
	return (type === 'owner') || allValuesAre(templates, module, property, 'jobsAndUsers');
};

export const isJobsAndUsersProperty = (module, property, type) => {
	const { templates } = useTicketFiltersContext();
	return getIsJobsAndUsersProperty(templates, module, property, type);
};

export const getSelectOptions = (module, property, type, templates, modelsIds): SelectOption[] => {
	let options = [];

	if (type === 'template') {
		return templates.map((t) => ({ value: t.code, displayValue: t.name }));
	}

	const riskCategories = selectRiskCategories(getState());
	const jobsAndUsers = getFiltersFromJobsAndUsers(getUsersAndJobs(modelsIds));

	if (type === 'owner') return jobsAndUsers;

	templates.forEach((template) => {
		const matchingProperty = getTemplateProperty(template, module, property);
		if (!matchingProperty || !['manyOf', 'oneOf'].includes(matchingProperty.type)) return;
		switch (matchingProperty.values) {
			case 'riskCategories':
				options.push(...riskCategories.map((value) => ({ value })));
				break;
			case 'jobsAndUsers':
				options.push(...jobsAndUsers);
				break;
			default:
				options.push(...matchingProperty.values.map((value) => ({ value })));
		}
	});

	return uniqBy(options, (({ value }) => value));
};
