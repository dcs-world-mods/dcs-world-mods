# מדריך פריסה חינמית — DCS World Mods

המסלול: **Vercel** (האתר) + **Neon** (מסד נתונים PostgreSQL) + **Cloudflare R2** (קבצי מודים ותמונות).
עלות: **0₪**. הזמן המשוער: 30-45 דקות.

הקוד כבר מוכן לפריסה — כל מה שנשאר הוא ליצור את החשבונות ולהדביק מפתחות.

> חשוב: את החשבונות והסיסמאות רק אתה יוצר. אל תשתף מפתחות סודיים עם אף אחד.

---

## שלב 1 — GitHub (להעלות את הקוד)

1. הירשם ב-https://github.com (אם אין לך חשבון).
2. צור מאגר חדש (New repository): שם `dcs-world-mods`, **Private**, בלי README.
3. במחשב, בתיקיית הפרויקט, הרץ (החלף `YOUR-USERNAME`):

```powershell
cd "C:\Users\dcswo\Saved Games\DCS.openbeta\Mods\tech\dcs-world-mods"
git remote add origin https://github.com/YOUR-USERNAME/dcs-world-mods.git
git push -u origin main
```

(Git יבקש להתחבר לחשבון — אשר בחלון שנפתח.)

---

## שלב 2 — Neon (מסד הנתונים)

1. הירשם ב-https://neon.tech (אפשר עם חשבון ה-GitHub).
2. צור פרויקט חדש: שם `dcs-world-mods`, אזור Europe (או הקרוב אליך).
3. בדף הפרויקט לחץ **Connect** והעתק את כתובת החיבור — היא נראית כך:
   `postgres://user:password@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`
4. שמור אותה בצד — זו ה-`DATABASE_URL`.

---

## שלב 3 — Cloudflare R2 (אחסון קבצי המודים)

1. הירשם ב-https://dash.cloudflare.com.
2. בתפריט: **R2 Object Storage** → צור Bucket בשם `dcs-world-mods`
   (יבקש להוסיף אמצעי תשלום לאימות — לא מחויבים במסגרת החינמית של 10GB).
3. בהגדרות ה-Bucket: **Settings → Public access → Allow** (r2.dev subdomain) —
   העתק את הכתובת הציבורית (`https://pub-xxxx.r2.dev`). זו `S3_PUBLIC_URL`.
4. חזרה בעמוד R2: **API → Manage API tokens → Create API token**:
   - הרשאה: Object Read & Write על ה-Bucket הזה
   - העתק: **Access Key ID** ו-**Secret Access Key**
5. את ה-endpoint תמצא באותו עמוד: `https://<account-id>.r2.cloudflarestorage.com` — זו `S3_ENDPOINT`.

---

## שלב 4 — הכנת מסד הנתונים והקבצים (פעם אחת, מהמחשב שלך)

פתח את `prisma/schema.prisma` ושנה את ה-datasource ל-PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

עדכן את הקובץ `.env` (מקומי, לא עולה ל-Git) עם הערכים שאספת:

```
DATABASE_URL="postgres://...neon.tech/neondb?sslmode=require"
AUTH_SECRET="<מחרוזת אקראית ארוכה>"
S3_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
S3_BUCKET="dcs-world-mods"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_PUBLIC_URL="https://pub-xxxx.r2.dev"
```

ואז הרץ:

```powershell
npm run db:push        # יוצר את הטבלאות ב-Neon
npm run db:seed        # קטגוריות פורום + המודים הרשמיים + תוכן דוגמה
npm run sync-uploads   # מעלה את קבצי ה-ZIP של המודים ל-R2
git add prisma/schema.prisma
git commit -m "Switch to PostgreSQL for production"
git push
```

---

## שלב 5 — Vercel (האתר באוויר)

1. הירשם ב-https://vercel.com עם חשבון ה-GitHub.
2. **Add New → Project** → בחר את המאגר `dcs-world-mods` → Import.
3. לפני Deploy, פתח **Environment Variables** והדבק את כל הערכים מ-`.env`
   (DATABASE_URL, AUTH_SECRET, S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID,
   S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL).
   ⚠ ל-AUTH_SECRET בפרודקשן צור מחרוזת חדשה וחזקה — לא את זו מהפיתוח.
4. לחץ **Deploy**. אחרי כ-2 דקות האתר באוויר בכתובת
   `https://dcs-world-mods.vercel.app` (או דומה).

---

## שלב 6 — להפוך לבעלים (Owner)

1. גלוש לאתר החי והירשם עם חשבון `dcsworldmods` (Sign up).
2. מהמחשב שלך (כשה-`.env` עדיין מצביע על Neon):

```powershell
npm run set-owner dcsworldmods
```

מעכשיו רק החשבון הזה רואה את פאנל הניהול. אין שום דרך אחרת לקבל הרשאת Owner.

---

## דומיין משלך (אופציונלי, ~$10 לשנה)

1. קנה דומיין (מומלץ: https://www.cloudflare.com/products/registrar/ או Namecheap).
2. ב-Vercel: **Project → Settings → Domains → Add** והזן את הדומיין.
3. Vercel יציג רשומת DNS אחת להוספה אצל רשם הדומיין — הוסף אותה, וזהו.

---

## תקלות נפוצות

| בעיה | פתרון |
|---|---|
| Build נכשל על Prisma | ודא ששינית את ה-provider ל-`postgresql` ודחפת ל-Git |
| תמונות/קבצים לא נשמרים | ודא שכל 5 משתני ה-S3_* מוגדרים ב-Vercel |
| "Invalid credentials" אחרי פריסה | ה-AUTH_SECRET השתנה — התחבר מחדש |
| הורדת מוד מחזירה 404 | הרץ `npm run sync-uploads` שוב מול R2 |
