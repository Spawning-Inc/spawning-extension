# Spawning-Extension

This browser extension allows users to scrape data from various websites. It is built using JavaScript and is compatible with both Chrome and Firefox browsers.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need Node.js and npm installed on your system. You can download Node.js [here](https://nodejs.org/en/) which comes with npm (node package manager) included.

### Installing

Clone the repository to your local machine.

```bash
git clone TODO: final repo path
cd spawning-extension
```

Then install the required dependencies with npm.

```bash
npm install
```

### .env file

For this project, you will need to create a .env file at the root of your project directory. This file will hold all your environment variables. Ensure you add this file to your .gitignore file so that it is not tracked by git.

### Building the Extension

This project uses Webpack and SASS for its build process. We have different scripts setup for building the extension for different browsers and for various needs:

- `build`: This script builds the SASS, bundles the JavaScript, and creates the production build for both Chrome and Firefox browsers. It creates a .zip file for the Chrome extension and uses `web-ext` to build the .xpi file for Firefox. Both files are put in their respective directories under the build directory.

  ```bash
  npm run build
  ```

- `build-chrome`: This script is the same as `build` but only for the Chrome browser.

  ```bash
  npm run build-chrome
  ```

- `build-firefox`: This script is the same as `build` but only for the Firefox browser.

  ```bash
  npm run build-firefox
  ```

- `watch`: This script is for development purposes. It compiles the SASS and starts the webpack development server. The server will watch for changes in your source files and recompile as needed.

  ```bash
  npm run watch
  ```

### Running the tests

The project uses Jest and Puppeteer for testing. To run the tests:

```bash
npm run test:puppeteer
```

This script will run the tests located in the `puppeteer.test.js` file.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests.

## Authors

- Spawning Inc

## License

This project is licensed under the Apache 2.0 License. See the LICENSE.md file for details.
