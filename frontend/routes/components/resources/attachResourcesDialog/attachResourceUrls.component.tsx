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
import { TextField, Button, Grid } from '@material-ui/core';
import { Formik, Form, FieldArray, Field } from 'formik';
import { DialogButtons } from './attachResourcesDialogButtons';
import { StyledFormControl,
	FieldsRow } from '../../../viewer/components/risks/components/riskDetails/riskDetails.styles';
import { ResourceListLinkItem, ResourcesListContainer,
	AddLinkContainer, ResourcesListScroller } from './attachResourcesDialog.styles';
import { RemoveButton } from '../resources.component';
import { get } from 'lodash';
import * as Yup from 'yup';
import { LabelButton } from '../../../viewer/components/labelButton/labelButton.styles';

interface IProps {
	onSaveLinks: (links) => void;
	onCancel: () => void;
}

interface IResourceUrl {
	name: string;
	url: string;
}

interface IState {
	urls: IResourceUrl[];
}

const schema = Yup.object().shape({
	links: Yup.array()
		.of(
			Yup.object().shape({
				name: Yup.string().strict(false).trim().required('Name is required'),
				link: Yup.string().url('Link should be a url').required('Link is required')
			})
		)
		.required('required')
		});

const LinkEntry = ({onClickRemove, index }) => {
	const nameFieldName = `links.${index}.name`;
	const linkFieldName = `links.${index}.link`;

	return (
	<FieldsRow container justify="space-between" flex={0.5}>
		<StyledFormControl>
			<Field name={nameFieldName} render={({ field, form }) => (
				<TextField {...field}
					placeholder="3d Repo"
					fullWidth
					error={Boolean(get(form.errors, nameFieldName))}
					helperText={get(form.errors, nameFieldName)}
				/>
			)} />
		</StyledFormControl>
		<StyledFormControl>
			<ResourceListLinkItem>
				<Field name={linkFieldName} render={({ field, form }) => (
					<TextField {...field}
						placeholder="https://3drepo.com/"
						fullWidth
						error={Boolean(get(form.errors, linkFieldName))}
						helperText={get(form.errors, linkFieldName)}
					/>
				)} />
				<RemoveButton onClick={onClickRemove}/>
			</ResourceListLinkItem>
		</StyledFormControl>
	</FieldsRow>
	);
};

export class AttachResourceUrls extends React.PureComponent<IProps, IState> {

	public onSubmit = (values) => {
		this.props.onSaveLinks(values.links);
	}

	public render() {
		const { onCancel } = this.props;

		return (
			<div>
				<Formik
					validationSchema={schema}
					initialValues={{ links: [] }}
					onSubmit={this.onSubmit}
					render={({ values }) => (
					<Form>
						<FieldArray
						name="links"
						render={(arrayHelpers) => (
							<div>
								<ResourcesListScroller>
									<ResourcesListContainer>
									{(values.links && values.links.length > 0) && (
										values.links.map((link, index) => (
											<LinkEntry key={index}
												index={index}
												onClickRemove={() => arrayHelpers.remove(index)}
											/>
										))
									)}
									</ResourcesListContainer>
								</ResourcesListScroller>
								<AddLinkContainer>
									<LabelButton onClick={() => arrayHelpers.insert(0, {name: '', link: ''})}>Add link</LabelButton>
								</AddLinkContainer>
							</div>
						)}
						/>
						<DialogButtons onClickCancel={onCancel}/>
					</Form>
					)}
				/>
			</div>
		);
	}
}
