import Input from './input';
import {DEG_TO_RAD, RAD_TO_DEG} from '../math/consts';


function deviceOrientationHandler(e) {
  if (!e.alpha && !e.beta && !e.gamma) {
    return;
  }
  let orientation = getRotationFromEulerAngles(e.alpha, e.beta, e.gamma);
  this.rotation.x = orientation.elevation;
  this.rotation.y = orientation.heading;
  this.rotation.z = orientation.tilt;
}


const getRotationFromEulerAngles = (alpha, beta, gamma) => {

  // Convert degrees to radians
  let alphaRad = alpha * DEG_TO_RAD;
  let betaRad = beta * DEG_TO_RAD;
  let gammaRad = gamma * DEG_TO_RAD;

  // Calculate equation components
  let cA = Math.cos(alphaRad);
  let sA = Math.sin(alphaRad);
  let cB = Math.cos(betaRad);
  let sB = Math.sin(betaRad);
  let cG = Math.cos(gammaRad);
  let sG = Math.sin(gammaRad);
  let xrC = cB * sG;
  let yrC = -sB;
  let zrA = -sA * sB * cG - cA * sG;
  let zrB = cA * sB * cG - sA * sG;
  let zrC = cB * cG;
  let heading = Math.atan(zrA / zrB);
  
  // Convert to a whole unit circle
  if (zrB < 0) {
    heading += Math.PI;
  } else if (zrA < 0) {
    heading += 2 * Math.PI;
  }
  
  // Calculate elevation
  let elevation = Math.PI / 2 - Math.acos(-zrC);
  
  // Calculate tilt
  let cH = Math.sqrt(1 - (zrC * zrC));
  let tilt = Math.acos(-xrC / cH) * Math.sign(yrC);

  return {
    heading: heading * RAD_TO_DEG - 90,
    elevation: elevation * RAD_TO_DEG,
    tilt: tilt * RAD_TO_DEG
  };
}


export default class OrientationInput extends Input {

  constructor() {
    super();
    this.handler = deviceOrientationHandler.bind(this);
  }

  start() {
    window.addEventListener('deviceorientation', this.handler);
  }

  stop() {
    window.removeEventListener('deviceorientation', this.handler);
  }

};
