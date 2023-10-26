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
import { SubmitButton } from '@controls/submitButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { GroupRuleSchema } from '@/v5/validation/groupSchemes/groupSchemes';
import { IGroupRule } from '@/v5/store/tickets/tickets.types';
import { formatMessage } from '@/v5/services/intl';
import { FormTextField } from '@controls/inputs/formInputs.component';
import { useEffect } from 'react';
import { isEqual } from 'lodash';
import { Buttons, Form, InputsContainer } from './groupRulesForm.styles';
import { IFormRule, formRuleToGroupRule, groupRuleToFormRule } from './groupRulesForm.helpers';
import { RuleFieldValues } from './groupRulesInputs/ruleFieldValues/ruleFieldValues.component';
import { RuleFieldOperator } from './groupRulesInputs/ruleFieldOperator/ruleFieldOperator.component';
import { RuleOperator } from './groupRulesInputs/ruleOperator/ruleOperator.component';
import { RuleValues } from './groupRulesInputs/ruleValues/ruleValues.component';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';

const DEFAULT_VALUES: IFormRule = {
	name: '',
	field: {
		operator: 'IS',
		values: [],
	},
	operator: null,
	values: [],
};

type IGroupRules = {
	rule?: IGroupRule;
	existingRules: IGroupRule[],
	onSave: (rule: IGroupRule) => void;
	onClose: () => void;
};

export const GroupRulesForm = ({ onSave, onClose, rule, existingRules = [] }: IGroupRules) => {
	const defaultValues = rule ? groupRuleToFormRule(rule) : DEFAULT_VALUES;

	const formData = useForm<IFormRule>({
		defaultValues,
		mode: 'all',
		resolver: yupResolver(GroupRuleSchema),
		context: { alreadyExistingNames: existingRules.map((r) => r.name).filter((name) => name !== rule?.name) },
	});

	const isReadOnly = TicketsCardHooksSelectors.selectReadOnly();

	const {
		formState: { isValid, errors },
		getValues,
		reset,
	} = formData;

	const getIsDirty = () => {
		const formValues = getValues();
		// @ts-ignore
		formValues.field.values = formValues.field.values.map(({ value }) => ({ value }));
		formValues.values = formValues.values.filter(({ value }) => value);
		return !isEqual(defaultValues, formValues);
	};

	const handleSave = (body: IFormRule) => onSave(formRuleToGroupRule(body));

	const handleSubmit = (e) => {
		e.preventDefault();
		e.stopPropagation();
		formData.handleSubmit(handleSave)(e);
		onClose();
	};

	useEffect(() => { reset(defaultValues); }, [rule]);

	return (
		<Form onSubmit={handleSubmit}>
			<FormProvider {...formData}>
				<InputsContainer>
					<FormTextField
						required
						name="name"
						label={formatMessage({ id: 'tickets.groups.filterPanel.name', defaultMessage: 'Name' })}
						formError={errors.name}
						disabled={isReadOnly}
					/>
					<RuleFieldOperator disabled={isReadOnly} />
					<RuleFieldValues disabled={isReadOnly} />
					<RuleOperator disabled={isReadOnly} />
					<RuleValues disabled={isReadOnly} />
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
							disabled={isReadOnly || !isValid || !getIsDirty()}
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
