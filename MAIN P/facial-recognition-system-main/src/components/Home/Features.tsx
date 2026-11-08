const FeaturesSection = () => {
  return (
    <section id="features" className="py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-center mb-12 text-3xl font-bold text-[#351c56] relative after:content-[''] after:block after:w-20 after:h-1 after:bg-[#f3cf00] after:mx-auto after:mt-4">
          Features
        </h2>

        <div className="flex flex-wrap justify-center gap-8 mb-16">
          <div className="flex-1 min-w-[300px] max-w-[350px] bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="bg-[#6b45a0] text-white text-3xl p-6 text-center">
              👤
            </div>
            <div className="p-6">
              <h3 className="text-xl font-medium mb-4 text-[#351c56]">
                Advanced Facial Recognition
              </h3>
              <p>
                Our system uses cutting edge facial recognition algorithms to
                accurately identify students for hall sign out procedures.
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-[300px] max-w-[350px] bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="bg-[#6b45a0] text-white text-3xl p-6 text-center">
              🔒
            </div>
            <div className="p-6">
              <h3 className="text-xl font-medium mb-4 text-[#351c56]">
                Enhanced Security
              </h3>
              <p>
                Improve campus security by ensuring only authorized students
                with approved exeats can sign out from halls of residence.
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-[300px] max-w-[350px] bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="bg-[#6b45a0] text-white text-3xl p-6 text-center">
              ⚡
            </div>
            <div className="p-6">
              <h3 className="text-xl font-medium mb-4 text-[#351c56]">
                Efficient Processing
              </h3>
              <p>
                Reduce wait times and streamline the exeat approval and sign out
                process for both students and hall administrators.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-center mb-12 text-3xl font-bold text-[#351c56] relative after:content-[''] after:block after:w-20 after:h-1 after:bg-[#f3cf00] after:mx-auto after:mt-4">
          How It Works
        </h2>

        <div className="flex flex-wrap justify-between mb-12">
          <div className="text-center p-4 flex-1 min-w-[250px] mb-8 relative">
            <div className="w-10 h-10 bg-[#4a2777] text-white rounded-full mx-auto mb-4 flex items-center justify-center font-bold relative z-10">
              1
            </div>
            <h3 className="text-xl font-medium mb-2 text-[#351c56]">Exeat</h3>
            <p>Apply for Exeat through student's portal</p>
          </div>

          <div className="text-center p-4 flex-1 min-w-[250px] mb-8 relative">
            <div className="w-10 h-10 bg-[#4a2777] text-white rounded-full mx-auto mb-4 flex items-center justify-center font-bold relative z-10">
              2
            </div>
            <h3 className="text-xl font-medium mb-2 text-[#351c56]">
              Complete Profile
            </h3>
            <p>
              Fill in your student details including matric number and hall
              information
            </p>
          </div>

          <div className="text-center p-4 flex-1 min-w-[250px] mb-8 relative">
            <div className="w-10 h-10 bg-[#4a2777] text-white rounded-full mx-auto mb-4 flex items-center justify-center font-bold relative z-10">
              3
            </div>
            <h3 className="text-xl font-medium mb-2 text-[#351c56]">
              Facial Capture
            </h3>
            <p>
              Register your face using our secure facial recognition technology
            </p>
          </div>

          <div className="text-center p-4 flex-1 min-w-[250px] mb-8 relative">
            <div className="w-10 h-10 bg-[#4a2777] text-white rounded-full mx-auto mb-4 flex items-center justify-center font-bold relative z-10">
              4
            </div>
            <h3 className="text-xl font-medium mb-2 text-[#351c56]">
              Sign Out Process
            </h3>
            <p>
              Use the system for seamless hall sign outs after exeat approval
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
