# Primuom - تطبيق ويب حديث

نظام استثمار كامل .

## البدء السريع

### التثبيت

```bash
npm install
```

### التشغيل محلياً

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح لرؤية النتيجة.

### البناء للإنتاج

```bash
npm run build
npm start
```

## النشر على Vercel

### الطريقة الأولى: عبر GitHub

1. ارفع الكود إلى مستودع GitHub
2. اذهب إلى [Vercel](https://vercel.com)
3. سجل دخول بحساب GitHub
4. اضغط على "New Project"
5. اختر المستودع الخاص بك
6. Vercel سيكتشف تلقائياً أنه مشروع Next.js
7. اضغط على "Deploy"

### الطريقة الثانية: عبر Vercel CLI

```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel
```

## البنية

```
primuom/
├── app/
│   ├── layout.tsx      # التخطيط الرئيسي
│   ├── page.tsx        # الصفحة الرئيسية
│   └── globals.css     # الأنماط العامة
├── public/             # الملفات الثابتة
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## التقنيات المستخدمة

- **Next.js 14** - إطار عمل React للإنتاج
- **TypeScript** - لغة برمجة قوية
- **Tailwind CSS** - إطار عمل CSS
- **React 18** - مكتبة واجهة المستخدم

## الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام الحر.




