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

import { HTMLAttributes, useContext } from 'react';
import { ResizableTableContext } from '../resizableTableContext';
import { Line } from './delimiterLine.styles';

type DelimiterLineProps = { offset: number } & HTMLAttributes<HTMLDivElement>;
export const DelimiterLine = ({ offset, ...props }: DelimiterLineProps) => {
	const { columnGap } = useContext(ResizableTableContext);
	return (<Line $offset={offset - columnGap / 2} {...props} />);
};