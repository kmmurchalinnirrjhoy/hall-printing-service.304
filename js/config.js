/* =====================================================
   সেটিংস — URL, নম্বর, প্রিন্টের দাম এখান থেকে বদলাবেন
   ===================================================== */

// Google Apps Script Web App URL (দুই পেজই এটা ব্যবহার করে)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwGwthsCCAxH0DX2-ueLDSBW0JJuJOULqtkghDlPmhvdVnIS3nsHy5mhuSPnzFyOzg/exec";

// ---- WhatsApp number (country code সহ, + ছাড়া) ----
const WHATSAPP_NUMBER = "8801521794786";

// ---- Facebook মেসেজ লিংক ----
const FACEBOOK_URL = "https://www.facebook.com/messages/e2ee/t/9595486410564983";

// ---- Print type catalogue (single source of truth for every file card) ----
const PRINT_TYPES = [
  { value:"B&W Single (2.5 tk/page)",        min:2.5, max:7,  unit:'page',  mode:'single' },
  { value:"B&W Both Side (4 tk/sheet)",    min:4, max:15, unit:'sheet', mode:'both'   },
  { value:"Color Single (3.5 tk/page)",      min:3.5, max:8,  unit:'page',  mode:'single' },
  { value:"Color Both Side (6 tk/sheet)",  min:6, max:17, unit:'sheet', mode:'both'   },
  { value:"Passport Photo Print (5 tk/copy)", min:5, max:5, unit:'copy', mode:'flat'  },
];
