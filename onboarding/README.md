# Onboarding:

This example shows you how to implement a pleasant onboarding experience for your users.

### Service information

References:

- https://api.pryv.com/guides/app-guidelines/
- https://api.pryv.com/reference/#service-info

You will need to define in your application, the service information URL, which contains all the necessary URL endpoints that your app requires to function.

Upon start, your app will fetch this information, and use it for example to define the [URL where the app authentication call will be made](https://api.pryv.com/reference/#auth-request).

There are also several optional parameters that allow to define some visuals such as the name of the platform. You can set these in the platform configuration:

- Open Pryv.io: https://github.com/pryv/open-pryv.io#open-pryvio-configuration
- Pryv.io: See your manual

#### Visuals

in the app, we provide a way to enter the service information (maybe provide links with serviceInfo in query params):

- default local Open Pryv.io with rec-la: https://my-computer.rec.la:4443/reg/service/info
- Your Open Pryv.io running on some hostname: http(s)://${PUBLIC_URL}/reg/service/info
- Your Pryv.io platform: https://reg.${DOMAIN}/service/info
- Pryv Lab: https://reg.pryv.me/service/info

### App onboarding

As a Pryv.io account is only interesting when used through a certain app presenting:

- a user interface
- possible sensors
- algorithms
- and requires access to a defined set of permissions,

We recommend to onboard users through the app authentication process, such as: https://api.pryv.com/reference/#authenticate-your-app

Therefore, when boot, your app should initiate an [authentication request](https://api.pryv.com/reference/#auth-request) and present a button that opens a web application used for:

- app authentication
  - sign in
  - consent
- account creation
- password reset request

As your users could be onboarded from multiple entry points, such as multiple applications accessing data from a single platform, it is convenient to have to implement the aforementioned steps at a single place.

These are all implemented by our open source application [app-web-auth3](https://github.com/pryv/app-web-auth3). 
These web pages are the "popup frame" that opens during the user account creation, the signin, the consent request from the app and the password reset process.

#### User creation

**Feature proposition:** If you wish to skip the step of clicking on `create an account` from the *sign in* page, you can open the URL in the `authUrl` field of the response, but changing the path to `/register.html` from `access.html`.

After creating an account, you will be redirected to the sign in flow

**Feature proposition**: after creating an account, perform a login call, so we don't have to sign in again. I don't think anyone likes it.

#### Signin

insert bla bla here

#### Consent 

Checks the requested app access (especially the permissions it contains) and compares it with eventually existing ones (only accesses of type 'app' are considered here) using the personal token.

The requested permissions are shown to the user, who can decide to Accept or Refuse, granting access to the app by clicking on the corresponding button. If accepted, it creates a new app access.

#### Reset password 

Asks for a Pryv.io username or email and triggers the sending of a reset password email to the user.
The reset link in the email targets the password reset page, and asks the user for his username or email and a new password.

### Customize some minor feature

All these web pages and visuals can be customized here : https://github.com/pryv/assets-pryv.me

For example, the logo can be changed for the authentication page by modifying the corresponding section in the `app-web-auth3` assets properties :

```json
{ 
  "app-web-auth3": {
    "logo": {
      "url": "app-web-auth3/logo.png"
    }
	}
}
```
### Next steps

Direct to tutorials using Pryv.io (collecting survey data, view and share, etc)

