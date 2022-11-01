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
import CircledPlusIcon from '@assets/icons/outlined/add_circle-outlined.svg';
import PinIcon from '@assets/icons/outlined/pin-outlined.svg';
import CrossIcon from '@assets/icons/close.svg';
import DeleteIcon from '@assets/icons/delete.svg';
import { FormattedMessage } from 'react-intl';
import { PinAction, PinActions, PinContainer, PinName, SettingLocationText } from './pinDetails.styles';

export const PinDetails = () => {
	const [isEditMode, setIsEditMode] = useState(false);
	const [hasPin, setHasPin] = useState(false); // replace with proper pin logic
	const onClickCancelSetPin = () => setIsEditMode(false);
	const onClickEditPin = () => setIsEditMode(true);
	const onClickDelete = () => {
		setHasPin(false);
		setIsEditMode(false);
	};
	const onNewPinSet = () => {
		if (isEditMode) {
			setIsEditMode(false);
			setHasPin(true);
		}
	};

	const EditPinText = () => {
		if (isEditMode) {
			return (
				<SettingLocationText onClick={onClickCancelSetPin}>
					<FormattedMessage
						id="tickets.pin.selectLocation"
						defaultMessage="Select new location on model"
					/>
					<CrossIcon />
				</SettingLocationText>
			);
		}

		return hasPin ? (
			<PinAction onClick={onClickEditPin}>
				<PinIcon />
				<FormattedMessage
					id="tickets.pin.changeLocation"
					defaultMessage="Change pin location"
				/>
			</PinAction>
		) : (
			<PinAction onClick={onClickEditPin}>
				<CircledPlusIcon />
				<FormattedMessage
					id="tickets.pin.addPin"
					defaultMessage="Add pin"
				/>
			</PinAction>
		);
	};

	return (
		<PinContainer selected={isEditMode}>
			<PinName onClick={onNewPinSet /* Temporary hack to simulate seting pin on model */}>
				<FormattedMessage id="tickets.pin.title" defaultMessage="Pin" />
			</PinName>
			<PinActions>
				<EditPinText />
				{hasPin && (
					<PinAction onClick={onClickDelete}>
						<DeleteIcon />
						<FormattedMessage id="tickets.pin.deletePin" defaultMessage="Delete pin" />
					</PinAction>
				)}
			</PinActions>
		</PinContainer>
	);
};
