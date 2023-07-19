/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import ExpandIcon from '@assets/icons/outlined/expand_panel-outlined.svg';
import { useContext } from 'react';
import { isNumber } from 'lodash';
import { SidebarContainer, ExpandButton, SidebarContent } from './sidebar.styles';
import { UploadsContext } from '../uploadFileFormContext.component';
import { SidebarForm } from './sidebarForm/sidebarForm.component';

interface ISidebar {
	className?: string;
}

export const Sidebar = ({
	className,
}: ISidebar): JSX.Element => {
	const { selectedUploadId, setSelectedUploadId, originalIndex, setOriginalIndex } = useContext(UploadsContext);
	const onClose = () => {
		setSelectedUploadId('');
		setOriginalIndex(null);
	};
	return (
		<SidebarContainer className={className} open={isNumber(originalIndex)}>
			<ExpandButton onClick={onClose}>
				<ExpandIcon />
			</ExpandButton>
			<SidebarContent>
				{isNumber(originalIndex) && (
					<SidebarForm
						key={selectedUploadId}
						revisionPrefix={`uploads.${originalIndex}`}
					/>
				)}
			</SidebarContent>
		</SidebarContainer>
	);
};
