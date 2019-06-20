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

import { Button } from '@material-ui/core';
import { Field, Form, Formik } from 'formik';
import * as React from 'react';
import * as Yup from 'yup';
import { AttachResourceFiles } from './attachResourceFiles.component';
import { AttachResourceUrls } from './attachResourceUrls.component';
import { NeutralActionButton, VisualSettingsButtonsContainer,
		DialogTabs, DialogTab
		} from '../../topMenu/components/visualSettingsDialog/visualSettingsDialog.styles';
import { Container } from './attachResourcesDialog.styles';
import { DialogButtons } from './attachResourcesDialogButtons';

const SettingsSchema = Yup.object().shape({
});

interface IProps {
	handleResolve: () => void;
	handleClose: () => void;
	updateSettings: (settings: any) => void;
	visualSettings: any;
	onSaveFiles: any;
	onSaveLinks: any;
}

interface IState {
	selectedTab: number;
}

const schema = Yup.object().shape({
	files: Yup.array()
		.of(
			Yup.object().shape({
				name: Yup.string()
				.strict(false)
				.trim()
				.required('Name is required')
			})
		),
	links: Yup.array()
		.of(
			Yup.object().shape({
				name: Yup.string().strict(false).trim().required('Name is required'),
				link: Yup.string().url('Link should be a url').required('Link is required')
			})
		)
	});

export class AttachResourcesDialog extends React.PureComponent<IProps, IState> {
	public state = {
		selectedTab: 0
	};

	public handleTabChange = (event, selectedTab) => {
		this.setState({ selectedTab });
	}

	public onSubmit = ({files, links}) => {
		this.props.onSaveLinks(links);
		this.props.onSaveFiles(files);
		this.props.handleClose();
	}

	public onCancel = () => {
		this.props.handleClose();
	}

	public render() {
		const {selectedTab} = this.state;
		const {visualSettings, handleClose} =  this.props;

		return (
			<Container>
				<DialogTabs
					value={selectedTab}
					indicatorColor="primary"
					textColor="primary"
					onChange={this.handleTabChange}
				>
					<DialogTab label="Files" />
					<DialogTab label="Links" />
				</DialogTabs>

				<Formik
				validationSchema={schema}
				initialValues={{ files: [], links: [] }}
				onSubmit={this.onSubmit}
				render={({ values }) => (
					<Form>
						{selectedTab === 0 && <AttachResourceFiles files={values.files} />}
						{selectedTab === 1 && <AttachResourceUrls links={values.links}/>}
						<DialogButtons onClickCancel={this.onCancel}/>
					</Form>
					)}
				/>
			</Container>
			);
	}
}
