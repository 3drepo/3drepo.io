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
import Button from '@material-ui/core/Button';

import { getAngularService } from '../../../../helpers/migration';

import { DateTime } from './../../../components/dateTime/dateTime.component';
import {
	Item,
	Row,
	Description,
	Message,
	StyledDialogActions,
	StyledDialogContent,
	StyledList,
	Property
} from './revisionsDialog.styles';

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

	public revisionClickHandler = ({ tag, _id }) => () => {
		const { modelId, handleClose, history, location: { pathname } } = this.props;

		handleClose();

		history.push(`${pathname}/${modelId}/${tag || _id}`);
		const analyticService = getAngularService('AnalyticService') as any;

		analyticService.sendEvent({
			eventCategory: 'Model',
			eventAction: 'view'
		});
	}

	public render() {
		const { handleClose, revisions } = this.props;

		return (
			<StyledDialogContent>
				{ !revisions.length ?
					<Message>No Revisions Present</Message>
					:
					<>
						<StyledList>
							{revisions && revisions.map((revision, index) => (
								<Item
									button={true}
									key={revision._id}
									divider
									onClick={this.revisionClickHandler(revision)}
									last={index === 0}>
										<Row>
										<Property >
											{revision.tag
												? revision.tag
												: '(empty tag)'}
										</Property>

										<Property >
											{revision.author}
										</Property>
									<Property >
											<DateTime value={revision.timestamp} format={'hh:mm DD MMM'} />
										</Property>
										</Row>
										<Description>{revision.desc ? revision.desc : '(empty description)'}
									</Description>
								</Item>)
							) }
						</StyledList>
						<StyledDialogActions>
							<Button variant="raised" color="secondary" onClick={handleClose}>
								Cancel
							</Button>
						</StyledDialogActions>
					</>
				}
			</StyledDialogContent>
		);
	}
}
