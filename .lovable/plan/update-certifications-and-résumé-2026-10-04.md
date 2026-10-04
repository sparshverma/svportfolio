# Update certifications and résumé

## Goal
Replace the portfolio’s existing certification list with the **18 certificates in the uploaded text file**, and make the uploaded AI Engineer résumé the file downloaded from “Download CV.” Keep the current site design and all other content unchanged.

## Changes
1. Replace the 11 current certification entries with the uploaded list, in its supplied order. Use its exact certificate names and verification links, including updated links for certificates that already appear on the site. Remove the old Project Management entry because it is not in the new list.
2. Show the appropriate issuer on each certificate card while retaining the existing card layout, colors, hover behavior, and link treatment in both themes. “Vibe Coding L2: Silver (Lovable)” has no URL in the upload, so display it as a non-clickable card rather than inventing a link.
3. Replace the downloadable PDF behind the existing “Download CV” button with the uploaded `sparshverma_AI_Engineer.pdf`. Keep the button’s appearance and behavior; no need to rewrite résumé content on the page.

## Technical details
- Update the certification data in `src/components/Certifications.tsx`; leave its presentation intact.
- Store the new PDF through the project asset flow and point the existing Hero download link at the new asset, preserving a readable download filename. Remove or retire the outdated public PDF only after confirming no other references remain.
- The uploaded résumé itself lists 17 certificates; the separate certificate list contains an additional “Software Development Mastery: Antipatterns.” Use the **18-item text list** for the website and leave the uploaded résumé unchanged as supplied.

## Verification
- Check that all 18 certificates render once, in order; linked cards open their supplied verification URLs and the unlinked Lovable card is not clickable.
- Download the résumé from the Hero button and confirm it is the uploaded two-page PDF; check certification cards and download button on mobile and desktop in light and dark modes.
