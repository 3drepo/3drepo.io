import React from 'react';

import { cond, get, mapValues, stubTrue } from 'lodash';

import {
	MARKDOWN_INTERNAL_IMAGE_PATH_REGEX,
	MARKDOWN_RESOURCE_REFERENCE_REGEX,
	MARKDOWN_TICKET_REFERENCE_REGEX,
	MARKDOWN_USER_REFERENCE_REGEX
} from '../../../../../../../helpers/comments';
import { getAPIUrl } from '../../../../../../../services/api';
import { Image } from '../screenshot/screenshot.styles';
import { Blockquote, Paragraph } from './markdownMessage.styles';
import { ResourceReference } from './resourceReference/';
import { TicketReference } from './ticketReference/';
import { UserReference } from './userReference/userReference.component';

const withStyledRenderer = (StyledComponent) => (props) => <StyledComponent {...props} />;

const EnhancedParagraph = (props) => {
	const { children } = props;
	const hasSingleChild = children && children[0] && children.length === 1;
	const hasInvalidStructure = hasSingleChild && get(children, ['0', 'props', 'values'], null);
	if (hasInvalidStructure) {
		return children;
	}

	return <Paragraph {...props} />;
};

const EnhancedLink = ({ children, href, ...props }) => {
	const value = get(children, ['0', 'props', 'value'], children);

	return cond([
		[() => value.match(MARKDOWN_RESOURCE_REFERENCE_REGEX), () => {
			return (<ResourceReference id={href} text={value} type={props.title} />);
		}],
		[() => value.match(MARKDOWN_TICKET_REFERENCE_REGEX), () => {
			return (<TicketReference id={href} text={value} />);
		}],
		[() => value.match(MARKDOWN_USER_REFERENCE_REGEX), () => {
			return (<UserReference id={href} text={value} />);
		}],
		[stubTrue, () => (<a href={href} target="_blank" rel="noopener noreferrer">{value}</a>)]
	])(value);
};

const EnhancedImage = ({ children, src, ...props }) => cond([
	[() => src.match(MARKDOWN_INTERNAL_IMAGE_PATH_REGEX), () => (
		<Image src={getAPIUrl(src.replace(MARKDOWN_INTERNAL_IMAGE_PATH_REGEX, ''))} enablePreview enablePlaceholder />
	)],
	[stubTrue, () => (<Image src={src} enablePreview enablePlaceholder />)]
])(src);

export const renderers = mapValues({
	link: EnhancedLink,
	paragraph: EnhancedParagraph,
	blockquote: Blockquote,
	image: EnhancedImage,
}, withStyledRenderer);
