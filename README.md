# Spawning-Extension

The Spawning Extension makes it simple for users to search if their content has been used to train AI models. It works by searching the current page for different types of media (text, images, and other media), displays the results to the user, and allows the user to analyze the media, and related media, in Have I Been Trained (HIBT). The displayed results in HIBT allow users to opt-out the content found via the search results, while also assisting in discovery of other content which may not have been found by the extension. The extension can be easily configured to focus on specific types of media, ensuring your search is as broad, or as targeted, as you need.

## Links

[Chrome](https://chrome.google.com/webstore/detail/gflllnclkhgldggflpajgmneddanojbo)  
[Firefox (Experimental)](https://addons.mozilla.org/en-US/firefox/addon/spawning/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need Node.js and npm installed on your system. You can download Node.js [here](https://nodejs.org/en/) which comes with npm (node package manager) included.

### Installing

Clone the repository to your local machine.

```bash
git clone https://github.com/Spawning-Inc/spawning-extension
cd spawning-extension
```

Then install the required dependencies with npm.

```bash
npm install
```

### .env file

For this project, you will need to create a `.env` file at the root of your project directory. This file will hold all your environment variables. An example file is at `.env.example`.

### Building the Extension

This project uses Webpack and SASS for its build process. We have different scripts setup for building the extension for different browsers and for various needs:

- `build`: This script builds the SASS, bundles the JavaScript, and creates the production build for the Chrome, Firefox and Edge browsers. It creates a .zip file for the Chrome and Edge extensions and uses `web-ext` to build the .xpi file for Firefox. Both files are put in their respective directories under the build directory.

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

- `build-edge`: This script is the same as `build` but only for the Edge browser.

  ```bash
  npm run build-edge
  ```

- `build-safari`: This script is the same as `build` but only for the Safari browser.

  ```bash
  npm run build-safari
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

- Patrick Hoepner <patrick@spawning.ai>
- Annalia DeStefano <annalia@spawning.ai>

## License

This project is licensed under the Apache 2.0 License. See the LICENSE.md file for details.
