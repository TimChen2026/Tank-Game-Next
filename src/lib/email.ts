import { Resend } from 'resend';

// ==================== 邮件服务工具函数 ====================
// 使用 Resend SDK 发送邮件
// API Key 配置在 .env.local 的 RESEND_API_KEY

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 发送欢迎邮件给新注册用户
 * @param userEmail 用户邮箱
 * @param userName 用户名
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
) {
  await resend.emails.send({
    from: 'TankGame <onboarding@resend.dev>',
    to: userEmail,
    subject: '你好，我是TankGame',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Hi ${userName}，欢迎来到TankGame！</h2>
        <p>我们设计了一个经典的坦克大战游戏，后面会持续更新，谢谢你的参与和关注。</p>
        <br/>
        <p>—— TankGame</p>
      </div>
    `,
  });
}
