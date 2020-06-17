## Pryv Simple Form Tutorial 

Example of implementation of a web app used for creation & collection of answers to a simple form.

## User story

You are creating a simple form to track the mother's blood pressure and the baby's weight after the mother leaves the maternity hospital.
When the mother logs in to her Pryv.io account, she receives an access request from your app on the necessary streams.
Once she gives her consent to the app, she can answer the questions of the form and submit the values.

## Project Specifications

- Create form UI
- Ask for login
- Request access for the app "pryv-example-simple-form" on the streams "Baby" and "Body"
- Display the form
- Submit answers and store the values in the relevant streams

## Data structure

This use case implies the creation of a stream structure and the use of different event types that are explained below.

### Stream structure

The app "pryv-example-simple-form" first requests an access on the streams "Baby" and "Body" with a "manage" level in order to be able to create create, modify and delete child streams.
The blood pressure of the mother is stored as an event and added to the stream "Heart", while the weight of the baby is added to the stream "Baby-Body".

The following stream structure is created in the variable `apiCall`:

![Stream structure](/simple-form/assets/Use_case_form_collection.svg) 

### Event types

The [Event types directory](https://api.pryv.com/event-types/) contains standard event types, and can be customized and completed with your own event types.

In our example, we use the event type `mass/kg` for the baby's weight (see [here](https://api.pryv.com/event-types/#mass) for details) and the event type `blood-pressure/mmhg-bpm` for the blood pressure of the mother (see [here](https://api.pryv.com/event-types/#blood-pressure) for details).