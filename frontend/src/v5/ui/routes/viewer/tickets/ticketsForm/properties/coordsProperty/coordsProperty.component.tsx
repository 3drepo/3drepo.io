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
import { CoordsAction, CoordsActionLabel, CoordsActions, CoordsInputContainer, Label, FlexRow, SelectPinButton } from './coordsProperty.styles';
import { DEFAULT_PIN, getLinkedValuePath, getPinColorHex } from './coordsProperty.helpers';
import { TicketContext } from '../../../ticket.context';
import { formatMessage } from '@/v5/services/intl';
import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { PaddedCrossIcon } from '@controls/chip/chip.styles';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { isEqual } from 'lodash';
import { useFormContext, useWatch } from 'react-hook-form';
import { DrawingViewerService } from '@components/viewer/drawingViewer/drawingViewer.service';
import { NEW_TICKET_ID } from '@/v5/store/tickets/tickets.helpers';

export const CoordsProperty = ({ value, label, onChange, onBlur, required, error, helperText, disabled, name }: FormInputProps) => {
	const { isViewer, containerOrFederation } = useContext(TicketContext);
	const [editMode, setEditMode] = useState(false);
	const prevValue = useRef(undefined);
	const { getValues } = useFormContext();
	const ticket = getValues() as ITicket;
	const selectedTemplateId = TicketsCardHooksSelectors.selectSelectedTemplateId() ?? ticket?.type;
	const template = TicketsHooksSelectors.selectTemplateById(containerOrFederation, selectedTemplateId);
	const selectedPin = TicketsCardHooksSelectors.selectSelectedTicketPinId();

	const linkedPath = getLinkedValuePath(name, template);
	useWatch({ name:linkedPath });

	const isNewTicket = !ticket?._id;
	const ticketId = !isNewTicket ? ticket._id : NEW_TICKET_ID;
	const pinId = name === DEFAULT_PIN ? ticketId : `${ticketId}.${name}`;
	const isSelected = selectedPin === pinId;
	const hasPin = !!value;
	const colorHex = getPinColorHex(name, template, ticket);

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

	const onClickEdit = async () => {
		setEditMode(true);
		const pin = await Promise.race([
			ViewerService.getClickPoint(),
			DrawingViewerService.getClickPoint(),
		]);
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

	const getSelectPinTooltip = () => {
		if (!hasPin) return '';
		return isSelected ? formatMessage({ id: 'tickets.coords.deselectPin', defaultMessage: 'Deselect pin' }) : formatMessage({ id: 'tickets.coords.selectPin', defaultMessage: 'Select pin' });
	};

	const refreshPin = () => {
		if (prevValue.current) {
			ViewerService.removePin(pinId);
		}

		if (hasPin) {
			ViewerService.showPin({
				id: pinId, position: value, colour: hexToGLColor(colorHex), type: 'ticket' });
		}

		if (isSelected) ViewerService.setSelectionPin({ id: pinId, isSelected });
	};

	// Update pin when colour changes
	useEffect(() => {
		if (!prevValue.current) return;
		refreshPin();
	}, [colorHex]);

	// Update pin when position changes
	useEffect(() => {
		if (!isEqual(value, prevValue.current)) refreshPin();

		prevValue.current = value;

		if (required && !value) return;
		onBlur?.();
	}, [value]);

	useEffect(() => () => {
		ViewerService.clearMeasureMode();
	}, [ticketId]);

	useEffect(() => {
		ViewerService.setSelectionPin({ id: pinId, isSelected });
	}, [isSelected]);

	useEffect(() => () => {
		if (isNewTicket) ViewerService.removePin(pinId);
	}, []);

	return (
		<CoordsInputContainer required={required} selected={editMode} error={error} disabled={disabled}>
			<FlexRow>
				<span>
					<Label>
						{label}
					</Label>
					<CoordsActions>
						{editMode && !disabled && (
							<>
								<CoordsAction onClick={cancelEdit} selected>
									<MoveIcon />
									<CoordsActionLabel>
										{hasPin ? (
											<FormattedMessage id="tickets.coords.selectNewLocation" defaultMessage="Select new location" />
										) : (
											<FormattedMessage id="tickets.coords.selectLocation" defaultMessage="Select location" />
										)}
									</CoordsActionLabel>
								</CoordsAction>
								<CoordsAction onClick={cancelEdit}>
									<PaddedCrossIcon />
									<CoordsActionLabel>
										<FormattedMessage id="tickets.coords.cancel" defaultMessage="Cancel" />
									</ CoordsActionLabel>
								</CoordsAction>
							</>
						)}
						{!editMode && !disabled && (
							<>
								<CoordsAction onClick={onClickEdit} disabled={disabled}>
									{hasPin ? <MoveIcon /> : <CircledPlusIcon />}
								</CoordsAction>
								{hasPin && (
									<CoordsAction onClick={onClickDelete} disabled={disabled}>
										<DeleteIcon />
									</CoordsAction>
								)}
							</>
						)}

					</CoordsActions>
				</span>
				{isViewer && (
					<Tooltip title={getSelectPinTooltip()}>
						<SelectPinButton
							color={colorHex}
							isSelected={isSelected}
							onClick={onClickSelectPin}
							disabled={!hasPin}
						>
							<PinIcon />
						</SelectPinButton>
					</Tooltip>
				)}
			</FlexRow>
			<FormHelperText>{helperText}</FormHelperText>
		</CoordsInputContainer>
	);
};
