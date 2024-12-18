import { ShaderMaterial, ShaderLanguage, Scene, Effect, Color4 } from '@babylonjs/core';

export function createOutlineShaderMaterial(scene: Scene, shaderId: string, outlineColor: Color4, outlineWidth: number) {
  // Load the vertex and fragment shaders
  Effect.ShadersStore['outlineVertexShader'] = `
    #version 300 es
    precision highp float;

    in vec3 position;
    in vec3 normal;

    uniform mat4 worldViewProjection;
    uniform float outlineWidth;

    void main(void) {
        vec3 offsetPosition = position + normal * outlineWidth;
        gl_Position = worldViewProjection * vec4(offsetPosition, 1.0);
    }

  `;

  Effect.ShadersStore['outlineFragmentShader'] = `
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec4 outlineColor;

    void main() {
        gl_FragColor = outlineColor; // Solid outline color
    }
  `;

  // Create the shader material
  const material = new ShaderMaterial(
    shaderId,
    scene,
    {
      vertex: 'outline',
      fragment: 'outline',
    },
    {
      attributes: ['position', 'normal'],
      uniforms: ['worldViewProjection', 'outlineWidth', 'outlineColor'],
    }
  );

  // Set the outline properties
  material.setFloat('outlineWidth', outlineWidth);
  material.setColor4('outlineColor', outlineColor);
  material.backFaceCulling = false;
  material.forceDepthWrite = true;
  material.zOffset = -1; 
  return material;
}
