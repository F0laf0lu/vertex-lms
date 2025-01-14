

exports.up = (pgm) => {
    pgm.createDomain("check_phone_number", "text", {
        check: "VALUE ~ '^[0-9]{10}$'",
    });


    pgm.createTable("students", {
        id: {
            type: "uuid",
            notNull: true,
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        user: { type: "uuid", notNull: true },
        dateOfBirth: { type: "varchar(50)", notNull: false },
        gender: { type: "varchar(50)", notNull: false },
        phoneNumber: { type: "check_phone_number", notNull: false },
        address: { type: "varchar(50)", notNull: false },
        city: { type: "varchar(50)", notNull: false },
        state: { type: "varchar(50)", notNull: false },
        country: { type: "varchar(50)", notNull: false },
        bio: { type: "text", notNull: false },
        profilePicture: { type: "varchar(1000)", notNull: false },
    });



pgm.addConstraint("students", "student_to_user_fk", {
    foreignKeys: {
        columns: "user",
        references: "users",
        onDelete: "CASCADE",
    },
});
};


