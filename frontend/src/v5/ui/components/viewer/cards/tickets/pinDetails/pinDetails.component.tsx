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

import { useState } from 'react';
import CircledPlusIcon from '@assets/icons/outlined/add-circle-outlined.svg';
import PinIcon from '@assets/icons/outlined/pin-outlined.svg';
import CrossIcon from '@assets/icons/close.svg';
import DeleteIcon from '@assets/icons/delete.svg';
import { FormattedMessage } from 'react-intl';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { FormControl, FormHelperText } from '@mui/material';
import { PinAction, PinActions, PinContainer, PinName, SettingLocationText } from './pinDetails.styles';

interface PinDetailsProps {
	value?: any;
	error?: boolean;
	helperText?: string;
	label?: string;
	onChange?: (...args) => void;
	onBlur?: (...args) => void;
	required?: boolean;
}

export const PinDetails = ({ value, label, onChange, onBlur, required, error, helperText }:PinDetailsProps) => {
	const [editMode, setEditMode] = useState(false);

	const cancelEdit = () => {
		if (!editMode) return;

		setEditMode(false);
		onChange?.(value);
		onBlur?.();
		ViewerService.clearMeasureMode();
	};

	const onClickEditPin = async () => {
		setEditMode(true);
		const pin = await ViewerService.dropPin();
		setEditMode(false);

		if (!pin) { //  If the returned pin is null, edit mode has been cancelled
			onChange?.(value);
			onBlur?.();
			return;
		}

		onChange?.(pin);
		onBlur?.();
	};

	const onClickDelete = () => {
		setEditMode(false);
		onChange?.(null);
		onBlur?.();
	};

	const hasPin = !!value;

	return (
		<FormControl required={required} error={error}>
			<PinContainer selected={editMode} error={error}>
				<PinName onClick={onClickEditPin} required={required}>
					{label}
				</PinName>
				<PinActions>
					{editMode && (
						<SettingLocationText onClick={cancelEdit}>
							<FormattedMessage id="tickets.pin.selectLocation" defaultMessage="Select new location on model" /> <CrossIcon />
						</SettingLocationText>
					)}

					{!editMode && (
						<PinAction onClick={onClickEditPin}>
							{hasPin && (<><PinIcon /> <FormattedMessage id="tickets.pin.changeLocation" defaultMessage="Change pin location" /></>)}
							{!hasPin && (<><CircledPlusIcon /> <FormattedMessage id="tickets.pin.addPin" defaultMessage="Add pin" /></>)}
						</PinAction>
					)}

					{hasPin && (
						<PinAction onClick={onClickDelete}>
							<DeleteIcon />
							<FormattedMessage id="tickets.pin.deletePin" defaultMessage="Delete pin" />
						</PinAction>
					)}
				</PinActions>
				<FormHelperText>{helperText}</FormHelperText>
			</PinContainer>
		</FormControl>
	);
};
