


import Footer from "../components/footer";
import LenisScroll from "../components/lenis-scroll";
import Navbar from "../components/navbar";
import AboutOurApps from "../sections/about-our-apps";
import HeroSection from "../sections/hero-section";
import CareerBotCTA from "../sections/career-bot-cta";


export default function LandingPage() {
    return (
        <>
            <LenisScroll />
            <Navbar />
            <main className="px-6 md:px-16 lg:px-24 xl:px-32">
                <HeroSection />

                <CareerBotCTA />

                <AboutOurApps />


            </main>
            <Footer />
        </>
    );
}
