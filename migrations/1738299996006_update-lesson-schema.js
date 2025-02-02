exports.up = (pgm) => {
    pgm.addColumn("lessons", {
        lessontext: { type: "text", notNull: false },
        lessonvideo: { type: "varchar(500)", notNull: false },
        duration: { type: "integer", notNull: false },
    });

    pgm.sql(`
        CREATE OR REPLACE FUNCTION update_updatedAt_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW."updatedAt" = current_timestamp;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS set_updated_at ON lessons;

        CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON lessons
        FOR EACH ROW
        EXECUTE FUNCTION update_updatedAt_column();
    `);
};

