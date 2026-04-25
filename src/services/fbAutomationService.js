const puppeteer = require('puppeteer');
const otplib = require('otplib');
const fs = require('fs');
const path = require('path');

/**
 * Dịch vụ tự động hóa Facebook: Đăng nhập và lấy Access Token
 */
async function loginAndGetToken(uid, password, twoFactorSecret) {
  console.log(`[Automation] Đang chuẩn bị đăng nhập. Độ dài mật khẩu nhận được: ${password ? password.length : 0} ký tự.`);
  
  const browser = await puppeteer.launch({
    headless: true, // Bật lại cửa sổ để theo dõi
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-notifications',
      '--window-size=1280,800',
      '--lang=en-US,en'
    ],
  });

  const page = await browser.newPage();
  
  // Thiết lập User Agent để tránh bị nhận diện là bot đơn giản
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

  // Hàm gõ phím như người thật (ngẫu nhiên 100-250ms mỗi phím)
  const humanType = async (text) => {
    for (const char of text) {
      await page.keyboard.type(char, { delay: Math.floor(Math.random() * 150) + 100 });
    }
  };

  try {
    console.log(`[Automation] Đang truy cập Facebook...`);
    await page.goto('https://www.facebook.com', { waitUntil: 'networkidle2' });

    // Đợi ô nhập email xuất hiện (hỗ trợ nhiều loại giao diện)
    console.log('[Automation] Đang tìm ô đăng nhập...');
    const emailSelector = await Promise.race([
      page.waitForSelector('#email', { visible: true, timeout: 15000 }).then(() => '#email'),
      page.waitForSelector('input[name="email"]', { visible: true, timeout: 15000 }).then(() => 'input[name="email"]'),
      page.waitForSelector('[data-testid="royal_email"]', { visible: true, timeout: 15000 }).then(() => '[data-testid="royal_email"]')
    ]).catch(() => null);

    if (!emailSelector) {
      const screenshotPath = path.join(process.cwd(), 'error_login_page.png');
      await page.screenshot({ path: screenshotPath });
      throw new Error(`Không tìm thấy ô nhập Email. Đã chụp ảnh màn hình lỗi tại: ${screenshotPath}`);
    }

    // Điền thông tin đăng nhập
    await page.click(emailSelector).catch(() => {});
    await humanType(uid);
    await new Promise(r => setTimeout(r, 800)); // Nghỉ ngắn
    
    const passSelector = (await page.$('#pass')) ? '#pass' : 'input[name="pass"]';
    await page.click(passSelector).catch(() => {});
    await humanType(password);
    
    console.log('[Automation] Đang nghỉ 3 giây trước khi nhấn đăng nhập...');
    // Nhấn Enter để đăng nhập
    await new Promise(r => setTimeout(r, 2000));
    await page.keyboard.press('Enter');
    
    // Đợi phản hồi nhanh
    await new Promise(r => setTimeout(r, 1000));

    // Đợi xem trang tiếp theo là gì
    const nextStep = await Promise.race([
      page.waitForSelector('#approvals_code', { visible: true, timeout: 15000 }).then(() => '2FA'),
      page.waitForSelector('input[name="approvals_code"]', { visible: true, timeout: 15000 }).then(() => '2FA'),
      page.waitForSelector('input[autocomplete="one-time-code"]', { visible: true, timeout: 15000 }).then(() => '2FA'),
      page.waitForSelector('input[type="text"]', { visible: true, timeout: 15000 }).then(() => '2FA'),
      page.waitForSelector('input', { visible: true, timeout: 15000 }).then(() => '2FA'),
      page.waitForSelector('#checkpointSubmitButton', { visible: true, timeout: 15000 }).then(() => 'CHECKPOINT'),
      page.waitForSelector('[aria-label="Facebook"], [data-testid="left_nav_item_Welcome"], #fb_notifications_badge', { visible: true, timeout: 15000 }).then(() => 'HOME'),
    ]).catch(() => 'UNKNOWN');

    console.log(`[Automation] Nhận diện bước tiếp theo: ${nextStep}. URL hiện tại: ${page.url()}`);

    // Kiểm tra kỹ hơn bằng cách quét nội dung trang, URL và sự tồn tại của ô input
    const isActually2FA = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      const url = window.location.href.toLowerCase();
      const hasInput = document.querySelectorAll('input').length > 0;
      return url.includes('two_factor') || 
             url.includes('checkpoint') ||
             text.includes('authentication') || 
             text.includes('xác thực') ||
             text.includes('6-digit') ||
             text.includes('mã xác nhận') ||
             hasInput;
    });

    if (nextStep === '2FA' || nextStep === 'CHECKPOINT' || isActually2FA) {
      console.log('[Automation] Xác nhận trang 2FA/Xác minh. Đang chuẩn bị điền mã...');
      const authObj = otplib.authenticator || otplib.totp || otplib;
      const cleanSecret = (twoFactorSecret || "").replace(/\s/g, '').toUpperCase();
      
      if (!cleanSecret) {
        throw new Error('Secret Key 2FA bị trống.');
      }
      
      console.log(`[Automation] Đang tạo mã 2FA từ Secret: ${cleanSecret.substring(0, 4)}...`);
      
      let token2fa = '';
      try {
        // Tự động tìm hàm tạo mã phù hợp với phiên bản thư viện
        if (typeof authObj.generate === 'function') {
          token2fa = authObj.generate(cleanSecret);
        } else if (typeof authObj.token === 'function') {
          token2fa = authObj.token(cleanSecret);
        } else if (otplib.totp && typeof otplib.totp.generate === 'function') {
          token2fa = otplib.totp.generate(cleanSecret);
        } else {
          throw new Error('Không tìm thấy hàm tạo mã phù hợp.');
        }

        if (token2fa instanceof Promise) token2fa = await token2fa;
      } catch (err) {
        // Fallback cho một số phiên bản đặc biệt
        try {
          token2fa = (authObj.generate || authObj.token).call(authObj, { secret: cleanSecret });
          if (token2fa instanceof Promise) token2fa = await token2fa;
        } catch (err2) {
          throw new Error('Thất bại khi tạo mã 2FA từ Secret Key.');
        }
      }
      
      await new Promise(r => setTimeout(r, 500));

      // Đợi trang 2FA ổn định hoàn toàn
      await page.waitForFunction(() => document.querySelectorAll('input').length > 0, { timeout: 10000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));

      let fillSuccess = false;
      for (let retry = 0; retry < 3; retry++) {
        try {
          const inputSelector = 'input[aria-label*="Code"], input[aria-label*="Mã"], input[name="approvals_code"], input[type="text"]';
          // Dò tìm ô input thực sự đang hiển thị
          const finalSelector = await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input'));
            const visibleInput = inputs.find(i => {
              const rect = i.getBoundingClientRect();
              return i.type !== 'hidden' && rect.width > 0 && rect.height > 0;
            });
            if (visibleInput) {
              visibleInput.setAttribute('data-real-2fa-input', 'true');
              return '[data-real-2fa-input="true"]';
            }
            return null;
          });

          const sel = finalSelector || inputSelector;
          await page.focus(sel).catch(() => {});
          await page.click(sel, { clickCount: 3 }).catch(() => {});
          await page.keyboard.press('Backspace');
          
          console.log(`[Automation] Đang gõ mã 2FA (Lần thử ${retry + 1}): ${token2fa}`);
          await humanType(token2fa);
          
          // Kiểm tra xem đã gõ thành công chưa
          const val = await page.evaluate((s) => document.querySelector(s)?.value, sel);
          if (val && val.length >= 6) {
            fillSuccess = true;
          } else {
            // Dự phòng đổ trực tiếp
            await page.evaluate((s, v) => {
              const el = document.querySelector(s);
              if (el) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }
            }, sel, token2fa);
            fillSuccess = true;
          }
          
          if (fillSuccess) {
            // Nhấn nút Continue
            console.log('[Automation] Đang nhấn nút gửi mã 2FA...');
            const submitBtnSelector = await page.evaluate(() => {
              const btns = Array.from(document.querySelectorAll('button, div[role="button"], span, input[type="submit"]'));
              const target = btns.find(b => {
                const t = (b.innerText || b.value || "").toLowerCase();
                return t.includes('continue') || t.includes('tiếp tục') || t.includes('xác nhận') || t.includes('gửi');
              });
              if (target) {
                target.setAttribute('data-submit-2fa', 'true');
                return '[data-submit-2fa="true"]';
              }
              return null;
            });

            if (submitBtnSelector) {
              await page.click(submitBtnSelector).catch(() => {});
            } else {
              await page.keyboard.press('Enter');
            }
            
            // Đợi phản hồi lâu hơn một chút (5 giây)
            await new Promise(r => setTimeout(r, 5000));
            
            // Kiểm tra xem thực sự đã thoát khỏi trang 2FA chưa
            const isStillOn2FA = await page.evaluate(() => {
              const text = document.body.innerText.toLowerCase();
              return text.includes('authentication') || text.includes('xác thực') || text.includes('6-digit') || text.includes('mã xác nhận');
            });

            if (!isStillOn2FA) {
              fillSuccess = true;
              break; 
            } else {
              console.log('[Automation Warning] Facebook vẫn ở trang 2FA (có thể mã sai hoặc lỗi nhấn nút). Đang thử lại...');
            }
          }
        } catch (e) {
          console.log(`[Automation Warning] Lỗi khi điền mã 2FA (Lần ${retry + 1}): ${e.message}. Đang thử lại...`);
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      console.log('[Automation] Đang xử lý các bước xác minh phụ (Lưu trình duyệt, Tin cậy)...');
      for (let i = 0; i < 8; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const currentUrl = page.url();
        if (currentUrl.includes('home.php') || currentUrl.includes('facebook.com/?') || currentUrl.includes('facebook.com/home')) {
           console.log('[Automation] Đã nhận diện thấy URL Trang chủ!');
           break;
        }

        const buttonPoint = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('button, [role="button"], div, span'));
          const target = elements.find(el => {
            const t = (el.innerText || "").toLowerCase().trim();
            return t.includes('trust this device') || t.includes('tin cậy thiết bị') || 
                   t.includes('continue') || t.includes('tiếp tục') || 
                   t.includes('save browser') || t.includes('lưu trình duyệt') ||
                   t.includes('ok') || t.includes('yes');
          });
          
          if (target) {
            const rect = target.getBoundingClientRect();
            return {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              text: target.innerText
            };
          }
          return null;
        }).catch(() => null);

        if (buttonPoint && buttonPoint.x > 0 && buttonPoint.y > 0) {
          console.log(`[Automation] Tìm thấy nút "${buttonPoint.text}", đang nhấn...`);
          await page.mouse.click(buttonPoint.x, buttonPoint.y);
          await new Promise(r => setTimeout(r, 1000));
        } else {
          // Thử nhấn Enter làm phương án cuối cho mỗi lần quét
          await page.keyboard.press('Enter').catch(() => {});
          
          const isHome = await page.$('[aria-label="Facebook"], #fb_notifications_badge, [data-testid="left_nav_item_Welcome"]').catch(() => null);
          if (isHome) {
            console.log('[Automation] Đã vào được Trang chủ!');
            break;
          }
        }
      }
    }

    // KIỂM TRA ĐĂNG NHẬP (BẮT BUỘC)
    console.log('[Automation] Đang xác nhận trạng thái đăng nhập...');
    const loggedInIndicator = await page.waitForSelector('[aria-label="Facebook"], [data-testid="left_nav_item_Welcome"], #fb_notifications_badge', { visible: true, timeout: 20000 })
      .catch(() => null);

    if (!loggedInIndicator) {
      const screenshotPath = path.join(process.cwd(), 'error_login_failed.png');
      await page.screenshot({ path: screenshotPath });
      throw new Error(`Đăng nhập thất bại hoặc kẹt ở bước xác minh. Hãy xem ảnh: ${screenshotPath}`);
    }

    // 4. Lấy Access Token từ Ads Manager (Cách bền bỉ nhất)
    console.log('[Automation] Đăng nhập thành công! Đang lấy Access Token từ Ads Manager...');
    
    let accessToken = null;
    const adsUrl = 'https://www.facebook.com/adsmanager/manage/campaigns';
    
    try {
      console.log(`[Automation] Đang truy cập Ads Manager: ${adsUrl}`);
      await page.goto(adsUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      // Trích xuất token từ cửa sổ window hoặc mã nguồn
      accessToken = await page.evaluate(() => {
        // Cách 1: Tìm trong biến window
        if (window.__accessToken) return window.__accessToken;
        
        // Cách 2: Tìm trong toàn bộ mã nguồn bằng Regex
        const html = document.documentElement.innerHTML;
        const match = html.match(/accessToken="(EAA[a-zA-Z0-9]+)"/) || 
                      html.match(/access_token:"(EAA[a-zA-Z0-9]+)"/) ||
                      html.match(/"accessToken":"(EAA[a-zA-Z0-9]+)"/);
        return match ? match[1] : null;
      });

      if (!accessToken) {
        console.log('[Automation] Không thấy token trong Ads Manager, thử quét lại toàn trang...');
        const content = await page.content();
        const matches = content.match(/EAA[a-zA-Z0-9]+/g);
        if (matches) {
          const validTokens = matches.filter(t => t.length > 100);
          if (validTokens.length > 0) accessToken = validTokens[0];
        }
      }
    } catch (e) {
      console.log(`[Automation Error] Lỗi khi truy cập Ads Manager: ${e.message}`);
    }

    if (!accessToken) {
      const screenshotPath = path.join(process.cwd(), 'error_token_extraction.png');
      await page.screenshot({ path: screenshotPath });
      throw new Error(`Đã đăng nhập thành công nhưng không thể trích xuất Access Token từ Ads Manager.`);
    }

    console.log('[Automation] Chúc mừng! Đã lấy được Access Token thành công.');
    return accessToken;

  } catch (error) {
    console.error(`[Automation Error] ${error.message}`);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = {
  loginAndGetToken,
};
