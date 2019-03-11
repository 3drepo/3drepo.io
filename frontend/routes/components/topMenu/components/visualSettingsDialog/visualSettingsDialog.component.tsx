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

import { Button, InputAdornment, List, MenuItem, Switch } from '@material-ui/core';
import { Field, Form, Formik } from 'formik';
import * as React from 'react';
import * as Yup from 'yup';
import { schema } from '../../../../../services/validation';
import { DialogTab, DialogTabs, ErrorTooltip, FormListItem, NeutralActionButton, ShortInput,
		VisualSettingsButtonsContainer, VisualSettingsDialogContent,
		NegativeActionButton } from './visualSettingsDialog.styles';
import { isEqual } from 'lodash';
import { DEFAULT_SETTINGS } from '../../../../../constants/viewer';
import { SelectField } from '../../../selectField/selectField.component';

const SettingsSchema = Yup.object().shape({
	nearPlane: schema.number(0, Number.POSITIVE_INFINITY),
	memory: schema.integer(16, 2032),
	farPlaneSamplingPoints: schema.integer(1, Number.POSITIVE_INFINITY)
});

const BasicSettings = (props) => {
	return (
		<List>
			<FormListItem>
				Shading
				<Field name="shading" render={ ({ field }) => (
					<SelectField {...field}>
						<MenuItem value="standard">Standard</MenuItem>
						<MenuItem value="architectural">Architectural</MenuItem>
					</SelectField>)} />
			</FormListItem>
			<FormListItem>
				Shadows
				<Field name="shadows" render={ ({ field }) => (
					<SelectField {...field}>
						<MenuItem value="none">None</MenuItem>
						<MenuItem value="soft">Soft</MenuItem>
						<MenuItem value="hard">Hard</MenuItem>
					</SelectField>)} />
			</FormListItem>
			<FormListItem>
				XRay highlighting
				<Field name="xray" render={ ({ field }) => (
					<Switch checked={field.value} {...field} value="true" color="secondary" />)}/>
			</FormListItem>
		</List>);
};

const AdvancedSettings = (props) => {
	return (
		<List>
			<FormListItem>
				Show Statistics
				<Field name="statistics" render={ ({ field }) => (
					<Switch checked={field.value} {...field} value="true" color="secondary" />
				)}/>
			</FormListItem>
			<FormListItem>
				Memory for Unity
				<Field name="memory" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.memory || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.memory)}
						{...field}
						endAdornment={<InputAdornment position="end">MB</InputAdornment>}/>
					</ErrorTooltip>
					);
				}} />
			</FormListItem>
			<FormListItem>
				Minimum near plane
				<Field name="nearPlane" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.nearPlane || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.nearPlane)}
						{...field}
						/>
					</ErrorTooltip>
					);
				}} />
			</FormListItem>
			<FormListItem>
				Far plane algorithm
				<Field name="farPlaneAlgorithm" render={ ({ field }) => (
					<SelectField {...field}>
						<MenuItem value="box">Bounding box</MenuItem>
						<MenuItem value="sphere">Bounding sphere</MenuItem>
					</SelectField>
				)}/>
			</FormListItem>
			<FormListItem>
				Far plane points
				<Field name="farPlaneSamplingPoints" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.farPlaneSamplingPoints || ''} placement="bottom-end">
					<ShortInput
						disabled={form.values.farPlaneAlgorithm !== 'box'}
						error={Boolean(form.errors.farPlaneSamplingPoints)}
						{...field}
						/>
					</ErrorTooltip>
					);
				}} />
			</FormListItem>
		</List>);
};

const Buttons = (props) => {
	return (
		<VisualSettingsButtonsContainer>
			<Field render={ ({ form }) => (
			<NegativeActionButton
				color="primary"
				variant="raised"
				disabled={isEqual(form.values, DEFAULT_SETTINGS)}
				type="button"
				onClick={() => form.setValues(DEFAULT_SETTINGS)}
				>
					Reset
				</NegativeActionButton>
			)} />
			<NeutralActionButton
				color="primary"
				variant="raised"
				disabled={false}
				type="button"
				onClick={props.onClickCancel}
			>
				Cancel
			</NeutralActionButton>
			<Field render={ ({ form }) => (
					<Button
						color="secondary"
						variant="raised"
						type="submit"
						disabled={!form.isValid || form.isValidating}
						>
						Save
					</Button>
			)} />

		</VisualSettingsButtonsContainer>);
};

interface IProps {
	handleResolve: () => void;
	handleClose: () => void;
	updateSettings: (settings: any) => void;
	visualSettings: any;
}

interface IState {
	selectedTab: number;
	visualSettings: any;
	flag: boolean;
}

export class VisualSettingsDialog extends React.PureComponent<IProps, IState> {
	public state = {
		selectedTab: 0,
		visualSettings: null,
		flag: false
	};

	public handleTabChange = (event, selectedTab) => {
		this.setState({ selectedTab });
	}

	public onSubmit = (values, { resetForm }) => {
		values.nearPlane = Number(values.nearPlane);
		values.memory = Number(values.memory);
		values.farPlaneSamplingPoints = Number(values.farPlaneSamplingPoints);

		this.props.updateSettings(values);

		if (values.memory !== this.props.visualSettings.memory) {
			location.reload();
		}
		this.props.handleClose();
	}

	public componentDidMount() {
		this.setState({visualSettings: this.props.visualSettings});
	}

	public render() {
		const {selectedTab} = this.state;
		const {visualSettings, handleClose} =  this.props;

		return (
			<VisualSettingsDialogContent>
				<DialogTabs
					value={selectedTab}
					indicatorColor="primary"
					textColor="primary"
					onChange={this.handleTabChange}
				>
					<DialogTab label="Basic" />
					<DialogTab label="Advanced" />
				</DialogTabs>
				<Formik
					validationSchema={SettingsSchema}
					initialValues={visualSettings}
					enableReinitialize={true}
					onSubmit={this.onSubmit}
					>
					<Form>
						{selectedTab === 0 && <BasicSettings />}
						{selectedTab === 1 && <AdvancedSettings />}
						<Buttons onClickCancel={handleClose} />
					</Form>
				</Formik>
			</VisualSettingsDialogContent>
			);
	}
}
