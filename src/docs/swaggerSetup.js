const { version } = require("../../package.json");
const config = require("../config/config");

const swaggerDef = {
    openapi: "3.0.0",
    info: {
        title: "Vertex Learn API documentation",
        version,
        license: {
            name: "Apache License",
            url: "https://github.com/F0laf0lu/vertex-learn/blob/main/LICENSE",
        },
    },
    servers: [
        {
            url: `http://localhost:${config.port}/v1`,
        },
    ],
};

module.exports = swaggerDef;
