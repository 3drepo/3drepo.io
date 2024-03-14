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

import { formatMessage } from '@/v5/services/intl';
import { CALLOUTS, ICalloutType, IMode } from '../../../imageMarkup.types';
import { MODES } from '@/v4/routes/components/screenshotDialog/markupStage/markupStage.helpers';
import { ToolbarSelect } from '@controls/toolbarSelect/toolbarSelect.component';
import { ToolbarSelectItem } from '@controls/toolbarSelect/toolbarSelectItem/toolbarSelectItem.component';

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
	value: ICalloutType,
	onChange: (callout: ICalloutType) => void,
	mode: IMode,
};
export const CalloutButton = ({ value, onChange, mode }: CalloutButtonProps) => {
	const isCalloutMode = mode === MODES.CALLOUT;

	return (
		<ToolbarSelect
			onChange={onChange}
			title={formatMessage({ id: 'imageMarkup.callout.button.title', defaultMessage: 'Callout' })}
			defaultIcon={CALLOUT_DATA[value].Icon}
			value={value}
			active={isCalloutMode}
		>
			{Object.values(CALLOUT_DATA).map((calloutData) => (
				<ToolbarSelectItem {...calloutData} key={calloutData.value} />
			))}
		</ToolbarSelect>
	);
};
