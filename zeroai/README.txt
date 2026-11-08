============================================================
ZERO AI (iOS On-Device Intelligence Agent) - OTA Portal Assets
============================================================

DIRECTORY: /public/zeroai/

FILES IN THIS FOLDER:
1. manifest.plist
   - Apple Wireless Direct OTA distribution property list.
   - Configured with:
     * App Title: Zero AI
     * Bundle Identifier: com.zeroai.agent
     * Version: 1.0.0
     * IPA URL: https://urclub.vercel.app/zeroai/ZeroAI.ipa
     * 57x57 Icon: https://urclub.vercel.app/zeroai/icon-57.png
     * 512x512 Icon: https://urclub.vercel.app/zeroai/icon-512.png

2. ZeroAI.ipa
   - PLACEHOLDER FILE PRESENT.
   - [INSTRUCTION]: When you compile the production IPA (signed with an Enterprise / Ad-Hoc / Development Provisioning Profile or ready for sideloading), copy or drag your desktop "ZeroAI.ipa" directly into this directory (public/zeroai/ZeroAI.ipa), replacing the placeholder.

3. icon-57.png & icon-512.png
   - Apple iOS springboard and full-size OTA display icons.

HOW TO DEPLOY UPDATES:
1. Place the new "ZeroAI.ipa" into public/zeroai/ZeroAI.ipa
2. If version changed, update <bundle-version> inside manifest.plist
3. Run: git add public/zeroai/
4. Run: git commit -m "feat(zeroai): update ZeroAI.ipa package"
5. Run: git push origin main
============================================================
