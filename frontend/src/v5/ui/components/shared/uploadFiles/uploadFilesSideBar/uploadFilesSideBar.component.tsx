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

import ExpandIcon from '@assets/icons/outlined/expand_panel-outlined.svg';
import React, { useContext } from 'react';
import { SidebarContainer, ExpandButton, SidebarContent } from './uploadFilesSideBar.styles';
import { UploadFilesContext } from '../uploadFilesContext';

interface IUploadFilesSidebar {
	className?: string;
	children,
}
export const UploadFilesSidebar = ({ className, children }: IUploadFilesSidebar) => {
	const { selectedId, setSelectedId } = useContext(UploadFilesContext);
	const isOpen = !!selectedId;

	const onClose = () => setSelectedId(null);

	return (
		<SidebarContainer className={className} open={isOpen}>
			<ExpandButton onClick={onClose}>
				<ExpandIcon />
			</ExpandButton>
			<SidebarContent>
				{isOpen && (
					<React.Fragment key={selectedId}>
						{children}
					</React.Fragment>
				)}
			</SidebarContent>
		</SidebarContainer>
	);
};
