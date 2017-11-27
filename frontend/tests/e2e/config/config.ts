import {Config} from "protractor";

export let config: Config = {
	seleniumAddress: "http://localhost:4444/wd/hub",
	specs: [ "../**.js" ],
	framework: "mocha",
	mochaOpts: {
		reporter: "spec",
		slow: 3000,
		bail: true,
	},
	capabilities: {
		browserName: "chrome",
		chromeOptions: {
			args: [
				// "--headless",
				"--start-maximized",
				"--window-size=1920x1080",
			],
		},
	},
};
