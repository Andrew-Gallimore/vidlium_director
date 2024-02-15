<h1 align="center" flexDirection="column">
    <a href="https://vidlium.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="git-imgs/FullLOGO-darkbg.png">
      <source media="(prefers-color-scheme: light)" srcset="git-imgs/FullLOGO-lightbg.png">
      <img alt="Vidlium logo" src="git-imgs/FullLOGO-lightbg.png">
    </picture>
    </a>
</h1>

<p align="center">
  <i align="center">Manage, personalize, and control video chats with advanced features. 🚀</i>
</p>

<h4 align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">
    <img src="https://img.shields.io/github/license/Andrew-Gallimore/vidlium_director" alt="license">
  </a>
  <a href="https://github.com/amplication/amplication/graphs/contributors">
    <img src="https://img.shields.io/netlify/ddf1bb6e-e2e4-4d07-9afb-db62ecbf8808?label=hosting" alt="hosting status">
  </a>
</h4>

![](https://github.com/Andrew-Gallimore/vidlium_director/blob/main/git-imgs/Directors%20Page%208_unoptimized.jpg)


<h1 align="center">
  The Director's Page
</h1>

## Introduction
`Vidlium` is a simply powerful tool to bring in remote guests into software like OBS Studio. Vidlium software helps livestream directors manage guests in multiple video chats, personalize their guest’s experiences, and control video feeds with advanced settings.

_Its fully browser based, uses vdo.ninja under the hood, and is open-source as well as completely free for everyone to use._

<br>

Check out some of the 'sister repos' of vidlium_director, you can find code for other parts of the website/software/system here:
- [Vidlium_Website (the core website)](https://github.com/Andrew-Gallimore/vidlium_website)
- [Vidlium_Docs](https://github.com/Andrew-Gallimore/vidlium_docs)


> The `Directors Page` is a critial page which allows directors to control a Vidlium Stream. This repository holds only the code for that page found here: https://vidlium.com/director.


## Usage

To start using Vidlium, the web version _(currently the only version)_ of the software is best. You can get started immediately at [vidlium.com](https://vidlium.com). The website provides access to the system as well as additional information on the code and how to do basic things via the [docs & guides](https://docs.vidlium.com).


## Development

Vidlium can be ran locally for developement purposes, although hosted locally, the system can still interact with streams created with the system hosted on vidlium.com.

<details>
<summary>
Pre-requisites
</summary> <br />
To be able to start development on Vidlium make sure that you have the following pre-requisites installed:

###

- Node.js v16 or above
- Git
</details>

<details open>
<summary>
Starting Vidlium
</summary> <br />

###

1. Clone the repository and install dependencies:
```shell
git clone https://github.com/Andrew-Gallimore/vidlium_director.git && cd vidlium_director && npm install
```

2. Run the 'cert' script, which initiates creating SSL certificates for local domain names `test.vdo.ninja` and `teststatic.vdo.ninja`:
> 
```shell
npm run cert
```
> **Note:**
> When running `cert`, it may prompt you about needing to create a password. This is a password for the device's devcert Certificate Authority, which you will need to use if you are ever creating a new domain with devcert. In this case, you should only need to enter this once.
> 
> You only need to do this step initially after first downloading, only do step 3 for subsequent times when spinning up the dev server.

3. Run the 'start' script, which takes care of making a dev-build with gulp and creating a live reloading server for local hosting:
```shell
npm run start
```

The development environment should now be set up. 

- Navigate to [test.vdo.ninja/director](https://test.vdo.ninja/director) _(in chrome)_ for the directors-page with automatic reload for when you change code.

- Navigate to [teststatic.vdo.ninja:8443/director](https://teststatic.vdo.ninja:8443/director) _(also in chrome)_ for the directors page **without** automatic reload.

Additional information on the devcert, the system used for setting up the SSL and custom domains, can be found in [DEVCERT.md](devcert.md). Happy hacking! 👾
</details>

## Contributing

Vidlium is an open-source and free project. We are committed to a fully transparent development process and highly appreciate any contributions. Whether you are helping us fix bugs, proposing new features, improving our documentation or spreading the word - we would love to have you as a part of the Vidlium community.

- Bug Report: If you run into an issue while using Vidlium, or are seeing unexpected behavior from the code, please create a bug report.

- Feature Request: If you have an idea or you're missing a capability that would make developement or vidlium as-a-whole easier/better, please submit a feature request.

## License

A large part of this project is licensed under the [GPL 3.0](https://www.gnu.org/licenses/gpl-3.0.en.html) license. Essentially stating that the code is required to stay open source. Be sure to check specific files, though, as some may come with a different lisense specific to that code.

> README.md last updated 8/26/2023

