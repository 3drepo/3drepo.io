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
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';

import { DateTime } from '../../../components/dateTime/dateTime.component';
import { Container, SubmodelsList, Time } from './modelItem.styles';

interface IProps {
	name: string;
	federate: boolean;
	model: string;
	subModels?: any[];
	timestamp: string;
}

export class ModelItem extends React.PureComponent<IProps, any> {
	public openMenu = () => {
		console.log('test')
	}

	public renderSubModels = (subModels = []) => {
		const submodelsAsString = subModels.map(({ name }) => name).join(', ');
		return subModels.length ? <SubmodelsList>{ submodelsAsString }</SubmodelsList> : null;
	}

	public render() {
		const { name, subModels, timestamp } = this.props;
		return (
			<Container>
				<Grid
					container
					direction="row"
					alignItems="center"
					justify="space-between"
					wrap="nowrap"
				>
					<Grid container>{name}</Grid>
					<Grid
						container
						direction="row"
						alignItems="center"
						justify="flex-end">
						<Time>{timestamp ? <DateTime value={timestamp} format="D ddd" /> : null}</Time>
						<IconButton
							aria-label="More"
							aria-haspopup="true"
							onClick={this.openMenu}
						>
							<Icon>more_vert</Icon>
						</IconButton>
					</Grid>
				</Grid>
				{this.renderSubModels(subModels)}
			</Container>
		);
	}
}
