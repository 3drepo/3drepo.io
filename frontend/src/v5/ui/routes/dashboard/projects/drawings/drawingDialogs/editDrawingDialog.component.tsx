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
import { dirtyValuesChanged } from '@/v5/helpers/form.helper';
import { pick, isEqual } from 'lodash';
import { DrawingForm } from './drawingForm.component';
import { useEffect, useState } from 'react';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { DrawingSettings, IDrawing } from '@/v5/store/drawings/drawings.types';

interface Props { 
	open: boolean; 
	onClickClose: () => void;
	drawingId: string
}

export const EditDrawingDialog = ({ open, onClickClose, drawingId }:Props) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const [drawing, setDrawing] = useState<Partial<IDrawing>>();

	const { onSubmitError, formData } = useDrawingForm(drawing);
	const { handleSubmit, formState } = formData;

	const onSubmit: SubmitHandler<DrawingSettings> = async (body) => {
		try {
			await new Promise<void>((accept, reject) => {
				const updatedDrawingData = pick({ desc: null, ...body }, Object.keys(formState.dirtyFields));
				DrawingsActionsDispatchers.updateDrawing(teamspace, project, drawingId, updatedDrawingData, accept, reject);
			});
			onClickClose();
		} catch (err) {
			onSubmitError(err);
		}
	};

	useEffect(() => {
		let mounted = true;

		DrawingsActionsDispatchers.fetchDrawingSettings(
			teamspace,
			project,
			drawingId,
			(requestedDrawing) => {
				if (!mounted) return;
				setDrawing(requestedDrawing);
				formData.reset(requestedDrawing);
			}			
		);
	
		return () => { mounted = false; }
	}, []);

	useEffect(() => {
		if (!drawing) return;
		// Triggers the validation once the values are correctly set
		formData.trigger();
	}, [JSON.stringify(formData.getValues()) === JSON.stringify(drawing)]);

	return (
		<FormModal
			open={open}
			title={formatMessage({ id: 'drawings.edit.title', defaultMessage: 'Drawing Settings' })}
			onClickClose={!formState.isSubmitting ? onClickClose : null}
			onSubmit={handleSubmit(onSubmit)}
			confirmLabel={formatMessage({ id: 'drawings.edit.ok', defaultMessage: 'Save Drawing' })}
			maxWidth="sm"
			{...formState}
			isValid={dirtyValuesChanged(formData, drawingId) && formState.isValid}
		>
			{drawing
				? <DrawingForm formData={formData} drawing={drawing} />
				: <Loader />
			}
		</FormModal>
	);
};