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

import { formatMessage } from '@/v5/services/intl';
import { COLOR } from '@/v5/ui/themes/theme';
import { Chip } from '../chip.styles';

export enum TreatmentLevels {
	UNTREATED = 'untreated',
	PROPOSED = 'proposed',
	AGREED_PARTIAL = 'agreed_partial',
	AGREED_FULLY = 'agreed_fully',
	REJECTED = 'rejected',
	VOID = 'void',
}

const TREATMENT_LEVELS_MAP = {
	[TreatmentLevels.UNTREATED]: {
		label: formatMessage({ id: 'chip.treatmentLevel.untreated', defaultMessage: 'Untreated' }),
		colour: COLOR.BASE_LIGHT,
	},
	[TreatmentLevels.PROPOSED]: {
		label: formatMessage({ id: 'chip.treatmentLevel.proposed', defaultMessage: 'Proposed' }),
		colour: '#0288D1',
	},
	[TreatmentLevels.AGREED_PARTIAL]: {
		label: formatMessage({ id: 'chip.treatmentLevel.agreedPartial', defaultMessage: 'Agreed (Partial)' }),
		colour: '#4CAF50',
	},
	[TreatmentLevels.AGREED_FULLY]: {
		label: formatMessage({ id: 'chip.treatmentLevel.agreedFully', defaultMessage: 'Agreed (Fully)' }),
		colour: '#2E7D32',
	},
	[TreatmentLevels.REJECTED]: {
		label: formatMessage({ id: 'chip.treatmentLevel.rejected', defaultMessage: 'Rejected' }),
		colour: COLOR.ERROR_MAIN,
	},
	[TreatmentLevels.VOID]: {
		label: formatMessage({ id: 'chip.treatmentLevel.void', defaultMessage: 'Void' }),
		colour: '#000000',
	},
};

type ITreatmentLevelChip = {
	state: TreatmentLevels,
};

export const TreatmentLevelChip = ({ state }: ITreatmentLevelChip) => (
	<Chip variant="filled" {...TREATMENT_LEVELS_MAP[state]} />
);
