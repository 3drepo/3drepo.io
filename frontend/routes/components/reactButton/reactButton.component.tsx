import * as React from 'react';
import * as PropTypes from 'prop-types';

import { Container } from './reactButton.styles';

export class ReactButton extends React.PureComponent {
	static propTypes = {
		text: PropTypes.string
	};

	public render() {
		return (
			<Container>
				ReactButton component {this.props.testProp}
			</Container>
		);
	}
}
