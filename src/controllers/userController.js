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
}

export default UserController;