## FRC Match Scouting API
<!-- These are all links / images to build  -->
[![Actions Status](https://img.shields.io/github/workflow/status/MrCoderBoy345/FRC-Match-Scouting-API/CI/master)](https://github.com/MrCoderBoy345/FRC-Match-Scouting-API/actions)
[![License](https://img.shields.io/github/license/MrCoderBoy345/FRC-Match-Scouting-API)](https://github.com/MrCoderBoy345/FRC-Match-Scouting-API/blob/master/LICENSE)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/standard/standard)
[![Deploy](https://img.shields.io/badge/%E2%86%91_Deploy_to-Heroku-7056bf.svg)](https://heroku.com/deploy?template=https://github.com/MrCoderBoy345/FRC-Match-Scouting-API)

This is the backend server for [my scouting app](https://github.com/MrCoderBoy345/FRC-Match-Scouting-App).
I plan to make a public API for others to query ELO, OPR, and DPR from my server.

## Motivation
I built this match scouting program because all of the solutions that we tried for collecting scouting data didn't have simple number inputs with easy incrementing. Because I got tired of looking for a program that does, I just created my own scouting infrastructure from the ground up using my knowledge of backend development and Flutter.

## Features
Stores all of the data for each team

## Running Locally
### Setting up the project
Set up a PostgreSQL server

Clone the repository and run `npm install`

Add your TBA key and connection string to the ENV by setting the environment variables `TBAKEY` and `DATABASE_URL`.

### Running the dev server
Run `npm start` then the API will be live on `localhost:3000`.