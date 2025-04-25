# Sports Arbitrage Web

A static web interface for displaying sports arbitrage betting opportunities fetched from the Sports Arbitrage System API.

## Overview

This web application allows users to view profitable arbitrage betting opportunities across different sports bookmakers. It's designed to be hosted on GitHub Pages and communicates with a backend API to fetch real-time betting data.

## Features

- View arbitrage opportunities with detailed information
- Filter opportunities by sport, bookmaker, bet type, and profit margin
- Calculate optimal bet amounts for different stake levels
- Direct links to bookmaker websites
- Responsive design for desktop and mobile devices

## Setup

1. Clone this repository
2. Configure the API URL in the settings panel of the app
3. Host on GitHub Pages or any static web hosting service

## Configuration

By default, the application will try to connect to a demo API. To connect to your own Sports Arbitrage System API:

1. Open the application in a browser
2. Click on the API Settings section
3. Enter your API URL and save

## Deployment

This application is designed to be deployed to GitHub Pages:

1. Push the code to your GitHub repository
2. Go to Settings > GitHub Pages
3. Select the branch to deploy (usually `main` or `gh-pages`)
4. Your site will be published at `https://<username>.github.io/<repository>/`

## Dependencies

- Bootstrap 5.3.0
- jQuery 3.6.0

## License

MIT