import { AgentContextPanel } from "./components/AgentContextPanel";
import { FeedbackDetail } from "./components/FeedbackDetail";
import { FeedbackInsights } from "./components/FeedbackInsights";
import { FeedbackQueue } from "./components/FeedbackQueue";
import { FeedbackWidget } from "./components/FeedbackWidget";
import { ScreenshotAnnotator } from "./components/ScreenshotAnnotator";
import { agentContext, feedbackRows, insights, seedFeedback } from "./data/seedFeedback";

export function App() {
  return (
    <main className="app-shell">
      <header className="hero">
        <p>Feedy UI reference</p>
        <h1>Copyable surfaces for agent-ready feedback.</h1>
        <span>Seeded data, shared contracts, no backend required.</span>
      </header>
      <FeedbackWidget />
      <ScreenshotAnnotator />
      <FeedbackQueue rows={feedbackRows} />
      <FeedbackDetail feedback={seedFeedback} />
      <FeedbackInsights insights={insights} />
      <AgentContextPanel context={agentContext} />
    </main>
  );
}
