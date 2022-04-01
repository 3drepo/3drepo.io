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

import { Container } from './uploadListHeader.styles';

type IUploadListHeader = {
	children: JSX.Element[];
};

export const UploadListHeader = ({ children }: IUploadListHeader): JSX.Element => (
	<Container>
		{children.map((child) => React.cloneElement(child, {
			key: child.props.name,
			...child.props,
		}))}
	</Container>
);
