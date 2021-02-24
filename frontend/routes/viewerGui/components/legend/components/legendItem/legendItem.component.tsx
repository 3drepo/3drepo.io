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

import { Tooltip } from '@material-ui/core';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';

import RemoveIcon from '@material-ui/icons/Close';
import { ILegend } from '../../../../../../modules/legend/legend.redux';
import { ColorPicker } from '../../../../../components/colorPicker/colorPicker.component';
import { SmallIconButton } from '../../../../../components/smallIconButon/smallIconButton.component';
import { Actions } from '../../../measurements/components/measureItem/measureItem.styles';
import { Container, StyledForm, StyledTextField } from './legendItem.styles';

const LegendSchema = (names) => Yup.object().shape({
	newName: Yup.string()
		.test('Unique', 'This name is already in use', (values) => {
			return names.filter((name) => name === values).length < 1;
		})
});

interface IProps extends ILegend {
	updateLegendItem: (legendItem: ILegend & { oldName?: string }) => void;
	deleteLegendItem: (legendItem: ILegend) => void;
	legendNames: string[];
	onPickerOpen: () => void;
	onPickerClose: () => void;
}

export const LegendItem = ({
	name, color, updateLegendItem, deleteLegendItem, legendNames, onPickerOpen, onPickerClose,
}: IProps) => {
	const textFieldRef = React.useRef(null);

	const getLegendSchema = LegendSchema(legendNames.filter((item) => item !== name));

	const handleColorChange = (colorValue: string) => updateLegendItem({
		name,
		color: colorValue,
	});

	const handleSave = ({ target: { value: newName }}) => updateLegendItem({
		oldName: name,
		name: newName,
		color,
	});

	const handleRemove = () => deleteLegendItem({
		name,
		color,
	});

	const handleSubmit = () => textFieldRef.current.saveChange();

	return (
		<Container>
			<ColorPicker
				value={color}
				onChange={handleColorChange}
				onOpen={onPickerOpen}
				onClose={onPickerClose}
			/>
			<Formik
				initialValues={{ newName: name }}
				onSubmit={handleSubmit}
				validationSchema={LegendSchema}
				validateOnBlur={false}
				validateOnChange={false}
				enableReinitialize
			>
				<Tooltip title={name} placement="bottom">
					<StyledForm>
						<Field name="newName" render={({ field, form }) => (
							<StyledTextField
								{...field}
								ref={textFieldRef}
								requiredConfirm
								fullWidth
								validationSchema={getLegendSchema}
								mutable
								error={Boolean(form.errors.desc)}
								helperText={form.errors.desc}
								onChange={handleSave}
								disableShowDefaultUnderline
								inputProps={{ maxLength: 20 }}
							/>
						)} />
					</StyledForm>
				</Tooltip>
			</Formik>
			<Actions>
				<SmallIconButton
					Icon={RemoveIcon}
					tooltip="Remove"
					onClick={handleRemove}
				/>
			</Actions>
		</Container>
	);
};
