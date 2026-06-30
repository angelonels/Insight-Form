import { Composition, Still } from "remotion";

import { ProductTour, ProductTourPoster } from "./product-tour";

export function RemotionRoot() {
  return (
    <>
      <Composition
        component={ProductTour}
        durationInFrames={720}
        fps={30}
        height={1080}
        id="ProductTour"
        width={1920}
      />
      <Still component={ProductTourPoster} height={1080} id="ProductTourPoster" width={1920} />
    </>
  );
}
