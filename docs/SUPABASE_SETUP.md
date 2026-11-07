# Setting up cloud sync (Supabase)

Cloud sync is optional. Until you finish these steps, PulseFit works exactly as before, entirely in your browser.

It takes about 20 minutes. The Google part takes the longest and you can skip it, because email sign-in links work on their own. Supabase redesigns its dashboard now and then, so a menu name may differ slightly from what's written here.

The site address used below is `https://idarkdeveloper.github.io/fitnesswebsite/`.

## 1. Create the project

1. Sign up or log in at <https://supabase.com>, then click **New project**.
2. Fill in the details:
   - **Name:** `pulsefit`
   - **Database password:** click **Generate**, then save it in your password manager. The app never uses it; you'd only need it for direct database access.
   - **Region:** the one closest to you.
3. Click **Create new project** and wait about 2 minutes.

## 2. Create the table and security rules

1. In the left menu, open **SQL Editor** and click **New query**.
2. Paste the whole of [`supabase/0001_sync.sql`](../supabase/0001_sync.sql) and click **Run**. You should see "Success. No rows returned".
3. Click **New query** again and run the line below, using **your** email in lower case:
   ```sql
   insert into public.allowed_emails values ('you@example.com');
   ```
   Only emails in this list can sync. Everyone else who signs in sees nothing and can't write anything.

## 3. Allow the site to receive sign-ins

1. Open **Authentication → URL Configuration**.
2. Set **Site URL** to `https://idarkdeveloper.github.io/fitnesswebsite/`.
3. Under **Redirect URLs**, add both of these:
   - `https://idarkdeveloper.github.io/fitnesswebsite/`
   - `http://localhost:8080/` (only needed if you test locally)

## 4. Create your user

1. Open **Authentication → Users → Add user → Send invitation**, and enter your email.
2. Open the invitation email and click the link. This creates your account.

The app never creates new accounts from email links, so this step is required for email sign-in.

## 5. (Optional) Turn on Google sign-in

1. Go to <https://console.cloud.google.com>, create a project (or use an existing one), then open **APIs & Services → OAuth consent screen**.
   - Choose **External** and fill in the app name and your email.
   - Under **Test users**, add your Gmail address. You can leave the app in "Testing" mode, since only you will use it.
2. Open **APIs & Services → Credentials → Create credentials → OAuth client ID** and fill it in:
   - **Application type:** Web application
   - **Authorized JavaScript origins:** `https://idarkdeveloper.github.io`
   - **Authorized redirect URIs:** the callback URL shown in Supabase under **Authentication → Sign In / Providers → Google**. It looks like `https://<your-project>.supabase.co/auth/v1/callback`.
3. Copy the **Client ID** and **Client secret** into that Supabase Google page, switch Google **on**, and click **Save**.

The client secret goes **only** into the Supabase dashboard. Never put it in the site, the repo, or a chat.

## 6. Close the door to new accounts

1. Sign in once from the app (step 8) with every method you plan to use, so your account exists.
2. Then open **Authentication → Sign In / Providers** and turn **off** "Allow new users to sign up".
3. If Google sign-in stops working afterwards, turn signups back on. The allowlist from step 2 already blocks everyone else from your data.

## 7. Connect the app

1. In Supabase, open **Project Settings → API** (on some projects it's called **API Keys**) and copy:
   - the **Project URL**, like `https://abcdefghijklm.supabase.co`
   - the **anon public** key (or the **publishable** key, `sb_publishable_…`, on newer projects)
2. Put both into [`sync-config.js`](../sync-config.js), then commit and push.
   - These two values are **public by design**. They only work within the database's security rules, so it's fine for them to be in the site.
   - **Never** use the `service_role` or **secret** key anywhere in the site. That key bypasses every rule.

## 8. Try it

1. On your phone and on your computer, open the site and go to **Profile → Back up & sync**.
2. Sign in with Google, or enter your email and open the link **in the same browser**. Email links only work in the browser that asked for them.
3. The Account card should say "Synced just now".
   - Log a workout on one device, then open the app on the other. It appears within a few seconds of the app getting focus.

## Things to know

- **The free plan pauses projects after about a week with no activity.**
  - While paused, the Account card says it can't reach the cloud, and everything keeps working on your devices.
  - Click **Restore project** in the Supabase dashboard; nothing is lost.
  - Using the app at least weekly keeps it awake.
- **Email links:** Supabase's built-in email service sends only a few emails per hour. That's fine for one person; if you hit the limit, use Google or wait an hour.
- **Deleting:** **Profile → Delete cloud data** removes your synced copy. To also remove the account, delete the user in **Authentication → Users**.
- **Tests:** `node tools/test-merge.js` checks the merge rules. `tools/test-sync-browser.js` runs two simulated devices against a fake cloud; it needs Playwright.
