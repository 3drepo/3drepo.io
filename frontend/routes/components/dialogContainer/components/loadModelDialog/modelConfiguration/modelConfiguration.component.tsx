/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import React from 'react';

import Switch from '@material-ui/core/Switch';

import { ISubModel } from '../../../../../../modules/model/model.redux';
import { FormListItem } from '../../../../topMenu/components/visualSettingsDialog/visualSettingsDialog.styles';
import { Container } from '../loadModelDialog.styles';

interface IProps {
	isSettingsLoading: boolean;
	models: ISubModel[];
	handleClose: () => void;
}

const ModelsListSwitcher = ({ model, name, selected, handleChange }) => (
	<FormListItem>
		{name}
		<Switch
			checked={selected.name}
			onChange={handleChange}
			name={selected.name}
			color="secondary"
		/>
	</FormListItem>
);

export const ModelConfiguration: React.FunctionComponent<IProps> = ({ models, ...props}) => {
	const [selectedModels, setSelectedModels] = React.useState({});

	const handleChange = (e) => {
		const { name } = e.target;

		setSelectedModels({
			...selectedModels,
			[name]: !selectedModels[name],
		});
	};

	const handleSubmit = (formValues, actions) => {
		const onFinish = () => {
			actions.setSubmitting(false);
			props.handleClose();
		};

		const onError = () => {
			actions.setSubmitting(false);
		};
	};

	return (
		<Container>
			{models.map((subModelProps) => (
				<ModelsListSwitcher
					key={subModelProps.model}
					selected={selectedModels}
					handleChange={handleChange}
					{...subModelProps}
				/>
			))}
		</Container>
	);
};
