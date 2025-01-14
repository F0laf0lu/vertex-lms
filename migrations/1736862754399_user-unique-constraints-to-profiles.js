exports.up = (pgm) => {
    pgm.addConstraint("instructors", "unique_user_in_instructors", {
        unique: ["user"],
    });

    pgm.addConstraint("students", "unique_user_in_students", {
        unique: ["user"],
    });
};
