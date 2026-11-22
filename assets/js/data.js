/**
 * DỮ LIỆU CÁ NHÂN & NỘI DUNG TRANG WEB
 * Bạn chỉ cần chỉnh sửa các thông tin trong file này để cá nhân hóa toàn bộ trang web.
 */

const SITE_DATA = {
    profile: {
        name: "Min",
        brandMark: "M",
        role: "Area Manager • Data & Automation Enthusiast",
        email: "vunguyen2907@gmail.com",
        facebook: "https://facebook.com",
        zalo: "https://zalo.me",
        tiktok: "https://tiktok.com",
        linkedin: "https://linkedin.com/in/yourprofile",
        github: "https://github.com/vunguyen2907-netizen/min-personal-web",
        domain: "vunguyen2907.id.vn"
    },

    // 1. Góc Quản trị & Chiến lược (Management & Strategy)
    managementPillars: [
        {
            title: "Quản trị Đội ngũ Quy mô lớn",
            metric: "250+ Nhân sự",
            description: "Điều phối và phát triển đội ngũ vận hành đa điểm bán tại nhiều khu vực. Xây dựng văn hóa làm việc minh bạch dựa trên số liệu và trao quyền rõ ràng cho cấp quản lý cửa hàng.",
            highlights: ["Đào tạo & Coaching Store Manager", "Tối ưu ca làm việc & năng suất", "Đánh giá KPI công bằng"]
        },
        {
            title: "Hoạch định Chiến lược Kinh doanh",
            metric: "Đa điểm bán",
            description: "Phân tích xu hướng thị trường, hành vi khách hàng và cơ cấu doanh thu để lập kế hoạch tăng trưởng theo quý. Phối hợp chặt chẽ giữa vận hành, marketing và chuỗi cung ứng.",
            highlights: ["Dự báo doanh số & tồn kho", "Tối ưu chi phí vận hành (P&L)", "Mở rộng & chuẩn hóa điểm bán mới"]
        },
        {
            title: "Tiêu chuẩn Dịch vụ & SOP",
            metric: "98% Tuân thủ",
            description: "Chuẩn hóa quy trình vận hành (SOP) từ trải nghiệm khách hàng tại quầy đến kiểm soát chất lượng định kỳ, đảm bảo mọi cửa hàng trong khu vực duy trì một tiêu chuẩn đồng nhất.",
            highlights: ["Checklist kiểm soát chất lượng", "Cải thiện chỉ số hài lòng (CSAT)", "Số hóa quy trình kiểm tra hiện trường"]
        }
    ],

    // 2. Danh mục Dự án Data & Automation (Portfolio Case Studies)
    projects: [
        {
            id: "bi-dashboard",
            category: "data",
            categoryLabel: "Data & BI",
            title: "Hệ thống Dashboard Quản trị Bán lẻ",
            shortDesc: "Thiết kế hệ thống báo cáo Power BI & Looker Studio chuyển hóa dữ liệu thô thành insights hành động theo thời gian thực cho hơn 250 nhân sự.",
            tags: ["Power BI", "Looker Studio", "SQL"],
            icon: "chart",
            caseStudy: {
                challenge: "Dữ liệu bán hàng, tồn kho và năng suất nhân sự trước đây nằm rải rác trên nhiều file Excel gửi thủ công cuối tuần, khiến quản lý khu vực và cửa hàng trưởng mất 6-8 giờ/tuần để tổng hợp và luôn phản ứng chậm với biến động doanh số.",
                solution: "Xây dựng mô hình dữ liệu chuẩn hóa bằng SQL kết hợp Power BI và Looker Studio. Phân quyền xem dữ liệu theo từng cấp quản lý (Row-Level Security) để mỗi cửa hàng chỉ thấy đúng KPI của mình.",
                architecture: ["Nguồn dữ liệu POS & ERP", "Làm sạch & truy vấn bằng SQL", "Trực quan hóa Power BI / Looker Studio", "Tự động cập nhật lịch định kỳ hàng ngày"],
                impact: [
                    "Giảm 85% thời gian làm báo cáo thủ công mỗi tuần.",
                    "Phát hiện sớm các nhóm hàng bán chậm để điều chuyển kịp thời.",
                    "Hơn 250 nhân sự & quản lý sử dụng hàng ngày để theo dõi mục tiêu."
                ]
            }
        },
        {
            id: "vehicle-counter",
            category: "automation",
            categoryLabel: "Automation",
            title: "Hệ thống Đếm lượt xe & Báo cáo Tự động",
            shortDesc: "Xây dựng công cụ ghi nhận lưu lượng xe ra vào tại điểm bán bằng Google Apps Script kết hợp lưu trữ Supabase và cảnh báo tự động.",
            tags: ["Apps Script", "Supabase", "Automation"],
            icon: "code",
            caseStudy: {
                challenge: "Việc đo lường tỷ lệ chuyển đổi (Conversion Rate) giữa lượng khách ghé bãi xe và số hóa đơn thực tế gặp khó khăn vì ghi chép giấy dễ sai sót và không có dữ liệu theo khung giờ cao điểm.",
                solution: "Phát triển web-app nhẹ kết nối Google Apps Script làm lớp trung gian xử lý logic và đẩy dữ liệu thời gian thực về cơ sở dữ liệu PostgreSQL trên Supabase. Hệ thống tự động tổng hợp báo cáo khung giờ vàng cuối ngày.",
                architecture: ["Giao diện nhập liệu tối giản trên di động", "Google Apps Script xử lý & xác thực", "Supabase (PostgreSQL) lưu trữ tập trung", "Gửi báo cáo tổng hợp tự động qua Email/Chat"],
                impact: [
                    "Nắm bắt chính xác khung giờ cao điểm để bố trí nhân sự hợp lý.",
                    "Đo lường được tỷ lệ chuyển đổi thực tế theo từng cửa hàng.",
                    "Chi phí vận hành gần như bằng 0 nhờ tận dụng hạ tầng cloud miễn phí."
                ]
            }
        },
        {
            id: "esp32-vietqr",
            category: "iot",
            categoryLabel: "IoT & Hardware",
            title: "Mạch ESP32 Hiển thị Mã VietQR Động",
            shortDesc: "Nghiên cứu & lập trình thiết bị phần cứng ESP32 tích hợp màn hình hiển thị mã VietQR động theo đúng số tiền từng đơn hàng tại quầy.",
            tags: ["ESP32", "VietQR", "IoT", "C++"],
            icon: "chip",
            caseStudy: {
                challenge: "Khi khách hàng thanh toán chuyển khoản bằng mã QR tĩnh dán tại quầy, khách thường nhập nhầm số tiền hoặc thu ngân mất thời gian kiểm tra màn hình điện thoại, gây ùn ứ giờ cao điểm.",
                solution: "Tự thiết kế và lập trình bộ hiển thị dùng vi điều khiển ESP32 kết nối Wi-Fi, nhận số tiền từ máy thu ngân qua API cục bộ/webhook và sinh mã VietQR động chuẩn EMVCo hiển thị sắc nét ngay trước mặt khách.",
                architecture: ["Vi điều khiển ESP32 + màn hình TFT/OLED", "Tạo chuỗi chuẩn VietQR (EMVCo)", "Đồng bộ số tiền đơn hàng qua HTTP/MQTT", "Tự động quay về màn hình chờ sau khi hoàn tất"],
                impact: [
                    "Loại bỏ hoàn toàn sai sót nhập nhầm số tiền chuyển khoản.",
                    "Rút ngắn trung bình 15-20 giây cho mỗi giao dịch thanh toán QR.",
                    "Chi phí linh kiện thấp, dễ nhân rộng cho nhiều quầy thu ngân."
                ]
            }
        },
        {
            id: "supabase-ops",
            category: "data",
            categoryLabel: "Data & Automation",
            title: "Quản trị Dữ liệu Vận hành với Supabase",
            shortDesc: "Chuyển đổi các bảng tính vận hành rời rạc sang cơ sở dữ liệu quan hệ trên Supabase, hỗ trợ tra cứu nhanh và đồng bộ API.",
            tags: ["Supabase", "PostgreSQL", "API"],
            icon: "database",
            caseStudy: {
                challenge: "Các file Google Sheets dùng chung cho nhiều cửa hàng thường xuyên bị chậm, lỗi công thức hoặc xung đột dữ liệu khi có hàng chục người cùng cập nhật.",
                solution: "Chuẩn hóa cấu trúc bảng dữ liệu trên Supabase, thiết lập ràng buộc dữ liệu (constraints) và cung cấp API gọn nhẹ để đồng bộ hai chiều với các công cụ báo cáo.",
                architecture: ["PostgreSQL Schema chuẩn hóa", "Supabase REST API & Auth", "Đồng bộ tự động với công cụ BI", "Sao lưu dữ liệu định kỳ"],
                impact: [
                    "Dữ liệu nhất quán, loại bỏ hoàn toàn lỗi ghi đè công thức.",
                    "Tốc độ truy vấn báo cáo nhanh gấp nhiều lần so với bảng tính.",
                    "Làm nền tảng vững chắc cho các công cụ tự động hóa nội bộ tiếp theo."
                ]
            }
        }
    ],

    // 3. Nhật ký Leo núi (Trekking Logs)
    trekkingLogs: [
        {
            id: "ta-chi-nhau",
            tag: "Trekking Log • Q4",
            title: "Chinh phục Tà Chì Nhâu — Biển mây & Hoa Chi Pâu",
            excerpt: "Chuyến đi 3 ngày 2 đêm lên nóc nhà Yên Bái cao 2.979m, băng qua những con dốc dựng đứng đầy gió và thảm hoa Chi Pâu tím biếc.",
            image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
            featured: true,
            stats: {
                elevation: "2.979 m",
                distance: "~16 km (khứ hồi)",
                difficulty: "Khó (7.5/10)",
                location: "Trạm Tấu, Yên Bái"
            },
            story: [
                "Tà Chì Nhâu không chào đón người đi bằng những tán rừng rậm dịu mát, mà thử thách ngay bằng những con dốc cỏ trống trải và gió rít liên hồi. Càng lên cao, nhịp thở càng cần được giữ đều như cách điều phối một dự án áp lực cao: không chạy nước rút, chỉ cần không dừng lại.",
                "Sáng sớm từ lán 2.400m đẩy lên đỉnh trong cái lạnh 6°C, mọi mệt mỏi tan biến khi mặt trời nhô lên trên biển mây dày đặc. Cả sườn núi rực lên sắc tím mảnh mai của hoa Chi Pâu.",
                "Bài học mang về từ chuyến đi: Khi rời khỏi vùng phủ sóng điện thoại 48 giờ, bạn mới nhận ra sự tĩnh lặng quý giá đến mức nào để nhìn lại những quyết định lớn trong công việc."
            ]
        },
        {
            id: "ta-nang-phan-dung",
            tag: "Trekking Log • Q2",
            title: "Tà Năng – Phan Dũng: Cung đường đi qua 3 tỉnh",
            excerpt: "Hơn 30km băng qua những đồi cỏ cháy xanh mướt từ cao nguyên Lâm Đồng đổ xuống nắng gió Bình Thuận.",
            image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=900&auto=format&fit=crop",
            featured: false,
            stats: {
                elevation: "1.100 m",
                distance: "~32 km (2N1Đ)",
                difficulty: "Trung bình (6/10)",
                location: "Lâm Đồng → Bình Thuận"
            },
            story: [
                "Nếu Tà Chì Nhâu là sự khắc nghiệt của núi cao phía Bắc, thì Tà Năng – Phan Dũng lại mang vẻ phóng khoáng tuyệt đối với những triền đồi nối tiếp nhau bất tận dưới bầu trời xanh ngắt.",
                "Đêm cắm trại trên đồi Hai Cây Thông với bữa tối đơn giản và bầu trời đầy sao là khoảnh khắc sạc pin trọn vẹn nhất sau một quý chạy chỉ tiêu kinh doanh căng thẳng.",
                "Kinh nghiệm nhỏ: Chuẩn bị kỹ nước điện giải, giày bám tốt cho đoạn đổ dốc xuống suối Phan Dũng và nhớ mang theo áo khoác gió nhẹ cho buổi tối."
            ]
        },
        {
            id: "lao-than",
            tag: "Trekking Log • Q1",
            title: "Lảo Thẩn — Nóc nhà Y Tý săn mây đầu năm",
            excerpt: "Cung đường lý tưởng để khởi động năm mới: nắng đẹp, đồi cỏ cháy vàng rực và bình minh trên biển mây Y Tý.",
            image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=900&auto=format&fit=crop",
            featured: false,
            stats: {
                elevation: "2.860 m",
                distance: "~14 km (khứ hồi)",
                difficulty: "Trung bình (5.5/10)",
                location: "Y Tý, Bát Xát, Lào Cai"
            },
            story: [
                "Lảo Thẩn là chuyến đi mở bát đầu năm để tự đặt lại mục tiêu cho 4 quý phía trước. Địa hình khá thoáng, không quá nhiều rừng rậm nên tầm nhìn luôn mở rộng ra các thung lũng mây.",
                "Đứng trên chóp inox 2.860m đón những tia nắng đầu tiên của ngày mới, cảm giác vừa nhỏ bé trước thiên nhiên, vừa tràn đầy năng lượng để quay về với những bảng dữ liệu và kế hoạch mới."
            ]
        }
    ],

    // 4. Bản đồ các đỉnh núi đã chinh phục (Google Maps Embed)
    conqueredPeaks: [
        {
            id: "peak-tcn",
            name: "Đỉnh Tà Chì Nhâu",
            region: "Trạm Tấu, Yên Bái",
            elevation: "2.979 m",
            date: "Quý 4 / 2025",
            coords: "21.4847, 104.3033",
            query: "Ta+Chi+Nhau,+Tram+Tau,+Yen+Bai,+Vietnam",
            note: "Săn biển mây & mùa hoa Chi Pâu tím."
        },
        {
            id: "peak-lt",
            name: "Đỉnh Lảo Thẩn",
            region: "Y Tý, Lào Cai",
            elevation: "2.860 m",
            date: "Quý 1 / 2026",
            coords: "22.6186, 103.6947",
            query: "Lao+Than+Peak,+Bat+Xat,+Lao+Cai,+Vietnam",
            note: "Nóc nhà Y Tý, bình minh trên thung lũng mây."
        },
        {
            id: "peak-tnpd",
            name: "Tà Năng – Phan Dũng",
            region: "Đức Trọng, Lâm Đồng",
            elevation: "1.100 m",
            date: "Quý 2 / 2026",
            coords: "11.5586, 108.5322",
            query: "Ta+Nang,+Duc+Trong,+Lam+Dong,+Vietnam",
            note: "Cung đường đồi cỏ đẹp nhất miền Nam."
        },
        {
            id: "peak-langbiang",
            name: "Đỉnh Langbiang (Bidoup)",
            region: "Lạc Dương, Đà Lạt",
            elevation: "2.167 m",
            date: "Quý 3 / 2026",
            coords: "12.0453, 108.4383",
            query: "Langbiang+Mountain,+Lac+Duong,+Lam+Dong,+Vietnam",
            note: "Trekking nhẹ nhàng xuyên rừng thông kết hợp nghỉ dưỡng Đà Lạt."
        }
    ],

    // 5. Góc Healing Getaways (Trốn phố về rừng)
    healingGetaways: [
        {
            badge: "Di chuyển",
            title: "Kinh nghiệm đi xe giường nằm lên Đà Lạt",
            summary: "Chọn chuyến đêm 23h00 để ngủ một giấc trọn vẹn và thức dậy giữa sương sớm 5h30 sáng mà không mất ngày phép.",
            tips: [
                "Ưu tiên xe Limousine phòng đôi/phòng đơn (22–24 phòng) có rèm riêng tư và cổng sạc ổn định.",
                "Chọn giường tầng dưới ở khu vực giữa xe để hạn chế say xe khi qua đèo Bảo Lộc và đèo Prenn.",
                "Mang theo nút bịt tai, bịt mắt và một chiếc áo khoác mỏng để giữ ấm lúc xuống bến sáng sớm."
            ]
        },
        {
            badge: "Lưu trú",
            title: "Boutique Hotel yên tĩnh ẩn mình giữa rừng thông",
            summary: "Tránh xa khu vực chợ đêm ồn ào, chọn các khu vực Phường 3, Phường 10 hoặc đường Khe Sanh, Hùng Vương.",
            tips: [
                "Ưu tiên phòng có cửa kính lớn hướng đồi thông và ánh sáng tự nhiên để đọc sách buổi sáng.",
                "Các boutique nhỏ quy mô dưới 15 phòng thường có dịch vụ chỉn chu và không gian tĩnh lặng hơn.",
                "Đặt phòng sớm 2–3 tuần nếu đi vào cuối tuần để có mức giá tốt và view đẹp."
            ]
        },
        {
            badge: "Cà phê",
            title: "Những quán Cà phê ẩn mình để 'trốn deadline'",
            summary: "Không gian gỗ mộc, mùi cà phê rang xay nhẹ nhàng, đủ yên tĩnh để viết nhật ký hoặc nhìn mưa rơi qua hiên.",
            tips: [
                "Đi khung giờ 7h00 – 9h00 sáng để tận hưởng không khí trong lành nhất và ít khách chụp ảnh.",
                "Ưu tiên các quán phục vụ pour-over (V60/Chemex) dùng hạt Arabica Cầu Đất rang nhẹ.",
                "Gác điện thoại chế độ máy bay 2 tiếng — một cuốn sổ tay và một ly cà phê nóng là đủ."
            ]
        }
    ],

    // 6. Checklist Hành trang Tối giản 30L (Interactive)
    packingChecklist: [
        { id: "pack-1", group: "Trang phục", text: "2 áo thun nhanh khô (quick-dry) + 1 áo giữ nhiệt ngủ lán" },
        { id: "pack-2", group: "Trang phục", text: "1 áo khoác gió chống thấm nhẹ (windbreaker / gore-tex)" },
        { id: "pack-3", group: "Trang phục", text: "1 quần trekking co giãn + 2 đôi tất len cổ cao" },
        { id: "pack-4", group: "Giày & Bảo hộ", text: "Giày trail / trekking đế bám tốt (đã đi quen chân)" },
        { id: "pack-5", group: "Giày & Bảo hộ", text: "Gậy trekking gấp gọn (giảm 25% áp lực cho đầu gối khi đổ dốc)" },
        { id: "pack-6", group: "Thiết bị", text: "Đèn pin đội đầu (headlamp) + pin dự phòng 10.000mAh" },
        { id: "pack-7", group: "Y tế & Nước", text: "Bình nước mềm 1.5L + gói bù điện giải + băng cá nhân, dầu nóng" },
        { id: "pack-8", group: "Tối giản", text: "Túi khô (dry bag) bọc đồ điện tử & giấy tờ tùy thân" }
    ]
};
