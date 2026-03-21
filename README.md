# Website
![](https://github.com/nfdh/website/workflows/CI/badge.svg)

This repository contains the source code of the new website for the Nederlandse Fokkersvereniging Het Drentse Heideschaap.
The demo website is available on https://staging.drentsheideschaap.nl/

# Structure
### Frontend
The frontend consists of an Angular application.

### Backend
The backend is written in PHP.
- **index.php** Main entry point, calls the appropriate route based on url.
- **lib/routes/*.php** Implementation of the different API calls
