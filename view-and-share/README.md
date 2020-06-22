## Pryv View and Share Data Tutorial 

Example of implementation of a web app used for visualizing & sharing data.

## User story

In the previous tutorial [Collect Survey Data](https://github.com/pryv/app-web-examples/tree/master/view-and-share), you have collected and stored data from the mother in her Pryv.io account when she has answered to the example survey.

In this web app, you provide her with a tool to visualize data from her account and to share it with third parties.

## Project Specifications

- Ask for login
- Request access for the app "pryv-example-view-and-share" to read the streams "Baby" and "Body"
- Display the data
- Create or delete a sharing (URL or email) to a third party
- Display shared data 

## Data structure

This use case implies the stream structure from the example "Collect Survey Data" as illustrated below.

The app "pryv-example-view-and-share" first requests an access on the streams "Baby" and "Body" with a "read" level in order to be able to display the events contained in these streams:

![Stream structure](README-illustration.svg) 

