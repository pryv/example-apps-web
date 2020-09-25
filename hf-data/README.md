## Pryv collect and view HF data

- [Live Demo](https://api.pryv.com/app-web-examples/hf-data/)
- [Tutorial](tutorial.md)
- [Video](https://youtu.be/l6uOXr1_ivA)

Web app for high-frequency data collection, visualization & sharing with third parties.   
The goal of this sample app is to help you get familiar with [high-frequency data](https://api.pryv.com/reference/#hf-series) and how to use it within your apps to collect, display and share HF data.  

## Story

You are developing a tracking app to analyse both postural and kinetic tremor for Parkinson's disease diagnosis.    

The desktop version of the app allows to evaluate the kinetic tremor that occurs with voluntary movement, e.g drawing in our case. The mobile version is intended to track the patient's arm movement when holding his mobile phone still to test for postural tremor in Parkinson's disease.  
Both results from the task can be combined and presented to a clinician or any competent person in order to evaluate the degree of severity of the symptoms.  

When the patient logs in to his Pryv.io account, he is asked to perform a tracking task:
- **Web version**: Draw the shape of either a heart or a house with the mouse
- **Mobile version**: Keep the phone horizontally with the arm stretched for at least 10 seconds

Results from the tests are saved in the Pryv.io account of the patient, and can be shared through a URL link to a third-party. Live-tracking is also permitted through the same URL link.

In this web app, you provide the user with a tool to evaluate possible tremor by collecting high frequency data (mouse motion or arm motion) and sharing it with third parties.

| Sign in                                                 | Collect HF data                                                  | Share results                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| <img src="images/welcome-only.png" alt="welcome" style="zoom:33%;" /> | <img src="images/tracker-1.png" alt="tracker" style="zoom:33%;" /> | <img src="images/visu-2.png" alt="share" style="zoom:33%;" /> |

## Project Specifications

- Ask for login
- Request access for the app "app-web-hfdemo" to manage the stream "HF"
- Collect high-frequency data resulting from mouse motion (web version) or phone's accelerometer (mobile version)
- Display or delete data
- Create or delete a sharing to a third party
- Display shared data 
- Allow live tracking

## Data structure

This use case implies the collection of high-frequency data from either the mouse or the phone's accelerometer. You can find more information about the HF data structure [here](https://api.pryv.com/reference/#hf-series).   

*This feature is available with the [Entreprise license](https://api.pryv.com/concepts/#entreprise-license-open-source-license) only.*

The phone's orientation in three dimensional space according to alpha, beta and gamma angles is collected and stored in HF series for the type `series:angle/deg`.  

The mouse position according to the X and Y axis is collected and stored in HF series for the type `series:count/generic`.

## Data collection and visualization 

The user can select an image to draw for the **Desktop tracking task** (kinetic tremor test), or hold his phone still for at least 10 seconds for the **Mobile tracking task** (postural tremor test).

|Desktop                                                 | Mobile                                                  |
| -------------------------------------------------------|---------------------------------------------------------| 
| <img src="images/tracker-1.png" alt="tracker" style="zoom:50%;" /> | <img src="images/collect-acc.jpg" alt="collect" style="zoom:20%;" /> |


Collected HF data from mouse or phone motion is displayed in real time to the user along with the fetch frequency (in NUM/s). The recorded event can be deleted by clicking on the "Delete" button.

|Desktop                                                 | Mobile                                                  |
| -------------------------------------------------------|---------------------------------------------------------| 
| <img src="images/visu-2.png" alt="view" style="zoom:50%;" /> | <img src="images/delete-acc.jpg" alt="view" style="zoom:20%;" /> |

## Data sharing

Data visualization from both tests can be shared with third-parties. This translates into a 'read' access to the shared stream "HF" in which the data from the test is stored. The sharing consists in a link that can be communicated directly or by email to a third party.
When opened, it can display either the drawing from the desktop version or the phone orientation from the mobile version by clicking on the chosen **Tracking method**:

<p align="center">
<img src="images/share-data.png" alt="visualization" width=700 />
</p>

## Live tracking

The app also allows for live-tracking. When opening the sharing link, the functionality **Show Live Event** enables the data accessor to display the drawing or the phone orientation (depending on the tracking method) while the patient is performing the test remotely:

<p align="center">
<img src="images/live-tracking.gif" alt="live-tracking" />
</p>

## Next steps

You can check out the tutorial to implement high-frequency data collection for your own app:

- [Collect High-Frequency Data Tutorial](tutorial.md)
