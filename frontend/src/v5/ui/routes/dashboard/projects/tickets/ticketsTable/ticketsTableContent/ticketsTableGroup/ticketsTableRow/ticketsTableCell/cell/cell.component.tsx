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

import { CellContainer } from './cell.styles';
import { TextOverflow } from '@controls/textOverflow';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { usePerformanceContext } from '@/v5/helpers/performanceContext/performanceContext.hooks';

type CellProps = { name: string, children: any, className?: string };
export const Cell = ({ name, children, className }: CellProps) => {
	const { movingColumn } = usePerformanceContext(ResizableTableContext, ['movingColumn']);

	return (
		<CellContainer name={name} className={className} $isMoving={name === movingColumn}>
			<TextOverflow>
				{children}
			</TextOverflow>
		</CellContainer>
	);
};

