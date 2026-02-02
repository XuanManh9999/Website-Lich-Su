import React, { useState } from 'react';

const faqs = [
  {
    id: 1,
    question: 'Khi nào Việt Sử Quân sẽ chính thức ra mắt?',
    answer:
      'Việt Sử Quân đang chuẩn bị bước ra ánh sáng sau hành trình ấp ủ dài ngày. Thời điểm ra mắt sẽ sớm được thông báo. Theo dõi fanpage để cùng chúng mình trải nghiệm những trận chơi đầu tiên, cơ hội đặt trước và các ưu đãi dành riêng cho cộng đồng yêu lịch sử.',
  },
  {
    id: 2,
    question: 'Board game Việt Sử Quân dành cho đối tượng nào?',
    answer:
      'Việt Sử Quân dành cho học sinh, sinh viên và những người yêu lịch sử Việt Nam, đặc biệt là các bạn trẻ muốn học lịch sử qua trải nghiệm, nhập vai và tương tác, thay vì chỉ ghi nhớ khô khan.',
  },
  {
    id: 3,
    question: 'Cốt truyện board game?',
    answer: [
      'Trong dòng chảy dài của lịch sử Việt Nam, mỗi thời đại đều ghi dấu bởi những con người bình thường nhưng mang trong mình tinh thần phi thường. Họ không chỉ là những nhân vật trong sách vở, mà là những người đã góp phần gìn giữ đất nước, văn hóa và giá trị dân tộc qua bao biến động.',
      'Việt Sử Quân không đặt người chơi vào vai người học lịch sử thụ động, mà dẫn dắt họ hóa thân thành những nhà sử học, trực tiếp bước vào hành trình khám phá lịch sử Việt Nam để từng bước tiến về Đích – biểu tượng cho sự trưởng thành, hiểu biết và tiếp nối lịch sử. Mỗi nhân vật trong trò chơi là một mảnh ghép của lịch sử, mang theo tri thức, bản lĩnh và tinh thần dân tộc của các thế hệ người Việt qua những thời kỳ khác nhau.',
      'Trên hành trình ấy, người chơi sẽ phải vượt qua nhiều thử thách được tái hiện dưới dạng các câu hỏi lịch sử, tình huống văn hóa và những bước ngoặt bất ngờ. Có lúc con đường thuận lợi, có lúc gặp “bẫy lịch sử” buộc người chơi phải vận dụng kiến thức, tư duy cá nhân và sự hiểu biết để tiếp tục tiến bước.',
      'Mỗi câu trả lời đúng không chỉ giúp nhân vật tiến lên, mà còn tượng trưng cho việc lịch sử được thấu hiểu đúng đắn. Ngược lại, những sai lầm cho thấy rằng lịch sử nếu bị hiểu sai hoặc bỏ quên sẽ khiến hành trình chậm lại.',
      'Trò chơi kết thúc khi một đội đưa toàn bộ nhân vật của mình về Đích, nhưng hành trình của Việt Sử Quân không dừng lại ở chiến thắng. Điều quan trọng hơn là người chơi nhận ra rằng lịch sử không chỉ để ghi nhớ, mà để hiểu – suy ngẫm – và vận dụng vào cuộc sống hôm nay, từ cách sống tử tế, có trách nhiệm đến việc trân trọng những giá trị đã được vun đắp qua nhiều thế hệ.',
    ],
  },
  {
    id: 4,
    question: 'Hướng dẫn cách chơi board game?',
    answer: [
      'LUẬT CHƠI BOARD GAME',
      'VIỆT SỬ QUÂN – HÀNH TRÌNH LỊCH SỬ ',
      'I. Thông tin tổng quan',
      'Tên game: Việt Sử Quân – Hành Trình Lịch Sử',
      '',
      'Thể loại: Giáo dục – trải nghiệm – tư duy',
      '',
      'Chủ đề: Lịch sử Việt Nam (nhân vật – sự kiện – văn hóa)',
      '',
      'Số người chơi: 4 người / 4 đội',
      '',
      'Độ tuổi: 10+',
      '',
      'Thời lượng: 45–60 phút',
      '',
      'Mục tiêu chiến thắng:',
      ' Đội đầu tiên đưa đủ 4 nhân vật của mình về ô Đích sẽ giành chiến thắng.',
      'II. Thành phần trò chơi',
      'Một bộ board game Việt Sử Quân bao gồm:',
      'Bàn chơi: Bàn cờ chia thành 4 lãnh thổ, gồm ô thường và ô đặc biệt / ô cơ hội',
      '',
      'Nhân vật: 4 hình nộm đại diện cho mỗi đội',
      '',
      'Thẻ câu hỏi: 50 thẻ câu hỏi lịch sử, có đáp án đúng/sai ở mặt sau',
      '',
      'Xúc xắc: 1 viên xúc xắc 6 mặt',
      '',
      'Sổ luật: Hướng dẫn cách chơi chi tiết',
      'III. Các thành phần trong game',
      '1. Nhân vật',
      ' Mỗi nhân vật đại diện cho một cá nhân người Việt trong dòng chảy lịch sử. Người chơi điều khiển các nhân vật di chuyển trên bàn cờ, vượt qua thử thách để hoàn thành hành trình.',
      '2. Thẻ câu hỏi',
      ' Câu hỏi xoay quanh:',
      'Sự kiện lịch sử',
      '',
      'Nhân vật lịch sử',
      '',
      'Văn hóa – xã hội Việt Nam',
      '',
      'Thẻ dùng để kiểm tra kiến thức và tạo tương tác giữa người chơi.',
      '3. Ô đặc biệt / ô cơ hội',
      ' Khi nhân vật rơi vào các ô này, người chơi phải thực hiện thử thách trả lời câu hỏi lịch sử theo luật.',
      'IV. Luật chơi',
      '1. Bắt đầu trò chơi',
      ' Mỗi đội chọn màu và đặt 4 nhân vật tại vị trí xuất phát. Các đội chơi lần lượt theo chiều kim đồng hồ.',
      '2. Di chuyển',
      ' Đến lượt, người chơi:',
      'Đổ xúc xắc',
      '',
      'Chọn 1 nhân vật của đội mình để di chuyển theo số nút xúc xắc',
      '',
      '3. Ô đặc biệt / ô cơ hội',
      ' Khi nhân vật rơi vào ô đặc biệt:',
      'Người chơi kế tiếp bốc 1 thẻ câu hỏi và là người duy nhất được xem đáp án',
      '',
      'Người trả lời không được hỏi ý kiến người chơi khác',
      '',
      'Những người còn lại không được xem đáp án',
      '',
      '4. Kết quả trả lời',
      'Trả lời đúng: Nhân vật được tiếp tục di chuyển theo số nút xúc xắc',
      '',
      'Trả lời sai: Nhân vật đứng yên, kết thúc lượt',
      '',
      '5. Về đích',
      ' Nhân vật phải di chuyển đúng số nút để vào ô Đích. Trò chơi kết thúc khi một đội đưa đủ 4 nhân vật về Đích.',
      'V. Lưu ý',
      'Chỉ người đọc câu hỏi được quyền kiểm tra đáp án',
      '',
      'Đáp án in trên thẻ là quyết định cuối cùng',
      '',
      'Trò chơi hướng tới việc học lịch sử qua trải nghiệm, rèn luyện tư duy cá nhân và đảm bảo tính công bằng giữa người chơi',
      ' Hãy hoàn thiện cho tôi',
    ],
  },
];

const FAQ = () => {
  const [openId, setOpenId] = useState(1);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const titleColor = '#61251B';

  return (
    <div className="min-h-screen bg-[#FEFDF6] py-10 md:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <h1
          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8"
          style={{ color: titleColor }}
        >
          Giải đáp thắc mắc
        </h1>

        <div className="space-y-3 md:space-y-4">
          {faqs.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full flex items-center justify-between px-4 md:px-6 py-3 md:py-4 text-left"
              >
                <span
                  className="text-sm md:text-base font-semibold"
                  style={{ color: titleColor }}
                >
                  {item.id}. {item.question}
                </span>
                <span className="ml-3 text-gray-500">
                  {openId === item.id ? '▾' : '▸'}
                </span>
              </button>
              {openId === item.id && (
                <div className="px-4 md:px-6 pb-4 md:pb-5 text-sm md:text-base leading-relaxed text-[#333333] border-t border-gray-200 bg-[#FAF6EC]">
                  {Array.isArray(item.answer) ? (
                    item.answer.map((para, idx) => (
                      <p key={idx} className="mb-2 last:mb-0">
                        {para}
                      </p>
                    ))
                  ) : (
                    <p>{item.answer}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;


