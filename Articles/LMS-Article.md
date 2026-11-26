Forge Bootcamp
Analysis and review of code, functionality and application features.
Did it solve a problem?

Upon first exploration of the Forge Bootcamp code I was slightly apprehensive due to it’s volume. Moreover, the back-end is built using Django and the front-end using Next.js. There are also Admin, Instructor and Student roles, further compounding the application. I wanted to ascertain what problem(s) the application had been designed to solve and for whom.
Initially I thought I would list the features. However, I appreciated that this would have led to a shallow and unoriginal review. I wanted to delve deeper and comprehend why an application was designed in a particular manner and what real problems it aimed to solve. Furthermore, I wanted to discern what knowledge a newcomer to the LMS and programming fields would need to possess in order to start working on this.

This article offers developers, educators and stakeholders a clear and well evidenced review of the underlying components of this open source LMS.
Expectation Versus Reality
Whilst I had expected this application to largely resemble other edtech products, I had anticipated that it would contain functionality to allow someone to sign-up to a course. Users would then be able to consume online learning materials (such as video content) and maybe undertake a quiz. Likely stages of user interaction would involve: sign-up, course sign-up, learning, quiz and then receipt of a certificate.
However, this application is more advanced. Once I re-signed-up and tested core functionality including user creation, course sign-up, assignment submission and WebSockets, I identified some impressive features:

Real time monitoring of cohorts using Django Channels.
Google Calendar course sign-up and event creation. VAPID keys enable push notifications to be sent.
Highly detailed role-based permissions (over 6 options): manage_users, manage_courses, view_analytics, grade_assignments and take_courses.
Identification of at risk students as well as automatic student activity recording.
Sophisticated certificate creation and export as PDF.
Assignment submission with file type checking and anti plagiarism facilities.
Alongside delivery of courses, the application thus offers a comprehensive educational solution. It provides efficient tools for managing the educational journey from sign-up to certification and also enables fast communication and administration.
Problems Solved

After reviewing the code and business rules I identified that the application was aimed at solving these matters:

1. Student-Teacher Interaction
Many students under-perform without any action being taken. Teachers can actively identify students requiring extra support through the ‘mentor_student_coverage’ and ‘at-risk’ tools. Services are responsible for updating student information and those students under-performing relative to specified criteria are shown as at-risk.

2. Updating Calendars
Typically, manually synchronising a group’s timetable with that of students is time consuming. This application automatically creates calendar events and can deliver instant notifications. I explored the OAuth feature and was impressed by the strong approach to token generation and control of scopes.

3. Role Specific Permissions
Whilst previously people tended to only have either full or no admin access, admins can now bestow particular permissions (such as the ability to grade work) to teachers. Teachers do not however gain user management permissions. These precise permissions were based on authentic application requirements rather than generic admin panel considerations.

4. Real Time Data
Django Channels is used to deliver real time data such as cohort, meeting and activity information via WebSockets. I verified this functionality by starting the development server and subsequently signing-up to and monitoring a cohort. No page reloading was required.
5. Certificate Generation
Personalised certificates can be generated and include student, cohort and date of completion data. Examination of certificate services demonstrated good exception management for situations that might arise. For example, if students do not have a profile picture, a default one is presented. Students can also have varying qualification types (none, degree, certificate etc).
Interesting Application Design
Django and Next.js
The back-end (Django) consists of:
APIs (/api/auth/, /api/programs/ and /api/assessments/)
Business Rules (services and models)
Real time data (Channels/WebSockets)
Authentication (JWT + email verification)
Front-end (Next.js) comprises:
Admin, Instructor and Student interfaces
Content editing (Tiptap editor)
Front-end navigation and state
Photo upload and display
Different front-ends (for example for mobile and/or different UIs) can interact with the back-end. Moreover, front-end alterations can be made independently of the back-end business rules.
SQLite to PostgreSQL
Code exists to migrate data from SQLite to PostgreSQL. I noted that SQLite busy-timeout, transaction_mode: IMMEDIATE and reference to WAL mode were present. This shows awareness of scalability concerns. Simply changing the DATABASE_ENGINE value enables a switch to another database type.
Built-in Security
There are a number of in-built security functions such as:
Maximum upload limits (12 and 2MB)
ASSIGNMENT_SUBMISSION_ALLOWED_EXTENSIONS (restricted to .py, .txt and .zip)
Restrictions on profile picture file types.
Clearly specified permitted domains for CSRF.
And HTTPS related settings (SECURE_PROXY_SSL_HEADER and cookies) that are appropriate for a production environment operating behind a proxy.
Roles
Each role (Admin, Instructor and Student) has dedicated views, services and URLs. Particularly well, functionality can behave differently dependent upon a user’s role. For example:
Students submit assignments and view their grades.
Teachers can mark, review and monitor cohorts.
Admins can manage users, analyse data and monitor cohorts.
Key learnings from my code review
Google Calendar OAuth
I completed the OAuth procedure. The application requires:

Environment variables GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.
A redirect URL (by default: http://localhost:8000/api/programs/student/google-calendar/callback/)
Google user authorisation via a consent page.
Token and refresh token handling.
Whilst tokens are not stored, the OAuth client is used to transform codes to tokens. google_calendar_client.py then interacts with the Google Calendar API and includes suitable error management. Scopes are correctly limited to userinfo.email and calendar.events.
Note: Whilst I did not complete the whole OAuth procedure (which involves establishing a Google Cloud project and configuring an OAuth consent page), the code is well organised and complete.
Real time data functions correctly
I started the development server and used Redis. I thereafter:
Joined a cohort channel (either via channels.layers.InMemoryChannelLayer or Redis).
Instantly viewed student progress updates on their dashboard.
Received meeting notifications through notification_services.py.
Although in-memory operation is sufficient for single process development, Redis is essential for multi-worker production deployment.
Assignment submission works well
I tested this functionality and realised that:
Students can view an assignment.
Students can then upload a file (.py, .txt and .zip only, with a max file size of 10MB).
This file is validated and recorded.
Teachers are then alerted (via WebSocket) of the submission.
They can then review and provide feedback on this.
Students can then view the marked assignment.
Both the Django model and front-end assignment upload functionality utilise the ASSIGNMENT_SUBMISSION_MAX_UPLOAD_MB and ASSIGNMENT_SUBMISSION_ALLOWED_EXTENSIONS values to control file uploads.
Certificate generation adeptly manages exceptional circumstances
Analysis of certificate services showed that:
If students have no profile picture then a default image is supplied.
Students may have various qualification types (for example none, degree and/or certificate).
Cohort specific issue dates can be stipulated.
PDF certificates are correctly styled and do not wrap.
Technical and Version Details
Technology	Version	Comment
Back-end	Django	6.0.6	Latest version for this project
API	Django REST Framework	3.16.1	Offers powerful ORM API
Auth	Simple JWT	5.5.1	Token and refresh token authentication
Real time	Data Channels	4.3.2	WebSocket tool
Cache/Redis	django-redis	5.4.0	Used for production caching
Front-end	Next.js	16.2.10	In App Router mode
UI	React	19.2.4	Latest stable version
Editor	Tiptap	3.35.0	Content editing
Style	Tailwind CSS	^4.0.Utility based styling
Database	PostgreSQL (expected)	-	Development uses SQLite, production utilises Postgres
Task queue	Celery	5.5.3	Redis broker and DB 2
Email	Resend/SMTP	-	Email service provider can be changed
Target Audience (and Exclusions)
Based on my research, this product is most suited to:
Educational establishments (such as schools and colleges) that wish to offer group educational provision and require enhanced functionality beyond simply video and quiz marking.
Bootcamps and training organisations that need real time student information, certificate generation and mentor-mentee matching.
Companies offering internal staff training and desiring role tailored functionality and assignment submission.
However, it is less suitable for:
Individual teachers who merely wish to establish a fundamental course website and seek to minimise administration effort.
Applications which must strictly conform to LMS protocols (for example SCORM and xAPI).
Projects needing immediate Postgres deployment as this application commences with SQLite and later transitions to Postgres.
How I Would Do Things Differently
If I were to create this product now I would:
Start with Postgres
Although SQLite is appropriate for development, mentions of database is lock errors and the migration from SQLite to PostgreSQL suggest that it is better to initially deploy Postgres. This will help to avoid future complications.
Introduce Redis early
As Both Channels (for strong WebSocket functionality) and Cache (for DRF rate-limiting) depend on Redis for production deployment, it is prudent to deploy this technology early. Failure to define REDIS_URL where CACHE_BACKEND is configured to redis will result in a RuntimeError.
Isolate the Google Calendar OAuth procedure
Establishing the OAuth client ID/secret requires configuration within The Google Cloud console. This is external to the code and should therefore be considered during an application’s on-boarding process.
Further strengthen file upload security
Aside from file-type restrictions, additional protection could be afforded by confirming MIME types.
Important Findings
Having widely researched, analysed and reviewed the code, I have learnt that:
Application functionality is problem orientated. Every function is aimed at resolving a real educational problem.
Roles are very clearly defined. As well as documentation, role targeted permissions, views and services are all in place.

Consideration has been given to production deployment. Security, scalability, database and environment variable configurations all illustrate this.
Appropriate use of real time data has been made. Rather than being an extra add-on, WebSockets have been deployed for real time data delivery.
Above all, compared to other LMSs, Forge Bootcamp admirably offers varied functionality. Usually 5-6 separate plugins or services would be needed to obtain such features. It is therefore extremely advantageous that this application, within one code base, includes course sign-up, real time student information, assignment submission, marking, Google Calendar, certificate generation and push notifications.