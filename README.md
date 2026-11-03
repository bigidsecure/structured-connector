# Structured Customer Connector (TypeScript Sample)

An Express/TypeScript training connector that demonstrates BigID’s structured-object REST shape for a `Customer` object. It uses a sample customer response to define flattened fields and calls the Shopify Admin REST API for customer records, counts, and searches.

## Current status and limitations

This is a training scaffold, not a production-ready connector. In particular, the current container/enumeration implementation returns `null`, so BigID cannot use it as a complete connector. The Shopify REST API version is hard-coded to `2020-10`; verify and update API compatibility before testing against a store. The server also logs incoming Basic Auth details—remove that logging before supplying real credentials.

The connector expects Basic Auth from BigID: the username is used as the Shopify shop host and the password as the Shopify Admin API token. Use a test store and least-privilege credentials.

## Run locally

Requires Node.js and npm.

```sh
npm install
npx gulp develop
```

Gulp compiles the TypeScript and starts a watcher-backed development server on **port 8000**. To build the files for the included Dockerfile:

```sh
npx gulp
docker build -t structured-customer-connector .
docker run --rm -p 8000:8000 structured-customer-connector
```

## REST routes

The Express app exposes `/objects`, `/objects/:objectName/describe`, `/objects/:objectName/count`, `/objects/:objectName/records`, `/objects/:objectName/records/:recordId`, and a prototype search route at `/objects/:objectName/sar`. All routes use HTTP Basic Auth. The search route currently uses `GET` with query parameters and may need adaptation to your BigID connector contract.

<!-- bigidsecure-community-guidance -->
## BigID Community

This repository is part of [BigID Community](https://github.com/bigidsecure), a place for community members to share code, integrations, examples, and projects with other BigID customers.

Project ownership and support vary by repository. Check the maintainers, license, prerequisites, and compatibility notes before use, and validate the project in your own environment. Unless this repository explicitly says otherwise, do not assume the project is officially supported or maintained by BigID.

Please do not commit credentials, customer data, or other confidential information. Check this repository’s contribution guidance before submitting changes.
