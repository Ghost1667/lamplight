# Lamplight Revision

A revision website for primary and secondary students. It has short lessons, self-testing with instant explanations, spaced-repetition review, timed CBT-style drills with a WAEC-style grade, and private progress for each child.

It is built with plain **HTML, CSS and JavaScript**, so there is no build step. **Supabase** stores the lessons, questions, accounts and progress.

```
lamplight/
├── index.html              the page
├── css/styles.css          the look (light and dark mode)
├── js/config.js            ← your Supabase keys go here
├── js/app.js               the app
├── assets/icon.svg         app icon
├── manifest.webmanifest    lets phones "Add to Home Screen"
└── supabase/
    ├── schema.sql          tables + security rules (run first)
    └── seed.sql            starter lessons and questions (run second)
```

---

## 1. Create the database (about 10 minutes)

1. Go to **supabase.com** and create a free account, then click **New project**. Choose a name, a strong database password, and the region closest to your students.
2. When the project is ready, open **SQL Editor → New query**.
3. Open `supabase/schema.sql`, copy all of it, paste it into the editor and press **Run**. You should see "Success. No rows returned".
4. Make a new query, paste all of `supabase/seed.sql` and press **Run**. This loads 4 subjects, 11 topics and 68 questions. You can run it again later; it won't create duplicates.

## 2. Connect the website

1. In Supabase, open **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. Open `js/config.js` and paste them in:

   ```js
   window.LAMPLIGHT_CONFIG = {
     supabaseUrl: "https://abcdefgh.supabase.co",
     supabaseAnonKey: "eyJhbGciOi...",
   };
   ```

The anon key is meant to be public. The security rules in `schema.sql` control what each visitor can see and change. **Never** put the `service_role` key in the website.

## 3. Try it on your computer

The page has to be served by a small local web server; opening `index.html` by double-clicking won't work for sign-in. Open a terminal in the `lamplight` folder and run one of these:

```bash
python3 -m http.server 8000      # if you have Python
npx serve .                      # if you have Node.js
```

Then visit **http://localhost:8000**.

## 4. Set up sign-in emails

In Supabase, open **Authentication → URL Configuration**:

- **Site URL**: your website's address, for example `https://lamplight.netlify.app` (use `http://localhost:8000` while testing).
- **Redirect URLs**: add the same address(es).

By default, new accounts must click a confirmation link in an email. While you test, you can turn this off under **Authentication → Providers → Email → Confirm email**. Turn it back on before launch.

Supabase's built-in email sender only sends a few emails per hour, which is fine for testing. For real users, connect your own email service (such as Resend or Brevo) under **Authentication → Emails → SMTP Settings**.

## 5. Make yourself a library editor

1. Create your account on the website (top right → **Sign in → Create account**).
2. In Supabase **SQL Editor**, run the following with your own email:

   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'you@example.com');
   ```

3. Reload the website. A **Manage** tab appears. From there you can add subjects, write lessons and add questions, either one at a time or many at once by pasting one per line:

   ```
   Question | A | B | C | D | correct letter | explanation
   ```

## 6. Put it online for free

Because it's a plain static site, any static host works:

- **Netlify Drop** (easiest): go to app.netlify.com/drop and drag the `lamplight` folder onto the page. You'll get a link right away.
- **Cloudflare Pages**: Workers & Pages → Create → Pages → Upload assets → choose the folder. It's fast in Nigeria and has a generous free tier.
- **GitHub Pages**: push the folder to a GitHub repo, then go to Settings → Pages → Deploy from branch.

After deploying, add the new address to the Supabase **Site URL** and **Redirect URLs** (step 4).

---

## How it works

**Learners.** One account can hold several learners, such as siblings sharing a phone. Visitors can study without an account; their progress is then kept in the browser only. When they create an account or sign in, that progress moves into the account automatically.

**Spaced repetition.** Each question a learner answers becomes a "card" in one of five boxes. A correct answer moves the card up a box, and it comes back after 1, 2, 4, 8, then 16 days. A wrong answer sends it back to box 1, and it returns within minutes. **Today** collects whatever is due into one mixed set.

**Security rules.**

| Who | Lessons & questions | Learners & progress |
| --- | --- | --- |
| Visitor (not signed in) | read | — |
| Signed-in user | read | only their own |
| Library editor (`is_admin`) | read, add, change, delete | only their own |

## Growing it

- **Content.** Map topics to the NERDC scheme of work for each class, and have a teacher check every question.
- **Scale.** The free Supabase plan holds tens of thousands of questions and thousands of students. Upgrade the plan when you outgrow it; the code doesn't change.
- **Payments.** For subscriptions, Paystack or Flutterwave can call a Supabase Edge Function that marks an account as paid.
- **Offline.** A service worker can cache the site and recent questions so students can revise without data.
