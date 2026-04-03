<h1 align="center">KLineChart Pro</h1>
<p align="center">Financial chart built out of the box based on KLineChart.</p>

<div align="center">

[![Version](https://badgen.net/npm/v/@klinecharts/pro)](https://www.npmjs.com/package/@klinecharts/pro)
[![Size](https://badgen.net/bundlephobia/minzip/@klinecharts/pro@latest)](https://bundlephobia.com/package/@klinecharts/pro@latest)
[![Typescript](https://badgen.net/npm/types/@klinecharts/pro)](dist/index.d.ts)
[![LICENSE](https://badgen.net/github/license/klinecharts/pro)](LICENSE)

</div>

## Install
### Using npm or yarn
```bash
# using npm
npm install @klinecharts/pro --save

# using yarn
yarn add @klinecharts/pro
```

### Using unpkg or jsDelivr
```html
<!-- using unpkg -->
<script src="https://unpkg.com/@klinecharts/pro/dist/klinecharts-pro.umd.js"></script>

<!-- using jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/@klinecharts/pro/dist/klinecharts-pro.umd.js"></script>
```

## Docs
+ [中文](https://pro.klinecharts.com)
+ [English](https://pro.klinecharts.com/en-US)

## ©️ License
KLineChart Pro is available under the Apache License V2.

## Internal Deployment (TradeStack)
This project is configured to be deployed to the private AWS Artifactory for use in the TradeStack ecosystem.

### Prerequisites
1.  **Registry URL**: Update `publishConfig.registry` in `package.json` with your Artifactory NPM repository URL.
2.  **Authentication**: Ensure you have authenticated with your Artifactory instance (e.g., via `npm login` or by providing an `.npmrc` file with the correct credentials). If using **AWS CodeArtifact**, run `aws codeartifact login` with your configuration.

### Deployment
To build and publish the library, you can use the provided `Makefile`:
```bash
make deploy
```
This command runs `npm run deploy`, which in turn builds the project and publishes it.

Alternatively, you can use `npm` directly:
```bash
npm run deploy
```
Both methods will execute `npm run build` via the `prepublishOnly` script before publishing.

### Usage in TradeStack
In your TradeStack application, you can install this library from the private registry:
```bash
npm install tradestack-klinecharts-pro --save
```
Or with yarn:
```bash
yarn add tradestack-klinecharts-pro
```
