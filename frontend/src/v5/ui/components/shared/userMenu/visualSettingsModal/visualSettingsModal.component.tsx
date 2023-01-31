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
import { Dialog } from '@mui/material';
import { ModalHeader } from '@controls/headedModal/modalHeader/modalHeader.component';
import { RemoveWhiteCorners } from '@controls/headedModal/formModal/formModal.styles';
import { formatMessage } from '@/v5/services/intl';
import { VisualSettingsModalContent } from './visualSettingsModal.styles';

type IVisualSettingsModal = {
	onClickClose: () => void;
	visualSettings: any;
	updateSettings: (username, settings) => void;
	currentUser: string;
	handleResolve: () => void;
};

export const VisualSettingsModal = ({
	onClickClose,
	...visualSettingsProps
}: IVisualSettingsModal) => (
	<Dialog open PaperComponent={RemoveWhiteCorners}>
		<ModalHeader
			title={formatMessage({
				id: 'visualSettingsModal.title',
				defaultMessage: 'Visual Settings',
			})}
			onClickClose={onClickClose}
		/>
		<VisualSettingsModalContent>
			<VisualSettingsDialog
				handleClose={onClickClose}
				{...visualSettingsProps}
			/>
		</VisualSettingsModalContent>
	</Dialog>
);
