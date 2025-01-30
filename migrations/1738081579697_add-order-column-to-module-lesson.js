exports.up = (pgm) => {
    pgm.addColumn("module", {
        order: {
            type: "integer",
            notNull: true,
            default: 1, 
        },
    });

    pgm.addColumn("lessons", {
        order: {
            type: "integer",
            notNull: true,
            default: 1,
        },
    });

};

exports.down = (pgm) => {
    pgm.dropColumn("module", "order");
};
