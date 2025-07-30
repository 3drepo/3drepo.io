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

import ArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { formatDateTime } from '@/v5/helpers/intl.helper';
import { NavigateFunction } from 'react-router-dom';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { Container, DisplayedText, ProgressWrapper, StyledCircularProgress } from './revisionsSwitch.styles';

interface IProps {
	location: any;
	navigate: NavigateFunction;
	className?: string;
	modelSettings?: any;
	revisions?: any[];
	hideDialog: () => void;
	showRevisionsDialog: (config) => void;
	currentRevision: any;
	getCompareModels: (revisionId) => void;
};

export class RevisionsSwitch extends PureComponent<IProps, any> {

	public componentDidUpdate(prevProps: IProps) {
		const { currentRevision, getCompareModels } = this.props;
		if (currentRevision && currentRevision !== prevProps.currentRevision) {
			getCompareModels(currentRevision._id);
		}
	}

	public renderCurrentSwitchState = renderWhenTrue(() => (
		<DisplayedText>
			{`${this.props.modelSettings.name} - ${this.revisionName}`}
			{this.props.revisions.length > 1 && <ArrowDownIcon fontSize="small" />}
		</DisplayedText>
	));

	public renderIndicator = renderWhenTrue(() => (
		<ProgressWrapper>
			<StyledCircularProgress size={14} color="inherit" />
		</ProgressWrapper>
		)
	);

	public render() {
		return (
			<Container className={this.props.className} onClick={this.handleClick}>
				{this.renderIndicator(!this.revisionDataExists)}
				{this.renderCurrentSwitchState(this.revisionDataExists)}
			</Container>
		);
	}

	private get revisionDataExists() {
		return Boolean(this.props.modelSettings.name && this.props.revisions.length && this.props.currentRevision);
	}

	get revisionName() {
		const { currentRevision: revision } = this.props;
		return revision.tag || formatDateTime(revision.timestamp);
	}

	private setNewRevision = (revision) => {
		const { pathname } = this.props.location;
		const [, , , , currentRevisionInPath] = pathname.split('/');
		const newPathnameBase = currentRevisionInPath ? pathname.substr(0, pathname.lastIndexOf('\/')) : pathname;
		const newPathname = `${newPathnameBase}/${revision.tag || revision._id}`;

		this.props.navigate(newPathname);
		this.props.hideDialog();
	}

	private handleClick = () => {
		if (this.props.revisions.length <= 1) {
			return;
		}

		this.props.showRevisionsDialog({
			title: `Revisions - ${this.props.modelSettings.name}`,
			data: {
				currentRevisionId: this.props.currentRevision._id,
				currentModelName: this.props.modelSettings.name,
				revisions: this.props.revisions,
				handleSetNewRevision: this.setNewRevision,
				teamspace: this.props.modelSettings.account,
				modelId: this.props.modelSettings.model
			}
		});
	}
}
