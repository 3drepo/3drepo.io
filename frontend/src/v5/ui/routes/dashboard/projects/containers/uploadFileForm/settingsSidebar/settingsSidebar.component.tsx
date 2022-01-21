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
import { FormattedMessage } from 'react-intl';
import { Sidebar } from '@controls/sideBar';
import { InputLabel, MenuItem } from '@material-ui/core';
import { Controller, Control } from 'react-hook-form';
import { TypeSelect, UnitSelect, Input, RevisionTitle, FormControl } from './settingsSidebar.styles';
import { CONTAINER_TYPES, CONTAINER_UNITS } from '@/v5/store/containers/containers.types';
import { Title, TypeSelect, UnitSelect, Input, RevisionTitle, FormControl } from './settingsSidebar.styles';

type IContainerSidebar = {
	open: boolean;
	onClick: () => void;
	containerId: string;
	className?: string;
	hidden?: boolean;
	isNewContainerName?: string;
	control: Control;
};

export const SettingsSidebar = ({
	className,
	item,
	index,
	open,
	hidden,
	onClick,
	register,
	errors,
	control,
}: IContainerSidebar): JSX.Element => {
	if (!item) return <></>;
	const isNewContainer = !item.container._id;

	return (
		<Sidebar key={item.id} open={open} onClick={onClick} className={className} hidden={hidden}>
			<Title>
				{item.container.containerName}
			</Title>
			<FormControl key={item.id} disabled={!isNewContainer}>
				<InputLabel id="unit-label" shrink required>
					<FormattedMessage id="containers.creation.form.unit" defaultMessage="Units" />
				</InputLabel>
				<UnitSelect
					labelId="unit-label"
					defaultValue={item.container.unit}
					{...register(`uploads.${index}.container.unit` as const)}
				>
					{
						CONTAINER_UNITS.map((unit) => (
							<MenuItem key={unit.value} value={unit.value}>
								{unit.name}
							</MenuItem>
						))
					}
				</UnitSelect>
			</FormControl>
			<FormControl disabled={!isNewContainer}>
				<InputLabel id="type-label" shrink required>
					<FormattedMessage id="containers.creation.form.type" defaultMessage="Category" />
				</InputLabel>
				<TypeSelect
					defaultValue={item.container.type}
					labelId="type-label"
					{...register(`uploads.${index}.container.type` as const)}
				>
					{
						CONTAINER_TYPES.map((unit) => (
							<MenuItem key={unit.value} value={unit.value}>
								{unit.value}
							</MenuItem>
						))
					}
				</TypeSelect>
			</FormControl>
			<Controller
				control={control}
				name={`uploads.${index}.container.code`}
				render={({
					field,
				}) => (
					<Input
						label={formatMessage({ id: 'uploadFileForm.settingsSidebar.containerCode', defaultMessage: 'Container Code' })}
						error={!!errors.uploads?.[index]?.container?.code}
						helperText={errors.uploads?.[index]?.container?.code?.message}
						defaultValue={item.container.code}
						disabled={!isNewContainer}
						{...field}
					/>
				)}
			/>
			<Controller
				control={control}
				name={`uploads.${index}.container.desc`}
				render={({
					field,
				}) => (
					<Input
						label={formatMessage({ id: 'uploadFileForm.settingsSidebar.containerDesc', defaultMessage: 'Container Description' })}
						error={!!errors.uploads?.[index]?.container?.desc}
						helperText={errors.uploads?.[index]?.container?.desc?.message}
						defaultValue={item.container.desc}
						disabled={!isNewContainer}
						{...field}
					/>
				)}
			/>
			<RevisionTitle>
				<FormattedMessage id="uploadFileForm.settingsSidebar.revisionDetails" defaultMessage="Revision details" />
			</RevisionTitle>

			<Controller
				control={control}
				name={`uploads.${index}.revision.desc`}
				render={({
					field,
				}) => (
					<Input
						label={formatMessage({ id: 'uploadFileForm.settingsSidebar.revisionDescription', defaultMessage: 'Revision description' })}
						error={!!errors.uploads?.[index]?.revision?.desc}
						helperText={errors.uploads?.[index]?.revision?.desc?.message}
						defaultValue={item.revision.desc}
						disabled={!isNewContainer}
						{...field}
					/>
				)}
			/>
		</Sidebar>
	);
};
