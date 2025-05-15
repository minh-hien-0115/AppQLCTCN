export const appColors = {
    // === Cơ bản ===
    primary: '#5669FF',
    primary1: '#007AFF',           // Màu chính (thường dùng cho nút, liên kết chính)
    secondary: '#5856D6',         // Màu phụ (dùng cho nút phụ hoặc nhấn mạnh khác)
    background: '#F2F2F7',        // Màu nền tổng thể sáng
    text1: '#000000',              // Màu chữ chính (đen)
    text: '#120D26',
    white: '#ffffff',         // Màu chữ sáng (trắng) dùng trên nền tối
    border: '#E1E1E1',            // Màu viền hoặc đường ngăn cách
    error: '#FF3B30',             // Màu cảnh báo lỗi
    success: '#4CD964',           // Màu thông báo thành công
    warning: '#FF9500',           // Màu cảnh báo chung
    info: '#5AC8FA',              // Màu thông tin phụ trợ
    disabled: '#C7C7CC',          // Màu trạng thái vô hiệu hóa
    placeholder: '#8E8E93',       // Màu chữ gợi ý trong input
    gray: '#807A7A',            // Màu xám trung bình (dùng cho chữ phụ hoặc nền)
    gray2: '#DADADA',       // Màu xám nhạt (dùng cho nền hoặc chữ phụ)
    gray3:'#E4DFDF',        // Màu xám nhạt hơn (dùng cho nền hoặc chữ phụ)
    gray4:'#9d9898',        // Màu xám nhạt hơn nữa (dùng cho nền hoặc chữ phụ)          
    link: '#5669FF',          // Màu xám nhạt (dùng cho nền hoặc chữ phụ)

    // === Mở rộng ===
    lightGray: '#D1D1D6',         // Xám nhạt - nền nhẹ
    mediumGray: '#AEAEB2',        // Xám trung bình - dùng cho chữ phụ
    darkGray: '#1C1C1E',          // Xám đậm - nền dark mode
    darkerGray: '#0D0D0D',        // Gần đen - nền tối hơn nữa
    backgroundDark: '#1C1C1E',    // Nền tối dùng trong dark mode
    primaryDark: '#0051A8',       // Màu chính dark mode
    secondaryDark: '#3D3AC1',     // Màu phụ dark mode

    // === Các trạng thái UI ===
    overlay: 'rgba(0,0,0,0.5)',   // Lớp phủ bán trong suốt (dùng cho modal, loading)
    shadow: 'rgba(0,0,0,0.2)',    // Màu bóng đổ
    highlight: '#FFD60A',         // Màu nổi bật (highlight item)
    focus: '#34C759',             // Màu khi thành phần được focus
    pressed: '#007AFF99',         // Màu khi nhấn (primary với độ mờ 60%)
    hovered: '#007AFF33',         // Màu khi rê chuột (primary với độ mờ 20%)

    // === Màu theo tag / label ===
    tagRed: '#FF453A',            // Thẻ đỏ - cảnh báo / ưu tiên cao
    tagGreen: '#32D74B',          // Thẻ xanh lá - trạng thái tốt
    tagBlue: '#0A84FF',           // Thẻ xanh dương - thông tin
    tagPurple: '#BF5AF2',         // Thẻ tím - nhấn mạnh
    tagTeal: '#64D2FF',           // Thẻ teal - nhẹ nhàng, hiện đại
    tagYellow: '#FFD60A',         // Thẻ vàng - chú ý / nổi bật
    tagOrange: '#FF9F0A',         // Thẻ cam - cảnh báo nhẹ
    tagPink: '#FF2D55',           // Thẻ hồng - nhấn mạnh, cá nhân
    tagIndigo: '#5E5CE6',         // Thẻ chàm - nổi bật, lịch sự

    // === Phân tầng độ sâu (elevation) ===
    surface1: '#FFFFFF',          // Mặt nền 1 - sáng
    surface2: '#F2F2F2',          // Mặt nền 2 - sáng hơn chút
    surface3: '#E5E5EA',          // Mặt nền 3 - dùng cho card
    surfaceDark1: '#2C2C2E',      // Mặt nền tối 1
    surfaceDark2: '#3A3A3C',      // Mặt nền tối 2

    // === Divider & Border ===
    divider: '#CCCCCC',           // Đường ngăn chia (sáng)
    dividerDark: '#3A3A3C',       // Đường ngăn chia (trong dark mode)

    // === Màu nút ===
    buttonPrimary: '#007AFF',     // Nút chính
    buttonSecondary: '#5856D6',   // Nút phụ
    buttonDanger: '#FF3B30',      // Nút cảnh báo
    buttonDisabled: '#D1D1D6',    // Nút bị vô hiệu hóa

    // === Gradient (dùng cho nền hoặc loading) ===
    gradientStart: '#4c669f',     // Màu bắt đầu của gradient
    gradientEnd: '#3b5998',       // Màu kết thúc của gradient
    gradientOverlay: 'linear-gradient(180deg, #00000000 0%, #000000AA 100%)', // Lớp phủ đổ dần từ trong suốt đến đen

    // === Trợ năng / Accessibility ===
    highContrastText: '#000000',      // Văn bản độ tương phản cao (đen)
    highContrastTextLight: '#FFFFFF',// Văn bản tương phản cao (trắng)

    // === Màu bổ sung (dùng cho giao diện sống động hoặc theme phụ) ===
    cyan: '#30D5C8',      // Xanh ngọc (giữa xanh lá và xanh biển)
    lime: '#C7EA46',      // Xanh chanh sáng (như lá non)
    coral: '#FF6B6B',     // Màu san hô (đỏ cam tươi)
    navy: '#001F54',      // Xanh hải quân (rất đậm, gần đen)
    beige: '#F5F5DC',     // Màu be (vàng kem nhạt, nhẹ nhàng, trung tính)

    // === Màu chữ (text) ===
    textPrimary: '#000000',        // Màu chữ chính (đen)
    textSecondary: '#3C3C43',      // Màu chữ phụ (dùng cho subtitle, chú thích)
    textTertiary: '#3C3C4399',     // Màu chữ ít quan trọng (~60% opacity)
    textQuaternary: '#3C3C434D',   // Màu chữ yếu (~30% opacity)
    textInverse: '#FFFFFF',        // Chữ trắng, dùng khi nền là màu tối

    textDark: '#FFFFFF',           // Chữ trắng cho dark mode
    textDarkSecondary: '#EBEBF5',  // Chữ phụ trong dark mode
    textDarkTertiary: '#EBEBF599', // Chữ yếu trong dark mode (~60% opacity)
    gg: '#4285F4'
};