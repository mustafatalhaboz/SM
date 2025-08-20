# Firebase Firestore Security Rules Fix

## Problem
Firebase Firestore Security Rules değişmiş olabilir ve test modunda değil. Bu yüzden task update işlemi "insufficient permissions" hatası veriyor.

## Solution Steps

### 1. Firebase Console'a Git
1. https://console.firebase.google.com/ adresine git
2. **sm07-1540b** projesini seç

### 2. Firestore Rules'ları Düzenle
1. Sol menüden **Firestore Database** seç
2. **Rules** tabına tık
3. Mevcut kuralları sil ve aşağıdaki test kurallarını ekle:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. Publish Rules
1. **Publish** butonuna tık
2. Kuralların yayınlandığını doğrula

### 4. Test Et
Uygulamayı yeniden test et - task update işlemi artık çalışmalı.

## Alternative: CLI Fix (Eğer Firebase CLI kullanılabilirse)

```bash
# Firebase CLI ile giriş yap
firebase login

# Projeyi seç
firebase use sm07-1540b

# Firestore rules dosyasını düzenle
echo 'rules_version = "2";
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}' > firestore.rules

# Rules'ları deploy et
firebase deploy --only firestore:rules
```

## Security Note
Bu kurallar test/development için uygundur. Production'da authentication-based kurallar kullanılmalı.

## Verification
Task update işleminin çalıştığını doğrulamak için:
1. Bir görevi bul
2. Voice command ile güncellemeyi dene: "dev planning task'ının açıklamasını güncelle"
3. Hata mesajı gelmemeli, güncelleme başarılı olmalı