# إعداد الدكتور AI - Doctor AI Setup

## الخطوات المطلوبة

### 1. احصل على OpenAI API Key

1. اذهب إلى: https://platform.openai.com/
2. سجل دخول أو أنشئ حساب جديد
3. اذهب إلى: https://platform.openai.com/api-keys
4. اضغط على "Create new secret key"
5. انسخ الـ API Key (مهم: لن تستطيع رؤيته مرة أخرى!)

### 2. أضف الـ API Key في الكود

افتح ملف `doctor-ai.js` وابحث عن السطر:

```javascript
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE';
```

استبدل `YOUR_OPENAI_API_KEY_HERE` بالـ API Key الخاص بك:

```javascript
const OPENAI_API_KEY = 'sk-proj-xxxxxxxxxxxxx';
```

### 3. جرب الدكتور AI

1. افتح `doctor-ai.html` في المتصفح
2. اكتب أي سؤال طبي
3. الدكتور AI هيجاوبك!

## ملاحظات مهمة

### الأمان
- **لا تشارك الـ API Key مع أحد**
- **لا ترفع الـ API Key على GitHub**
- للإنتاج، استخدم Backend API لحماية الـ Key

### التكلفة
- OpenAI API مش مجاني
- GPT-3.5-turbo رخيص جداً (~$0.002 لكل 1000 token)
- راقب استخدامك من: https://platform.openai.com/usage

### البدائل المجانية
إذا كنت تريد بديل مجاني، يمكنك استخدام:
- Hugging Face API (مجاني مع حدود)
- Google Gemini API (له free tier)
- Anthropic Claude (له free tier)

## حماية الـ API Key (للإنتاج)

### الطريقة الصحيحة:

1. أنشئ Backend API بسيط (Node.js مثلاً)
2. احفظ الـ API Key في متغيرات البيئة
3. خلي الـ Frontend يتصل بالـ Backend
4. الـ Backend يتصل بـ OpenAI

### مثال Backend بسيط (Node.js):

```javascript
// server.js
const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }]
        })
    });
    
    const data = await response.json();
    res.json(data);
});

app.listen(3000);
```

## المميزات

✅ واجهة عربية جميلة
✅ حفظ المحادثات في localStorage
✅ أسئلة سريعة جاهزة
✅ مؤشر الكتابة (typing indicator)
✅ تصميم responsive
✅ رسائل خطأ واضحة

## الدعم

إذا واجهت أي مشكلة:
1. تأكد من صحة الـ API Key
2. تأكد من وجود رصيد في حسابك على OpenAI
3. افتح Console في المتصفح وشوف الأخطاء
