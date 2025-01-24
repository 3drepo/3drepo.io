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

import { useRef } from 'react';

import { Tooltip } from '@mui/material';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';

import RemoveIcon from '@mui/icons-material/Close';
import { ILegend } from '../../../../../../modules/legend/legend.redux';
import { VALIDATIONS_MESSAGES } from '../../../../../../services/validation';
import { ColorPicker } from '../../../../../components/colorPicker/colorPicker.component';
import { SmallIconButton } from '../../../../../components/smallIconButon/smallIconButton.component';
import { Actions } from '../../../measurements/components/measureItem/measureItem.styles';
import { Container, StyledForm, StyledTextField } from './legendItem.styles';

const LegendSchema = (names) => Yup.object().shape({
	newName: Yup.string()
		.required(VALIDATIONS_MESSAGES.REQUIRED)
		.test('Unique', 'This name is already in use', (values) => {
			return names.filter((name) => name === values).length < 1;
		})
});

interface IProps extends ILegend {
	updateLegendItem: (legendItem: ILegend & { oldName?: string }) => void;
	deleteLegendItem: (legendItem: ILegend) => void;
	setComponentState: (legendItem: ILegend) => void;
	legendNames: string[];
	onPickerOpen: () => void;
	onPickerClose: () => void;
	resetComponentState: () => void;
	editMode?: boolean;
	autoFocus?: boolean;
}

export const LegendItem = ({
	name, color, updateLegendItem, deleteLegendItem, legendNames, editMode, setComponentState, ...props
}: IProps) => {
	const textFieldRef = useRef(null);

	const getLegendSchema = LegendSchema(legendNames.filter((item) => item !== name));

	const handleColorChange = (colorValue: string) => {
		const update = editMode ? setComponentState : updateLegendItem;
		update({
			name,
			color: colorValue,
		});
	};

	const handleSave = ({ target: { value: newName }}) => {
		if (newName) {
			if (editMode) {
				props.resetComponentState();
			}

			updateLegendItem({
				oldName: name,
				name: newName,
				color,
			});
		}
	};

	const handleRemove = () => editMode ? props.resetComponentState() : deleteLegendItem({
		name,
		color,
	});

	const handleSubmit = () => textFieldRef.current.saveChange();

	const additionalTextFieldProps = editMode ? {
		forceEdit: true,
		onCancel: handleRemove,
	} : {};

	return (
		<Container>
			<ColorPicker
				value={color}
				onChange={handleColorChange}
				onOpen={props.onPickerOpen}
				onClose={props.onPickerClose}
			/>
			<Formik
				initialValues={{ newName: name }}
				onSubmit={handleSubmit}
				validationSchema={LegendSchema}
				enableReinitialize
			>
				<Tooltip title={name} placement="bottom">
					<StyledForm>
						<Field name="newName" render={({ field }) => (
							<StyledTextField
								{...field}
								name="newName"
								ref={textFieldRef}
								requiredConfirm
								fullWidth
								validationSchema={getLegendSchema}
								mutable
								autoFocus={props.autoFocus}
								onChange={handleSave}
								disableShowDefaultUnderline
								inputProps={{ maxlength: 20 }}
								{...additionalTextFieldProps}
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
