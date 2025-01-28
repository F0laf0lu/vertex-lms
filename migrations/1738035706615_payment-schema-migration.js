exports.up = (pgm) => { 
    pgm.createTable("payments", {
        id: {
            type: "uuid",
            notNull: true,
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        user_id: { type: "uuid", notNull: true },
        course_id: { type: "uuid", notNull: true },
        reference: { type: "varchar(255)", notNull: true },
        is_paid: { type: "boolean", notNull: true, default: false },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
    });

    // Add unique constraint to the `reference` column
    pgm.addConstraint("payments", "unique_reference_in_payments", {
        unique: ["reference"],
    });

    // Add foreign key constraint for `user_id` and `order_id` if related tables exist
    pgm.addConstraint("payments", "fk_payments_user_id", {
        foreignKeys: {
            columns: "user_id",
            references: "users(id)",
            onDelete: "CASCADE",
        },
    });

    pgm.addConstraint("payments", "fk_payments_course_id", {
        foreignKeys: {
            columns: "course_id",
            references: "course(id)",
            onDelete: "CASCADE",
        },
    });
};

exports.down = (pgm) => {
    // Drop constraints first
    pgm.dropConstraint("payments", "fk_payments_user_id");
    pgm.dropConstraint("payments", "fk_payments_course_id");
    pgm.dropConstraint("payments", "unique_reference_in_payments");

    // Drop the table
    pgm.dropTable("payments");
};
