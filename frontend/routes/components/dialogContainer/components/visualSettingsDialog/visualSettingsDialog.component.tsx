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

import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { schema } from '../../../../../services/validation';
import {Tabs, Tab, List,
		Select, MenuItem, Switch, Input, InputAdornment, Button, Tooltip } from '@material-ui/core';
import { NeutralActionButton, VisualSettingsButtonsContainer, VisualSettingsDialogContent,
		FormListItem, ErrorTooltip, ShortInput, DialogTabs, DialogTab } from './visualSettingsDialog.styles';

const SettingsSchema = Yup.object().shape({
	nearPlane: schema.number(0, Number.POSITIVE_INFINITY),
	memory: schema.integer(16, 2032)
});

const BasicSettings = (props) => {
	return (
		<List>
			<FormListItem>
				Shading
				<Field name="shading" render={ ({ field }) => (
					<Select {...field}>
						<MenuItem value={0}>Standard</MenuItem>
						<MenuItem value={1}>Architectural</MenuItem>
					</Select>)} />
			</FormListItem>
			<FormListItem>
				Shadows
				<Field name="shadows" render={ ({ field }) => (
					<Select {...field}>
						<MenuItem value={0}>None</MenuItem>
						<MenuItem value={1}>Soft</MenuItem>
						<MenuItem value={2}>Hard</MenuItem>
					</Select>)} />
			</FormListItem>
			<FormListItem>
				XRay highlighting
				<Field name="xray" render={ ({ field }) => (
					<Switch {...field} color="secondary" inputProps={{ 'aria-label': 'XRay highlighting' }}/>)}
					/>
			</FormListItem>
		</List>);
};

const AdvancedSettings = (props) => {
	return (
		<List>
			<FormListItem>
				Show Statistics
				<Field name="statistics" render={ ({ field }) => (
					<Switch {...field} color="secondary" inputProps={{'aria-label': 'Show Statistics'}}/>
				)}/>
			</FormListItem>
			<FormListItem>
				Memory for Unity
				<Field name="memory" render={ ({ field, form }) => {
					return (
					<ErrorTooltip  title={form.errors.memory || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.memory)}
						{...field}
						endAdornment={<InputAdornment position="end">MB</InputAdornment>}/>
					</ErrorTooltip>
					);
				}} />
			</FormListItem>
			<FormListItem>
				Minimun near plane
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
					<Select {...field}>
						<MenuItem value={0}>Bounding box</MenuItem>
						<MenuItem value={1}>Bounding sphere</MenuItem>
					</Select>
				)}/>
			</FormListItem>
		</List>);
};

const Buttons = (props) => {
	return (
		<VisualSettingsButtonsContainer>
			<Button
			color="primary"
			variant="raised"
			disabled={true}
			type="button"
			onClick={props.onClickReset}
			>
				Reset
			</Button>
			<NeutralActionButton
				color="primary"
				variant="raised"
				disabled={false}
				type="button"
				onClick={props.onClickCancel}
			>
				Cancel
			</NeutralActionButton>
			<Button
				color="secondary"
				variant="raised"
				disabled={false}
				type="submit"
				onClick={props.onClickSave}
			>
				Save
			</Button>
		</VisualSettingsButtonsContainer>);
};

interface IProps {
	handleResolve: () => void;
	handleClose: () => void;
	settings: any;
}

interface IState {
	selectedTab: number;
}

export class SettingsDialog extends React.PureComponent<IProps, IState> {
	public state = {
		selectedTab: 0
	};

	public handleTabChange = (event, selectedTab) => {
		this.setState({ selectedTab });
	}

	public onSubmit = (values, { resetForm }) => {
	}

	public render() {
		const {selectedTab} = this.state;
		const {settings} = this.props;

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
					initialValues={settings}
					onSubmit={this.onSubmit}
					>
					<Form>
						{selectedTab === 0 && <BasicSettings />}
						{selectedTab === 1 && <AdvancedSettings />}
						<Buttons onClickCancel={this.props.handleClose}/>
					</Form>
				</Formik>
			</VisualSettingsDialogContent>
			);
	}
}
