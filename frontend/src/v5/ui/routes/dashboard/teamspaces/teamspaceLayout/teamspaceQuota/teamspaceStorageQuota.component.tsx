/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { isQuotaUnitCapped, isQuotaUnitUnlimited } from '@/v5/store/teamspaces/teamspaces.helpers';
import { QuotaUnit } from '@/v5/store/teamspaces/teamspaces.redux';
import { FormattedMessage } from 'react-intl';

import StorageIcon from '@assets/icons/filled/storage-filled.svg';
import { formatInfoUnit } from '@/v5/helpers/intl.helper';
import { QuotaValuesContainer, WarningIcon } from './teamspaceQuota.styles';

type StorageQuotaProps = {
	storage: QuotaUnit;
};

const StorageQuotaText = ({ storage }: StorageQuotaProps) => {
	if (isQuotaUnitUnlimited(storage)) {
		return (
			<FormattedMessage
				id="teamspace.quota.unlimitedStorage"
				defaultMessage="Unlimited storage"
			/>
		);
	}

	const available = formatInfoUnit(storage.available as number);
	const used = formatInfoUnit(storage.used);

	return (
		<FormattedMessage
			id="teamspace.info.storage"
			defaultMessage="{used} of {available} used"
			values={{ used, available }}
		/>
	);
};

export const StorageQuota = ({ storage }: StorageQuotaProps) => {
	const Icon = isQuotaUnitCapped(storage) ? WarningIcon : StorageIcon;
	return (
		<QuotaValuesContainer $disabled={isQuotaUnitUnlimited(storage)} $error={isQuotaUnitCapped(storage)}>
			<Icon /><StorageQuotaText storage={storage} />
		</QuotaValuesContainer>
	);
};
