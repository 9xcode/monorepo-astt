<script lang="ts">
  import { Check, X } from '@lucide/svelte';

  let {
    open = $bindable(false),
    title,
    url,
    /**
     * Optional OG image URL for Pinterest.
     * Pinterest's share button REQUIRES a &media= image URL — without it the
     * pin dialog shows "invalid". Pass your og:image value here and Pinterest
     * will appear in the grid; omit it and Pinterest is hidden automatically.
     */
    imageUrl = "",
  } = $props<{
    open: boolean;
    title: string;
    url: string;
    imageUrl?: string;
  }>();

  let copySuccess = $state(false);

  const enc = (s: string) => encodeURIComponent(s);

  // -------------------------------------------------------------------
  // Encouraging message used in clipboard copy and text-based shares.
  // Short enough for every platform, warm enough to actually get clicked.
  // -------------------------------------------------------------------
  const shareMessage = $derived(
    `✨ Just found this **${title}** is genuinely useful. Give it a try!`
  );

  // Clipboard payload: message on line 1, clean URL on line 2
  const clipboardPayload = $derived(`${shareMessage}\n${url}`);

  // -------------------------------------------------------------------
  // Share links — ordered by global daily active users for tool sharing.
  //
  // API NOTES (important — these are the bugs you hit):
  //
  //  WhatsApp  — use wa.me/?text= (not api.whatsapp.com). Carries full
  //              message + URL in one param.
  //
  //  Telegram  — url= + text= both shown; text appears above the link preview.
  //
  //  Facebook  — ONLY u= works. Title/description/image come from the
  //              og:title / og:description / og:image tags on YOUR page.
  //              Any title= or description= params are silently ignored.
  //
  //  X/Twitter — text= + url= both work; text appears in the compose box.
  //
  //  Reddit    — url= + title= pre-fill the submission form.
  //
  //  LinkedIn  — ONLY url= is respected. All other params (title, summary,
  //              source) are stripped. Card preview comes from og: tags on
  //              your page. Use share-offsite (shareArticle is legacy/dead).
  //
  //  Email     — subject= + body= pre-fill the mail client.
  //
  //  Bluesky   — text= carries the full message including URL.
  //
  //  Threads   — text= carries the full message including URL.
  //
  //  Mastodon  — text= carries the full message including URL.
  //
  //  Pinterest — REQUIRES &media= (an absolute image URL). Without it,
  //              the pin dialog shows "Invalid Pin" or refuses to submit.
  //              Conditionally included below; hidden when toolImageUrl is empty.
  // -------------------------------------------------------------------
  let shareLinks = $derived([
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc(shareMessage + "\n" + url)}`,
      color: "#25D366",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.137.563 4.14 1.544 5.868L0 24l6.334-1.524A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.739 9.739 0 01-4.98-1.368l-.357-.212-3.76.906.948-3.641-.233-.375A9.694 9.694 0 012.25 12C2.25 6.614 6.614 2.25 12 2.25S21.75 6.614 21.75 12 17.386 21.75 12 21.75z"/></svg>`,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(shareMessage)}`,
      color: "#2AABEE",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.83.941z"/></svg>`,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(shareMessage)}`,
      color: "#1877F2",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    },
    {
      label: "X / Twitter",
      href: `https://twitter.com/intent/tweet?text=${enc(shareMessage)}&url=${enc(url)}`,
      color: "#000000",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    },
    {
      label: "Reddit",
      href: `https://reddit.com/submit?url=${enc(url)}&title=${enc(title)}`,
      color: "#FF4500",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>`,
    },
    {
      label: "LinkedIn",
      // Modern endpoint. shareArticle is the old/dead URL.
      // LinkedIn reads title + image + description from og: tags on your page —
      // passing them as URL params does nothing.
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
      color: "#0A66C2",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    },
    {
      label: "Email",
      href: `mailto:?subject=${enc("You'll love this: " + title)}&body=${enc(shareMessage + "\n\n" + url + "\n\nEnjoy!")}`,
      color: "#6B7280",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>`,
    },
    {
      label: "Bluesky",
      href: `https://bsky.app/intent/compose?text=${enc(shareMessage + "\n" + url)}`,
      color: "#0285FF",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.905C2.566 1.07 1.259.5 0 0v1.5c0 2.498 1.578 7.333 2.5 8.5 1.488 1.883 4.544 2.81 7.159 2.5-3.333.625-5.5 2.5-3.75 6.25 1.633 3.5 6.133-1.666 6.091-1.666.042 0 4.458 5.166 6.091 1.666 1.75-3.75-.417-5.625-3.75-6.25 2.615.31 5.671-.617 7.159-2.5.922-1.167 2.5-6.002 2.5-8.5V0c-1.259.5-2.566 1.07-5.202 2.895-2.752 1.852-5.711 5.791-6.798 7.905Z"/></svg>`,
    },
    {
      label: "Threads",
      href: `https://www.threads.net/intent/post?text=${enc(shareMessage + " " + url)}`,
      color: "#000000",
      svg: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/></svg>`,
    },
    {
      label: "Mastodon",
      href: `https://mastodon.social/share?text=${enc(shareMessage + " " + url)}`,
      color: "#6364FF",
      svg: `<svg viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M 15.659 9.592 C 15.424 10.72 13.553 11.956 11.404 12.195 C 10.283 12.32 9.18 12.434 8.003 12.384 C 6.079 12.302 4.56 11.956 4.56 11.956 C 4.56 12.13 4.572 12.297 4.595 12.452 C 4.845 14.224 6.478 14.33 8.025 14.379 C 9.586 14.429 10.976 14.02 10.976 14.02 L 11.04 15.337 C 11.04 15.337 9.948 15.884 8.003 15.984 C 6.93 16.039 5.598 15.959 4.047 15.576 C 0.683 14.746 0.104 11.4 0.015 8.006 C -0.012 6.998 0.005 6.048 0.005 5.253 C 0.005 1.782 2.443 0.765 2.443 0.765 C 3.672 0.238 5.782 0.017 7.975 0 L 8.029 0 C 10.221 0.017 12.332 0.238 13.561 0.765 C 13.561 0.765 15.999 1.782 15.999 5.253 C 15.999 5.253 16.03 7.814 15.659 9.592 Z M 13.124 5.522 L 13.124 9.725 L 11.339 9.725 L 11.339 5.646 C 11.339 4.786 10.951 4.35 10.175 4.35 C 9.317 4.35 8.887 4.867 8.887 5.891 L 8.887 8.124 L 7.113 8.124 L 7.113 5.891 C 7.113 4.867 6.683 4.35 5.825 4.35 C 5.049 4.35 4.661 4.786 4.661 5.646 L 4.661 9.725 L 2.876 9.725 L 2.876 5.522 C 2.876 4.663 3.111 3.981 3.582 3.476 C 4.067 2.971 4.703 2.712 5.493 2.712 C 6.406 2.712 7.098 3.039 7.555 3.695 L 8 4.39 L 8.445 3.695 C 8.902 3.039 9.594 2.712 10.507 2.712 C 11.297 2.712 11.933 2.971 12.418 3.476 C 12.889 3.981 13.124 4.663 13.124 5.522 Z"/></svg>`,
    },
    // Pinterest is conditionally included — requires an image URL (media=) to
    // avoid the "Invalid Pin" error. Pass toolImageUrl (your og:image) to enable it.
    ...(imageUrl
      ? [
          {
            label: "Pinterest",
            href: `https://pinterest.com/pin/create/button/?url=${enc(url)}&media=${enc(imageUrl)}&description=${enc(shareMessage)}`,
            color: "#E60023",
            svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.429 2.973 7.429 6.945 0 4.15-2.617 7.49-6.257 7.49-1.22 0-2.366-.634-2.757-1.381 0 0-.603 2.296-.749 2.86-.271 1.043-.999 2.348-1.492 3.142 1.124.348 2.321.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.366 18.602 0 12.017 0z"/></svg>`,
          },
        ]
      : []),
  ]);

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(clipboardPayload);
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
        open = false;
      }, 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: title, text: shareMessage, url: url });
      open = false;
    } catch {
      // User cancelled — do nothing
    }
  }

  function handleOutsideClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (open && target.classList.contains("share-modal-backdrop")) {
      open = false;
    }
  }

  function handleShareClick() {
    setTimeout(() => { open = false; }, 300);
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="share-modal-backdrop glass-backdrop"
    role="dialog"
    aria-modal="true"
    aria-label="Share options"
    tabindex="-1"
    onclick={handleOutsideClick}
  >
    <div class="share-modal glass-panel">
      <!-- Header -->
      <div class="share-modal-header">
        <h3 class="share-title">Share</h3>
        <button class="share-close-btn" onclick={() => (open = false)} aria-label="Close">
          <X class="size-4" />
        </button>
      </div>

      <!--
        Copy link row.
        Copies: "✨ Just found this — {toolTitle} is genuinely useful. Give it a try!\n{toolUrl}"
        so anyone who pastes it gets context + link, not a cold URL.
      -->
      <button class="share-copy-btn" onclick={copyLink} aria-label="Copy link with message">
        {#if copySuccess}
          <span class="share-copy-icon share-copy-icon--success">
            <Check class="size-4" />
          </span>
          <span class="share-copy-text share-copy-text--success">Copied! Go share it ✨</span>
        {:else}
          <span class="share-copy-icon">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </span>
          <span class="share-copy-text">{url}</span>
          <span class="share-copy-action">Copy</span>
        {/if}
      </button>

      <!-- Social grid -->
      <div class="share-grid">
        {#each shareLinks as { label, href, color, svg } (label)}
          <a
            class="share-item"
            {href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${label}`}
            title={label}
            style={`--brand: ${color}`}
            onclick={handleShareClick}
          >
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            <span class="share-brand-icon">{@html svg}</span>
            <span class="share-item-label">{label}</span>
          </a>
        {/each}

        <!-- Native share (OS sheet on mobile) or SMS fallback on desktop -->
        {#if canNativeShare}
          <button
            class="share-item share-item--native"
            onclick={nativeShare}
            aria-label="Share via device"
            title="More options"
            style="--brand: var(--foreground)"
          >
            <span class="share-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </span>
            <span class="share-item-label">More</span>
          </button>
        {:else}
          <a
            class="share-item"
            href={`sms:?body=${enc(shareMessage + "\n" + url)}`}
            aria-label="Share via SMS"
            title="Text / SMS"
            style="--brand: #34C759"
            onclick={handleShareClick}
          >
            <span class="share-brand-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </span>
            <span class="share-item-label">Text / SMS</span>
          </a>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .share-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: fade-in 0.2s ease-out;
  }

  .share-modal {
    width: 100%;
    max-width: 24rem;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes modal-in {
    from { opacity: 0; transform: translateY(16px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .share-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .share-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--card-foreground);
    margin: 0;
    letter-spacing: -0.01em;
  }

  .share-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: none;
    background: var(--muted);
    color: var(--muted-foreground);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
  }

  .share-close-btn:hover {
    background: color-mix(in oklch, var(--destructive) 10%, transparent);
    color: var(--destructive);
  }

  /* Copy link row */
  .share-copy-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.625rem;
    border-radius: 0.75rem;
    background: color-mix(in oklch, var(--muted) 50%, transparent);
    border: 1px solid color-mix(in oklch, var(--border) 60%, transparent);
    cursor: pointer;
    text-align: left;
    transition: background 0.12s ease;
    overflow: hidden;
  }

  .share-copy-btn:hover { background: var(--muted); }

  .share-copy-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    background: var(--background);
    border: 1px solid var(--border);
    color: var(--foreground);
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .share-copy-icon--success {
    background: color-mix(in oklch, var(--success) 12%, transparent);
    border-color: color-mix(in oklch, var(--success) 30%, transparent);
    color: var(--success);
  }

  .share-copy-text {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--muted-foreground);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    text-align: left;
  }

  .share-copy-text--success { color: var(--success); }

  .share-copy-action {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    flex-shrink: 0;
    margin-left: auto;
  }

  /* Social grid */
  .share-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 0.5rem;
  }

  .share-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem;
    border-radius: 0.75rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--foreground);
    text-decoration: none;
    border: 1px solid transparent;
    background: color-mix(in oklch, var(--muted) 20%, transparent);
    cursor: pointer;
    width: 100%;
    transition: background 0.15s ease, transform 0.15s ease;
  }

  .share-item:hover {
    background: color-mix(in oklch, var(--brand) 8%, transparent);
    transform: translateY(-1px);
  }

  :global(.dark) .share-item:hover {
    background: color-mix(in oklch, var(--brand) 15%, transparent);
  }

  .share-brand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    background: color-mix(in oklch, var(--brand) 12%, transparent);
    color: var(--brand);
    flex-shrink: 0;
  }

  .share-brand-icon :global(svg) {
    width: 1rem;
    height: 1rem;
  }

  .share-item--native .share-brand-icon {
    background: var(--muted);
    color: var(--muted-foreground);
  }

  .share-item-label { white-space: nowrap; }
</style>