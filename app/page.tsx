import Loader from "@/components/Loader";
import Background from "@/components/Background";
import ThemeDock from "@/components/ThemeDock";
import TopBar from "@/components/TopBar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Showreel from "@/components/Showreel";
import Services from "@/components/Services";
import Divider from "@/components/Divider";
import CaseStudies from "@/components/CaseStudies";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import MotionProvider from "@/components/MotionProvider";
import { dividers } from "@/data/content";

export default function Home() {
  return (
    <>
      <Loader />
      <Background />
      <ThemeDock />
      <TopBar />
      <main>
        <Hero />
        <About />
        <Showreel />
        <Services />
        <Divider id="dWork" word="Work" tagline={dividers.work} />
        <CaseStudies />
        <Divider id="dProc" word="Process" tagline={dividers.process} />
        <Process />
        <Contact />
      </main>
      <MotionProvider />
    </>
  );
}
