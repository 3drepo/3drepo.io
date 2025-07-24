/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { Card, CardListItem, Link, Heading, Subheading, Details, CardImage } from './linkCard.styles';

import type { JSX } from "react";

interface ILinkCard {
	variant?: 'primary' | 'secondary',
	className?: string;
	children?: any;
	to: string;
	heading?: string | JSX.Element;
	subheading?: string | JSX.Element;
	imgSrc?: string;
	defaultImgSrc?: string;
}

export const LinkCard = ({ variant = 'primary', className, children, to, heading, subheading, imgSrc, defaultImgSrc }: ILinkCard): JSX.Element => (
	<CardListItem className={className}>
		<Link to={to}>
			<Card $variant={variant}>
				<CardImage imgSrc={imgSrc} defaultImgSrc={defaultImgSrc} />
				{children}
				<Details>
					{heading && <Heading>{heading}</Heading>}
					{subheading && <Subheading>{subheading}</Subheading>}
				</Details>
			</Card>
		</Link>
	</CardListItem>
);
