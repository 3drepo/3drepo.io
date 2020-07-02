import React from 'react';
import ReactMarkdown from 'react-markdown';
import breaks from 'remark-breaks';

import { renderers } from './markdownMessage.renderers';

export const MarkdownMessage = ({ className, children }) => (
	<ReactMarkdown
		source={children}
		renderers={renderers}
		plugins={[breaks]}
		className={className}
	/>
);
