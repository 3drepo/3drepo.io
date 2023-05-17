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
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormTextField } from '@controls/inputs/formInputs.component';
import { useForm } from 'react-hook-form';

type IFormInput = {
	title: string;
};

type IGroupSettingsForm = {
	defaultValues?: any;
};

export const GroupSettingsForm = ({ defaultValues }: IGroupSettingsForm) => {
	const {
		handleSubmit,
		getValues,
		trigger,
		control,
		formState,
		formState: { errors },
	} = useForm<IFormInput>({
		mode: 'onChange',
		// resolver: yupResolver(CreateContainerSchema), TODO Create Resolver
		defaultValues,
	});
	const isAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	return (
		<div>
			<FormTextField
				control={control}
				name="title"
				label={formatMessage({
					id: 'ticketsGroupSettings.form.label',
					defaultMessage: 'Label',
				})}
				required
				formError={errors.label}
				disabled={!isAdmin}
			/>
		</div>
	);
};
