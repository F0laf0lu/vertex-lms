exports.up = (pgm) => {
    pgm.createTable("course", {
        id: {
            type: "uuid",
            notNull: true,
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        name: { type: "varchar(200)", notNull: true},
        description: { type: "text", notNull: true },
        instructor: { type: "uuid", notNull: true },
        price: { type: "decimal", notNull: false},
        difficulty: { type: "varchar(20)", notNull: true },
        prerequisites: { type: "text", notNull: false },
        coverimage: { type: "varchar(1000)", notNull: false },
        iscertified: { type: "boolean", default: false },
        isavailable: { type: "boolean", default: true },
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

    pgm.addConstraint("course", "difficulty_valid_values", {
        check: ["difficulty IN ('beginner', 'intermediate', 'advanced')"],
    });
};


//To add
// Course duration. Add up duration of all lessons
// Reviews
// Average rating