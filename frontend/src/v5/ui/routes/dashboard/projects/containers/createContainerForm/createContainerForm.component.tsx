/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import React from 'react';
import { formatMessage } from '@/v5/services/intl';
import { Input, Select } from '@material-ui/core';
import { FormModal } from '@/v5/ui/controls/modal/formModal/formDialog.component';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useParams } from 'react-router';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers/containersActions.dispatchers';

interface IFormInput {
	name: string;
	unit: string;
	desc: string;
	code: string;
	type: string;
}

export const CreateContainerForm = ({ open, close }): JSX.Element => {
	const { register, handleSubmit, formState } = useForm<IFormInput>({
		mode: 'onChange',
	});
	const { teamspace, project } = useParams() as { teamspace: string, project: string };
	const onSubmit: SubmitHandler<IFormInput> = (body) => {
		ContainersActionsDispatchers.createContainer(teamspace, project, body);
		close();
	};

	return (
		<FormModal
			title={formatMessage({ id: 'containers.creation.title', defaultMessage: 'Create new container' })}
			open={open}
			onClickClose={close}
			onSubmit={handleSubmit(onSubmit)}
			isValid={formState.isValid}
		>
			<Input autoFocus fullWidth placeholder="Name" {...register('name')} />
			<Select autoWidth placeholder="Units" {...register('unit')}>
				<option selected value="mm">
					{formatMessage({
						id: 'containers.creation.unit.mm',
						defaultMessage: 'Millimetres',
					})}
				</option>
				<option value="cm">
					{formatMessage({
						id: 'containers.creation.unit.cm',
						defaultMessage: 'Centimetres',
					})}
				</option>
				<option value="dm">
					{formatMessage({
						id: 'containers.creation.unit.dm',
						defaultMessage: 'Decimetres',
					})}
				</option>
				<option value="m">
					{formatMessage({
						id: 'containers.creation.unit.m',
						defaultMessage: 'Metres',
					})}
				</option>
				<option value="ft">
					{formatMessage({
						id: 'containers.creation.unit.ft',
						defaultMessage: 'Feet and inches',
					})}
				</option>
			</Select>
			<Select placeholder="Type" {...register('type')}>
				<option value="Architectural">
					{formatMessage({
						id: 'containers.creation.type.architectural',
						defaultMessage: 'Architectural',
					})}
				</option>
				<option value="Existing">
					{formatMessage({
						id: 'containers.creation.type.existing',
						defaultMessage: 'Existing',
					})}
				</option>
				<option value="GIS">
					{formatMessage({
						id: 'containers.creation.type.gis',
						defaultMessage: 'GIS',
					})}
				</option>
				<option value="Infrastructure">
					{formatMessage({
						id: 'containers.creation.type.infrastructure',
						defaultMessage: 'Infrastructure',
					})}
				</option>
				<option value="Interior">
					{formatMessage({
						id: 'containers.creation.type.interior',
						defaultMessage: 'Interior',
					})}
				</option>
				<option value="Interior">
					{formatMessage({
						id: 'containers.creation.type.interior',
						defaultMessage: 'Interior',
					})}
				</option>
				<option value="Landscape">
					{formatMessage({
						id: 'containers.creation.type.landscape',
						defaultMessage: 'Landscape',
					})}
				</option>
				<option value="MEP">
					{formatMessage({
						id: 'containers.creation.type.mep',
						defaultMessage: 'MEP',
					})}
				</option>
				<option value="Mechanical">
					{formatMessage({
						id: 'containers.creation.type.mechanical',
						defaultMessage: 'Mechanical',
					})}
				</option>
				<option value="Structural">
					{formatMessage({
						id: 'containers.creation.type.structural',
						defaultMessage: 'Structural',
					})}
				</option>
				<option value="Survey">
					{formatMessage({
						id: 'containers.creation.type.survey',
						defaultMessage: 'Survey',
					})}
				</option>
				<option value="Other">
					{formatMessage({
						id: 'containers.creation.type.other',
						defaultMessage: 'Other',
					})}
				</option>
			</Select>
			<Input fullWidth placeholder="Description" {...register('desc')} />
			<Input fullWidth placeholder="Code" {...register('code')} />
		</FormModal>
	);
};
