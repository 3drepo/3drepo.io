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
import { PureComponent } from 'react';
import { Button, InputAdornment, List, MenuItem, Switch } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { isEqual } from 'lodash';
import * as Yup from 'yup';
import { DEFAULT_SETTINGS } from '../../../../../constants/viewer';
import { IS_FIREFOX } from '../../../../../helpers/browser';
import { schema } from '../../../../../services/validation';
import { ColorPicker } from '../../../colorPicker/colorPicker.component';
import { SelectField } from '../../../selectField/selectField.component';
import { DialogTab, DialogTabs, ErrorTooltip, FormListItem, Headline,
	NegativeActionButton, NeutralActionButton,
	ShortInput, VisualSettingsButtonsContainer,
	VisualSettingsDialogContent, WarningMessage } from './visualSettingsDialog.styles';

const SettingsSchema = Yup.object().shape({
	nearPlane: schema.number(0, Number.POSITIVE_INFINITY),
	maxNearPlane: schema.number(-1, Number.POSITIVE_INFINITY),
	maxFarPlane: schema.number(-1, Number.POSITIVE_INFINITY),
	memory: schema.integer(16, 2032),
	farPlaneSamplingPoints: schema.integer(1, Number.POSITIVE_INFINITY),
	maxShadowDistance: schema.integer(1, Number.POSITIVE_INFINITY),
	numCacheThreads: schema.integer(1, 15),
	clipPlaneBorderWidth: schema.number(0, Number.POSITIVE_INFINITY),
	memoryThreshold: schema.number(0, 2032),
	memoryLimit: schema.number(0, 2032),
	phBundleFadeDistance: schema.number(0, Number.POSITIVE_INFINITY),
	phBundleFadeBias: schema.number(0, Number.POSITIVE_INFINITY),
	phBundleFadePower: schema.number(0, Number.POSITIVE_INFINITY),
	phBundleFaceAlpha: schema.number(0, 1),
	phBundleLineAlpha: schema.number(0, 1),
	phElementRenderingRadius: schema.number(0, 1),
	phElementFaceAlpha: schema.number(0, 1),
	phElementLineAlpha: schema.number(0, 1),

});

const BasicSettings = (props) => {
	return (
		<List>
			<FormListItem>
				Shading
				<Field name="shading" render={ ({ field }) => (
					<SelectField {...field}>
						<MenuItem value="standard">Standard</MenuItem>
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
					<Switch checked={field.value} {...field} value="true" color="secondary" />
				)} />
			</FormListItem>
			<FormListItem>
				Model Caching (Beta)
				<Field name="caching" render={ ({ field }) => (
					<Switch onClick={props.onCacheChange} checked={field.value} {...field} value="true" color="secondary" />
				)} />
			</FormListItem>
			<FormListItem>
				Clipping plane border width
				<Field name="clipPlaneBorderWidth" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.clipPlaneBorderWidth || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.clipPlaneBorderWidth)}
						{...field}
						/>
					</ErrorTooltip>
					);
				}} />
			</FormListItem>
			<FormListItem>
				Clipping plane border color
				<Field name="clipPlaneBorderColor" render={ ({ field }) => (
					<ColorPicker {...field} onChange={(val) => {
						// this is because colorpicker doenst use the standard events for inputs
						field.onChange({target: {name: field.name, value: val}});
					}} />
				)} />
			</FormListItem>
		</List>
	);
};

const AdvancedSettings = (props) => {
	return (
		<List>
			<FormListItem>
				Show Statistics
				<Field name="statistics" render={ ({ field }) => (
					<Switch checked={field.value} {...field} value="true" color="secondary" />
				)} />
			</FormListItem>
			{!IS_FIREFOX &&
				<FormListItem>
					Memory for Unity
					<Field name="memory" render={ ({ field, form }) => {
						return (
						<ErrorTooltip title={form.errors.memory || ''} placement="bottom-end">
						<ShortInput
							error={Boolean(form.errors.memory)}
							{...field}
							endAdornment={<InputAdornment position="end">MB</InputAdornment>} />
						</ErrorTooltip>
						);
					}} />
				</FormListItem>
			}
			<FormListItem>
				Number of Caching Threads
				<Field name="numCacheThreads" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.numCacheThreads || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.numCacheThreads)}
						{...field}
						/>
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
				Maximum near plane
				<Field name="maxNearPlane" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.maxNearPlane || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.maxNearPlane)}
						{...field}
						/>
					</ErrorTooltip>
					);
				}} />
			</FormListItem>
			<FormListItem>
				Maximum far plane
				<Field name="maxFarPlane" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.maxFarPlane || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.maxFarPlane)}
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
				)} />
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
			<FormListItem>
				Maximum Shadow Distance
				<Field name="maxShadowDistance" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.maxShadowDistance || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.maxShadowDistance)}
						{...field}
						/>
					</ErrorTooltip>
					);
				}} />
			</FormListItem>
		</List>
	);
};
const StreamingSettings = (props) => {
	return (
		<List>
			<Headline color="primary" variant="subtitle1">Memory</Headline>
			<FormListItem>
				Reserved
				<Field name="memoryThreshold" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.memoryThreshold || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.memoryThreshold)}
						{...field}
						endAdornment={<InputAdornment position="end">MB</InputAdornment>} />
					</ErrorTooltip>
					);
				}} />
			</FormListItem>
			<FormListItem>
				Limit
				<Field name="memoryLimit" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.memoryLimit || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.memoryLimit)}
						{...field}
						endAdornment={<InputAdornment position="end">MB</InputAdornment>} />
					</ErrorTooltip>
					);
				}} />
			</FormListItem>
			<Headline color="primary" variant="subtitle1">Placeholder Bundles</Headline>
			<FormListItem>
				 Fade distance
				<Field name="phBundleFadeDistance" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.phBundleFadeDistance || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.phBundleFadeDistance)}
						{...field}
						/>
					</ErrorTooltip>
					);
				}} />
			</FormListItem>
			<FormListItem>
				 Fade bias
				<Field name="phBundleFadeBias" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.phBundleFadeBias || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.phBundleFadeBias)}
						{...field}
						/>
					</ErrorTooltip>
					);
				}} />
			</FormListItem>
			<FormListItem>
				 Fade power
				<Field name="phBundleFadePower" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.phBundleFadePower || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.phBundleFadePower)}
						{...field}
						/>
					</ErrorTooltip>
					);
				}} />
			</FormListItem>
			<FormListItem>
				Color
				<Field name="phBundleColor" render={ ({ field }) => (
					<ColorPicker {...field} onChange={(val) => {
						// this is because colorpicker doenst use the standard events for inputs
						field.onChange({target: {name: field.name, value: val}});
					}} />
				)} />
			</FormListItem>
			<FormListItem>
				 Face alpha
				<Field name="phBundleFaceAlpha" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.phBundleFaceAlpha || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.phBundleFaceAlpha)}
						{...field}
						/>
					</ErrorTooltip>
					);
				}} />
			</FormListItem>
			<FormListItem>
				 Line alpha
				<Field name="phBundleLineAlpha" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.phBundleLineAlpha || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.phBundleLineAlpha)}
						{...field}
						/>
					</ErrorTooltip>
					);
				}} />
			</FormListItem>
		<Headline color="primary" variant="subtitle1">Placeholder Elements</Headline>
		<FormListItem>
				 Rendering radius
				<Field name="phElementRenderingRadius" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.phElementRenderingRadius || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.phElementRenderingRadius)}
						{...field}
						/>
					</ErrorTooltip>
					);
				}} />
			</FormListItem>

			<FormListItem>
				Color
				<Field name="phElementColor" render={ ({ field }) => (
					<ColorPicker {...field} onChange={(val) => {
						// this is because colorpicker doenst use the standard events for inputs
						field.onChange({target: {name: field.name, value: val}});
					}} />
				)} />
				</FormListItem>
					<FormListItem>
				 Face alpha
				<Field name="phElementFaceAlpha" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.phElementFaceAlpha || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.phElementFaceAlpha)}
						{...field}
						/>
					</ErrorTooltip>
					);
				}} />
			</FormListItem>
		<FormListItem>
				 Line alpha
				<Field name="phElementLineAlpha" render={ ({ field, form }) => {
					return (
					<ErrorTooltip title={form.errors.phElementLineAlpha || ''} placement="bottom-end">
					<ShortInput
						error={Boolean(form.errors.phElementLineAlpha)}
						{...field}
						/>
					</ErrorTooltip>
					);
				}} />
			</FormListItem>

		</List>
	)
};

const CacheWarning = (props) => {
	return (
		<List>
			<FormListItem>
				<WarningMessage>
					Warning: Enabling model caching will save model data to your browser cache.
					If you are sharing a computer, please clear the cache before logging out.
				</WarningMessage>
			</FormListItem>
		</List>
	);
};

const Buttons = (props) => {
	return (
		<VisualSettingsButtonsContainer>
			<Field render={ ({ form }) => (
			<NegativeActionButton
				color="primary"
				variant="contained"
				disabled={isEqual(form.values, DEFAULT_SETTINGS)}
				type="button"
				onClick={() => form.setValues(DEFAULT_SETTINGS)}
			>
					Reset
				</NegativeActionButton>
			)} />
			<NeutralActionButton
				color="primary"
				variant="contained"
				disabled={false}
				type="button"
				onClick={props.onClickCancel}
			>
				Cancel
			</NeutralActionButton>
			<Field render={ ({ form }) => (
					<Button
						color="secondary"
						variant="contained"
						type="submit"
						disabled={!form.isValid || form.isValidating}
					>
						Save
					</Button>
			)} />
		</VisualSettingsButtonsContainer>
	);
};

interface IProps {
	handleResolve: () => void;
	handleClose: () => void;
	updateSettings: (username: string, settings: any) => void;
	visualSettings: any;
	currentUser: string;
}

interface IState {
	selectedTab: number;
	visualSettings: any;
	flag: boolean;
	showCacheWarning: boolean;
}

export class VisualSettingsDialog extends PureComponent<IProps, IState> {
	public state = {
		selectedTab: 0,
		visualSettings: null,
		flag: false,
		showCacheWarning: false
	};

	public handleTabChange = (event, selectedTab) => {
		this.setState({ selectedTab });
	}

	public onCacheChange = (event) => {
		this.setState({showCacheWarning : event.target.checked});
	}

	public onSubmit = (values) => {
		const { updateSettings, currentUser} = this.props;

		values.nearPlane = Number(values.nearPlane);
		values.memory = Number(values.memory);
		values.farPlaneSamplingPoints = Number(values.farPlaneSamplingPoints);
		values.maxShadowDistance = Number(values.maxShadowDistance);

		updateSettings(currentUser, values);

		if (values.memory !== this.props.visualSettings.memory) {
			location.reload();
		}
		this.props.handleClose();
	}

	public componentDidMount() {
		this.setState({visualSettings: this.props.visualSettings});
	}

	public render() {
		const {selectedTab, showCacheWarning} = this.state;
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
					<DialogTab label="Streaming" />
				</DialogTabs>
				<Formik
					validationSchema={SettingsSchema}
					initialValues={visualSettings}
					enableReinitialize
					onSubmit={this.onSubmit}
					>
					<Form>
						{selectedTab === 0 && <BasicSettings onCacheChange={this.onCacheChange} />}
						{selectedTab === 1 && <AdvancedSettings />}
						{selectedTab === 2 && <StreamingSettings />}
						{selectedTab === 0 && showCacheWarning && <CacheWarning />}
						<Buttons onClickCancel={handleClose} />
					</Form>
				</Formik>
			</VisualSettingsDialogContent>
			);
	}
}
