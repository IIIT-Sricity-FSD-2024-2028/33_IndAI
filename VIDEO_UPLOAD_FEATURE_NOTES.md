# Course Provider Video Upload Feature

## What was added

- Course Provider can upload a video lesson to a specific course/topic/module.
- Backend stores the uploaded file locally in `back-end/uploads/videos/`.
- Backend stores only metadata in in-memory arrays, so the project still follows Review–4 rules.
- Uploaded videos are served from `http://localhost:3000/uploads/videos/<filename>`.
- Learner can open the enrolled course and click **Watch** on uploaded video modules.
- Swagger supports multipart upload using `POST /api/course-modules/upload-video`.

## Swagger test

1. Start backend:

```bash
cd back-end
npm install
npm run start:dev
```

2. Open:

```text
http://localhost:3000/api/docs
```

3. Use:

```text
POST /api/course-modules/upload-video
```

4. Header:

```text
x-role: COURSE_PROVIDER
```

5. Form data:

```text
courseId: c1
title: Any video title
description: Optional description
duration: 12:34
video: choose .mp4/.webm/.mov/.mkv/.avi file
```

Expected: `201 Created` with `videoUrl` and module metadata.

## Frontend test

1. Login as Course Provider.
2. Open **Videos** tab.
3. Upload a video and select a course.
4. Login as Learner.
5. Open **Learning** tab.
6. Continue/open the course.
7. Click **Watch** beside the uploaded video module.

## Review–4 explanation

The video file is saved in a local folder, while course-module metadata is stored in memory. No external database is used.
