<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Send, Loader2, CheckCircle2 } from '@lucide/svelte';
  import { siteConfig } from 'virtual:site-config';

  const WEB3FORMS_ACCESS_KEY = siteConfig.apiKeys.web3Forms;

  let name = $state("");
  let email = $state("");
  let message = $state("");
  let honeypot = $state(""); // spam trap — must stay empty

  let isSubmitting = $state(false);
  let isSuccess = $state(false);
  let errorMsg = $state("");

  async function handleSubmit(e: Event) {
      e.preventDefault();

      // Honeypot check — bots fill this, humans don't
      if (honeypot) return;

      if (WEB3FORMS_ACCESS_KEY === "YOUR_ACCESS_KEY_HERE") {
          errorMsg = "Invalid configuration. Please check your Access Key.";
          return;
      }
      
      isSubmitting = true;
      errorMsg = "";

      try {
          const pageUrl = typeof window !== "undefined" ? window.location.href : "";
          const response = await fetch(siteConfig.apiKeys.web3FormsEndpoint, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
              },
              body: JSON.stringify({
                  access_key: WEB3FORMS_ACCESS_KEY,
                  subject: `New Contact Request from ${name}`,
                  name: name,
                  email: email,
                  message: message,
                  "Form Page URL": pageUrl,
              }),
          });
          const result = await response.json();
          if (result.success) {
              isSuccess = true;
          } else {
              errorMsg = result.message || "Something went wrong sending your message.";
          }
      } catch (err) {
          errorMsg = "Failed to send request. Please check your connection and try again.";
      } finally {
          isSubmitting = false;
      }
  }
</script>

<div class="bg-card border rounded-xl p-8 shadow-sm">
    {#if isSuccess}
        <div class="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <CheckCircle2 class="size-16 text-success mb-2" />
            <h3 class="text-2xl font-bold tracking-tight">Message Sent!</h3>
            <p class="text-muted-foreground">Thank you for getting in touch. We will respond to your email shortly.</p>
        </div>
    {:else}
        <form class="space-y-6" onsubmit={handleSubmit}>
            <!-- Honeypot: hidden from real users, catches bots -->
            <div aria-hidden="true" class="sr-only">
                <label for="_hp_website">Leave this empty</label>
                <input id="_hp_website" name="_hp_website" type="text" bind:value={honeypot} tabindex="-1" autocomplete="off" />
            </div>
            {#if errorMsg}
                <div class="text-sm text-destructive bg-destructive/10 p-4 rounded-md font-medium border border-destructive/20">{errorMsg}</div>
            {/if}
            <div class="space-y-2">
                <Label for="name" class="">Name</Label>
                <Input id="name" name="name" placeholder="John Doe" bind:value={name} required={true} />
            </div>
            <div class="space-y-2">
                <Label for="email" class="">Email</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" bind:value={email} required={true} />
            </div>
            <div class="space-y-2">
                <Label for="message" class="">Message</Label>
                <Textarea id="message" name="message" placeholder="How can we help you?" class="min-h-[150px] resize-y" bind:value={message} required={true} />
            </div>
            <Button type="submit" class="w-full gap-2" disabled={isSubmitting}>
                {#if isSubmitting}
                    <Loader2 class="size-4 animate-spin" /> Sending...
                {:else}
                    <Send class="size-4" /> Send Message
                {/if}
            </Button>
        </form>
    {/if}
</div>
