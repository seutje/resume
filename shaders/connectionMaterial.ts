export const connectionVertexShader = `
uniform sampler2D uPositions;

varying float vAlpha;

void main() {
    vec3 pos = texture2D(uPositions, position.xy).xyz;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float depth = -mvPosition.z;
    vAlpha = smoothstep(120.0, 20.0, depth);
}
`;

export const connectionFragmentShader = `
uniform vec3 uColor;
uniform float uOpacity;

varying float vAlpha;

void main() {
    gl_FragColor = vec4(uColor, uOpacity * vAlpha);
}
`;
