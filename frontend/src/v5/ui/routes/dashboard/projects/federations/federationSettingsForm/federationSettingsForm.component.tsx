/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import React, { useEffect, useState } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { TextField, MenuItem, InputLabel, FormControl } from '@material-ui/core';
import { Select } from '@controls/select';
import { FormModal } from '@/v5/ui/controls/modal/formModal/formDialog.component';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useParams } from 'react-router';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import { EMPTY_VIEW, FederationSettingsPayload, IFederation, FederationView } from '@/v5/store/federations/federations.types';
// TODO - remove this import
import * as API from '@/v5/services/api';
import { FlexContainer, SectionTitle, Thumbnail, ThumbnailPlaceholder, SelectView, ViewLabel, MenuItemView, UnitTextField } from './federationSettingsForm.styles';

interface IFormInput {
	name: string;
	unit: string;
	description: string;
	code: string;
	defaultView: string;
	lat: number;
	long: number;
	angleFromNorth: number;
	x: number;
	y: number;
	z: number;
}

const FederationSchema = Yup.object().shape({
	name: Yup.string()
		.min(2,
			formatMessage({
				id: 'federations.settings.name.error.min',
				defaultMessage: 'Federation Name must be at least 2 characters',
			}))
		.max(120,
			formatMessage({
				id: 'federations.settings.name.error.max',
				defaultMessage: 'Federation Name is limited to 120 characters',
			}))
		.required(
			formatMessage({
				id: 'federations.settings.name.error.required',
				defaultMessage: 'Federation Name is a required field',
			}),
		),
	description: Yup.string()
		.max(600,
			formatMessage({
				id: 'federations.settings.description.error.max',
				defaultMessage: 'Container Description is limited to 600 characters',
			})).default('Uncategorised'),
	unit: Yup.string().required().default('mm'),
	code: Yup.string()
		.max(50,
			formatMessage({
				id: 'federations.settings.code.error.max',
				defaultMessage: 'Code is limited to 50 characters',
			}))
		.matches(/^[A-Za-z0-9]*$/,
			formatMessage({
				id: 'federations.settings.code.error.characters',
				defaultMessage: 'Code can only consist of letters and numbers',
			})),
	defaultView: Yup.string(),
	lat: Yup.number().required(),
	long: Yup.number().required()
		.min(-180,
			formatMessage({
				id: 'federations.settings.longitude.error.min',
				defaultMessage: 'Longitude cannot be smaller than -180',
			}))
		.max(180,
			formatMessage({
				id: 'federations.settings.longitude.error.max',
				defaultMessage: 'Longitude cannot be greater than 180',
			})),
	angleFromNorth: Yup.number()
		.min(0,
			formatMessage({
				id: 'federations.settings.angle.error.min',
				defaultMessage: 'Angle cannot be smaller than 0',
			}))
		.max(360,
			formatMessage({
				id: 'federations.settings.angle.error.max',
				defaultMessage: 'Angle cannot be greater than 360',
			})),
	x: Yup.number().required(),
	y: Yup.number().required(),
	z: Yup.number().required(),
});

const getThumbnailBasicPath = (teamspace: string, projectId: string, federationId: string) => (
	(viewId: string) => `teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/views/${viewId}/thumbnail`
);

type IFederationSettingsForm = {
	open: boolean;
	federation: IFederation;
	onClose: () => void;
};

export const FederationSettingsForm = ({ open, federation, onClose }: IFederationSettingsForm) => {
	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState,
		formState: { errors },
	} = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(FederationSchema),
	});

	const { teamspace, project } = useParams() as { teamspace: string, project: string };
	const getThumbnail = getThumbnailBasicPath(teamspace, project, federation._id);

	const [currentUnit, setCurrentUnit] = useState(federation.settings?.unit || 'mm');

	watch((value, { name }) => {
		if (name === 'unit') {
			setCurrentUnit(value[name]);
		}
	});

	useEffect(reset, [!open]);

	useEffect(() => {
		FederationsActionsDispatchers.fetchFederationSettings(teamspace, project, federation._id);
		FederationsActionsDispatchers.fetchFederationViews(teamspace, project, federation._id);
		// API.Federations.fetchFederationViews({
		// 	teamspace,
		// 	projectId: project,
		// 	federationId: federation._id,
		// }).then((res) => setViews([EMPTY_VIEW, ...res.views]));
	}, []);

	const onSubmit: SubmitHandler<IFormInput> = ({
		name,
		description,
		unit,
		code,
		defaultView,
		lat, long,
		angleFromNorth,
		x, y, z,
	}) => {
		const payload: FederationSettingsPayload = {
			angleFromNorth,
			defaultView: JSON.parse(defaultView),
			surveyPoint: {
				latLong: [lat, long],
				position: [x, y, z],
			},
			unit,
			name,
			description,
			code,
		};
		FederationsActionsDispatchers.updateFederationSettings(teamspace, project, federation._id, payload);
		onClose();
	};

	return (
		<FormModal
			title={formatMessage({ id: 'federations.settings.title', defaultMessage: 'Federation settings' })}
			open={open}
			onClickClose={onClose}
			onSubmit={handleSubmit(onSubmit)}
			confirmLabel={formatMessage({ id: 'federations.settings.ok', defaultMessage: 'Save Changes' })}
			isValid={formState.isValid}
		>
			<SectionTitle>Federation information</SectionTitle>
			{/* <ShareTextField
				label="ID"
				value={federation._id}
			/> */}
			<TextField
				label={formatMessage({ id: 'federations.settings.form.name', defaultMessage: 'Name' })}
				required
				error={!!errors.name}
				helperText={errors.name?.message}
				defaultValue={federation.name}
				{...register('name')}
			/>
			<TextField
				label={formatMessage({ id: 'federations.settings.form.description', defaultMessage: 'Description' })}
				defaultValue={federation.description}
				{...register('description')}
			/>
			<FlexContainer>
				<FormControl>
					<InputLabel id="unit-label" required>
						<FormattedMessage id="federations.settings.form.unit" defaultMessage="Units" />
					</InputLabel>
					<Select
						labelId="unit-label"
						defaultValue={currentUnit}
						onChange={(e) => setCurrentUnit(e.target.value as string)}
						{...register('unit')}
					>
						<MenuItem value="mm">
							<FormattedMessage id="federations.settings.form.unit.mm" defaultMessage="Millimetres" />
						</MenuItem>
						<MenuItem value="cm">
							<FormattedMessage id="federations.settings.form.unit.cm" defaultMessage="Centimetres" />
						</MenuItem>
						<MenuItem value="dm">
							<FormattedMessage id="federations.settings.form.unit.dm" defaultMessage="Decimetres" />
						</MenuItem>
						<MenuItem value="m">
							<FormattedMessage id="federations.settings.form.unit.m" defaultMessage="Metres" />
						</MenuItem>
						<MenuItem value="ft">
							<FormattedMessage id="federations.settings.form.unit.ft" defaultMessage="Feet and inches" />
						</MenuItem>
					</Select>
				</FormControl>
				<TextField
					label={formatMessage({ id: 'federation.settings.form.code', defaultMessage: 'Code' })}
					error={!!errors.code}
					helperText={errors.code?.message}
					defaultValue={federation.code}
					{...register('code')}
				/>
			</FlexContainer>
			<FormControl>
				<InputLabel id="default-view-label">
					<FormattedMessage id="federations.settings.form.view" defaultMessage="Default View" />
				</InputLabel>
				<SelectView
					labelId="default-view-label"
					defaultValue={JSON.stringify(EMPTY_VIEW)}
					{...register('defaultView')}
				>
					{federation.views?.map((view) => (
						<MenuItemView
							key={view._id}
							value={JSON.stringify(view)}
						>
							{view.hasThumbnail ? (
								<Thumbnail
									src={getThumbnail(view._id)}
									alt={view.name}
								/>
							) : (
								<ThumbnailPlaceholder />
							)}
							<ViewLabel>
								{view.name}
							</ViewLabel>
						</MenuItemView>
					))}
				</SelectView>
			</FormControl>
			<SectionTitle>GIS servey point</SectionTitle>
			<FlexContainer>
				<UnitTextField
					labelname={formatMessage({ id: 'federations.settings.form.lat', defaultMessage: 'LATITUTE' })}
					labelunit={formatMessage({ id: 'federations.settings.form.lat.unit', defaultMessage: 'decimal' })}
					type="number"
					required
					defaultValue={federation.settings?.surveyPoint.latLong[0]}
					{...register('lat')}
				/>
				<UnitTextField
					labelname={formatMessage({ id: 'federations.settings.form.long', defaultMessage: 'LONGITUDE' })}
					labelunit={formatMessage({ id: 'federations.settings.form.long.unit', defaultMessage: 'decimal' })}
					type="number"
					required
					defaultValue={federation.settings?.surveyPoint.latLong[1]}
					{...register('long')}
				/>
			</FlexContainer>
			<UnitTextField
				labelname={formatMessage({ id: 'federations.settings.form.angleFromNorth', defaultMessage: 'ANGLE FROM NORTH' })}
				labelunit={formatMessage({ id: 'federations.settings.form.angleFromNorth.unit', defaultMessage: 'clockwise degrees' })}
				type="number"
				defaultValue={federation.settings?.angleFromNorth}
				{...register('angleFromNorth')}
			/>
			<FlexContainer>
				<UnitTextField
					labelname="X"
					labelunit={currentUnit}
					type="number"
					required
					defaultValue={federation.settings?.surveyPoint.position[0]}
					{...register('x')}
				/>
				<UnitTextField
					labelname="Y"
					labelunit={currentUnit}
					type="number"
					required
					defaultValue={federation.settings?.surveyPoint.position[1]}
					{...register('y')}
				/>
				<UnitTextField
					labelname="Z"
					labelunit={currentUnit}
					type="number"
					required
					defaultValue={federation.settings?.surveyPoint.position[2]}
					{...register('z')}
				/>
			</FlexContainer>
		</FormModal>
	);
};
