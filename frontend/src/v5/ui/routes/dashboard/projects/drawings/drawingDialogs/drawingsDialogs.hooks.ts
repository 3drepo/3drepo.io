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
import { DrawingSettings, IDrawing } from '@/v5/store/drawings/drawings.types';
import { DrawingFormSchema } from '@/v5/validation/drawingSchemes/drawingSchemes';
import { nameAlreadyExists, numberAlreadyExists } from '@/v5/validation/errors.helpers';
import { yupResolver } from '@hookform/resolvers/yup';
import { get } from 'lodash';
import { useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';

export const watchVerticalRange = (formData:  UseFormReturn<any>, prefix: string = '') => {
	const { trigger, watch, formState: { dirtyFields } } = formData;
	let verticalRangeField =  prefix +  'calibration.verticalRange';
	const verticalRange = watch(verticalRangeField);
	
	useEffect(() => {
		if (get(dirtyFields, verticalRangeField)?.some((v) => v)) {
			trigger(verticalRangeField);
		}
	}, [verticalRange?.[0], verticalRange?.[1], dirtyFields]);
};

export const useDrawingForm = (defaultValues?: Partial<IDrawing>) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const types = DrawingsHooksSelectors.selectTypes();
	const isTypesPending = DrawingsHooksSelectors.selectIsTypesPending();
	const isAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();

	const allDrawings = DrawingsHooksSelectors.selectDrawings();
	
	// TODO: change type from array to set in every schema that uses name
	const [existingNames, setExistingNames] = useState([]);  

	const [existingNumbers, setExistingNumbers] = useState<Set<string>>(new Set()); 

	useEffect(() => {
		const names = [];
		const numbers = new Set<string>();

		allDrawings.forEach((d) => {
			if (d._id === defaultValues?._id || !defaultValues) return;
			names.push(d.name.toLowerCase());
			numbers.add(d.number.toLowerCase());
		});

		setExistingNames(names);
		setExistingNumbers(numbers);
	}, [JSON.stringify(defaultValues), allDrawings]);


	const formData = useForm<DrawingSettings>({
		mode: 'onChange',
		resolver: yupResolver(DrawingFormSchema),
		context: { alreadyExistingNames: existingNames, existingNumbers },
		defaultValues,
	});

	const { getValues, setValue, trigger }  = formData;

	const onSubmitError = (err) => {
		if (nameAlreadyExists(err)) {
			setExistingNames([getValues('name'), ...existingNames]);
			trigger('name');
		}

		if (numberAlreadyExists(err)) {
			setExistingNumbers(existingNumbers.add(getValues('number')));
			trigger('number');
		}
	};
	
	watchVerticalRange(formData);

	useEffect(() => {
		if (isTypesPending || !isAdmin) return;
		if (!defaultValues?.type) {
			setValue('type', types[0]);
		}
	}, [isTypesPending, isAdmin]);

	useEffect(() => {
		if (!isTypesPending || !isAdmin) return;
		DrawingsActionsDispatchers.fetchTypes(teamspace, project);
	}, [isAdmin]);

	return { onSubmitError, formData };
};


