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

import { Toggle } from '@controls/inputs/toggle/toggle.component';
import { isPermissionModalSuppressed, setPermissionModalSuppressed } from './updatePermissionModal.helpers';
import { FormattedMessage } from 'react-intl';
import { Container } from './suppressPermissionModalToggle.styles';
import { useState } from 'react';

export const SuppressPermissionModalToggle = () => {
	const [suppressModal, setSuppressModal] = useState(isPermissionModalSuppressed());

	const onChange = (e, checked) => {
		setSuppressModal(checked);
		setPermissionModalSuppressed(checked);
	};

	return (
		<Container>
			<Toggle
				onChange={onChange}
				value={suppressModal}
				label={<FormattedMessage
					id="SuppressPermissionModal.toggle"
					defaultMessage="Suppress permission change notification"
				/>}
			/>
		</Container>
	);
};