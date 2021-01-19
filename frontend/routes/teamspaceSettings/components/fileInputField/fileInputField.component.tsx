/**
 *Copyright (C) 2017 3D Repo Ltd
 *
 *This program is free software: you can redistribute it and/or modify
 *it under the terms of the GNU Affero General Public License as
 *published by the Free Software Foundation, either version 3 of the
 *License, or (at your option) any later version.
 *
 *This program is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.See the
 *GNU Affero General Public License for more details.
 *
 *You should have received a copy of the GNU Affero General Public License
 *along with this program.If not, see <http://www.gnu.org/licenses/>.
 */

import Button from '@material-ui/core/Button';
import React from 'react';

import { FileLabel, HiddenFileInput } from './fileInputField.styles';

interface IProps {
	name: string;
	value: any[];
	onChange: (event) => void;
	onBlur: (event) => void;
	renderButton?: () => React.ReactNode;
}

interface IState {
	value: any[];
}

export class FileInputField extends React.PureComponent<IProps, IState> {
	public state = {
		value: []
	};

	public componentDidMount() {
		this.setState({ value: this.props.value });
	}

	public handleChange = (event) => {
		const { name, onChange } = this.props;

		if (onChange) {
			onChange({
				target: {
					value: event.target.files[0],
					name
				}
			});
		}
	}

	private renderButton = () => {
		if (this.props.renderButton) {
			return this.props.renderButton();
		}

		return (
			<Button
				component="span"
				variant="contained"
				color="secondary"
			>
				Browser
			</Button>
		);
	}

	public render() {
		return (
			<>
				<HiddenFileInput
					accept=".csv"
					id="flat-button-file"
					type="file"
					onChange={this.handleChange}
				/>
				<FileLabel htmlFor="flat-button-file">
					{this.renderButton()}
				</FileLabel>
			</>
		);
	}
}
