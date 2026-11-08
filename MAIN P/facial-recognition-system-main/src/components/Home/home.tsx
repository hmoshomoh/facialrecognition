import Layout from "../Layout/Layout";
import HeroSection from "./Hero";
import FeaturesSection from "./Features";
import RegistrationForm from "../Registration/RegistrationForm";
import AboutSection from "./About";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <section id="registration" className="py-16">
        <div className="container mx-auto px-4">
          {/* <h2 className="text-center mb-12 text-3xl font-bold text-primary-dark relative">
            Student Registration
          </h2> */}
          <RegistrationForm />
        </div>
      </section>
      <section className="px-25">
        <Link to={"/exeat"}>
          <button className="text-white px-6 py-2 rounded text-lg font-bold shadow bg-[#6b45a0]">
            Proceed to Sign In/Out
          </button>
        </Link>
      </section>
    </Layout>
  );
}
