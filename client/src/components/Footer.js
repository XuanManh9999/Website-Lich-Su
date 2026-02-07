import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      className="text-white mt-auto"
      style={{
        background:
          'linear-gradient(135deg, #8F1A1E 0%, #B83236 45%, #5C0F12 100%)',
      }}
    >
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Column 1: Brand Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
                VSQ
              </div>
              <h3 className="text-xl md:text-2xl font-bold">Việt Sử Quân</h3>
            </div>
            <p className="text-sm md:text-base text-white/90 leading-relaxed">
              Nơi lưu giữ và chia sẻ những câu chuyện lịch sử hào hùng của các anh hùng dân tộc Việt Nam.
            </p>
            {/* Social Media Icons */}
            <div className="flex gap-4 pt-2">
              <a
                href="https://www.facebook.com/profile.php?id=61586760205982&mibextid=wwXIfr&rdid=Gox8GlPQFevpwAiu&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F16txDWuL5P%2F%3Fmibextid%3DwwXIfr#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Facebook"
                title="Facebook Việt Sử Quân"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@vietsuquan.giaoduc?_r=1&_d=secCgYIASAHKAESPgo8nm8czoo9gifex0AH%2F8IJQXPK4VxvOlp5jqKd2YUoe9gDwgHlk5wWNYD5hrE99J%2F6PYJ5XD4pBFVvcsAFGgA%3D&_svg=1&checksum=bdc8b502c92251186dd162471dd866576fe681cdf32fcb34d2b3eb6ef59a861c&item_author_type=2&sec_uid=MS4wLjABAAAABlcHu_NJil0K9iBNIIVkhWs_gaJE3kMp1P0SSFMfqJCoNxdGHRaYgC-nsPrv5Lhl&sec_user_id=MS4wLjABAAAAq2qAFNCyrQBNuLL3A8RlbSlGz-6nF1cGS4v4dVE66OUgp0HYHSyy6lPTOBjDYfgd&share_app_id=1180&share_author_id=6689259694710359042&share_link_id=17BD39C5-C8EA-416E-81AC-9176D3430551&share_region=VN&share_scene=1&sharer_language=vi&social_share_type=5&source=h5_t&timestamp=1770029960&tt_from=copy&u_code=db5a3jlaga32kd&ug_btm=b5836%2Cb5836&user_id=6798718852282221570&utm_campaign=client_share&utm_medium=ios&utm_source=copy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="TikTok"
                title="TikTok Việt Sử Quân"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg md:text-xl font-bold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm md:text-base">
              <li>
                <Link to="/" className="text-white/90 hover:text-white transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/san-pham" className="text-white/90 hover:text-white transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/90 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="text-white/90 hover:text-white transition-colors">
                  Quizlet card
                </Link>
              </li>
              <li>
                <a href="#contact" className="text-white/90 hover:text-white transition-colors">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Products */}
          <div className="space-y-4">
            <h4 className="text-lg md:text-xl font-bold mb-4">Sản phẩm</h4>
            <ul className="space-y-2 text-sm md:text-base">
              <li>
                <Link to="/san-pham" className="text-white/90 hover:text-white transition-colors">
                  Board Game Lịch Sử
                </Link>
              </li>
              <li>
                <Link to="/san-pham" className="text-white/90 hover:text-white transition-colors">
                  Mô hình Lịch Sử
                </Link>
              </li>
              <li>
                <Link to="/san-pham" className="text-white/90 hover:text-white transition-colors">
                  Quà Tặng Lịch Sử
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="text-white/90 hover:text-white transition-colors">
                  Quizlet card
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4">
            <h4 className="text-lg md:text-xl font-bold mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm md:text-base">
              <li className="flex items-start gap-3 text-white/90">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Khu CNC Hòa Lạc, Thạch Thất, Hà Nội</span>
              </li>
              <li className="flex items-center gap-3 text-white/90">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a href="tel:0335969377" className="hover:text-white transition-colors">
                  0335969377
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/90">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a href="mailto:vietsuquan@gmail.com" className="hover:text-white transition-colors">
                  vietsuquan@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <p className="text-center text-sm md:text-base text-white/80">
            © 2026 Việt Sử Quân. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
