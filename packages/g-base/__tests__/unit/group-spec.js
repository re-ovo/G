const expect = require('chai').expect;
import Group from '../../src/abstract/group';
import Shape from '../../src/abstract/shape';

class MyShape extends Shape {
  calculateBBox() {
    const { x, y, width, height } = this.attrs;

    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height,
    };
  }
}

class MyGroup extends Group {
  getShapeBase() {
    return MyShape;
  }

  getGroupBase() {
    return MyGroup;
  }
}

class MyCircle extends MyShape {
  calculateBBox() {
    const { x, y, r } = this.attrs;
    return {
      minX: x - r,
      minY: y - r,
      maxX: x + r,
      maxY: y + r,
    };
  }
}

MyShape.Circle = MyCircle;

describe('test group', () => {
  const group = new MyGroup({});
  it('init', () => {
    expect(group.getChildren().length).eqls(0);
  });
  it('add group', () => {
    const subGroup = group.addGroup({
      id: '2',
      capture: false,
    });
    expect(group.getChildren().length).eqls(1);
    expect(subGroup.get('id')).eqls('2');
    subGroup.addShape({
      type: 'circle',
      attrs: {
        x: 20,
        y: 20,
        r: 10,
      },
    });
  });
  it('add shape', () => {
    const shape = group.addShape('circle', {
      attrs: {
        x: 10,
        y: 10,
        r: 10,
      },
    });
    expect(shape.getBBox()).eqls({
      minX: 0,
      minY: 0,
      maxX: 20,
      maxY: 20,
    });
  });

  it('bbox', () => {
    group.addShape({
      type: 'circle',
      attrs: {
        x: -10,
        y: -10,
        r: 10,
      },
    });

    const bbox = group.getBBox();
    expect(bbox).eqls({
      x: -20,
      y: -20,
      minX: -20,
      minY: -20,
      maxX: 30,
      maxY: 30,
      width: 50,
      height: 50,
    });
    const canvasBox = group.getCanvasBBox();
    expect(canvasBox).eqls(bbox);
  });

  it('remove shape', () => {
    const count = group.getChildren().length;
    const shape = group.addShape({
      type: 'circle',
      attrs: {
        x: 30,
        y: 30,
        r: 10,
      },
    });
    expect(group.getChildren().length).eqls(count + 1);
    shape.remove();
    expect(shape.destroyed).eqls(true);
    expect(group.getChildren().length).eqls(count);
  });

  it('clone', () => {
    const newGroup = group.clone();
    expect(newGroup.getChildren().length).eqls(group.getChildren().length);
    expect(newGroup.getChildren()[0].get('capture')).eqls(false);
  });

  it('clear', () => {
    group.clear();
    expect(group.getChildren().length).eqls(0);
    expect(group.getBBox()).eqls({
      x: 0,
      y: 0,
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0,
    });
    expect(group.getCanvasBBox()).eqls(group.getBBox());
  });
});

describe('test with matrix', () => {
  const group = new MyGroup({});
  const group1 = group.addGroup();
  // const group2 = group.addGroup();
  const group11 = group1.addGroup();
  let shape;
  const m = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const m1 = [2, 0, 0, 0, 2, 0, 0, 0, 1];
  const m2 = [2, 0, 0, 0, 3, 0, 0, 0, 1];
  const m3 = [4, 0, 0, 0, 6, 0, 0, 0, 1];
  it('matrix', () => {
    expect(group.getTotalMatrix()).eqls(undefined);
    expect(group1.getTotalMatrix()).eqls(undefined);

    group.setMatrix(m);
    expect(group.getTotalMatrix()).eqls(m);
    expect(group1.getTotalMatrix()).eqls(m);
    expect(group11.getTotalMatrix()).eqls(m);
    group1.attr('matrix', m1);
    expect(group1.getTotalMatrix()).eqls(m1);
    expect(group11.getTotalMatrix()).eqls(m1);

    group11.attr('matrix', m2);
    expect(group11.getTotalMatrix()).eqls(m3);
  });
  it('add group', () => {
    const group3 = group.addGroup();
    expect(group3.getTotalMatrix()).eqls(m);
    const group12 = group1.addGroup();
    expect(group12.getTotalMatrix()).eqls(m1);
    group1.resetMatrix();
    expect(group1.getTotalMatrix()).eqls(m);
    expect(group11.getTotalMatrix()).eqls(m2);
    group11.resetMatrix();
    expect(group11.getTotalMatrix()).eqls(m);
  });

  it('add shape', () => {
    shape = group11.addShape({
      type: 'circle',
      attrs: {
        x: 20,
        y: 20,
        r: 10,
      },
    });
    expect(shape.getTotalMatrix()).eqls(m);
    group1.attr('matrix', m1);
    expect(shape.getTotalMatrix()).eqls(m1);
    group11.attr('matrix', m2);
    expect(shape.getTotalMatrix()).eqls(m3);

    shape.attr('matrix', m1);
    expect(shape.getTotalMatrix()).eqls([8, 0, 0, 0, 12, 0, 0, 0, 1]);
    shape.attr('matrix', null);
    expect(shape.getTotalMatrix()).eqls(m3);

    group1.attr('matrix', null);
    expect(shape.getTotalMatrix()).eqls(m2);
    expect(shape.getBBox()).eqls({
      minX: 10,
      minY: 10,
      maxX: 30,
      maxY: 30,
    });
    const shapeCanvasBBox = shape.getCanvasBBox();
    expect(shapeCanvasBBox).eqls({
      x: 20,
      y: 30,
      minX: 20,
      minY: 30,
      maxX: 60,
      maxY: 90,
      width: 40,
      height: 60,
    });
    expect(group.getCanvasBBox()).eqls(shapeCanvasBBox);
  });

  it('applyToMatrix, invertFromMatrix', () => {
    group.attr('matrix', m);
    const v = [10, 5];
    expect(group.applyToMatrix(v)).eqls(v);
    expect(group.invertFromMatrix(v)).eqls(v);
    group1.attr('matrix', m1);
    expect(group1.applyToMatrix(v)).eqls([20, 10]);
    expect(group1.invertFromMatrix(v)).eqls([5, 2.5]);
    group11.attr('matrix', m2);
    expect(group11.applyToMatrix(v)).eqls([20, 15]);
    expect(group11.invertFromMatrix([20, 15])).eqls(v);
    group.attr('matrix', null);
    expect(group.applyToMatrix(v)).eqls(v);
    expect(group.invertFromMatrix(v)).eqls(v);
  });
});