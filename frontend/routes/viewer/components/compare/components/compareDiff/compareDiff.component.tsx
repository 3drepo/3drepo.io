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
import { CompareItem } from './components/compareItem.component';
import { Container } from './compareDiff.styles';

interface IProps {
	className: string;
}

interface IState {
	className: string;
}

const mockedCompareModels = [
	{
		_id: 1,
		name: 'Lego_House_Structure',
		revisions: [
			{
			desc: 'Coordinated design',
			tag: 'r2',
			timestamp: '2018-01-16T15:58:10.000Z'
			}
		]
	},
	{
		_id: 2,
		name: 'Lego_House_Landscape',
		revisions: [
			{
				desc: 'Existing tree',
				timestamp: '2018-01-16T15:19:52.000Z'
			}
		]
	},
	{
		_id: 3,
		name: 'Lego_House_Architecture',
		revisions: [
			{
				desc: 'For coordination',
				tag: 'r3',
				timestamp: '2018-01-16T16:02:54.000Z'
			},
			{
				desc: 'Roof access added',
				tag: 'r2',
				timestamp: '2018-01-16T15:26:58.000Z'
			},
			{
				desc: 'Initial design',
				tag: 'r1',
				timestamp: '2018-01-16T15:19:01.000Z'
			}
		]
	}
];

export class CompareDiff extends React.PureComponent<IProps, IState> {
	public handleRevisionChange = () => {
		console.log('handle rev change');
	}

	public handleModelSelect = () => {
		console.log('handle select');
	}

	public handleModelDeselect = () => {
		console.log('handle deselect');
	}

	public renderCompareModels = () => mockedCompareModels.map((model) => (
		<CompareItem
			key={model._id}
			selected={true}
			onRevisionChange={this.handleRevisionChange}
			name={model.name}
			revisions={model.revisions}
			onSelect={this.handleModelSelect}
			onDeselect={this.handleModelDeselect}
		/>
	))

	public render() {
		return (
			<Container className={this.props.className}>
				{this.renderCompareModels()}
			</Container>
		);
	}
}
