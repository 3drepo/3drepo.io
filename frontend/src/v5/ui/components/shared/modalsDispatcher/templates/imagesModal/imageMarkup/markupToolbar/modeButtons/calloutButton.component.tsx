/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import CalloutCircleIcon from '@assets/icons/outlined/callout_circle-outlined.svg';
import CalloutDotIcon from '@assets/icons/outlined/callout_dot-outlined.svg';
import CalloutRectangleIcon from '@assets/icons/outlined/callout_square-outlined.svg';

import { ClickAwayListener } from '@mui/material';
import { formatMessage } from '@/v5/services/intl';
import { useState } from 'react';
import { ToolbarButton } from '../toolbarButton/toolbarButton.component';
import { CALLOUTS, ICalloutType, IMode } from '../../imageMarkup.types';
import { ButtonOptionsContainer, FloatingButton, FloatingButtonsContainer } from '../toolbarButton/multioptionIcons.styles';
import { MODES } from '@/v4/routes/components/screenshotDialog/markupStage/markupStage.helpers';

const CALLOUT_DATA = {
	[CALLOUTS.CIRCLE]: {
		value: CALLOUTS.CIRCLE,
		Icon: CalloutCircleIcon,
		title: formatMessage({ id: 'imageMarkup.callout.title.circle', defaultMessage: 'Circle' }),
	},
	[CALLOUTS.DOT]: {
		value: CALLOUTS.DOT,
		Icon: CalloutDotIcon,
		title: formatMessage({ id: 'imageMarkup.callout.title.dot', defaultMessage: 'Dot' }),
	},
	[CALLOUTS.RECTANGLE]: {
		value: CALLOUTS.RECTANGLE,
		Icon: CalloutRectangleIcon,
		title: formatMessage({ id: 'imageMarkup.callout.title.rectangle', defaultMessage: 'Rectangle' }),
	},
};

type CalloutButtonProps = {
	callout: ICalloutType,
	onCalloutChange: (callout: ICalloutType) => void,
	mode: IMode,
};
export const CalloutButton = ({ callout, onCalloutChange, mode }: CalloutButtonProps) => {
	const [expanded, setExpanded] = useState(false);

	const isCalloutMode = mode === MODES.CALLOUT;

	const selectCallout = (newCallout: ICalloutType) => {
		setExpanded(false);
		onCalloutChange(newCallout);
	};

	return (
		<ClickAwayListener onClickAway={() => setExpanded(false)}>
			<ButtonOptionsContainer>
				<FloatingButtonsContainer>
					{expanded && Object.values(CALLOUT_DATA).map(({ value, ...calloutData }) => (
						<FloatingButton
							{...calloutData}
							onClick={() => selectCallout(value)}
							selected={isCalloutMode && callout === value}
							key={value}
						/>
					))}
				</FloatingButtonsContainer>
				<ToolbarButton
					Icon={CALLOUT_DATA[callout].Icon}
					onClick={() => setExpanded(!expanded)}
					title={!expanded ? CALLOUT_DATA[callout].title : ''}
					selected={isCalloutMode}
				/>
			</ButtonOptionsContainer>
		</ClickAwayListener>
	);
};
