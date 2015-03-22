# Tukey

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

## Tukey Assumptions
* A mark is a "algebraic" or "textual" description of drawing and refers
  to variables.
* Loop creates context of variables, specifically a single table.
* Modify steps are useful for setting variables that are relative to the
  mark itself.
* Inter-mark dependencies only exist in step representation of drawing
  as they are useful to UI, but can always be dereferenced to data or
  constants.
* Compile to d3 or canvas targets happens from marks.
* Loops only serve a purpose to construct a single table that will be
  given to marks to iterate over the columns.
* Must support the ability to create new scalar variables from drawing,
  e.g., set height to 20px is a variable because other marks can refer
  to that value.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`
* `bower install`

## Running / Development

* `ember server`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

## Contributing

* See our [TODO](./TODO.md) list
