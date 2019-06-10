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
import Dropzone from 'react-dropzone';

interface IProps {
	onSaveFiles: (files) => void ;
}

interface IState {
	files: any[];
}

export class AttachResourceFiles extends React.PureComponent<IProps, IState> {
	public state = {
		files: []
	};

	public onDrop = (acceptedFiles) => {
		this.setState({files: this.state.files.concat(acceptedFiles)});
	}

	public onRemoveFile = (index) => (e) => {
		this.setState({files: this.state.files.filter((f , i) => index !== i)});
	}

	public onSavefiles = (e) => {
		this.props.onSaveFiles(this.state.files);
	}

	public render() {
		return (
			<div>
				<Dropzone height="32" onDrop={this.onDrop}>click or drop to add files</Dropzone>
				{this.state.files.map((f, i) => (<div key={i}>{f.name} <button onClick={this.onRemoveFile(i)}>x</button> </div>))}
				<button onClick={this.onSavefiles}>Save</button>
			</div>
		);
	}
}
