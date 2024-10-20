const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')

// Tạo đường dẫn đến thư mục cần lưu file ảnh khi tải lên
const uploadDir = path.join(__dirname,'..', '..' , 'public', 'images', 'roomImg')

// Kiểm tra và tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir)
}

// Cấu hình multer để lưu file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + uuidv4() + path.extname(file.originalname))
    }
})
const uploadMiddleware = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } 
}).single('file')


module.exports = uploadMiddleware