# Kick Off Hub Back-End API

Đây là một RESTful API được xây dựng bằng Node.js, Express, Sequelize ORM và MySQL để quản lý các entities: Users, Countries, Leagues, Venues, Teams.

## Cấu trúc dự án

```
# Kick Off Hub Back-End API

Ngắn gọn: RESTful API cho quản lý Users, Countries, Leagues, Venues, Teams — xây dựng bằng Node.js, Express và Sequelize (MySQL).

Phiên bản repo: branch `main` (CommonJS và ES modules tồn tại trong repo; kiểm tra file entry khi khởi động).

## Nội dung chính

- Node.js, Express
- Sequelize ORM (MySQL)
- Một số helpers để đồng bộ dữ liệu từ API-Football (api-sports)

## Cấu trúc dự án (tóm tắt)

src/
- config/         # database config (Sequelize + legacy MySQL2)
- controllers/    # business logic (countries, leagues, teams, venues ...)
- models/         # Sequelize models (Team, Venue, Country...)
- routes/         # Express routers
- utils/          # helpers, fetchApiFootball

## Cài đặt nhanh (Windows / PowerShell)

1. Cài Node.js và MySQL
2. Tạo file `.env` dựa trên `.env.example` (nếu có). Ví dụ tối thiểu:

```powershell
$env:DB_HOST="localhost"
$env:DB_USER="root"
$env:DB_PASSWORD="your_password"
$env:DB_NAME="kickoff_hub"
$env:DB_PORT="3306"
$env:API_FOOTBALL_KEY="your_api_key_here"
```

3. Cài dependencies:

```powershell
npm install
```

4. Chạy server (dev):

```powershell
npm run dev
```

Server mặc định lắng nghe `http://localhost:3000` (kiểm tra `server.js` để xác nhận PORT).

## Các biến môi trường quan trọng

- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT — cho kết nối MySQL/Sequelize
- API_FOOTBALL_KEY — API key cho api-sports (đặt trong `.env`)

Lưu ý: KHÔNG commit `.env` hoặc keys lên GitHub. Nếu lỡ push, hãy rotate (thay) keys ngay.

## Các endpoint chính (tập trung vào Teams)

Teams
- GET /api/teams — lấy tất cả teams
- GET /api/teams/:id — thông tin team theo id
- GET /api/teams/league/:leagueID?season=2023 — fetch teams từ API theo league (passthrough)
- POST /api/teams — tạo team
- PUT /api/teams/:id — cập nhật
- DELETE /api/teams/:id — xóa
- POST /api/teams/import — import teams từ league (body: { leagueId, season })
- GET /api/teams/:name/search?limit=20 — tìm kiếm theo tên (kí tự, trả về tối đa limit)
- GET /api/teams/:teamId/stats?season=2023&league=39 — lấy thống kê từ API-Football (teamId trong path)

Đặc biệt: route `GET /api/teams/:teamId/stats` đã thiết kế để tránh xung đột với `/:id` generic bằng cách đặt `stats` ở vị trí sau `:teamId`.

## Ví dụ gọi stats

```powershell
# Lấy thống kê cho team 33 mùa 2023
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/teams/33/stats?season=2023&league=39" -Headers @{ "x-apisports-key" = "your_api_key_here" }
```

Hoặc dùng curl:

```bash
curl "http://localhost:3000/api/teams/33/stats?season=2023&league=39"
```

## Git / bảo mật — nếu lỡ push secrets

1. Thêm `.gitignore` (đã có sẵn trong repo) để exclude `node_modules/`, `.env`, v.v.
2. Xóa các file nhạy cảm khỏi repo history (nếu cần):

```powershell
git rm --cached .env
git commit -m "Remove env from tracking"
git push origin main
```

3. Nếu `.env` hoặc key đã được push trong commit trước đó, bạn cần: rotate các API keys/credentials và (tuỳ chọn) rewrite history (ví dụ `git filter-branch` hoặc `git filter-repo`) — LƯU Ý: rewrite history cần thận trọng khi repo có nhiều cộng tác viên.

## Troubleshooting nhanh

- Nếu endpoint trả về `team` NaN, kiểm tra bạn đang gọi endpoint với `teamId` trong path (`/api/teams/:teamId/stats`) chứ không phải `?teamId=` query.
- Kiểm tra `process.env.API_FOOTBALL_KEY` đã set chưa
- Kiểm tra logs khi server khởi động: `npm run dev` và xem lỗi syntax nếu có

## Ghi chú kỹ thuật & next steps

- Có một số phần legacy dùng MySQL2 (db.js) và một số đã được migrate sang Sequelize — nên dọn dẹp dần để tránh nhầm lẫn.
- Có các controller sync (venues, teams, leagues) sử dụng batch processing để tránh rate limit API — bạn có thể tùy chỉnh batch size và delay qua query/body params.

---