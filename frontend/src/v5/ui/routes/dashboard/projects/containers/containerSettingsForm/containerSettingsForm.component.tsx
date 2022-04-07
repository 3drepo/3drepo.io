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

import { IContainer } from '@/v5/store/containers/containers.types';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers/containersActions.dispatchers';
import { ContainerSettingsSchema } from '@/v5/validation/schemes';
import { SettingsForm } from '../../settingsForm/settingsForm.component';

type ContainerSettingsFormProps = {
	open: boolean;
	container: IContainer;
	onClose: () => void;
};

export const ContainerSettingsForm = ({
	container,
	...otherProps
}: ContainerSettingsFormProps) => (
	<SettingsForm
		containerOrFederation={container}
		isContainer
		settingsSchema={ContainerSettingsSchema}
		fetchSettings={ContainersActionsDispatchers.fetchContainerSettings}
		fetchViews={ContainersActionsDispatchers.fetchContainerViews}
		updateSettings={ContainersActionsDispatchers.updateContainerSettings}
		{...otherProps}
	/>
);
