/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import * as React from 'react';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';

import { TableHeadContainer } from './customTableHeader.styles';

interface IProps {
	cells: any[];
}

export class CustomTableHeader extends React.PureComponent<IProps, any> {

	public renderCells = (cells) => {
		return cells.map((cell, index) => {
			return <TableCell key={index}>{cell}</TableCell>;
		});
	}

	public render() {
		const { cells } = this.props;
		return (
			<TableHeadContainer>
				<TableRow>
					{this.renderCells(cells)}
				</TableRow>
			</TableHeadContainer>
		);
	}
}
