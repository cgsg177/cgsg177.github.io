function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function initGL() {
  const canvas = document.getElementById("myCan");
  const gl = canvas.getContext("webgl2");

  const start = Date.now();

  gl.clearColor(0.3, 0.47, 0.8, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const vs = `#version 300 es
    in vec4 in_pos;
    out vec2 tpos;
    out highp vec4 color;

    uniform float time;

    void main() {
        gl_Position = in_pos;
        tpos = in_pos.xy;
        color = in_pos;
    }
  `;
  const fs = `#version 300 es
    precision highp float;
    out vec4 o_color;
    in vec2 tpos;
    in vec4 color;

    uniform float time;
    
    vec2 CmplSet( float Re, float Im )
    {
      vec2 res = vec2(Re, Im);
      return res;
    }

    vec2 CmplAddCmpl( vec2 Z1, vec2 Z2 )
    {
      vec2 res = vec2(Z1.x + Z2.x, Z1.y + Z2.y);
      return res;
    }

    vec2 CmplMulCmpl( vec2 Z1, vec2 Z2 )
    {
      vec2 res = vec2(Z1.x * Z2.x - Z1.y * Z2.y, Z1.x * Z2.y + Z2.x * Z1.y);
      return res;
    }

    float CmplNorm( vec2 Z )
    {
      return sqrt(Z.x * Z.x + Z.y * Z.y);
    }
  
    float Mandelbrot( vec2 Z )
    {
      float n = 0.0;
      vec2 Z0 = Z;
      while (n < 255.0 && CmplNorm(Z) < 2.0)
        Z = CmplAddCmpl(CmplMulCmpl(Z, Z), Z0), n++;
      return n;
    }

    float Julia( vec2 Z, vec2 C )
    {
      float n = 0.0;

      while (n < 255.0 && CmplNorm(Z) < 2.0)
        Z = CmplAddCmpl(CmplMulCmpl(Z, Z), C), n++;
      return n;
    }

    void main() {
      float n = 0.0;
      vec2 z;

      //o_color = color * Julia(tpos, vec2(0.35, 0.38)) / 256.0;
      float x0 = -2.0, x1 = 2.0, y0 = -2.0, y1 = 2.0; 

      z = CmplSet(x0 + gl_FragCoord.x * (x1 - x0) / 500.0, y0 + gl_FragCoord.y * (y1 - y0) / 500.0);
      
      n = Julia(z, CmplSet(0.30 + sin(time), 0.35 + sin(time)));

      o_color = vec4(n * 8.0 / 255.0, n / (8.0 * 255.0) * 3.0, n / 255.0 * 5.0, 1);

}
  `;

  const vertexSh = loadShader(gl, gl.VERTEX_SHADER, vs);
  const fragmentSh = loadShader(gl, gl.FRAGMENT_SHADER, fs);

  const program = gl.createProgram();
  gl.attachShader(program, vertexSh);
  gl.attachShader(program, fragmentSh);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert("!!!!!");
  }
  /*
  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  //const pos = [-1, -1, 0, 1, 1, -1, 0, -1, 1, 1, 0, 1];
  //const pos = [-1, -1, 0, 1, 1, -1, 0, -1, 1, 1, 0, 1];
  const pos = [-1, 1, 0, 1, -1, -1, 0, 1, 1, 1, 0, 1, 1, -1, 0, 1];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
  gl.vertexAttribPointer(posLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(posLoc);
  gl.useProgram(program);
  
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
  */
  const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const posLoc = gl.getAttribLocation(program, "in_pos");
    const timeFromStart = Date.now() - start;

    const loc = gl.getUniformLocation(program, "time");
    gl.uniform1f(loc, timeFromStart / 1000.0);

    const pos = [-1, 1, 0, 1, -1, -1, 0, 1, 1, 1, 0, 1, 1, -1, 0, 1];
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);

    gl.vertexAttribPointer(posLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLoc);

    gl.useProgram(program);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
    window.requestAnimationFrame(render);
  };

  render();
}

window.addEventListener("load", () => {
  initGL();
});
