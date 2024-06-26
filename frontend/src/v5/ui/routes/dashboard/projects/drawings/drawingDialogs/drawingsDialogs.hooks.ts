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

import { DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { DrawingsHooksSelectors, ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { IDrawing } from '@/v5/store/drawings/drawings.types';
import { DrawingFormSchema } from '@/v5/validation/drawingSchemes/drawingSchemes';
import { nameAlreadyExists, numberAlreadyExists } from '@/v5/validation/errors.helpers';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export interface IFormInput {
	name: string;
	drawingNumber: string;
	category: string;
	desc: string
}


export const useDrawingForm = (defaultValues?: IDrawing) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const categories = DrawingsHooksSelectors.selectCategories();
	const isCategoriesPending = DrawingsHooksSelectors.selectIsCategoriesPending();
	
	const drawingsNames = [];
	const drawingNumbers = [];

	DrawingsHooksSelectors.selectDrawings().forEach((d) => {
		if (d._id === defaultValues?._id) return;
		drawingsNames.push(d.name);
		drawingNumbers.push(d.drawingNumber);
	});

	const [alreadyExistingNames, setAlreadyExistingNames] = useState(drawingsNames);
	const [alreadyExistingNumbers, setAlreadyExistingNumbers] = useState(drawingNumbers);
	
	const formData = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(DrawingFormSchema),
		context: { alreadyExistingNames, alreadyExistingNumbers },
		defaultValues,
	});

	const { getValues, setValue, trigger }  = formData;
	const onSubmitError = (err) => {
		if (nameAlreadyExists(err)) {
			setAlreadyExistingNames([getValues('name'), ...alreadyExistingNames]);
			trigger('name');
		}

		if (numberAlreadyExists(err)) {
			setAlreadyExistingNumbers([getValues('drawingNumber'), ...alreadyExistingNumbers]);
			trigger('drawingNumber');
		}
	};
	
	useEffect(() => {
		if (isCategoriesPending) return;
		if (!defaultValues?.category) {
			setValue('category', categories[0]);
		}
	}, [isCategoriesPending]);

	useEffect(() => {
		if (!isCategoriesPending) return;
		DrawingsActionsDispatchers.fetchCategories(teamspace, project);
	}, []);


	return { onSubmitError, formData };
};
