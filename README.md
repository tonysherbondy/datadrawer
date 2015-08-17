Tukey with React
=====================

It's like the Tukey you know and love, but rewritten (again), but with React.

### Usage

#### Firebase setup
- Change `baseUrl` in FirebaseApi.js to point to your firebase.
- In your Firebase dashboard, go to `Security & Rules` and paste in the
  contents of `firebaseSecurityRules.json`.

#### Run the app
```
npm install
npm start
open http://localhost:3000
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
