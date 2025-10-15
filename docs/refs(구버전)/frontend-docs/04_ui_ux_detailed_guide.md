# 📄 04_ui_ux_detailed_guide.md - UI/UX 상세 가이드 (UI/UX Detailed Guide)

이 문서는 'MyMatchLog' 플랫폼의 디자인 시스템과 UI 정책을 정의합니다. 컬러, 폰트, 버튼 스타일, 반응형 규칙, 접근성 지침 등을 포함하여 일관성 있는 UI 구현을 보장합니다.

---

## 🎨 컬러 팔레트

### Primary Colors (SK렌터카 테마 기반)
- **Primary Red**: `#EA002C` (rgb(234, 0, 44))
  - 사용: 주요 브랜드 컬러, CTA 버튼, 중요한 알림
  - Hover: `#C4001F`
- **Primary Orange**: `#FF7A00` (rgb(255, 122, 0))
  - 사용: 보조 브랜드 컬러, 하이라이트, 액센트
  - Hover: `#E56A00`

### Secondary Colors
- **Gold**: `#D4AF37`
  - 사용: 프리미엄 기능, 특별 이벤트, 성취 배지
- **Light Gold**: `#F7E98E`
  - 사용: 골드 변형, 배경 강조
- **Silver**: `#C0C0C0`
  - 사용: 서브 정보, 보조 텍스트

### Neutral Colors
- **White**: `#FFFFFF`
- **Light Gray**: `#F8F9FA`
- **Gray**: `#6C757D`
- **Dark Gray**: `#343A40`
- **Black**: `#000000`

### Baseball Themed Colors
- **Field Green**: `#228B22` (야구장 잔디)
- **Dirt Brown**: `#8B4513` (야구장 흙)
- **Stadium Blue**: `#1E3A8A` (야구장 하늘)
- **Night Game**: `#0F172A` (야간 경기)

### Team Colors
- **Home Team**: `#EA002C` (Primary Red)
- **Away Team**: `#6C757D` (Gray)
- **Win**: `#228B22` (Field Green)
- **Loss**: `#DC3545` (Red)
- **Tie**: `#FFC107` (Yellow)

### Game Status Colors
- **Scheduled**: `#6C757D` (Gray)
- **Live**: `#EA002C` (Primary Red)
- **Finished**: `#228B22` (Field Green)
- **Cancelled**: `#DC3545` (Red)
- **Postponed**: `#FFC107` (Yellow)

---

## 🔤 타이포그래피

### Font Families
- **Primary**: `'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Display**: `'Poppins', 'Noto Sans KR', sans-serif`
- **Mono**: `'JetBrains Mono', 'Consolas', monospace`

### Font Sizes
- **xs**: `0.75rem` (12px)
- **sm**: `0.875rem` (14px)
- **base**: `1rem` (16px)
- **lg**: `1.125rem` (18px)
- **xl**: `1.25rem` (20px)
- **2xl**: `1.5rem` (24px)
- **3xl**: `1.875rem` (30px)
- **4xl**: `2.25rem` (36px)
- **5xl**: `3rem` (48px)

### Font Weights
- **Light**: 300
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Extrabold**: 800

### Typography Hierarchy
- **H1 (Page Title)**: 4xl, Bold, Primary Red
- **H2 (Section Title)**: 3xl, Semibold, Dark Gray
- **H3 (Subsection Title)**: 2xl, Medium, Dark Gray
- **H4 (Card Title)**: xl, Medium, Dark Gray
- **Body Text**: base, Normal, Dark Gray
- **Caption**: sm, Normal, Gray
- **Button Text**: base, Semibold, White

---

## 🔘 버튼 스타일

### Primary Button
- **Background**: `#EA002C`
- **Color**: `#FFFFFF`
- **Hover Background**: `#C4001F`
- **Border Radius**: `8px`
- **Padding**: `12px 24px`
- **Font Weight**: 600
- **Transition**: `300ms ease-in-out`

### Secondary Button
- **Background**: `#FF7A00`
- **Color**: `#FFFFFF`
- **Hover Background**: `#E56A00`
- **Border Radius**: `8px`
- **Padding**: `12px 24px`
- **Font Weight**: 500

### Outline Button
- **Background**: `transparent`
- **Color**: `#EA002C`
- **Border**: `2px solid #EA002C`
- **Hover Background**: `#EA002C`
- **Hover Color**: `#FFFFFF`
- **Border Radius**: `8px`
- **Padding**: `10px 22px`

### Ghost Button
- **Background**: `transparent`
- **Color**: `#6C757D`
- **Hover Background**: `#F8F9FA`
- **Border Radius**: `6px`
- **Padding**: `8px 16px`

### Button Sizes
- **Small**: `8px 16px`, `sm` font size
- **Medium**: `12px 24px`, `base` font size
- **Large**: `16px 32px`, `lg` font size

---

## 🃏 카드 스타일

### Default Card
- **Background**: `#FFFFFF`
- **Border**: `1px solid #E5E7EB`
- **Border Radius**: `12px`
- **Shadow**: `0 1px 3px rgba(0, 0, 0, 0.1)`
- **Padding**: `1.5rem`

### Featured Card
- **Background**: `linear-gradient(135deg, #EA002C 0%, #FF7A00 100%)`
- **Color**: `#FFFFFF`
- **Border Radius**: `12px`
- **Shadow**: `0 8px 32px rgba(234, 0, 44, 0.3)`
- **Padding**: `2rem`

### Stats Card
- **Background**: `#FFFFFF`
- **Border Left**: `4px solid #EA002C`
- **Padding**: `1.5rem`
- **Shadow**: `0 2px 8px rgba(0, 0, 0, 0.1)`

### Match Log Card
- **Background**: `#FFFFFF`
- **Border**: `1px solid #E5E7EB`
- **Border Radius**: `12px`
- **Shadow**: `0 2px 4px rgba(0, 0, 0, 0.05)`
- **Padding**: `1.25rem`
- **Hover**: `transform: translateY(-2px)`, `shadow: 0 4px 12px rgba(0, 0, 0, 0.1)`

---

## 🧭 네비게이션 스타일

### Header Navigation
- **Background**: `#FFFFFF`
- **Border Bottom**: `1px solid #E5E7EB`
- **Height**: `72px`
- **Sticky**: `true`
- **Logo**: `2xl` font size, Primary Red
- **Menu Items**: `base` font size, Medium weight
- **Hover**: Primary Red color

### Sidebar Navigation
- **Background**: `#F8F9FA`
- **Width**: `280px`
- **Border Right**: `1px solid #E5E7EB`
- **Menu Items**: `base` font size, Medium weight
- **Active State**: Primary Red background, White text
- **Hover**: Light Gray background

### Mobile Navigation
- **Background**: `#FFFFFF`
- **Overlay**: `rgba(0, 0, 0, 0.5)`
- **Menu Items**: `lg` font size, Medium weight
- **Padding**: `1rem`

---

## 📱 반응형 규칙

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`
- **Large**: `> 1280px`
- **XL**: `> 1536px`

### Container
- **Max Width**: `1200px`
- **Padding**: `1rem`
- **Mobile Padding**: `0.5rem`

### Grid System
- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 3-4 columns
- **Large**: 4-6 columns

### Spacing
- **xs**: `0.25rem` (4px)
- **sm**: `0.5rem` (8px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)
- **2xl**: `3rem` (48px)
- **3xl**: `4rem` (64px)

---

## 🎭 UI 패턴

### Hero Section
- **Background**: `linear-gradient(135deg, #EA002C 0%, #FF7A00 100%)`
- **Overlay**: `rgba(0, 0, 0, 0.3)`
- **Text Color**: `#FFFFFF`
- **Min Height**: `60vh`
- **Content**: Centered, `4xl` title, `xl` subtitle

### Timeline
- **Line Color**: `#E5E7EB`
- **Dot Color**: `#EA002C`
- **Active Dot**: `#FF7A00`
- **Spacing**: `2rem` between items

### Form Elements
- **Input Border**: `1px solid #E5E7EB`
- **Input Focus**: `2px solid #EA002C`
- **Input Border Radius**: `6px`
- **Input Padding**: `12px 16px`
- **Label**: `sm` font size, Medium weight, Dark Gray
- **Error State**: Red border, Red text

### Loading States
- **Spinner**: Primary Red color
- **Skeleton**: Light Gray background
- **Pulse Animation**: `2s ease-in-out infinite`

---

## 🎨 애니메이션

### Transitions
- **Fast**: `150ms ease-in-out`
- **Normal**: `300ms ease-in-out`
- **Slow**: `500ms ease-in-out`

### Hover Effects
- **Scale**: `transform: scale(1.05)`
- **Lift**: `transform: translateY(-4px)`
- **Glow**: `box-shadow: 0 0 20px rgba(234, 0, 44, 0.3)`

### Page Transitions
- **Fade In**: `opacity: 0 → 1`
- **Slide Up**: `transform: translateY(20px) → translateY(0)`
- **Duration**: `300ms ease-out`

---

## ♿ 접근성 지침

### Focus Management
- **Focus Ring**: `2px solid #EA002C`
- **Focus Offset**: `2px`
- **Tab Order**: Logical flow

### Color Contrast
- **Primary Text**: 4.5:1 minimum ratio
- **Large Text**: 3:1 minimum ratio
- **Interactive Elements**: 3:1 minimum ratio

### High Contrast Mode
- **Background**: `#000000`
- **Text**: `#FFFFFF`
- **Primary**: `#FF4444`
- **Secondary**: `#FFAA00`

### Screen Reader Support
- **Alt Text**: All images
- **ARIA Labels**: Interactive elements
- **Semantic HTML**: Proper heading structure
- **Skip Links**: Navigation shortcuts

### Keyboard Navigation
- **Tab Navigation**: All interactive elements
- **Enter/Space**: Button activation
- **Arrow Keys**: Dropdown menus
- **Escape**: Close modals/dropdowns

---

## 🎯 야구 특화 UI 요소

### Team Icons
- **Size**: `48px x 48px`
- **Border Radius**: `50%`
- **Border**: `2px solid #E5E7EB`
- **Hover**: `border-color: #EA002C`

### Stadium Cards
- **Background**: Stadium image with overlay
- **Overlay**: `rgba(0, 0, 0, 0.4)`
- **Text**: White, Bold
- **Hover**: Scale effect

### Game Status Badges
- **Scheduled**: Gray background, White text
- **Live**: Red background, White text, Pulse animation
- **Finished**: Green background, White text
- **Border Radius**: `20px`
- **Padding**: `4px 12px`

### Statistics Charts
- **Background**: `#FFFFFF`
- **Chart Colors**: `[#EA002C, #FF7A00, #228B22, #1E3A8A]`
- **Grid Color**: `#E5E7EB`
- **Tooltip**: Dark background, White text

---

## 📐 레이아웃 가이드라인

### Content Sections
- **Game Record**: Primary Red title, Light Gray background, Orange accent border
- **Event Highlights**: Gradient background, White text
- **Statistics**: White background, Primary Red accents

### Component Spacing
- **Section Margin**: `3rem`
- **Component Margin**: `1.5rem`
- **Element Margin**: `0.5rem`
- **Inline Spacing**: `0.25rem`

### Visual Hierarchy
- **Primary Actions**: Primary Red buttons
- **Secondary Actions**: Outline buttons
- **Information**: Gray text
- **Warnings**: Orange text
- **Errors**: Red text
- **Success**: Green text 