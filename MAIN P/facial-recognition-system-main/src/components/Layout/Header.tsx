import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-[#4a2777] text-white py-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center">
          <a href="#" className="flex items-center text-xl font-bold">
            <img
              src="https://internetlogin.cu.edu.ng/XX/YY/ZZ/CI/DEPGGHFGOGBGOGEHPFMEPGHGPG"
              alt="Covenant University Logo"
              className="h-10 mr-2"
            />
            Covenant University FRS
          </a>

          <button className="md:hidden text-2xl" onClick={toggleMobileMenu}>
            ☰
          </button>

          <ul
            className={`
              md:flex md:static absolute top-[70px] left-0 right-0 
              bg-[#4a2777] md:bg-transparent flex-col md:flex-row 
              items-center md:items-stretch transition-all duration-500 ease-in-out
              ${mobileMenuOpen ? "flex" : "hidden"}
            `}
          >
            <li className="md:ml-6 my-4 md:my-0">
              <a
                href="#home"
                className="hover:text-[#f3cf00] transition-colors"
              >
                Home
              </a>
            </li>
            <li className="md:ml-6 my-4 md:my-0">
              <a
                href="#features"
                className="hover:text-[#f3cf00] transition-colors"
              >
                Features
              </a>
            </li>
            <li className="md:ml-6 my-4 md:my-0">
              <a
                href="#about"
                className="hover:text-[#f3cf00] transition-colors"
              >
                About
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
