exports.up = (pgm) => {
    pgm.createTable("users", {
        id: {
            type: "uuid",
            notNull: true,
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        email: { type: "varchar(50)", unique: true },
        firstname: { type: "varchar(50)", notNull: true },
        lastname: { type: "varchar(50)", notNull: true },
        isInstructor: { type: "boolean", default: false },
        isVerified: { type: "boolean", default: false },
        useTwoFactorAuthentication: { type: "boolean", default: false, notNull: false },
        createdAt: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
    });
};
