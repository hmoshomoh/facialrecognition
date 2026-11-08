const HeroSection = () => {
  return (
    <section
      id="home"
      className="bg-gradient-to-r from-[#4a2777] to-[#4a2777] text-white py-16 text-center relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(74, 39, 119, 0.8), rgba(74, 39, 119, 0.9)), url(https://cuportal.covenantuniversity.edu.ng/assets/img/CU4.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 shadow-text">
          Covenant University Exeat Facial Recognition System
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
          Enhancing security and streamlining hall sign out processes for
          students with advanced facial recognition technology
        </p>
        <a
          href="#features"
          className="inline-block bg-[#f3cf00] text-[#351c56] px-6 py-3 rounded-md font-bold hover:bg-[#e0bc00] transform hover:-translate-y-1 transition-all shadow-md"
        >
          Learn More
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
