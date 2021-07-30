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
import { FieldArray } from 'formik';
import * as React from 'react';
import { LabelButton } from '../../../viewerGui/components/labelButton/labelButton.styles';
import { LinkEntry } from './attachResourceLinkEntry.component';
import {
	AddLinkContainer,
	ResourcesListContainer,
	ResourcesListScroller
} from './attachResourcesDialog.styles';

interface IProps {
	links: any[];
}

interface IResourceUrl {
	name: string;
	url: string;
}

interface IState {
	urls: IResourceUrl[];
}

export class AttachResourceUrls extends React.PureComponent<IProps, IState> {
	public render() {
		const { links } = this.props;

		return (
			<FieldArray
			name="links"
			render={(arrayHelpers) => (
				<div>
					<ResourcesListScroller>
						<ResourcesListContainer>
						{(links && links.length > 0) && (
							links.map((link, index) => (
								<LinkEntry key={index}
									index={index}
									onClickRemove={() => arrayHelpers.remove(index)}
								/>
							))
						)}
						</ResourcesListContainer>
					</ResourcesListScroller>
					<AddLinkContainer>
						<LabelButton onClick={() => arrayHelpers.insert(0, {name: '', link: ''})}>Add link</LabelButton>
					</AddLinkContainer>
				</div>
			)}
			/>
		);
	}
}
