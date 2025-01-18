exports.up = (pgm) => {
    pgm.addColumns("users", {
        isadmin: { type: "boolean", default: false },
    });
};
