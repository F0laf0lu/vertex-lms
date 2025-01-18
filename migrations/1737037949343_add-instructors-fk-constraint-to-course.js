
exports.up = (pgm) => {
    pgm.addConstraint("course", "fk_instructors_constraint_to_course", {
        foreignKeys: {
            columns: "instructor",
            references: "instructors(id)",
            onDelete: "CASCADE",
        },
    });
};
