import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import DotField from "@/components/DotField";
import ChatbotWidget from "@/components/ChatbotWidget";
import RadioWidget from "@/components/RadioWidget";

export default function Home() {
  return (
    <main>
      <DotField />
      <div className="relative z-10">
        <Nav />
        <Hero />
        <Marquee />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </div>
      <ChatbotWidget />
      <RadioWidget />
    </main>
  );
}
