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
import { Typography } from '@controls/typography';
import { InputLabel, MenuItem } from '@material-ui/core';
import { Controller, Control } from 'react-hook-form';
import { TypeSelect, UnitSelect, Input, RevisionTitle, FormControl } from './settingsSidebar.styles';

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
			<Typography variant="h3">{item.container.name}</Typography>
			<FormControl key={item.id} disabled={!isNewContainer}>
				<InputLabel id="unit-label" shrink required>
					<FormattedMessage id="containers.creation.form.unit" defaultMessage="Units" />
				</InputLabel>
				<UnitSelect
					// value={item.container.unit}
					labelId="unit-label"
					defaultValue={item.container.unit}
					{...register(`uploads.${index}.container.unit` as const)}
				>
					<MenuItem value="mm">
						<FormattedMessage id="containers.creation.form.unit.mm" defaultMessage="Millimetres" />
					</MenuItem>
					<MenuItem value="cm">
						<FormattedMessage id="containers.creation.form.unit.cm" defaultMessage="Centimetres" />
					</MenuItem>
					<MenuItem value="dm">
						<FormattedMessage id="containers.creation.form.unit.dm" defaultMessage="Decimetres" />
					</MenuItem>
					<MenuItem value="m">
						<FormattedMessage id="containers.creation.form.unit.m" defaultMessage="Metres" />
					</MenuItem>
					<MenuItem value="ft">
						<FormattedMessage id="containers.creation.form.unit.ft" defaultMessage="Feet and inches" />
					</MenuItem>
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
					<MenuItem value="Uncategorised">
						<FormattedMessage id="containers.creation.form.type.uncategorised" defaultMessage="Uncategorised" />
					</MenuItem>
					<MenuItem value="sample">
						<FormattedMessage id="containers.creation.form.type.sample" defaultMessage="Sample" />
					</MenuItem>
					<MenuItem value="Architecture">
						<FormattedMessage id="containers.creation.form.type.architectural" defaultMessage="Architectural" />
					</MenuItem>
					<MenuItem value="Existing">
						<FormattedMessage id="containers.creation.form.type.existing" defaultMessage="Existing" />
					</MenuItem>
					<MenuItem value="GIS">
						<FormattedMessage id="containers.creation.form.type.gis" defaultMessage="GIS" />
					</MenuItem>
					<MenuItem value="Infrastructure">
						<FormattedMessage id="containers.creation.form.type.infrastructure" defaultMessage="Infrastructure" />
					</MenuItem>
					<MenuItem value="Interior">
						<FormattedMessage id="containers.creation.form.type.interior" defaultMessage="Interior" />
					</MenuItem>
					<MenuItem value="Landscape">
						<FormattedMessage id="containers.creation.form.type.ladscape" defaultMessage="Landscape" />
					</MenuItem>
					<MenuItem value="MEP">
						<FormattedMessage id="containers.creation.form.type.mep" defaultMessage="MEP" />
					</MenuItem>
					<MenuItem value="Mechanical">
						<FormattedMessage id="containers.creation.form.type.mechanical" defaultMessage="Mechanical" />
					</MenuItem>
					<MenuItem value="Structural">
						<FormattedMessage id="containers.creation.form.type.structural" defaultMessage="Structural" />
					</MenuItem>
					<MenuItem value="Survey">
						<FormattedMessage id="containers.creation.form.type.survey" defaultMessage="Survey" />
					</MenuItem>
					<MenuItem value="Other">
						<FormattedMessage id="containers.creation.form.type.other" defaultMessage="Other" />
					</MenuItem>
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
						error={!!errors.code}
						helperText={errors.code?.message}
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
						error={!!errors.desc}
						helperText={errors.desc?.message}
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
						error={!!errors.desc}
						helperText={errors.desc?.message}
						disabled={!isNewContainer}
						{...field}
					/>
				)}
			/>
		</Sidebar>
	);
};
