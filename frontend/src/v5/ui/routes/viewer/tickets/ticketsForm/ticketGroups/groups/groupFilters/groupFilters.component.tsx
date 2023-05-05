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
import { FormSearchSelect } from '@controls/inputs/formInputs.component';
import { formatMessage } from '@/v5/services/intl';
import { MenuItem } from '@mui/material';
import { Buttons, FiltersActionMenu, TriggerButton, FloatingPanel } from './groupFilters.styles';
import { SubmitButton } from '@controls/submitButton';
import { IFilterForm, getFields } from './groupFilters.helpers';
import { FilterOperationSelect } from './filterOperationSelect/filterOperationSelect.component';
import { FilterValueField } from './filterValueField/filterValueField.component';

type IGroupFilters = { value?: IFilterForm };
export const GroupFilters = ({ value }: IGroupFilters) => {
	const formData = useForm<IFilterForm>({ defaultValues: value });

	const {
		handleSubmit,
		formState: { isValid },
	} = formData;

	const onSubmit = (body) => {
		console.log(body);
	};

	return (
		<FiltersActionMenu TriggerButton={(
			<TriggerButton>
				<FormattedMessage id="tickets.groups.addFilter" defaultMessage="Add filter" />
			</TriggerButton>
		)}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<FormProvider {...formData}>
					<FloatingPanel>
						<FormSearchSelect
							placeholder={formatMessage({ id: 'ticket.groups.field.placeholder', defaultMessage: 'Set field'})}
							name='field'
							label={formatMessage({ id: 'tickets.groups.field', defaultMessage: 'Field' })}
						>
							{getFields().map((value) => (
								<MenuItem value={value} key={value}>
									{value}
								</MenuItem>
							))}
						</FormSearchSelect>
						<FilterOperationSelect/>
						<FilterValueField />
						<Buttons>
							<ActionMenuItem>
								<Button variant="text" color="secondary">
									<FormattedMessage id="tickets.groups.filterPanel.cancel" defaultMessage="Cancel" />
								</Button>
							</ActionMenuItem>
							<ActionMenuItem disabled={isValid}>
								<SubmitButton variant="contained" color="primary" fullWidth={false} disabled={isValid}>
									<FormattedMessage id="tickets.groups.filterPanel.createGroup" defaultMessage="Create group" />
								</SubmitButton>
							</ActionMenuItem>
						</Buttons>
					</FloatingPanel>
				</FormProvider>
			</form>
		</FiltersActionMenu>
	);
};
