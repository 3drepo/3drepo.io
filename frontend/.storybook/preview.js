import { muiTheme } from 'storybook-addon-material-ui5'
import { theme as V5Theme } from '@/v5/ui/themes/theme';
import { theme as V4Theme } from '@/v4/styles/theme';
import { IntlProvider } from 'react-intl';
import { getIntlProviderProps } from '@/v5/services/intl';

import { withThemesProvider } from "storybook-addon-styled-component-theme";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
    expanded: true,
  },
  docs: {
    transformSource: source => source.replace(/WithStyles\(ForwardRef\(/g, "").replace(/\)\)/g, ""),
  },
}

export const decorators = [
	muiTheme([{themeName: 'V5 theme', ...V5Theme}, {themeName: 'V4 theme', ...V4Theme}]),
  withThemesProvider([V5Theme]),
  (Story) => (
    <IntlProvider {...getIntlProviderProps()}>
      <Story />
    </IntlProvider>
  ),
];
