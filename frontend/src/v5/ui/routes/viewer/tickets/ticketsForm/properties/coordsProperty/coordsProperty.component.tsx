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

import { useContext, useEffect, useRef, useState } from 'react';
import CircledPlusIcon from '@assets/icons/outlined/add_circle-outlined.svg';
import PinIcon from '@assets/icons/filled/ticket_pin-filled.svg';
import LocationIcon from '@assets/icons/outlined/pin-outlined.svg';
import CrossIcon from '@assets/icons/outlined/close-outlined.svg';
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import { FormattedMessage } from 'react-intl';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { FormHelperText, Tooltip } from '@mui/material';
import { hexToGLColor } from '@/v4/helpers/colors';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { FlexRow, PinAction, PinActions, PinName, PinSelectContainer, SettingLocationText } from './coordsProperty.styles';
import { getPinColorHex } from './pin.helpers.component';
import { TicketContext } from '../../../ticket.context';
import { formatMessage } from '@/v5/services/intl';
import { ViewerInputContainer } from '../viewerInputContainer/viewerInputContainer.component';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { join } from 'lodash';

export const CoordsProperty = ({ value, label, onChange, onBlur, required, error, helperText, disabled, name }: FormInputProps) => {
	const [editMode, setEditMode] = useState(false);
	const prevValue = useRef(undefined);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const pinId = name === 'properties.Pin' ? ticketId : join([ticketId, name], '.');
	const { isViewer, selectedPin, setSelectedPin } = useContext(TicketContext);
	const isSelected = selectedPin === pinId;
	const hasPin = !!value;
	
	const colorHex = getPinColorHex(name);

	const cancelEdit = () => {
		if (!editMode) return;
		setEditMode(false);
		ViewerService.clearMeasureMode();
	};

	const onClickDelete = () => {
		onChange?.(null);
		cancelEdit();
		if (isSelected) setSelectedPin(null);
	};

	const onClickEditPin = async () => {
		setEditMode(true);
		const pin = await ViewerService.getClickPoint();
		setEditMode(false);

		//  If the returned pin is undefined, edit mode has been cancelled
		if (pin !== undefined) {
			onChange?.(pin);
		}
	};

	const onClickSelectPin = () => {
		if (!hasPin) return;
		setSelectedPin(isSelected ? null : pinId);
	};

	const getSelectedPinTooltip = () => {
		if (!hasPin) return '';
		return isSelected ? formatMessage({ id: 'tickets.pin.deselectPin', defaultMessage: 'Deselect pin' }) : formatMessage({ id: 'tickets.pin.selectPin', defaultMessage: 'Select pin' });
	};

	const replacePin = () => {
		if (prevValue.current) {
			ViewerService.removePin(pinId);
		}

		if (hasPin) {
			ViewerService.showPin({
				id: pinId, position: value, colour: hexToGLColor(colorHex), type: 'ticket' });
		}
	};

	// Update pin when colour changes
	useEffect(() => {
		replacePin();
		if (isSelected) ViewerService.setSelectionPin({ id: pinId, isSelected });
	}, [colorHex]);

	// Update pin when position changes
	useEffect(() => {
		// There seems to be some sort of race condition in react-hook-form
		// so onBlur cant be called inmmediatly after onchange because the validation wont be there.
		setTimeout(() => onBlur?.(), 200);

		if (value !== prevValue.current) {
			replacePin();
		}

		if (isSelected) ViewerService.setSelectionPin({ id: pinId, isSelected });

		prevValue.current = value;
	}, [value]);

	useEffect(() => () => {
		ViewerService.clearMeasureMode();
		if (prevValue.current) {
			ViewerService.removePin(pinId);
		}
	}, [ticketId]);

	useEffect(() => {
		ViewerService.setSelectionPin({ id: pinId, isSelected });
	}, [isSelected]);

	return (
		<ViewerInputContainer required={required} selected={editMode} error={error} disabled={disabled}>
			<FlexRow>
				<span>
					<PinName required={required}>
						{label}
					</PinName>
					<PinActions>
						{editMode && (
							<SettingLocationText onClick={cancelEdit}>
								<FormattedMessage id="tickets.pin.selectLocation" defaultMessage="Select new location on model" /> <CrossIcon />
							</SettingLocationText>
						)}
						{!editMode && (
							<PinAction onClick={onClickEditPin} disabled={disabled}>
								{hasPin && (<><LocationIcon /> <FormattedMessage id="tickets.pin.changeLocation" defaultMessage="Change pin location" /></>)}
								{!hasPin && (<><CircledPlusIcon /> <FormattedMessage id="tickets.pin.addPin" defaultMessage="Add pin" /></>)}
							</PinAction>
						)}

						{hasPin && (
							<PinAction onClick={onClickDelete} disabled={disabled}>
								<DeleteIcon />
								<FormattedMessage id="tickets.pin.deletePin" defaultMessage="Delete pin" />
							</PinAction>
						)}
					</PinActions>
				</span>
				{isViewer && (
					<Tooltip title={getSelectedPinTooltip()}>
						<PinSelectContainer color={colorHex} isSelected={isSelected} onClick={onClickSelectPin}>
							<PinIcon />
						</PinSelectContainer>
					</Tooltip>
				)}
			</FlexRow>
			<FormHelperText>{helperText}</FormHelperText>
		</ViewerInputContainer>
	);
};
