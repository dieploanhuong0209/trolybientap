import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { EditorConfig, MEDIA_GROUPS, SectionType } from '../types';

const getSystemInstruction = () => {
  return `
# ROLE & OBJECTIVE
Bạn là "Biên tập viên HD" - Trợ lý biên tập nội dung chuyên nghiệp cho Agency (Admicro/VCCorp).

# 🚫 CRITICAL FORMATTING RULES (TUÂN THỦ TUYỆT ĐỐI)
1. **NO HTML/CSS:** KHÔNG dùng thẻ HTML. Chỉ dùng Markdown.

2. **DELIMITERS:** BẮT BUỘC dùng thẻ định danh sau đây ở dòng đầu tiên của mỗi phần để hệ thống phân tách nội dung:
   - Phần đánh giá: \`<<<SECTION: AUDIT>>>\`
   - Phần Social: \`<<<SECTION: SOCIAL>>>\`
   - Phần Share Link: \`<<<SECTION: SHARE_LINK>>>\`
   - Phần Video Viral: \`<<<SECTION: VIRAL_CLIP>>>\`
   - Phần Video Mutex: \`<<<SECTION: MUTEX_VIDEO>>>\`
   - Phần Editorial: \`<<<SECTION: EDITORIAL>>>\`

3. **QUY CHUẨN ĐỊNH DẠNG CHUNG (UNIFIED FORMATTING):**
   *Áp dụng cho các phần biên tập (Social Post, Editorial).*
   *NGOẠI TRỪ: Audit, Share Link, Viral Clip, Mutex Video.*
   - **Footer (BẮT BUỘC):** Dòng cuối cùng của mỗi option/bài viết phải ghi chú số lượng từ theo đúng mẫu in nghiêng sau (không dùng dấu ngoặc đơn, không dùng dấu ngoặc vuông):
     *Số lượng từ: XX từ.*
   - **Headline:** Luôn **In đậm** tiêu đề đầu dòng.
   - **Layout:** Trình bày thoáng, phân tách rõ ràng các ý.

4. **QUY ĐỊNH RIÊNG CHO SHARE LINK:**
   - **VỊ TRÍ ICON:** Luôn đặt icon ở **ĐẦU DÒNG** (của Tiêu đề hoặc CTA).
   - **CẤU TRÚC (BẮT BUỘC NGẮT DÒNG RÕ RÀNG):**
     [Icon] **[Tiêu đề/Hook Giật tít]** (In đậm)
     
     (Dòng trống bắt buộc)

     [Nội dung tóm tắt hấp dẫn (3-4 câu). Chỉ tập trung vào giá trị/câu chuyện. TUYỆT ĐỐI KHÔNG viết lời kêu gọi hành động như "Khám phá", "Xem ngay" ở đoạn này.]
     
     (Dòng trống bắt buộc)

     [Icon] [CTA (Đọc tiếp tại, Xem chi tiết, Khám phá ngay...)]: [Link]
   - **NO WORD COUNT:** Tuyệt đối KHÔNG hiển thị dòng đếm số lượng từ.
   - **NO QUOTES:** Tuyệt đối KHÔNG dùng dấu ngoặc kép bao quanh nội dung.
   - **MỤC ĐÍCH:** Trình bày thoáng, thân bài tự nhiên, CTA và Link nằm riêng biệt ở cuối.

5. **QUY ĐỊNH RIÊNG CHO SOCIAL POST (FACEBOOK FORMAT):**
   - **ĐỘ DÀI (BẮT BUỘC):** Mỗi bài post phải có độ dài từ **200 - 300 từ**. Tuyệt đối không viết quá ngắn (dưới 200 từ) hoặc quá dài (trên 400 từ).
   - **LAYOUT (BẮT BUỘC THOÁNG - SPACIOUS):**
     + Tuyệt đối KHÔNG viết dính liền thành khối văn bản (No Wall of Text).
     + Giữa các đoạn văn nhỏ **BẮT BUỘC phải có 1 DÒNG TRỐNG (Double Enter)**.
     + Cấu trúc chuẩn:
       [Tiêu đề In đậm]
       (Dòng trống)
       [Đoạn 1]
       (Dòng trống)
       [Đoạn 2]
       (Dòng trống)
       ...
       [Hashtag]
   - **ĐOẠN VĂN:** Chia thân bài thành 3-5 đoạn ngắn. Mỗi đoạn chỉ dài 2-3 câu để dễ đọc trên điện thoại.
   - **ICON:** Đặt icon ở đầu câu để làm bullet point hoặc nhấn mạnh. KHÔNG đặt icon lộn xộn cuối câu.
   - **SỐ LƯỢNG & ĐÁNH SỐ:** Nếu yêu cầu > 1 bài, bắt buộc đánh số thứ tự rõ ràng ở đầu: **Bài 1**, **Bài 2**...
   - **HASHTAG:** Cuối mỗi bài bắt buộc có **3 - 4 hashtag** liên quan.
   - **PHÂN CÁCH BÀI VIẾT (CRITICAL):**
     - Giữa các bài (Bài 1, Bài 2...) phải có dòng kẻ ngang \`---\`.
     - **BẮT BUỘC:** Phải xuống dòng và để **1 DÒNG TRỐNG** trước và sau dấu \`---\`.

6. **NGUYÊN TẮC XỬ LÝ URL:**
   - URL đầu vào chỉ là tài liệu tham khảo. KHÔNG tự ý chèn link vào bài trừ khi là format \`SHARE_LINK\`.

7. **QUY ĐỊNH RIÊNG CHO VIDEO SCRIPT (VIRAL & MUTEX):**
   - **ĐỊNH DẠNG:** BẮT BUỘC trình bày dưới dạng **BẢNG (MARKDOWN TABLE)**.
   - **CẤU TRÚC BẢNG (4 CỘT BẮT BUỘC):**
     | Thời lượng / Nội dung chính | Visual (Mô tả hình ảnh) | Audio (Voice-over/Lời bình) | Text (Chữ hiển thị) |
   - **LƯU Ý:** Không viết kịch bản dạng văn bản thông thường, phải kẻ bảng chi tiết từng phân cảnh.
   - **NO WORD COUNT:** Không hiển thị dòng đếm số lượng từ cuối kịch bản.

# WORKING PROCESS

## PHẦN: ĐÁNH GIÁ TỔNG QUAN (AUDIT)
- Phân tích lỗi Chính tả, Từ ngữ, Cấu trúc.
- KHÔNG hiển thị dòng đếm số từ ở phần này.

## PHẦN: BIÊN TẬP THEO YÊU CẦU
- Tạo nội dung sáng tạo, professional.
- Đối với Social/Editorial: Tuân thủ quy chuẩn footer *Số lượng từ: XX từ.*.
- Đối với Share Link/Video: Không có footer đếm từ.
`;
};

// Helper to calculate approximate word count
const countWords = (str: string) => {
  return str.trim().split(/\s+/).length;
};

const buildUserPrompt = (inputData: { url?: string; title: string; sapo: string; body: string }) => {
  let p = `Dưới đây là thông tin đầu vào để xử lý:\n\n`;
  p += `--- INPUT SOURCES ---\n`;
  
  if (inputData.url && inputData.url.trim()) {
     p += `**NGUỒN 1 - LINK BÀI VIẾT (URL):** ${inputData.url}\n`;
     p += `(Lưu ý: URL này chỉ là nguồn thông tin để tham khảo nội dung. Không dùng URL này để tạo CTA trừ khi được yêu cầu ở phần Share Link).\n\n`;
  }

  const hasTextContent = inputData.title || inputData.sapo || inputData.body;
  if (hasTextContent) {
     p += `**NGUỒN 2 - VĂN BẢN THỦ CÔNG:**\n`;
     if (inputData.title) p += `TIÊU ĐỀ: ${inputData.title}\n`;
     if (inputData.sapo) p += `SAPO: ${inputData.sapo}\n`;
     if (inputData.body) p += `THÂN BÀI:\n${inputData.body}\n`;
  }

  p += `--- END INPUT SOURCES ---\n\n`;
  return p;
};

// Helper to get detailed editorial instructions based on percentage
const getEditorialInstructions = (label: string, percent: number, inputBody: string) => {
  const inputWordCount = countWords(inputBody);
  
  let instructions = `
# NHIỆM VỤ CỐT LÕI (EDITORIAL)
Nhiệm vụ của bạn là biên tập lại bài viết PR gốc thành bài Editorial cho báo ${label} dựa trên [MỨC ĐỘ BIÊN TẬP] được yêu cầu.

# ⛔️ ANTI-TRUNCATION PROTOCOL (CHỐNG CẮT XÉN - QUAN TRỌNG NHẤT)
1. **THÔNG SỐ ĐẦU VÀO:** Bài viết gốc có độ dài khoảng **${inputWordCount} từ**.
2. **YÊU CẦU ĐẦU RA:** Bài viết biên tập lại PHẢI có độ dài tương đương (**tối thiểu ${Math.floor(inputWordCount * 0.9)} từ**).
3. **CHIẾN THUẬT MAPPING 1:1 (Đoạn đối Đoạn):**
   - Không được đọc lướt rồi tóm tắt.
   - Hãy xử lý lần lượt từng đoạn văn: Đọc Đoạn 1 gốc -> Viết lại Đoạn 1 mới -> Đọc Đoạn 2 gốc -> Viết lại Đoạn 2 mới.
   - **TUYỆT ĐỐI KHÔNG GỘP ĐOẠN:** Nếu bài gốc có 10 đoạn, bài mới cũng phải có khoảng 8-10 đoạn.
4. **DATA PRESERVATION:** Giữ nguyên 100% số liệu, tên riêng, trích dẫn.

# HIGHLIGHT THAY ĐỔI
- Bất kỳ từ ngữ/câu văn nào được chỉnh sửa, viết lại: BẮT BUỘC đặt trong dấu backtick (\`).
- Phần giữ nguyên: Không dùng backtick.

# MA TRẬN BIÊN TẬP (Mức độ: ${percent}%)
`;

  if (percent <= 30) {
    instructions += `
## MODE: CHỈNH SỬA NHẸ (10% - 30%)
- **GIỮ NGUYÊN 90% CẤU TRÚC:** Chỉ viết lại Tiêu đề, Sapo và câu đầu tiên của mỗi đoạn để dẫn dắt tốt hơn.
- **COPY-PASTE:** Các câu còn lại trong thân bài phải được sao chép y nguyên (giữ nguyên độ dài).
- **MỤC TIÊU:** Làm mới bề mặt, giữ nguyên cốt lõi.`;
  } else if (percent <= 60) {
    instructions += `
## MODE: CHỈNH SỬA VỪA (40% - 60%)
- **VIẾT LẠI CÂU:** Được phép viết lại các câu văn lủng củng trong thân bài cho mượt mà hơn, NHƯNG phải đảm bảo giữ đủ ý của từng câu.
- **KHÔNG CẮT BỎ:** Không được xóa các đoạn văn bổ trợ.
- **KẾT LUẬN MỚI:** Viết lại đoạn kết để nhấn mạnh thông điệp.`;
  } else {
    instructions += `
## MODE: ĐẠI TU (>60%)
- **CẤU TRÚC MỚI:** Có thể đảo vị trí các đoạn, nhưng tổng lượng thông tin phải ĐẦY ĐỦ như bài gốc.
- **SÁNG TẠO:** Viết lại toàn bộ văn phong cho phù hợp với ${label}.
- **CẢNH BÁO:** Dù viết lại hoàn toàn, độ dài vẫn phải đạt ~${inputWordCount} từ. Không được tóm tắt.`;
  }

  return instructions;
};

// Main generation function (Batch)
export const generateContent = async (
  inputData: { url: string; title: string; sapo: string; body: string },
  config: EditorConfig
): Promise<string> => {
  if (!import.meta.env.VITE_API_KEY) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  
  let userPrompt = buildUserPrompt(inputData);
  userPrompt += `YÊU CẦU THỰC HIỆN (Chỉ tạo các phần được liệt kê dưới đây):\n`;
  
  // Always include Audit first
  userPrompt += `1. \`<<<SECTION: AUDIT>>>\` - Đánh giá tổng quan (ngắn gọn, ko đếm từ).\n`;

  // Append other requested formats
  config.formats.forEach(format => {
     if (format === 'social') {
        const customReq = config.socialRequirement ? `\n   - YÊU CẦU BỔ SUNG TỪ USER (Ưu tiên cao nhất): "${config.socialRequirement}"` : '';
        userPrompt += `2. \`<<<SECTION: SOCIAL>>>\` - ${config.quantity} bài Social Post Facebook.${customReq}\n   - YÊU CẦU BẮT BUỘC: Độ dài mỗi bài phải từ 200 - 300 từ. Layout thoáng, tách đoạn rõ ràng bằng dòng trống (Double Enter). Mỗi đoạn ngắn gọn. Cuối bài có 3-4 hashtag. Đánh số "Bài 1", "Bài 2"... Ngăn cách bằng dấu gạch ngang "---" (Lưu ý: phải có dòng trống bao quanh dấu gạch ngang).\n`;
     } else if (format === 'share_link') {
        const urlInstruction = inputData.url ? ` BẮT BUỘC Link phải nằm ở dòng cuối cùng, ngay sau CTA. URL: ${inputData.url}` : ' (Nếu có link thì chèn CTA ở dòng cuối rồi đến link)';
        userPrompt += `2. \`<<<SECTION: SHARE_LINK>>>\` - 01 Caption share link.\n   - Cấu trúc: Tiêu đề in đậm -> Xuống dòng -> Thân bài (3-4 câu hấp dẫn, TUYỆT ĐỐI KHÔNG chứa từ kêu gọi hành động như "Khám phá" hay "Xem tại") -> Xuống dòng -> Dòng cuối cùng là Icon + CTA ngắn gọn + Link.\n   - Lưu ý: ${urlInstruction}\n`;
     } else if (format === 'viral_clip') {
        userPrompt += `2. \`<<<SECTION: VIRAL_CLIP>>>\` - Kịch bản Viral Video (${config.duration}).\n   - FORMAT: Bắt buộc dùng Bảng Markdown (Table) 4 cột: Thời lượng/Nội dung chính | Visual | Audio (Voice-over) | Text. KHÔNG đếm từ.\n`;
     } else if (format === 'mutex_video') {
        userPrompt += `2. \`<<<SECTION: MUTEX_VIDEO>>>\` - Kịch bản Mutex Video (${config.duration}).\n   - FORMAT: Bắt buộc dùng Bảng Markdown (Table) 4 cột: Thời lượng/Nội dung chính | Visual | Audio (Nhạc nền/Voice) | Text. KHÔNG đếm từ.\n`;
     } else if (format === 'editorial') {
        const group = MEDIA_GROUPS[config.mediaGroup];
        // Pass input body to calculate word count constraint
        const instructions = getEditorialInstructions(group.label, config.editPercent, inputData.body);
        userPrompt += `2. \`<<<SECTION: EDITORIAL>>>\` - Bài Editorial (${group.label}), Tone: ${group.desc}.${instructions}\n`;
     }
  });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Use larger model for editorial if possible, but flash is requested. Flash 2.5/3 has large context window.
      contents: userPrompt,
      config: { 
          systemInstruction: getSystemInstruction(), 
          temperature: 0.7,
          // Explicitly set a high output limit to avoid truncation
          maxOutputTokens: 8192 
      },
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Batch Error:", error);
    throw error;
  }
};

// Single section regeneration function (Replay)
export const generateSingleSection = async (
  inputData: { url: string; title: string; sapo: string; body: string },
  config: EditorConfig,
  sectionType: SectionType
): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let userPrompt = buildUserPrompt(inputData);

  // Explicit instruction to skip Audit/Evaluation if not requested
  userPrompt += `\n⛔️ QUAN TRỌNG:
  1. KHÔNG thực hiện bước Đánh giá (Audit/Review) nếu không được yêu cầu.
  2. KHÔNG nhắc lại các lỗi chính tả/ngữ pháp.
  3. KHÔNG viết lời dẫn hay lời chào (VD: "Dưới đây là...").
  4. CHỈ TRẢ VỀ DUY NHẤT nội dung của định dạng được yêu cầu.`;

  // Conditional formatting instructions
  const isVideoOrLink = sectionType === 'share_link' || sectionType === 'viral_clip' || sectionType === 'mutex_video';

  if (isVideoOrLink) {
     userPrompt += `\n  5. FORMATTING: TUYỆT ĐỐI KHÔNG hiển thị dòng đếm số từ. Chỉ trả về nội dung chính.\n\n`;
  } else {
     userPrompt += `\n  5. FORMATTING (BẮT BUỘC): Kết thúc nội dung bằng dòng thông số word count in nghiêng: *Số lượng từ: [Số lượng] từ.*\n\n`;
  }
  
  userPrompt += `YÊU CẦU CỤ THỂ (RE-GENERATE SINGLE SECTION):\n`;

  if (sectionType === 'audit') {
    userPrompt += `\`<<<SECTION: AUDIT>>>\` - Thực hiện lại đánh giá tổng quan (ngắn gọn, ko đếm từ).\n`;
  } else if (sectionType === 'social') {
    const customReq = config.socialRequirement ? `\n   - YÊU CẦU BỔ SUNG TỪ USER (Ưu tiên cao nhất): "${config.socialRequirement}"` : '';
    userPrompt += `\`<<<SECTION: SOCIAL>>>\` - Viết ${config.quantity} bài Social Post Facebook.${customReq}\n   - YÊU CẦU BẮT BUỘC: Độ dài mỗi bài phải từ 200 - 300 từ. Layout thoáng, tách đoạn rõ ràng bằng dòng trống (Double Enter). Mỗi đoạn ngắn gọn. Cuối bài có 3-4 hashtag. Đánh số "Bài 1", "Bài 2"... Ngăn cách bằng "---" (có dòng trống bao quanh).\n`;
  } else if (sectionType === 'share_link') {
    const urlInstruction = inputData.url ? ` BẮT BUỘC Link phải nằm ở dòng cuối cùng, ngay sau CTA. URL: ${inputData.url}` : '';
    userPrompt += `\`<<<SECTION: SHARE_LINK>>>\` - Viết 01 Caption share link.\n   - Cấu trúc: Tiêu đề in đậm -> Xuống dòng -> Thân bài (3-4 câu hấp dẫn, TUYỆT ĐỐI KHÔNG chứa từ kêu gọi hành động như "Khám phá" hay "Xem tại") -> Xuống dòng -> Dòng cuối cùng là Icon + CTA ngắn gọn + Link.\n   - Lưu ý: ${urlInstruction} (Copy paste dùng luôn, không chú thích).\n`;
  } else if (sectionType === 'viral_clip') {
    userPrompt += `\`<<<SECTION: VIRAL_CLIP>>>\` - Viết Kịch bản Viral Video (${config.duration}). \n   - FORMAT: Bắt buộc dùng Bảng Markdown (Table) 4 cột: Thời lượng/Nội dung chính | Visual | Audio (Voice-over) | Text. (Chỉ kịch bản, không nhận xét, không đếm từ).\n`;
  } else if (sectionType === 'mutex_video') {
    userPrompt += `\`<<<SECTION: MUTEX_VIDEO>>>\` - Viết Kịch bản Mutex Video (${config.duration}). \n   - FORMAT: Bắt buộc dùng Bảng Markdown (Table) 4 cột: Thời lượng/Nội dung chính | Visual | Audio (Nhạc nền/Voice) | Text. (Chỉ kịch bản, không nhận xét, không đếm từ).\n`;
  } else if (sectionType === 'editorial') {
    const group = MEDIA_GROUPS[config.mediaGroup];
    // Pass input body to calculate word count constraint
    const instructions = getEditorialInstructions(group.label, config.editPercent, inputData.body);
    userPrompt += `\`<<<SECTION: EDITORIAL>>>\` - Viết lại Bài Editorial (${group.label}), Tone: ${group.desc}.${instructions}\n`;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: userPrompt,
      config: { 
          systemInstruction: getSystemInstruction(), 
          temperature: 0.85, 
          // Explicitly set a high output limit to avoid truncation
          maxOutputTokens: 8192 
      }, 
    });
    
    // Clean up the tag if AI returns it, we just want the content
    let text = response.text || "";
    const tagRegex = /<<<SECTION: [A-Z_]+>>>\s*/;
    return text.replace(tagRegex, '').trim();
  } catch (error) {
    console.error("Gemini Single Error:", error);
    throw error;
  }
};
