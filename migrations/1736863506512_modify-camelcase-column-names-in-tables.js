exports.up = (pgm) => {
    pgm.renameColumn("users", "isInstructor", "isinstructor");
    pgm.renameColumn("users", "isVerified", "isverified");
    pgm.renameColumn("students", "dateOfBirth", "dateofbirth");
    pgm.renameColumn("students", "phoneNumber", "phonenumber");
    pgm.renameColumn("instructors", "dateOfBirth", "dateofbirth");
    pgm.renameColumn("instructors", "phoneNumber", "phonenumber");
};
