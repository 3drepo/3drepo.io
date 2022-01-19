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

import { yupResolver } from '@hookform/resolvers/yup';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { Sidebar } from '@controls/sideBar';
import { Typography } from '@controls/typography';
import { InputLabel, MenuItem } from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { ContainerSchema, IFormInput as IContainerForm } from '../../createContainerForm/createContainerForm.component';
import { TypeSelect, UnitSelect, Input, RevisionTitle, FormControl } from './settingsSidebar.styles';

type IContainerSidebar = {
	isOpen: boolean;
	onClick: () => void;
	containerId: string;
	className?: string;
	hidden?: boolean;
	newContainerName?: string;
};

type IRevisionForm = IContainerForm & {
	revisionDesc: string;
};

export const SettingsSidebar = ({ className, isOpen, onClick, revision }: IContainerSidebar): JSX.Element => {
	const { register, formState: { errors } } = useForm<IRevisionForm>({
		mode: 'onChange',
		resolver: yupResolver(ContainerSchema),
	});

	if (!revision) return <></>;

	const newContainer = !revision.container._id;
	return (
		<Sidebar isOpen={isOpen} onClick={onClick} className={className}>
			<Typography variant="h3">{revision.container.name}</Typography>
			<FormControl disabled={!newContainer}>
				<InputLabel id="unit-label" shrink required>
					<FormattedMessage id="containers.creation.form.unit" defaultMessage="Units" />
				</InputLabel>
				<UnitSelect
					value={revision.container.unit}
					labelId="unit-label"
					defaultValue="mm"
					{...register('unit')}
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
			<FormControl disabled={!newContainer}>
				<InputLabel id="type-label" shrink required>
					<FormattedMessage id="containers.creation.form.type" defaultMessage="Category" />
				</InputLabel>
				<TypeSelect
					value={revision.container.type}
					defaultValue="Uncategorised"
					labelId="type-label"
					{...register('type')}
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
			<Input
				label={formatMessage({ id: 'containers.creation.form.code', defaultMessage: 'Container Code' })}
				error={!!errors.code}
				helperText={errors.code?.message}
				{...register('code')}
				value={revision.container.code}
				disabled={!newContainer}
			/>
			<Input
				label={formatMessage({ id: 'containers.creation.form.description', defaultMessage: 'Container Description' })}
				error={!!errors.desc}
				helperText={errors.desc?.message}
				{...register('desc')}
				value={revision.container.desc}
				disabled={!newContainer}
			/>
			<RevisionTitle>
				<FormattedMessage id="uploadFileForm.settingsSidebar.revisionDetails" defaultMessage="Revision details" />
			</RevisionTitle>
			<Input
				label={formatMessage({ id: 'uploadFileForm.settingsSidebar.revisionDescription', defaultMessage: 'Revision description' })}
				error={!!errors.revisionDesc}
				helperText={errors.revisionDesc?.message}
				{...register('revisionDesc')}
			/>
		</Sidebar>
	);
};
