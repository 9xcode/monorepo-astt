<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";

  import { Loader2, CheckCircle2 } from '@lucide/svelte';
  import { siteConfig } from "../../../config";

  let { open = $bindable(false) } = $props<{ open: boolean }>();

  let featureTitle = $state("");
  let featureDescription = $state("");
  let honeypot = $state(""); // spam trap — must stay empty

  const WEB3FORMS_ACCESS_KEY = siteConfig.apiKeys.web3Forms;

  let isSubmitting = $state(false);
  let isSuccess = $state(false);
  let errorMsg = $state("");



  async function handleSubmit(e: Event) {
      e.preventDefault();

      // Honeypot check — bots fill this, humans don't
      if (honeypot) return;

      if (WEB3FORMS_ACCESS_KEY === "YOUR_ACCESS_KEY_HERE") {
          errorMsg = "Invalid configuration.";
          return;
      }
      isSubmitting = true;
      errorMsg = "";

      try {
          const pageUrl = typeof window !== "undefined" ? window.location.href : "";
          const response = await fetch(siteConfig.apiKeys.web3FormsEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify({
                  access_key: WEB3FORMS_ACCESS_KEY,
                  subject: `New Feature Request: ${featureTitle}`,
                  Feature_Idea: featureTitle,
                  Details: featureDescription,
                  "Form Page URL": pageUrl,
              }),
          });
          const result = await response.json();
          if (result.success) {
              isSuccess = true;
              setTimeout(() => {
                  open = false;
                  isSuccess = false;
                  featureTitle = "";
                  featureDescription = "";
              }, 4000);
          } else {
              errorMsg = result.message || "Something went wrong.";
          }
      } catch (err) {
          errorMsg = "Failed to send request. Please try again.";
      } finally {
          isSubmitting = false;
      }
  }
</script>

<Dialog.Root open={open} onOpenChange={(v) => open = v}>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Request a New Tool/Feature</Dialog.Title>
      <Dialog.Description>
        Have an idea for a new tool or an improvement? Let us know! We build tools based on your feedback.
      </Dialog.Description>
    </Dialog.Header>
    
    {#if isSuccess}
      <div class="flex flex-col items-center justify-center py-8 text-center space-y-4">
        <CheckCircle2 class="size-16 text-success mb-2" />
        <div>
            <h3 class="text-xl font-bold">Request Sent!</h3>
            <p class="text-muted-foreground">Thank you for your feedback. We'll look into it.</p>
        </div>
      </div>
    {:else}
      <form onsubmit={handleSubmit} class="flex flex-col gap-5 py-4">
        <!-- Honeypot: hidden from real users, catches bots -->
        <div aria-hidden="true" class="sr-only">
          <label for="_hp_feature">Leave this empty</label>
          <input id="_hp_feature" name="_hp_feature" type="text" bind:value={honeypot} tabindex="-1" autocomplete="off" />
        </div>
        {#if errorMsg}
            <div class="text-sm text-destructive bg-destructive/10 p-4 rounded-md font-medium border border-destructive/20">{errorMsg}</div>
        {/if}
        <div class="space-y-2">
          <Label for="title" class="">What's your idea?</Label>
          <Input 
            id="title" 
            name="title"
            placeholder="e.g. Unit Converter..." 
            bind:value={featureTitle}
            required
            disabled={isSubmitting}
          />
        </div>
        <div class="space-y-2">
          <Label for="description" class="">Details</Label>
          <Textarea 
            id="description" 
            name="description"
            placeholder="Describe how the tool should work or what problem it solves..." 
            class="min-h-[120px] resize-y" 
            bind:value={featureDescription}
            required
            disabled={isSubmitting}
          />
        </div>
        <Dialog.Footer class="mt-2">
          <Button type="submit" class="w-full" disabled={isSubmitting}>
              {#if isSubmitting}
                  <Loader2 class="size-4 mr-2 animate-spin" /> Sending...
              {:else}
                  Submit Request
              {/if}
          </Button>
        </Dialog.Footer>
      </form>
    {/if}
  </Dialog.Content>
</Dialog.Root>
