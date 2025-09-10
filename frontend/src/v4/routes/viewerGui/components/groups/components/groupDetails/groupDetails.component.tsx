/**
 *  Copyright (C) 2017 3D Repo Ltd
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
import { PureComponent, createRef, PropsWithChildren, UIEvent } from 'react';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Delete from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

import { isEqual } from 'lodash';
import * as Yup from 'yup';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { GROUP_PANEL_NAME, GROUP_TYPES_ICONS, GROUPS_TYPES } from '../../../../../../constants/groups';
import { rulesAreEqual , stripGroupRules } from '../../../../../../helpers/groups';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { hasSameSharedIds } from '../../../../../../helpers/tree';
import { ICriteriaFieldState } from '../../../../../../modules/groups/groups.redux';
import { ColorPicker } from '../../../../../components/colorPicker/colorPicker.component';
import { CriteriaField } from '../../../../../components/criteriaField/criteriaField.component';
import { TooltipButton } from '../../../../../teamspaces/components/tooltipButton/tooltipButton.component';
import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { ViewerPanelButton } from '../../../viewerPanel/viewerPanel.styles';
import { ViewerPanelContent as Content } from '../../../viewerPanel/viewerPanel.styles';
import { Actions, ColorPickerWrapper, Container } from './groupDetails.styles';
import { GroupDetailsForm } from './groupDetailsForm.component';

interface IProps {
	editingGroup: any;
	originalGroup: any;
	teamspace: string;
	model: string;
	revision: string;
	expandDetails: boolean;
	currentUser: any;
	modelSettings: any;
	canUpdate: boolean;
	selectedNodes: any[];
	criteriaFieldState: ICriteriaFieldState;
	createGroup: (teamspace: any, modelId: any, revision: any) => void;
	updateGroup: (teamspace: any, modelId: any, revision: any, groupId: any) => void;
	updateEditingGroup: (fields: any) => void;
	setCriteriaFieldState: (criteriFieldState: Partial<ICriteriaFieldState>) => any;
	setSelectedCriterionId: (id) => void;
	resetToSavedSelection: () => void;
	isPending: boolean;
	deleteGroup: (id: string | null) => void;
	isReadOnly: boolean;
}

interface IState {
	isFormValid: boolean;
	isFormDirty: boolean;
	scrolled: boolean;
}

const GroupSchema = Yup.object().shape({
	name: Yup.string().required(),
	desc: Yup.string().max(220),
	rules: Yup.array(),
	type: Yup.string()
}).test(({type, rules}) => {
	return type === GROUPS_TYPES.NORMAL ||  rules.length > 0 ;
});

export class GroupDetails extends PureComponent<IProps, IState> {
	get isNewGroup() {
		return !this.props.editingGroup._id;
	}

	get isSmartGroup() {
		return this.editingGroup.type === GROUPS_TYPES.SMART;
	}

	get objectsCount() {
		return this.isNewGroup ? this.props.selectedNodes.length : this.editingGroup.totalSavedMeshes;
	}

	get editingGroup() {
		return this.props.editingGroup;
	}

	get isFormValid() {
		return this.state.isFormDirty && this.state.isFormValid ;
	}

	public state = {
		isFormValid: false,
		isFormDirty: false,
		scrolled: false,
	};

	public formRef = createRef<HTMLElement>() as any;
	public panelRef = createRef<any>();

	public handleCriteriaFieldClose = (criterionForm) => {
		if (this.panelRef.current) {
			// user changed group using arrows, so we don't save the form
			return;
		}
		this.props.setCriteriaFieldState({ criterionForm });
	}

	public renderRulesField = renderWhenTrue(() => (
		<CriteriaField
			name="rules"
			value={this.editingGroup.rules}
			updateEditingGroup={this.props.updateEditingGroup}
			{...this.props.criteriaFieldState}
			onChange={this.handleFieldChange}
			onCriterionSelect={this.handleCriterionSelect}
			setCriteriaFieldState={this.props.setCriteriaFieldState}
			setSelectedCriterionId={this.props.setSelectedCriterionId}
			label="Filters"
			placeholder="Select first filter"
			disabled={!this.props.canUpdate || this.props.isReadOnly}
			onClose={this.handleCriteriaFieldClose}
		/>
	));

	public renderPreview = renderWhenTrue(() => (
		<PreviewDetails
			key={this.editingGroup._id}
			{...this.editingGroup}
			roleColor={this.editingGroup.color}
			created={this.editingGroup.createdAt}
			editable={this.props.canUpdate}
			onNameChange={this.handleFieldChange}
			renderCollapsable={this.renderGroupForm}
			renderNotCollapsable={() => this.renderRulesField(this.isSmartGroup)}
			panelName={GROUP_PANEL_NAME}
			isSmartGroup={this.isSmartGroup}
			StatusIconComponent={GROUP_TYPES_ICONS[this.editingGroup.type]}
			scrolled={this.state.scrolled}
			isNew={this.isNewGroup}
			defaultExpanded
		/>
	));

	public componentDidMount() {
		this.setState({
			isFormDirty: this.isNewGroup,
			isFormValid: this.isNewGroup && this.objectsCount > 0,
		});
	}

	public componentDidUpdate(prevProps: Readonly<PropsWithChildren<IProps>>) {
		if (prevProps === this.props) {
			return;
		}

		if (!this.isNewGroup) {
			// We ignore the setDirty in newgroup because is always dirty, just needs to be valid.
			const wasUpdated = !isEqual(stripGroupRules(this.editingGroup), stripGroupRules(this.props.originalGroup));

			// We check only for smartgroups if the rules changed
			const rulesChanged = this.isSmartGroup && !rulesAreEqual(this.editingGroup, this.props.originalGroup);

			// if it is a smart group, we ignore the manual selection because it depends on the rules
			const selectionChanged = !this.isSmartGroup && !hasSameSharedIds(this.props.selectedNodes, this.editingGroup.objects);

			this.setIsFormDirty(wasUpdated || selectionChanged || rulesChanged);
		}

		// if it is a smart group, we ignore the manual selection because it depends on the rules
		const groupHasValidSelection = this.isSmartGroup || this.props.selectedNodes.length > 0;
		this.setIsFormValid(GroupSchema.isValidSync(this.editingGroup) && groupHasValidSelection);
	}

	public handleGroupFormSubmit = () => {
		const { teamspace, model, revision, updateGroup, createGroup } = this.props;

		if (this.isNewGroup) {
			createGroup(teamspace, model, revision);
		} else {
			updateGroup(teamspace, model, revision, this.editingGroup._id);
		}
	}

	public handleFieldChange = (event: { target: { name: any; value: any; }; }) => {
		this.props.updateEditingGroup({[event.target.name]: event.target.value});
	}

	public handleColorChange = (color: any) => {
		this.props.updateEditingGroup({color});
	}

	public renderGroupForm = () => (
		<GroupDetailsForm
			ref={this.formRef}
			key={`${this.editingGroup._id}.${this.editingGroup.updatedAt}`}
			group={this.editingGroup}
			currentUser={this.props.currentUser}
			objectsCount={this.objectsCount}
			canUpdate={this.props.canUpdate}
			handleChange={this.handleFieldChange}
		/>
	)

	public handleCriterionSelect = (criterion: any) => {
		this.props.setCriteriaFieldState({ selectedCriterionId: criterion._id });
	}

	public handlePanelScroll = (event: UIEvent) => {
		const target = event.target as HTMLDivElement;
		if (target.scrollHeight > target.offsetHeight + target.scrollTop) {
			if (target.scrollTop > 0 && !this.state.scrolled) {
				this.setState({ scrolled: true });
			}
			if (target.scrollTop === 0 && this.state.scrolled) {
				this.setState({ scrolled: false });
			}
		} else {
			if (this.state.scrolled) {
				this.setState({ scrolled: false });
			}
		}
	}

	public setIsFormValid = (isFormValid: boolean) => {
		this.setState({ isFormValid });
	}

	public setIsFormDirty = (isFormDirty: boolean) => {
		this.setState({ isFormDirty });
	}

	public handleDelete = () => {
		this.props.deleteGroup(this.editingGroup._id);
	}

	public renderFooter = () => {
		return (
			<ViewerPanelFooter container alignItems="center">
				<Actions>
					<ColorPickerWrapper>
						<ColorPicker
							value={this.editingGroup.color}
							onChange={this.handleColorChange}
							disabled={!this.props.canUpdate}
							opacityEnabled
						/>
					</ColorPickerWrapper>
					{ !this.isNewGroup &&
						<TooltipButton
							label="Reset to saved selection"
							action={this.props.resetToSavedSelection}
							Icon={AutorenewIcon}
						/>
					}
					<TooltipButton
						label="Delete"
						action={this.handleDelete}
						Icon={Delete}
						disabled={!this.props.canUpdate}
					/>
				</Actions>
				<ViewerPanelButton
					variant="fab"
					color="secondary"
					type="submit"
					onClick={this.handleGroupFormSubmit}
					size="small"
					aria-label="Save group"
					disabled={!this.isFormValid || !this.props.canUpdate}
					pending={this.props.isPending}
					id="groups-card-save-button"
				>
					<SaveIcon />
				</ViewerPanelButton>
			</ViewerPanelFooter>
		);
	}

	public render() {
		return (
			<Container>
				<Content
					onScroll={this.handlePanelScroll}
					ref={this.panelRef}
				>
					{this.renderPreview(this.editingGroup)}
				</Content>
				{this.renderFooter()}
			</Container>
		);
	}
}
