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
import { has, isEmpty, isEqual } from 'lodash';
import { ContainersHooksSelectors, FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Buttons, Form, InputsContainer } from './groupRulesForm.styles';
import { IFormRule, formRuleToGroupRule, groupRuleToFormRule } from './groupRulesForm.helpers';
import { RuleFieldValues } from './groupRulesInputs/ruleFieldValues/ruleFieldValues.component';
import { RuleFieldOperator } from './groupRulesInputs/ruleFieldOperator/ruleFieldOperator.component';
import { RuleOperator } from './groupRulesInputs/ruleOperator/ruleOperator.component';
import { RuleValues } from './groupRulesInputs/ruleValues/ruleValues.component';
import { mapArrayToFormArray } from '@/v5/helpers/form.helper';

const DEFAULT_RULE: IGroupRule = {
	name: '',
	field: {
		operator: 'IS',
		values: [],
	},
	operator: null,
	values: [],
};

const isNonEmptyElement = (item) => !(!item || (has(item, 'value') && !item.value)); 
const getDirtyFields = (defaultValues: IFormRule, currentValues: IFormRule) => {
	const dirtyFields = [];
	const findDifferentFields = (defaultObj = {}, dirtyObj = {}, prefix = []) => {
		Object.keys(defaultObj).forEach((key) => {
			const defaultObjVal = defaultObj[key];
			const dirtyObjVal = dirtyObj[key];
			const currentPath = [...prefix, key];

			switch (key) {
				case 'field':
					findDifferentFields(defaultObjVal, dirtyObjVal, currentPath);
					break;
				case 'values':
					if (!isEqual(defaultObjVal.filter(isNonEmptyElement), dirtyObjVal.filter(isNonEmptyElement))) {
						dirtyFields.push([currentPath.join('.'), mapArrayToFormArray(dirtyObjVal)]);
					}
					break;
				default:
					if (!isEqual(defaultObjVal, dirtyObjVal)) {
						dirtyFields.push([currentPath.join('.'), dirtyObjVal]);
					}
			}
		});
	};
	findDifferentFields(defaultValues, currentValues);
	return dirtyFields;
};

type IGroupRules = {
	containerOrFederation: string;
	rule?: IGroupRule;
	existingRules: IGroupRule[];
	// An object that includes the fields to change as soon as the form is initiated to
	// mark them as dirty 
	dirtyRule?: IGroupRule;
	onSubmit?: (rule: IGroupRule) => void;
	onClose?: (currentFormValues: IGroupRule) => void;
};

export const GroupRulesForm = ({ onClose, onSubmit, rule, existingRules = [], containerOrFederation, dirtyRule }: IGroupRules) => {
	const defaultValues = groupRuleToFormRule(rule ?? DEFAULT_RULE);

	const formData = useForm<IFormRule>({
		defaultValues,
		mode: 'all',
		resolver: yupResolver(GroupRuleSchema),
		context: { alreadyExistingNames: existingRules.map((r) => r.name).filter((name) => name !== rule?.name) },
	});

	const isCommenterContainer = ContainersHooksSelectors.selectHasCommenterAccess(containerOrFederation);
	const isCommenterFederation = FederationsHooksSelectors.selectHasCommenterAccess(containerOrFederation);
	const isReadOnly = !(isCommenterContainer || isCommenterFederation); // Cannot use tickets redux state readOnly because groups card also uses this

	const {
		formState: { isValid, errors },
		getValues,
		reset,
		setValue,
	} = formData;

	const getIsDirty = () => {
		const formValues = getValues();
		const cleanValuesForComparison = (obj: IFormRule) => ({
			...obj,
			field: {
				...obj.field,
				values: obj.field.values.map(({ value }) => ({ value })),
			},
			values: obj.values.filter(({ value }) => value),
		});
		return !isEqual(cleanValuesForComparison(defaultValues), cleanValuesForComparison(formValues));
	};

	const handleSave = (body: IFormRule) => onSubmit(formRuleToGroupRule(body));

	const handleSubmit = (e) => {
		e.preventDefault();
		e.stopPropagation();
		formData.handleSubmit(handleSave)(e);
	};

	useEffect(() => {
		reset(defaultValues);
	}, [rule]);

	useEffect(() => {
		if (isEmpty(dirtyRule)) return;
		getDirtyFields(defaultValues, groupRuleToFormRule(dirtyRule)).forEach(([fieldName, fieldValue]: [any, any]) => {
			setValue(fieldName, fieldValue, { shouldDirty: true, shouldValidate: true });
		});
	}, [JSON.stringify(dirtyRule)]);

	useEffect(() => () => {
		onClose?.(formRuleToGroupRule(getValues()));
	}, []);

	return (
		<Form onSubmit={handleSubmit}>
			<FormProvider {...formData}>
				<InputsContainer>
					<FormTextField
						required
						autoFocus
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
						<Button variant="text" color="secondary">
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
