/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { VisualSettingsDialog } from '@/v4/routes/components/topMenu/components/visualSettingsDialog/visualSettingsDialog.component';
import { formatMessage } from '@/v5/services/intl';
import { ModalHeader } from '@controls/formModal/modalHeader/modalHeader.component';
import { Modal } from '@components/shared/modalsDispatcher/modalsDispatcher.styles';
import { VisualSettingsModalContent } from './visualSettingsModal.styles';

type IVisualSettingsModal = {
	open: boolean;
	onClickClose: () => void;
	visualSettings: any;
	updateSettings: (username, settings) => void;
	currentUser: string;
	handleResolve: () => void;
};

export const VisualSettingsModal = ({
	open,
	onClickClose,
	...visualSettingsProps
}: IVisualSettingsModal) => (
	<Modal
		onClose={onClickClose}
		open={open}
	>
		<ModalHeader
			title={formatMessage({
				id: 'visualSettingsModal.title',
				defaultMessage: 'Visual Settings',
			})}
			onClickClose={onClickClose}
			contrastColor
		/>
		<VisualSettingsModalContent>
			<VisualSettingsDialog
				handleClose={onClickClose}
				{...visualSettingsProps}
			/>
		</VisualSettingsModalContent>
	</Modal>
);
