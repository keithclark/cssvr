# CSSVR

CSSVR is prototype implementation that uses the DOM and CSS to create VR experiences. It's intended to test the feasiblity of creating progresive VR experiences using media queries and CSS transforms, _if_ browsers internally rendered DOM trees to VR hardware.

This is a simluation, not a full VR solution. It's only compatiable with VR headsets that hold a mobile device (e.g. Google Cardboard) and lacks some of the features expected from a full VR experience, such as lens distortion.

You can read more about the CSSVR project in the accompanying [article](http://keithclark.co.uk/articles/css-vr/) on my [website](http://keithclark.co.uk). 

## Highlights

* Introduces a new `cssvr` media type, allowing VR-specifc styles to be conditionally applied to a document using a media rule (i.e. `@media cssvr {...}`)
* Implements the CSS `:hover` pseudo-class when the user "looks" at an object.
* Dispatches a `click` event for an element when the user hovers over it for a predetermined time.
* DOM based stereo projection simulator.


## Limitations

* Some of the implementations in this prototype are just good enough to prove the concept could work. For example, the CSS rule parsing works using simple string replacements.
* Skew and scale transforms won't work correctly with interactions because they are not decomposed from the transform matrix.


# Creating a VR experience

### Add VR specific styles

Create the CSS for your VR demo and include them in your test page using either a `<link>` element with a `cssvr` media type:

```html
<link rel="stylesheet" media="cssvr">
```
or, inline the styles with:
```html
<style>
  @media cssvr {
    /* CSS rules go here */
  }
</style>
```

This prototype doesn't contain a CSS parser so it won't fetch and process the content of remote CSS content. This means you can't use the `cssvr` media type in any linked stylesheets. 


### Add the JS Client

```html
<body>
  <div id="root">
    <!-- page markup -->
  </div>
  <script src="/path/to/cssvr.min.js"></script>
  <script>
    var vrConfig = {
      root: document.getElementById('root')
    };
    CSSVR.start(vrConfig);
  </script>
</body>
```

### Configuration

Property       | Type       | Description
---------------|------------|-----------------------------------
`root `        | DOMElement | The scene root element
`fov  `        | Integer    | Field-of-view value
`projection`   | String     | `stereo` or `normal`
`stereoPitch`  | Number     | Distance between the pupils of the users eyes (in `px`)
`cameraHeight` | Number     | Distance between the ground and the users head (in `px`)

An example:

```js
CSSVR.start({
  root: document.getElementById('root'),
  fov: 70,
  projection: 'stereo'
});
```

## Implementation details 

### Stereoscopic viewport

During initialization a set of DOM nodes are created to facilitate styling and control of the viewport, camera and scene. A set of base rules are used to clip content and enable 3D rendering (setting `perspective` etc.). Finally, the page content is moved into the new structure and the browser renders our content in 3D. For example, assuming this was the original DOM structure:

```html
<h1>My test content<h1>
```

After the VR script has been enabled, the DOM will look like this:

```html
<div class="vr">
  <div class="vr__eye">
    <div class="vr__viewport">
      <div class="vr__camera">

        <h1>My test content<h1>

      </div>
    </div>
    <div class="vr__cursor"></div>
  </div>
</div>
```

## Stereoscopic rendering

If stereoscopic rendering is enabled the entire DOM is cloned for the right eye and inserted next to the original version. _(It's ok if alarm bells are ringing — this is terribly inefficent! Remember, this is a proof of concept.)_

```html
<div class="vr vr--stereoscopic">

  <!-- LEFT EYE -->
  <div class="vr__eye vr__eye--left">
    <div class="vr__viewport">
      <div class="vr__camera">
        <h1>My test content</h1>
      </div>
    </div>
    <div class="vr__cursor"></div>
  </div>

  <!-- RIGHT EYE -->
  <div class="vr__eye vr__eye--right" aria-hidden="true">
    <div class="vr__viewport">
      <div class="vr__camera">
        <h1>My test content</h1>
      </div>
    </div>
    <div class="vr__cursor"></div>
  </div>

</div>
```

Now that there are two copies of the content, the horizontal component of the `perspective-origin` is set for each viewport (`x`) to acheive the stereoscopic effect:

```css
.vr__eye--left .viewport {
  perspective-origin: calc(50% - x) 50%;
}
.vr__eye--right .viewport {
  perspective-origin: calc(50% + x) 50%;
}
```

To keep both viewports in sync, a [`MutataionObserver`](https://www.w3.org/TR/dom/#mutation-observers) is used to apply any DOM changes made in the left viewport to the right clone.

### CSSVR media type

Once CSSVR is running, the browser will ignore any styles declared in `screen` media blocks and only apply styles in the `cssvr` media block. When the simulator is stopped, the page will return to it's original state.

### Movement

Head tracking is acheived by listening for the `deviceorientation` event. The Euler angles provided to the event handler are converted into heading, elevation and tilt and then applied to the `vr__camera` element using a transform, syncing the viewport(s) to orientation of the device.

### Simulating CSS `:hover`

The `:hover` pseudo-class is simulated by casting a ray from the centre of the viewport into the scene. The vertex data for each element is computed and then checked to see if it intersects the ray. The closest intersecting element is then selected as the hover target.

During startup, the simulator (crudely) replaces all instances of the string ":hover" in stylesheets with ".vr__selected". When an element is deemed to have intersected the ray the class is set and the relevant styles are automatically applied.

`:hover` honours the `pointer-events` style rule, allowing selections to be ignored by setting the value to `none`.


### Click events

Once a hover target has been determined, it's attribute list is checked for the existence of `vr-action` and, if it's found, a timer is started. If the user remains focused on the element until the timer finishes, a click event is fired. If the user moves away from the element, the timer is cancelled. In an ideal world the `vr-action` attribute wouldn't be needed, but there's no way to check if an element has event listeners bound to it, so we need to give the simulator a hint.


# Contributing

## Requirements

* Node / NPM
* Gulp

## Setup

1) Clone this repo.
2) Install dependencies: `npm install`
3) Build the project with the watch task: `gulp dev`
4) Start editing...


## Other build options

* `gulp dev` - builds the unminified JS libray to the `/build/` folder and watches the filesystem for changes.
* `gulp dist` - builds the both the unminified and minified distribution files to the `/dist/` folder.
* `gulp publish` - builds a standalone website form the `/examples` directory.


## Custom configs

If you wish to build with your own config, you can pass in a `CONFIG` env. var when you start gulp:

```
$ CONFIG=myconfig gulp publish
```

This will cause the build script to load `config-myconfig.json`, rather than `config-dev.json`.
