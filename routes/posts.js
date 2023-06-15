const express = require("express");
const Posts = require("../schemas/post.js");
const router = express.Router();

// 게시글 조회 API
router.get("/", async (req, res) => {
  const posts = await Posts.find()
    .select("-password -content -__v")
    .sort({ createdAt: -1 }); // "password", "content", "__v" 제외
  res.json({ data: posts });
});

// 게시글 상세 조회 API
router.get("/:_postId", async (req, res) => {
  const { _postId } = req.params;
  const post = await Posts.findById(_postId).select("-password -__v"); // "password", "__v" 제외
  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }
  res.json({ data: post });
});

// 게시글 작성
router.post("/", async (req, res) => {
  const { user, password, title, content } = req.body;

  if (!user || !password || !title || !content) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  const createdPosts = await Posts.create({ user, password, title, content });

  res.json({ message: "게시글을 생성하였습니다." });
});

// 게시글 삭제 API
router.delete("/:_postId", async (req, res) => {
  const { _postId } = req.params;
  const { password } = req.body;

  const post = await Posts.findById(_postId);

  if (!_postId || post.password !== password) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  if (!post) {
    return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
  }

  const deletedPost = await Posts.findByIdAndDelete(_postId);
  res.json({ message: "게시글을 삭제하였습니다." });
});

// 게시글 수정 API
router.put("/:_postId", async (req, res) => {
  const { _postId } = req.params;
  const { password, content, title } = req.body;

  const post = await Posts.findById(_postId);

  if (!_postId || post.password !== password) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  if (!post) {
    return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
  }

  post.content = content; // 게시글 내용 수정
  post.title = title; // 게시글 제목 수정
  await post.save(); // 수정된 게시글 저장

  res.json({ message: "게시글을 수정하였습니다." });
});

module.exports = router;
