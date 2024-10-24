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

import { formatMessage } from '@/v5/services/intl';
import { SubmitHandler } from 'react-hook-form';
import { FormModal } from '@controls/formModal/formModal.component';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useDrawingForm } from './drawingsDialogs.hooks';
import { DrawingForm } from './drawingForm.component';
import { DEFAULT_SETTINGS_CALIBRATION } from '../../calibration/calibration.helpers';
import { DrawingSettings } from '@/v5/store/drawings/drawings.types';

export const CreateDrawingDialog = ({ open, onClickClose }) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();

	const { onSubmitError, formData } = useDrawingForm({ calibration: DEFAULT_SETTINGS_CALIBRATION } as any);
	const { handleSubmit, formState } = formData;

	const onSubmit: SubmitHandler<DrawingSettings> = async (body) => {
		try {
			await new Promise<void>((accept, reject) => DrawingsActionsDispatchers.createDrawing(teamspace, project, body as any, accept, reject));
			onClickClose();
		} catch (err) {
			onSubmitError(err);
		}
	};

	return (
		<FormModal
			open={open}
			title={formatMessage({ id: 'drawings.creation.title', defaultMessage: 'Create new Drawing' })}
			onClickClose={!formState.isSubmitting ? onClickClose : null}
			onSubmit={handleSubmit(onSubmit)}
			confirmLabel={formatMessage({ id: 'drawings.creation.ok', defaultMessage: 'Create Drawing' })}
			maxWidth="sm"
			{...formState}
		>
			<DrawingForm formData={formData} />
		</FormModal>
	);
};