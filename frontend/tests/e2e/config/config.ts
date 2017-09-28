import {Config} from 'protractor';

export let config: Config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [ '../**.js' ],
  framework: "mocha",
  mochaOpts: {
    reporter: "spec",
    slow: 3000
  },
  capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
      args: [ "--headless", "--disable-gpu", "--window-size=1920x1080"  ]
    }
  },
};