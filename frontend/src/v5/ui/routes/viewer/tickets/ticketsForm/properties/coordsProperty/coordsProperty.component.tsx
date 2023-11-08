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
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import MoveIcon from '@assets/icons/outlined/arrow_cross-outlined.svg';
import { FormattedMessage } from 'react-intl';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { FormHelperText, Tooltip } from '@mui/material';
import { hexToGLColor } from '@/v4/helpers/colors';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { PinInputContainer, FlexRow, PinAction, PinActionLabel, PinActions, PinName, PinSelectContainer } from './coordsProperty.styles';
import { getPinColorHex, isPinLight } from './pin.helpers.component';
import { TicketContext } from '../../../ticket.context';
import { formatMessage } from '@/v5/services/intl';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { join } from 'lodash';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { PaddedCrossIcon } from '@controls/chip/chip.styles';

export const CoordsProperty = ({ value, label, onChange, onBlur, required, error, helperText, disabled, name }: FormInputProps) => {
	const { isViewer } = useContext(TicketContext);
	const [editMode, setEditMode] = useState(false);
	const prevValue = useRef(undefined);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const pinId = name === 'properties.Pin' ? ticketId : join([ticketId, name], '.');
	const selectedPin = TicketsCardHooksSelectors.selectSelectedTicketPinId();
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
		if (isSelected) TicketsCardActionsDispatchers.setSelectedTicketPin(null);
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
		TicketsCardActionsDispatchers.setSelectedTicketPin(isSelected ? null : pinId);
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
		<PinInputContainer required={required} selected={editMode} error={error} disabled={disabled}>
			<FlexRow>
				<span>
					<PinName required={required}>
						{label}
					</PinName>
					<PinActions>
						{editMode && (
							<>
								<PinAction onClick={cancelEdit} selected>
									<MoveIcon />
									<PinActionLabel>
										{hasPin ? (
											<FormattedMessage id="tickets.pin.selectNewLocation" defaultMessage="Select new location" />
										) : (
											<FormattedMessage id="tickets.pin.selectLocation" defaultMessage="Select location" />
										)}
									</PinActionLabel>
								</PinAction>
								<PinAction onClick={cancelEdit}>
									<PaddedCrossIcon />
									<PinActionLabel>
										<FormattedMessage id="tickets.pin.cancel" defaultMessage="Cancel" />
									</ PinActionLabel>
								</PinAction>
							</>
						)}
						{!editMode && (
							<>
								<PinAction onClick={onClickEditPin} disabled={disabled}>
									{hasPin ? <MoveIcon /> : <CircledPlusIcon />}
								</PinAction>
								{hasPin && (
									<PinAction onClick={onClickDelete} disabled={disabled}>
										<DeleteIcon />
									</PinAction>
								)}
							</>
						)}

					</PinActions>
				</span>
				{isViewer && (
					<Tooltip title={getSelectedPinTooltip()}>
						<PinSelectContainer color={colorHex} $isLight={isPinLight(colorHex)} isSelected={isSelected} onClick={onClickSelectPin}>
							<PinIcon />
						</PinSelectContainer>
					</Tooltip>
				)}
			</FlexRow>
			<FormHelperText>{helperText}</FormHelperText>
		</PinInputContainer>
	);
};
