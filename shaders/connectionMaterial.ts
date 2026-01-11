export const connectionVertexShader = `
uniform sampler2D uPositions;
uniform vec3 uTarget1;
uniform vec3 uTarget2;
uniform vec3 uTarget3;
uniform float uConnectionRadius;

attribute vec2 aOther;

varying float vAlpha;

float minTargetDistance(vec3 pos) {
    float d1 = distance(pos, uTarget1);
    float d2 = distance(pos, uTarget2);
    float d3 = distance(pos, uTarget3);
    return min(d1, min(d2, d3));
}

void main() {
    vec3 pos = texture2D(uPositions, position.xy).xyz;
    vec3 otherPos = texture2D(uPositions, aOther).xyz;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float depth = -mvPosition.z;
    float depthAlpha = smoothstep(120.0, 20.0, depth);
    float d1 = minTargetDistance(pos);
    float d2 = minTargetDistance(otherPos);
    float nearBoth = step(max(d1, d2), uConnectionRadius);
    vAlpha = depthAlpha * nearBoth;
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
