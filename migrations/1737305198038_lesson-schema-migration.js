exports.up = (pgm) => {
    pgm.createTable("lessons", {
        id: {
            type: "uuid",
            notNull: true,
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        name: { type: "varchar(200)", notNull: true },
        module: { type: "uuid", notNull: true },
        createdAt: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        updatedAt: {
            type: "timestamp",
            notNull: false,
        },
    });

    pgm.addConstraint("lessons", "lesson_module_fk_constraint", {
        foreignKeys: {
            columns: "module",
            references: "module(id)",
            onDelete: "CASCADE",
        },
    });
};


