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
import { formatMessage } from '@/v5/services/intl';
import { ContainersHooksSelectors, FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { sortByName } from '@/v5/store/store.helpers';
import { ListSubheader } from './modelSelect.styles';
import { MenuItem } from '@mui/material';
import { MultiSelectMenuItem } from '@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { FormSearchSelect } from '@controls/inputs/formInputs.component';
import { InputControllerProps } from '@controls/inputs/inputController.component';
import { SelectProps } from '@controls/inputs/select/select.component';

export type ModelSelectProps = InputControllerProps<SelectProps>;
export const ModelSelect = ({ multiple, ...props }: ModelSelectProps) => {
	const containers = ContainersHooksSelectors.selectContainers();
	const federations = FederationsHooksSelectors.selectFederations();

	const ListItem = multiple ? MultiSelectMenuItem : MenuItem;

	return (
		<FormSearchSelect
			multiple={multiple}
			label={formatMessage({ id: 'modelSelect.placeholder', defaultMessage: 'Select Federation / Container' })}
			{...props}
		>
			<ListSubheader>
				<FormattedMessage id="modelSelect.federations" defaultMessage="Federations" />
			</ListSubheader>
			{...sortByName(federations).map(({ name, _id }) => (
				<ListItem key={_id} value={_id}>{name}</ListItem>
			))}
			<ListSubheader>
				<FormattedMessage id="modelSelect.containers" defaultMessage="Containers" />
			</ListSubheader>
			{...sortByName(containers).map(({ name, _id }) => (
				<ListItem key={_id} value={_id}>{name}</ListItem>
			))}
		</FormSearchSelect>
	);
};
