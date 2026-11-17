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

import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { GroupRuleSchema } from '@/v5/validation/groupSchemes/groupSchemes';
import * as Yup from 'yup';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { InputAdornment } from '@mui/material';
import { IGroupRule } from '@/v5/store/tickets/tickets.types';
import { Container, TextField, Button, CloseIcon } from './rulesField.styles';
import { groupRuleToFormRule } from '../../../groupRulesForm/groupRulesForm.helpers';

const validateRules = (rules: IGroupRule[]) => Yup.array(GroupRuleSchema).min(1).validateSync(rules.map(groupRuleToFormRule));

const resolver = Yup.object({
	rules: Yup.string().test(
		'invalidRules',
		formatMessage({
			id: 'tickets.groups.newGroupForm.rules.paste.error',
			defaultMessage: 'Invalid filters',
		}),
		(value) => {
			try {
				validateRules(JSON.parse(value));
				return true;
			} catch (e) {
				return false;
			}
		},
	),
});

export const RulesField = ({ onSubmit: onSave, onClose }) => {
	const {
		getValues,
		control,
		formState: { isValid, errors },
	} = useForm<{ rules: string }>({
		mode: 'all',
		resolver: yupResolver(resolver),
	});

	const handlePaste = (event) => {
		event.preventDefault();
		try {
			const newRules = JSON.parse(event.clipboardData.getData('text'));
			validateRules(newRules);
			onSave(newRules);
		} catch (error) {
			DialogsActionsDispatchers.open('alert', {
				currentActions: formatMessage({
					id: 'tickets.groups.newGroupForm.rules.paste.error',
					defaultMessage: 'trying to paste the filters',
				}),
				error,
			});
			onClose();
		}
	};

	const handleSave = () => onSave(JSON.parse(getValues('rules')));

	return (
		<Container>
			<TextField
				name="rules"
				control={control}
				placeholder={formatMessage({
					id: 'tickets.groups.newGroupForm.rules.paste.placeholder',
					defaultMessage: 'Paste filters here',
				})}
				onPaste={handlePaste}
				formError={errors.rules}
				InputProps={{
					endAdornment: (
						<InputAdornment position="end" onClick={onClose}>
							<CloseIcon />
						</InputAdornment>
					),
				}}
			/>
			<Button disabled={!isValid} onClick={handleSave}>
				<FormattedMessage
					id="tickets.groups.newGroupForm.rules.save"
					defaultMessage="Save"
				/>
			</Button>
		</Container>
	);
};
