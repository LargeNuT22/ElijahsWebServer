/* ============================================================================
   ANNOUNCEMENT BANNER — the only file you edit to run a promo or news banner.

   HOW TO USE
   ----------
   1. Turn it on:        set  enabled: true
   2. Write your offer:  change  text  (emojis welcome)
   3. Button (optional): linkText + link — remove or leave as-is
   4. New campaign?      change  id  to something new. Visitors who dismissed
                         an old banner will see the new one again because the
                         "don't show me" memory is per-id.
   5. Turn it off:       set  enabled: false  (nothing renders at all)

   Then deploy as usual (git push + `sudo deploy-divinity` on the server).

   EXAMPLES
   --------
   Offer:  text: '🔥 LIMITED TIME — First week FREE for new members!',
           linkText: 'Claim Offer',  link: 'contact.html'
   News:   text: '🎄 Holiday hours: staffed 8am-12pm Dec 24 — 24/7 access as always.',
           linkText: '',  link: ''   (no button, text only)
   ============================================================================ */

window.SITE_BANNER = {
    enabled: false,

    // Unique per campaign — bump this whenever you start a new banner
    id: 'first-week-free-2026-07',

    // The announcement itself
    text: '🔥 LIMITED TIME OFFER — First week FREE for new members!',

    // Optional call-to-action button (set both to '' for a text-only banner)
    linkText: 'Claim Offer',
    link: 'contact.html',

    // true = visitors can close it (remembered per campaign id)
    dismissible: true
};
