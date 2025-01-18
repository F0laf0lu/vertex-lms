exports.up = (pgm) => {
    pgm.createTable("module", {
        id: {
            type: "uuid",
            notNull: true,
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        name: { type: "varchar(200)", notNull: true },
        description: { type: "text", notNull: true },
        course: { type: "uuid", notNull: true },
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

    pgm.addConstraint("module", "module_course_fk_constraint", {
        foreignKeys: {
            columns: "course",
            references: "course(id)",
            onDelete: "CASCADE",
        },
    });
};

//To add
// Course duration. Add up duration of all lessons
// Reviews
// Average rating
