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

import FocusIcon from '@assets/icons/viewer/focus.svg';
import { formatMessage } from '@/v5/services/intl';
import { ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ToolbarButton } from '../toolbarButton.component';

export const FocusButton = () => (
	<ToolbarButton
		Icon={FocusIcon}
		onClick={() => ViewerGuiActionsDispatchers.setIsFocusMode(true)}
		title={formatMessage({ id: 'viewer.toolbar.icon.focus', defaultMessage: 'Focus' })}
	/>
);