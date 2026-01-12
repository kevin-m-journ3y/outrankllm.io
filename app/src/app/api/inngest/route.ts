import { serve } from "inngest/next"
import { inngest } from "@/inngest/client"
import { processScan } from "@/inngest/functions/process-scan"
import { hourlyScanDispatcher } from "@/inngest/functions/hourly-scan-dispatcher"
import { enrichSubscriber } from "@/inngest/functions/enrich-subscriber"

// Allow up to 300 seconds for Inngest to execute function steps
// Required for long-running steps like AI queries
export const maxDuration = 300

// Inngest webhook handler
// This route handles all Inngest events and cron triggers
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processScan, hourlyScanDispatcher, enrichSubscriber],
})
