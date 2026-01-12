import * as THREE from 'three';

export const particleVertexShader = `
uniform sampler2D uPositions;
uniform float uPointSize;

// Attractor data passed to colorize
uniform vec3 uTarget1;
uniform vec3 uTarget2;
uniform vec3 uTarget3;
uniform vec3 uTarget4;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;

varying vec3 vColor;
varying float vDist;

void main() {
    // Read position from the simulation texture
    // The attribute 'position' contains UV coordinates
    vec3 pos = texture2D(uPositions, position.xy).xyz;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Distance based sizing (Attenuate size by depth)
    // Reverted to initial scaling factor
    gl_PointSize = uPointSize * (10.0 / -mvPosition.z);

    // Color mixing based on proximity
    float d1 = distance(pos, uTarget1);
    float d2 = distance(pos, uTarget2);
    float d3 = distance(pos, uTarget3);
    float d4 = distance(pos, uTarget4);
    
    vec3 baseColor = vec3(0.4, 0.4, 0.5); // Greyish blue default
    
    float influence1 = smoothstep(8.0, 0.0, d1);
    float influence2 = smoothstep(8.0, 0.0, d2);
    float influence3 = smoothstep(8.0, 0.0, d3);
    float influence4 = smoothstep(8.0, 0.0, d4);
    
    vec3 finalColor = baseColor;
    finalColor = mix(finalColor, uColor1, influence1);
    finalColor = mix(finalColor, uColor2, influence2);
    finalColor = mix(finalColor, uColor3, influence3);
    finalColor = mix(finalColor, uColor4, influence4);

    vColor = finalColor;
    vDist = -mvPosition.z;
}
`;

export const particleFragmentShader = `
varying vec3 vColor;

void main() {
    // Circular particle
    vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
    if (dot(circCoord, circCoord) > 1.0) {
        discard;
    }
    
    // Soft edge
    float alpha = 1.0 - smoothstep(0.8, 1.0, length(circCoord));
    
    gl_FragColor = vec4(vColor, alpha);
}
`;
