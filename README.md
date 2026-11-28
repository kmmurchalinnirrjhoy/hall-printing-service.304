# Hall Printing Service

```
HallPrinting/
├── index.html        কাস্টমার পেজ (শুধু গঠন)
├── admin.html        অ্যাডমিন পেজ (শুধু গঠন)
├── account.html      সাইন আপ, লগ ইন, কাস্টমারের হিসাব
├── css/
│   ├── base.css      রং, ব্যাকগ্রাউন্ড, ফন্ট (দুই পেজের)
│   ├── style.css     কাস্টমার পেজের ডিজাইন
│   ├── admin.css     অ্যাডমিন পেজের ডিজাইন
│   ├── account.css   অ্যাকাউন্ট পেজের ডিজাইন
│   ├── menu.css      বাম পাশের মেনু
│   └── statement.css হিসাবের টেবিল
├── js/
│   ├── config.js     URL, WhatsApp নম্বর, প্রিন্টের দাম
│   ├── utils.js      ছোট সাহায্যকারী ফাংশন
│   ├── database.js   সার্ভারের সাথে যোগাযোগ
│   ├── files.js      ফাইল আপলোড ও কালার স্ক্যান
│   ├── pricing.js    দাম হিসাব
│   ├── account.js    কাস্টমারের হিসাব ও WhatsApp মেসেজ
│   ├── app.js        কাস্টমার পেজের বাটন ও সাবমিট
│   ├── session.js    কাস্টমার লগইন মনে রাখা
│   ├── menu.js       বাম পাশের মেনু
│   ├── progress.js   অর্ডার পাঠানোর অগ্রগতি
│   ├── statement.js  হিসাবের টেবিল
│   ├── myaccount.js  অ্যাকাউন্ট পেজ
│   ├── auth.js       অ্যাডমিন লগইন
│   ├── admin.js      অ্যাডমিন প্যানেল
│   ├── manual.js     ফাইল ছাড়া নতুন এন্ট্রি
│   └── passwords.js  অ্যাডমিন: পাসওয়ার্ড দেখা ও পাঠানো
├── assets/images/    লোগো
└── apps-script/
    └── Code.js       Google Apps Script (ওয়েবসাইটে আপলোড করবেন না)
```

## কোথায় কী বদলাবেন
| কাজ | ফাইল |
|---|---|
| প্রিন্টের দাম, WhatsApp নম্বর, API URL, তাগাদা ও পাসওয়ার্ড মেসেজ | `js/config.js` |
| রং | `css/base.css` |
| ডিজাইন | `css/style.css`, `css/admin.css` (PC এর অংশ ফাইলের নিচে `@media`) |
| লেখা / বাটন | `index.html`, `admin.html` |
| Sheet এর হিসাব, PIN | `apps-script/Code.js` → Apps Script এ paste করে নতুন version deploy |

## মনে রাখুন
- ওয়েবসাইটে আপলোড করবেন: `index.html`, `admin.html`, `account.html`, `css/`, `js/`, `assets/` (ফোল্ডারের গঠন একই রেখে)।
- `js/` ফাইলগুলোর `<script>` ক্রম বদলাবেন না।

## কাস্টমার অ্যাকাউন্ট
- Sheet-এ `Accounts` ট্যাব নিজে থেকে তৈরি হয়: ক্রমিক নম্বর | নাম | ফোন নম্বর | পাসওয়ার্ড
- `Accounts` এর নাম আর `Print_Data` এর নাম মিললে কাস্টমার সেই হিসাব দেখে।
- আগে থেকে থাকা নামে নতুন অ্যাকাউন্ট হলে নাম হয় `নাম (ফোনের শেষ ৪ সংখ্যা)`। যাচাই করে `Accounts` ও `Print_Data` দুই ট্যাবেই নাম ঠিক করুন।
- পাসওয়ার্ড রিসেট: `Accounts` ট্যাবের পাসওয়ার্ড ঘরে `01234` লিখুন।
