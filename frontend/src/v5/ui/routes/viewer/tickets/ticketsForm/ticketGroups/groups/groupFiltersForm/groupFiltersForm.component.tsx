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

import { ActionMenuItem } from '@controls/actionMenu';
import { FormattedMessage } from 'react-intl';
import { Button } from '@controls/button';
import { useForm, FormProvider } from 'react-hook-form';
import { FormTextField } from '@controls/inputs/formInputs.component';
import { formatMessage } from '@/v5/services/intl';
import { SubmitButton } from '@controls/submitButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { GroupFiltersSchema } from '@/v5/validation/groupSchemes/groupSchemes';
import { selectMetaKeys } from '@/v4/modules/model';
import { useSelector } from 'react-redux';
import { Buttons, Form, InputsContainer } from './groupFiltersForm.styles';
import { IFilter, IFilterForm } from './groupFiltersForm.helpers';
import { FilterOperationSelect } from './filterOperationSelect/filterOperationSelect.component';
import { FilterValueField } from './filterValueField/filterValueField.component';
import { Autocomplete } from '@mui/material';

const DEFAULT_VALUES: IFilterForm = {
	field: null,
	operation: null,
	values: [],
};

type IGroupFilters = { onBlur?: (filter: IFilter) => void };
export const GroupFiltersForm = ({ onBlur }: IGroupFilters) => {
	const fields = useSelector(selectMetaKeys);
	const formData = useForm<IFilterForm>({
		defaultValues: DEFAULT_VALUES,
		mode: 'all',
		resolver: yupResolver(GroupFiltersSchema),
	});

	const {
		handleSubmit,
		formState: { isValid },
	} = formData;

	const onSubmit = ({ field, operation, values}: IFilterForm) => {
		const filterData: IFilter = { field, operation };
		if (values?.length) {
			filterData.values = values.map((v) => v.value);
		}
		onBlur(filterData);
	};

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<FormProvider {...formData}>
				<InputsContainer>
					<Autocomplete
						options={fields}
						onInputChange={(_, value) => formData.setValue('field', value)}
						renderInput={(formTextFieldProps) => (
							<FormTextField
								{...formTextFieldProps}
								label={formatMessage({ id: 'tickets.groups.field', defaultMessage: 'Field' })}
								name='field'
								inputProps={{
									...formTextFieldProps.inputProps,
									placeholder: formatMessage({ id: 'ticket.groups.field.placeholder', defaultMessage: 'Set field'}),
								}}
							/>
						)}
					/>
					<FilterOperationSelect/>
					<FilterValueField />
				<Buttons>
					<ActionMenuItem>
						<Button variant="text" color="secondary">
							<FormattedMessage id="tickets.groups.filterPanel.cancel" defaultMessage="Cancel" />
						</Button>
					</ActionMenuItem>
					<ActionMenuItem disabled={isValid}>
						<SubmitButton variant="contained" color="primary" fullWidth={false} disabled={!isValid}>
							<FormattedMessage id="tickets.groups.filterPanel.createGroup" defaultMessage="Create group" />
						</SubmitButton>
					</ActionMenuItem>
				</Buttons>
			</FormProvider>
		</Form>
	);
};
