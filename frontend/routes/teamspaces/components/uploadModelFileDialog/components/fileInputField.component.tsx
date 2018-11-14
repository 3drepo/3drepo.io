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

import * as React from 'react';
import Button from '@material-ui/core/Button';

import { clientConfigService } from '../../../../../services/clientConfig';
import { HiddenFileInput, FileLabel } from './fileInputField.styles';

interface IProps {
	name: string;
	value: any[];
	onChange: (event) => void;
	onBlur: (event) => void;
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

		console.log("handle here");

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

	public getAcceptedFormats = () => clientConfigService.acceptedFormat.map((format) => `.${format}`).toString();

	public render() {
		return (
			<>
				<HiddenFileInput
					accept={this.getAcceptedFormats()}
					id="flat-button-file"
					type="file"
					onChange={this.handleChange}
				/>
				<FileLabel htmlFor="flat-button-file">
					<Button component="span">Select file</Button>
				</FileLabel>
			</>
		);
	}
}
