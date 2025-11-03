# Kick Off Hub Back-End API

Đây là một RESTful API được xây dựng bằng Node.js, Express, Sequelize ORM và MySQL để quản lý các entities: Users, Countries, Leagues, Venues, Teams.

## Cấu trúc dự án

```
Back_End/
├── .env
├── node_modules/
├── package-lock.json
├── package.json
├── README.md
├── server.js
├── create_table.sql
└── src/
    ├── app.js
    ├── config/
    │   ├── database.js  # Sequelize config
    │   └── db.js        # Legacy MySQL2 (deprecated)
    ├── controllers/
    │   ├── countriesController.js
    │   ├── leaguesController.js
    │   ├── teamsController.js
    │   ├── userController.js
    │   └── venuesController.js
    ├── middlewares/
    ├── models/
    │   ├── Country.js     # Sequelize model
    │   ├── League.js      # Sequelize model
    │   ├── Team.js        # Sequelize model
    │   ├── Venue.js       # Sequelize model
    │   ├── countryModel.js  # Legacy MySQL2 (deprecated)
    │   ├── leagueModel.js   # Legacy MySQL2 (deprecated)
    │   ├── teamModel.js     # Legacy MySQL2 (deprecated)
    │   ├── userModel.js     # Legacy MySQL2 (deprecated)
    │   └── venueModel.js    # Legacy MySQL2 (deprecated)
    ├── routes/
    │   ├── countries.js
    │   ├── leagues.js
    │   ├── teams.js
    │   ├── test.js
    │   ├── userRoutes.js
    │   └── venues.js
    └── utils/
        └── fetchApiFootball.js
```
        └── userRoutes.js
```

## Cài đặt

1. Đảm bảo bạn đã cài đặt Node.js và MySQL.

2. Sao chép file `.env` và cập nhật thông tin kết nối MySQL của bạn:

   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=kickoff_hub
   DB_PORT=3306
   ```

3. Chạy file `create_table.sql` để tạo database và bảng trong MySQL:

   Mở MySQL command line hoặc công cụ quản lý MySQL (như phpMyAdmin, MySQL Workbench), và chạy các lệnh trong file `create_table.sql`. File này sẽ:
   - Tạo database `kickoff_hub` (nếu chưa có)
   - Tạo bảng `users` với các trường phù hợp
   - Thêm một số dữ liệu mẫu để test

4. Cài đặt dependencies:

   ```
   npm install
   ```

   **Lưu ý:** Dự án sử dụng Sequelize ORM để tương tác với MySQL. Database sẽ được tự động sync khi server khởi động.

## Chạy ứng dụng

- Chạy ở chế độ production: `npm start`
- Chạy ở chế độ development (với nodemon): `npm run dev`

Server sẽ chạy trên `http://localhost:3000`.

## API Endpoints

### Users

- `GET /api/users` - Lấy danh sách tất cả users
- `GET /api/users/:id` - Lấy thông tin một user theo ID
- `POST /api/users` - Thêm user mới (body: { "name": "string", "email": "string" })
- `PUT /api/users/:id` - Cập nhật user theo ID (body: { "name": "string", "email": "string" })
- `DELETE /api/users/:id` - Xóa user theo ID

### Countries

- `GET /api/countries` - Lấy danh sách tất cả countries
- `GET /api/countries/:id` - Lấy thông tin một country theo ID
- `POST /api/countries` - Thêm country mới (body: { "name": "string", "code": "string", "flag": "string" })
- `PUT /api/countries/:id` - Cập nhật country theo ID
- `DELETE /api/countries/:id` - Xóa country theo ID
- `POST /api/countries/import` - Import countries từ API-Football

### Leagues

- `GET /api/leagues` - Lấy danh sách tất cả leagues
- `GET /api/leagues/:id` - Lấy thông tin một league theo ID
- `POST /api/leagues` - Thêm league mới (body: { "name": "string", "country": "string", "season": number })
- `PUT /api/leagues/:id` - Cập nhật league theo ID
- `DELETE /api/leagues/:id` - Xóa league theo ID
- `POST /api/leagues/import-teams` - Import teams và venues từ API-Football (body: { "leagueId": number, "season": number })

### Venues

- `GET /api/venues` - Lấy danh sách tất cả venues
- `GET /api/venues/:id` - Lấy thông tin một venue theo ID
- `POST /api/venues` - Thêm venue mới
- `PUT /api/venues/:id` - Cập nhật venue theo ID
- `DELETE /api/venues/:id` - Xóa venue theo ID
- `POST /api/venues/import` - Import venues từ API-Football (league=39, season=2023)

### Teams

- `GET /api/teams` - Lấy danh sách tất cả teams
- `GET /api/teams/:id` - Lấy thông tin một team theo ID
- `POST /api/teams` - Thêm team mới
- `PUT /api/teams/:id` - Cập nhật team theo ID
- `DELETE /api/teams/:id` - Xóa team theo ID
- `GET /api/teams/fetch?league=39&season=2023` - Fetch teams từ API-Football và lưu vào DB

## Ví dụ sử dụng

### Thêm user mới:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### Lấy danh sách users:

```bash
curl http://localhost:3000/api/users
```

## Cập nhật gần đây

✅ **Hoàn thành migration sang Sequelize ORM (2024)**
- Tất cả controllers đã được chuyển đổi từ MySQL2 sang Sequelize
- Các models Sequelize: `Country.js`, `League.js`, `Venue.js`, `Team.js`, `User.js`
- Database sẽ tự động sync khi server khởi động
- Cải thiện tính nhất quán và bảo trì code
- **Migration hoàn tất**: Không còn sử dụng MySQL2 models trong controllers