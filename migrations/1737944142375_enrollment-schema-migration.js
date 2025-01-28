exports.up = (pgm) => {
    pgm.createTable("enrollments", {
        id: {
            type: "uuid",
            notNull: true,
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        user_id: { type: "uuid", notNull: true },
        course_id: { type: "uuid", notNull: true },
        enrolled_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        updated_at: {
            type: "timestamp",
            notNull: false,
        },
    });

    pgm.addConstraint("enrollments", "user_enrollment_fk_constraint", {
        foreignKeys: {
            columns: "user_id",
            references: "users(id)",
            onDelete: "CASCADE",
        },
    });

    pgm.addConstraint("enrollments", "course_enrollment_fk_constraint", {
        foreignKeys: {
            columns: "course_id",
            references: "course(id)",
            onDelete: "CASCADE",
        },
    });

    pgm.addConstraint("enrollments", "unique_user_course_constraint", {
        unique: ["user_id", "course_id"],
    });

};
