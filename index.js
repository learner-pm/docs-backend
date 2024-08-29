const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// 根据 NODE_ENV 选择加载的 .env 文件
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: envFile });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// 连接到 MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`MongoDB connected to ${process.env.MONGO_URI}`);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

// 定义访问次数模型
const visitSchema = new mongoose.Schema({
  count: { type: Number, default: 0 },
});

const Visit = mongoose.model("Visit", visitSchema);

// 中间件记录每次访问
app.use(async (req, res, next) => {
  let visit = await Visit.findOne();

  if (!visit) {
    visit = new Visit({ count: 1 });
  } else {
    visit.count += 1;
  }

  await visit.save();
  req.visitCount = visit.count;
  next();
});

// 统计访问次数的接口
app.get("/api/visit-count", (req, res) => {
  res.json({ visitCount: req.visitCount });
});

// 主页
app.get("/", (req, res) => {
  res.send(
    `<h1>Welcome to our website!</h1><p>Total visits: ${req.visitCount}</p>`
  );
});

// 启动服务器
app.listen(port, () => {
  console.log(
    `Server is running on http://localhost:${port} in ${process.env.NODE_ENV} mode`
  );
});
