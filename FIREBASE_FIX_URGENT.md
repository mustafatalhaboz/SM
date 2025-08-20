# 🚨 URGENT: Firebase Firestore Permission Fix

## Current Error
```
FirebaseError: Missing or insufficient permissions.
```

## IMMEDIATE SOLUTION (2 minutes)

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com/
2. Select project: **sm07-1540b**

### Step 2: Fix Firestore Rules
1. Click **Firestore Database** (left sidebar)
2. Click **Rules** tab
3. **Replace all existing rules** with this:

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

### Step 3: Publish
1. Click **Publish** button
2. Wait for "Rules published successfully" message

### Step 4: Verify
1. Refresh your application
2. Try voice command: "dev planning task'ını güncelle"  
3. Should work without permission error

---

## DEBUG HELP

If still having issues, run this in browser console:
```javascript
runFirebaseDiagnostic()
```

This will show exactly what permissions are missing.

---

## WHY THIS HAPPENED

Firestore rules may have reverted from test mode to production mode. The rules need to allow unauthenticated read/write for this MVP application.

**Note**: These are development rules. For production, implement proper authentication-based rules.