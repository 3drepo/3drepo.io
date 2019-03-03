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

import Input from '@material-ui/core/Input';
import Hidden from '@material-ui/core/Hidden';

interface IProps {
	name: string;
	value: any | any[];
	onChange?: (event) => void;
	onBlur?: (event) => void;
}

export class HiddenField extends React.PureComponent<IProps, any> {
	public componentDidUpdate(prevProps) {
		if (prevProps.value !== this.props.value) {
			if (this.props.onChange) {
				this.props.onChange({
					target: {
						value: this.props.value,
						name: this.props.name
					}
				});
			}
		}
	}

	public render() {
		const { name, onBlur, value } = this.props;
		return (
			<Hidden only={['xs', 'sm', 'md', 'lg', 'xl']}>
				<Input
					onBlur={onBlur}
					name={name}
					value={value}
				/>
			</Hidden>
		);
	}
}
