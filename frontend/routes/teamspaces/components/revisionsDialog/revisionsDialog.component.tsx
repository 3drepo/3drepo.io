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

import * as React from 'react';
import DialogContent from '@material-ui/core/DialogContent';
import List from '@material-ui/core/List';
import { DateTime } from './../../../components/dateTime/dateTime.component';
import { Item, Column, Property } from './revisionsDialog.styles';

interface IProps {
	fetchModelRevisions: (teamspace, modelId) => void;
	handleClose: () => void;
	revisions: any[];
	teamspace: string;
	modelId: string;
	location: any;
	history: any;
}

export class RevisionsDialog extends React.PureComponent<IProps, any> {
	public componentDidMount() {
		this.props.fetchModelRevisions(this.props.teamspace, this.props.modelId);
	}

	public revisionClickHandler = (event, tag) => {
		const { modelId, handleClose, history, location: { pathname } } = this.props;
		handleClose();
		history.push(`${pathname}/${modelId}/${tag}`);
	}

	public render() {
		return (
			<DialogContent>
				<List>
					{this.props.revisions && this.props.revisions.map((revision) => {
						return(
							<Item button key={revision._id}
								onClick={(event) => this.revisionClickHandler(event, revision.tag)}>
								<Column>
									<Property>
										{revision.tag
											? revision.tag
											: <DateTime value={revision.timestamp} format={'D MMM'} /> }
									</Property>
									<Property>{revision.author}</Property>
								</Column>
								<Column>
									<Property>
										<DateTime value={revision.timestamp} format={'D MMM'} />
									</Property>
									<Property>ID: {revision._id}</Property>
								</Column>
							</Item>);
						})}
				</List>
			</DialogContent>
		);
	}
}
