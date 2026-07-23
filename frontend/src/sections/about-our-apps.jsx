import SectionTitle from "../components/section-title";
import { motion } from "framer-motion";

export default function AboutOurApps() {
    const sectionData = [
        {
            title: "Professional Aesthetics",
            description: "Clean, modern, and ATS-friendly designs that make your profile stand out immediately.",
            image: "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/flashEmoji.png",
            className: "py-10 border-b border-slate-700 md:py-0 md:border-r md:border-b-0 md:px-10"
        },
        {
            title: "Responsive & Interactive",
            description: "Seamlessly adapts to any device with smooth animations and interactive elements.",
            image: "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/colorsEmoji.png",
            className: "py-10 border-b border-slate-700 md:py-0 lg:border-r md:border-b-0 md:px-10"
        },
        {
            title: "AI-Optimized Content",
            description: "Intelligent layout and content structuring to highlight your key strengths effectively.",
            image: "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/puzzelEmoji.png",
            className: "py-10 border-b border-slate-700 md:py-0 md:border-r lg:border-r-0 md:border-b-0 md:px-10"
        },
        {
            title: "AI Career Coach",
            description: "Get personalized career guidance, skill recommendations, and interview prep based on your profile.",
            image: "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/rocketEmoji.png",
            className: "py-10 md:py-0 md:px-10"
        },
    ];
    return (
        <section className="flex flex-col items-center" id="about">
            <SectionTitle title="Why SmartFolio?" description="Create a stunning, professional portfolio in minutes with our AI-powered platform." />
            <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-8 md:px-0 mt-18">
                {sectionData.map((data, index) => (
                    <motion.div key={data.title} className={data.className}
                        initial={{ y: 150, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: `${index * 0.15}`, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <div className="size-10 p-2 bg-indigo-600/20 border border-indigo-600/30 rounded">
                            <img src={data.image} alt="" />
                        </div>
                        <div className="mt-5 space-y-2">
                            <h3 className="text-base font-medium text-slate-200">{data.title}</h3>
                            <p className="text-sm text-slate-400">{data.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}