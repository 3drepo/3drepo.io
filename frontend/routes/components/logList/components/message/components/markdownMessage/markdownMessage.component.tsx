import React from 'react';
import ReactMarkdown from 'react-markdown/with-html';

import { renderers } from './markdownMessage.renderers';

export const MarkdownMessage = ({ className, children }) => (
	<ReactMarkdown
		source={children}
		renderers={renderers}
		escapeHtml={false}
		className={className}
	/>
);
