
# Pryv Customize assets tutorial

In this tutorial we describe the procedure to customize your Pryv.io web apps. As described in the [README](customize-assets/README.md), it is also possible to directly edit your platform assets in the **public_html/assets** folder of your Open Pryv.io instance.

However, when working in a production environment, we stronly recommend to follow the steps below to change assets for your Open Pryv.io platform.

This will allow you to benefit from updates and improvements of our [Javascript library](https://github.com/pryv/lib-js) and [Pryv.io visual assets](https://github.com/pryv/assets-open-pryv.io).


## Fork the Visual Assets repositery 

You can fork the [Github repositery](https://github.com/pryv/assets-open-pryv.io) containing visual assets for the Open Pryv.io platform.

Clone the repositery: `git clone git@github.com:pryv/assets-open-pryv.io.git`.

## Make your changes

See the [README file](https://github.com/pryv/assets-open-pryv.io/blob/master/README.md) to understand the structure of the Visual Assets repositery.

You can for example edit the logo of your authentication app ([app-web-auth3](https://github.com/pryv/app-web-auth3)) and adapt it to your own branding.

To do so, navigate to the folder **app-web-auth3** in **assets-open-pryv.io**.

<p align="center">
    <img src="images/change_logo_open_assets.png" alt="change_logo_open_assets" width="600"/>
</p>

Add your own logo "my-logo.png" and update the relevant section in the **index.json** file :

```json
"app-web-auth3": {
   	"logo": {
   	  "url": "app-web-auth3/my-logo.png" 
   	}
  }
```
## Copy to your Open Pryv.io folder

Once your changes are done, copy the content of your **assets-open-pryv.io** folder to **public_html/assets** folder of your Open Pryv.io instance.

<p align="center">
    <img src="images/move_files.png" alt="move" width="600"/>
</p>

## Run Open Pryv.io

Run your Open Pryv instance from your terminal and see the changes when opening the authentication app :

- from [https://api.pryv.com/app-web-access/?pryvServiceInfoUrl=https://my-computer.rec.la/reg/service/info](https://api.pryv.com/app-web-access/?pryvServiceInfoUrl=https://my-computer.rec.la/reg/service/info.) if you are using the Dockerized version

- from [https://api.pryv.com/app-web-access/?pryvServiceInfoUrl=https://my-computer.rec.la:4443/reg/service/info](https://api.pryv.com/app-web-access/?pryvServiceInfoUrl=https://my-computer.rec.la:4443/reg/service/info.) if you are using the Native version

If you are using another public URL, replace `https://my-computer.rec.la` by it in the link above.

After requesting access, you can click on the login button:

<p align="center">
<img src="images/login-open-pryv.png" alt="login-open-pryv" width="190" />
</p>

This will open the login page on which you can see the applied changes :

<p align="center">
<img src="images/new_logo.png" alt="new-logo" width="350" />
</p>



