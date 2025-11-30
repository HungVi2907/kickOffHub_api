import { DataTypes } from 'sequelize'
import sequelize from '../common/db.js'

export async function ensurePostImageColumn() {
  const queryInterface = sequelize.getQueryInterface()
  let tableDefinition

  try {
    tableDefinition = await queryInterface.describeTable('posts')
  } catch (error) {
    console.error('Không thể kiểm tra cấu trúc bảng posts:', error)
    throw error
  }

  if (tableDefinition.image_url) {
    return false
  }

  try {
    await queryInterface.addColumn('posts', 'image_url', {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    })
    console.log('Đã bổ sung cột image_url cho bảng posts.')
    return true
  } catch (error) {
    if (error.original?.code === 'ER_DUP_FIELDNAME') {
      console.warn('Cột image_url đã tồn tại, bỏ qua.')
      return false
    }
    throw error
  }
}
