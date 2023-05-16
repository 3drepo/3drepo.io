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
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { useState } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { SubmitButton } from '@controls/submitButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { GroupFiltersSchema } from '@/v5/validation/groupSchemes/groupSchemes';
import { selectMetaKeys } from '@/v4/modules/model';
import { useSelector } from 'react-redux';
import { Highlight } from '@controls/highlight';
import { Autocomplete, TextField } from '@mui/material';
import { Buttons, Form, InputsContainer } from './groupFiltersForm.styles';
import { IFilter, IFilterForm, parseFilter, prepareFilterForForm } from './groupFiltersForm.helpers';
import { FilterOperationSelect } from './filterOperationSelect/filterOperationSelect.component';
import { FilterValueField } from './filterValueField/filterValueField.component';

const DEFAULT_VALUES: IFilterForm = {
	field: null,
	operation: null,
	values: [],
};

type IGroupFilters = {
	filter?: IFilter;
	onSave?: (filter: IFilter) => void;
};
export const GroupFiltersForm = ({ onSave, filter }: IGroupFilters) => {
	const [fieldValue, setFieldValue] = useState(filter?.field || '');
	const fields = useSelector(selectMetaKeys);
	const formData = useForm<IFilterForm>({
		defaultValues: filter ? prepareFilterForForm(filter) : DEFAULT_VALUES,
		mode: 'all',
		resolver: yupResolver(GroupFiltersSchema),
	});

	const {
		handleSubmit,
		formState: { isValid, isDirty },
	} = formData;

	const onSubmit = (body: IFilterForm) => onSave(parseFilter(body));

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<FormProvider {...formData}>
				<InputsContainer>
					<Controller
						name="field"
						render={({ field: { onChange, ...autocompleteProps } }) => (
							<Autocomplete
								{...autocompleteProps}
								options={fields}
								noOptionsText={formatMessage({ id: 'tickets.groups.field.noOptions', defaultMessage: 'No options' })}
								onChange={(_, data) => onChange(data)}
								onInputChange={(_, value) => setFieldValue(value)}
								renderOption={(fieldProps, field: string) => (
									<li {...fieldProps}>
										<Highlight search={fieldValue}>{field}</Highlight>
									</li>
								)}
								renderInput={(renderInputProps) => (
									<TextField
										{...renderInputProps}
										label={formatMessage({ id: 'tickets.groups.field', defaultMessage: 'Field' })}
									/>
								)}
							/>
						)}
					/>
					<FilterOperationSelect />
					<FilterValueField />
				</InputsContainer>
				<Buttons>
					<ActionMenuItem>
						<Button variant="text" color="secondary">
							<FormattedMessage id="tickets.groups.filterPanel.cancel" defaultMessage="Cancel" />
						</Button>
					</ActionMenuItem>
					<ActionMenuItem disabled={!isValid}>
						<SubmitButton
							variant="contained"
							color="primary"
							fullWidth={false}
							disabled={!isValid || !isDirty}
						>
							{filter ? (
								<FormattedMessage id="tickets.groups.filterPanel.updateFilter" defaultMessage="Update filter" />
							) : (
								<FormattedMessage id="tickets.groups.filterPanel.createFilter" defaultMessage="Create filter" />
							)}
						</SubmitButton>
					</ActionMenuItem>
				</Buttons>
			</FormProvider>
		</Form>
	);
};
