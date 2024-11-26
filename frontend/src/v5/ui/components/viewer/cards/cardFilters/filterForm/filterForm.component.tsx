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
import { CardFilterOperator, CardFilterValue, CardFilter, CardFilterType, FormFilter } from '../cardFilters.types';
import { FILTER_OPERATOR_LABEL, getFilterFormTitle } from '../cardFilters.helpers';
import { Container, ButtonsContainer, Button } from './filterForm.styles';
import { MenuItem } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { FormSelect, FormTextField } from '@controls/inputs/formInputs.component';
import _, { isEmpty } from 'lodash';
import { ActionMenuItem } from '@controls/actionMenu';
import { getOperatorMaxSupportedValues } from './filterForm.helpers';

const DEFAULT_VALUES = { values: [], operator: 'eq' };
type FormType = { values: CardFilterValue[], operator: CardFilterOperator };
type FilterFormProps = {
	module: string,
	property: string,
	type: CardFilterType,
	filter?: FormFilter,
	onSubmit: (newFilter: CardFilter) => void,
	onCancel: () => void,
};
export const FilterForm = ({ module, property, type, filter, onSubmit, onCancel }: FilterFormProps) => {
	const { operator, values = [] } = filter || {};
	const formData = useForm<FormType>({ defaultValues: _.defaults({ values, operator }, DEFAULT_VALUES) });

	const handleSubmit = formData.handleSubmit((body: FormType) => {
		// TODO - remove this line
		const newValues = body.values.filter((x) => ![undefined, ''].includes(x as any));
		onSubmit({ module, property, type, filter: { operator: body.operator, values: newValues } });
	});

	const isUpdatingFilter = !!filter;
	const canSubmit = formData.formState.isValid && !isEmpty(formData.formState.dirtyFields);
	const formOperator = formData.watch('operator');
	const valuesInputsCount = Math.min(getOperatorMaxSupportedValues(formOperator), 3);
	
	return (
		<FormProvider {...formData}>
			<Container>
				{getFilterFormTitle([module, property])}
				<FormSelect name='operator'>
					{Object.entries(FILTER_OPERATOR_LABEL).map(([key, label]) => (
						<MenuItem key={key} value={key}>{label}</MenuItem>
					))}
				</FormSelect>
				type: {type}
				{Array(valuesInputsCount).fill(0).map((i, index) => (
					<FormTextField name={`values.${index}`} />
				))}
				<ButtonsContainer>
					<Button onClick={onCancel} color="secondary">
						{isUpdatingFilter
							? <FormattedMessage id="viewer.card.tickets.filters.form.cancel" defaultMessage="Cancel" />
							: <FormattedMessage id="viewer.card.tickets.filters.form.back" defaultMessage="Back" />
						}
					</Button>
					<ActionMenuItem disabled={!canSubmit}>
						<Button onClick={handleSubmit} color="primary" variant="contained">
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
