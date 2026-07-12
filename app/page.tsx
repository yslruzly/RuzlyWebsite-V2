import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import CommunityChat from "@/components/sections/CommunityChat";
import DotField from "@/components/ui/DotField";
import ChatbotWidget from "@/components/widgets/ChatbotWidget";
import RadioWidget from "@/components/widgets/RadioWidget";
import MobileNotice from "@/components/widgets/MobileNotice";

export default function Home() {
  return (
    <main>
      <DotField />
      <div className="relative z-10">
        <Nav />
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <CommunityChat />
        <Contact />
      </div>
      <ChatbotWidget />
      <RadioWidget />
      <MobileNotice />
    </main>
  );
}
