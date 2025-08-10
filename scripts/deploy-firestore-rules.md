# Firestore Security Rules Deployment

## Manual Steps Required

1. **Go to Firebase Console**: https://console.firebase.google.com/project/sm07-1540b/firestore/rules

2. **Replace the current rules** with the content from `firestore.rules`

3. **Current Test Mode Rules** (to be replaced):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. **New Production Rules** features:
   - ✅ Data validation for projects and tasks
   - ✅ Field type checking (string, timestamp)
   - ✅ Size limits (project name ≤ 100, task title ≤ 200, description ≤ 1000)
   - ✅ Enum validation for status, type, priority
   - ✅ Required field checking
   - ✅ Prevents unauthorized collection access
   - ⚠️  Still allows read/write without authentication (MVP single-user)

5. **Deploy Steps**:
   - Copy content from `firestore.rules`
   - Paste into Firebase Console Rules editor
   - Click "Publish"
   - Test the application

6. **Verification**:
   - Create new project → should work
   - Create task with invalid data → should fail
   - Update task with valid data → should work

## Future Authentication Phase
When ready to add user authentication, change:
```javascript
allow read, write: if request.auth != null;
```