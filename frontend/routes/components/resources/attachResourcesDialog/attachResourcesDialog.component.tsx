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
import { Form, Formik } from 'formik';
import * as React from 'react';
import * as Yup from 'yup';
import { renderWhenTrueOtherwise } from '../../../../helpers/rendering';
import { clientConfigService } from '../../../../services/clientConfig';
import { Loader as LoaderIndicator } from '../../loader/loader.component';
import { LoaderContainer } from '../../messagesList/messagesList.styles';
import {
	DialogTab,
	DialogTabs
} from '../../topMenu/components/visualSettingsDialog/visualSettingsDialog.styles';
import { AttachResourceFiles } from './attachResourceFiles.component';
import { Container } from './attachResourcesDialog.styles';
import { DialogButtons } from './attachResourcesDialogButtons';
import { AttachResourceUrls } from './attachResourceUrls.component';

interface IProps {
	handleClose: () => void;
	onSaveFiles: any;
	onSaveLinks: any;
	quotaLeft: number;
	fetchQuota: (teamspace: string) => void;
	currentTeamspace: any;
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
		)
		,
	links: Yup.array()
		.of(
			Yup.object().shape({
				name: Yup.string().strict(false).trim().required('Name is required'),
				link: Yup.string().matches(
					/^[a-zA-Z]+:\/\/([-a-zA-Z0-9@:%_\+.~#&=]+\/*)+[-a-zA-Z0-9@:%_\+.~#?&=]*$/,
					'Link should be a URL').required('Link is required')
			})
		)
	});

const Loader = () => (
		<LoaderContainer>
			<LoaderIndicator size={18} />
		</LoaderContainer>
);

export class AttachResourcesDialog extends React.PureComponent<IProps, IState> {
	public state = {
		selectedTab: 0
	};

	public componentDidMount = () => {
		this.props.fetchQuota(this.props.currentTeamspace);
	}

	public handleTabChange = (event, selectedTab) => {
		this.setState({ selectedTab });
	}

	public onSubmit = ({files, links}) => {
		if (links.length > 0) {
			this.props.onSaveLinks(links);
		}

		if (files.length > 0) {
			this.props.onSaveFiles(files);
		}

		this.props.handleClose();
	}

	public onCancel = () => {
		this.props.handleClose();
	}

	public validateQuota = (files: any[]) => {
		const totalSize = files.reduce((p, file) => p + file.file.size , 0);
		return totalSize < (this.props.quotaLeft * 1024 * 1024);
	}

	public validateUploadLimit = (files: any[]) => {
		return files.map((f) => f.file.size)
				.every((s) => s <= clientConfigService.resourceUploadSizeLimit);
	}

	private renderAttachResourceFiles = (values) => renderWhenTrueOtherwise(() => (
		<AttachResourceFiles
			files={values.files}
			validateQuota={this.validateQuota}
			validateUploadLimit={this.validateUploadLimit}
			uploadLimit={clientConfigService.resourceUploadSizeLimit}
		/>
		),
		<Loader />
	)

	public render() {
		const {selectedTab} = this.state;
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
							{
								selectedTab === 0 && this.renderAttachResourceFiles(values)(this.props.quotaLeft)
							}
							{selectedTab === 1 && <AttachResourceUrls links={values.links} />}
								<DialogButtons
									onClickCancel={this.onCancel}
									validateQuota={this.validateQuota}
									validateUploadLimit={this.validateUploadLimit}
								/>
						</Form>
						)}
				/>
			</Container>
			);
	}
}
