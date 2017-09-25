import Vector3 from '../math/vector3';

export default class {

  constructor() {
    this.rotation = new Vector3();
    this.position = new Vector3();
  }

  translate(v) {
    this.position.add(v);
  }

  rotate(v) {
    this.rotation.add(v);
  }

};
