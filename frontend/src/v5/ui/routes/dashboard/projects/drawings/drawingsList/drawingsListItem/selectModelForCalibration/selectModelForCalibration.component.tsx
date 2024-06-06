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

import { useHistory } from 'react-router-dom';
import { FormModal } from '@controls/formModal/formModal.component';
import { ListSubheader, MenuItem } from '@mui/material';
import { DrawingsHooksSelectors, ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { formatMessage } from '@/v5/services/intl';
import { TextField } from '@controls/inputs/textField/textField.component';
import { FormattedMessage } from 'react-intl';
import { sortByName } from '@/v5/store/store.helpers';
import { useContainersData } from '../../../../containers/containers.hooks';
import { useFederationsData } from '../../../../federations/federations.hooks';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { Gap } from '@controls/gap';
import { FormSearchSelect } from '@controls/inputs/formInputs.component';
import { useForm } from 'react-hook-form';
import { viewerRoute } from '@/v5/services/routing/routing';
import { appendSearchParams } from '@/v5/helpers/url.helper';

export const SelectModelForCalibration = ({ drawingId, onClickClose, ...props }) => {
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const selectedDrawing = DrawingsHooksSelectors.selectDrawingById(drawingId);
	const history = useHistory();
	const containersData = useContainersData();
	const federationsData = useFederationsData();
	const { handleSubmit, control, watch } = useForm();
	const model = watch('model');
	
	const isLoadingModels = containersData.isListPending || federationsData.isListPending;
	const containers = containersData.containers.filter((c) => !!c.latestRevision);
	const federations = federationsData.federations.filter((f) => f.containers?.length);

	const onSubmit = () => {
		const path = viewerRoute(teamspace, project, model, false, { drawingId, isCalibrating: true });
		history.push(path);
		onClickClose();
	};

	return (
		<FormModal
			title={formatMessage({ id: 'calibration.title', defaultMessage: 'Select Federation / Container' })}
			onSubmit={handleSubmit(onSubmit)}
			confirmLabel={formatMessage({ id: 'calibration.button.ok', defaultMessage: 'Calibrate' })}
			isValid={!!model}
			onClickClose={onClickClose}
			{...props}
		>
			<TextField
				label={formatMessage({ id: 'calibration.drawing.label', defaultMessage: 'Drawing' })}
				value={selectedDrawing.name}
				disabled
			/>
			{isLoadingModels ? (
				<>
					<Gap $height='35px' />
					<Loader />
				</>
			 ) : (
				<FormSearchSelect
					control={control}
					label={formatMessage({ id: 'calibration.modelSelection.label', defaultMessage: 'Federation / Container' })}
					value={model}
					name="model"
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
				</FormSearchSelect>
			)}
		</FormModal>
	);
};