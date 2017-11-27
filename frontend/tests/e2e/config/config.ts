import {Config} from "protractor";

export let config: Config = {
	capabilities: {
		browserName: "chrome",
		chromeOptions: {
			args: [
				"--headless",
				"--start-maximized",
				"--window-size=1920x1080",
			],
		},
	},
	framework: "mocha",
	mochaOpts: {
		bail: true,
		reporter: "spec",
		slow: 3000,
	},
	seleniumAddress: "http://localhost:4444/wd/hub",
	specs: [ "../**.js" ],
};
