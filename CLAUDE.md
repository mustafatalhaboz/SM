# Task Management Web Application

## Proje Genel Bakış
İki yazılım ajansını yöneten Mustafa Talha Boz için merkezi görev ve proje yönetimi sistemi. MVP odaklı, birkaç saatte tamamlanacak kompakt bir to-do uygulaması.

## Teknoloji Stack
- **Frontend**: Next.js (son stable versiyon)
- **Database**: Firebase Firestore
- **Deployment**: Vercel
- **UI**: Responsive, kompakt tasarım
- **Real-time**: Firebase listeners

## Proje Komutları
```bash
# Proje başlatma
npx create-next-app@latest task-management --typescript --tailwind --app
cd task-management

# Firebase setup
npm install firebase
npm install @firebase/firestore

# Geliştirme
npm run dev

# Build ve deploy
npm run build
npm run start

# Vercel deployment
npx vercel
```

## Data Modelleri

### Project Model
```typescript
interface Project {
  id: string;
  name: string;
  createdAt: timestamp;
}
```

### Task Model
```typescript
interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedPerson: string;
  status: 'Yapılacak' | 'Yapılıyor' | 'Beklemede' | 'Blocked' | 'Yapıldı';
  type: 'Operasyon' | 'Yönlendirme' | 'Takip';
  priority: 'Yüksek' | 'Orta' | 'Düşük';
  deadline: Date;
  createdAt: timestamp;
}
```

## Firestore Yapısı
```
/projects/{projectId} - Project documents
/tasks/{taskId} - Task documents (projectId reference ile)
```

## Geliştirme Fazları

### Faz 1: Proje Setup (30 dk) ✅ TAMAMLANDI
1. **✅ Next.js uygulaması oluştur** 
   - `npx create-next-app@latest superm --typescript --tailwind --eslint --app --src-dir --yes` ile kurulum
   - src/ klasör yapısı ile App Router kullanıldı
   - TypeScript, Tailwind CSS, ESLint aktif

2. **✅ Firebase SDK kurulumu**
   - `npm install firebase` ile Firebase v12.1.0 eklendi 
   - package.json'da dependency doğrulandı
   - Firebase konfigürasyonu bir sonraki taskta yapılacak

3. **✅ Vercel deployment setup**
   - SSH key oluşturuldu ve GitHub'a eklendi
   - GitHub repository (mustafatalhaboz/sm) oluşturuldu ve push edildi
   - Vercel'e deploy edildi (sm-chi-two.vercel.app)
   - 404 hatası için vercel.json ve next.config.ts düzeltmeleri yapıldı

### Faz 2: Data Modelleri & Firebase Integration (45 dk)
4. **Proje ve Task data modellerini oluştur**
   - TypeScript interfaces tanımla
   - Validation helpers oluştur

5. **Firebase Firestore CRUD operasyonları**
   - Project CRUD functions (create, read, update, delete)
   - Task CRUD functions
   - Query helpers (by project, by priority)

6. **Real-time listeners implementasyonu**
   - useEffect hooks ile real-time data listening
   - State management for projects and tasks

### Faz 3: UI Bileşenleri (60 dk)
7. **Ana sayfa layout (Özet + Proje listesi)**
   - Main layout component
   - Summary section (top)
   - Projects list section (bottom)
   - Kompakt tasarım ile responsive grid

8. **Proje accordion tabloları**
   - Accordion component (expand/collapse)
   - Project table with task list
   - "Yeni Görev Ekle" button integration

9. **Modal popup komponenti (görev düzenleme)**
   - Modal overlay ve content
   - Form fields for task attributes
   - Save/Cancel actions

10. **Form bileşenleri (dropdown, input, date picker)**
    - Dropdown for status, type, priority, person
    - Text inputs for title, description
    - Date picker for deadline

### Faz 4: Core Functionality (75 dk)
11. **Proje oluşturma functionality**
    - "Proje Oluştur" button ve inline form
    - Firebase'e proje kaydetme
    - Real-time proje listesi güncelleme

12. **Görev CRUD operasyonları**
    - Quick task creation (title only)
    - Full task editing in modal
    - Task deletion functionality

13. **Görev düzenleme modal integration**
    - Click task to open modal
    - Form validation ve error handling
    - Modal state management

14. **Özet dashboard logic (öncelik + deadline sıralaması)**
    - High priority tasks filtering
    - Deadline-based sorting
    - Project grouping in summary
    - Quick status update from summary

### Faz 5: UI/UX Polish & Testing (30 dk)
15. **Kompakt tasarım optimizasyonu**
    - Font sizes ve spacing optimization
    - Table density artırma
    - Mobile responsive adjustments

16. **Responsive design kontrolü**
    - Mobile, tablet, desktop test
    - Modal responsive behavior
    - Touch-friendly button sizes

17. **Manual testing ve bug fix**
    - End-to-end workflow testing
    - Edge cases (empty states, error handling)
    - Browser compatibility check

### Faz 6: Deployment (15 dk)
18. **Vercel deployment konfigürasyonu**
    - Environment variables setup
    - Build configuration
    - Firebase production keys

19. **Production test ve final kontroller**
    - Live deployment test
    - Performance check
    - Final bug fixes

## UI Gereksinimleri

### Ana Sayfa Layout
- **Özet Alanı**: Üst kısımda yüksek öncelikli görevler
- **Proje Listesi**: Alt kısımda accordion yapısı
- **Kompakt Tasarım**: Küçük fontlar ve bileşenler

### Proje Yönetimi
- Proje tablosunun altında "Proje Oluştur" butonu
- Inline text input ile proje ismi girişi
- Kaydet butonu ile tabloya ekleme

### Görev Yönetimi
- Her proje tablosunda "Yeni Görev Ekle" butonu
- Quick task creation (sadece başlık)
- Task'a tıklayarak detaylı düzenleme modal'ı
- Modal'da tüm task attributes

## Firestore Security Rules
```javascript
// Test mode - herkes okuyup yazabilir (authentication yok)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Success Criteria
1. ✅ Proje oluşturma ve yönetim
2. ✅ Görevleri tüm attributes ile ekleme/düzenleme
3. ✅ Öncelikli görevlerin özet görünümü
4. ✅ Kompakt ve fonksiyonel UI
5. ✅ Firebase ile real-time güncellemeler
6. ✅ Birkaç saatte deploy edilebilir durum

## Kapsam Dışı (MVP'de Yok)
- User authentication
- File attachments
- Advanced reporting
- Email notifications
- Mobile app
- Data export
- Bulk operations
- Task dependencies
- Time tracking
- Comments/collaboration

## Development Notes
- Geliştirme süreci boyunca her faz tamamlandıkında test et
- Firebase real-time listeners için cleanup unutma
- Modal state management için React state kullan
- Error handling tüm CRUD operasyonlarda olsun
- Loading states kullanıcı deneyimi için önemli