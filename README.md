DataDrawer
==========

A tool for drawing dynamic pictures based on data. Basically, a way for
us to implement, experiment, and share the great ideas presented by
Brett Victor in this talk (https://vimeo.com/66085662).

### Usage

#### Firebase setup
- Change `baseUrl` in FirebaseApi.js to point to your firebase.
- In the Firebase dashboard, go to `Login & Auth` then `Anonymous` and
  enable anonymous authentication.
- In your Firebase dashboard, go to `Security & Rules` and paste in the
  contents of `firebaseSecurityRules.json`.

#### Run the app in development mode
```
npm install
npm start
open http://localhost:3000
```

#### Run app in production mode
```
NODE_ENV=production npm install
NODE_ENV=production npm start
open http://localhost:3000
```
This will create a public directory where the build will go, *you need
to remove this directory when running development mode otherwise the
server will serve from the public directory*

#### Deploying to heroku
First, install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-command) if you haven't already.
Then,
```
heroku git:remote -a datadrawer
git push heroku master
heroku open
```

### Hot Loading JS and CSS
Your changes will appear without reloading the browser as shown [here](http://gaearon.github.io/react-hot-loader/).

### Using `0.0.0.0` as Host

You may want to change the host in `server.js` and `webpack.config.js` from `localhost` to `0.0.0.0` to allow access from same WiFi network. This is not enabled by default because it is reported to cause problems on Windows. This may also be useful if you're using a VM.

### Dependencies

* React
* Webpack
* [webpack-dev-server](https://github.com/webpack/webpack-dev-server)
* [babel-loader](https://github.com/babel/babel-loader)
* [react-hot-loader](https://github.com/gaearon/react-hot-loader)
* [font-awesome](http://fortawesome.github.io/Font-Awesome/)
* [Immutable](http://facebook.github.io/immutable-js/)
