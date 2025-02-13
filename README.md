# Vertex Learn

Backend for an Online Learning System built with express js provides a set of apis for learners and course instructors. With this API, learners can enroll in courses, take modules and lessons. Instructors can create and manage courses and all it's content, as well as view information about enrolled users.

# Functional Requirements Definition

Functional requirements specify the actions that a software system or application should take to satisfy the user's needs and business objectives. They describe the system's functions, features, and capabilities, as well as how it should respond under different circumstances.

- User Authentication: The API should provide a user registraion, log-in and email confimation functionality, including password recovery features. We’ll ensure that passwords are securely stored and hashed using Django’s built-in authentication system.

- Course Enrollment: The API should allow users to enroll in courses. 

- Instructor Course Creation: Instructors should be able to create new courses, add modules, lessons.

- Instructor Course Management: Instructors should be able to manage their courses, including editing or deleting course content, modules, lessons.

- Payment: Users should be able to make course payments through the API before enrolling.

# Authentication

Authentication is required for most endpoints in the API. To authenticate, include an access token in the `Authorization` header of your request. The access token can be obtained by logging in to your account or registering a new account.


The following endpoints are available in the API:

The following endpoints are available in the API:

### Authentication Endpoints

-   `/api/auth/register/` (POST): to allow users to register for an account.
-   `/api/auth/login/` (POST): to allow users to log in to their account.
-   `/api/auth/verify-email/` (POST): to allow users verify their email

### User Profile Endpoints

-   `/api/users/` (GET): to retrieve a list of all registered users.

### Course Endpoints

-   `/api/courses/` (GET): to retrieve a list of all available courses.
-   `/api/courses/<course_id>/` (GET): to retrieve information about a specific course.
-   `/api/courses/<course_id>/enroll/` (POST): to allow a user to enroll in a specific course.
