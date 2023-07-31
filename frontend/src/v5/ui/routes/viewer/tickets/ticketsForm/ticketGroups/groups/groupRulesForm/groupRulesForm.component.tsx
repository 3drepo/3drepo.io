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
import { GroupRuleSchema } from '@/v5/validation/groupSchemes/groupSchemes';
import { selectMetaKeys } from '@/v4/modules/model';
import { useSelector } from 'react-redux';
import { Autocomplete, TextField } from '@mui/material';
import { IGroupRule } from '@/v5/store/tickets/tickets.types';
import { Buttons, Form, InputsContainer } from './groupRulesForm.styles';
import { IRuleForm, parseRule, prepareRuleForForm } from './groupRulesForm.helpers';
import { RuleOperationSelect } from './ruleOperationSelect/ruleOperationSelect.component';
import { RuleValueField } from './ruleValueField/ruleValueField.component';
import { ListboxComponent } from './listboxComponent/listboxComponent.component';

const DEFAULT_VALUES: IRuleForm = {
	field: null,
	operator: null,
	values: [],
};

type IGroupRules = {
	rule?: IGroupRule;
	onSave: (rule: IGroupRule) => void;
	onClose: () => void;
};

export const GroupRulesForm = ({ onSave, onClose, rule }: IGroupRules) => {
	const [value, setValue] = useState(rule?.field || '');
	const fields = useSelector(selectMetaKeys);
	const formData = useForm<IRuleForm>({
		defaultValues: rule ? prepareRuleForForm(rule) : DEFAULT_VALUES,
		mode: 'all',
		resolver: yupResolver(GroupRuleSchema),
	});

	const { formState: { isValid, isDirty } } = formData;

	const handleSave = (body: IRuleForm) => onSave(parseRule(body));

	const handleSubmit = (e) => {
		e.preventDefault();
		e.stopPropagation();
		formData.handleSubmit(handleSave)(e);
	};

	return (
		<Form onSubmit={handleSubmit}>
			<FormProvider {...formData}>
				<InputsContainer>
					<Controller
						name="field"
						render={({ field: { onChange, ...autocompleteProps } }) => (
							<Autocomplete
								{...autocompleteProps}
								renderOption={(props, option) => [props, option, value]}
								disableListWrap
								ListboxComponent={ListboxComponent}
								options={fields}
								noOptionsText={formatMessage({ id: 'tickets.groups.field.noOptions', defaultMessage: 'No options' })}
								onChange={(_, data) => onChange(data)}
								onInputChange={(_, newValue) => setValue(newValue)}
								renderInput={(renderInputProps) => (
									<TextField
										{...renderInputProps}
										label={formatMessage({ id: 'tickets.groups.field', defaultMessage: 'Field' })}
									/>
								)}
							/>
						)}
					/>
					<RuleOperationSelect />
					<RuleValueField />
				</InputsContainer>
				<Buttons>
					<ActionMenuItem>
						<Button variant="text" color="secondary" onClick={onClose}>
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
							{rule ? (
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
