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
import { schema } from '../../../../../services/validation';
import { ColorPicker } from '../../../colorPicker/colorPicker.component';
import { SelectField } from '../../../selectField/selectField.component';
import { DialogTab, DialogTabs, ErrorTooltip, FormListItem, Headline,
	NegativeActionButton, NeutralActionButton,
	ShortInput, SubHeading, V5Divider, V5ErrorText, VisualSettingsButtonsContainer,
	VisualSettingsDialogContent, WarningMessage } from './visualSettingsDialog.styles';

const SettingsSchema = Yup.object().shape({
	nearPlane: schema.number(0, Number.POSITIVE_INFINITY),
	maxNearPlane: schema.number(-1, Number.POSITIVE_INFINITY),
	maxFarPlane: schema.number(-1, Number.POSITIVE_INFINITY),
	unityMemory: schema.integer(0, 4096),
	farPlaneSamplingPoints: schema.integer(1, Number.POSITIVE_INFINITY),
	maxShadowDistance: schema.integer(1, Number.POSITIVE_INFINITY),
	numCacheThreads: schema.integer(1, 15),
	clipPlaneBorderWidth: schema.number(0, 1),
	memoryThreshold: schema.number(0, 2032),
	fovWeight: schema.number(0, 10),
	meshFactor: schema.number(1, Number.POSITIVE_INFINITY),
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
				Viewer Background Color
				<Field name="viewerBackgroundColor" render={ ({ field }) => (
					<ColorPicker {...field} onChange={(val) => {
						// this is because colorpicker doesn't use the standard events for inputs
						field.onChange({target: {name: field.name, value: val}});
					}} />
				)} />
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
			<V5Divider />
			<FormListItem>
				XRay highlighting
				<Field name="xray" render={ ({ field }) => (
					<Switch checked={field.value} {...field} value="true" color="secondary" />
				)} />
			</FormListItem>
			<FormListItem>
				Model Caching
				<Field name="caching" render={ ({ field }) => (
					<Switch onClick={props.onCacheChange} checked={field.value} {...field} value="true" color="secondary" />
				)} />
			</FormListItem>
			<V5Divider />
			<FormListItem>
				Clipping plane border width
				<Field name="clipPlaneBorderWidth" render={ ({ field, form }) => {
					return (
						<div>
							<ErrorTooltip title={form.errors.clipPlaneBorderWidth || ''} placement="bottom-end">
								<ShortInput
									error={Boolean(form.errors.clipPlaneBorderWidth)}
									{...field}
									helpertext={form.errors.clipPlaneBorderWidth}
								/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.clipPlaneBorderWidth}
							</V5ErrorText>
						</div>
					);
				}} />
			</FormListItem>
			<FormListItem>
				Clipping plane border color
				<Field name="clipPlaneBorderColor" render={ ({ field }) => (
					<ColorPicker {...field} onChange={(val) => {
						// this is because colorpicker doesn't use the standard events for inputs
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
			<FormListItem>
					Memory for Unity
					<Field name="unityMemory" render={ ({ field, form }) => {
						return (
							<div>
								<ErrorTooltip title={form.errors.memory || ''} placement="bottom-end">
								<ShortInput
									error={Boolean(form.errors.memory)}
									{...field}
									endAdornment={<InputAdornment position="end">MB</InputAdornment>} />
								</ErrorTooltip>
								<V5ErrorText>
									{form.errors.memory}
								</V5ErrorText>
							</div>
						);
					}} />
				</FormListItem>
			<FormListItem>
				Number of Caching Threads
				<Field name="numCacheThreads" render={ ({ field, form }) => {
					return (
						<div>
							<ErrorTooltip title={form.errors.numCacheThreads || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.numCacheThreads)}
								{...field}
								/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.numCacheThreads}
							</V5ErrorText>
						</div>
					);
				}} />
			</FormListItem>
			<V5Divider />
			<FormListItem>
				Minimum near plane
				<Field name="nearPlane" render={ ({ field, form }) => {
					return (
						<div>
							<ErrorTooltip title={form.errors.nearPlane || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.nearPlane)}
								{...field}
								/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.nearPlane}
							</V5ErrorText>
						</div>
					);
				}} />
			</FormListItem>
			<FormListItem>
				Maximum near plane
				<Field name="maxNearPlane" render={ ({ field, form }) => {
					return (
						<div>
							<ErrorTooltip title={form.errors.maxNearPlane || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.maxNearPlane)}
								{...field}
								/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.maxNearPlane}
							</V5ErrorText>
						</div>
					);
				}} />
			</FormListItem>
			<V5Divider />
			<FormListItem>
				Maximum far plane
				<Field name="maxFarPlane" render={ ({ field, form }) => {
					return (
						<div>
							<ErrorTooltip title={form.errors.maxFarPlane || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.maxFarPlane)}
								{...field}
								/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.maxFarPlane}
							</V5ErrorText>
						</div>
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
						<div>
							<ErrorTooltip title={form.errors.farPlaneSamplingPoints || ''} placement="bottom-end">
							<ShortInput
								disabled={form.values.farPlaneAlgorithm !== 'box'}
								error={Boolean(form.errors.farPlaneSamplingPoints)}
								{...field}
								/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.farPlaneSamplingPoints}
							</V5ErrorText>
						</div>
					);
				}} />
			</FormListItem>
			<V5Divider />
			<FormListItem>
				Maximum Shadow Distance
				<Field name="maxShadowDistance" render={ ({ field, form }) => {
					return (
						<div>
							<ErrorTooltip title={form.errors.maxShadowDistance || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.maxShadowDistance)}
								{...field}
								/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.maxShadowDistance}
							</V5ErrorText>
						</div>
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
						<div>
							<ErrorTooltip title={form.errors.memoryThreshold || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.memoryThreshold)}
								{...field}
								endAdornment={<InputAdornment position="end">MB</InputAdornment>} />
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.memoryThreshold}
							</V5ErrorText>
						</div>
					);
				}} />
			</FormListItem>
			<FormListItem>
				Mesh Factor
				<Field name="meshFactor" render={ ({ field, form }) => {
					return (
						<div>
							<ErrorTooltip title={form.errors.meshFactor || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.meshFactor)}
								{...field}
							/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.meshFactor}
							</V5ErrorText>
						</div>
					);
				}} />
			</FormListItem>
			<FormListItem>
				FoV Weight
				<Field name="fovWeight" render={ ({ field, form }) => {
					return (
						<div>
							<ErrorTooltip title={form.errors.fovWeight || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.fovWeight)}
								{...field}
							/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.fovWeight}
							</V5ErrorText>
						</div>
					);
				}} />
			</FormListItem>
			<Headline color="primary" variant="subtitle1">Placeholder Bundles</Headline>
			<FormListItem>
				 Fade distance
				<Field name="phBundleFadeDistance" render={ ({ field, form }) => {
					return (
						<div>
							<ErrorTooltip title={form.errors.phBundleFadeDistance || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.phBundleFadeDistance)}
								{...field}
								/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.phBundleFadeDistance}
							</V5ErrorText>
						</div>
					);
				}} />
			</FormListItem>
			<FormListItem>
				 Fade bias
				<Field name="phBundleFadeBias" render={ ({ field, form }) => {
					return (
						<div>
							<ErrorTooltip title={form.errors.phBundleFadeBias || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.phBundleFadeBias)}
								{...field}
								/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.phBundleFadeBias}
							</V5ErrorText>
						</div>
					);
				}} />
			</FormListItem>
			<FormListItem>
				 Fade power
				<Field name="phBundleFadePower" render={ ({ field, form }) => {
					return (
						<div>
							<ErrorTooltip title={form.errors.phBundleFadePower || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.phBundleFadePower)}
								{...field}
								/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.phBundleFadePower}
							</V5ErrorText>
						</div>
					);
				}} />
			</FormListItem>
			<FormListItem>
				Color
				<Field name="phBundleColor" render={ ({ field }) => (
					<ColorPicker {...field} onChange={(val) => {
						// this is because colorpicker doesn't use the standard events for inputs
						field.onChange({target: {name: field.name, value: val}});
					}} />
				)} />
			</FormListItem>
			<FormListItem>
				 Face alpha
				<Field name="phBundleFaceAlpha" render={ ({ field, form }) => {
					return (
						<div>
							<ErrorTooltip title={form.errors.phBundleFaceAlpha || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.phBundleFaceAlpha)}
								{...field}
								/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.phBundleFaceAlpha}
							</V5ErrorText>
						</div>
					);
				}} />
			</FormListItem>
			<FormListItem>
				 Line alpha
				<Field name="phBundleLineAlpha" render={ ({ field, form }) => {
					return (
						<div>
							<ErrorTooltip title={form.errors.phBundleLineAlpha || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.phBundleLineAlpha)}
								{...field}
								/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.phBundleLineAlpha}
							</V5ErrorText>
						</div>
					);
				}} />
			</FormListItem>
		<Headline color="primary" variant="subtitle1">Placeholder Elements</Headline>
		<FormListItem>
				 Rendering radius
				<Field name="phElementRenderingRadius" render={ ({ field, form }) => {
					return (
						<div>
							<ErrorTooltip title={form.errors.phElementRenderingRadius || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.phElementRenderingRadius)}
								{...field}
								/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.phElementRenderingRadius}
							</V5ErrorText>
						</div>
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
						<div>
							<ErrorTooltip title={form.errors.phElementFaceAlpha || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.phElementFaceAlpha)}
								{...field}
								/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.phElementFaceAlpha}
							</V5ErrorText>
						</div>
					);
				}} />
			</FormListItem>
		<FormListItem>
				 Line alpha
				<Field name="phElementLineAlpha" render={ ({ field, form }) => {
					return (
						<div>
							<ErrorTooltip title={form.errors.phElementLineAlpha || ''} placement="bottom-end">
							<ShortInput
								error={Boolean(form.errors.phElementLineAlpha)}
								{...field}
								/>
							</ErrorTooltip>
							<V5ErrorText>
								{form.errors.phElementLineAlpha}
							</V5ErrorText>
						</div>
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
				onClick={() => {
					form.setValues(DEFAULT_SETTINGS);
					props.hideWarning();
				}}
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
						disabled={!form.isValid || form.isValidating || !form.dirty}
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
		showCacheWarning: false,
	};

	public handleTabChange = (event, selectedTab) => {
		this.setState({ selectedTab });
	}

	public onCacheChange = (event) => {
		this.setState({showCacheWarning : event.target.checked});
	}

	public onSubmit = (values) => {
		const { updateSettings, currentUser} = this.props;
		const parsedValues = {
			...values,
			nearPlane: Number(values.nearPlane),
			unityMemory: Number(values.unityMemory),
			farPlaneSamplingPoints: Number(values.farPlaneSamplingPoints),
			maxShadowDistance: Number(values.maxShadowDistance),
		};

		updateSettings(currentUser, parsedValues);

		this.props.handleClose();
	}

	public hideWarning = () => {
		this.setState({ showCacheWarning: false });
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
						{selectedTab === 0 && (
							<BasicSettings
								onCacheChange={this.onCacheChange}
							/>
						)}
						{selectedTab === 1 && <AdvancedSettings />}
						{selectedTab === 2 && <StreamingSettings />}
						{selectedTab === 0 && showCacheWarning && <CacheWarning />}
						<Buttons onClickCancel={handleClose} hideWarning={this.hideWarning} />
					</Form>
				</Formik>
			</VisualSettingsDialogContent>
			);
	}
}
