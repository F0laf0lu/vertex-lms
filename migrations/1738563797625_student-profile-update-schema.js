exports.up = (pgm) => {
    // Drop unnecessary columns
    pgm.dropColumns("students", [
        "dateofbirth",
        "bio",
        "address",
        "city",
        "state",
        "country",
        "gender",
        "phonenumber"
    ]);

    // Add relevant columns
    pgm.addColumns("students", {
        total_courses_enrolled: { type: "integer", notNull: false, default: 0 },
        completed_courses: { type: "integer", notNull: false, default: 0 },
        created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
        updated_at: { type: "timestamp", notNull: false },
    });

    // Ensure `updated_at` updates automatically on changes
    pgm.sql(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = current_timestamp;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS set_updated_at_students ON students;

        CREATE TRIGGER set_updated_at_students
        BEFORE UPDATE ON students
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
};

