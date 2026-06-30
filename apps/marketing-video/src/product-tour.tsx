import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const scenes = [
  {
    file: "captures/dashboard.jpg",
    from: 0,
    duration: 90,
    eyebrow: "InsightForm",
    title: "From questions to evidence.",
    focalX: 52,
    focalY: 42,
  },
  {
    file: "captures/ai-create.jpg",
    from: 90,
    duration: 120,
    eyebrow: "Create",
    title: "Describe what you need.",
    focalX: 45,
    focalY: 48,
  },
  {
    file: "captures/editor.jpg",
    from: 210,
    duration: 150,
    eyebrow: "Review",
    title: "Shape every question before it goes live.",
    focalX: 55,
    focalY: 42,
  },
  {
    file: "captures/responses.jpg",
    from: 360,
    duration: 120,
    eyebrow: "Collect",
    title: "Keep every response close.",
    focalX: 55,
    focalY: 44,
  },
  {
    file: "captures/insights.jpg",
    from: 480,
    duration: 150,
    eyebrow: "Understand",
    title: "Find the pattern. Inspect the evidence.",
    focalX: 58,
    focalY: 46,
  },
  {
    file: "captures/report.jpg",
    from: 630,
    duration: 90,
    eyebrow: "Share",
    title: "Turn the signal into a clear readout.",
    focalX: 54,
    focalY: 42,
  },
] as const;

export function ProductTour() {
  return (
    <AbsoluteFill style={{ backgroundColor: "#f7f5f0" }}>
      {scenes.map((scene) => (
        <Sequence
          durationInFrames={scene.duration}
          from={scene.from}
          key={scene.file}
          premountFor={30}
        >
          <TourScene {...scene} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

export function ProductTourPoster() {
  return (
    <AbsoluteFill style={{ backgroundColor: "#f7f5f0" }}>
      <TourScene {...scenes[0]} staticFrame />
    </AbsoluteFill>
  );
}

function TourScene({
  duration,
  eyebrow,
  file,
  focalX,
  focalY,
  staticFrame = false,
  title,
}: (typeof scenes)[number] & { staticFrame?: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = staticFrame
    ? 1
    : interpolate(frame, [0, 0.45 * fps], [0, 1], {
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const exit = staticFrame
    ? 0
    : interpolate(frame, [duration - 0.35 * fps, duration], [0, 1], {
        easing: Easing.in(Easing.cubic),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const progress = staticFrame
    ? 0.28
    : interpolate(frame, [0, duration], [0, 1], {
        easing: Easing.bezier(0.45, 0, 0.55, 1),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const scale = 1.035 + progress * 0.085;
  const captionY = interpolate(enter - exit, [0, 1], [26, 0]);
  const captionOpacity = Math.max(0, enter - exit);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#f7f5f0" }}>
      <Img
        src={staticFile(file)}
        style={{
          height: "100%",
          objectFit: "cover",
          objectPosition: `${focalX}% ${focalY}%`,
          opacity: 0.98,
          transform: `scale(${scale})`,
          width: "100%",
        }}
      />
      <div
        style={{
          alignItems: "flex-start",
          backgroundColor: "rgba(14, 25, 43, 0.92)",
          bottom: 58,
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          left: 64,
          maxWidth: 760,
          opacity: captionOpacity,
          padding: "22px 28px 24px",
          position: "absolute",
          transform: `translateY(${captionY}px)`,
        }}
      >
        <div
          style={{
            color: "#acd2c4",
            fontFamily: "Arial, sans-serif",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.14em",
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 48,
            fontWeight: 400,
            letterSpacing: "-0.025em",
            lineHeight: 1.08,
            marginTop: 12,
          }}
        >
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
}
