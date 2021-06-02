// generate grid, borrow from clay.gl viewer
// @see https://github.com/pissang/clay-viewer/blob/master/src/graphic/ground.glsl
#extension GL_OES_standard_derivatives : enable

varying vec3 v_Position;

uniform float u_GridSize : 5;
uniform float u_GridSize2 : .5;
uniform vec4 u_GridColor : [0, 0, 0, 1];
uniform vec4 u_GridColor2 : [0.3, 0.3, 0.3, 1];

void main() {
  gl_FragColor = vec4(1.);

  float wx = v_Position.x;
  float wz = v_Position.z;

  float x1 = abs(fract(wx / u_GridSize2 - 0.5) - 0.5) / fwidth(wx) * u_GridSize2;
  float z1 = abs(fract(wz / u_GridSize2 - 0.5) - 0.5) / fwidth(wz) * u_GridSize2;

  float v1 = 1.0 - clamp(min(x1, z1), 0.0, 1.0);
  gl_FragColor = mix(gl_FragColor, u_GridColor2, v1);
}