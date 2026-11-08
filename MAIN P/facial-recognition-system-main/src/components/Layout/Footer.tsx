const Footer = () => {
  return (
    <footer className="bg-[#351c56] text-white py-8 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between mb-8">
          <div className="flex-1 min-w-[300px] p-4 mb-6">
            <h3 className="text-[#f3cf00] mb-4 text-xl font-medium">
              Covenant University FRS
            </h3>
            <p>
              Enhancing campus security and student experience through
              innovative technology solutions.
            </p>
          </div>

          <div className="flex-1 min-w-[300px] p-4 mb-6">
            <h3 className="text-[#f3cf00] mb-4 text-xl font-medium">
              Quick Links
            </h3>
            <ul>
              <li className="mb-2">
                <a
                  href="#home"
                  className="hover:text-[#f3cf00] transition-colors"
                >
                  Home
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#features"
                  className="hover:text-[#f3cf00] transition-colors"
                >
                  Features
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#about"
                  className="hover:text-[#f3cf00] transition-colors"
                >
                  About
                </a>
              </li>
            </ul>
          </div>

          <div className="flex-1 min-w-[300px] p-4 mb-6">
            <h3 className="text-[#f3cf00] mb-4 text-xl font-medium">Contact</h3>
            <p>Covenant University</p>
            <p>Km 10 Idiroko Road, Canaan Land</p>
            <p>Ota, Ogun State, Nigeria</p>
            <p>
                Telegram: 09090815641</p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 text-center">
          <p>&copy; 2025 Eshiett-Ambunga Faith. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
