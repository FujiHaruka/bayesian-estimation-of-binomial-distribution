#!/bin/bash -eux

deno bundle --config tsconfig.json src/entrypoint.ts public/build.js
