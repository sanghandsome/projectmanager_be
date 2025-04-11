import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS'); // Đúng key từ .env

    console.log('MAIL CONFIG:', { host, port, user });

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // Port 465 -> true, còn lại false
      auth: { user, pass },
    });
  }

  // Gửi email chung
  async sendMail(to: string, subject: string, text: string, html?: string) {
    const mailOptions = {
      from: this.configService.get<string>('MAIL_USER'),
      to,
      subject,
      text,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.response);
      return { message: 'Email sent successfully!', info };
    } catch (error) {
      console.error('❌ Error sending email:', error.message);
      throw new Error('Lỗi khi gửi email: ' + error.message);
    }
  }

  //Thông báo người dùng được thêm vào team
  async sendUserAddedNotification(
    to: string,
    full_name: string,
    team_name: string,
  ) {
    const subject = 'Thông báo: Người dùng mới đã được thêm vào hệ thống';
    const text = `Xin chào,\n\nNgười dùng có tên là ${full_name} đã được thêm vào hệ thống thành công.\n\nNếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này.\n\nCảm ơn`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4CAF50;">Thông báo: Bạn đã được thêm vào nhóm ${team_name}</h2>
        <p>Xin chào,</p>
        <p>Bạn  
          <strong style="color: blue; font-size: 20px;">${full_name}</strong> 
          đã được thêm vào nhóm ${team_name}.
        </p>
        <hr style="border: 0; height: 1px; background: #ccc;">
        <p style="font-size: 12px; color: #777;">Đây là email tự động, vui lòng không trả lời.</p>
        <p style="font-size: 12px; color: #777;">Cần hỗ trợ? Liên hệ: <a href="mailto:nguyendanhsanghandsome@gmail.com">nguyendanhsanghandsome@gmail.com</a></p>
      </div>
    `;

    return this.sendMail(to, subject, text, html);
  }

  //Thông báo người dùng bị xóa khỏi team
  async sendUserDeletedNotification(
    to: string,
    full_name: string,
    teamName: string,
  ) {
    const subject = 'Thông báo: Bạn đã bị xóa khỏi nhóm';
    const text = `Xin chào,\n\n ${full_name} đã bị xóa khỏi hệ thống thành công.\n\nNếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này.\n\nCảm ơn`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #F44336;">Thông báo: Bạn đã bị xóa khỏi nhóm ${teamName}</h2>
        <p>Xin chào,</p>
        <p>Người dùng có tên là 
          <strong style="color: blue; font-size: 20px;">${full_name}</strong> 
          đã bị xóa khỏi hệ thống thành công.
        </p>
        <hr style="border: 0; height: 1px; background: #ccc;">
        <p style="font-size: 12px; color: #777;">Đây là email tự động, vui lòng không trả lời.</p>
        <p style="font-size: 12px; color: #777;">Cần hỗ trợ? Liên hệ: <a href="mailto:nguyendanhsanghandsome@gmail.com">nguyendanhsanghandsome@gmail.com</a></p>
      </div>
    `;

    return this.sendMail(to, subject, text, html);
  }

  //Thông báo giao việc
  async sendTaskAssignedNotification(
    to: string,
    userName: string,
    taskName: string,
  ) {
    const subject = 'Thông báo: Bạn đã được giao việc';
    const text = `Xin chào,\n\nNgười dùng có tên là ${userName} đã được giao công việc: ${taskName}.\n\nNếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này.\n\nCảm ơn`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4CAF50;">Thông báo: Bạn đã được giao việc</h2>
        <p>Xin chào,</p>
        <p>Người dùng có tên là 
          <strong style="color: blue; font-size: 20px;">${userName}</strong> 
          đã được giao công việc: 
          <strong style="color: blue; font-size: 20px;">${taskName}</strong>.
        </p>
        <hr style="border: 0; height: 1px; background: #ccc;">
        <p style="font-size: 12px; color: #777;">Đây là email tự động, vui lòng không trả lời.</p>
        <p style="font-size: 12px; color: #777;">Cần hỗ trợ? Liên hệ: <a href="mailto:nguyendanhsanghandsome@gmail.com">nguyendanhsanghandsome@gmail.com</a></p>
      </div>
    `;

    return this.sendMail(to, subject, text, html);
  }

  //Thông báo sắp hết thời gian công việc
  async sendTaskDeadlineReminder(
    to: string,
    userName: string,
    taskName: string,
    dueDate: Date,
  ) {
    const subject = 'Thông báo: Sắp đến hạn nộp công việc';
    const text = `Xin chào,\n\nNgười dùng có tên là ${userName} đã được giao công việc: ${taskName}. Hạn nộp công việc là: ${dueDate.toLocaleString()}.\n\nVui lòng hoàn thành công việc trước khi hết hạn.\n\nNếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này.\n\nCảm ơn`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #FF9800;">Thông báo: Sắp đến hạn nộp công việc</h2>
        <p>Xin chào,</p>
        <p>Người dùng có tên là 
          <strong style="color: blue; font-size: 20px;">${userName}</strong> 
          đã được giao công việc: 
          <strong style="color: blue; font-size: 20px;">${taskName}</strong>.
        </p>
        <p>Hạn nộp công việc là: 
          <strong style="color: red; font-size: 20px;">${dueDate.toLocaleString()}</strong>.
        </p>
        <p>Vui lòng hoàn thành công việc trước khi hết hạn.</p>
        <hr style="border: 0; height: 1px; background: #ccc;">
        <p style="font-size: 12px; color: #777;">Đây là email tự động, vui lòng không trả lời.</p>
        <p style="font-size: 12px; color: #777;">Cần hỗ trợ? Liên hệ: <a href="mailto:nguyendanhsanghandsome@gmail.com">nguyendanhsanghandsome@gmail.com</a></p>
      </div>
    `;

    return this.sendMail(to, subject, text, html);
  }

  //Thông báo đến hạn bàn giao công việc
  async sendTaskHandOverReminder(
    to: string,
    userName: string,
    taskName: string,
    dueDate: Date,
  ) {
    const subject = 'Thông báo: Đến hạn bàn giao công việc';
    const text = `Xin chào,\n\nNgười dùng có tên là ${userName} đã được giao công việc: ${taskName}. Hạn bàn giao công việc là: ${dueDate.toLocaleString()}.\n\nVui lòng hoàn thành và bàn giao công việc trước khi hết hạn.\n\nNếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này.\n\nCảm ơn`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #FF5722;">Thông báo: Đến hạn bàn giao công việc</h2>
        <p>Xin chào,</p>
        <p>Người dùng có tên là 
          <strong style="color: blue; font-size: 20px;">${userName}</strong> 
          đã được giao công việc: 
          <strong style="color: blue; font-size: 20px;">${taskName}</strong>.
        </p>
        <p>Hạn bàn giao công việc là: 
          <strong style="color: red; font-size: 20px;">${dueDate.toLocaleString()}</strong>.
        </p>
        <p>Vui lòng hoàn thành và bàn giao công việc trước khi hết hạn.</p>
        <hr style="border: 0; height: 1px; background: #ccc;">
        <p style="font-size: 12px; color: #777;">Đây là email tự động, vui lòng không trả lời.</p>
        <p style="font-size: 12px; color: #777;">Cần hỗ trợ? Liên hệ: <a href="mailto:nguyendanhsanghandsome@gmail.com">nguyendanhsanghandsome@gmail.com</a></p>
      </div>
    `;

    return this.sendMail(to, subject, text, html);
  }

  //Thông báo đến leader người dùng này đa hoàn thành công việc
  async sendTaskCompletionNotificationToLeader(
    to: string,
    userName: string,
    taskName: string,
  ) {
    const subject = 'Thông báo: Người dùng đã hoàn thành công việc';
    const text = `Xin chào,\n\nNgười dùng có tên là ${userName} đã hoàn thành công việc: ${taskName} thành công.\n\nNếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này.\n\nCảm ơn`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4CAF50;">Thông báo: Người dùng đã hoàn thành công việc</h2>
        <p>Xin chào,</p>
        <p>Người dùng có tên là 
          <strong style="color: blue; font-size: 20px;">${userName}</strong> 
          đã hoàn thành công việc: 
          <strong style="color: blue; font-size: 20px;">${taskName}</strong> 
          thành công.
        </p>
        <hr style="border: 0; height: 1px; background: #ccc;">
        <p style="font-size: 12px; color: #777;">Đây là email tự động, vui lòng không trả lời.</p>
        <p style="font-size: 12px; color: #777;">Cần hỗ trợ? Liên hệ: <a href="mailto:nguyendanhsanghandsome@gmail.com">nguyendanhsanghandsome@gmail.com</a></p>
      </div>
    `;

    return this.sendMail(to, subject, text, html);
  }

  //Thông báo send OTP
  async sendOtp(to: string, otp: string) {
    const subject = 'Xác thực đăng nhập - Mã OTP của bạn';
    const text = `Xin chào tôi là sanghandsome người đẹp trai nhất thế gian này,\n\nMã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút.\n\nNếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.\n\nCảm ơn`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4CAF50;">Mã OTP của bạn</h2>
        <p>Xin chào,</p>
        <p>Mã OTP của bạn để xác thực đăng nhập là: 
          <strong style="color: blue; font-size: 20px;">${otp}</strong>
        </p>
        <p>Mã này có hiệu lực trong <strong>5 phút</strong>.</p>
        <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        <hr style="border: 0; height: 1px; background: #ccc;">
        <p style="font-size: 12px; color: #777;">Đây là email tự động, vui lòng không trả lời.</p>
        <p style="font-size: 12px; color: #777;">Cần hỗ trợ? Liên hệ: <a href="mailto:nguyendanhsanghandsome@gmail.com">nguyendanhsanghandsome@gmail.com</a></p>
      </div>
    `;

    return this.sendMail(to, subject, text, html);
  }

  //Thông báo khi đổi mật khẩu
  async sendPasswordChangeNotification(to: string) {
    const subject = 'Thông báo đổi mật khẩu tài khoản';
    const text = `Xin chào tôi là sanghandsome người đẹp trai nhất thế gian này,\n\nTài khoản của bạn vừa được đổi mật khẩu thành công. Nếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay lập tức.\n\nCảm ơn`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4CAF50;">Mật khẩu đã được thay đổi</h2>
        <p>Xin chào,</p>
        <p>Chúng tôi thông báo rằng mật khẩu tài khoản của bạn đã được thay đổi thành công.</p>
        <p>Nếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay lập tức để đảm bảo an toàn cho tài khoản của bạn.</p>
        <hr style="border: 0; height: 1px; background: #ccc;">
        <p style="font-size: 12px; color: #777;">Đây là email tự động, vui lòng không trả lời.</p>
        <p style="font-size: 12px; color: #777;">Cần hỗ trợ? Liên hệ: <a href="mailto:nguyendanhsanghandsome@gmail.com">nguyendanhsanghandsome@gmail.com</a></p>
      </div>
    `;

    return this.sendMail(to, subject, text, html);
  }

  // Chào mừng
  async sendWelcomeNotification(to: string) {
    const subject = 'Chào mừng bạn đến với WehaGroup!';
    const text = `Xin chào,\n\nChào mừng bạn đến với WehaGroup – cộng đồng quản lý dự án chuyên nghiệp.\n\nHãy bắt đầu hành trình phát triển và hợp tác hiệu quả cùng đội nhóm của bạn tại đây.\n\nNếu bạn cần bất kỳ hỗ trợ nào, đừng ngần ngại liên hệ với chúng tôi.\n\nCảm ơn bạn đã tin tưởng!`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4CAF50;">🎉 Chào mừng đến với WehaGroup!</h2>
        <p>Xin chào,</p>
        <p>Chúc mừng bạn đã trở thành một phần của <strong>WehaGroup</strong> – nền tảng hỗ trợ quản lý dự án và làm việc nhóm chuyên nghiệp.</p>
        <p>Hãy khám phá các tính năng, xây dựng đội nhóm, và bắt đầu hành trình phát triển cùng chúng tôi.</p>
        <ul>
          <li>Quản lý dự án hiệu quả</li>
          <li>Giao tiếp và phân công rõ ràng</li>
          <li>Hợp tác mọi lúc, mọi nơi</li>
        </ul>
        <p>Nếu bạn có bất kỳ câu hỏi nào, hãy liên hệ với chúng tôi qua email hỗ trợ bên dưới.</p>
        <hr style="border: 0; height: 1px; background: #ccc;">
        <p style="font-size: 12px; color: #777;">Đây là email tự động, vui lòng không trả lời.</p>
        <p style="font-size: 12px; color: #777;">Cần hỗ trợ? Liên hệ: <a href="mailto:nguyendanhsanghandsome@gmail.com">nguyendanhsanghandsome@gmail.com</a></p>
      </div>
    `;

    return this.sendMail(to, subject, text, html);
  }

  //Thông báo cập nhật thành công
  async sendProfileUpdateNotification(to: string) {
    const subject = 'Thông báo cập nhật thông tin cá nhân';
    const text = `Xin chào,\n\nThông tin cá nhân của bạn đã được cập nhật thành công trên hệ thống WehaGroup.\n\nNếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức để đảm bảo an toàn cho tài khoản của bạn.\n\nTrân trọng,\nWehaGroup Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4CAF50;">✅ Thông tin cá nhân đã được cập nhật</h2>
        <p>Xin chào,</p>
        <p>Chúng tôi xác nhận rằng bạn vừa <strong>cập nhật thông tin cá nhân</strong> thành công trên hệ thống của <strong>WehaGroup</strong>.</p>
        <p>Nếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay lập tức để bảo vệ tài khoản của mình.</p>
        <hr style="border: 0; height: 1px; background: #ccc; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">Đây là email tự động, vui lòng không trả lời.</p>
        <p style="font-size: 12px; color: #777;">Cần hỗ trợ? Liên hệ: <a href="mailto:nguyendanhsanghandsome@gmail.com">nguyendanhsanghandsome@gmail.com</a></p>
      </div>
    `;

    return this.sendMail(to, subject, text, html);
  }
}
