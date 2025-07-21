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

import { useContext, useEffect, useRef } from 'react';
import CircledPlusIcon from '@assets/icons/outlined/add_circle-outlined.svg';

import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import MoveIcon from '@assets/icons/outlined/arrow_cross-outlined.svg';
import { FormattedMessage } from 'react-intl';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { FormHelperText, Tooltip } from '@mui/material';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { CoordsAction, CoordsActionLabel, CoordsActions, CoordsInputContainer, Label, FlexRow, SelectPinButton } from './coordsProperty.styles';
import { getColorTriggerPropName, getPinColorHexForProperty, NEW_TICKET_ID, toPin, getPinId, getPinIconForProperty } from './coordsProperty.helpers';
import { TicketContext } from '../../../ticket.context';
import { formatMessage } from '@/v5/services/intl';
import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { PaddedCrossIcon } from '@controls/chip/chip.styles';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { get, isEqual, set } from 'lodash';
import { useFormContext, useWatch } from 'react-hook-form';
import { DrawingViewerService } from '@components/viewer/drawingViewer/drawingViewer.service';
import { Pin } from '../../../pin';

export const CoordsProperty = ({ value, label, onChange, onBlur, required, error, helperText, disabled, name }: FormInputProps) => {
	const { isViewer, containerOrFederation } = useContext(TicketContext);
	const pinToDrop = TicketsCardHooksSelectors.selectPinToDrop();
	const prevValue = useRef(undefined);
	const { getValues } = useFormContext();
	const ticket = getValues() as ITicket;
	const selectedTemplateId = ticket?.type ?? TicketsCardHooksSelectors.selectSelectedTemplateId();
	const template = TicketsHooksSelectors.selectTemplateById(containerOrFederation, selectedTemplateId);
	const selectedPin = TicketsCardHooksSelectors.selectSelectedTicketPinId();

	let colorTriggerPropPath = '';
	let colorTriggerPropValue = '';
	
	if (isViewer) {
		colorTriggerPropPath = getColorTriggerPropName(name, template);
		colorTriggerPropValue =  useWatch({ name: colorTriggerPropPath }) ?? get(ticket, colorTriggerPropPath);
	}

	const isNewTicket = !ticket?._id;
	const ticketId = !isNewTicket ? ticket._id : NEW_TICKET_ID;
	const minimumPinTicket = set({ _id: ticketId }, colorTriggerPropPath, colorTriggerPropValue) as ITicket;
	
	const pinId = getPinId(name, ticket);
	const editMode = pinToDrop === pinId;
	const isSelected = selectedPin === pinId;
	const hasPin = !!value;
	const colorHex = getPinColorHexForProperty(name, template, minimumPinTicket);
	const pinIcon = getPinIconForProperty(name, template);

	const cancelEdit = () => {
		if (!editMode) return;
		TicketsCardActionsDispatchers.setPinToDrop(null);
		ViewerService.clearMeasureMode();
	};

	const onClickDelete = () => {
		onChange?.(null);
		cancelEdit();
		if (isSelected) TicketsCardActionsDispatchers.setSelectedTicketPin(null);
	};

	const onClickEdit = async () => {
		TicketsCardActionsDispatchers.setPinToDrop(pinId);
		const pin = await Promise.race([
			ViewerService.getClickPoint(),
			DrawingViewerService.getClickPoint(),
		]);
	
		TicketsCardActionsDispatchers.setPinToDrop(null);

		ViewerService.clearMeasureMode();
		DrawingViewerService.setSnapping(false);

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
			ViewerService.showPin(toPin(name, template, minimumPinTicket, false, value));
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
		TicketsCardActionsDispatchers.setPinToDrop(null);
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
							<Pin pinIcon={pinIcon}/>
						</SelectPinButton>
					</Tooltip>
				)}
			</FlexRow>
			<FormHelperText>{helperText}</FormHelperText>
		</CoordsInputContainer>
	);
};
