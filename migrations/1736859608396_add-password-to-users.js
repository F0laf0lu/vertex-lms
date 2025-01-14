exports.up = (pgm) => {
    pgm.addColumns("users", {
        password: { type: "varchar(1000)", notNull: true },
    });
};
