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

import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import { ContainersHooksSelectors, DrawingsHooksSelectors, FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { sortByName } from '@/v5/store/store.helpers';
import { MenuItem, Select } from '@mui/material';
import { ListSubheader } from '../../../tickets/selectMenus/selectMenus.styles';
import { CalibrationParams } from '@/v5/ui/routes/routes.constants';
import { useContext, useEffect } from 'react';
import { CalibrationContext } from '../../calibrationContext';
import { useParams } from 'react-router';
import { SearchSelect } from '@controls/searchSelect/searchSelect.component';

export const SelectModelStep = ({ modelId, setModelId }) => {
	const { drawing } = useParams<CalibrationParams>();
	const { setIsStepValid } = useContext(CalibrationContext);
	const selectedDrawing = DrawingsHooksSelectors.selectDrawingById(drawing);
	const containers = ContainersHooksSelectors.selectContainers().filter((c) => !!c.latestRevision);
	const federations = FederationsHooksSelectors.selectFederations().filter((f) => f.containers?.length);

	useEffect(() => { setIsStepValid(!!modelId); }, [modelId]);

	return (
		<>
			<Select label="drawing" defaultValue={selectedDrawing.name} disabled>
				<MenuItem value={selectedDrawing.name} selected>{selectedDrawing.name}</MenuItem>
			</Select>
			<SearchSelect
				label={formatMessage({ id: 'calibration.modelSelection.placeholder', defaultMessage: 'Select Federation / Container' })}
				value={modelId}
				onChange={({ target: { value } }) => setModelId(value)}
			>
				<ListSubheader>
					<FormattedMessage id="calibration.modelSelection.federations" defaultMessage="Federations" />
				</ListSubheader>
				{...sortByName(federations).map(({ name, _id }) => (
					<MenuItem key={_id} value={_id}>{name}</MenuItem>
				))}
				<ListSubheader>
					<FormattedMessage id="calibration.modelSelection.containers" defaultMessage="Containers" />
				</ListSubheader>
				{...sortByName(containers).map(({ name, _id }) => (
					<MenuItem key={_id} value={_id}>{name}</MenuItem>
				))}
			</SearchSelect>
		</>
	);
};
