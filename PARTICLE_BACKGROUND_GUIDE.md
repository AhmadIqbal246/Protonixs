# Deep Analysis and Integration Guide: 3D WebGL Particle Background

This guide provides an end-to-end breakdown of the 3D particle background system implemented in this project, explaining its mathematical foundations, GLSL shaders, runtime architecture, configuration options, and step-by-step instructions to integrate it into any new project (Next.js, Vite React, or Vanilla JavaScript).

---

## Table of Contents
1. [Overview and Architecture](#overview-and-architecture)
2. [Dependencies and Prerequisites](#dependencies-and-prerequisites)
3. [Component Source Code](#component-source-code)
4. [In-Depth Code Analysis](#in-depth-code-analysis)
   - [WebGL Engine: OGL vs Three.js](#webgl-engine-ogl-vs-threejs)
   - [Mathematical Coordinate Generation](#mathematical-coordinate-generation)
   - [Vertex Shader Breakdown](#vertex-shader-breakdown)
   - [Fragment Shader Breakdown](#fragment-shader-breakdown)
   - [Animation and Parallax Loop](#animation-and-parallax-loop)
   - [Resource Lifecycle and Memory Cleanup](#resource-lifecycle-and-memory-cleanup)
5. [How It Is Used in This Project](#how-it-is-used-in-this-project)
   - [Complete Visual Layer Stack](#complete-visual-layer-stack)
   - [Layout Integration](#layout-integration)
   - [Theme and Color Tokens](#theme-and-color-tokens)
6. [Props and Customization Reference](#props-and-customization-reference)
7. [Step-by-Step Porting Guide for Another Project](#step-by-step-porting-guide-for-another-project)
   - [Target: Next.js (App Router / Pages Router)](#target-nextjs-app-router--pages-router)
   - [Target: Vite + React](#target-vite--react)
   - [Target: Pure Vanilla HTML/JS](#target-pure-vanilla-htmljs)
8. [Performance and Production Best Practices](#performance-and-production-best-practices)

---

## Overview and Architecture

The particle background is a GPU-accelerated 3D point cloud system rendered using **OGL** (`ogl`), a minimalist, lightweight WebGL library created by Nathan Gordon.

Unlike traditional DOM or Canvas 2D particle systems that struggle at 100+ items, this implementation renders hundreds or thousands of particles in a **single WebGL draw call** (`gl.POINTS`) using custom GLSL shaders.

### Key Architectural Characteristics
- **Ultra-lightweight footprint:** `ogl` is ~10KB gzipped, compared to Three.js (~160KB+ gzipped).
- **GPU-driven motion:** Particle oscillation and size attenuation are computed on the GPU vertex shader per frame, keeping CPU overhead close to zero.
- **Interactive Parallax:** Subtly tracks mouse position to create depth without disrupting foreground user interaction.
- **Non-blocking UI:** Mounted as a background layer with `pointer-events-none` and zero layout impact.

---

## Dependencies and Prerequisites

The component requires only one runtime dependency:
- `ogl` (v1.0.11 or higher)
- `react` and `react-dom` (v18 or v19)

Install command:
```bash
npm install ogl
# or
yarn add ogl
# or
pnpm add ogl
```

---

## Component Source Code

Save this component as `Particles.jsx` or `Particles.js`:

```javascript
"use client";

import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';

const defaultColors = ['#ffffff', '#ffffff', '#ffffff'];

const hexToRgb = hex => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex
            .split('')
            .map(c => c + c)
            .join('');
    }
    const int = parseInt(hex, 16);
    const r = ((int >> 16) & 255) / 255;
    const g = ((int >> 8) & 255) / 255;
    const b = (int & 255) / 255;
    return [r, g, b];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vRandom = random;
    vColor = color;
    
    vec3 pos = position * uSpread;
    pos.z *= 10.0;
    
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
    
    vec4 mvPos = viewMatrix * mPos;

    if (uSizeRandomness == 0.0) {
      gl_PointSize = uBaseSize;
    } else {
      gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    }

    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  
  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    
    if(uAlphaParticles < 0.5) {
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

const Particles = ({
    particleCount = 200,
    particleSpread = 10,
    speed = 0.1,
    particleColors,
    moveParticlesOnHover = false,
    particleHoverFactor = 1,
    alphaParticles = false,
    particleBaseSize = 100,
    sizeRandomness = 1,
    cameraDistance = 20,
    disableRotation = false,
    pixelRatio = 1,
    className
}) => {
    const containerRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const renderer = new Renderer({
            dpr: pixelRatio,
            depth: false,
            alpha: true
        });
        const gl = renderer.gl;
        container.appendChild(gl.canvas);
        gl.clearColor(0, 0, 0, 0);

        const camera = new Camera(gl, { fov: 15 });
        camera.position.set(0, 0, cameraDistance);

        const resize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width, height);
            camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
        };
        window.addEventListener('resize', resize, false);
        resize();

        const handleMouseMove = e => {
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
            mouseRef.current = { x, y };
        };

        if (moveParticlesOnHover) {
            container.addEventListener('mousemove', handleMouseMove);
        }

        const count = particleCount;
        const positions = new Float32Array(count * 3);
        const randoms = new Float32Array(count * 4);
        const colors = new Float32Array(count * 3);
        const palette = particleColors && particleColors.length > 0 ? particleColors : defaultColors;

        for (let i = 0; i < count; i++) {
            let x, y, z, len;
            do {
                x = Math.random() * 2 - 1;
                y = Math.random() * 2 - 1;
                z = Math.random() * 2 - 1;
                len = x * x + y * y + z * z;
            } while (len > 1 || len === 0);
            const r = Math.cbrt(Math.random());
            positions.set([x * r, y * r, z * r], i * 3);
            randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
            const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
            colors.set(col, i * 3);
        }

        const geometry = new Geometry(gl, {
            position: { size: 3, data: positions },
            random: { size: 4, data: randoms },
            color: { size: 3, data: colors }
        });

        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
                uTime: { value: 0 },
                uSpread: { value: particleSpread },
                uBaseSize: { value: particleBaseSize * pixelRatio },
                uSizeRandomness: { value: sizeRandomness },
                uAlphaParticles: { value: alphaParticles ? 1 : 0 }
            },
            transparent: true,
            depthTest: false
        });

        const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

        let animationFrameId;
        let lastTime = performance.now();
        let elapsed = 0;

        const update = t => {
            animationFrameId = requestAnimationFrame(update);
            const delta = t - lastTime;
            lastTime = t;
            elapsed += delta * speed;

            program.uniforms.uTime.value = elapsed * 0.001;

            if (moveParticlesOnHover) {
                particles.position.x = -mouseRef.current.x * particleHoverFactor;
                particles.position.y = -mouseRef.current.y * particleHoverFactor;
            } else {
                particles.position.x = 0;
                particles.position.y = 0;
            }

            if (!disableRotation) {
                particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
                particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
                particles.rotation.z += 0.01 * speed;
            }

            renderer.render({ scene: particles, camera });
        };

        animationFrameId = requestAnimationFrame(update);

        return () => {
            window.removeEventListener('resize', resize);
            if (moveParticlesOnHover) {
                container.removeEventListener('mousemove', handleMouseMove);
            }
            cancelAnimationFrame(animationFrameId);
            if (container.contains(gl.canvas)) {
                container.removeChild(gl.canvas);
            }
        };
    }, [
        particleCount,
        particleSpread,
        speed,
        moveParticlesOnHover,
        particleHoverFactor,
        alphaParticles,
        particleBaseSize,
        sizeRandomness,
        cameraDistance,
        disableRotation,
        pixelRatio
    ]);

    return <div ref={containerRef} className={`relative w-full h-full ${className || ''}`} />;
};

export default Particles;
```

---

## In-Depth Code Analysis

### WebGL Engine: OGL vs Three.js
In this project, Three.js is also present for other 3D components, but `Particles.js` deliberately chooses `ogl`.
- **Minimal memory footprint:** Only instantiates `Renderer`, `Camera`, `Geometry`, `Program`, and `Mesh`.
- **Zero bloat:** Does not load scene hierarchies, shadow mappers, raycasters, or heavy matrix overhead.
- **Fast context creation:** Boots instantaneously on initial page mount.

### Mathematical Coordinate Generation
The particle coordinates are generated on CPU initialization using **Spherical Rejection Sampling**:
```javascript
do {
    x = Math.random() * 2 - 1;
    y = Math.random() * 2 - 1;
    z = Math.random() * 2 - 1;
    len = x * x + y * y + z * z;
} while (len > 1 || len === 0);
const r = Math.cbrt(Math.random());
positions.set([x * r, y * r, z * r], i * 3);
```
1. Points in `[-1, 1]` cube are discarded if distance from origin exceeds 1.0 (rejection sampling gives uniform distribution over a sphere).
2. The radius multiplier `Math.cbrt(Math.random())` applies the **inverse transform method** for 3D sphere volume ($V \propto r^3$). Without the cube root, particles would unnaturally clump at the center point.

### Vertex Shader Breakdown
The vertex shader transforms each point in 3D space:
```glsl
vec3 pos = position * uSpread;
pos.z *= 10.0;
```
- Multiplies $Z$ position by 10.0, stretching the spherical cloud into a deep spatial corridor or starfield.

```glsl
float t = uTime;
mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
```
- Each particle has a unique random 4D vector `random = (x, y, z, w)`.
- It evaluates continuous periodic sine waves with unique frequencies and phase offsets ($6.28 \approx 2\pi$), generating floating, organic ambient drift for each particle independently.

```glsl
if (uSizeRandomness == 0.0) {
  gl_PointSize = uBaseSize;
} else {
  gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
}
```
- Perspective size attenuation: `gl_PointSize` is inversely proportional to `length(mvPos.xyz)` (distance from camera). Particles close to the camera appear larger, while distant particles shrink into fine starlight.

### Fragment Shader Breakdown
Standard WebGL points are rendered as square bounding boxes. The fragment shader shapes each square point into a circular sprite:
```glsl
vec2 uv = gl_PointCoord.xy;
float d = length(uv - vec2(0.5));
```
- `gl_PointCoord` gives UV coordinates $([0, 1], [0, 1])$ across the individual point quad.
- `d` computes Euclidean distance from the point center $(0.5, 0.5)$.

```glsl
if(uAlphaParticles < 0.5) {
  if(d > 0.5) {
    discard;
  }
  gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
} else {
  float circle = smoothstep(0.5, 0.4, d) * 0.8;
  gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
}
```
- If `alphaParticles` is false: fragments with $d > 0.5$ are immediately discarded (`discard;`), rendering crisp round disks.
- If `alphaParticles` is true: `smoothstep(0.5, 0.4, d)` feathers the edge for a soft glowing aura.
- Color modulation: `0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28)` introduces subtle iridescent tinting over time.

### Animation and Parallax Loop
The render loop uses `requestAnimationFrame`:
- Time scaling: `elapsed += delta * speed;` ensures frame-rate independent motion regardless of 60Hz or 120Hz displays.
- Mouse interaction: Normalized coordinates $(-1 \text{ to } 1)$ offset `particles.position.x` and `particles.position.y` with a negative coefficient, producing natural depth parallax.
- Rotational drift: Oscillates along $X$ and $Y$ with slow trigonometric functions, while continuously rotating around $Z$.

### Resource Lifecycle and Memory Cleanup
To prevent WebGL context leaks and memory retention during page transitions:
- Cancels active `requestAnimationFrame`.
- Detaches `resize` and `mousemove` event listeners.
- Safely removes `gl.canvas` from the DOM container (`container.removeChild(gl.canvas)`).

---

## How It Is Used in This Project

In this repository, the background is assembled in `src/components/layout/ClientLayout.js`.

### Complete Visual Layer Stack
The screenshot in the project combines four complementary visual layers:

```
+-------------------------------------------------------------+
| Layer 4: NoiseOverlay (.noise-overlay, SVG fractalNoise)    |
+-------------------------------------------------------------+
| Layer 3: DynamicParticles (OGL, 500 points, cyan & white)   |
+-------------------------------------------------------------+
| Layer 2: DynamicLightPillar (Three.js volumetric ray beam)  |
+-------------------------------------------------------------+
| Layer 1: Base background (#080808) + 3 Gradient Mesh Blobs  |
+-------------------------------------------------------------+
```

### Layout Integration (`ClientLayout.js`)
```jsx
<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-canvas">
    {/* 1. Ambient Gradient Blobs */}
    <div className="absolute inset-0">
        <div className="gradient-mesh-blob gradient-mesh-blob--foreground opacity-20" />
        <div className="gradient-mesh-blob gradient-mesh-blob--accent opacity-20" />
        <div className="gradient-mesh-blob gradient-mesh-blob--deep" />
    </div>

    {/* 2. Light Pillar (Center diagonal glow) */}
    {mounted && (
        <div className="absolute inset-0 w-full h-full">
            <DynamicLightPillar
                topColor="#ffffff"
                bottomColor="#ffffff"
                intensity={0.35}
                rotationSpeed={1}
                pillarRotation={35}
                glowAmount={0.003}
                pillarWidth={2.8}
                pillarHeight={0.45}
                noiseIntensity={0.25}
                mixBlendMode="screen"
                quality="medium"
            />
        </div>
    )}

    {/* 3. Dynamic Particles */}
    {mounted && (
        <div className="absolute inset-0 w-full h-full opacity-60">
            <DynamicParticles
                particleColors={["#ffffff", "#00d9ff"]}
                particleCount={500}
                particleSpread={10}
                speed={0.1}
                particleBaseSize={100}
                moveParticlesOnHover
                alphaParticles={false}
                disableRotation={false}
                pixelRatio={2}
            />
        </div>
    )}
</div>
```

### Accompanying CSS Styles (`globals.css`)
```css
.noise-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.03;
  z-index: 9999;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

.gradient-mesh-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  will-change: transform;
}

.gradient-mesh-blob--foreground {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, transparent 70%);
  top: 20%;
  left: 35%;
  animation: gradientMeshFloat1 18s ease-in-out infinite;
}

.gradient-mesh-blob--accent {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(0, 217, 255, 0.25) 0%, transparent 70%);
  bottom: -15%;
  right: -5%;
  animation: gradientMeshFloat2 22s ease-in-out infinite;
}
```

---

## Props and Customization Reference

| Prop Name | Type | Default | Recommended in Project | Description |
| :--- | :--- | :--- | :--- | :--- |
| `particleCount` | `number` | `200` | `500` | Total number of 3D point sprites. Higher values create denser fields. |
| `particleSpread` | `number` | `10` | `10` | Extent of particle distribution across $X$ and $Y$ space. |
| `speed` | `number` | `0.1` | `0.1` | Speed factor for wave oscillation and rotation. |
| `particleColors` | `string[]` | `['#ffffff']` | `['#ffffff', '#00d9ff']` | Hex color palette randomly assigned to particles. |
| `particleBaseSize` | `number` | `100` | `100` | Base scale for point sprites before perspective division. |
| `sizeRandomness` | `number` | `1` | `1` | Degree of variation in particle sizes (`0` for identical size). |
| `cameraDistance` | `number` | `20` | `20` | $Z$ distance of camera from origin. |
| `moveParticlesOnHover` | `boolean` | `false` | `true` | Enables interactive mouse parallax counter-drift. |
| `particleHoverFactor` | `number` | `1` | `1` | Sensitivity multiplier for mouse tracking. |
| `alphaParticles` | `boolean` | `false` | `false` | If `true`, soft feathered circular edges; if `false`, sharp circular dots. |
| `disableRotation` | `boolean` | `false` | `false` | Disables automated 3D rotation of the entire cloud. |
| `pixelRatio` | `number` | `1` | `2` | Device pixel ratio override for high-DPI rendering sharpness. |
| `className` | `string` | `""` | `""` | Additional CSS class names on the container `div`. |

---

## Step-by-Step Porting Guide for Another Project

### Target: Next.js (App Router / Pages Router)

#### Step 1: Install dependency
```bash
npm install ogl
```

#### Step 2: Copy `Particles.js`
Create `components/Particles.js` and paste the component code from the [Component Source Code](#component-source-code) section.

#### Step 3: Use with dynamic import (Client-side only)
Because WebGL requires DOM canvas APIs, always disable SSR when importing:
```jsx
// components/Background.jsx
"use client";

import dynamic from "next/dynamic";

const Particles = dynamic(() => import("@/components/Particles"), {
    ssr: false,
    loading: () => null
});

export default function Background() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#080808]">
            <Particles
                particleColors={["#ffffff", "#00d9ff"]}
                particleCount={450}
                particleSpread={10}
                speed={0.1}
                particleBaseSize={100}
                moveParticlesOnHover={true}
                pixelRatio={2}
            />
        </div>
    );
}
```

---

### Target: Vite + React

In Vite, SSR is not active by default during client rendering, so standard imports work directly:

```bash
npm install ogl
```

```jsx
// App.jsx
import React from 'react';
import Particles from './components/Particles';

export default function App() {
    return (
        <div className="relative min-h-screen bg-[#080808] text-white">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Particles
                    particleColors={["#ffffff", "#00d9ff", "#7c3aed"]}
                    particleCount={500}
                    speed={0.12}
                    particleBaseSize={110}
                    moveParticlesOnHover
                    pixelRatio={window.devicePixelRatio || 1}
                />
            </div>

            {/* Content */}
            <main className="relative z-10 p-8">
                <h1 className="text-4xl font-bold">Hello World</h1>
            </main>
        </div>
    );
}
```

---

### Target: Pure Vanilla HTML/JS

If your destination project does not use React, the same logic can be packaged into a standalone JavaScript class or function:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Particles Background</title>
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #080808; }
    #particles-container { position: fixed; inset: 0; pointer-events: none; }
  </style>
</head>
<body>
  <div id="particles-container"></div>

  <script type="module">
    import { Renderer, Camera, Geometry, Program, Mesh } from 'https://cdn.jsdelivr.net/npm/ogl@1.0.11/src/index.mjs';

    const container = document.getElementById('particles-container');
    const particleColors = ['#ffffff', '#00d9ff'];
    const count = 400;

    const hexToRgb = hex => {
        hex = hex.replace(/^#/, '');
        const int = parseInt(hex, 16);
        return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
    };

    const vertex = `
      attribute vec3 position;
      attribute vec4 random;
      attribute vec3 color;
      uniform mat4 modelMatrix, viewMatrix, projectionMatrix;
      uniform float uTime, uSpread, uBaseSize;
      varying vec3 vColor;
      varying vec4 vRandom;
      void main() {
        vColor = color;
        vRandom = random;
        vec3 pos = position * uSpread;
        pos.z *= 10.0;
        vec4 mPos = modelMatrix * vec4(pos, 1.0);
        mPos.x += sin(uTime * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
        mPos.y += sin(uTime * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
        mPos.z += sin(uTime * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
        vec4 mvPos = viewMatrix * mPos;
        gl_PointSize = (uBaseSize * (1.0 + (random.x - 0.5))) / length(mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `;

    const fragment = `
      precision highp float;
      uniform float uTime;
      varying vec3 vColor;
      varying vec4 vRandom;
      void main() {
        vec2 uv = gl_PointCoord.xy;
        if(length(uv - vec2(0.5)) > 0.5) discard;
        gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
      }
    `;

    const renderer = new Renderer({ dpr: window.devicePixelRatio || 1, depth: false, alpha: true });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, 20);

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    window.addEventListener('resize', resize);
    resize();

    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      let x, y, z, len;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);
      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      colors.set(hexToRgb(particleColors[Math.floor(Math.random() * particleColors.length)]), i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors }
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: 10 },
        uBaseSize: { value: 100 * (window.devicePixelRatio || 1) }
      },
      transparent: true,
      depthTest: false
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    let lastTime = performance.now();
    let elapsed = 0;
    const animate = t => {
      requestAnimationFrame(animate);
      const delta = t - lastTime;
      lastTime = t;
      elapsed += delta * 0.1;
      program.uniforms.uTime.value = elapsed * 0.001;
      particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
      particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
      particles.rotation.z += 0.001;
      renderer.render({ scene: particles, camera });
    };
    requestAnimationFrame(animate);
  </script>
</body>
</html>
```

---

## Performance and Production Best Practices

1. **Always Set `pointer-events-none` on Wrapper:**
   The canvas sits across the entire viewport. Setting `pointer-events-none` ensures buttons, inputs, links, and text selection underneath work without interference.
2. **Cap `particleCount` on Mobile Devices:**
   On desktop, 400-600 particles achieve high visual quality at 60-120fps. On mobile devices, capping particle count to 150-250 reduces battery drain and GPU thermal throttling.
3. **Limit `pixelRatio`:**
   High-end phones and 4K displays often have `window.devicePixelRatio >= 3`. Cap pixel ratio to `Math.min(window.devicePixelRatio, 2)` to prevent excessive fragment shader evaluations.
4. **Use Depth Test `false`:**
   Because particles are semi-transparent point sprites rendered additively, setting `depth: false` in the renderer and `depthTest: false` in the program bypasses depth buffer writes, doubling throughput.
5. **Always Unmount Safely:**
   Ensure `cancelAnimationFrame` and `container.removeChild(gl.canvas)` run in your unmount callback to prevent WebGL context exhaustion when navigating between pages.
