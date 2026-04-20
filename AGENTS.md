# Project Rules & Instructions

- **Free Tier Only**: All features, APIs, and services integrated into this application MUST be free to use. Do not implement any features that require paid subscriptions or have no free tier.
- **Gemini Models**: Use free Gemini models (e.g., Gemini 1.5 Flash) for all AI features.
- **Firebase**: Stick to the Firebase Spark (Free) plan limits.
- **No Paid Third-Party APIs**: Avoid any services that require a credit card or paid subscription to function.

## Advanced Agentic Patterns (Inspired by davila7/templates & wshobson/agents)

- **Conductor Orchestration**: Use a "Conductor" pattern for complex AI tasks. Break down listing generation into:
    - `SEO Analyst Agent`: Focusing on keyword density and search intent.
    - `Creative Writer Agent`: Focusing on persuasion and brand voice.
    - `Competitor Specialist Agent`: Performing deep-dive research into top marketplace rivals, USPs, and consumer pain points.
    - `Policy Compliance Agent`: Ensuring marketplace rules (Amazon/Meesho/Flipkart) are met.
- **Progressive Disclosure UI**: Components should follow the "Progressive Disclosure" pattern—showing initial output quickly and revealing deeper analytics (SEO scores, keyword lists) as they are calculated.
- **Component Blueprinting**: Build UI components as self-contained "blueprints" that can be easily monitored and health-checked, similar to the `claude-code-templates` structure.
