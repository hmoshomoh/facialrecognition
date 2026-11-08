const AboutSection = () => {
  return (
    <section id="about" className="py-2">
      <div className="container mx-auto px-4">
        <h2 className="text-center mb-12 text-3xl font-bold text-[#351c56] relative after:content-[''] after:block after:w-20 after:h-1 after:bg-[#f3cf00] after:mx-auto after:mt-4">
          About The System
        </h2>

        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          <div className="p-6">
            <p className="mb-4">
              The Covenant University Facial Recognition System is designed to
              modernize and enhance the hall sign out process for students. When
              students need to leave campus, they must first obtain an approved
              exeat from their hall administrator.
            </p>

            <p className="mb-4">
              Once approved, students can use the facial recognition system to
              sign out, which verifies their identity and records their
              departure time. This system eliminates the need for manual
              verification and paper-based record keeping.
            </p>

            <p className="mb-4">Key benefits include:</p>
            <ul className="list-disc ml-6 mb-4">
              <li>Enhanced security through accurate facial verification</li>
              <li>Streamlined sign out process reducing wait times</li>
              <li>
                Digital records of student departures for improved
                accountability
              </li>
              <li>Integration with existing university systems</li>
              <li>Reduced administrative workload for hall officers</li>
            </ul>

            <p>
              The system respects student privacy with secure data handling
              practices and strictly limits access to authorized personnel.
              Facial data is encrypted and stored securely in accordance with
              data protection regulations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
