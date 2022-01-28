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

import React, { useEffect } from 'react';

import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { Checkbox, InputLabel, MenuItem } from '@material-ui/core';
import { Controller, useForm } from 'react-hook-form';
import { CONTAINER_TYPES, CONTAINER_UNITS, UploadSidebarFields } from '@/v5/store/containers/containers.types';
import * as countriesAndTimezones from 'countries-and-timezones';
import { yupResolver } from '@hookform/resolvers/yup';
import { SidebarSchema } from '@/v5/validation/containers';
import { TypeSelect, UnitSelect, Input, RevisionTitle, FormControl, AnimationsCheckbox, TimezoneSelect } from './sidebarForm.styles';

type ISidebarForm = {
	className?: string;
	value: UploadSidebarFields,
	isNewContainer: boolean;
	isSpm: boolean;
	onChange: (val) => void;
};

const generateTimezoneData = () => {
	const tzList = [];
	const tzData = countriesAndTimezones.getAllTimezones();

	Object.keys(tzData).forEach((tz) => {
		const { name, utcOffset, utcOffsetStr } = tzData[tz];
		const tzToAdd = {
			name,
			label: `(UTC${utcOffsetStr}) ${name}`,
			utcOffset,
		};

		tzList.push(tzToAdd);
	});

	const allTimezones = tzList.sort((tz1, tz2) => tz1.utcOffset - tz2.utcOffset);
	return allTimezones;
};

export const SidebarForm = ({
	value,
	onChange,
	isNewContainer,
	isSpm,
}: ISidebarForm): JSX.Element => {
	const { control, formState: { errors }, getValues, setValue, trigger } = useForm<UploadSidebarFields>({
		defaultValues: value,
		mode: 'onChange',
		resolver: yupResolver(SidebarSchema),
	});

	useEffect(() => {
		trigger();
	}, []);

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

			<Controller
				control={control}
				name="importAnimations"
				render={({
					field: { ref, ...extras },
				}) => (
					<AnimationsCheckbox
						control={<Checkbox />}
						hidden={!isSpm}
						label={formatMessage({ id: 'uploadFileForm.settingsSidebar.importAnimations', defaultMessage: 'Import transformations' })}
						checked={extras.value}
						{...extras}
					/>
				)}
			/>

			<FormControl hidden={!isSpm}>
				<InputLabel id="timezone-label" shrink required>
					<FormattedMessage id="uploadFileForm.settingsSidebar.timezone" defaultMessage="Timezone" />
				</InputLabel>
				<Controller
					control={control}
					name="timezone"
					render={({
						field: { ref, ...extras },
					}) => (
						<TimezoneSelect
							labelId="timezone-label"
							{...extras}
							onChange={
								(e) => {
									setValue(e.target.name, e.target.value);
									updateValues();
								}
							}
						>
							{
								generateTimezoneData().map((unit) => (
									<MenuItem key={unit.name} value={unit.name}>
										{unit.label}
									</MenuItem>
								))
							}
						</TimezoneSelect>
					)}
				/>
			</FormControl>
		</div>
	);
};
