/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { Resizer } from '../resizer/resizer.component';
import { useContext } from 'react';
import { ResizableTableContext } from '../resizableTableContext';
import { ResizersContainers, Table } from './resizableTable.styles';

export const ResizableTable = ({ className = '', children }) => {
	const { getVisibleColumnsNames } = useContext(ResizableTableContext);

	return (
		<Table className={className}>
			{children}
			<ResizersContainers>
				{getVisibleColumnsNames().map((name) => (
					<Resizer name={name} key={name} />
				))}
			</ResizersContainers>
		</Table>
	);
};