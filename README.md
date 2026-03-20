# Discord Profile Card (Placeholder)

This project is a simple placeholder webpage for showing your Discord presence/profile using Lanyard.

## Step-by-step setup

1. Join the Lanyard Discord server: [https://discord.com/invite/lanyard](https://discord.com/invite/lanyard)
2. Open the Lanyard website: [https://lanyard.cnrad.dev](https://lanyard.cnrad.dev)
3. Follow Lanyard setup instructions so your Discord account is monitored.
4. Get your Discord User ID (Developer Mode in Discord must be enabled to copy it).
5. Open `discordCard.js`.
6. Find this line:

   ```js
   const DISCORD_USER_ID = "YOUR_DISCORD_USER_ID_HERE";
   ```

7. Replace `"YOUR_DISCORD_USER_ID_HERE"` with your real Discord user ID.
8. Save the file and open `index.html` in your browser.
9. Change files `discordAvatar.jpg` and `discordBanner.jpg` with your information (alongside with `profileDecoration.jpg` if you have one).
10. Modify the rest of the profile to your likings. Colors are in `discordCard.css`

## Notes

- Your card may show as unavailable until Lanyard starts tracking your account.
- If nothing appears, make sure you joined the server and completed setup on the Lanyard site.
