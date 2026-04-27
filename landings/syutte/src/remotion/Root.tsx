import { Composition } from "remotion";
import { Logo3D } from "./Logo3D";
import { BarChart } from "./BarChart";
import { WeatherCard } from "./WeatherCard";
import { WebsiteScroll } from "./WebsiteScroll";
import { ShortVertical } from "./ShortVertical";
import { LoginSimulation } from "./LoginSimulation";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Logo3D"
        component={Logo3D}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="BarChart"
        component={BarChart}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="WeatherCard"
        component={WeatherCard}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="WebsiteScroll"
        component={WebsiteScroll}
        durationInFrames={290}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ShortVertical"
        component={ShortVertical}
        durationInFrames={420}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="LoginSimulation"
        component={LoginSimulation}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={900}
      />
    </>
  );
};
