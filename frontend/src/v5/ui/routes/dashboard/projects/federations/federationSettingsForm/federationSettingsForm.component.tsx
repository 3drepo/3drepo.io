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

import React, { useEffect } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { TextField, MenuItem, InputLabel, FormControl } from '@material-ui/core';
import { Select } from '@controls/select';
import { FormModal } from '@/v5/ui/controls/modal/formModal/formDialog.component';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useParams } from 'react-router';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import { FederationSettingsPayload, IFederation, FederationView } from '@/v5/store/federations/federations.types';
import { ShareTextField } from '@controls/shareTextField';
import { FlexContainer, SectionTitle, Thumbnail, ThumbnailPlaceholder, SelectView, ViewLabel, MenuItemView, UnitTextField } from './federationSettingsForm.styles';

const EMPTY_VIEW: FederationView = {
	_id: ' ',
	name: 'None',
	hasThumbnail: false,
};

const UNITS = {
	mm: 'Millimetres',
	cm: 'Centimetres',
	dm: 'Decimetres',
	m: 'Metres',
	ft: 'Feet and inches',
};
interface IFormInput {
	name: string;
	unit: string;
	description: string;
	code: string;
	defaultViewId: string;
	latitude: number;
	longitude: number;
	angleFromNorth: number;
	x: number;
	y: number;
	z: number;
}

const getDefaultValues = (federation: IFederation) => {
	const { unit = 'mm', angleFromNorth } = federation.settings || {};
	const {
		latLong = [0, 0],
		position = [0, 0, 0],
	} = federation.settings?.surveyPoint || {};
	const [x, y, z] = position;
	const [latitude, longitude] = latLong;
	const { code = '', name, description = '' } = federation;
	const defaultViewId = (federation?.settings?.defaultView || EMPTY_VIEW)._id;
	return {
		name,
		description,
		code,
		unit,
		defaultViewId,
		latitude,
		longitude,
		angleFromNorth,
		x,
		y,
		z,
	};
};

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
	defaultViewId: Yup.string(),
	latitude: Yup.number().required(),
	longitude: Yup.number().required(),
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
			}))
		.transform((value) => value || 0),
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
	const defaultValues = getDefaultValues(federation) as any;
	const {
		register,
		handleSubmit,
		reset,
		watch,
		control,
		formState,
		formState: { errors },
	} = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(FederationSchema),
		defaultValues,
	});

	const currentUnit = watch('unit');

	const { teamspace, project } = useParams() as { teamspace: string, project: string };
	const getThumbnail = getThumbnailBasicPath(teamspace, project, federation._id);

	useEffect(reset, [!open]);

	useEffect(() => {
		FederationsActionsDispatchers.fetchFederationSettings(teamspace, project, federation._id);
		FederationsActionsDispatchers.fetchFederationViews(teamspace, project, federation._id);
	}, [!open]);

	const onSubmit: SubmitHandler<IFormInput> = ({
		name,
		description,
		unit,
		code,
		defaultViewId,
		latitude, longitude,
		angleFromNorth,
		x, y, z,
	}) => {
		const defaultView = federation.views.find((view) => view._id === defaultViewId) || EMPTY_VIEW;
		const payload: FederationSettingsPayload = {
			angleFromNorth,
			defaultView,
			surveyPoint: {
				latLong: [latitude, longitude],
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
			<ShareTextField
				label="ID"
				value={federation._id}
			/>
			<Controller
				name="name"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						label={formatMessage({ id: 'federations.settings.form.name', defaultMessage: 'Name' })}
						required
						error={!!errors.name}
						helperText={errors.name?.message}
					/>
				)}
			/>
			<Controller
				name="description"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						label={formatMessage({ id: 'federations.settings.form.description', defaultMessage: 'Description' })}
						error={!!errors.description}
						helperText={errors.description?.message}
					/>
				)}
			/>
			<FlexContainer>
				<FormControl>
					<InputLabel id="unit-label" required>
						<FormattedMessage id="federations.settings.form.unit" defaultMessage="Units" />
					</InputLabel>
					<Select
						labelId="unit-label"
						defaultValue={defaultValues.unit}
						{...register('unit')}
					>
						{Object.keys(UNITS).map((unit) => (
							<MenuItem key={unit} value={unit}>
								<FormattedMessage id={`federations.settings.form.unit.${unit}`} defaultMessage={UNITS[unit]} />
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<Controller
					name="code"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label={formatMessage({ id: 'federation.settings.form.code', defaultMessage: 'Code' })}
							error={!!errors.code}
							helperText={errors.code?.message}
						/>
					)}
				/>
			</FlexContainer>
			<FormControl>
				<InputLabel id="default-view-label">
					<FormattedMessage id="federations.settings.form.view" defaultMessage="Default View" />
				</InputLabel>
				<SelectView
					labelId="default-view-label"
					defaultValue={defaultValues.defaultViewId}
					{...register('defaultViewId')}
				>
					{[EMPTY_VIEW].concat(federation.views || []).map((view) => (
						<MenuItemView
							key={view._id}
							value={view._id}
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
				<Controller
					name="latitude"
					control={control}
					render={({ field }) => (
						<UnitTextField
							{...field}
							labelname={formatMessage({ id: 'federations.settings.form.lat', defaultMessage: 'LATITUDE' })}
							labelunit={formatMessage({ id: 'federations.settings.form.lat.unit', defaultMessage: 'decimal' })}
							type="number"
							required
						/>
					)}
				/>
				<Controller
					name="longitude"
					control={control}
					render={({ field }) => (
						<UnitTextField
							{...field}
							labelname={formatMessage({ id: 'federations.settings.form.long', defaultMessage: 'LONGITUDE' })}
							labelunit={formatMessage({ id: 'federations.settings.form.long.unit', defaultMessage: 'decimal' })}
							type="number"
							required
						/>
					)}
				/>
			</FlexContainer>
			<Controller
				name="angleFromNorth"
				control={control}
				render={({ field }) => (
					<UnitTextField
						{...field}
						labelname={formatMessage({ id: 'federations.settings.form.angleFromNorth', defaultMessage: 'ANGLE FROM NORTH' })}
						labelunit={formatMessage({ id: 'federations.settings.form.angleFromNorth.unit', defaultMessage: 'clockwise degrees' })}
						type="number"
					/>
				)}
			/>
			<FlexContainer>
				<Controller
					name="x"
					control={control}
					render={({ field }) => (
						<UnitTextField
							labelname="X"
							labelunit={currentUnit}
							type="number"
							required
							{...field}
						/>
					)}
				/>
				<Controller
					name="y"
					control={control}
					render={({ field }) => (
						<UnitTextField
							labelname="Y"
							labelunit={currentUnit}
							type="number"
							required
							{...field}
						/>
					)}
				/>
				<Controller
					name="z"
					control={control}
					render={({ field }) => (
						<UnitTextField
							labelname="Z"
							labelunit={currentUnit}
							type="number"
							required
							{...field}
						/>
					)}
				/>
			</FlexContainer>
		</FormModal>
	);
};
