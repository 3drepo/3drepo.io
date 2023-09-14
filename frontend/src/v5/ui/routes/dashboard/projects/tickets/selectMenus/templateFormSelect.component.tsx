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

import { MenuItem } from '@mui/material';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormSelect } from '@controls/inputs/formInputs.component';
import { formatMessage } from '@/v5/services/intl';
import { sortByName } from '@/v5/store/store.helpers';
import { openUnsavedNewTicketWarningModal } from './selectMenus.helpers';

type TemplateFormSelectProps = { isNewTicketOpen?: boolean, name: string };
export const TemplateFormSelect = ({ isNewTicketOpen, ...props }: TemplateFormSelectProps) => {
	const templates = ProjectsHooksSelectors.selectCurrentProjectTemplates();

	const handleOpen = () => {
		if (!isNewTicketOpen) return;
		openUnsavedNewTicketWarningModal();
	};

	return (
		<FormSelect
			label={formatMessage({ id: 'tickets.select.template', defaultMessage: 'Select Ticket type' })}
			renderValue={(val) => {
				if (!val) return '';
				const { name } = templates.find(({ _id }) => _id === val);
				return (<b>{name}</b>);
			}}
			{...props}
			onOpen={handleOpen}
		>
			{sortByName(templates).map(({ _id, name }) => (<MenuItem key={_id} value={_id}>{name}</MenuItem>))}
		</FormSelect>
	);
};
