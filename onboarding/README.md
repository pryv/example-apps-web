Onboarding:

This example shows you how to implement a pleasant onboarding experience for your users.

### Service information

References:

- https://api.pryv.com/guides/app-guidelines/
- https://api.pryv.com/reference/#service-info

You will need to define in your application, the service information URL, which contains all the necessary URL endpoints that your app requires to function.

Upon start, your app will fetch this information, and use it for example to define the Url where the user authentication call will be made.

there are also several optional parameters that allow to define some visuals such as the name of the platform. You can set these in the platform configuration:

- Open Pryv.io: https://github.com/pryv/open-pryv.io#open-pryvio-configuration
- Pryv.io: See your manual

#### Visuals

in the app, we provide a way to enter the service information (maybe provide links with serviceInfo in query params):

- default local Open Pryv.io with rec-la: https://my-computer.rec.la:4443/reg/service/info
- Your Open Pryv.io running on some hostname: http(s)://HOSTNAME/reg/service/info
- Your Pryv.io platform: XXX

### App onboarding

As a Pryv.io account is only interesting when used through a certain app presenting:

- a user interface
- possible sensors
- algorithms
- and requires access to a defined set of permissions,

We recommend to onboard users through the app authentication process, such as: https://api.pryv.com/reference/#authenticate-your-app

Therefore, when boot, your app should launch an auth request and present a button that opens the steps of:

- user creation
- app authentication
  - sign in
  - consent
- password reset request

As your users could be onboarded from multiple entry points, such as multiple applications accessing data from a single platform, it is convenient to have to implement the aforementioned steps at a single place.

These are all implemented by our open source application [app-web-auth3](https://github.com/pryv/app-web-auth3). For example, user creation is available as following: 

When open, you can either create a user or sign in:

![](/Users/iliakebets/Dev/Pryv/git/app-web-examples/onboarding/images/auth3.png)



#### User creation

If you wish to 







### Customize some minor feature

