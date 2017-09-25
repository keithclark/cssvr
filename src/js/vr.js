import Vector3 from './math/vector3';
import Ray from './math/ray';
import Face from './objects/face';
import Camera from './objects/camera';
import Viewport from './viewport';
import StereoViewport from './viewport-stereo';
import {DEG_TO_RAD} from './math/consts';
import MouseInput from './inputs/input-mouse';
import OrientationInput from './inputs/input-orientation';
import * as CssUtilities from './css-helpers';
import {HOVER_CLICK_DURATION} from './config';


const STATE_STOPPED = 0;
const STATE_STARTING = 1;
const STATE_RUNNING = 2;
const STATE_STOPPING = 3;


let camera;
let viewport;
let currentSelection;
let currentSelectionTimer;
let mouseController;
let orientationController;
let state = STATE_STOPPED;


const getSelection = (ray, rootElem) => {
  let map = new WeakMap();
  let doc = rootElem.ownerDocument;
  let walker = doc.createTreeWalker(rootElem, NodeFilter.SHOW_ELEMENT);
  let selectedElement = null;
  let selectedDistance = Number.MAX_VALUE;
  let elem;

  while (elem = walker.nextNode()) {
    let face = Face.fromElement(elem);

    map.set(elem, { 
      origin: face.origin.clone(),
      position: face.position.clone(),
      rotation: face.rotation.clone()
    });

    // walk up the DOM tree and apply ancestor transforms to this
    // element so we can determine the position of its vertices.
    let parentElem = elem.parentElement;
    while (parentElem !== rootElem) {
      let parentFace = map.get(parentElem);
      face.rotate(parentFace.rotation, parentFace.origin);
      face.translate(parentFace.position);
      parentElem = parentElem.parentElement;
    }

    // don't check for selection if this face isn't interactive 
    if (face.canInteract) {
      // check to see if the ray intersects with this face
      let distance = ray.getFaceIntersectionDistance(face);
      if (distance) {
        if (distance < selectedDistance) {
          selectedDistance = distance;
          selectedElement = elem;
        }
      }
    }
  }
  return selectedElement;
}


const updateSelection = () => {
  // Create a ray to cast from the users eye into the scene and
  // set its direction to match the camera rotation.
  let direction = new Vector3(0, 0, -1);
  let origin = camera.position;
  let cameraDirection = new Vector3(
    camera.rotation.x * -DEG_TO_RAD,
    camera.rotation.y * -DEG_TO_RAD,
    0
  );
  direction.rotate(cameraDirection);

  let ray = new Ray(origin, direction);
  let selectedElement = getSelection(ray, viewport.cameraElement);

  // if the user has a current selection, we need to clear it
  // before selecting a new element.
  if (selectedElement && selectedElement === currentSelection) {
    return;
  }
  //console.log(currentSelection, selectedElement)
  if (currentSelection) {
    // remove the existing hover state styles
    // TODO:PERF - be smarter about this
    let elem = currentSelection;
    while (elem !== viewport.cameraElement) {
      elem.classList.remove('vr__selection');
      elem = elem.parentElement;
    }
    viewport.cursorElement.classList.remove('vr__cursor--hover');
    clearTimeout(currentSelectionTimer);
  }

  // update the current selection
  currentSelection = selectedElement;

  // if we have a selection simulate the `:hover` state by adding
  // a class to the element and it's parents.
  // TODO:PERF - be smarter about this
  if (currentSelection) {
    let elem = currentSelection;
    while (elem !== viewport.cameraElement) {
      elem.classList.add('vr__selection');
      elem = elem.parentElement;
    }

    // if the selected element has a `vr-action` attribute start
    // the user notification cycle and, if the user hovers for
    // long enough, fire a `click` event. Ideally, we wouldn't
    // need the extra attribute but it's not possible to check
    // if an element has event listeners bound to it.
    if (currentSelection.hasAttribute('vr-action')) {
      // defer the style changes until the next frame so the 
      // indicator has a chance to reset
      requestAnimationFrame(() => {
        viewport.cursorElement.classList.add('vr__cursor--hover');
        currentSelectionTimer = setTimeout(() => {
          viewport.cursorElement.classList.remove('vr__cursor--hover');
          currentSelection.click();
        }, HOVER_CLICK_DURATION);
      });
    }
  }
}


const update = () => {
  let rotation = mouseController.rotation.clone();
  rotation.add(orientationController.rotation);
  camera.rotation = rotation;
  viewport.update(camera);
  updateSelection();
}


const loop = () => {
  if (state === STATE_RUNNING) {
    requestAnimationFrame(loop);
    update();
  }
}


const start = (config = {}) => {
  if (state !== STATE_STOPPED) {
    return Promise.reject();
  }

  state = STATE_STARTING;

  let root = config.root || document.body;
  let docRoot = document.documentElement;

  docRoot.style.display = 'none';

  camera = new Camera();
  camera.fov = config.fov || 70;
  camera.position.y = -config.cameraHeight || 0;

  if (config.projection === 'stereo') {
    viewport = new StereoViewport(root);
    viewport.separation = config.stereoPitch;
  } else {
    viewport = new Viewport(root);
  }

  // Allow the mouse to control the scene
  mouseController = new MouseInput();
  mouseController.start();

  // Allow the orientation sensors to control the camera
  orientationController = new OrientationInput();
  orientationController.start();

  return Promise.resolve()
    .then(CssUtilities.enableVrStyles)
    .then(() => viewport.enable())
    .then(() => {
      state = STATE_RUNNING;
      loop();
      docRoot.style.display = '';
    });
};


const stop = () => {
  if (state !== STATE_RUNNING) {
    return Promise.reject();
  }

  state = STATE_STOPPING;

  let docRoot = document.documentElement;

  docRoot.style.display = 'none';

  // stop the input controllers
  orientationController.stop();
  mouseController.stop();

  return Promise.resolve()
    .then(CssUtilities.disableVrStyles)
    .then(() => viewport.disable())
    .then(() => {
      docRoot.style.display = '';
      state = STATE_STOPPED;
    });
}

export {start, stop};
