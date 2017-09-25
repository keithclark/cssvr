import Entity from './entity';
import Vector3 from '../math/vector3';
import Matrix4 from '../math/matrix4';

export default class Face extends Entity {

  constructor(a, b, c, d) {
    super();
    this.a = a || new Vector3();
    this.b = b || new Vector3();
    this.c = c || new Vector3();
    this.d = d || new Vector3();
    this.normal = new Vector3(0, 0, 1);
    this.origin = new Vector3();
    this.canInteract = true;
  }

  translate(v) {
    super.translate(v);
    this.a.add(v);
    this.b.add(v);
    this.c.add(v);
    this.d.add(v);
  }

  rotate(v, origin) {
    super.rotate(v);
    this.a.rotate(v, origin);
    this.b.rotate(v, origin);
    this.c.rotate(v, origin);
    this.d.rotate(v, origin);
    this.normal.rotate(v);
  }

  clone() {
    let clone = new Face();
    clone.a.set(this.a.x, this.a.y, this.a.z);
    clone.b.set(this.b.x, this.b.y, this.b.z);
    clone.c.set(this.c.x, this.c.y, this.c.z);
    clone.d.set(this.d.x, this.d.y, this.d.z);
    clone.origin.set(this.origin.x, this.origin.y, this.origin.z);
    clone.position.set(this.position.x, this.position.y, this.position.z);
    clone.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    clone.canInteract = this.canInteract;
    return clone;
  }

  setFromElement(elem) {
    let top = elem.offsetTop;
    let left = elem.offsetLeft;
    let right = left + elem.offsetWidth;
    let bottom = top + elem.offsetHeight;
    let style = getComputedStyle(elem);
    let transformStyle = style.transform;
    let transformOrigin = style.transformOrigin;
    let canInteract = style.pointerEvents !== 'none';
    let origin = Vector3.fromCssValueString(transformOrigin);
    let matrix = Matrix4.fromCssMatrixString(transformStyle);
    let transform = matrix.decompose();

    this.canInteract = canInteract;
    this.a.set(left, top, 0);
    this.b.set(right, top, 0);
    this.c.set(right, bottom, 0);
    this.d.set(left, bottom, 0);
    this.origin = origin;

    if (transform.rotate.x || transform.rotate.y || transform.rotate.z) {
      this.rotate(transform.rotate, origin);
    }

    this.translate(transform.translate);
  }


  static fromElement(elem) {
    let face = new Face();
    face.setFromElement(elem);
    return face;
  }

};
