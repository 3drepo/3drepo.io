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
import { TextField, Button } from '@material-ui/core';
import { Formik, Form, FieldArray, Field } from 'formik';

interface IProps {
	onSaveLinks: (links) => void;
}

interface IResourceUrl {
	name: string;
	url: string;
}

interface IState {
	urls: IResourceUrl[];
}

const EditableLinkResource = ({name, url}) =>
	(<div><span> Name:<TextField value={name}/></span><span> Link:<TextField value={url}/></span></div>);

export class AttachResourceUrls extends React.PureComponent<IProps, IState> {

	public onSubmit = (values) => {
		this.props.onSaveLinks(values.links);
	}

	public render() {
		return (
			<div>
				<h1>Links List</h1>
				<Formik
				initialValues={{ links: [] }}
				onSubmit={this.onSubmit}
				render={({ values }) => (
				<Form>
					<FieldArray
					name="links"
					render={(arrayHelpers) => (
						<div>
						{(values.links && values.links.length > 0) && (
							values.links.map((link, index) => (
							<div key={index}>
								<Field name={`links.${index}.name`} />
								<Field name={`links.${index}.link`} />
								<button
									type="button"
									onClick={() => arrayHelpers.remove(index)} // remove a friend from the list
								>x</button>
							</div>
							))
						)}
						<div>
							<button type="button" onClick={() => arrayHelpers.push({name: '', link: ''})}>Add link</button>
							<button type="submit">Submit</button>
						</div>
						</div>
					)}
					/>
				</Form>
				)}
				/>
			</div>
		);
	}
}
