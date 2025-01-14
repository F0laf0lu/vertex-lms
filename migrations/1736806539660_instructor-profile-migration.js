exports.up = (pgm) => {
    pgm.createTable("instructors", {
        id: {
            type: "uuid",
            notNull: true,
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
            
        dateOfBirth: { type: "varchar(50)", notNull: false },
        gender: { type: "varchar(50)", notNull: false },
        phoneNumber: { type: "check_phone_number", notNull: false },
        address: { type: "varchar(50)", notNull: false },
        city: { type: "varchar(50)", notNull: false },
        state: { type: "varchar(50)", notNull: false },
        country: { type: "varchar(50)", notNull: false },
        bio: { type: "text", notNull: false },
        profilePicture: { type: "varchar(1000)", notNull: false },
        total_students: { type: "integer", notNull: false, default: 0 },
        reviews: { type: "integer", notNull: false, default: 0 },
        linkedin: { type: "varchar(300)", notNull: false },
    });

    pgm.addConstraint("students", "instructor_to_user_fk", {
        foreignKeys: {
            columns: "user",
            references: "users",
            onDelete: "CASCADE",
        },
    });
};
