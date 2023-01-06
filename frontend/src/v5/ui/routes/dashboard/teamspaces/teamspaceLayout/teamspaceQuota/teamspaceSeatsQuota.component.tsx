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
import SeatsIcon from '@assets/icons/filled/seats-filled.svg';
import { WarningIcon, QuotaValuesContainer } from './teamspaceQuota.styles';

type SeatsInfoProps = {
	seats: QuotaUnit;
};

const SeatsQuotaText = ({ seats }: SeatsInfoProps) => {
	if (isQuotaUnitUnlimited(seats)) {
		return (
			<FormattedMessage
				id="teamspace.quota.unlimitedSeats"
				defaultMessage="Unlimited seats"
			/>
		);
	}

	return (
		<FormattedMessage
			id="teamspace.quota.seats"
			defaultMessage="{available, plural, one {{used} of # seat assigned} other {{used} of # seats assigned}}"
			values={seats}
		/>
	);
};

export const SeatsQuota = ({ seats }: SeatsInfoProps) => {
	const Icon = isQuotaUnitCapped(seats) ? WarningIcon : SeatsIcon;
	return (
		<QuotaValuesContainer $disabled={isQuotaUnitUnlimited(seats)} $error={isQuotaUnitCapped(seats)}>
			<Icon /><SeatsQuotaText seats={seats} />
		</QuotaValuesContainer>
	);
};
