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
import { Formik } from 'formik';

import RemoveIcon from '@material-ui/icons/Close';
import { ILegend } from '../../../../../../modules/legend/legend.redux';
import { ColorPicker } from '../../../../../components/colorPicker/colorPicker.component';
import {SmallIconButton} from '../../../../../components/smallIconButon/smallIconButton.component';
import {
	Actions,
	StyledForm,
	StyledTextField
} from '../../../measurements/components/measureItem/measureItem.styles';
import { Container } from './legendItem.styles';

interface IProps extends ILegend {
	updateLegendItem: (legendItem: ILegend & { oldName?: string }) => void;
	deleteLegendItem: (legendItem: ILegend) => void;
}

export const LegendItem = ({ name, color, updateLegendItem, deleteLegendItem }: IProps) => {
	const textFieldRef = React.useRef(null);

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
			/>
			<Formik
				initialValues={{ newName: name }}
				onSubmit={handleSubmit}
			>
				<Tooltip title={name} placement="bottom">
					<StyledForm>
						<StyledTextField
							ref={textFieldRef}
							requiredConfirm
							fullWidth
							value={name}
							name="newName"
							mutable
							onChange={handleSave}
							disableShowDefaultUnderline
						/>
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
