# دليل التثبيت والتشغيل المحلي

## الخطوة 1: تثبيت Node.js

### الطريقة الأولى: التحميل المباشر (الأسهل)
1. اذهب إلى: https://nodejs.org/
2. حمّل النسخة **LTS** (Long Term Support) - النسخة الموصى بها
3. شغّل المثبت واتبع التعليمات
4. تأكد من تحديد خيار "Add to PATH" أثناء التثبيت
5. **أعد تشغيل PowerShell أو Terminal** بعد التثبيت

### الطريقة الثانية: باستخدام Chocolatey (إذا كان مثبتاً)
```powershell
choco install nodejs-lts
```

### الطريقة الثالثة: باستخدام winget
```powershell
winget install OpenJS.NodeJS.LTS
```

## الخطوة 2: التحقق من التثبيت

بعد إعادة تشغيل Terminal، شغّل:
```bash
node --version
npm --version
```

يجب أن ترى أرقام الإصدارات.

## الخطوة 3: تثبيت مكتبات المشروع

```bash
npm install
```

## الخطوة 4: تشغيل التطبيق

```bash
npm run dev
```

## الخطوة 5: فتح التطبيق

افتح المتصفح واذهب إلى:
**http://localhost:3000**

---

## ملاحظات مهمة:

- بعد تثبيت Node.js، **يجب إعادة تشغيل Terminal/PowerShell** حتى يتم تحديث PATH
- إذا واجهت أي مشاكل، تأكد من أن Node.js مضاف إلى PATH
- يمكنك التحقق من PATH عبر: `$env:PATH` في PowerShell

## إيقاف التطبيق

اضغط `Ctrl + C` في Terminal لإيقاف الخادم المحلي.

