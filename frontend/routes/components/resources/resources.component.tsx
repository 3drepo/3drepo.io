/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import * as dayjs from 'dayjs';

interface IResource {
	_id: string;
	name: string;
	link: string;
	type: string;
	size?: number;
}

interface IProps {
	resources: IResource[];
}

interface IState {
	value: any;
}

export class Resources extends React.PureComponent<IProps, IState> {
	public render() {
		return this.props.resources.map((r) => (<div key={r._id}>{r.type} | <a href={r.link}>{r.name}</a></div>));
	}
}
