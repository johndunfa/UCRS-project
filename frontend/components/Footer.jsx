// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 text-center">
      <p>© 2026 University Car Reservation System. All rights reserved.</p>
      <div className="flex justify-center space-x-4 mt-4">
        <a href="#" className="hover:text-blue-500">Privacy Policy</a>
        <a href="#" className="hover:text-blue-500">Contact</a>
      </div>
    </footer>
  );
}