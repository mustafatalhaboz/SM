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
   - Firebase konfigürasyonu Task 1.2'de tamamlandı

3. **✅ Vercel deployment setup**
   - SSH key oluşturuldu ve GitHub'a eklendi
   - GitHub repository (mustafatalhaboz/sm) oluşturuldu ve push edildi
   - Vercel'e deploy edildi (sm-chi-two.vercel.app)
   - 404 hatası için vercel.json ve next.config.ts düzeltmeleri yapıldı

4. **✅ Firebase Konfigürasyonu** 
   - Firebase projesi "sm07" oluşturuldu ve Firestore etkinleştirildi
   - `src/lib/firebase.ts` dosyası oluşturuldu ve Firestore bağlantısı yapıldı
   - `.env.local` environment variables güvenli şekilde yapılandırıldı
   - Firebase bağlantı testi başarıyla tamamlandı

5. **✅ Proje Klasör Yapısı**
   - `src/components/`, `src/hooks/` ana klasörleri oluşturuldu
   - `components/ui/`, `components/layout/`, `components/projects/` alt klasörleri oluşturuldu
   - Her klasöre `index.ts` dosyası eklendi (clean import/export yapısı)
   - `src/lib/types.ts` dosyası oluşturuldu ve kapsamlı TypeScript data modelleri tanımlandı
   - Project, Task interfaces CLAUDE.md data modellerine uygun olarak implementasyonu
   - CRUD operasyonları için CreateProjectData, UpdateTaskData helper types eklendi
   - Default değerler ve dropdown options sabitleri (UI components için hazır)

### Faz 2: Data Modelleri & Firebase Integration (45 dk)
6. **Proje ve Task data modellerini oluştur** ✅ TAMAMLANDI
   - TypeScript interfaces tanımla ✅
   - Validation helpers oluştur

7. **Firebase Firestore CRUD operasyonları** ✅ TAMAMLANDI
   - ✅ `src/lib/firebase-operations.ts` dosyası oluşturuldu
   - ✅ Project CRUD functions: createProject, getProjects, deleteProject
   - ✅ Task CRUD functions: createTask, updateTask, deleteTask, getTasksByProject
   - ✅ Özel query: getHighPriorityTasks (priority + deadline sıralamalı)
   - ✅ Comprehensive error handling ve TypeScript type safety
   - ✅ Production build testi başarıyla tamamlandı

8. **Real-time listeners implementasyonu** ✅ TAMAMLANDI
   - ✅ `src/hooks/useFirestore.ts` - 3 custom hooks implementasyonu
   - ✅ useProjects(): Real-time projects listener with orderBy createdAt desc
   - ✅ useTasks(projectId): Project-specific tasks with filtering
   - ✅ useHighPriorityTasks(): Priority filtering + custom sorting
   - ✅ Loading states, error handling ve cleanup implementasyonu
   - ✅ TypeScript type safety ile proper interfaces

### Faz 3: UI Bileşenleri (60 dk) ✅ TAMAMLANDI
9. **Ana sayfa layout (Özet + Proje listesi)** ✅ TAMAMLANDI
   - ✅ `src/components/layout/MainLayout.tsx` - Ana layout component
   - ✅ Header: "SuperM" başlığı + Turkish date display
   - ✅ Main content area: responsive container (max-w-7xl)
   - ✅ Next.js App Router integration + Turkish metadata

10. **Proje accordion tabloları** ✅ TAMAMLANDI
    - ✅ `src/components/projects/ProjectAccordion.tsx` - Ana accordion component
    - ✅ Expand/collapse state management (chevron icons)
    - ✅ Task completion counter (X/Y tamamlandı + percentage)
    - ✅ "Yeni Görev Ekle" button per project
    - ✅ Real-time project ve task data integration

11. **Modal popup komponenti (görev düzenleme)** ✅ TAMAMLANDI
    - ✅ `src/components/ui/Modal.tsx` - Complete modal infrastructure
    - ✅ Portal rendering, ESC/overlay/X button close functionality
    - ✅ Body scroll lock, focus trap, ARIA accessibility
    - ✅ Responsive design (sm/md/lg/xl sizes) + animations
    - ✅ `src/components/projects/CreateProjectModal.tsx` - Project creation modal

12. **Özet Dashboard (Yüksek Öncelikli Görevler)** ✅ TAMAMLANDI
    - ✅ `src/components/dashboard/SummaryDashboard.tsx` - Dashboard component
    - ✅ useHighPriorityTasks hook integration + real-time data
    - ✅ Task rows: priority/status badges, overdue warnings
    - ✅ Loading, error, empty states + sample data support

### Faz 4: Core Functionality (75 dk) 
13. **Proje oluşturma functionality** ✅ TAMAMLANDI
    - ✅ CreateProjectModal: Medium-sized modal with form validation
    - ✅ Firebase createProject integration + loading states
    - ✅ Real-time proje listesi güncelleme (useProjects hook)
    - ✅ Dual create buttons: empty state + existing projects

14. **Görev CRUD operasyonları** (Sırada)
    - Quick task creation (title only)
    - Full task editing in modal
    - Task deletion functionality

15. **Görev düzenleme modal integration** (Sırada)
    - Click task to open modal
    - Form validation ve error handling
    - Modal state management

16. **Form bileşenleri (dropdown, input, date picker)** (Sırada)
    - Dropdown for status, type, priority, person
    - Text inputs for title, description
    - Date picker for deadline

### Faz 5: UI/UX Polish & Testing (30 dk)
17. **Kompakt tasarım optimizasyonu**
    - Font sizes ve spacing optimization
    - Table density artırma
    - Mobile responsive adjustments

18. **Responsive design kontrolü**
    - Mobile, tablet, desktop test
    - Modal responsive behavior
    - Touch-friendly button sizes

19. **Manual testing ve bug fix**
    - End-to-end workflow testing
    - Edge cases (empty states, error handling)
    - Browser compatibility check

### Faz 6: Deployment (15 dk)
20. **Vercel deployment konfigürasyonu**
    - Environment variables setup
    - Build configuration
    - Firebase production keys

21. **Production test ve final kontroller**
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