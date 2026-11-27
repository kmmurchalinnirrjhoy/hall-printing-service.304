/* =====================================================
   সেটিংস — URL, নম্বর, প্রিন্টের দাম এখান থেকে বদলাবেন
   ===================================================== */

// Google Apps Script Web App URL (দুই পেজই এটা ব্যবহার করে)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzUywkEhr3OapHuvLWD29NsdgHMY727fTj0vPKSv8Kv1PQ96ZkJV3iCpd6TVt24Ojm10g/exec";

// ---- WhatsApp number (country code সহ, + ছাড়া) ----
const WHATSAPP_NUMBER = "8801521794786";

// ---- Facebook মেসেজ লিংক ----
const FACEBOOK_URL = "https://www.facebook.com/messages/e2ee/t/9595486410564983";

// ---- বাকি টাকার তাগাদা মেসেজ (WhatsApp) ----
// লেখা ইচ্ছামতো বদলান। {name} {due} {phone} {link} নিজে থেকে বসবে, এগুলোর বানান বদলাবেন না।
// পুরো লেখা ` ` চিহ্নের ভেতরে রাখবেন।

// যার অ্যাকাউন্ট আছে
const REMINDER_MESSAGE = `আসসালামু আলাইকুম {name},
Hall Printing Service এ আপনার বাকি {due}।

সব হিসাব দেখতে লগ ইন করুন:
{link}

ফোন নম্বর: {phone}
পাসওয়ার্ড না বদলে থাকলে: 01234`;

// যার অ্যাকাউন্ট নেই
const REMINDER_MESSAGE_NO_ACCOUNT = `আসসালামু আলাইকুম {name},
Hall Printing Service এ আপনার বাকি {due}।

নিজের হিসাব দেখতে সাইন আপ করুন:
{link}`;

// ---- Print type catalogue (single source of truth for every file card) ----
const PRINT_TYPES = [
  { value:"B&W Single (2.5 tk/page)",        min:2.5, max:7,  unit:'page',  mode:'single' },
  { value:"B&W Both Side (4 tk/sheet)",    min:4, max:15, unit:'sheet', mode:'both'   },
  { value:"Color Single (3.5 tk/page)",      min:3.5, max:8,  unit:'page',  mode:'single' },
  { value:"Color Both Side (6 tk/sheet)",  min:6, max:17, unit:'sheet', mode:'both'   },
  { value:"Passport Photo Print (5 tk/copy)", min:5, max:5, unit:'copy', mode:'flat'  },
];
