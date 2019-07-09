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
import CircularProgress from '@material-ui/core/CircularProgress';
import ArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

import { formatDate, LONG_DATE_TIME_FORMAT } from '../../../../services/formatting/formatDate';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { Container, DisplayedText, ProgressWrapper } from './revisionsSwitch.styles';

interface IProps {
	className?: string;
	urlParams: any;
	modelSettings?: any;
	revisions?: any[];
	history: any;
	location: any;
	hideDialog: () => void;
	showRevisionsDialog: (config) => void;
}

export class RevisionsSwitch extends React.PureComponent<IProps, any> {
	public renderCurrentSwitchState = renderWhenTrue(() => (
		<DisplayedText>
			{`${this.props.modelSettings.name} - ${this.currentRevisionName}`}
			{this.props.revisions.length > 1 && <ArrowDownIcon fontSize="small" />}
		</DisplayedText>)
	);

	public renderIndicator = renderWhenTrue(() => (
		<ProgressWrapper>
			<CircularProgress size={10} color="inherit" />
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

	private get currentRevisionName() {
		return this.props.urlParams.revision || this.getRevisionDisplayedName(this.props.revisions[0]);
	}

	private get currentRevisionId() {
		const currentRevision = this.props.revisions.find((revision) =>
			this.currentRevisionName === revision.tag ||
			this.currentRevisionName === formatDate(revision.timestamp, LONG_DATE_TIME_FORMAT)
		);

		return currentRevision._id;
	}

	private get revisionDataExists() {
		return Boolean(this.props.modelSettings.name && this.props.revisions.length && this.currentRevisionName);
	}

	private getRevisionDisplayedName = (revision) => {
		return revision.tag || formatDate(revision.timestamp, LONG_DATE_TIME_FORMAT);
	}

	private setNewRevision = (revision) => {
		const { pathname } = this.props.location;
		const [, , , , currentRevisionInPath] = pathname.split('/');
		const newPathnameBase = currentRevisionInPath ? pathname.substr(0, pathname.lastIndexOf('\/')) : pathname;
		const newPathname = `${newPathnameBase}/${revision.tag || revision._id}`;

		this.props.history.push(newPathname);
		this.props.hideDialog();
	}

	private handleClick = () => {
		if (this.props.revisions.length <= 1) {
			return;
		}

		this.props.showRevisionsDialog({
			title: `Revisions - ${this.props.modelSettings.name}`,
			data: {
				currentRevisionName: this.currentRevisionName,
				currentRevisionId: this.currentRevisionId,
				currentModelName: this.props.modelSettings.name,
				revisions: this.props.revisions,
				handleSetNewRevision: this.setNewRevision
			}
		});
	}

}
