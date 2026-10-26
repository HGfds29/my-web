import { createLogger } from './logger'

/**
 * WebGL 液态背景 + SDF 折射玻璃
 *
 * 两件事：
 * 1. 全屏固定 canvas 画缓慢流动的液态壁纸（z-index: 0，页面内容压在上面）；
 * 2. 把直接浮在壁纸上的面板按 getBoundingClientRect 画成 WebGL 玻璃片。
 *
 * 玻璃着色器与参数直接取自参考实现：
 * https://github.com/rxing365/html-liquid-glass-effect-webgl
 * - SDF 平滑圆角 + logistic 高度场
 * - 近/远两档梯度求法线
 * - 两次 refract（IOR）+ 位移量
 * - 3x3 盒式模糊 + 白色 overlay + 边缘方向高光
 */

const log = createLogger('liquidBg')

const CANVAS_ID = 'liquid-bg-canvas'
const WEBGL_CLASS = 'lg-webgl'
const GLASS_CLASS = 'lg-glass'
const MAX_DPR = 2
const FRAME_MS = 1000 / 30
const MAX_PANELS = 80

/** 直接浮在壁纸上的面板：由 WebGL 折射渲染 */
export const WEBGL_GLASS_TARGETS = [
  '.card',
  '.post-item',
  '.game-item',
  '.plugin-card',
  '.version-card',
  '.dev-card',
  '.filter-bar',
  '.comment',
  '.comment-item',
  '.chat-container',
  '.chat-container .sidebar',
  '.cmd-table',
  '.feature-list li',
  '.history-item',
  '.demo-page .panel',
  '.photos-page .photo-area',
  '.photos-page .toolbar',
  '.glass-surface'
]

/**
 * 固定/浮层面板：继续用 CSS backdrop-filter
 * 导航栏是 fixed，滚动时卡片会从它下面穿过；只有浏览器自己的 backdrop-filter
 * 才能把下层内容真正遮住并虚化，WebGL 画在 canvas 上做不到这一点。
 */
export const CSS_GLASS_TARGETS = [
  '.navbar',
  '.settings-drawer',
  '.user-card',
  '.more-dropdown',
  '.modal-box',
  '.prompt-box',
  '.error-box',
  '.loading-box',
  '.chat-container .modal-card'
]

/**
 * 玻璃参数默认值，照抄参考仓库滑杆的默认值（单位都是 CSS px）
 * 圆角例外：为了让玻璃形状和元素自身的 border-radius 严丝合缝，
 * 这里取元素的计算圆角，不再用固定的 32。
 */
const GLASS_DEFAULTS = {
  ior: 1.1,
  glassThickness: 41,
  normalStrength: 6.4,
  displacementScale: 1.0,
  heightTransitionWidth: 8.0,
  sminSmoothing: 20.0,
  // 参考默认 0（纯净折射）；这里默认取滑杆上限，保留磨砂，文字才压得住背景
  blurRadius: 5.0,
  highlightWidth: 3.5
}

/** 可在设置里实时调整的项，其余沿用参考实现的默认值 */
const GLASS_PARAM_LIMITS = {
  blurRadius: [0, 5],
  glassThickness: [0, 50],
  ior: [0.8, 1.5],
  normalStrength: [0.1, 10]
}

const glassParams = { ...GLASS_DEFAULTS }

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const setGlassParams = (patch = {}) => {
  Object.keys(GLASS_PARAM_LIMITS).forEach((key) => {
    const next = patch[key]
    if (typeof next !== 'number' || Number.isNaN(next)) return
    const [min, max] = GLASS_PARAM_LIMITS[key]
    glassParams[key] = clamp(next, min, max)
  })
}

const BG_VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const BG_FRAG = `
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_base;
uniform vec3 u_accent;
uniform vec3 u_accent2;
uniform vec2 u_pointer;
uniform float u_dark;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  float t = u_time;
  vec2 par = (u_pointer - 0.5) * 0.06;

  vec2 c1 = vec2(0.22, 0.30) * vec2(aspect, 1.0) + par * 1.4
          + 0.06 * vec2(sin(t * 0.17), cos(t * 0.13));
  vec2 c2 = vec2(0.80, 0.24) * vec2(aspect, 1.0) - par * 1.1
          + 0.05 * vec2(cos(t * 0.11), sin(t * 0.19));
  vec2 c3 = vec2(0.56, 0.84) * vec2(aspect, 1.0) + par * 0.7
          + 0.07 * vec2(sin(t * 0.09 + 1.7), cos(t * 0.15 + 0.6));

  float b1 = 1.0 - smoothstep(0.0, 0.62, length(p - c1));
  float b2 = 1.0 - smoothstep(0.0, 0.55, length(p - c2));
  float b3 = 1.0 - smoothstep(0.0, 0.78, length(p - c3));

  float n = noise(p * 2.4 + vec2(t * 0.05, -t * 0.04)) * 0.35;
  b1 = clamp(b1 + n * b1, 0.0, 1.0);
  b2 = clamp(b2 + n * b2, 0.0, 1.0);

  vec3 col = u_base;
  col = mix(col, u_accent, b1 * 0.45);
  col = mix(col, u_accent2, b2 * 0.34);
  col = mix(col, u_accent, b3 * 0.24);

  col += (1.0 - uv.y) * mix(0.025, 0.05, u_dark);

  float vig = smoothstep(1.3, 0.3, length(uv - 0.5));
  col *= mix(0.95, 1.0, vig);

  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (g - 0.5) * 0.014;

  gl_FragColor = vec4(col, 1.0);
}
`

const BLIT_FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec2 u_res;
void main() {
  gl_FragColor = texture2D(u_tex, gl_FragCoord.xy / u_res);
}
`

/* ===== 下面两段着色器照抄参考实现 ===== */

const GLASS_VERT = `
precision highp float;
attribute vec2 a_position; // Quad vertices (-0.5 to 0.5)

uniform vec2 u_resolution;
uniform vec2 u_mousePos;   // Center of glass in pixels
uniform vec2 u_glassSize;  // Size of glass in pixels

varying vec2 v_screenTexCoord; // Texture coordinate for background sampling (0-1 screen space)
varying vec2 v_shapeCoord;     // Coordinate relative to glass center, normalized (-0.5 to 0.5)

void main() {
    vec2 screenPos = u_mousePos + a_position * u_glassSize;
    vec2 clipSpacePos = (screenPos / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpacePos * vec2(1.0, -1.0), 0.0, 1.0);
    v_screenTexCoord = screenPos / u_resolution;
    v_screenTexCoord.y = 1.0 - v_screenTexCoord.y;
    v_shapeCoord = a_position;
}
`

const GLASS_FRAG = `
precision highp float;

uniform sampler2D u_backgroundTexture;
uniform vec2 u_resolution;
uniform vec2 u_glassSize;
uniform float u_cornerRadius;
uniform float u_ior;
uniform float u_glassThickness;
uniform float u_normalStrength;
uniform float u_displacementScale;
uniform float u_heightTransitionWidth;
uniform float u_sminSmoothing;
uniform float u_blurRadius;
uniform vec4 u_overlayColor;
uniform float u_highlightWidth;

varying vec2 v_screenTexCoord;
varying vec2 v_shapeCoord;

// Polynomial smooth min (quartic)
// k controls the smoothness/radius of the blend
float smin_polynomial(float a, float b, float k) {
    if (k <= 0.0) return min(a, b);
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

// Polynomial smooth max
float smax_polynomial(float a, float b, float k) {
    if (k <= 0.0) return max(a, b);
    float h = clamp(0.5 + 0.5 * (a - b) / k, 0.0, 1.0);
    return mix(b, a, h) + k * h * (1.0 - h);
}

// Original sdRoundedBox (for reference or if k_smooth is 0)
float sdRoundedBoxSharp(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// Smoothed sdRoundedBox using polynomial smin/smax
float sdRoundedBoxSmooth(vec2 p, vec2 b, float r, float k_smooth) {
    if (k_smooth <= 0.0) {
        return sdRoundedBoxSharp(p, b, r);
    }
    vec2 q = abs(p) - b + r;

    float termA_smooth = smax_polynomial(q.x, q.y, k_smooth);
    float termB_smooth = smin_polynomial(termA_smooth, 0.0, k_smooth * 0.5);

    vec2 q_for_length_smooth = vec2(
        smax_polynomial(q.x, 0.0, k_smooth),
        smax_polynomial(q.y, 0.0, k_smooth)
    );
    float termC_smooth = length(q_for_length_smooth);

    return termB_smooth + termC_smooth - r;
}

// Helper function to convert SDF to height
float getHeightFromSDF(vec2 p_pixel_space, vec2 b_pixel_space, float r_pixel, float k_s, float transition_w) {
    float dist_sample = sdRoundedBoxSmooth(p_pixel_space, b_pixel_space, r_pixel, k_s);
    float normalized_dist = dist_sample / transition_w;

    const float steepness_factor = 6.0;
    float height = 1.0 - (1.0 / (1.0 + exp(-normalized_dist * steepness_factor)));
    return clamp(height, 0.0, 1.0);
}

void main() {
    float actualCornerRadius = min(u_cornerRadius, min(u_glassSize.x, u_glassSize.y) / 2.0);

    vec2 current_p_pixel = v_shapeCoord * u_glassSize;
    vec2 glass_half_size_pixel = u_glassSize / 2.0;

    float dist_for_shape_boundary = sdRoundedBoxSmooth(current_p_pixel, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing);
    if (dist_for_shape_boundary > 0.5) {
        discard;
    }

    vec2 pixel_step_in_norm_space = vec2(1.0 / u_glassSize.x, 1.0 / u_glassSize.y);

    float norm_step_x1 = pixel_step_in_norm_space.x * 0.75;
    float norm_step_y1 = pixel_step_in_norm_space.y * 0.75;
    float norm_step_x2 = pixel_step_in_norm_space.x * 1.5;
    float norm_step_y2 = pixel_step_in_norm_space.y * 1.5;

    float h_px1 = getHeightFromSDF((v_shapeCoord + vec2(norm_step_x1, 0.0)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
    float h_nx1 = getHeightFromSDF((v_shapeCoord - vec2(norm_step_x1, 0.0)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
    float h_px2 = getHeightFromSDF((v_shapeCoord + vec2(norm_step_x2, 0.0)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
    float h_nx2 = getHeightFromSDF((v_shapeCoord - vec2(norm_step_x2, 0.0)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);

    float grad_x1 = (h_px1 - h_nx1) / (2.0 * norm_step_x1 * u_glassSize.x);
    float grad_x2 = (h_px2 - h_nx2) / (2.0 * norm_step_x2 * u_glassSize.x);
    float delta_x = mix(grad_x1, grad_x2, 0.5);

    float h_py1 = getHeightFromSDF((v_shapeCoord + vec2(0.0, norm_step_y1)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
    float h_ny1 = getHeightFromSDF((v_shapeCoord - vec2(0.0, norm_step_y1)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
    float h_py2 = getHeightFromSDF((v_shapeCoord + vec2(0.0, norm_step_y2)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
    float h_ny2 = getHeightFromSDF((v_shapeCoord - vec2(0.0, norm_step_y2)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);

    float grad_y1 = (h_py1 - h_ny1) / (2.0 * norm_step_y1 * u_glassSize.y);
    float grad_y2 = (h_py2 - h_ny2) / (2.0 * norm_step_y2 * u_glassSize.y);
    float delta_y = mix(grad_y1, grad_y2, 0.5);

    vec3 surfaceNormal3D = normalize(vec3(-delta_x * u_normalStrength, -delta_y * u_normalStrength, 1.0));

    vec3 incidentLightDir = normalize(vec3(0.0, 0.0, -1.0));
    vec3 refractedIntoGlass = refract(incidentLightDir, surfaceNormal3D, 1.0 / u_ior);
    vec3 refractedOutOfGlass = refract(refractedIntoGlass, -surfaceNormal3D, u_ior);

    vec2 offset_in_pixels = refractedOutOfGlass.xy * u_glassThickness;
    vec2 offset = (offset_in_pixels / u_resolution) * u_displacementScale;

    vec2 refractedTexCoord = v_screenTexCoord + offset;
    refractedTexCoord = clamp(refractedTexCoord, 0.001, 0.999);

    // Frosted Glass Effect: Apply a 3x3 box blur to the refracted texture
    vec4 blurredColor = vec4(0.0);
    vec2 texelSize = 1.0 / u_resolution;
    float blurPixelRadius = u_blurRadius;

    blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2(-1.0, -1.0) * blurPixelRadius * texelSize);
    blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 0.0, -1.0) * blurPixelRadius * texelSize);
    blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 1.0, -1.0) * blurPixelRadius * texelSize);
    blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2(-1.0,  0.0) * blurPixelRadius * texelSize);
    blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 0.0,  0.0) * blurPixelRadius * texelSize);
    blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 1.0,  0.0) * blurPixelRadius * texelSize);
    blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2(-1.0,  1.0) * blurPixelRadius * texelSize);
    blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 0.0,  1.0) * blurPixelRadius * texelSize);
    blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 1.0,  1.0) * blurPixelRadius * texelSize);

    blurredColor /= 9.0;

    float height_val = getHeightFromSDF(current_p_pixel, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
    vec4 finalColor = mix(blurredColor, u_overlayColor, height_val * 0.15);

    float highlight_dist = abs(dist_for_shape_boundary);
    float highlight_alpha = 1.0 - smoothstep(0.0, u_highlightWidth, highlight_dist);
    highlight_alpha = max(0.0, highlight_alpha);

    float directionalFactor = (surfaceNormal3D.x * surfaceNormal3D.y + 1.0) * 0.5;
    float finalHighlightAlpha = highlight_alpha * directionalFactor;

    vec3 color = mix(finalColor.rgb, vec3(1.0), finalHighlightAlpha);

    // 边界 1px 抗锯齿：canvas 玻璃要贴合元素边缘，不能留硬锯齿
    float alpha = 1.0 - smoothstep(-1.5, 0.5, dist_for_shape_boundary);
    gl_FragColor = vec4(color, alpha);
}
`

let canvas = null
let gl = null
let bgProgram = null
let blitProgram = null
let glassProgram = null
let quadBuffer = null
let glassBuffer = null
let bgAttr = -1
let blitAttr = -1
let glassAttr = -1
let bgUniforms = {}
let blitUniforms = {}
let glassUniforms = {}
let framebuffer = null
let bgTexture = null
let textureSize = { w: 0, h: 0 }
let dpr = 1
let rafId = 0
let lastBgDraw = 0
let bgDirty = true
let elapsed = 0
let startedAt = 0
let hidden = false
let staticDrawn = false
let classObserver = null
let panels = []
let palette = null
const pointer = { x: 0.5, y: 0.5 }
const pointerTarget = { x: 0.5, y: 0.5 }

const parseColor = (value) => {
  if (!value) return null
  const text = value.trim()
  const hex = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    const raw = hex[1]
    const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
    return [
      parseInt(full.slice(0, 2), 16) / 255,
      parseInt(full.slice(2, 4), 16) / 255,
      parseInt(full.slice(4, 6), 16) / 255
    ]
  }
  const rgb = text.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i)
  if (rgb) return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255]
  return null
}

const mix = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t
]

const readPalette = () => {
  const root = document.documentElement
  const style = getComputedStyle(root)
  const dark = root.classList.contains('dark')
  const accent = parseColor(style.getPropertyValue('--accent')) || [0.26, 0.73, 0.51]
  const base =
    parseColor(style.getPropertyValue(dark ? '--page-bg-dark' : '--page-bg-light')) ||
    (dark ? [0.06, 0.06, 0.1] : [0.98, 0.98, 0.98])

  return {
    dark,
    base,
    accent: mix(base, accent, dark ? 0.68 : 0.62),
    accent2: mix(base, [0.35, 0.62, 0.95], dark ? 0.55 : 0.5)
  }
}

const applyPalette = () => {
  staticDrawn = false
  bgDirty = true
  palette = readPalette()
  if (!gl || !bgUniforms.base) return
  gl.useProgram(bgProgram)
  gl.uniform3fv(bgUniforms.base, palette.base)
  gl.uniform3fv(bgUniforms.accent, palette.accent)
  gl.uniform3fv(bgUniforms.accent2, palette.accent2)
  gl.uniform1f(bgUniforms.dark, palette.dark ? 1 : 0)
}

const createProgram = (vertSrc, fragSrc, names) => {
  const build = (type, source) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      log.error('着色器编译失败', gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    return shader
  }

  const vert = build(gl.VERTEX_SHADER, vertSrc)
  const frag = build(gl.FRAGMENT_SHADER, fragSrc)
  if (!vert || !frag) return null

  const program = gl.createProgram()
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    log.error('着色器链接失败', gl.getProgramInfoLog(program))
    return null
  }

  const uniforms = {}
  names.forEach((name) => {
    uniforms[name] = gl.getUniformLocation(program, `u_${name}`)
  })
  return { program, uniforms }
}

const setupPrograms = () => {
  const bg = createProgram(BG_VERT, BG_FRAG, [
    'res',
    'time',
    'base',
    'accent',
    'accent2',
    'pointer',
    'dark'
  ])
  const glass = createProgram(GLASS_VERT, GLASS_FRAG, [
    'resolution',
    'mousePos',
    'glassSize',
    'cornerRadius',
    'ior',
    'glassThickness',
    'normalStrength',
    'displacementScale',
    'heightTransitionWidth',
    'sminSmoothing',
    'blurRadius',
    'overlayColor',
    'highlightWidth',
    'backgroundTexture'
  ])
  const blit = createProgram(BG_VERT, BLIT_FRAG, ['tex', 'res'])

  if (!bg || !glass || !blit) return false

  bgProgram = bg.program
  bgUniforms = bg.uniforms
  blitProgram = blit.program
  blitUniforms = blit.uniforms
  glassProgram = glass.program
  glassUniforms = glass.uniforms

  bgAttr = gl.getAttribLocation(bgProgram, 'a_pos')
  blitAttr = gl.getAttribLocation(blitProgram, 'a_pos')
  glassAttr = gl.getAttribLocation(glassProgram, 'a_position')

  quadBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  )

  glassBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, glassBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5]),
    gl.STATIC_DRAW
  )

  applyPalette()
  return true
}

const ensureFramebuffer = () => {
  const w = canvas.width
  const h = canvas.height
  if (framebuffer && textureSize.w === w && textureSize.h === h) return true

  if (bgTexture) gl.deleteTexture(bgTexture)
  if (framebuffer) gl.deleteFramebuffer(framebuffer)

  bgTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, bgTexture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    bgTexture,
    0
  )

  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  textureSize = { w, h }
  bgDirty = true
  if (!ok) log.warn('离屏帧缓冲不可用，玻璃折射关闭')
  return ok
}

const resize = () => {
  if (!canvas || !gl) return
  dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
  const width = Math.max(1, Math.round(window.innerWidth * dpr))
  const height = Math.max(1, Math.round(window.innerHeight * dpr))
  if (canvas.width === width && canvas.height === height) return
  canvas.width = width
  canvas.height = height
  gl.viewport(0, 0, width, height)
  staticDrawn = false
  bgDirty = true
}

const parseRadius = (rect, style) => {
  const raw = style.borderTopLeftRadius || '0px'
  const value = parseFloat(raw) || 0
  const radius = raw.includes('%') ? (Math.min(rect.width, rect.height) * value) / 100 : value
  return Math.min(radius, Math.min(rect.width, rect.height) / 2)
}

/**
 * 粗略的层叠权重：越靠上层，得分越高
 * 画在 canvas 上的玻璃片没有 z-index，只能靠绘制顺序模拟层叠，
 * 否则滚动到导航栏下方的卡片会盖住导航栏的玻璃。
 */
const stackingScore = (el) => {
  let score = 0
  let node = el
  while (node && node !== document.body) {
    const cs = getComputedStyle(node)
    const z = parseInt(cs.zIndex, 10)
    if (!Number.isNaN(z)) score = Math.max(score, z)
    if (cs.position === 'fixed' || cs.position === 'sticky') score = Math.max(score, 500)
    node = node.parentElement
  }
  return score
}

const collectPanels = () => {
  const selector = WEBGL_GLASS_TARGETS.join(',')
  const list = []
  const nodes = document.querySelectorAll(selector)
  const viewportH = window.innerHeight
  const viewportW = window.innerWidth

  for (const el of nodes) {
    if (list.length >= MAX_PANELS) break
    // 嵌套面板只画最外层，避免两层玻璃叠加
    if (el.parentElement && el.parentElement.closest(selector)) continue

    const rect = el.getBoundingClientRect()
    if (rect.width < 12 || rect.height < 12) continue
    if (rect.bottom < 0 || rect.top > viewportH || rect.right < 0 || rect.left > viewportW) continue

    const style = getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
      continue
    }

    // 着色器按 CSS 像素工作（和参考实现一致），center 是面板中心的屏幕坐标
    list.push({
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      w: rect.width,
      h: rect.height,
      radius: parseRadius(rect, style),
      z: stackingScore(el)
    })
  }

  // 由下往上画，后画的盖住先画的
  list.sort((a, b) => a.z - b.z)
  panels = list
}

const useQuad = (program, attr, buffer) => {
  gl.useProgram(program)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.enableVertexAttribArray(attr)
  gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0)
}

const renderBackground = (now) => {
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.disable(gl.BLEND)
  useQuad(bgProgram, bgAttr, quadBuffer)
  gl.uniform2f(bgUniforms.res, canvas.width, canvas.height)
  gl.uniform1f(bgUniforms.time, elapsed)
  gl.uniform2f(bgUniforms.pointer, pointer.x, pointer.y)
  gl.drawArrays(gl.TRIANGLES, 0, 6)
}

const blitBackground = () => {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, canvas.width, canvas.height)
  useQuad(blitProgram, blitAttr, quadBuffer)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, bgTexture)
  gl.uniform1i(blitUniforms.tex, 0)
  gl.uniform2f(blitUniforms.res, canvas.width, canvas.height)
  gl.drawArrays(gl.TRIANGLES, 0, 6)
}

const drawGlass = () => {
  if (!glassProgram || !panels.length) return
  if (!palette) applyPalette()

  useQuad(glassProgram, glassAttr, glassBuffer)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, bgTexture)
  gl.uniform1i(glassUniforms.backgroundTexture, 0)
  // 着色器全部用 CSS 像素，和参考实现一致
  gl.uniform2f(glassUniforms.resolution, window.innerWidth, window.innerHeight)
  gl.uniform1f(glassUniforms.ior, glassParams.ior)
  gl.uniform1f(glassUniforms.glassThickness, glassParams.glassThickness)
  gl.uniform1f(glassUniforms.normalStrength, glassParams.normalStrength)
  gl.uniform1f(glassUniforms.displacementScale, glassParams.displacementScale)
  gl.uniform1f(glassUniforms.heightTransitionWidth, glassParams.heightTransitionWidth)
  gl.uniform1f(glassUniforms.sminSmoothing, glassParams.sminSmoothing)
  gl.uniform1f(glassUniforms.blurRadius, glassParams.blurRadius)
  gl.uniform1f(glassUniforms.highlightWidth, glassParams.highlightWidth)
  gl.uniform4f(glassUniforms.overlayColor, 1.0, 1.0, 1.0, 1.0)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  panels.forEach((panel) => {
    gl.uniform2f(glassUniforms.mousePos, panel.cx, panel.cy)
    gl.uniform2f(glassUniforms.glassSize, panel.w, panel.h)
    gl.uniform1f(glassUniforms.cornerRadius, panel.radius)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  })

  gl.disable(gl.BLEND)
}

/**
 * 每帧都做：重新量面板 → 贴壁纸 → 画玻璃。
 * 壁纸本身按 30fps 重绘，但玻璃必须跟 rAF 同频，
 * 否则滚动、抽屉展开这些动画里玻璃会落在面板后面。
 */
const renderFrame = (now) => {
  if (!gl || !framebuffer) return
  if (!startedAt) startedAt = now
  elapsed = (now - startedAt) / 1000

  pointer.x += (pointerTarget.x - pointer.x) * 0.05
  pointer.y += (pointerTarget.y - pointer.y) * 0.05

  resize()
  if (!ensureFramebuffer()) return
  collectPanels()

  if (bgDirty || now - lastBgDraw >= FRAME_MS) {
    renderBackground(now)
    lastBgDraw = now
    bgDirty = false
  }
  blitBackground()
  drawGlass()
}

const prefersReducedMotion = () => {
  if (document.documentElement.classList.contains('reduce-motion')) return true
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

const loop = (now) => {
  rafId = requestAnimationFrame(loop)
  if (hidden) return
  if (prefersReducedMotion()) {
    // 减少动画时只画一帧静态画面；尺寸/主题/滚动变化会重置标记
    if (!staticDrawn) {
      renderFrame(now)
      staticDrawn = true
    }
    return
  }
  renderFrame(now)
}

const onResize = () => {
  staticDrawn = false
  bgDirty = true
  resize()
}

const onScroll = () => {
  // 减少动画时也要跟着重新定位玻璃
  staticDrawn = false
}

const onPointerMove = (event) => {
  pointerTarget.x = event.clientX / window.innerWidth
  pointerTarget.y = 1 - event.clientY / window.innerHeight
}

const onVisibility = () => {
  hidden = document.hidden
}

const onContextLost = (event) => {
  event.preventDefault()
  log.warn('WebGL 上下文丢失，退回 CSS 玻璃')
  destroy(true)
}

const bind = () => {
  window.addEventListener('resize', onResize)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  canvas.addEventListener('webglcontextlost', onContextLost)
}

const unbind = () => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('visibilitychange', onVisibility)
  if (canvas) canvas.removeEventListener('webglcontextlost', onContextLost)
}

const create = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false

  canvas = document.createElement('canvas')
  canvas.id = CANVAS_ID
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;display:block;'

  gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false
  })
  if (!gl) {
    log.warn('浏览器不支持 WebGL，保持 CSS 液态玻璃')
    canvas = null
    return false
  }

  resize()
  if (!setupPrograms() || !ensureFramebuffer()) {
    log.warn('WebGL 初始化失败，保持 CSS 液态玻璃')
    gl = null
    canvas = null
    return false
  }

  document.body.insertBefore(canvas, document.body.firstChild)
  document.documentElement.classList.add(WEBGL_CLASS)
  document.documentElement.classList.add(GLASS_CLASS)
  bind()

  // 主题/字体等 class 变化时重算配色
  classObserver = new MutationObserver(applyPalette)
  classObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  startedAt = 0
  lastBgDraw = 0
  bgDirty = true
  staticDrawn = false
  rafId = requestAnimationFrame(loop)
  log.info('WebGL 液态背景与折射玻璃已启动')
  return true
}

const destroy = (contextLost = false) => {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
  unbind()
  classObserver?.disconnect()
  classObserver = null
  document.documentElement.classList.remove(WEBGL_CLASS)
  document.documentElement.classList.remove(GLASS_CLASS)

  if (gl && !contextLost) {
    if (bgProgram) gl.deleteProgram(bgProgram)
    if (blitProgram) gl.deleteProgram(blitProgram)
    if (glassProgram) gl.deleteProgram(glassProgram)
    if (quadBuffer) gl.deleteBuffer(quadBuffer)
    if (glassBuffer) gl.deleteBuffer(glassBuffer)
    if (bgTexture) gl.deleteTexture(bgTexture)
    if (framebuffer) gl.deleteFramebuffer(framebuffer)
    const lose = gl.getExtension('WEBGL_lose_context')
    lose?.loseContext()
  }

  canvas?.remove()
  canvas = null
  gl = null
  bgProgram = null
  blitProgram = null
  glassProgram = null
  quadBuffer = null
  glassBuffer = null
  bgAttr = -1
  blitAttr = -1
  glassAttr = -1
  bgTexture = null
  framebuffer = null
  textureSize = { w: 0, h: 0 }
  panels = []
  palette = null
  bgDirty = true
  staticDrawn = false
  uniformsReset()
  elapsed = 0
  startedAt = 0
  log.debug('WebGL 液态背景已停止')
}

const uniformsReset = () => {
  bgUniforms = {}
  blitUniforms = {}
  glassUniforms = {}
}

export const syncLiquidBackground = (on, params) => {
  setGlassParams(params)
  if (!on) {
    if (canvas) destroy()
    return
  }
  if (canvas) {
    applyPalette()
    return
  }
  create()
}
