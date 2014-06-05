    //This file is automatically rebuilt by the Cesium build process.
    /*global define*/
    define(function() {
    "use strict";
    return "/**\n\
 * @private\n\
 */\n\
vec4 czm_translucentPhong(vec3 toEye, czm_material material)\n\
{\n\
    // Diffuse from directional light sources at eye (for top-down and horizon views)\n\
    float diffuse = czm_getLambertDiffuse(vec3(0.0, 0.0, 1.0), material.normal);\n\
    diffuse += czm_getLambertDiffuse(vec3(0.0, 1.0, 0.0), material.normal);\n\
    diffuse = clamp(diffuse, 0.0, 1.0);\n\
\n\
    // Specular from sun and pseudo-moon\n\
    float specular = czm_getSpecular(czm_sunDirectionEC, toEye, material.normal, material.shininess);\n\
    specular += czm_getSpecular(czm_moonDirectionEC, toEye, material.normal, material.shininess);\n\
\n\
    vec3 ambient = vec3(0.0);\n\
    vec3 color = ambient + material.emission;\n\
    color += material.diffuse * diffuse;\n\
    color += material.specular * specular;\n\
\n\
    return vec4(color, material.alpha);\n\
}";
});