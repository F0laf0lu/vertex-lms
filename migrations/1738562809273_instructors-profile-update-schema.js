exports.up = (pgm) => {
    // Drop unnecessary columns
    pgm.dropColumns("instructors", [
        "dateOfNBirth",
        "reviews",
        "phoneNumber",
        "gender",
        "address",
        "city",
        "state",
        "country",
        "linkedin",
        "total_students"
    ]);

    // Add new relevant columns
    pgm.addColumns("instructors", {
        experience: { type: "integer", notNull: false, default: 0 },
        specialization: { type: "varchar(255)", notNull: false },
        certifications: { type: "jsonb", notNull: false, default: "[]" }, 
        total_courses: { type: "integer", notNull: false, default: 0 },
        average_rating: { type: "numeric(3,2)", notNull: false, default: 0.0 },
        website: { type: "varchar(300)", notNull: false },
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

        DROP TRIGGER IF EXISTS set_updated_at_instructors ON instructors;

        CREATE TRIGGER set_updated_at_instructors
        BEFORE UPDATE ON instructors
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
};


