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

import * as Yup from 'yup';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { InputLabel, MenuItem } from '@material-ui/core';
import { Controller, useForm } from 'react-hook-form';
import { CONTAINER_TYPES, CONTAINER_UNITS, UploadSidebarFields } from '@/v5/store/containers/containers.types';
import { yupResolver } from '@hookform/resolvers/yup';
import { TypeSelect, UnitSelect, Input, RevisionTitle, FormControl } from './sidebarForm.styles';

type ISidebarForm = {
	className?: string;
	value: UploadSidebarFields,
	isNewContainer: boolean;
	onChange: (val) => void;
};

export const SidebarSchema = Yup.object().shape({
	unit: Yup.string().required().default('mm'),
	type: Yup.string().required().default('Uncategorised'),
	containerCode: Yup.string()
		.max(50,
			formatMessage({
				id: 'containers.creation.code.error.max',
				defaultMessage: 'Code is limited to 50 characters',
			}))
		.matches(/^[A-Za-z0-9]*$/,
			formatMessage({
				id: 'containers.creation.code.error.characters',
				defaultMessage: 'Code can only consist of letters and numbers',
			})),
	containerDesc: Yup.string()
		.max(50,
			formatMessage({
				id: 'containers.creation.description.error.max',
				defaultMessage: 'Container Description is limited to 50 characters',
			})),
	revisionDesc: Yup.string()
		.max(50,
			formatMessage({
				id: 'uploadSidebar.revisionDesc.error.max',
				defaultMessage: 'Revision Description is limited to 50 characters',
			})),
});

export const SidebarForm = ({
	value,
	onChange,
	isNewContainer,
}: ISidebarForm): JSX.Element => {
	const { control, formState: { errors }, getValues, setValue } = useForm({
		defaultValues: value,
		mode: 'onChange',
		resolver: yupResolver(SidebarSchema),
	});

	const updateValues = () => {
		onChange(getValues());
	};

	return (
		<div onChange={updateValues}>
			<FormControl disabled={!isNewContainer}>
				<InputLabel id="unit-label" shrink required>
					<FormattedMessage id="containers.creation.form.unit" defaultMessage="Units" />
				</InputLabel>
				<Controller
					control={control}
					name="containerUnit"
					render={({
						field: { ref, ...extras },
					}) => (
						<UnitSelect
							labelId="unit-label"
							disabled={!isNewContainer}
							{...extras}
							onChange={
								(e) => {
									setValue(e.target.name, e.target.value);
									updateValues();
								}
							}
						>
							{
								CONTAINER_UNITS.map((unit) => (
									<MenuItem key={unit.value} value={unit.value}>
										{unit.name}
									</MenuItem>
								))
							}
						</UnitSelect>
					)}
				/>
			</FormControl>
			<FormControl disabled={!isNewContainer}>
				<InputLabel id="type-label" shrink required>
					<FormattedMessage id="containers.creation.form.type" defaultMessage="Category" />
				</InputLabel>

				<Controller
					control={control}
					name="containerType"
					render={({
						field: { ref, ...extras },
					}) => (
						<TypeSelect
							labelId="type-label"
							disabled={!isNewContainer}
							{...extras}
							onChange={
								(e) => {
									setValue(e.target.name, e.target.value);
									updateValues();
								}
							}
						>
							{
								CONTAINER_TYPES.map((type) => (
									<MenuItem key={type.value} value={type.value}>
										{type.value}
									</MenuItem>
								))
							}
						</TypeSelect>
					)}
				/>
			</FormControl>
			<Controller
				control={control}
				name="containerCode"
				render={({
					field: { ref, ...extras },
				}) => (
					<Input
						label={formatMessage({ id: 'uploadFileForm.settingsSidebar.containerCode', defaultMessage: 'Container Code' })}
						error={!!errors.containerCode}
						helperText={errors.containerCode?.message}
						disabled={!isNewContainer}
						{...extras}
					/>
				)}
			/>
			<Controller
				control={control}
				name="containerDesc"
				render={({
					field: { ref, ...extras },
				}) => (
					<Input
						label={formatMessage({ id: 'uploadFileForm.settingsSidebar.containerDesc', defaultMessage: 'Container Description' })}
						error={!!errors.containerDesc}
						helperText={errors.containerDesc?.message}
						disabled={!isNewContainer}
						{...extras}
					/>
				)}
			/>
			<RevisionTitle>
				<FormattedMessage id="uploadFileForm.settingsSidebar.revisionDetails" defaultMessage="Revision details" />
			</RevisionTitle>

			<Controller
				control={control}
				name="revisionDesc"
				render={({
					field: { ref, ...extras },
				}) => (
					<Input
						label={formatMessage({ id: 'uploadFileForm.settingsSidebar.revisionDesc', defaultMessage: 'Revision Description' })}
						error={!!errors.revisionDesc}
						helperText={errors.revisionDesc?.message}
						{...extras}
					/>
				)}
			/>
		</div>
	);
};
