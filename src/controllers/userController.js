import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { matchedData } from 'express-validator';
import User from '../models/User.js';

// Controller cho User
class UserController {
  // Lấy danh sách tất cả users
  static async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy danh sách users' });
    }
  }

  // Lấy thông tin một user theo ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const userId = Number.parseInt(id, 10);
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'ID user không hợp lệ' });
      }
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User không tồn tại' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy thông tin user' });
    }
  }

  // Thêm user mới
  static async createUser(req, res) {
    try {
      const { name, email } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Tên và email là bắt buộc' });
      }
      const user = await User.create({ name, email });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi thêm user' });
    }
  }

  // Cập nhật user
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userId = Number.parseInt(id, 10);
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'ID user không hợp lệ' });
      }
      const { name, email } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Tên và email là bắt buộc' });
      }
      const [affectedRows] = await User.update(
        { name, email },
        { where: { id: userId } }
      );
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'User không tồn tại' });
      }
      res.json({ id: userId, name, email });
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi cập nhật user' });
    }
  }

  // Xóa user
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const userId = Number.parseInt(id, 10);
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'ID user không hợp lệ' });
      }
      const deleted = await User.destroy({ where: { id: userId } });
      if (deleted === 0) {
        return res.status(404).json({ error: 'User không tồn tại' });
      }
      res.json({ message: 'User đã được xóa thành công' });
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi xóa user' });
    }
  }
  // Đăng ký
  static async register(req, res) {
    try {
      const { name, email, password } = matchedData(req, { locations: ['body'] });
      if (!name || !email || !password) return res.status(400).json({ error: 'Thiếu name/email/password' });

      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ error: 'Email đã được sử dụng' });

      const user = await User.create({ name, email, password });
      // thanks to defaultScope/toJSON, response không chứa password
      res.status(201).json({ user });
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi đăng ký', details: err.message });
    }
  }

  // Đăng nhập
  static async login(req, res) {
    try {
      const { email, password } = matchedData(req, { locations: ['body'] });
      if (!email || !password) return res.status(400).json({ error: 'Thiếu email/password' });

      const user = await User.scope(null).findOne({ where: { email } }); // scope(null) để lấy password
      if (!user) return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });

      const payload = { id: user.id, email: user.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

      res.json({ token, user: user.toJSON() });
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi đăng nhập', details: err.message });
    }
  }
}

export default UserController;