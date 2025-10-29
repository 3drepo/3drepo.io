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

import { ContainersHooksSelectors, FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { sortByName } from '@/v5/store/store.helpers';
import { openUnsavedNewTicketWarningModal } from './selectMenus.helpers';
import { formatMessage } from '@/v5/services/intl';
import { SearchSelect } from '@controls/searchSelect/searchSelect.component';
import { SelectProps } from '@controls/inputs/select/select.component';
import { InputControllerProps, InputController } from '@controls/inputs/inputController.component';
import { FormattedMessage } from 'react-intl';
import { MultiSelectMenuItem } from '@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { ListSubheader } from './selectMenus.styles';
import { useEffect } from 'react';

type ContainersAndFederationsSelectProps = { isNewTicketDirty?: boolean } & SelectProps;
export const ContainersAndFederationsSelect = ({ isNewTicketDirty, onChange, ...props }: ContainersAndFederationsSelectProps) => {
	const containers = ContainersHooksSelectors.selectContainers();
	const federations = FederationsHooksSelectors.selectFederations();
	const containersAndFederations = [...containers, ...federations];

	const getRenderText = (ids: any[] | null = []) => {
		const selectedContainersOrFederations = containersAndFederations.filter(({ _id }) => ids.includes(_id));
		const itemsLength = selectedContainersOrFederations.length;

		if (itemsLength === 1) {
			return selectedContainersOrFederations[0].name;
		}

		return formatMessage({
			id: 'ticketTable.modelSelection.selected',
			defaultMessage: '{itemsLength} selected',
		}, { itemsLength });
	};

	const handleOpen = () => {
		if (!isNewTicketDirty) return;
		openUnsavedNewTicketWarningModal();
	};

	useEffect(() => {
		if (containersAndFederations.length === 1) {
			onChange?.({ target: { value: [containersAndFederations[0]._id] } });
		}
	}, [containersAndFederations.length]);

	return (
		<SearchSelect
			multiple
			{...props}
			label={formatMessage({ id: 'ticketTable.modelSelection.placeholder', defaultMessage: 'Select Federation / Container' })}
			renderValue={(ids: any[] | null = []) => (<b>{getRenderText(ids)}</b>)}
			onChange={onChange}
			onOpen={handleOpen}
		>
			<ListSubheader>
				<FormattedMessage id="ticketTable.modelSelection.federations" defaultMessage="Federations" />
			</ListSubheader>
			{...sortByName(federations).map(({ name, _id }) => (
				<MultiSelectMenuItem key={_id} value={_id}>{name}</MultiSelectMenuItem>
			))}
			<ListSubheader>
				<FormattedMessage id="ticketTable.modelSelection.containers" defaultMessage="Containers" />
			</ListSubheader>
			{...sortByName(containers).map(({ name, _id }) => (
				<MultiSelectMenuItem key={_id} value={_id}>{name}</MultiSelectMenuItem>
			))}
		</SearchSelect>
	);
};

export  const ContainersAndFederationsFormSelect = (props: InputControllerProps<SelectProps>) => (<InputController Input={ContainersAndFederationsSelect} {...props} />);