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

import { useContext, useEffect, useRef } from 'react';
import { CalibrationContext } from '../calibrationContext';
import { Select } from '@controls/inputs/select/select.component';
import { useParams } from 'react-router';
import { CalibrationParams } from '@/v5/ui/routes/routes.constants';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { ModelSelect } from '@components/shared/modelSelect/modelSelect.component';


const ModelSelectionStep = () => {
	const { setIsStepValid } = useContext(CalibrationContext);
	const { watch } = useFormContext();
	const containerOrFederation = watch('containerOrFederation');

	useEffect(() => {
		setIsStepValid(!!containerOrFederation);
	}, [containerOrFederation]);

	return (
		<>
			<Select name='drawing' disabled label="drawing" />
			<ModelSelect name='containerOrFederation' />
		</>
	);
};

export const CalibrationStep = () => {
	const { drawing, containerOrFederation = '' } = useParams<CalibrationParams>();
	const { step } = useContext(CalibrationContext);
	const previousStep = useRef(step);
	const formData = useForm({
		defaultValues: {
			drawing,
			containerOrFederation,
		},
	});

	useEffect(() => {
		if (previousStep.current === 0 && step === 1) {
			// push containerOrFederation to URL
		}

		if (previousStep.current === 1 && step === 0) {
			// remove containerOrFederation to URL
		}
	}), [step];

	if (step === 0) return (
		<FormProvider {...formData}>
			<ModelSelectionStep />
		</FormProvider>
	);

	if (step === 1) return <div>1</div>;
	if (step === 2) return <div>2</div>;
	if (step === 3) return <div>3</div>;
	return <div>4</div>;
};