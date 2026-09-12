# AEGISAUTH Interaction & Motion Upgrade

## Goal
Preserve the current AEGISAUTH visual identity, layouts, typography, spacing, cards, and color tokens while adding meaningful biometric, intelligence-flow, threat-response, and dashboard interactions.

## Implementation

### 1. Hero biometric verification
- Keep the existing face image and placement, adding a lightweight interactive layer around it.
- Add restrained pointer parallax, slight hover scale, responsive particles, a vertical scan line, and progressively illuminated facial landmarks.
- Drive the existing security indicators through the requested detection-to-verification sequence and show a compact `TRUST VERIFIED` completion state.
- Smoothly reset on pointer leave; use transform-only motion and disable continuous movement under reduced motion.

### 2. AEGIS Hive intelligence system
- Extend the existing hexagonal Hive rather than replacing it.
- Separate hover, keyboard focus, pinned selection, and transient live-signal states.
- Highlight the active connection, dim unrelated nodes, add restrained node activity, and animate the core’s inner hexagonal layer.
- Make hover/focus update the existing selected-node card; clicking or keyboard activation pins a node until another is selected.
- Add a non-mechanical, variably timed authentication signal moving through the existing nodes and core, ending in a brief consensus/trust state.
- Give each engine its own status, latency, confidence, and detail values in the shared static data model.

### 3. Threat globe and incident synchronization
- Preserve the current globe image and panel while layering subtle drift, grid/connection detail, and semantic event points.
- Extend the existing incident data with stable IDs, risk scores, coordinates, and event category colors.
- Add accessible point tooltips with location, event, score, and status.
- Synchronize selection both ways: incident row to globe point and globe point to incident row, with a restrained focus shift and selected styling.
- Keep the table usable on small screens with its existing responsive behavior.

### 4. Scroll-driven architecture flow
- Keep all seven existing architecture cards unchanged in structure.
- Replace the looping rail with scroll-progress-driven stage activation from Capture through Protected App.
- Add a travelling gold signal, active/lifted stage styling, calmer completed states, and subtle stage status text.
- Preserve horizontal scrolling on narrow screens and automatically bring the current stage into view where appropriate.

### 5. Functional live demo
- Retain the current demo layout and run the full requested sequence through `Access Granted`.
- Make Replay reset and restart deterministically.
- Animate the risk value during evaluation and finish at the existing low-risk score with a subtle verified state.
- Ensure timers clean up correctly and reduced-motion users receive the same state changes without continuous effects.

### 6. Command Center supporting interactions
- Keep dashboard cards and charts in place; add restrained card response, preserve chart tooltips, and refine live-status feedback.
- Make timeline rows accessible expandable controls revealing user, risk, engine, timestamp, decision, and application from enriched static data.
- Make protected-app cards accessible selectable controls with an inline expansion for method, threshold, fallback, device binding, and protection level.
- Convert existing settings switches into working accessible toggles while preserving the already functional theme selector and its previews.

### 7. Accessibility, performance, and verification
- Add keyboard focus and activation for Hive nodes, threat points, timeline events, app cards, and settings controls.
- Respect `prefers-reduced-motion`, avoid new dependencies, clean up timers/listeners, and limit pointer work to animation-frame updates and transforms.
- Preserve all existing routes and route structure; add missing route-specific metadata where required.
- Verify desktop and mobile layouts, all Command Center routes, hover/click/keyboard flows, theme switching, reduced-motion behavior, console output, type safety, and the production build.

## Technical approach
- Reuse `motion/react`, SVG overlays, CSS transforms, and the existing canvas particle system.
- Add small focused interaction components only where state isolation improves maintainability, especially for the hero face and threat map.
- Keep all telemetry simulated and sourced from the existing local data module so real API data can replace it later without changing the UI contract.
- Do not alter authentication, add backend services, or introduce external animation/3D libraries.
