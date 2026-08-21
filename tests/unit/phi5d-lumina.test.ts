import { describe, expect, it } from "vitest";
import {
  createLuminaSnapshot,
  generateEpisodes,
  generateShortStoryboard,
  runtimeGuard,
  translateSymbol,
  translationMatrix,
} from "../../integrations/phi5d-lumina/src/index";

describe("Phi-5D Lumina software surface", () => {
  it("builds a complete translation matrix", () => {
    expect(translationMatrix()).toHaveLength(7);
    expect(translateSymbol("✦")?.codeToken).toBe("JOY");
  });

  it("creates a derived compass and simulated shard state", () => {
    const snapshot = createLuminaSnapshot("joy", "smoke-seed");
    expect(snapshot.provenance).toBe("DERIVED");
    expect(snapshot.compass.provenance).toBe("DERIVED");
    expect(snapshot.shard.transport).toBe("BLUETOOTH_SIMULATED");
    expect(snapshot.shard.hardwareControl).toBe("DISABLED");
    expect(runtimeGuard(snapshot)).toEqual({ safe: true, reasons: [] });
  });

  it("plans exactly two years of weekly half-hour narrative simulations", () => {
    const episodes = generateEpisodes(2, 52);
    expect(episodes).toHaveLength(104);
    expect(episodes.every(episode => episode.runtimeMinutes === 30)).toBe(true);
    expect(episodes[0].provenance).toBe("NARRATIVE_SIMULATION");
    expect(episodes[103].season).toBe(2);
    expect(episodes[103].episode).toBe(52);
    const storyboard = generateShortStoryboard(episodes[0]);
    expect(storyboard.durationSeconds).toBe(75);
    expect(storyboard.shots).toHaveLength(4);
    expect(storyboard.externalRender).toBe("DISABLED");
  });

  it("does not authorize hardware or external writes", () => {
    const snapshot = createLuminaSnapshot();
    expect(snapshot.externalWrites).toBe("DISABLED");
    expect(snapshot.firmwareFlashing).toBe("DISABLED");
  });
});
